/**
 * Master dictionary. This file defines the key space: `hi` and `or` are typed
 * as deep-partial versions of it, so every key here is guaranteed to resolve
 * even when a translation is missing.
 *
 * Keep keys grouped by area, and keep terminology consistent — "Markets",
 * "Results" and "Archive" mean the same thing on every page.
 */
export const en = {
  meta: {
    brand: "Numera",
    tagline: "Results & Statistics Portal",
    description:
      "Numera publishes time-based numerical results and the statistics behind them: a live board of current values, a browsable archive, and descriptive charts. All data is fictional demonstration data.",
  },

  nav: {
    label: "Primary",
    dashboard: "Dashboard",
    liveResults: "Live Results",
    markets: "Markets",
    charts: "Charts",
    historical: "Historical",
    statistics: "Statistics",
    information: "Information",
    about: "About",
    faqs: "FAQs",
    disclaimer: "Disclaimer",
    dayMarkets: "Day Markets",
    nightMarkets: "Night Markets",
    specialMarkets: "Special Markets",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    brandHome: "Numera — home",
    skipToContent: "Skip to main content",
    breadcrumb: "Breadcrumb",
    home: "Home",
    currentTime: "Current local time:",
  },

  language: {
    label: "Language",
    selectorLabel: "Change language",
    current: "Current language: {language}",
    selected: "Selected",
  },

  banner: {
    demo: "Demonstration site — every market, schedule and value here is fictional generated data.",
  },

  common: {
    search: "Search",
    filter: "Filter",
    filters: "Filters",
    apply: "Apply",
    applyFilters: "Apply filters",
    clearFilters: "Clear filters",
    reset: "Reset",
    show: "Show",
    hide: "Hide",
    loading: "Loading…",
    view: "View",
    viewAll: "View all",
    allMarkets: "All markets",
    lastUpdated: "Last updated",
    updated: "Updated",
    slot: "Slot",
    date: "Date",
    time: "Time",
    result: "Result",
    resultDate: "Result date",
    published: "Published",
    publishedAt: "Published {time}",
    notPublishedYet: "Not published yet",
    noEntryToday: "No entry today",
    active: "Active",
    paused: "Paused",
    justNow: "just now",
    minutesAgo: "{count} min ago",
    hoursAgo: "{count} h ago",
    yesterday: "yesterday",
    daysAgo: "{count} days ago",
    scheduledFor: "scheduled",
    entryOne: "{count} entry",
    entryOther: "{count} entries",
    archivedEntryOne: "{count} archived entry",
    archivedEntryOther: "{count} archived entries",
    publishedEntryOne: "{count} published entry",
    publishedEntryOther: "{count} published entries",
    activeCountOne: "{count} active",
    activeCountOther: "{count} active",
  },

  status: {
    published: "Published",
    pending: "Pending",
    scheduled: "Scheduled",
    notPublished: "Not published",
  },

  groups: {
    dayLabel: "Day Markets",
    dayBlurb: "Publishing between morning and late afternoon.",
    nightLabel: "Night Markets",
    nightBlurb: "Publishing from early evening onwards.",
    specialLabel: "Special Markets",
    specialBlurb:
      "Supplementary series that sit outside the ordinary day and night schedule.",
  },

  home: {
    title: "Every published result, and the statistics behind them",
    intro:
      "{markets} markets publish on a fixed daily schedule. This board shows what has been published today, what is still to come, and how to reach {archived} going back to {start}.",
    currentResults: "Current results",
    archive: "Archive",
    statistics: "Statistics",
    atAGlance: "At a glance",
    coverage: "Coverage from {start} to {end}.",
    fullStatistics: "Full statistics",
    publishedToday: "Published today",
    ofActiveMarkets: "of {count} active markets",
    archivedEntries: "Archived entries",
    rowsInTotal: "{count} rows in total",
    marketsTile: "Markets",
    lastUpdate: "Last update",
    boardTitle: "Current results",
    boardDescription:
      "Today, {date}. Where a market has not published yet, its most recent value is shown — check the result date on each card.",
    openBoard: "Open the board",
    nothingPublished: "Nothing published yet",
    nothingPublishedHint:
      "No market has published a value. The board fills in as each scheduled slot passes.",
    recentlyPublished: "Recently published",
    recentlyPublishedHint: "The newest entries across every market, most recent first.",
    allHistory: "All history",
    noEntriesYet: "No entries published yet",
    noEntriesYetHint:
      "Published values will appear here as soon as the first slot completes.",
    historicalData: "Historical data",
    historicalDataHint:
      "The archive holds every entry back to {start}. Filter by market, date range and status, then sort and page through the results.",
    openArchive: "Open the archive",
    publicationSchedule: "Publication schedule",
    allMarkets: "All markets",
    marketsTitle: "Markets",
    marketsDescription:
      "Each market publishes one value per scheduled day. Open a market for its own archive and statistics.",
  },

  results: {
    title: "Current Results",
    description:
      "Today's board for {date}. Each market publishes one value at its scheduled slot.",
    metaDescription:
      "Today's board: the value published by each market, the slots still to come, and when each entry was published.",
    historicalResults: "Historical results",
    publishedOfTotal: "({published}/{total} published)",
    noMarketsInGroup: "No markets in this group",
    scheduleTitle: "Today's schedule",
    scheduleDescription: "Every market in slot order, including those still to publish.",
    scheduleCaption: "Publication schedule and status for {date}",
    noMarketsConfigured: "No markets are configured",
    stillToPublishOne: "{count} market is still to publish today.",
    stillToPublishOther: "{count} markets are still to publish today.",
    nothingToday: "Nothing has been published yet today",
    nothingTodayHint:
      "The first slot has not completed. Values appear here automatically as each market publishes.",
    seeYesterday: "See yesterday's results",
    autoUpdating: "Auto-updating every minute",
    updating: "Updating…",
    updatedNow: "Updated",
    connectionProblem: "Connection problem — showing the last loaded values",
    refreshNow: "Refresh now",
    groupNav: "Market groups",
  },

  markets: {
    title: "Markets",
    description:
      "Every market, grouped by when it publishes. Open one for its own archive, statistics and charts.",
    metaDescription:
      "Every result market, its publication schedule, its most recent value and how many entries it has in the archive.",
    filterPlaceholder: "Filter markets…",
    filterLabel: "Filter markets by name",
    shown: "{count} markets shown",
    noMatch: "No market matches “{term}”",
    noMatchHint: "Check the spelling, or clear the filter to see all markets.",
    clearFilter: "Clear filter",
  },

  market: {
    todaysResult: "Today's result",
    mostRecentResult: "Most recent result",
    noEntriesYet: "No entries yet",
    inFullArchive: "In full archive",
    archivedEntries: "Archived entries",
    publishedThirtyDays: "Published (30 days)",
    outOfDays: "out of {count} days",
    scheduledSlot: "Scheduled slot",
    mostCommonRange: "Most common range",
    acrossArchive: "Across all archived values",
    publicationActivity: "Publication activity",
    publicationActivityHint: "Entries published per day over the last 30 days.",
    historicalDistribution: "Historical distribution",
    historicalDistributionHint: "How archived values fall across the 00–99 range.",
    archiveTitle: "{market} archive",
    archiveDescription: "{count} matching the current filters.",
    metaDescription:
      "{market} publishes at {slot} ({frequency}). Current value, full archive and statistics.",
    notFound: "Market not found",
  },

  charts: {
    title: "Charts",
    description:
      "Published values laid out by calendar date, and counted by how often each value has appeared. Both views describe the archive as it stands — neither is a forecast.",
    metaDescription:
      "Two views over the archive: a month calendar of published values for any market, and a frequency grid showing how often each value has appeared.",
    market: "Market",
    month: "Month",
    showButton: "Show",
    daysPublished: "days published",
    gapsThisMonth: "Gaps this month",
    daysWithNoEntry: "days with no entry",
    valuesSeen: "Values seen",
    fromEntries: "from {count}",
    calendarTitle: "Calendar — {month}",
    calendarDescription:
      "Every published value for {market}, laid out by date. Empty cells are days with no entry.",
    calendarCaption: "{market} published values for {month}",
    noEntry: "no entry",
    frequencyTitle: "Value frequency",
    frequencyDescription:
      "How often each value has been published by {market} across the whole archive. Rows are tens, columns are units.",
    frequencyCaption:
      "{market}: number of times each value from 00 to 99 has been published",
    frequencyCell: "{value}: published {count}× ({share}%)",
    tensDigit: "Tens digit",
    frequencyFooter:
      "Counts describe {entries} from {start} to {end}. Past frequency says nothing about what any market will publish next.",
    rawRows: "Looking for the raw rows instead?",
    openInArchive: "Open {market} in the archive",
    loadingChart: "Loading chart",
  },

  history: {
    title: "Historical Results",
    description: "Every entry from {start} to {end}, across all markets.",
    metaDescription:
      "The full result archive. Filter by market, date range and status, sort by date or value, and page through every published entry.",
    archive: "Archive",
    matching: "{count} match the current filters.",
    statusMessage: "{count} results found, showing page {page} of {pages}",
    caption: "Historical results",
    emptyTitle: "No results match these filters",
    emptyHint:
      "Try widening the date range, choosing a different market, or clearing the search term.",
  },

  table: {
    date: "Date",
    market: "Market",
    result: "Result",
    status: "Status",
    published: "Published",
    slot: "Slot",
    sortAscending: "sort ascending",
    sortDescending: "sort descending",
    sortedAscending: "sorted ascending,",
    sortedDescending: "sorted descending,",
  },

  sort: {
    label: "Sort",
    newest: "Newest first",
    oldest: "Oldest first",
    valueHigh: "Value: high to low",
    valueLow: "Value: low to high",
    marketAZ: "Market A–Z",
    chipNewest: "Newest",
    chipOldest: "Oldest",
    chipValueHigh: "Value ↓",
    chipValueLow: "Value ↑",
    chipAZ: "A–Z",
  },

  filters: {
    heading: "Filters",
    activeCount: "{count} active",
    search: "Search",
    searchPlaceholder: "Market, date or value",
    market: "Market",
    allMarkets: "All markets",
    from: "From",
    to: "To",
    status: "Status",
    anyStatus: "Any status",
    dateOrderError: "Start date must be on or before the end date",
  },

  pagination: {
    label: "Pagination",
    showing: "Showing {first}–{last} of {total}",
    previousPage: "Previous page",
    nextPage: "Next page",
    pageNumber: "Page {page}",
  },

  statistics: {
    title: "Statistics",
    description:
      "Summaries of what has already been published: how much, how often, and when. These are descriptions of past data only.",
    metaDescription:
      "Descriptive statistics over the published archive: publication activity over time, market volumes, value distribution, publication timing and weekday coverage.",
    market: "Market",
    allMarkets: "All markets",
    timeWindow: "Time window",
    lastDays: "Last {count} days",
    showingScope:
      "Showing {scope} over the last {days} days · archive covers {start} – {end}.",
    publishedEntries: "Published entries",
    inSelectedScope: "In the selected scope",
    publishedInWindow: "Published ({days}d)",
    perDayAverage: "{value} per day on average",
    publishedToday: "Published today",
    marketsActive: "{count} markets active",
    busiestWeekday: "Busiest weekday",
    entriesCount: "{count} entries",
    activityOverTime: "Publication activity over time",
    activityOverTimeHint:
      "Entries published per day for the last {days} days. The dashed line shows entries that exist but are not published.",
    activityCaption: "Entries published per day over the last {days} days",
    marketActivity: "Market activity",
    marketActivityHint: "Published entries per market across the whole archive.",
    marketActivityCaption: "Published entries per market",
    distribution: "Historical distribution",
    distributionHint:
      "How published values fall across the 00–99 range. A description of past values, not an indicator of future ones.",
    distributionCaption: "Published values grouped into ranges of ten",
    updateFrequency: "Update frequency",
    updateFrequencyHint: "When entries are published, grouped by hour of day.",
    updateFrequencyCaption: "Entries published by hour of day",
    weekdayCoverage: "Weekday coverage",
    weekdayCoverageHint: "Published entries by day of the week.",
    weekdayCoverageCaption: "Published entries by day of the week",
    footnote:
      "These charts summarise data that has already been published. They are not forecasts and are not intended to inform any decision about future values.",
    colRange: "Range",
    colEntries: "Entries",
    colMarket: "Market",
    colPublishedEntries: "Published entries",
    colHour: "Hour",
    colDay: "Day",
    colDate: "Date",
    colPublished: "Published",
    colNotPublished: "Not published",
  },

  searchPage: {
    title: "Search",
    description:
      "Find a market by name, or a result by date or value. Searching “12” matches both the value 12 and any date containing it.",
    metaDescription: "Search markets, dates and published values across the whole archive.",
    inputLabel: "Search markets, dates and values",
    placeholder: "e.g. Alpha, 2026-08-12, or 42",
    button: "Search",
    startTyping: "Start typing",
    startTypingHint: "Or jump straight into a market.",
    resultsFor: "{count} results for {term}",
    enterTerm: "Enter a search term",
    noMatch: "Nothing matches “{term}”",
    noMatchHint:
      "Try a market name, a full date such as 2026-08-12, or a two-digit value.",
    browseArchive: "Browse the archive instead",
    matchOne: "{count} match",
    matchOther: "{count} matches",
    forTerm: "For “{term}”.",
    hitCategory: "Market · publishes {slot}",
    hitPublished: "Published result",
    hitStatus: "Status: {status}",
  },

  about: {
    title: "About Numera",
    metaDescription:
      "What Numera publishes, where the data comes from, how the archive is organised, and what this demonstration site is not.",
    whatItIs: "What this site is",
    whatItIsBody: [
      "Numera is a results and statistics portal. It does one thing: publish a single numerical value for each market at a fixed daily slot, keep every value in a browsable archive, and describe that archive with plain statistics.",
      "The board on the current results page shows today. The archive holds {days} days of history, filterable by market, date range and status. The statistics page summarises what has already been published — volumes, timings and distributions.",
    ],
    whatItIsNot: "What this site is not",
    whatItIsNotBody: [
      "This is a demonstration build. It is not connected to any real service, operator or organisation, and the markets are invented names.",
      "There is no betting, wagering, deposit, withdrawal or payment functionality here, and none is planned. Nothing on the site is a prediction, a tip, a recommendation, or a claim about future values — the statistics pages describe past data only.",
    ],
    whereData: "Where the data comes from",
    whereDataBody: [
      "Every value is generated by a seeded pseudo-random function keyed on the market and the date. That makes the archive reproducible — the same date always yields the same value — while today's board still fills in as each scheduled slot passes.",
      "The generator sits behind a service layer, and the pages and the public API both read through that layer. Replacing the generator with a database means changing one module.",
    ],
    seeAlso:
      "Common questions are answered in the FAQs, and the disclaimer sets out the limits of what the statistics mean.",
    scheduleTitle: "Publication schedule",
    scheduleHint: "{markets} markets across {groups} groups. All times are local.",
    statusTitle: "Status meanings",
    statusPublished: "A value exists and has a publication timestamp.",
    statusPending: "The scheduled slot has passed but no value has been published yet.",
    statusScheduled: "The slot is still in the future.",
    apiTitle: "Public API",
    apiHint: "Read-only JSON, same data as the site.",
  },

  faqs: {
    title: "Frequently asked questions",
    description:
      "How the board, the archive and the charts work — and what this site deliberately does not do.",
    metaDescription:
      "Common questions about how Numera publishes results, what the statuses mean, how the archive and charts work, and what this demonstration site is not.",
    q1: "What does this site publish?",
    a1: "One numerical value per market per scheduled day, plus the archive of every value already published and plain statistics describing it. There are {markets} markets, split into day, night and special groups.",
    q2: "Is any of this real data?",
    a2: "No. Every market name, schedule and value is invented for this demonstration. Values come from a seeded pseudo-random function keyed on the market and the date, which is why the archive is reproducible — the same date always yields the same value.",
    q3: "What do Published, Pending and Scheduled mean?",
    a3: "Scheduled means the slot is still in the future. Pending means the slot has passed but no value has been published yet. Published means a value exists and carries a publication timestamp.",
    q4: "How often does the board update?",
    a4: "The current results page refreshes itself about once a minute while the tab is visible, and shows when it last updated. Every page also carries a “last updated” stamp so you can tell how fresh the data is.",
    q5: "How far back does the archive go?",
    a5: "{days} days. The historical results page lets you filter by market, date range and status, sort by date or value, and page through the whole set.",
    q6: "What are the two charts?",
    a6: "The charts page has a calendar view, which lays a month of one market's published values out by date, and a frequency grid, which counts how often each value from 00 to 99 has appeared. Both describe what has already happened.",
    q7: "Do the statistics predict anything?",
    a7: "No, and they are not intended to. Every chart on this site is a summary of past data. Frequency counts, distributions and timings say nothing about what any market will publish next — each value is independent of the ones before it.",
    q8: "Why is one market paused?",
    a8: "Express Results is paused in the demo data to show how the interface handles a market that has stopped publishing: its history stays browsable and searchable, but no new entries are added and it is marked Paused everywhere it appears.",
    q9: "Can I read this data programmatically?",
    a9: "Yes. There is a read-only JSON API covering markets, results, history and statistics, with the same filtering, sorting and pagination the site uses. The endpoints are listed on the about page.",
    stillUnclear:
      "Still unclear on something? The about page covers how the data is generated, and the disclaimer sets out what this site is and is not.",
  },

  disclaimer: {
    title: "Disclaimer",
    description: "Please read this before drawing any conclusion from anything on this site.",
    metaDescription:
      "What Numera is, what it is not, and the limits of the data and statistics it publishes.",
    warning:
      "This is a demonstration site. Every market, schedule, timestamp and value shown here is fictional data generated by this application. None of it describes any real event, market, organisation or service.",
    noAffiliation: "No affiliation",
    noAffiliationBody:
      "Numera is not connected to, endorsed by, or operated on behalf of any real company, publisher or service. The market names are invented. Any resemblance to a real product or organisation is coincidental.",
    descriptiveOnly: "Statistics are descriptive only",
    descriptiveOnlyBody: [
      "Every chart and summary on this site describes data that has already been published: how many entries exist, when they were published, and how often each value has appeared. That is the entire scope.",
      "Nothing here forecasts, predicts, or indicates what any market will publish next. Past frequency carries no information about future values — each value in this dataset is generated independently of the ones before it. Reading a trend into the frequency grid or the distribution charts would be a mistake.",
    ],
    doesNotDo: "What this site does not do",
    doesNotDoBody:
      "There is no betting, wagering, staking, deposit, withdrawal or payment functionality on this site, and none is planned. Nothing published here is a tip, a recommendation, a guaranteed outcome, or advice of any kind. No part of this site should be treated as an invitation to gamble.",
    accuracy: "Accuracy and availability",
    accuracyBody:
      "Because the data is generated rather than sourced, it is internally consistent but carries no external meaning. The site is provided as-is, with no warranty as to accuracy, completeness or availability.",
    moreDetail:
      "More detail on how the data is produced is on the about page, and common questions are answered in the FAQs.",
  },

  footer: {
    blurb:
      "A results and statistics portal. Every market, schedule and value on this site is fictional demonstration data.",
    pages: "Pages",
    copyright:
      "© {year} Numera. Demonstration project — not affiliated with any real service.",
    generated:
      "All data is generated. Nothing on this site is an offer, a service, or a recommendation.",
  },

  errors: {
    pageTitle: "This page could not be loaded",
    pageHint:
      "Something went wrong while building the page. Trying again usually resolves it.",
    tryAgain: "Try again",
    goHome: "Go to the homepage",
    reference: "Reference: {digest}",
    notFoundTitle: "Page not found",
    notFoundHint:
      "That page does not exist. It may have been a market that has since been removed.",
    notFoundMeta: "Page not found",
    homepage: "Homepage",
    allMarkets: "All markets",
    archive: "Archive",
    somethingWrong: "Something went wrong",
  },

  loading: {
    page: "Loading",
    results: "Loading today's board",
    history: "Loading historical results",
    markets: "Loading markets",
    market: "Loading market",
    statistics: "Loading statistics",
    charts: "Loading charts",
    searching: "Searching",
  },
} as const;
