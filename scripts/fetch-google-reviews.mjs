#!/usr/bin/env node
/**
 * Fetches review snippets via Google Places Details (same place_id as Maps / WP plugin).
 * Set GOOGLE_MAPS_API_KEY with Places API enabled.
 *
 *   GOOGLE_MAPS_API_KEY=... GOOGLE_PLACE_ID=ChIJ... npm run reviews:fetch
 *   GOOGLE_MAPS_API_KEY=... GOOGLE_PLACE_QUERY="Anna Hileman Art Colorado" npm run reviews:fetch
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outFile = path.join(root, 'src/data/google-reviews-fetched.json');

const key = process.env.GOOGLE_MAPS_API_KEY;
const explicitPlaceId = process.env.GOOGLE_PLACE_ID?.trim();
const placeQuery = process.env.GOOGLE_PLACE_QUERY?.trim() || 'Anna Hileman Art Colorado';

if (!key) {
  console.error('Missing GOOGLE_MAPS_API_KEY. Enable Places API on your key and try again.');
  process.exit(1);
}
let placeId = explicitPlaceId;
if (!placeId) {
  const findUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  findUrl.searchParams.set('input', placeQuery);
  findUrl.searchParams.set('inputtype', 'textquery');
  findUrl.searchParams.set('fields', 'place_id,name,formatted_address');
  findUrl.searchParams.set('key', key);

  const findRes = await fetch(findUrl);
  const findData = await findRes.json();

  if (!findRes.ok || findData.status !== 'OK' || !Array.isArray(findData.candidates) || findData.candidates.length === 0) {
    console.error('Could not resolve place from query:', placeQuery);
    console.error('Find Place status:', findData.status ?? '(no status)', findData.error_message ?? '(no message)');
    console.error(JSON.stringify(findData, null, 2));
    process.exit(1);
  }

  placeId = findData.candidates[0].place_id;
  console.log(
    `Resolved place_id ${placeId} from query "${placeQuery}"` +
      (findData.candidates[0].name ? ` (${findData.candidates[0].name})` : ''),
  );
}

const fullUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
fullUrl.searchParams.set('place_id', placeId);
// name + url: business title and canonical Maps link (fixes generic /search URLs).
// Google returns at most 5 reviews per Place Details call — there is no official "10" via this API.
fullUrl.searchParams.set('fields', 'name,url,reviews,rating,user_ratings_total');
fullUrl.searchParams.set('key', key);

const res = await fetch(fullUrl);
const data = await res.json();

if (!res.ok) {
  console.error('Places HTTP error:', res.status, res.statusText);
}
if (data.status !== 'OK') {
  console.error('Places API status:', data.status, data.error_message ?? '(no message)');
  if (data.status === 'NOT_FOUND') {
    console.error(
      'This Place ID is invalid or was retired. Update GOOGLE_PLACE_ID with a fresh ID from Google Maps / Place ID finder.',
    );
  }
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

const result = data.result ?? {};
const out = {
  source: 'google-places-api',
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

fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
const withPhotos = out.reviews.filter((r) => r.profile_photo_url).length;
console.log(
  `Wrote ${out.reviews.length} review(s); ${out.user_ratings_total ?? '?'} total ratings; ${withPhotos} with profile_photo_url → ${path.relative(root, outFile)}`,
);
