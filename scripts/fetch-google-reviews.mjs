#!/usr/bin/env node
/**
 * Fetches review snippets via Google Places Details (same place_id as Maps / WP plugin).
 * Set GOOGLE_MAPS_API_KEY with Places API enabled.
 *
 *   GOOGLE_MAPS_API_KEY=... npm run reviews:fetch
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
const placeId = process.env.GOOGLE_PLACE_ID ?? 'ChIJAQBkeKGIa4cRxNgoGRLnFqw';

if (!key) {
  console.error('Missing GOOGLE_MAPS_API_KEY. Enable Places API on your key and try again.');
  process.exit(1);
}

const fullUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
fullUrl.searchParams.set('place_id', placeId);
// name + url: business title and canonical Maps link (fixes generic /search URLs).
// Google returns at most 5 reviews per Place Details call — there is no official "10" via this API.
fullUrl.searchParams.set('fields', 'name,url,reviews,rating,user_ratings_total');
fullUrl.searchParams.set('key', key);

const res = await fetch(fullUrl);
const data = await res.json();

if (data.status !== 'OK') {
  console.error('Places API error:', data.status, data.error_message ?? '');
  process.exit(1);
}

const result = data.result ?? {};
const out = {
  source: 'google-places-api',
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
