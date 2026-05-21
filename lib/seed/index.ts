import type { SeedDestination } from "./types";
import { THAILAND } from "./thailand";
import { DUBAI } from "./dubai";
import { KERALA } from "./kerala";

export * from "./types";

/** The three locked demo destinations. */
export const SEED: Record<string, SeedDestination> = {
  thailand: THAILAND,
  dubai: DUBAI,
  kerala: KERALA,
};

/** Display order for the form. */
export const DESTINATION_KEYS = ["thailand", "dubai", "kerala"] as const;
export type DestinationKey = (typeof DESTINATION_KEYS)[number];

/** Lightweight list for the form dropdown. */
export const DESTINATION_LIST = DESTINATION_KEYS.map((k) => ({
  key: k,
  name: SEED[k].name,
  title: SEED[k].title,
  flag: SEED[k].flag,
  scope: SEED[k].scope,
}));

/** Resolve a destination key to its seed; falls back to Thailand. */
export function getSeed(key: string): SeedDestination {
  return SEED[key] ?? THAILAND;
}
