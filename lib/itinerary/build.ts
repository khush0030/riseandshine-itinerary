import { getSeed, type SeedDestination } from "@/lib/seed";
import { enrichAll } from "@/lib/providers/googlePlaces";
import { composeDays, addDays, type ResolvedVenue, type ResolvedRestaurant } from "@/lib/itinerary/compose";
import type {
  FlightLeg, Flights, HotelInfo, ItineraryResult, Place, Pricing, TripRequest, VisaInfo,
} from "@/lib/itinerary/schema";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function fmt(iso: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(iso + "T00:00:00Z").toLocaleString("en-GB", { ...opts, timeZone: "UTC" });
}
/** "20–27 Nov 2026" / "20 Nov – 3 Dec 2026" */
function rangeLabel(a: string, b: string): string {
  const da = new Date(a + "T00:00:00Z"), db = new Date(b + "T00:00:00Z");
  const sameMonth = da.getUTCMonth() === db.getUTCMonth() && da.getUTCFullYear() === db.getUTCFullYear();
  const left = sameMonth
    ? fmt(a, { day: "numeric" })
    : fmt(a, { day: "numeric", month: "short" });
  return `${left}–${fmt(b, { day: "numeric", month: "short", year: "numeric" })}`;
}

function buildFlights(seed: SeedDestination): Flights {
  const mk = (
    label: string,
    l: SeedDestination["flights"]["outbound"],
  ): FlightLeg => ({
    label,
    airline: l.airline, flightNo: l.flightNo,
    fromCity: l.fromCity, fromCode: l.from,
    toCity: l.toCity, toCode: l.to,
    dateLabel: fmt(addDays(seed.startDate, l.dayIndex), { day: "numeric", month: "short", year: "numeric" }),
    depTime: l.depTime, arrTime: l.arrTime, duration: l.duration,
    cabin: l.cabin, baggage: l.baggage, stops: l.stops,
  });
  const legs: FlightLeg[] = [mk("Outbound", seed.flights.outbound)];
  if (seed.flights.internal) legs.push(mk("Internal", seed.flights.internal));
  legs.push(mk("Return", seed.flights.inbound));
  return { legs, note: seed.flights.note };
}

function buildHotels(seed: SeedDestination): HotelInfo[] {
  return seed.hotels.map((h) => {
    const from = addDays(seed.startDate, h.fromDayIndex);
    const to = addDays(seed.startDate, h.fromDayIndex + h.nights);
    return {
      name: h.name, city: h.city, area: h.area, stars: h.stars,
      nights: h.nights, why: h.why, amenities: h.amenities,
      lat: h.lat, lng: h.lng, kind: h.kind,
      dateLabel: rangeLabel(from, to),
      photoUrl: null,
    };
  });
}

function buildVisa(seed: SeedDestination): VisaInfo {
  const v = seed.visa;
  const feeLabel =
    v.status === "free" ? "₹0 — visa-free entry"
    : v.status === "required" ? `${inr(v.feePerPersonINR)} per person — included in your package`
    : "Not required — domestic travel";
  return {
    status: v.status, statusLabel: v.statusLabel, type: v.type,
    feeLabel, stay: v.stay, processing: v.processing,
    mandatory: v.mandatory ?? null,
    documents: v.documents, riseShineHandles: v.riseShineHandles,
    note: v.note ?? null,
  };
}

/** Round to the nearest ₹5,000 for the headline per-person figure. */
function roundDisplay(n: number): number {
  return Math.round(n / 5000) * 5000;
}

function buildPricing(seed: SeedDestination): Pricing {
  const pax = seed.pax.adults + seed.pax.children;
  const lines = seed.pricing.lines.map((l) => ({
    label: l.label, amountINR: l.amountINR, zero: l.amountINR === 0,
  }));
  const subtotal = lines.reduce((s, l) => s + l.amountINR, 0);
  const service = Math.round(subtotal * seed.pricing.servicePct / 100);
  const total = subtotal + service;
  const perPerson = Math.round(total / pax);
  const display = roundDisplay(perPerson);
  const visaPhrase =
    seed.visa.status === "free" ? "Visa-free — TDAC handled by us"
    : seed.visa.status === "required" ? "Visa included in package"
    : "No visa required";
  return {
    lines, subtotalINR: subtotal, servicePct: seed.pricing.servicePct,
    serviceINR: service, totalINR: total, perPersonINR: perPerson,
    displayPerPerson: "≈ " + inr(display),
    bannerText: `Approx. ${inr(display)} per person · ${pax} sharing · ${visaPhrase} · Subject to availability at time of booking`,
    pax,
  };
}

function groupLabel(seed: SeedDestination): string {
  const { adults, children, infants } = seed.pax;
  const parts = [`${adults} Adult${adults > 1 ? "s" : ""}`];
  if (children) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
  if (infants) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);
  return parts.join(" + ");
}

const DIET_LABEL: Record<string, string> = {
  veg: "Vegetarian", jain: "Jain", "non-veg": "Non-Vegetarian", mixed: "Mixed",
};

export async function buildItinerary(req: TripRequest): Promise<ItineraryResult> {
  const seed = getSeed(req.destinationKey);

  // ── Enrich curated venues + restaurants with photos (by name only) ──
  const [venueEnrich, restEnrich] = await Promise.all([
    enrichAll(seed.venues),
    enrichAll(seed.restaurants),
  ]);

  const venues: ResolvedVenue[] = seed.venues.map((v) => {
    const e = venueEnrich.get(v.name)!;
    const place: Place = {
      name: v.name, category: v.category, lat: v.lat, lng: v.lng,
      rating: e.rating, photoUrl: e.photoUrl, mapsUrl: e.mapsUrl,
      tag: v.kidNote ? "Family note" : null,
    };
    return { seed: v, place };
  });

  const restaurants: ResolvedRestaurant[] = seed.restaurants.map((r) => {
    const e = restEnrich.get(r.name)!;
    const place: Place = {
      name: r.name, category: "Restaurant", lat: r.lat, lng: r.lng,
      rating: e.rating, photoUrl: e.photoUrl, mapsUrl: e.mapsUrl,
      tag: r.cuisine + (r.jain ? " · Jain" : ""),
    };
    return { seed: r, place };
  });

  const { days, engine } = await composeDays({ req, seed, venues, restaurants });

  const endDate = addDays(seed.startDate, seed.nights);

  return {
    meta: {
      destinationKey: seed.key,
      destinationName: seed.name,
      title: seed.title,
      tagline: seed.tagline,
      flag: seed.flag,
      scope: seed.scope,
      startDate: seed.startDate,
      endDate,
      dateRangeLabel: rangeLabel(seed.startDate, endDate),
      nights: seed.nights,
      days: seed.nights + 1,
      originCity: seed.originCity,
      originAirport: seed.originAirport,
      clientName: req.clientName,
      clientPhone: req.clientPhone,
      groupLabel: groupLabel(seed),
      dietLabel: DIET_LABEL[req.diet] ?? "Vegetarian",
      interests: req.interests,
      pulledAt: new Date().toISOString().slice(0, 10),
    },
    flights: buildFlights(seed),
    hotels: buildHotels(seed),
    visa: buildVisa(seed),
    days,
    intel: seed.intel,
    pricing: buildPricing(seed),
    engine,
  };
}
