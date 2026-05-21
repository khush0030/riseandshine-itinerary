import type { SeedDestination } from "./types";

/**
 * THAILAND — Bangkok & Phuket · 7 nights / 8 days · 4 travellers.
 * Routing locked: Bangkok D1–3, internal BKK→HKT on D4 AM, Phuket D4–7,
 * HKT→AMD return on D8.
 */
export const THAILAND: SeedDestination = {
  key: "thailand",
  name: "Thailand",
  title: "Thailand — Bangkok & Phuket",
  tagline: "Temples, islands and a beachfront finish — built around your family's pace.",
  flag: "🇹🇭",
  scope: "international",
  originAirport: "AMD",
  originCity: "Ahmedabad",
  startDate: "2026-11-20",
  nights: 7,
  pax: { adults: 2, children: 2, infants: 0, childrenAges: [8, 11] },

  cities: [
    { name: "Bangkok", fromDayIndex: 0, nights: 3, lat: 13.7466, lng: 100.5347 },
    { name: "Phuket", fromDayIndex: 3, nights: 4, lat: 7.8965, lng: 98.2966 },
  ],

  flights: {
    outbound: {
      airline: "Air India", flightNo: "AI-336",
      from: "AMD", fromCity: "Ahmedabad", to: "BKK", toCity: "Bangkok",
      dayIndex: 0, depTime: "06:45", arrTime: "13:15", duration: "5h 00m",
      cabin: "Economy", baggage: "25kg checked + 7kg cabin", stops: "Direct (non-stop)",
    },
    internal: {
      airline: "Thai AirAsia", flightNo: "FD-3162",
      from: "DMK", fromCity: "Bangkok (Don Mueang)", to: "HKT", toCity: "Phuket",
      dayIndex: 3, depTime: "07:00", arrTime: "08:20", duration: "1h 20m",
      cabin: "Economy", baggage: "20kg checked + 7kg cabin", stops: "Direct (non-stop)",
    },
    inbound: {
      airline: "Air India", flightNo: "AI-3162 → AI-337",
      from: "HKT", fromCity: "Phuket", to: "AMD", toCity: "Ahmedabad",
      dayIndex: 7, depTime: "11:55", arrTime: "17:55", duration: "7h 30m (incl. layover)",
      cabin: "Economy", baggage: "25kg checked + 7kg cabin", stops: "1 stop · Bangkok (BKK)",
    },
    note: "Return originates in Phuket and connects through Bangkok — no separate ground transfer needed.",
  },

  hotels: [
    {
      name: "Chatrium Hotel Riverside Bangkok", city: "Bangkok",
      area: "Riverside · Yannawa", stars: 4, kind: "hotel",
      fromDayIndex: 0, nights: 3,
      why: "Quiet riverside setting away from the Sukhumvit crush; family rooms and river views the kids will love.",
      amenities: ["Riverfront pool", "River-view family rooms", "Multi-cuisine restaurant", "Free shuttle boat", "Near BTS Saphan Taksin"],
      lat: 13.7108, lng: 100.5100,
    },
    {
      name: "Holiday Inn Resort Phuket", city: "Phuket",
      area: "Patong Beach", stars: 4, kind: "hotel",
      fromDayIndex: 3, nights: 4,
      why: "Walkable to Patong Beach with a dedicated kids' club and a calm, separate family pool area.",
      amenities: ["Beach access", "Kids' club", "Two pools", "Spa", "Vegetarian dining", "Water sports desk"],
      lat: 7.8927, lng: 98.2967,
    },
  ],

  visa: {
    status: "free",
    statusLabel: "VISA FREE",
    type: "Visa-free entry for Indian passport holders (tourism)",
    feePerPersonINR: 0,
    stay: "Up to 60 days",
    processing: "None — visa-free on arrival",
    mandatory: {
      title: "Thailand Digital Arrival Card (TDAC)",
      detail: "Replaces the old paper TM6 form. Must be completed online within 72 hours before arrival in Bangkok. It generates a QR code shown at immigration on landing.",
    },
    documents: [
      "Passport — minimum 6 months validity from the travel date",
      "TDAC QR code — printed and a digital copy",
      "Return flight ticket — printed",
      "Hotel booking confirmations — printed",
      "Proof of funds — min ₹24,000 per person (10,000 THB)",
    ],
    riseShineHandles: [
      "TDAC form completed and submitted for all 4 passengers",
      "Full document checklist provided before departure",
      "No embassy visit required at any stage",
    ],
    note: "Thailand extended visa-free entry for Indian passport holders to 60 days (effective 2026). Zero visa fee applies during the visa-free period.",
  },

  venues: [
    // ── Bangkok ──
    { name: "Grand Palace & Wat Phra Kaew", city: "Bangkok", category: "Royal Palace", bestSlot: "morning",
      note: "Thailand's most revered site — the Emerald Buddha and gilded royal halls. Go at opening to beat the heat and crowds.",
      kidNote: "Strict dress code: shoulders and knees covered for everyone, including children.",
      lat: 13.7500, lng: 100.4914 },
    { name: "Wat Pho", city: "Bangkok", category: "Temple", bestSlot: "morning",
      note: "Home of the 46-metre Reclining Buddha, a short walk from the Grand Palace — easy to pair on the same morning.",
      lat: 13.7465, lng: 100.4927 },
    { name: "Wat Arun", city: "Bangkok", category: "Temple", bestSlot: "afternoon",
      note: "The porcelain-studded Temple of Dawn, reached by a quick cross-river ferry. Best light in the late afternoon.",
      lat: 13.7437, lng: 100.4889 },
    { name: "Chao Phraya Dinner Cruise", city: "Bangkok", category: "River Cruise", bestSlot: "evening",
      note: "Glide past the floodlit Grand Palace and Wat Arun over a relaxed buffet dinner — a calm, scenic end to a temple day.",
      kidNote: "Smooth, enclosed boat — comfortable and safe for children.",
      lat: 13.7036, lng: 100.5028 },
    { name: "Safari World & Marine Park", city: "Bangkok", category: "Wildlife Park", bestSlot: "fullday",
      note: "Drive-through safari plus dolphin and sea-lion shows — a full, easy-paced day built for families.",
      kidNote: "The clear highlight of Bangkok for ages 8–11.",
      lat: 13.8631, lng: 100.7043 },
    { name: "Asiatique The Riverfront", city: "Bangkok", category: "Night Market", bestSlot: "evening",
      note: "Open-air riverside market with a giant Ferris wheel, food halls and shops — relaxed evening browsing.",
      lat: 13.7044, lng: 100.5095 },
    { name: "Lumphini Park", city: "Bangkok", category: "City Park", bestSlot: "morning",
      note: "Bangkok's green lung — paddle boats, shaded paths and resident monitor lizards. A gentle, free morning stroll.",
      lat: 13.7311, lng: 100.5418 },
    { name: "ICONSIAM & SookSiam", city: "Bangkok", category: "Riverside Mall", bestSlot: "afternoon",
      note: "A landmark riverside mall with SookSiam, an indoor floating-market hall — fully air-conditioned, ideal on a hot afternoon.",
      lat: 13.7264, lng: 100.5100 },

    // ── Phuket ──
    { name: "Big Buddha Phuket", city: "Phuket", category: "Landmark", bestSlot: "morning",
      note: "A 45-metre marble Buddha on the Nakkerd Hills with panoramic island views. Cool, quiet and best in the morning.",
      kidNote: "Sarongs provided free at the entrance.",
      lat: 7.8277, lng: 98.3120 },
    { name: "Wat Chalong", city: "Phuket", category: "Temple", bestSlot: "morning",
      note: "Phuket's grandest and most important temple, an easy stop on the way down from Big Buddha.",
      lat: 7.8462, lng: 98.3376 },
    { name: "Old Phuket Town", city: "Phuket", category: "Heritage Quarter", bestSlot: "afternoon",
      note: "Pastel Sino-Portuguese shophouses, cafés and street art along Thalang Road — calm, walkable and photogenic.",
      lat: 7.8841, lng: 98.3876 },
    { name: "Promthep Cape", city: "Phuket", category: "Sunset Viewpoint", bestSlot: "evening",
      note: "The island's classic sunset headland at its southern tip. Arrive 45 minutes before sundown for a spot.",
      lat: 7.7624, lng: 98.3046 },
    { name: "Phi Phi Islands Speedboat Tour", city: "Phuket", category: "Island Day Tour", bestSlot: "fullday",
      note: "Full-day speedboat tour to Maya Bay, Pileh Lagoon and Bamboo Island. Maya Bay caps daily visitors — the tour departs early (before 10am) so the family arrives ahead of the crowds.",
      kidNote: "Fine for ages 8–11 with life jackets; the early start means an easier sea and calmer water.",
      lat: 7.6783, lng: 98.7660 },
    { name: "Phang Nga Bay & James Bond Island", city: "Phuket", category: "Sea-Canoe Tour", bestSlot: "fullday",
      note: "Cruise the emerald limestone karsts of Phang Nga Bay and sea-canoe through hidden caves to James Bond Island.",
      lat: 8.2747, lng: 98.4983 },
    { name: "Kata Beach", city: "Phuket", category: "Beach", bestSlot: "afternoon",
      note: "A calmer, family-friendly bay south of Patong — soft sand, gentle swimming and easy beachfront lunches.",
      lat: 7.8203, lng: 98.2980 },
    { name: "Phuket Elephant Sanctuary", city: "Phuket", category: "Ethical Sanctuary", bestSlot: "morning",
      note: "An ethical, observation-only sanctuary in Paklok — watch and feed rescued elephants roam free. No riding, ever.",
      kidNote: "A gentle, memorable morning for children — no riding or performances.",
      lat: 8.0357, lng: 98.3897 },
    { name: "Phuket FantaSea", city: "Phuket", category: "Cultural Show", bestSlot: "evening",
      note: "A large-scale Thai cultural theme show with acrobatics and a buffet dinner — a polished, kid-pleasing evening.",
      lat: 7.9540, lng: 98.2820 },
  ],

  restaurants: [
    { name: "Saras Indian Vegetarian Restaurant", city: "Bangkok", area: "Sukhumvit", cuisine: "Gujarati & South-Indian veg", jain: true, lat: 13.7376, lng: 100.5602 },
    { name: "Rajdhani Thali Restaurant", city: "Bangkok", area: "Sukhumvit", cuisine: "Gujarati-Rajasthani thali", jain: true, lat: 13.7308, lng: 100.5697 },
    { name: "Govinda Bangkok", city: "Bangkok", area: "Sukhumvit Soi 22", cuisine: "Pure-veg Italian", jain: false, lat: 13.7290, lng: 100.5660 },
    { name: "Navrang Mahal Indian Veg Restaurant", city: "Phuket", area: "Patong", cuisine: "North-Indian veg", jain: true, lat: 7.8930, lng: 98.2980 },
    { name: "Pure Vegetarian Restaurant by Tanvee", city: "Phuket", area: "Rawai", cuisine: "Indian pure-veg", jain: true, lat: 7.8244, lng: 98.3387 },
    { name: "Mr. Coffee Veg Kitchen", city: "Phuket", area: "Karon", cuisine: "Veg & café fare", jain: false, lat: 7.8186, lng: 98.3000 },
  ],

  intel: {
    do: [
      "Take the 07:00 small speedboat to Phi Phi, not the midday ferry — Maya Bay caps daily visitor numbers.",
      "Use the BTS Skytrain and river ferries in Bangkok — they beat the city traffic every single time.",
      "Day-trip from Patong to calmer Kata Beach and Old Phuket Town for the island's quieter side.",
      "Agree every taxi and tuk-tuk fare before boarding; politely refuse any 'gem shop' detour.",
    ],
    skip: [
      "Patong jet-ski rentals — the most common fake damage-claim scam on the island.",
      "Bangla Road 'free show' and photo hustles — the bill always arrives padded.",
      "Tiger Kingdom and elephant riding — your plan uses an ethical, observation-only sanctuary instead.",
      "Gem and tailor 'wholesale resale' shops — a pure tourist scam.",
    ],
    miss: [
      "Old Phuket Town's Sino-Portuguese lanes at golden hour — calm, photogenic and kid-friendly.",
      "Sea-canoeing through the limestone caves of Phang Nga Bay.",
      "Feeding and watching rescued elephants roam at an ethical sanctuary.",
      "An evening Chao Phraya cruise past the floodlit riverside temples.",
    ],
    diet: "Bangkok's Sukhumvit district has excellent Gujarati, Jain and South-Indian kitchens — every dinner is pre-shortlisted near your hotel and the day's route.",
  },

  pricing: {
    lines: [
      { label: "Flights — AMD↔BKK + BKK↔HKT internal (4 travellers)", amountINR: 126200 },
      { label: "Hotels — 3N Bangkok 4★ + 4N Phuket 4★", amountINR: 36400 },
      { label: "Airport & inter-city transfers (both cities)", amountINR: 9500 },
      { label: "Tours, entries & activities (4 travellers)", amountINR: 38000 },
      { label: "Travel insurance (4 travellers)", amountINR: 3200 },
      { label: "Visa — visa-free, TDAC handled by Rise & Shine", amountINR: 0 },
    ],
    servicePct: 12,
  },
};
