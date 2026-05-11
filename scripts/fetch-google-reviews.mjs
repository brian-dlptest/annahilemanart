#!/usr/bin/env node
/**
 * Fetches Google review snippets for the static site.
 *
 * Tries Places API (New) first — GCP keys restricted to "Places API" usually
 * authorize places.googleapis.com, not legacy maps.googleapis.com/place/*.
 * Falls back to legacy Find Place + Place Details if the new API fails.
 *
 *   GOOGLE_MAPS_API_KEY=... GOOGLE_PLACE_ID=ChIJ... npm run reviews:fetch
 *   GOOGLE_MAPS_API_KEY=... GOOGLE_PLACE_QUERY="Anna Hileman Art Grand Junction" npm run reviews:fetch
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 * @see https://developers.google.com/maps/documentation/places/web-service/text-search
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outFile = path.join(root, 'src/data/google-reviews-fetched.json');

const key = process.env.GOOGLE_MAPS_API_KEY;
const explicitPlaceId = process.env.GOOGLE_PLACE_ID?.trim();
const placeQuery = process.env.GOOGLE_PLACE_QUERY?.trim() || 'Anna Hileman Art Grand Junction';

if (!key) {
  console.error('Missing GOOGLE_MAPS_API_KEY. Enable Places API on your key and try again.');
  process.exit(1);
}

/** @param {unknown} v */
function displayNameText(v) {
  if (v && typeof v === 'object' && 'text' in v && typeof v.text === 'string') return v.text;
  return null;
}

/**
 * Places API (New): resolve text query → place id.
 * @returns {Promise<{ placeId: string, label: string } | null>}
 */
async function resolvePlaceIdNew(query) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName',
    },
    body: JSON.stringify({ textQuery: query, regionCode: 'US' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Places API (New) searchText HTTP:', res.status, JSON.stringify(data, null, 2));
    return null;
  }
  const places = data.places;
  if (!Array.isArray(places) || places.length === 0 || !places[0].id) {
    console.error('Places API (New) searchText: no places[]', JSON.stringify(data, null, 2));
    return null;
  }
  const p0 = places[0];
  const label = displayNameText(p0.displayName) ?? '';
  return { placeId: p0.id, label };
}

/**
 * Places API (New): place details including reviews (max 5).
 * @returns {Promise<object | null>} normalized payload or null
 */
async function placeDetailsNew(placeId) {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask':
        'id,displayName,googleMapsUri,rating,userRatingCount,reviews,attributions',
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Places API (New) place details HTTP:', res.status, JSON.stringify(data, null, 2));
    return null;
  }

  const reviews = (data.reviews ?? []).map((r) => {
    const textObj = r.text;
    const text =
      textObj && typeof textObj === 'object' && typeof textObj.text === 'string' ? textObj.text : '';
    const aa = r.authorAttribution;
    const author = aa && typeof aa === 'object' && typeof aa.displayName === 'string' ? aa.displayName : 'Anonymous';
    const photoUri = aa && typeof aa === 'object' && typeof aa.photoUri === 'string' ? aa.photoUri : null;
    return {
      author_name: author,
      relative_time_description:
        typeof r.relativePublishTimeDescription === 'string' ? r.relativePublishTimeDescription : 'Recently',
      text,
      rating: typeof r.rating === 'number' ? r.rating : undefined,
      profile_photo_url: photoUri,
    };
  });

  const htmlFromAttr = [];
  const attrs = data.attributions;
  if (Array.isArray(attrs)) {
    for (const a of attrs) {
      if (a && typeof a === 'object') {
        const uri = a.providerUri ?? a.provider_uri;
        const prov = a.provider ?? 'Google';
        if (typeof uri === 'string') htmlFromAttr.push(`<a href="${uri}">${prov}</a>`);
      }
    }
  }

  return {
    source: 'google-places-api-new',
    place_id: placeId,
    html_attributions: htmlFromAttr,
    business_name: displayNameText(data.displayName),
    maps_url: typeof data.googleMapsUri === 'string' ? data.googleMapsUri : null,
    reviews,
    rating: typeof data.rating === 'number' ? data.rating : null,
    user_ratings_total: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
  };
}

/** Legacy: Find Place from Text */
async function resolvePlaceIdLegacy(query) {
  const findUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  findUrl.searchParams.set('input', query);
  findUrl.searchParams.set('inputtype', 'textquery');
  findUrl.searchParams.set('fields', 'place_id,name,formatted_address');
  findUrl.searchParams.set('components', 'country:us');
  findUrl.searchParams.set('key', key);

  const findRes = await fetch(findUrl);
  const findData = await findRes.json();

  if (!findRes.ok || findData.status !== 'OK' || !Array.isArray(findData.candidates) || findData.candidates.length === 0) {
    console.error('Legacy Find Place status:', findData.status ?? '(no status)', findData.error_message ?? '');
    console.error(JSON.stringify(findData, null, 2));
    return null;
  }
  return { placeId: findData.candidates[0].place_id, label: findData.candidates[0].name ?? '' };
}

/** Legacy: Place Details */
async function placeDetailsLegacy(placeId) {
  const fullUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  fullUrl.searchParams.set('place_id', placeId);
  fullUrl.searchParams.set('fields', 'name,url,reviews,rating,user_ratings_total');
  fullUrl.searchParams.set('key', key);

  const res = await fetch(fullUrl);
  const data = await res.json();

  if (!res.ok || data.status !== 'OK') {
    console.error('Legacy Place Details status:', data.status, data.error_message ?? '');
    console.error(JSON.stringify(data, null, 2));
    return null;
  }

  const result = data.result ?? {};
  return {
    source: 'google-places-api-legacy',
    place_id: placeId,
    html_attributions: Array.isArray(data.html_attributions) ? data.html_attributions : [],
    business_name: result.name ?? null,
    maps_url: result.url ?? null,
    reviews: (result.reviews ?? []).map((r) => ({
      author_name: r.author_name,
      relative_time_description: r.relative_time_description,
      text: r.text ?? '',
      rating: r.rating,
      profile_photo_url: r.profile_photo_url,
    })),
    rating: result.rating ?? null,
    user_ratings_total: result.user_ratings_total ?? null,
  };
}

let placeId = explicitPlaceId;
let out = null;

if (placeId) {
  out = await placeDetailsNew(placeId);
  if (!out) {
    console.warn('Places API (New) details failed; trying legacy Place Details…');
    out = await placeDetailsLegacy(placeId);
  }
} else {
  const resolvedNew = await resolvePlaceIdNew(placeQuery);
  if (resolvedNew) {
    placeId = resolvedNew.placeId;
    console.log(
      `Resolved (new API) ${placeId}${resolvedNew.label ? ` (${resolvedNew.label})` : ''}`,
    );
    out = await placeDetailsNew(placeId);
  }
  if (!out) {
    console.warn('Places API (New) path failed; trying legacy Find Place + Details…');
    const resolvedLegacy = await resolvePlaceIdLegacy(placeQuery);
    if (!resolvedLegacy) {
      console.error('Could not resolve place from query:', placeQuery);
      console.error(
        "Places text search only returns businesses/places in Google's Places index (usually a Google Business Profile). " +
          'It is not the same as typing a phrase into maps.google.com — vague brand + state often returns no match. ' +
          'Set GOOGLE_PLACE_ID to the Place ID from the exact Maps listing that shows your reviews (Share → link, or a Place ID tool).',
      );
      process.exit(1);
    }
    placeId = resolvedLegacy.placeId;
    console.log(
      `Resolved (legacy) ${placeId}${resolvedLegacy.label ? ` (${resolvedLegacy.label})` : ''}`,
    );
    out = await placeDetailsLegacy(placeId);
  }
}

if (!out) {
  console.error('Failed to fetch place details (new and legacy).');
  process.exit(1);
}

fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
const withPhotos = out.reviews.filter((r) => r.profile_photo_url).length;
console.log(
  `[${out.source}] Wrote ${out.reviews.length} review(s); ${out.user_ratings_total ?? '?'} total ratings; ${withPhotos} with profile_photo_url → ${path.relative(root, outFile)}`,
);
