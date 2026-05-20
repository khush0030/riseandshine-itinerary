import type { Place } from "@/lib/itinerary/schema";

const KEY = () => process.env.GOOGLE_PLACES_API_KEY || "";
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FIELDS = [
  "places.displayName", "places.location", "places.rating",
  "places.userRatingCount", "places.priceLevel", "places.types",
  "places.googleMapsUri", "places.photos", "places.editorialSummary",
].join(",");

function photoUrl(name: string): string {
  return `https://places.googleapis.com/v1/${name}/media?maxHeightPx=480&maxWidthPx=720&key=${KEY()}`;
}

async function textSearch(query: string, lat: number, lng: number, n: number): Promise<Place[] | null> {
  if (!KEY()) return null;
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY(),
        "X-Goog-FieldMask": FIELDS,
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 20000 } },
        pageSize: Math.min(20, n),
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const places: Place[] = (j.places ?? []).map((p: any): Place => {
      const types: string[] = p.types ?? [];
      const cat = types.includes("restaurant")
        ? "Restaurant"
        : (types[0] ?? "Place").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      return {
        name: p.displayName?.text ?? "Unknown",
        category: cat,
        lat: p.location?.latitude ?? lat,
        lng: p.location?.longitude ?? lng,
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? null,
        priceLevel:
          typeof p.priceLevel === "string"
            ? ["PRICE_LEVEL_FREE", "PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE",
               "PRICE_LEVEL_EXPENSIVE", "PRICE_LEVEL_VERY_EXPENSIVE"].indexOf(p.priceLevel)
            : null,
        photoUrl: p.photos?.[0]?.name ? photoUrl(p.photos[0].name) : null,
        mapsUrl: p.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${p.location?.latitude},${p.location?.longitude}`,
        vegFriendly: /veg|jain|indian/i.test(query),
        tag: p.editorialSummary?.text ? String(p.editorialSummary.text).slice(0, 60) : null,
      };
    });
    return places;
  } catch {
    return null;
  }
}

export interface CityPOIs {
  attractions: Place[];
  restaurants: Place[];
  source: "live" | "sample";
}

/** Attractions + diet-aware restaurants around a city centre. */
export async function cityPOIs(
  cityName: string, lat: number, lng: number, diet: string,
  travelStyle: "touristy" | "balanced" | "offbeat" = "balanced",
  groupType: "family" | "solo" | "honeymoon" | "bikers" = "family",
): Promise<CityPOIs> {
  const dietWord =
    diet === "jain" ? "Jain vegetarian" :
    diet === "veg" ? "pure vegetarian Indian" :
    diet === "non-veg" ? "popular" : "vegetarian and";

  // groupType drives the base attraction-query phrasing…
  const baseByGroup =
    groupType === "family"    ? `family-friendly attractions and parks in ${cityName}` :
    groupType === "solo"      ? `popular cafes, landmarks and viewpoints in ${cityName}` :
    groupType === "honeymoon" ? `romantic viewpoints, sunset spots and fine dining in ${cityName}` :
                                `scenic drives, bike stops and viewpoints around ${cityName}`;
  // …travelStyle modulates it.
  const modifier =
    travelStyle === "offbeat"  ? "off-beat, local, hidden-gem " :
    travelStyle === "touristy" ? "must-see " : "";
  const attQuery = modifier + baseByGroup;

  const [attRaw, rest] = await Promise.all([
    textSearch(attQuery, lat, lng, 16),
    textSearch(`best ${dietWord} restaurants in ${cityName}`, lat, lng, 14),
  ]);

  // Drop non-sight businesses the text search drags in (agencies, shops, etc.)
  const JUNK = /agency|real estate|car rental|store|lodging|atm|bank|finance|insurance|consultant|office/i;
  const att = attRaw?.filter((p) => p.rating != null && !JUNK.test(p.category)) ?? null;

  if (att && att.length >= 4 && rest) return { attractions: att, restaurants: rest, source: "live" };
  return { ...sampleCity(cityName, lat, lng), source: "sample" };
}

// ── labelled sample fallback (so the app renders before keys are added) ──
function P(name: string, category: string, lat: number, lng: number, rating: number, veg = false, tag: string | null = null): Place {
  return {
    name, category, lat, lng, rating, reviews: null, priceLevel: null,
    photoUrl: null,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    vegFriendly: veg, tag,
  };
}

function sampleCity(cityName: string, lat: number, lng: number): Omit<CityPOIs, "source"> {
  const c = cityName.toLowerCase();
  if (c.includes("bangkok"))
    return {
      attractions: [
        P("Grand Palace & Wat Phra Kaew", "Temple", 13.75, 100.4913, 4.7, false, "modest dress required"),
        P("Wat Arun", "Temple", 13.7437, 100.4889, 4.6, false, "Temple of Dawn"),
        P("Wat Pho (Reclining Buddha)", "Temple", 13.7466, 100.4929, 4.7),
        P("Chatuchak Weekend Market", "Market", 13.7999, 100.5503, 4.5, false, "weekends only"),
        P("Asiatique The Riverfront", "Market", 13.7045, 100.5095, 4.4, false, "evening Ferris wheel"),
        P("Safari World Bangkok", "Theme Park", 13.8615, 100.7045, 4.4, false, "great with kids"),
      ],
      restaurants: [
        P("Saras Indian Vegetarian", "Restaurant", 13.7376, 100.5602, 4.4, true, "Gujarati/South Indian"),
        P("Rajdhani Thali", "Restaurant", 13.7308, 100.5697, 4.3, true, "Jain on request"),
        P("Govinda Italian-Veg", "Restaurant", 13.7197, 100.5662, 4.4, true),
      ],
    };
  if (c.includes("phuket"))
    return {
      attractions: [
        P("Big Buddha Phuket", "Landmark", 7.8276, 98.3119, 4.7, false, "panoramic views"),
        P("Wat Chalong", "Temple", 7.8462, 98.3376, 4.6),
        P("Old Phuket Town", "Heritage", 7.8841, 98.3878, 4.6, false, "Sino-Portuguese lanes"),
        P("Promthep Cape", "Viewpoint", 7.7625, 98.3046, 4.7, false, "best sunset"),
        P("Phi Phi Islands", "Island", 7.7407, 98.7784, 4.6, false, "early speedboat"),
        P("Phang Nga / James Bond Island", "Island", 8.2747, 98.4983, 4.6),
      ],
      restaurants: [
        P("Navrang Mahal Indian Veg", "Restaurant", 7.8918, 98.2967, 4.4, true, "Patong"),
        P("Pure Vegetarian by Tanvee", "Restaurant", 7.8244, 98.3387, 4.3, true, "Jain options"),
        P("Mr. Coffee Veg Kitchen", "Restaurant", 7.8186, 98.3, 4.2, true),
      ],
    };
  if (c.includes("jaipur"))
    return {
      attractions: [
        P("Amber Fort", "Fort", 26.9855, 75.8513, 4.6, false, "elephant ramp & Sheesh Mahal"),
        P("Hawa Mahal", "Palace", 26.9239, 75.8267, 4.5, false, "Palace of Winds — 953 jharokhas"),
        P("City Palace Jaipur", "Palace", 26.9258, 75.8237, 4.5, false, "Mubarak Mahal museum"),
        P("Jantar Mantar Jaipur", "Heritage", 26.9247, 75.8244, 4.5, false, "UNESCO observatory"),
        P("Nahargarh Fort", "Fort", 26.9367, 75.8155, 4.5, false, "sunset over Jaipur"),
        P("Jal Mahal", "Palace", 26.9534, 75.8463, 4.4, false, "lake palace photo stop"),
        P("Albert Hall Museum", "Museum", 26.9118, 75.8197, 4.4),
        P("Birla Mandir Jaipur", "Temple", 26.8916, 75.8155, 4.6),
      ],
      restaurants: [
        P("LMB (Laxmi Misthan Bhandar)", "Restaurant", 26.9248, 75.8264, 4.4, true, "Rajasthani thali, Johari Bazaar"),
        P("Suvarna Mahal at Rambagh Palace", "Restaurant", 26.8843, 75.7969, 4.6, true, "fine-dining heritage"),
        P("Sankalp Restaurant Jaipur", "Restaurant", 26.9085, 75.7873, 4.3, true, "South Indian veg"),
        P("Chokhi Dhani Village", "Restaurant", 26.7755, 75.8458, 4.5, true, "ethnic Rajasthani village experience"),
      ],
    };
  if (c.includes("udaipur"))
    return {
      attractions: [
        P("City Palace Udaipur", "Palace", 24.5764, 73.6835, 4.6, false, "Lake Pichola views"),
        P("Lake Pichola Boat Ride", "Lake", 24.572, 73.679, 4.7, false, "sunset boat to Jag Mandir"),
        P("Jagdish Temple", "Temple", 24.5797, 73.6839, 4.5),
        P("Saheliyon Ki Bari", "Garden", 24.6022, 73.6883, 4.4, false, "queens' garden of maidens"),
        P("Bagore Ki Haveli", "Heritage", 24.5803, 73.6817, 4.5, false, "evening Dharohar dance show"),
        P("Sajjangarh Monsoon Palace", "Palace", 24.6053, 73.6481, 4.4, false, "panoramic city view"),
        P("Fateh Sagar Lake", "Lake", 24.6010, 73.6786, 4.5),
        P("Vintage Car Museum", "Museum", 24.5816, 73.6896, 4.4),
      ],
      restaurants: [
        P("Ambrai Restaurant", "Restaurant", 24.5778, 73.6810, 4.6, true, "lakeside dining"),
        P("Natraj Restaurant", "Restaurant", 24.5867, 73.7102, 4.5, true, "famous Gujarati-Rajasthani thali"),
        P("1559 AD Restaurant", "Restaurant", 24.5841, 73.6951, 4.5, true, "rooftop fine-dining"),
        P("Upre by 1559 AD", "Restaurant", 24.5790, 73.6822, 4.6, true, "rooftop lake view"),
      ],
    };
  if (c.includes("munnar"))
    return {
      attractions: [
        P("Eravikulam National Park", "Park", 10.1840, 77.0540, 4.5, false, "Nilgiri tahr & shola forest"),
        P("Mattupetty Dam", "Lake", 10.1083, 77.1281, 4.4, false, "speedboat rides"),
        P("Tea Museum (KDHP)", "Museum", 10.0986, 77.0598, 4.4, false, "tea-making demo"),
        P("Top Station", "Viewpoint", 10.1228, 77.2447, 4.5, false, "Western Ghats viewpoint"),
        P("Echo Point", "Viewpoint", 10.1097, 77.1605, 4.3),
        P("Kundala Lake", "Lake", 10.1369, 77.1933, 4.4, false, "shikara boating"),
        P("Photo Point Tea Gardens", "Viewpoint", 10.0900, 77.0500, 4.5),
        P("Rajamala Tea Estate", "Garden", 10.1583, 77.0467, 4.5),
      ],
      restaurants: [
        P("Saravana Bhavan Munnar", "Restaurant", 10.0871, 77.0606, 4.3, true, "South Indian veg"),
        P("Rapsy Restaurant", "Restaurant", 10.0879, 77.0594, 4.4, true, "Parottas & Kerala veg"),
        P("Eastend Hotel Restaurant", "Restaurant", 10.0884, 77.0625, 4.3, true),
      ],
    };
  if (c.includes("alleppey") || c.includes("alappuzha"))
    return {
      attractions: [
        P("Alleppey Backwaters Houseboat", "Cruise", 9.4981, 76.3388, 4.7, false, "Kettuvallam overnight"),
        P("Alleppey Beach", "Beach", 9.4900, 76.3169, 4.3, false, "pier sunset"),
        P("Marari Beach", "Beach", 9.6034, 76.2999, 4.5, false, "quieter family beach"),
        P("Krishnapuram Palace", "Heritage", 9.2074, 76.5256, 4.4, false, "Gajendra Moksham mural"),
        P("Pathiramanal Island", "Island", 9.6219, 76.3744, 4.5, false, "bird sanctuary"),
        P("Vembanad Lake Backwaters", "Lake", 9.6, 76.4, 4.6, false, "largest lake in Kerala"),
        P("Champakulam Boat Race Site", "Heritage", 9.5167, 76.4197, 4.4),
      ],
      restaurants: [
        P("Cassia Restaurant", "Restaurant", 9.4943, 76.3268, 4.5, true),
        P("Halais Veg Restaurant", "Restaurant", 9.4986, 76.3372, 4.3, true),
        P("Thaff Restaurant", "Restaurant", 9.4945, 76.3340, 4.4, true),
      ],
    };
  if (c.includes("kochi") || c.includes("cochin"))
    return {
      attractions: [
        P("Chinese Fishing Nets Fort Kochi", "Heritage", 9.9646, 76.2422, 4.4, false, "classic photo at sunset"),
        P("Mattancherry Palace (Dutch Palace)", "Palace", 9.9587, 76.2588, 4.4),
        P("Paradesi Synagogue", "Heritage", 9.9580, 76.2598, 4.5, false, "Jew Town spice lanes"),
        P("St. Francis Church", "Heritage", 9.9647, 76.2422, 4.4),
        P("Fort Kochi Beach", "Beach", 9.9656, 76.2417, 4.3),
        P("Kerala Folklore Museum", "Museum", 9.9395, 76.3055, 4.5, false, "best museum in Kochi"),
        P("Marine Drive Kochi", "Waterfront", 9.9778, 76.2769, 4.5, false, "evening promenade"),
        P("Kathakali Centre (Greenix)", "Activity", 9.9648, 76.2426, 4.6, false, "live dance show"),
      ],
      restaurants: [
        P("Kashi Art Café", "Restaurant", 9.9657, 76.2425, 4.6, true, "Fort Kochi institution"),
        P("Oceanos Fort Kochi", "Restaurant", 9.9685, 76.2426, 4.4, true),
        P("Dal Roti", "Restaurant", 9.9656, 76.2440, 4.5, true, "North Indian veg in Fort Kochi"),
      ],
    };
  if (c.includes("ubud"))
    return {
      attractions: [
        P("Sacred Monkey Forest Sanctuary", "Forest", -8.5193, 115.2585, 4.5, false, "watch your phone"),
        P("Tegallalang Rice Terraces", "Viewpoint", -8.4319, 115.2776, 4.4, false, "iconic rice paddies"),
        P("Ubud Royal Palace", "Palace", -8.5067, 115.2625, 4.4),
        P("Goa Gajah (Elephant Cave)", "Heritage", -8.5236, 115.2867, 4.4),
        P("Tirta Empul Temple", "Temple", -8.4156, 115.3155, 4.6, false, "purification springs"),
        P("Campuhan Ridge Walk", "Trail", -8.4988, 115.2575, 4.6, false, "free sunrise/sunset walk"),
        P("Tegenungan Waterfall", "Waterfall", -8.5750, 115.2876, 4.4),
        P("Ubud Art Market", "Market", -8.5072, 115.2625, 4.3),
      ],
      restaurants: [
        P("Locavore To Go", "Restaurant", -8.5075, 115.2625, 4.6, true, "farm-to-table"),
        P("Sayuri Healing Food Café", "Restaurant", -8.5042, 115.2613, 4.7, true, "raw vegan"),
        P("Manisan Bali", "Restaurant", -8.5060, 115.2620, 4.5, true, "Indian veg"),
      ],
    };
  if (c.includes("seminyak") || c.includes("nusa dua") || c.includes("kuta"))
    return {
      attractions: [
        P("Tanah Lot Temple", "Temple", -8.6213, 115.0867, 4.6, false, "sunset sea temple"),
        P("Uluwatu Temple & Kecak Dance", "Temple", -8.8290, 115.0849, 4.7, false, "cliffside fire dance"),
        P("Seminyak Beach", "Beach", -8.6906, 115.1668, 4.5),
        P("Petitenget Beach", "Beach", -8.6753, 115.1495, 4.4),
        P("Potato Head Beach Club", "Activity", -8.6791, 115.1530, 4.4, false, "iconic beach club"),
        P("Pura Petitenget Temple", "Temple", -8.6749, 115.1502, 4.4),
        P("Garuda Wisnu Kencana Park", "Park", -8.8104, 115.1671, 4.5, false, "giant statue"),
        P("Jimbaran Bay Seafood Strip", "Activity", -8.7906, 115.1614, 4.5, false, "beach BBQ dinner"),
      ],
      restaurants: [
        P("Queen's Tandoor Seminyak", "Restaurant", -8.6783, 115.1633, 4.5, true, "Indian veg + Jain on request"),
        P("KAUM Bali", "Restaurant", -8.6800, 115.1530, 4.6, true, "Indonesian heritage"),
        P("Earth Café & Market", "Restaurant", -8.6878, 115.1633, 4.5, true, "vegan / vegetarian"),
      ],
    };
  if (c.includes("grand baie") || c.includes("mauritius"))
    return {
      attractions: [
        P("Île aux Cerfs Catamaran", "Island", -20.2667, 57.7833, 4.6, false, "full-day catamaran"),
        P("Black River Gorges National Park", "Park", -20.4203, 57.4250, 4.6),
        P("Chamarel Seven Coloured Earths", "Landmark", -20.4234, 57.3781, 4.5),
        P("Trou aux Biches Beach", "Beach", -20.0394, 57.5470, 4.7),
        P("Grand Baie Beach", "Beach", -20.0136, 57.5806, 4.5),
        P("Pamplemousses Botanical Garden", "Garden", -20.1033, 57.5847, 4.5, false, "giant water lilies"),
        P("La Vanille Nature Park", "Park", -20.5044, 57.5494, 4.5),
        P("Le Morne Brabant", "Landmark", -20.4575, 57.3169, 4.7, false, "UNESCO sunset"),
      ],
      restaurants: [
        P("Saveurs des Iles", "Restaurant", -20.0144, 57.5797, 4.5, true),
        P("Banyan Tree Mauritius", "Restaurant", -20.0150, 57.5803, 4.5, true, "Indian veg available"),
        P("Le Capitaine", "Restaurant", -20.0099, 57.5817, 4.4, true),
      ],
    };
  if (c.includes("maldives") || c.includes("male"))
    return {
      attractions: [
        P("Resort Snorkelling House Reef", "Reef", 4.1755, 73.5093, 4.7, false, "right off the jetty"),
        P("Sandbank Picnic Excursion", "Beach", 4.0, 73.5, 4.7, false, "half-day private sandbank"),
        P("Dolphin Sunset Cruise", "Cruise", 4.2, 73.5, 4.6),
        P("Manta Ray Snorkel Trip", "Activity", 4.0, 72.9, 4.7, false, "seasonal — Hanifaru Bay"),
        P("Local Island Day Tour", "Heritage", 4.1, 73.4, 4.4, false, "Maafushi / Thoddoo"),
        P("Maldive Fish Spa", "Activity", 4.17, 73.51, 4.3),
        P("Overwater Spa", "Wellness", 4.17, 73.51, 4.7),
        P("Sunset Fishing Trip", "Activity", 4.17, 73.51, 4.5),
      ],
      restaurants: [
        P("Resort Indian Veg Restaurant", "Restaurant", 4.1755, 73.5093, 4.4, true, "Jain on request"),
        P("Beachside All-Day Dining", "Restaurant", 4.1755, 73.5093, 4.5, true),
        P("Overwater Fine Dining", "Restaurant", 4.1755, 73.5093, 4.6, true),
      ],
    };
  // generic
  return {
    attractions: [
      P(`${cityName} City Highlights Tour`, "Sightseeing", lat, lng, 4.5),
      P(`${cityName} Heritage Walk`, "Heritage", lat, lng, 4.4),
      P(`${cityName} Local Market`, "Market", lat, lng, 4.3),
      P(`${cityName} Signature Viewpoint`, "Viewpoint", lat, lng, 4.5),
    ],
    restaurants: [
      P(`${cityName} Pure Veg Restaurant`, "Restaurant", lat, lng, 4.3, true),
      P(`${cityName} Indian Thali House`, "Restaurant", lat, lng, 4.3, true, "Jain on request"),
      P(`${cityName} Family Diner`, "Restaurant", lat, lng, 4.2, true),
    ],
  };
}
