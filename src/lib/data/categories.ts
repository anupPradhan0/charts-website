import type { Category } from "@/types";

/**
 * Fictional demo markets, grouped by publication window.
 *
 * Names and descriptions are stored once per market as `{ en, hi, or }` and
 * resolved at the boundary by `localized()` — the row itself is never
 * duplicated per language.
 *
 * Nothing here refers to a real market, operator or product. Markets are
 * ordered by slot within each group; the board and the footer rely on that.
 */
export const CATEGORIES: Category[] = [
  // --------------------------------------------------------------- Day ----
  {
    id: "cat_alpha",
    slug: "alpha-market",
    name: {
      en: "Alpha Market",
      hi: "अल्फा मार्केट",
      or: "ଆଲ୍ଫା ମାର୍କେଟ",
    },
    description: {
      en: "The first slot of the day. Alpha Market publishes a single demo value each morning and is the reference series for the rest of the board.",
      hi: "दिन का पहला समय। अल्फा मार्केट हर सुबह एक प्रदर्शन मान प्रकाशित करता है और बाकी बोर्ड के लिए संदर्भ श्रृंखला है।",
      or: "ଦିନର ପ୍ରଥମ ସମୟ। ଆଲ୍ଫା ମାର୍କେଟ ପ୍ରତି ସକାଳେ ଗୋଟିଏ ପ୍ରଦର୍ଶନ ମୂଲ୍ୟ ପ୍ରକାଶ କରେ ଏବଂ ବାକି ବୋର୍ଡ ପାଇଁ ସନ୍ଦର୍ଭ ଶୃଙ୍ଖଳା।",
    },
    scheduleTime: "09:15",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 1,
  },
  {
    id: "cat_sunrise",
    slug: "sunrise-market",
    name: {
      en: "Sunrise Market",
      hi: "सनराइज़ मार्केट",
      or: "ସନ୍‌ରାଇଜ ମାର୍କେଟ",
    },
    description: {
      en: "An early-morning series with a consistent publication record. Useful for comparing day-to-day movement against Alpha Market.",
      hi: "सुबह-सुबह की एक श्रृंखला जिसका प्रकाशन रिकॉर्ड लगातार रहा है। अल्फा मार्केट के साथ दैनिक तुलना के लिए उपयोगी।",
      or: "ସକାଳର ଏକ ଶୃଙ୍ଖଳା ଯାହାର ପ୍ରକାଶନ ରେକର୍ଡ ସ୍ଥିର। ଆଲ୍ଫା ମାର୍କେଟ ସହ ଦୈନିକ ତୁଳନା ପାଇଁ ଉପଯୋଗୀ।",
    },
    scheduleTime: "10:30",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 2,
  },
  {
    id: "cat_harbour",
    slug: "harbour-exchange",
    name: {
      en: "Harbour Exchange",
      hi: "हार्बर एक्सचेंज",
      or: "ହାର୍ବର ଏକ୍ସଚେଞ୍ଜ",
    },
    description: {
      en: "A late-morning series covering the harbour demo dataset. Publishes close to its slot on most days.",
      hi: "देर सुबह की श्रृंखला जो हार्बर प्रदर्शन डेटासेट को कवर करती है। अधिकांश दिनों में अपने समय के करीब प्रकाशित होती है।",
      or: "ଡେରି ସକାଳର ଶୃଙ୍ଖଳା ଯାହା ହାର୍ବର ପ୍ରଦର୍ଶନ ତଥ୍ୟସେଟକୁ ଆଚ୍ଛାଦନ କରେ। ଅଧିକାଂଶ ଦିନ ନିଜ ସମୟ ନିକଟରେ ପ୍ରକାଶିତ ହୁଏ।",
    },
    scheduleTime: "11:20",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 4,
  },
  {
    id: "cat_metro",
    slug: "metro-results",
    name: {
      en: "Metro Results",
      hi: "मेट्रो रिज़ल्ट्स",
      or: "ମେଟ୍ରୋ ରିଜଲ୍ଟ",
    },
    description: {
      en: "A midday series covering the metropolitan demo dataset. Publishes shortly after its scheduled slot on most days.",
      hi: "दोपहर की श्रृंखला जो महानगरीय प्रदर्शन डेटासेट को कवर करती है। अधिकांश दिनों में निर्धारित समय के थोड़ी देर बाद प्रकाशित होती है।",
      or: "ମଧ୍ୟାହ୍ନର ଶୃଙ୍ଖଳା ଯାହା ମହାନଗର ପ୍ରଦର୍ଶନ ତଥ୍ୟସେଟକୁ ଆଚ୍ଛାଦନ କରେ। ଅଧିକାଂଶ ଦିନ ନିର୍ଧାରିତ ସମୟର ଅଳ୍ପ ପରେ ପ୍ରକାଶିତ ହୁଏ।",
    },
    scheduleTime: "12:45",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 3,
  },
  {
    id: "cat_orchard",
    slug: "orchard-board",
    name: {
      en: "Orchard Board",
      hi: "ऑर्चर्ड बोर्ड",
      or: "ଅର୍ଚାର୍ଡ ବୋର୍ଡ",
    },
    description: {
      en: "An early-afternoon series. Orchard Board has the most even spread of values across the archive.",
      hi: "दोपहर बाद की श्रृंखला। संग्रह में ऑर्चर्ड बोर्ड के मानों का फैलाव सबसे समान है।",
      or: "ଅପରାହ୍ନ ଆରମ୍ଭର ଶୃଙ୍ଖଳା। ସଂଗ୍ରହରେ ଅର୍ଚାର୍ଡ ବୋର୍ଡର ମୂଲ୍ୟ ସବୁଠାରୁ ସମାନ ଭାବେ ବିସ୍ତୃତ।",
    },
    scheduleTime: "13:25",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 2,
  },
  {
    id: "cat_city",
    slug: "city-results",
    name: {
      en: "City Results",
      hi: "सिटी रिज़ल्ट्स",
      or: "ସିଟି ରିଜଲ୍ଟ",
    },
    description: {
      en: "An afternoon series with the widest spread of demo values in the archive. Occasionally publishes late.",
      hi: "दोपहर की श्रृंखला जिसके प्रदर्शन मानों का फैलाव संग्रह में सबसे अधिक है। कभी-कभी देर से प्रकाशित होती है।",
      or: "ଅପରାହ୍ନର ଶୃଙ୍ଖଳା ଯାହାର ପ୍ରଦର୍ଶନ ମୂଲ୍ୟ ସଂଗ୍ରହରେ ସବୁଠାରୁ ଅଧିକ ବିସ୍ତୃତ। ବେଳେବେଳେ ଡେରିରେ ପ୍ରକାଶିତ ହୁଏ।",
    },
    scheduleTime: "14:00",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 4,
  },
  {
    id: "cat_meridian",
    slug: "meridian-day",
    name: {
      en: "Meridian Day",
      hi: "मेरिडियन डे",
      or: "ମେରିଡିଆନ ଡେ",
    },
    description: {
      en: "A mid-afternoon series that closes the daytime board alongside Prime Results and Foundry Day.",
      hi: "दोपहर बाद की श्रृंखला जो प्राइम रिज़ल्ट्स और फ़ाउंड्री डे के साथ दिन का बोर्ड समाप्त करती है।",
      or: "ଅପରାହ୍ନର ଶୃଙ୍ଖଳା ଯାହା ପ୍ରାଇମ ରିଜଲ୍ଟ ଓ ଫାଉଣ୍ଡ୍ରି ଡେ ସହ ଦିନର ବୋର୍ଡ ଶେଷ କରେ।",
    },
    scheduleTime: "14:50",
    group: "day",
    status: "active",
    updateFrequency: "Daily",
    accent: 5,
  },
  {
    id: "cat_prime",
    slug: "prime-results",
    name: {
      en: "Prime Results",
      hi: "प्राइम रिज़ल्ट्स",
      or: "ପ୍ରାଇମ ରିଜଲ୍ଟ",
    },
    description: {
      en: "The most frequently viewed series in the demo dataset. Publishes every weekday afternoon without exception.",
      hi: "प्रदर्शन डेटासेट में सबसे अधिक देखी जाने वाली श्रृंखला। हर कार्यदिवस दोपहर बिना किसी अपवाद के प्रकाशित होती है।",
      or: "ପ୍ରଦର୍ଶନ ତଥ୍ୟସେଟରେ ସବୁଠାରୁ ଅଧିକ ଦେଖାଯାଉଥିବା ଶୃଙ୍ଖଳା। ପ୍ରତ୍ୟେକ କାର୍ଯ୍ୟଦିବସ ଅପରାହ୍ନରେ ବିନା ବ୍ୟତିକ୍ରମରେ ପ୍ରକାଶିତ ହୁଏ।",
    },
    scheduleTime: "15:30",
    group: "day",
    status: "active",
    updateFrequency: "Weekdays",
    accent: 5,
  },
  {
    id: "cat_foundry",
    slug: "foundry-day",
    name: {
      en: "Foundry Day",
      hi: "फ़ाउंड्री डे",
      or: "ଫାଉଣ୍ଡ୍ରି ଡେ",
    },
    description: {
      en: "The last daytime slot before the evening board opens. Weekday-only, like Prime Results.",
      hi: "शाम का बोर्ड खुलने से पहले दिन का अंतिम समय। प्राइम रिज़ल्ट्स की तरह केवल कार्यदिवसों पर।",
      or: "ସନ୍ଧ୍ୟା ବୋର୍ଡ ଖୋଲିବା ପୂର୍ବରୁ ଦିନର ଶେଷ ସମୟ। ପ୍ରାଇମ ରିଜଲ୍ଟ ପରି କେବଳ କାର୍ଯ୍ୟଦିବସରେ।",
    },
    scheduleTime: "16:15",
    group: "day",
    status: "active",
    updateFrequency: "Weekdays",
    accent: 6,
  },
  // ------------------------------------------------------------- Night ----
  {
    id: "cat_star",
    slug: "star-market",
    name: {
      en: "Star Market",
      hi: "स्टार मार्केट",
      or: "ଷ୍ଟାର ମାର୍କେଟ",
    },
    description: {
      en: "The first evening series. Star Market has the tightest gap between its scheduled slot and its publication timestamp.",
      hi: "शाम की पहली श्रृंखला। स्टार मार्केट में निर्धारित समय और प्रकाशन समय के बीच सबसे कम अंतर है।",
      or: "ସନ୍ଧ୍ୟାର ପ୍ରଥମ ଶୃଙ୍ଖଳା। ଷ୍ଟାର ମାର୍କେଟରେ ନିର୍ଧାରିତ ସମୟ ଓ ପ୍ରକାଶନ ସମୟ ମଧ୍ୟରେ ସବୁଠାରୁ କମ ବ୍ୟବଧାନ।",
    },
    scheduleTime: "17:45",
    group: "night",
    status: "active",
    updateFrequency: "Daily",
    accent: 6,
  },
  {
    id: "cat_lantern",
    slug: "lantern-night",
    name: {
      en: "Lantern Night",
      hi: "लैंटर्न नाइट",
      or: "ଲାଣ୍ଟର୍ନ ନାଇଟ",
    },
    description: {
      en: "An early-evening series. Publication timings are steadier here than anywhere else on the night board.",
      hi: "शाम की शुरुआती श्रृंखला। रात के बोर्ड पर कहीं और की तुलना में यहाँ प्रकाशन समय अधिक स्थिर है।",
      or: "ସନ୍ଧ୍ୟା ଆରମ୍ଭର ଶୃଙ୍ଖଳା। ରାତି ବୋର୍ଡର ଅନ୍ୟ ଯେକୌଣସି ସ୍ଥାନ ଅପେକ୍ଷା ଏଠାରେ ପ୍ରକାଶନ ସମୟ ଅଧିକ ସ୍ଥିର।",
    },
    scheduleTime: "18:40",
    group: "night",
    status: "active",
    updateFrequency: "Daily",
    accent: 3,
  },
  {
    id: "cat_central",
    slug: "central-results",
    name: {
      en: "Central Results",
      hi: "सेंट्रल रिज़ल्ट्स",
      or: "ସେଣ୍ଟ୍ରାଲ ରିଜଲ୍ଟ",
    },
    description: {
      en: "The main evening series. Historical coverage goes back the full length of the archive with very few gaps.",
      hi: "शाम की मुख्य श्रृंखला। ऐतिहासिक दायरा बहुत कम रिक्तियों के साथ पूरे संग्रह तक जाता है।",
      or: "ସନ୍ଧ୍ୟାର ମୁଖ୍ୟ ଶୃଙ୍ଖଳା। ଐତିହାସିକ ପରିସର ଅତି କମ ଫାଙ୍କ ସହ ସମ୍ପୂର୍ଣ୍ଣ ସଂଗ୍ରହ ପର୍ଯ୍ୟନ୍ତ ଯାଏ।",
    },
    scheduleTime: "20:00",
    group: "night",
    status: "active",
    updateFrequency: "Daily",
    accent: 1,
  },
  {
    id: "cat_cascade",
    slug: "cascade-night",
    name: {
      en: "Cascade Night",
      hi: "कैस्केड नाइट",
      or: "କାସକେଡ ନାଇଟ",
    },
    description: {
      en: "A late series that runs after Central Results. Occasional gaps where no entry was recorded for the day.",
      hi: "सेंट्रल रिज़ल्ट्स के बाद चलने वाली देर की श्रृंखला। कभी-कभी ऐसे दिन आते हैं जिनमें कोई प्रविष्टि दर्ज नहीं हुई।",
      or: "ସେଣ୍ଟ୍ରାଲ ରିଜଲ୍ଟ ପରେ ଚାଲୁଥିବା ଡେରି ଶୃଙ୍ଖଳା। ବେଳେବେଳେ ଏମିତି ଦିନ ଆସେ ଯେଉଁଥିରେ କୌଣସି ଏଣ୍ଟ୍ରି ଲିପିବଦ୍ଧ ହୋଇନଥାଏ।",
    },
    scheduleTime: "20:50",
    group: "night",
    status: "active",
    updateFrequency: "Daily",
    accent: 5,
  },
  {
    id: "cat_express",
    slug: "express-results",
    name: {
      en: "Express Results",
      hi: "एक्सप्रेस रिज़ल्ट्स",
      or: "ଏକ୍ସପ୍ରେସ ରିଜଲ୍ଟ",
    },
    description: {
      en: "A supplementary evening series, currently paused. Historical entries remain browsable but no new values are being published.",
      hi: "शाम की एक पूरक श्रृंखला, फ़िलहाल रुकी हुई। पुरानी प्रविष्टियाँ देखी जा सकती हैं पर कोई नया मान प्रकाशित नहीं हो रहा।",
      or: "ସନ୍ଧ୍ୟାର ଏକ ପରିପୂରକ ଶୃଙ୍ଖଳା, ବର୍ତ୍ତମାନ ବନ୍ଦ। ପୁରୁଣା ଏଣ୍ଟ୍ରି ଦେଖାଯାଇପାରେ କିନ୍ତୁ କୌଣସି ନୂଆ ମୂଲ୍ୟ ପ୍ରକାଶିତ ହେଉନାହିଁ।",
    },
    scheduleTime: "21:30",
    group: "night",
    status: "paused",
    updateFrequency: "Paused",
    accent: 4,
  },
  // ----------------------------------------------------------- Special ----
  {
    id: "cat_summit",
    slug: "summit-line",
    name: {
      en: "Summit Line",
      hi: "समिट लाइन",
      or: "ସମିଟ ଲାଇନ",
    },
    description: {
      en: "A supplementary late-morning series that runs alongside the main day board rather than as part of it.",
      hi: "देर सुबह की एक पूरक श्रृंखला जो मुख्य दिन के बोर्ड का हिस्सा बने बिना उसके साथ चलती है।",
      or: "ଡେରି ସକାଳର ଏକ ପରିପୂରକ ଶୃଙ୍ଖଳା ଯାହା ମୁଖ୍ୟ ଦିନ ବୋର୍ଡର ଅଂଶ ନହୋଇ ତାହା ସହ ଚାଲେ।",
    },
    scheduleTime: "11:00",
    group: "special",
    status: "active",
    updateFrequency: "Daily",
    accent: 2,
  },
  {
    id: "cat_beacon",
    slug: "beacon-series",
    name: {
      en: "Beacon Series",
      hi: "बीकन सीरीज़",
      or: "ବିକନ ସିରିଜ",
    },
    description: {
      en: "An afternoon supplementary series. Shares its publication window with Prime Results but is tracked separately.",
      hi: "दोपहर की एक पूरक श्रृंखला। इसका प्रकाशन समय प्राइम रिज़ल्ट्स जैसा है पर इसे अलग से दर्ज किया जाता है।",
      or: "ଅପରାହ୍ନର ଏକ ପରିପୂରକ ଶୃଙ୍ଖଳା। ଏହାର ପ୍ରକାଶନ ସମୟ ପ୍ରାଇମ ରିଜଲ୍ଟ ସହ ସମାନ କିନ୍ତୁ ଅଲଗା ଭାବେ ଲିପିବଦ୍ଧ।",
    },
    scheduleTime: "15:05",
    group: "special",
    status: "active",
    updateFrequency: "Daily",
    accent: 3,
  },
  {
    id: "cat_cobalt",
    slug: "cobalt-draw",
    name: {
      en: "Cobalt Draw",
      hi: "कोबाल्ट ड्रॉ",
      or: "କୋବାଲ୍ଟ ଡ୍ର",
    },
    description: {
      en: "An evening supplementary series with the shortest publication delay in the whole demo dataset.",
      hi: "शाम की एक पूरक श्रृंखला जिसमें पूरे प्रदर्शन डेटासेट में सबसे कम प्रकाशन देरी है।",
      or: "ସନ୍ଧ୍ୟାର ଏକ ପରିପୂରକ ଶୃଙ୍ଖଳା ଯେଉଁଥିରେ ସମଗ୍ର ପ୍ରଦର୍ଶନ ତଥ୍ୟସେଟରେ ସବୁଠାରୁ କମ ପ୍ରକାଶନ ବିଳମ୍ବ।",
    },
    scheduleTime: "19:20",
    group: "special",
    status: "active",
    updateFrequency: "Daily",
    accent: 6,
  },
  {
    id: "cat_aurora",
    slug: "aurora-grid",
    name: {
      en: "Aurora Grid",
      hi: "ऑरोरा ग्रिड",
      or: "ଅରୋରା ଗ୍ରିଡ",
    },
    description: {
      en: "The final entry on the board each day. Aurora Grid closes the special series after the night markets have settled.",
      hi: "हर दिन बोर्ड की आख़िरी प्रविष्टि। रात के बाज़ार थम जाने के बाद ऑरोरा ग्रिड विशेष श्रृंखला को समाप्त करता है।",
      or: "ପ୍ରତିଦିନ ବୋର୍ଡର ଶେଷ ଏଣ୍ଟ୍ରି। ରାତି ବଜାର ଶାନ୍ତ ହେବା ପରେ ଅରୋରା ଗ୍ରିଡ ବିଶେଷ ଶୃଙ୍ଖଳାକୁ ଶେଷ କରେ।",
    },
    scheduleTime: "22:10",
    group: "special",
    status: "active",
    updateFrequency: "Daily",
    accent: 1,
  },
];

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));
