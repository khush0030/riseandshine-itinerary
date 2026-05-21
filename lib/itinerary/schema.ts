import { z } from "zod";

/**
 * Itinerary schema — seed-driven demo build.
 *
 * Only TWO things are parsed at runtime: the form request (TripRequestSchema)
 * and Claude's day plan (DayPlanSchema). Everything else — flights, hotels,
 * visa, pricing — is assembled in code from lib/seed and typed as plain
 * interfaces, so it can never drift at demo time.
 */

// ── Form request ──────────────────────────────────────────────────────────
export const TripRequestSchema = z.object({
  clientName: z.string().default("Valued Guest"),
  clientPhone: z.string().default(""),
  email: z.string().email().optional(),
  destinationKey: z.enum(["thailand", "dubai", "kerala"]).default("thailand"),
  diet: z.enum(["veg", "jain", "non-veg", "mixed"]).default("veg"),
  interests: z.array(z.string()).default([]),
  groupType: z.enum(["family", "solo", "honeymoon", "bikers"]).default("family"),
  specialRequests: z.string().max(600).default(""),
});
export type TripRequest = z.infer<typeof TripRequestSchema>;

// ── A photo-bearing place (venue or restaurant) ──────────────────────────
export const PlaceSchema = z.object({
  name: z.string(),
  category: z.string(),
  lat: z.number(),
  lng: z.number(),
  rating: z.number().nullable(),       // Google rating /5, null if unknown
  photoUrl: z.string().nullable(),     // Google Places photo, by-name lookup
  mapsUrl: z.string(),
  tag: z.string().nullable(),          // small caption — cuisine / kid hint
});
export type Place = z.infer<typeof PlaceSchema>;

// ── One slot of a day: Morning / Afternoon / Evening ─────────────────────
export const DayPartKind = z.enum([
  "travel", "transfer", "checkin", "sightseeing", "activity", "leisure", "cruise", "meal",
]);

export const DayPartSchema = z.object({
  slot: z.enum(["Morning", "Afternoon", "Evening"]),
  kind: DayPartKind,
  title: z.string().describe("≤6 words"),
  detail: z.string().describe("2-3 sentences — what the family actually does"),
  placeName: z.string().nullable().describe("exact venue name from the seed list, or null"),
});

export const DaySchema = z.object({
  dayIndex: z.number(),
  cityLabel: z.string(),
  headline: z.string().describe("≤7 words — the theme of the day"),
  efficiency: z.string().describe("one line on why today's routing is tight"),
  skip: z.array(z.string()).min(1).describe("what NOT to do today and why"),
  parts: z.array(DayPartSchema).min(2).max(3),
  diningNames: z.array(z.string()).default([]).describe("2-3 restaurant names from the seed list"),
});

/** What Claude returns — names only; full Place objects are wired in code. */
export const DayPlanSchema = z.object({ days: z.array(DaySchema) });
export type DayPlanDay = z.infer<typeof DaySchema>;

// ── Assembled result types (built in code, not parsed) ───────────────────
export interface DayPart {
  slot: "Morning" | "Afternoon" | "Evening";
  kind: z.infer<typeof DayPartKind>;
  title: string;
  detail: string;
  place: Place | null;
}

export interface Day {
  dayIndex: number;
  date: string;          // ISO YYYY-MM-DD
  weekday: string;       // "Fri"
  dateLabel: string;     // "20 Nov"
  cityLabel: string;
  headline: string;
  efficiency: string;
  skip: string[];
  parts: DayPart[];
  dining: Place[];
}

export interface FlightLeg {
  label: string;         // "Outbound" / "Internal" / "Return"
  airline: string;
  flightNo: string;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  dateLabel: string;     // "20 Nov 2026"
  depTime: string;
  arrTime: string;
  duration: string;
  cabin: string;
  baggage: string;
  stops: string;
}
export interface Flights {
  legs: FlightLeg[];
  note: string;
}

export interface HotelInfo {
  name: string;
  city: string;
  area: string;
  stars: number;
  nights: number;
  why: string;
  amenities: string[];
  lat: number;
  lng: number;
  kind: "hotel" | "houseboat";
  dateLabel: string;     // "20–23 Nov"
  photoUrl: string | null;
}

export interface VisaInfo {
  status: "free" | "required" | "not-required";
  statusLabel: string;
  type: string;
  feeLabel: string;      // "₹0 — visa-free" / "₹6,710 per person"
  stay: string;
  processing: string;
  mandatory: { title: string; detail: string } | null;
  documents: string[];
  riseShineHandles: string[];
  note: string | null;
}

export interface PricingLine {
  label: string;
  amountINR: number;
  zero?: boolean;        // render ₹0 lines softly (e.g. visa-free)
}
export interface Pricing {
  lines: PricingLine[];
  subtotalINR: number;
  servicePct: number;
  serviceINR: number;
  totalINR: number;
  perPersonINR: number;
  displayPerPerson: string;   // "≈ ₹60,000"
  bannerText: string;
  pax: number;
}

export interface Intel {
  do: string[];
  skip: string[];
  miss: string[];
  diet: string;
}

export interface ItineraryMeta {
  destinationKey: string;
  destinationName: string;
  title: string;
  tagline: string;
  flag: string;
  scope: "domestic" | "international";
  startDate: string;
  endDate: string;
  dateRangeLabel: string;     // "20–27 Nov 2026"
  nights: number;
  days: number;
  originCity: string;
  originAirport: string;
  clientName: string;
  clientPhone: string;
  groupLabel: string;         // "2 Adults + 2 Children"
  dietLabel: string;
  interests: string[];
  pulledAt: string;
}

export interface ItineraryResult {
  meta: ItineraryMeta;
  flights: Flights;
  hotels: HotelInfo[];
  visa: VisaInfo;
  days: Day[];
  intel: Intel;
  pricing: Pricing;
  /** "live" when Claude composed the days; "template" on deterministic fallback. */
  engine: "live" | "template";
}
