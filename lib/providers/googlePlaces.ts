/**
 * Google Places — used ONLY to enrich a seeded venue/restaurant *name* with a
 * photo + rating. It never discovers places, so the demo can never surface a
 * closed, renamed or wrong venue. No key, or a miss → graceful null (the app
 * still renders, just without that photo).
 */

const KEY = () => process.env.GOOGLE_PLACES_API_KEY || "";
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FIELDS = [
  "places.displayName",
  "places.location",
  "places.rating",
  "places.googleMapsUri",
  "places.photos",
].join(",");

function photoMediaUrl(photoName: string): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=720&maxWidthPx=1080&key=${KEY()}`;
}

function mapsSearchUrl(name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

export interface Enrichment {
  photoUrl: string | null;
  rating: number | null;
  mapsUrl: string;
}

/** Look up one named place; return its photo, rating and Maps link. */
export async function enrichByName(
  name: string, lat: number, lng: number,
): Promise<Enrichment> {
  const fallback: Enrichment = { photoUrl: null, rating: null, mapsUrl: mapsSearchUrl(name) };
  if (!KEY()) return fallback;
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY(),
        "X-Goog-FieldMask": FIELDS,
      },
      body: JSON.stringify({
        textQuery: name,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 30000 } },
        pageSize: 1,
      }),
    });
    if (!r.ok) return fallback;
    const j = await r.json();
    const p = j.places?.[0];
    if (!p) return fallback;
    return {
      photoUrl: p.photos?.[0]?.name ? photoMediaUrl(p.photos[0].name) : null,
      rating: typeof p.rating === "number" ? p.rating : null,
      mapsUrl: p.googleMapsUri ?? mapsSearchUrl(name),
    };
  } catch {
    return fallback;
  }
}

/** Enrich many named places in parallel. */
export async function enrichAll<T extends { name: string; lat: number; lng: number }>(
  items: T[],
): Promise<Map<string, Enrichment>> {
  const results = await Promise.all(
    items.map((it) => enrichByName(it.name, it.lat, it.lng).then((e) => [it.name, e] as const)),
  );
  return new Map(results);
}
