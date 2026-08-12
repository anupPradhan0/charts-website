import type { Category } from "@/types";

/**
 * Fictional demo categories. Nothing here refers to a real market, operator or
 * product — the names, schedules and copy are invented for this demonstration.
 */
export const CATEGORIES: Category[] = [
  {
    id: "cat_alpha",
    slug: "alpha-market",
    name: "Alpha Market",
    description:
      "The first slot of the day. Alpha Market publishes a single demo value each morning and is the reference series for the rest of the board.",
    scheduleTime: "09:15",
    status: "active",
    updateFrequency: "Daily",
    accent: 1,
  },
  {
    id: "cat_sunrise",
    slug: "sunrise-market",
    name: "Sunrise Market",
    description:
      "An early-morning series with a consistent publication record. Useful for comparing day-to-day movement against Alpha Market.",
    scheduleTime: "10:30",
    status: "active",
    updateFrequency: "Daily",
    accent: 2,
  },
  {
    id: "cat_metro",
    slug: "metro-results",
    name: "Metro Results",
    description:
      "A midday series covering the metropolitan demo dataset. Publishes shortly after its scheduled slot on most days.",
    scheduleTime: "12:45",
    status: "active",
    updateFrequency: "Daily",
    accent: 3,
  },
  {
    id: "cat_city",
    slug: "city-results",
    name: "City Results",
    description:
      "An afternoon series with the widest spread of demo values in the archive. Occasionally publishes late.",
    scheduleTime: "14:00",
    status: "active",
    updateFrequency: "Daily",
    accent: 4,
  },
  {
    id: "cat_prime",
    slug: "prime-results",
    name: "Prime Results",
    description:
      "The most frequently viewed series in the demo dataset. Publishes every weekday afternoon without exception.",
    scheduleTime: "15:30",
    status: "active",
    updateFrequency: "Weekdays",
    accent: 5,
  },
  {
    id: "cat_star",
    slug: "star-market",
    name: "Star Market",
    description:
      "An evening series. Star Market has the tightest gap between its scheduled slot and its publication timestamp.",
    scheduleTime: "17:45",
    status: "active",
    updateFrequency: "Daily",
    accent: 6,
  },
  {
    id: "cat_central",
    slug: "central-results",
    name: "Central Results",
    description:
      "A late-evening series that closes the daily board. Historical coverage goes back the full length of the archive.",
    scheduleTime: "20:00",
    status: "active",
    updateFrequency: "Daily",
    accent: 1,
  },
  {
    id: "cat_express",
    slug: "express-results",
    name: "Express Results",
    description:
      "A supplementary series, currently paused. Historical entries remain browsable but no new values are being published.",
    scheduleTime: "21:30",
    status: "paused",
    updateFrequency: "Paused",
    accent: 4,
  },
];

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));
