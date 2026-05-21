/**
 * Seed-data types for the Rise & Shine demo.
 *
 * Everything that must NOT vary at demo time lives here: flights, hotels,
 * visa, pricing and the curated venue list. Google Places is used only to
 * enrich a seeded venue/restaurant *name* with a photo + rating — never to
 * discover places — so the demo can never surface a closed or wrong venue.
 */

/** One flight leg — fully seeded, no live fares. */
export interface SeedFlightLeg {
  airline: string;
  flightNo: string;
  from: string;          // IATA, e.g. "AMD"
  fromCity: string;
  to: string;            // IATA, e.g. "BKK"
  toCity: string;
  /** Day index within the trip this leg flies (0 = arrival day). */
  dayIndex: number;
  depTime: string;       // "06:45"
  arrTime: string;       // "13:15"
  duration: string;      // "5h 00m"
  cabin: string;         // "Economy"
  baggage: string;       // "25kg checked + 7kg cabin"
  stops: string;         // "Direct (non-stop)"
}

export interface SeedFlights {
  outbound: SeedFlightLeg;
  inbound: SeedFlightLeg;
  /** Optional internal hop, e.g. Thailand BKK -> HKT on day 4. */
  internal?: SeedFlightLeg;
  note: string;
}

export interface SeedHotel {
  name: string;
  city: string;          // "Bangkok"
  area: string;          // "Riverside, Yannawa"
  stars: number;
  /** Trip day this stay begins (0 = arrival day). */
  fromDayIndex: number;
  nights: number;
  why: string;
  amenities: string[];
  lat: number;
  lng: number;
  kind: "hotel" | "houseboat";
}

export interface SeedVisa {
  status: "free" | "required" | "not-required";
  statusLabel: string;          // "VISA FREE", "VISA REQUIRED", "NO VISA REQUIRED"
  type: string;
  /** Per-person fee in INR; 0 when free / not required. */
  feePerPersonINR: number;
  stay: string;                 // "Up to 60 days"
  processing: string;
  /** Mandatory extra step, e.g. Thailand TDAC. */
  mandatory?: { title: string; detail: string };
  documents: string[];
  riseShineHandles: string[];
  note?: string;
}

/** A curated, demo-safe venue. Claude may only sequence days from these. */
export interface SeedVenue {
  name: string;
  city: string;
  category: string;             // "Temple", "Beach", "Theme Park"
  bestSlot: "morning" | "afternoon" | "evening" | "fullday";
  /** What to actually do here — fed to Claude, shown in the brochure. */
  note: string;
  /** Family/kids guidance, surfaced when the group has children. */
  kidNote?: string;
  lat: number;
  lng: number;
}

/** A curated veg/Jain restaurant. Places fetches only its photo + rating. */
export interface SeedRestaurant {
  name: string;
  city: string;
  area: string;
  cuisine: string;
  jain: boolean;
  lat: number;
  lng: number;
}

export interface SeedPricingLine {
  label: string;
  amountINR: number;
}

export interface SeedCity {
  name: string;
  /** Trip day this city's stay begins. */
  fromDayIndex: number;
  nights: number;
  lat: number;
  lng: number;
}

export interface SeedDestination {
  key: "thailand" | "dubai" | "kerala";
  name: string;
  title: string;
  tagline: string;
  flag: string;
  scope: "domestic" | "international";
  originAirport: string;
  originCity: string;
  /** Locked demo scenario. */
  startDate: string;            // ISO YYYY-MM-DD
  nights: number;
  pax: { adults: number; children: number; infants: number; childrenAges: number[] };
  cities: SeedCity[];
  flights: SeedFlights;
  hotels: SeedHotel[];
  visa: SeedVisa;
  venues: SeedVenue[];
  restaurants: SeedRestaurant[];
  intel: { do: string[]; skip: string[]; miss: string[]; diet: string };
  /** Pre-service cost lines; service % is applied on top. */
  pricing: { lines: SeedPricingLine[]; servicePct: number };
}
