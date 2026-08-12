import type { Category } from "@/types";

/**
 * Fictional demo markets, grouped by publication window.
 *
 * Nothing here refers to a real market, operator or product — the names,
 * schedules and copy are invented for this demonstration. Markets are ordered
 * by slot within each group; the board and the footer both rely on that order.
 */
export const CATEGORIES: Category[] = [
  // ---------------------------------------------------------------- Day ----
  {
    id: "cat_alpha",
    slug: "alpha-market",
    name: "Alpha Market",
    description:
      "The first slot of the day. Alpha Market publishes a single demo value each morning and is the reference series for the rest of the board.",
    scheduleTime: "09:15",
    group: "day",
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
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 2,
  },
  {
    id: "cat_harbour",
    slug: "harbour-exchange",
    name: "Harbour Exchange",
    description:
      "A late-morning series covering the harbour demo dataset. Publishes close to its slot on most days.",
    scheduleTime: "11:20",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 4,
  },
  {
    id: "cat_metro",
    slug: "metro-results",
    name: "Metro Results",
    description:
      "A midday series covering the metropolitan demo dataset. Publishes shortly after its scheduled slot on most days.",
    scheduleTime: "12:45",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 3,
  },
  {
    id: "cat_orchard",
    slug: "orchard-board",
    name: "Orchard Board",
    description:
      "An early-afternoon series. Orchard Board has the most even spread of values across the archive.",
    scheduleTime: "13:25",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 2,
  },
  {
    id: "cat_city",
    slug: "city-results",
    name: "City Results",
    description:
      "An afternoon series with the widest spread of demo values in the archive. Occasionally publishes late.",
    scheduleTime: "14:00",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 4,
  },
  {
    id: "cat_meridian",
    slug: "meridian-day",
    name: "Meridian Day",
    description:
      "A mid-afternoon series that closes the daytime board alongside Prime Results and Foundry Day.",
    scheduleTime: "14:50",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 5,
  },
  {
    id: "cat_prime",
    slug: "prime-results",
    name: "Prime Results",
    description:
      "The most frequently viewed series in the demo dataset. Publishes every weekday afternoon without exception.",
    scheduleTime: "15:30",
    group: "day",
    status: "active",
    updateFrequency: "Weekdays",
    accent: 5,
  },
  {
    id: "cat_foundry",
    slug: "foundry-day",
    name: "Foundry Day",
    description:
      "The last daytime slot before the evening board opens. Weekday-only, like Prime Results.",
    scheduleTime: "16:15",
    group: "day",
    status: "active",
    updateFrequency: "Weekdays",
    accent: 6,
  },

  // -------------------------------------------------------------- Night ----
  {
    id: "cat_star",
    slug: "star-market",
    name: "Star Market",
    description:
      "The first evening series. Star Market has the tightest gap between its scheduled slot and its publication timestamp.",
    scheduleTime: "17:45",
    group: "night",
    status: "active",
    updateFrequency: "Daily",
    accent: 6,
  },
  {
    id: "cat_lantern",
    slug: "lantern-night",
    name: "Lantern Night",
    description:
      "An early-evening series. Publication timings are steadier here than anywhere else on the night board.",
    scheduleTime: "18:40",
    group: "night",
    status: "active",
    updateFrequency: "Daily",
    accent: 3,
  },
  {
    id: "cat_central",
    slug: "central-results",
    name: "Central Results",
    description:
      "The main evening series. Historical coverage goes back the full length of the archive with very few gaps.",
    scheduleTime: "20:00",
    group: "night",
    status: "active",
    updateFrequency: "Daily",
    accent: 1,
  },
  {
    id: "cat_cascade",
    slug: "cascade-night",
    name: "Cascade Night",
    description:
      "A late series that runs after Central Results. Occasional gaps where no entry was recorded for the day.",
    scheduleTime: "20:50",
    group: "night",
    status: "active",
    updateFrequency: "Daily",
    accent: 5,
  },
  {
    id: "cat_express",
    slug: "express-results",
    name: "Express Results",
    description:
      "A supplementary evening series, currently paused. Historical entries remain browsable but no new values are being published.",
    scheduleTime: "21:30",
    group: "night",
    status: "paused",
    updateFrequency: "Paused",
    accent: 4,
  },

  // ------------------------------------------------------------ Special ----
  {
    id: "cat_summit",
    slug: "summit-line",
    name: "Summit Line",
    description:
      "A supplementary late-morning series that runs alongside the main day board rather than as part of it.",
    scheduleTime: "11:00",
    group: "special",
    status: "active",
    updateFrequency: "Daily",
    accent: 2,
  },
  {
    id: "cat_beacon",
    slug: "beacon-series",
    name: "Beacon Series",
    description:
      "An afternoon supplementary series. Shares its publication window with Prime Results but is tracked separately.",
    scheduleTime: "15:05",
    group: "special",
    status: "active",
    updateFrequency: "Daily",
    accent: 3,
  },
  {
    id: "cat_cobalt",
    slug: "cobalt-draw",
    name: "Cobalt Draw",
    description:
      "An evening supplementary series with the shortest publication delay in the whole demo dataset.",
    scheduleTime: "19:20",
    group: "special",
    status: "active",
    updateFrequency: "Daily",
    accent: 6,
  },
  {
    id: "cat_aurora",
    slug: "aurora-grid",
    name: "Aurora Grid",
    description:
      "The final entry on the board each day. Aurora Grid closes the special series after the night markets have settled.",
    scheduleTime: "22:10",
    group: "special",
    status: "active",
    updateFrequency: "Daily",
    accent: 1,
  },
];

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));
