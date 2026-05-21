import { generateObject } from "ai";
import { getItineraryModel } from "@/lib/providers/claude";
import { DayPlanSchema, type Day, type DayPart, type Place, type TripRequest } from "@/lib/itinerary/schema";
import type { SeedDestination, SeedRestaurant, SeedVenue } from "@/lib/seed";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekday(iso: string): string {
  return WEEKDAYS[new Date(iso + "T00:00:00Z").getUTCDay()];
}
export function dayLabel(iso: string): string {
  return new Date(iso + "T00:00:00Z")
    .toLocaleString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

/** Resolved seed venue/restaurant — seed metadata + a photo-enriched Place. */
export interface ResolvedVenue { seed: SeedVenue; place: Place }
export interface ResolvedRestaurant { seed: SeedRestaurant; place: Place }

export interface ComposeInput {
  req: TripRequest;
  seed: SeedDestination;
  venues: ResolvedVenue[];
  restaurants: ResolvedRestaurant[];
}

const COMPOSE_TIMEOUT_MS = 90_000;

const SYSTEM = `You are a senior India-based travel planner at Rise & Shine Travel, Ahmedabad,
writing a clear, client-ready day-by-day plan for a family holiday.

HARD RULES — follow exactly:
- Use ONLY venues from the provided venues[] list. NEVER invent or rename a place.
  Any sightseeing / activity / cruise part's "placeName" MUST be copied verbatim
  from venues[].name. For travel / transfer / checkin / leisure parts, placeName is null.
- Every day has 2 or 3 parts, in order, labelled "Morning", "Afternoon", "Evening".
  Most days have 3; arrival, inter-city transfer and departure days may have 2.
- Respect each venue's "bestSlot". A "fullday" venue fills the day — make it the
  Morning part and keep any Afternoon/Evening part light (leisure) or omit it.
- Day shape:
  - Day 0 (arrival): Morning part kind "travel" (outbound flight + airport transfer),
    then "checkin", then ONE gentle activity. Keep the day light after the flight.
  - When the city changes, the first part of that day is kind "transfer".
  - An internal-flight day opens with a "travel" part for that flight, then checkin.
  - The final day (departure): a light morning, then a "travel" part for the return
    flight. No far-flung sights.
- diningNames: pick 2-3 restaurants from restaurants[] located in THAT day's city.
  Vary them across days — never repeat a restaurant. Honour the diet.
- "detail": 2-3 plain, warm sentences — what the family actually does, rough timing,
  and any relevant kid note. No marketing fluff, no emojis, no exclamation marks.
- "efficiency": one line on why today's route is geographically tight.
- "skip": 1-3 short lines — what to deliberately NOT do today and why.
- "headline": <=7 words capturing the day's theme.
Output strictly matches the schema.`;

function groundingJSON(input: ComposeInput): string {
  const { req, seed } = input;
  const f = seed.flights;
  const leg = (l?: { airline: string; flightNo: string; from: string; to: string; depTime: string; arrTime: string }) =>
    l ? `${l.airline} ${l.flightNo} ${l.from}->${l.to} dep ${l.depTime} arr ${l.arrTime}` : null;
  return JSON.stringify({
    destination: seed.name,
    totalDays: seed.nights + 1,
    startDate: seed.startDate,
    group: {
      adults: seed.pax.adults, children: seed.pax.children,
      infants: seed.pax.infants, childrenAges: seed.pax.childrenAges,
    },
    diet: req.diet,
    interests: req.interests,
    groupType: req.groupType,
    specialRequests: req.specialRequests?.trim() || null,
    flights: { outbound: leg(f.outbound), internal: leg(f.internal), inbound: leg(f.inbound) },
    cities: seed.cities.map((c) => ({
      name: c.name, startsOnDayIndex: c.fromDayIndex, nights: c.nights,
    })),
    hotels: seed.hotels.map((h) => ({ city: h.city, name: h.name, kind: h.kind })),
    venues: input.venues.map(({ seed: v }) => ({
      name: v.name, city: v.city, category: v.category,
      bestSlot: v.bestSlot, note: v.note, kidNote: v.kidNote ?? null,
    })),
    restaurants: input.restaurants.map(({ seed: r }) => ({
      name: r.name, city: r.city, area: r.area, cuisine: r.cuisine, jain: r.jain,
    })),
  });
}

/** Claude path — one grounded call sequences the whole trip. */
async function composeWithClaude(input: ComposeInput): Promise<Day[] | null> {
  const model = getItineraryModel();
  if (!model) return null;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), COMPOSE_TIMEOUT_MS);
  try {
    const { object } = await generateObject({
      model,
      schema: DayPlanSchema,
      system: SYSTEM,
      prompt:
        `Plan the full ${input.seed.nights + 1}-day itinerary from this real data:\n` +
        groundingJSON(input) +
        `\nReturn exactly ${input.seed.nights + 1} day objects in order, dayIndex 0..${input.seed.nights}.`,
      providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
      maxRetries: 1,
      abortSignal: ac.signal,
    });
    return assemble(input, object.days);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Turn Claude's lean days (names only) into full Day objects. */
function assemble(
  input: ComposeInput,
  lean: ReturnType<typeof DayPlanSchema.parse>["days"],
): Day[] {
  const venueByName = new Map(input.venues.map((v) => [v.seed.name.toLowerCase(), v.place]));
  const restByName = new Map(input.restaurants.map((r) => [r.seed.name.toLowerCase(), r.place]));
  const total = input.seed.nights + 1;

  return lean.slice(0, total).map((d, idx) => {
    const date = addDays(input.seed.startDate, idx);
    const parts: DayPart[] = d.parts.map((p) => ({
      slot: p.slot,
      kind: p.kind,
      title: p.title,
      detail: p.detail,
      place: p.placeName ? venueByName.get(p.placeName.toLowerCase()) ?? null : null,
    }));
    const dining = (d.diningNames ?? [])
      .map((n) => restByName.get(n.toLowerCase()))
      .filter((p): p is Place => Boolean(p));
    return {
      dayIndex: idx,
      date,
      weekday: weekday(date),
      dateLabel: dayLabel(date),
      cityLabel: d.cityLabel,
      headline: d.headline,
      efficiency: d.efficiency,
      skip: d.skip,
      parts,
      dining,
    };
  });
}

/** Deterministic fallback — used only if Claude is unavailable or fails. */
function composeTemplate(input: ComposeInput): Day[] {
  const { seed } = input;
  const total = seed.nights + 1;
  const days: Day[] = [];
  const usedRest = new Set<string>();

  const cityForDay = (idx: number) => {
    let c = seed.cities[0];
    for (const city of seed.cities) if (idx >= city.fromDayIndex) c = city;
    return c;
  };
  const pickDining = (city: string): Place[] => {
    const pool = input.restaurants.filter((r) => r.seed.city === city);
    const fresh = pool.filter((r) => !usedRest.has(r.seed.name));
    const chosen = (fresh.length >= 2 ? fresh : pool).slice(0, 3);
    chosen.forEach((r) => usedRest.add(r.seed.name));
    return chosen.map((r) => r.place);
  };

  for (let idx = 0; idx < total; idx++) {
    const city = cityForDay(idx);
    const isFirst = idx === 0;
    const isLast = idx === total - 1;
    const cityChange = !isFirst && city.fromDayIndex === idx;
    const date = addDays(seed.startDate, idx);
    const cityVenues = input.venues.filter((v) => v.seed.city === city.name);
    const used = days.flatMap((d) => d.parts.map((p) => p.place?.name)).filter(Boolean);
    const fresh = cityVenues.filter((v) => !used.includes(v.place.name));
    const parts: DayPart[] = [];

    if (isFirst) {
      parts.push({ slot: "Morning", kind: "travel", title: `Arrive in ${city.name}`,
        detail: `Outbound flight from ${seed.originCity} and a private transfer to the hotel.`, place: null });
      parts.push({ slot: "Afternoon", kind: "checkin", title: "Hotel check-in & settle",
        detail: `Check in, freshen up and keep the first afternoon light after the flight.`, place: null });
      const v = fresh[0];
      parts.push({ slot: "Evening", kind: v ? "sightseeing" : "leisure",
        title: v ? v.seed.name : "Easy evening nearby",
        detail: v ? v.seed.note : "A relaxed first evening close to the hotel.", place: v?.place ?? null });
    } else if (isLast) {
      parts.push({ slot: "Morning", kind: "leisure", title: "Pack & last stroll",
        detail: "A relaxed morning near the hotel before the airport transfer.", place: null });
      parts.push({ slot: "Afternoon", kind: "travel", title: `Return to ${seed.originCity}`,
        detail: "Private transfer to the airport for the return flight home.", place: null });
    } else {
      if (cityChange) {
        parts.push({ slot: "Morning", kind: "transfer", title: `Transfer to ${city.name}`,
          detail: `Scenic transfer to ${city.name} and hotel check-in.`, place: null });
      } else {
        const v = fresh[0];
        parts.push({ slot: "Morning", kind: v ? "sightseeing" : "leisure",
          title: v ? v.seed.name : `${city.name} morning`,
          detail: v ? v.seed.note : "A relaxed morning around the hotel.", place: v?.place ?? null });
      }
      const v2 = fresh[cityChange ? 0 : 1];
      parts.push({ slot: "Afternoon", kind: v2 ? "activity" : "leisure",
        title: v2 ? v2.seed.name : "Leisure afternoon",
        detail: v2 ? v2.seed.note : "Pool time or an unhurried afternoon.", place: v2?.place ?? null });
      const v3 = fresh[cityChange ? 1 : 2];
      parts.push({ slot: "Evening", kind: v3 ? "leisure" : "leisure",
        title: v3 ? v3.seed.name : "Evening at leisure",
        detail: v3 ? v3.seed.note : "A calm evening — kept early for the children.", place: v3?.place ?? null });
    }

    days.push({
      dayIndex: idx, date, weekday: weekday(date), dateLabel: dayLabel(date),
      cityLabel: city.name,
      headline: isFirst ? `Arrive — settle into ${city.name}`
        : isLast ? "Departure day"
        : cityChange ? `Onward to ${city.name}` : `${city.name} highlights`,
      efficiency: isFirst ? "Nothing far on arrival day — one stop near the hotel."
        : isLast ? "Hotel-area time only before the airport run."
        : `Today's stops sit close together — a tight ${city.name} loop.`,
      skip: isFirst ? ["Don't over-schedule the arrival day — the flight eats the afternoon."]
        : isLast ? ["No far sights today — a missed flight is not worth one more stop."]
        : ["Skip anything that pressures an on-the-spot cash payment."],
      parts,
      dining: isFirst || isLast ? [] : pickDining(city.name),
    });
  }
  return days;
}

/** Compose the day-by-day plan: Claude if available, deterministic otherwise. */
export async function composeDays(
  input: ComposeInput,
): Promise<{ days: Day[]; engine: "live" | "template" }> {
  const claude = await composeWithClaude(input);
  if (claude && claude.length === input.seed.nights + 1) {
    return { days: claude, engine: "live" };
  }
  return { days: composeTemplate(input), engine: "template" };
}
