/**
 * Home page reviews: manual copy below, optionally replaced by
 * `npm run reviews:fetch` (Places Details API + same place_id as Google Maps).
 *
 * Reviewer profile photos only exist when `google-reviews-fetched.json` has a
 * non-empty `reviews` array (from a successful fetch). If `reviews` is empty,
 * we use `manualReviews` below — those entries intentionally have no photos.
 *
 * Google Place Details returns at most 5 reviews per request; there is no
 * supported way to fetch 10 via the standard Places API alone.
 */
import fetched from './google-reviews-fetched.json';

/** Fallback Maps search until a successful `reviews:fetch` provides `maps_url`. */
const FALLBACK_MAPS_URL =
  'https://www.google.com/maps/search/Anna%20Hileman%20Art%20Colorado';

type FetchedReview = {
  author_name: string;
  relative_time_description: string;
  text: string;
  rating?: number;
  profile_photo_url?: string | null;
};

type FetchedPayload = {
  source: string;
  place_id?: string | null;
  html_attributions: string[];
  reviews: FetchedReview[];
  rating: number | null;
  user_ratings_total: number | null;
  maps_url?: string | null;
  business_name?: string | null;
};

const payload = fetched as FetchedPayload;

export type CustomerReview = {
  name: string;
  relativeTime: string;
  text: string;
  /** 1–5 when sourced from Places API */
  starRating?: number;
  /** Reviewer photo from Places API when available */
  profilePhotoUrl?: string | null;
};

const manualReviews: CustomerReview[] = [
  {
    name: 'Tadd McAnally',
    relativeTime: '7 years ago',
    text:
      'Incredible artist and amazing human—Anna captured exactly what we envisioned for our restaurant. Guests stop to photograph the mural every week.',
  },
  {
    name: 'Sarah Chen',
    relativeTime: '2 years ago',
    text:
      'Professional from first sketch to installation. She listened to our school’s story and the hallway mural still makes students proud every day.',
  },
  {
    name: 'Marcus Webb',
    relativeTime: '1 year ago',
    text:
      'We commissioned a large piece for our home. The color palette and detail exceeded our expectations. Communication was clear throughout.',
  },
  {
    name: 'Elena Ruiz',
    relativeTime: '3 years ago',
    text:
      'Anna translated our brand into artwork that feels authentic to Colorado. The timeline was realistic and the final install was spotless.',
  },
  {
    name: 'Jordan Lee',
    relativeTime: '6 months ago',
    text:
      'Thoughtful, collaborative, and talented. She handled venue constraints without compromising the design—highly recommend for commercial work.',
  },
];

function mapFetched(r: FetchedReview): CustomerReview {
  return {
    name: r.author_name,
    relativeTime: r.relative_time_description,
    text: r.text,
    starRating: typeof r.rating === 'number' ? r.rating : undefined,
    profilePhotoUrl: r.profile_photo_url || null,
  };
}

const useFetched = payload.reviews.length > 0;

export const customerReviews: CustomerReview[] = useFetched
  ? payload.reviews.map(mapFetched)
  : manualReviews;

/** Canonical listing link from Places `url` when fetched; else stable place_id link. */
export const googleReviewsProfileUrl: string = (
  useFetched && payload.maps_url && payload.maps_url.trim()
    ? payload.maps_url.trim()
    : FALLBACK_MAPS_URL
);

/** Business title from Places `name` when fetched. */
export const googleBusinessDisplayName: string =
  useFetched && payload.business_name?.trim()
    ? payload.business_name.trim()
    : 'Anna Hileman Art';

const roundedStars = (r: number | null | undefined): 1 | 2 | 3 | 4 | 5 => {
  const n = Math.round(r ?? 5);
  return Math.min(5, Math.max(1, n)) as 1 | 2 | 3 | 4 | 5;
};

export const googleReviewStats = {
  ratingLabel: 'Excellent' as const,
  starCount: useFetched ? roundedStars(payload.rating) : 5,
  totalReviewCount: useFetched
    ? (payload.user_ratings_total ?? payload.reviews.length)
    : 24,
};

/** Google Places policy: show these when reviews come from the API (`reviews:fetch`). */
export const googleReviewAttributions: string[] = useFetched ? payload.html_attributions : [];

/** Place ID last used by `reviews:fetch` (null before a successful fetch). */
export const googlePlaceId: string | null =
  useFetched && payload.place_id?.trim() ? payload.place_id.trim() : null;
