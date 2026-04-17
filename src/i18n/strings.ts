export type Lang = "en" | "hi";

type Dict = Record<string, { en: string; hi: string }>;

export const T: Dict = {
  appName: { en: "KrishiMitra", hi: "कृषि मित्र" },
  tagline: {
    en: "Your AI farming companion",
    hi: "आपका एआई खेती साथी",
  },
  home: { en: "Home", hi: "होम" },
  recommend: { en: "Crops", hi: "फसल" },
  scan: { en: "Scan", hi: "स्कैन" },
  chat: { en: "Assistant", hi: "सहायक" },
  language: { en: "Language", hi: "भाषा" },
  english: { en: "English", hi: "अंग्रेज़ी" },
  hindi: { en: "हिन्दी", hi: "हिन्दी" },
  goodMorning: { en: "Namaste, farmer 🙏", hi: "नमस्ते, किसान जी 🙏" },
  todayWeather: { en: "Today's weather", hi: "आज का मौसम" },
  loading: { en: "Loading…", hi: "लोड हो रहा है…" },
  cropAdvisor: { en: "Crop Advisor", hi: "फसल सलाहकार" },
  cropAdvisorDesc: {
    en: "Best crops for your soil & weather",
    hi: "मिट्टी और मौसम के लिए सर्वोत्तम फसलें",
  },
  diseaseScanner: { en: "Disease Scanner", hi: "रोग पहचान" },
  diseaseScannerDesc: {
    en: "Photo of the leaf — instant diagnosis",
    hi: "पत्ते की फोटो लें — तुरंत निदान",
  },
  voiceAssistant: { en: "Voice Assistant", hi: "आवाज़ सहायक" },
  voiceAssistantDesc: {
    en: "Ask anything in Hindi or English",
    hi: "हिंदी या अंग्रेज़ी में कुछ भी पूछें" ,
  },
  recentRec: { en: "Last recommendation", hi: "पिछली सलाह" },
  noRecent: { en: "No recommendation yet", hi: "अभी कोई सलाह नहीं" },
  open: { en: "Open", hi: "खोलें" },
  back: { en: "Back", hi: "वापस" },
  // Soil form
  soilTitle: { en: "Soil & Weather", hi: "मिट्टी और मौसम" },
  soilDesc: {
    en: "We use your location to fetch soil and weather, or you can fill it in.",
    hi: "हम आपकी जगह से मिट्टी और मौसम लाते हैं, या आप भर सकते हैं।",
  },
  useLocation: { en: "Use my location", hi: "मेरा स्थान उपयोग करें" },
  fetching: { en: "Fetching…", hi: "लाया जा रहा है…" },
  ph: { en: "pH", hi: "pH" },
  moisture: { en: "Moisture %", hi: "नमी %" },
  nitrogen: { en: "Nitrogen (N)", hi: "नाइट्रोजन (N)" },
  phosphorus: { en: "Phosphorus (P)", hi: "फॉस्फोरस (P)" },
  potassium: { en: "Potassium (K)", hi: "पोटैशियम (K)" },
  soilType: { en: "Soil type", hi: "मिट्टी का प्रकार" },
  season: { en: "Season", hi: "मौसम/ऋतु" },
  landSize: { en: "Land size (acres)", hi: "ज़मीन (एकड़)" },
  getRecs: { en: "Get crop recommendations", hi: "फसल सलाह पाएं" },
  recommending: { en: "Thinking like an agronomist…", hi: "विशेषज्ञ की तरह सोच रहा है…" },
  // Disease
  diseaseTitle: { en: "Plant Disease Scanner", hi: "पौध रोग स्कैनर" },
  diseaseDesc: {
    en: "Take a clear photo of the affected leaf.",
    hi: "प्रभावित पत्ते की साफ फोटो लें।",
  },
  takePhoto: { en: "Take / choose photo", hi: "फोटो लें / चुनें" },
  diagnose: { en: "Diagnose", hi: "निदान करें" },
  diagnosing: { en: "Diagnosing…", hi: "जाँच हो रही है…" },
  // Chat
  chatTitle: { en: "AI Assistant", hi: "एआई सहायक" },
  askPlaceholder: { en: "Ask anything about farming…", hi: "खेती के बारे में कुछ भी पूछें…" },
  send: { en: "Send", hi: "भेजें" },
  speak: { en: "Tap to speak", hi: "बोलने के लिए दबाएं" },
  listening: { en: "Listening…", hi: "सुन रहा है…" },
  speakUnsupported: {
    en: "Voice not supported on this device",
    hi: "इस फ़ोन पर आवाज़ समर्थित नहीं",
  },
  offline: { en: "Offline — showing cached data", hi: "ऑफ़लाइन — सहेजा डेटा दिखा रहे हैं" },
  // Weather
  temp: { en: "Temp", hi: "तापमान" },
  humidity: { en: "Humidity", hi: "नमी" },
  rain: { en: "Rain", hi: "बारिश" },
  wind: { en: "Wind", hi: "हवा" },
  // Misc
  yield: { en: "Yield", hi: "उत्पादन" },
  profit: { en: "Profit/acre", hi: "लाभ/एकड़" },
  sustainability: { en: "Sustainability", hi: "टिकाऊपन" },
  water: { en: "Water need", hi: "पानी की ज़रूरत" },
  duration: { en: "Duration", hi: "अवधि" },
  days: { en: "days", hi: "दिन" },
  reasons: { en: "Why this crop", hi: "क्यों यह फसल" },
  tips: { en: "Farmer tips", hi: "किसान सुझाव" },
  symptoms: { en: "Symptoms", hi: "लक्षण" },
  causes: { en: "Causes", hi: "कारण" },
  organicTreatment: { en: "Organic treatment", hi: "जैविक उपचार" },
  chemicalTreatment: { en: "Chemical treatment", hi: "रासायनिक उपचार" },
  prevention: { en: "Prevention", hi: "रोकथाम" },
  notPlant: { en: "This doesn't look like a plant.", hi: "यह पौधा नहीं लगता।" },
  healthy: { en: "Plant looks healthy 🌿", hi: "पौधा स्वस्थ दिख रहा है 🌿" },
  retry: { en: "Try again", hi: "पुनः प्रयास करें" },
  errorGeneric: { en: "Something went wrong.", hi: "कुछ गड़बड़ हो गई।" },
  errorRate: { en: "Too many requests. Please wait a moment.", hi: "बहुत अधिक अनुरोध। कृपया रुकें।" },
  errorPay: { en: "AI credits exhausted. Add credits in workspace settings.", hi: "एआई क्रेडिट समाप्त। कृपया क्रेडिट जोड़ें।" },
};

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? String(key);
}
