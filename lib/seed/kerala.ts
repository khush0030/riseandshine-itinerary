import type { SeedDestination } from "./types";

/**
 * KERALA — 7 nights / 8 days · 4 travellers · domestic.
 * Kochi D1–2 · Munnar D3–4 · Alleppey houseboat D5 · Kovalam D6–7.
 */
export const KERALA: SeedDestination = {
  key: "kerala",
  name: "Kerala",
  title: "Kerala — God's Own Country",
  tagline: "Old Cochin, the Munnar hills, a backwater houseboat and a beach finish.",
  flag: "🇮🇳",
  scope: "domestic",
  originAirport: "AMD",
  originCity: "Ahmedabad",
  startDate: "2026-12-10",
  nights: 7,
  pax: { adults: 2, children: 2, infants: 0, childrenAges: [8, 11] },

  cities: [
    { name: "Kochi", fromDayIndex: 0, nights: 2, lat: 9.9658, lng: 76.2422 },
    { name: "Munnar", fromDayIndex: 2, nights: 2, lat: 10.0889, lng: 77.0595 },
    { name: "Alleppey", fromDayIndex: 4, nights: 1, lat: 9.4981, lng: 76.3388 },
    { name: "Kovalam", fromDayIndex: 5, nights: 2, lat: 8.4004, lng: 76.9787 },
  ],

  flights: {
    outbound: {
      airline: "Air India Express", flightNo: "IX-542",
      from: "AMD", fromCity: "Ahmedabad", to: "COK", toCity: "Kochi",
      dayIndex: 0, depTime: "07:15", arrTime: "09:35", duration: "2h 20m",
      cabin: "Economy", baggage: "20kg checked + 7kg cabin", stops: "Direct (non-stop)",
    },
    inbound: {
      airline: "Air India Express", flightNo: "IX-543",
      from: "COK", fromCity: "Kochi", to: "AMD", toCity: "Ahmedabad",
      dayIndex: 7, depTime: "10:30", arrTime: "12:55", duration: "2h 25m",
      cabin: "Economy", baggage: "20kg checked + 7kg cabin", stops: "Direct (non-stop)",
    },
    note: "Direct both ways. Inter-city travel within Kerala is by private AC cab — included in the package.",
  },

  hotels: [
    {
      name: "Taj Gateway Hotel Ernakulam", city: "Kochi",
      area: "MG Road · Ernakulam", stars: 4, kind: "hotel",
      fromDayIndex: 0, nights: 2,
      why: "Central Ernakulam base with easy reach to Fort Kochi, family rooms and dependable multi-cuisine dining.",
      amenities: ["Pool", "Multi-cuisine restaurant", "Central Ernakulam", "Family rooms"],
      lat: 9.9816, lng: 76.2999,
    },
    {
      name: "Spice Tree Munnar", city: "Munnar",
      area: "Idukki · Munnar hills", stars: 4, kind: "hotel",
      fromDayIndex: 2, nights: 2,
      why: "Hilltop cottages with valley views and bonfire evenings — the cool, scenic heart of the trip.",
      amenities: ["Hilltop valley views", "Restaurant", "Private cottages", "Evening bonfire"],
      lat: 10.0889, lng: 77.0595,
    },
    {
      name: "Deluxe AC Houseboat — Vembanad Backwaters", city: "Alleppey",
      area: "Vembanad Lake · Alleppey", stars: 4, kind: "houseboat",
      fromDayIndex: 4, nights: 1,
      why: "A private two-bedroom Kettuvallam houseboat with an onboard chef — the signature Kerala night.",
      amenities: ["Two AC bedrooms", "Onboard chef", "Open sundeck", "Slow backwater cruising"],
      lat: 9.4981, lng: 76.3388,
    },
    {
      name: "Uday Samudra Leisure Beach Hotel", city: "Kovalam",
      area: "Kovalam Beach · Thiruvananthapuram", stars: 4, kind: "hotel",
      fromDayIndex: 5, nights: 2,
      why: "Beachfront resort to unwind on, with a serious Ayurveda spa to close the trip.",
      amenities: ["Beachfront", "Pool", "Ayurveda spa", "Multi-cuisine restaurant"],
      lat: 8.4004, lng: 76.9787,
    },
  ],

  visa: {
    status: "not-required",
    statusLabel: "NO VISA REQUIRED",
    type: "Domestic travel — Indian passport / ID",
    feePerPersonINR: 0,
    stay: "—",
    processing: "—",
    documents: [
      "Government photo ID for every traveller — Aadhaar / PAN / Passport",
      "Carried for hotel and houseboat check-ins",
    ],
    riseShineHandles: [
      "No visa or immigration formalities — domestic travel",
      "ID checklist shared before departure",
    ],
    note: "A domestic destination — no visa or border formalities of any kind. Carry Aadhaar or PAN for check-ins.",
  },

  venues: [
    // ── Kochi ──
    { name: "Fort Kochi & Chinese Fishing Nets", city: "Kochi", category: "Heritage Waterfront", bestSlot: "evening",
      note: "The cantilevered Chinese fishing nets along the Fort Kochi shore — the classic sunset photo of the city.",
      lat: 9.9667, lng: 76.2422 },
    { name: "Mattancherry Dutch Palace", city: "Kochi", category: "Palace Museum", bestSlot: "afternoon",
      note: "A 16th-century palace famed for its Ramayana murals and royal Cochin portraits.",
      lat: 9.9587, lng: 76.2588 },
    { name: "Paradesi Synagogue & Jew Town", city: "Kochi", category: "Heritage Quarter", bestSlot: "afternoon",
      note: "India's oldest active synagogue, set among the antique and spice lanes of Jew Town.",
      lat: 9.9580, lng: 76.2598 },
    { name: "St. Francis Church", city: "Kochi", category: "Heritage Church", bestSlot: "morning",
      note: "India's oldest European church — Vasco da Gama was first buried here in 1524.",
      lat: 9.9647, lng: 76.2422 },
    { name: "Kathakali & Kalaripayattu Show", city: "Kochi", category: "Cultural Performance", bestSlot: "evening",
      note: "A classical Kathakali performance with a live make-up demonstration, followed by a Kalaripayattu martial-arts display.",
      kidNote: "Arrive early for the make-up demo — the part children remember most.",
      lat: 9.9648, lng: 76.2426 },
    { name: "Marine Drive Kochi", city: "Kochi", category: "Waterfront Promenade", bestSlot: "evening",
      note: "A breezy backwater-facing promenade for an easy evening stroll and ice cream.",
      lat: 9.9778, lng: 76.2769 },

    // ── Munnar ──
    { name: "Tea Gardens & KDHP Tea Museum", city: "Munnar", category: "Tea Estate", bestSlot: "morning",
      note: "Rolling green tea slopes with a working museum that demonstrates the leaf-to-cup process.",
      lat: 10.0986, lng: 77.0598 },
    { name: "Eravikulam National Park", city: "Munnar", category: "National Park", bestSlot: "morning",
      note: "Shola grassland that is home to the endangered Nilgiri tahr — go early, as the park runs a daily visitor cap.",
      kidNote: "The tahr graze close to the path — easy, exciting wildlife for children.",
      lat: 10.1840, lng: 77.0540 },
    { name: "Mattupetty Dam & Echo Point", city: "Munnar", category: "Lake & Viewpoint", bestSlot: "afternoon",
      note: "Speedboat rides on the Mattupetty reservoir and the famous echo across the hills nearby.",
      lat: 10.1083, lng: 77.1281 },
    { name: "Top Station Viewpoint", city: "Munnar", category: "Mountain Viewpoint", bestSlot: "morning",
      note: "The highest point around Munnar, looking over the Western Ghats and the Tamil Nadu plains below.",
      lat: 10.1228, lng: 77.2447 },
    { name: "Kundala Lake", city: "Munnar", category: "Lake", bestSlot: "afternoon",
      note: "A calm hill lake with shikara and pedal boats, framed by tea slopes.",
      lat: 10.1369, lng: 77.1933 },

    // ── Alleppey ──
    { name: "Vembanad Backwater Houseboat Cruise", city: "Alleppey", category: "Backwater Cruise", bestSlot: "fullday",
      note: "Board a private Kettuvallam houseboat and cruise the palm-lined Vembanad backwaters — the chef cooks all meals onboard as villages drift past.",
      kidNote: "Slow, safe and endlessly interesting — the day the children will talk about most.",
      lat: 9.4981, lng: 76.3388 },
    { name: "Alleppey Beach", city: "Alleppey", category: "Beach", bestSlot: "morning",
      note: "An old pier and a wide, quiet beach for a short stop before boarding the houseboat.",
      lat: 9.4900, lng: 76.3169 },

    // ── Kovalam ──
    { name: "Lighthouse Beach", city: "Kovalam", category: "Beach", bestSlot: "afternoon",
      note: "Kovalam's main crescent of sand below the red-and-white lighthouse — gentle swimming and beachfront cafés.",
      lat: 8.3988, lng: 76.9783 },
    { name: "Hawah Beach", city: "Kovalam", category: "Beach", bestSlot: "morning",
      note: "The quieter cove just north of Lighthouse Beach — a calm morning swim before the day warms up.",
      lat: 8.4020, lng: 76.9785 },
    { name: "Padmanabhaswamy Temple", city: "Kovalam", category: "Temple", bestSlot: "morning",
      note: "Thiruvananthapuram's magnificent Dravidian temple to Vishnu — a strict dhoti/saree dress code applies.",
      lat: 8.4828, lng: 76.9434 },
    { name: "Poovar Estuary Boat Ride", city: "Kovalam", category: "Estuary Cruise", bestSlot: "afternoon",
      note: "A boat ride where the river, backwater and sea meet at the golden sandbar of Poovar.",
      lat: 8.3186, lng: 77.0760 },
    { name: "Kerala Ayurvedic Spa Session", city: "Kovalam", category: "Wellness", bestSlot: "evening",
      note: "An authentic Ayurvedic massage at a certified centre — the calm way to close the trip.",
      lat: 8.4004, lng: 76.9787 },
  ],

  restaurants: [
    { name: "Sree Krishna Cafe (Kerala Sadhya)", city: "Kochi", area: "Ernakulam", cuisine: "Traditional Kerala Sadhya on banana leaf", jain: false, lat: 9.9810, lng: 76.2840 },
    { name: "Pai Brothers", city: "Kochi", area: "Ernakulam", cuisine: "South-Indian pure-veg", jain: true, lat: 9.9790, lng: 76.2810 },
    { name: "Dal Roti", city: "Kochi", area: "Fort Kochi", cuisine: "North-Indian veg", jain: false, lat: 9.9656, lng: 76.2440 },
    { name: "Annapoorna Pure Veg & Jain Kitchen", city: "Munnar", area: "Munnar town", cuisine: "Jain-friendly pure-veg", jain: true, lat: 10.0879, lng: 77.0594 },
    { name: "Saravana Bhavan Munnar", city: "Munnar", area: "Munnar town", cuisine: "South-Indian veg", jain: false, lat: 10.0871, lng: 77.0606 },
    { name: "Rapsy Restaurant", city: "Munnar", area: "Munnar town", cuisine: "Kerala & North-Indian veg", jain: false, lat: 10.0884, lng: 77.0625 },
    { name: "Ayur Veg Restaurant", city: "Kovalam", area: "Kovalam Beach", cuisine: "Indian pure-veg", jain: true, lat: 8.3990, lng: 76.9788 },
    { name: "Swantham Restaurant", city: "Kovalam", area: "Kovalam Beach", cuisine: "Kerala veg & multi-cuisine", jain: false, lat: 8.4000, lng: 76.9785 },
    { name: "Malabar Cafe", city: "Kovalam", area: "Lighthouse Beach", cuisine: "Vegetarian & café fare", jain: false, lat: 8.3992, lng: 76.9786 },
  ],

  intel: {
    do: [
      "Pre-book the houseboat with a licensed operator — the backwaters are calmest at dawn and dusk.",
      "Carry warm layers for Munnar — the hill evenings turn genuinely cold in December.",
      "Start Eravikulam National Park early; it runs a daily visitor cap and the morning bus queue is shortest.",
      "Keep small cash for toll points and tea-estate viewpoints on the Munnar drive.",
    ],
    skip: [
      "Unbranded 'ayurveda' touts near the jetties — your spa session is at a certified centre.",
      "Overpriced spice-shop 'factory tours' that end at a hard-sell counter.",
      "Rushing Kochi and Munnar into one day — the hill road alone is a 3–4 hour drive.",
      "Peak-hour boat jams at Alleppey jetty — your cruise is timed to avoid them.",
    ],
    miss: [
      "A traditional Kerala Sadhya served on a banana leaf in Kochi.",
      "Sunset behind the Chinese fishing nets at Fort Kochi.",
      "The wild Nilgiri tahr grazing inside Eravikulam National Park.",
      "An evening Kathakali performance with the pre-show make-up demonstration.",
    ],
    diet: "Kerala is one of India's easiest states for vegetarians — a banana-leaf Sadhya in Kochi and a Jain-friendly kitchen in Munnar are both built into the plan.",
  },

  pricing: {
    lines: [
      { label: "Flights — AMD↔COK round trip (4 travellers)", amountINR: 40000 },
      { label: "Hotels — Kochi + Munnar + Alleppey houseboat + Kovalam", amountINR: 44000 },
      { label: "Private AC cab — Kochi→Munnar→Alleppey→Kovalam→COK", amountINR: 22000 },
      { label: "Activities & entries — Kathakali, boats, Eravikulam (4 travellers)", amountINR: 18000 },
      { label: "Travel insurance (4 travellers)", amountINR: 2000 },
      { label: "Visa — not required (domestic)", amountINR: 0 },
    ],
    servicePct: 12,
  },
};
