export type Lang = "en" | "hi" | "te";

interface Translations {
  appName: string;
  appShort: string;
  appTagline: string;
  // nav
  navChat: string;
  navMarket: string;
  navFaq: string;
  navHistory: string;
  navFavorites: string;
  navSettings: string;
  navSignIn: string;
  navRegister: string;
  navSignOut: string;
  // hero
  heroTitle: string;
  heroDesc: string;
  heroCta: string;
  heroCtaRegister: string;
  heroFine: string;
  // features
  featCropTitle: string;
  featCropDesc: string;
  featDiseaseTitle: string;
  featDiseaseDesc: string;
  featMarketTitle: string;
  featMarketDesc: string;
  featLangTitle: string;
  featLangDesc: string;
  featSchemesTitle: string;
  featSchemesDesc: string;
  featSeasonalTitle: string;
  featSeasonalDesc: string;
  featEverything: string;
  // home sections
  homeRecentCrops: string;
  homeMarketPrices: string;
  homeGovtSchemes: string;
  homeStartChatBtn: string;
  homeViewMarket: string;
  homeAvailable: string;
  homeCta: string;
  homeCtaDesc: string;
  homeCtaBtn: string;
  // chat
  chatPlaceholder: string;
  chatSend: string;
  chatNewChat: string;
  chatGuestMode: string;
  chatSignUpToSave: string;
  chatStartConversation: string;
  chatStartDesc: string;
  chatWelcome: string;
  chatWelcomeDesc: string;
  chatSuggestions: string[];
  chatViewHistory: string;
  chatNoConversations: string;
  chatLoading: string;
  chatErrAi: string;
  chatErrNetwork: string;
  chatListening: string;
  chatVoiceNotSupported: string;
  chatSpeak: string;
  // login
  loginTitle: string;
  loginTagline: string;
  loginEmail: string;
  loginPassword: string;
  loginSubmit: string;
  loginLoading: string;
  loginNoAccount: string;
  loginCreateAccount: string;
  // register
  registerTitle: string;
  registerTagline: string;
  registerName: string;
  registerEmail: string;
  registerPassword: string;
  registerLang: string;
  registerSubmit: string;
  registerLoading: string;
  registerHaveAccount: string;
  registerSignIn: string;
  // faq
  faqTitle: string;
  faqSubtitle: string;
  // market
  marketTitle: string;
  marketSubtitle: string;
  marketPrices: string;
  marketSeasonalTips: string;
  marketSchemes: string;
  marketLastUpdated: string;
  marketNoData: string;
  marketUpdatedOn: string;
  marketReadMore: string;
  marketShowLess: string;
  marketLearnMore: string;
  // settings
  settingsTitle: string;
  settingsSubtitle: string;
  settingsAccount: string;
  settingsName: string;
  settingsEmail: string;
  settingsLang: string;
  settingsTheme: string;
  settingsThemeLight: string;
  settingsThemeDark: string;
  settingsSave: string;
  settingsSaving: string;
  settingsSaved: string;
  settingsLogout: string;
  // lang names
  langEn: string;
  langHi: string;
  langTe: string;
  // misc
  loading: string;
  noData: string;
  tryAgain: string;
  per100kg: string;
  perKg: string;
  notFound: string;
  notFoundDesc: string;
  goHome: string;
  // history / favorites
  historyTitle: string;
  historySubtitle: string;
  historyEmpty: string;
  historyNoAuth: string;
  favTitle: string;
  favSubtitle: string;
  favEmpty: string;
  favNoAuth: string;
  signInToAccess: string;
  signInBtn: string;
}

const en: Translations = {
  appName: "Kisan Sahayak AI",
  appShort: "Kisan AI",
  appTagline: "Your Expert Farm Advisor, Always Available",
  navChat: "Chat",
  navMarket: "Market",
  navFaq: "FAQ",
  navHistory: "History",
  navFavorites: "Favorites",
  navSettings: "Settings",
  navSignIn: "Sign in",
  navRegister: "Register",
  navSignOut: "Sign out",
  heroTitle: "Your Expert Farm Advisor, Always Available",
  heroDesc: "Ask anything about crops, diseases, fertilizers, market prices, or government schemes — in English, Hindi, or Telugu.",
  heroCta: "Start Chatting Free",
  heroCtaRegister: "Create Account",
  heroFine: "No account needed · Free to use · Hindi & Telugu supported",
  featCropTitle: "Crop Guidance",
  featCropDesc: "Expert advice on when and how to grow any crop suited to your region and season.",
  featDiseaseTitle: "Disease Diagnosis",
  featDiseaseDesc: "Describe symptoms and get instant identification with treatment and prevention guidance.",
  featMarketTitle: "Market Prices",
  featMarketDesc: "Mandi prices from across India to help you sell at the right time and place.",
  featLangTitle: "Hindi & Telugu Support",
  featLangDesc: "Full support in Hindi and Telugu so every farmer can access expert knowledge in their own language.",
  featSchemesTitle: "Government Schemes",
  featSchemesDesc: "Stay updated on PM-KISAN, crop insurance, subsidies, and other farmer welfare programs.",
  featSeasonalTitle: "Seasonal Tips",
  featSeasonalDesc: "Timely advice for soil preparation, irrigation, pest control, and post-harvest management.",
  featEverything: "Everything a farmer needs",
  homeRecentCrops: "Popular Crops",
  homeMarketPrices: "Market Prices",
  homeGovtSchemes: "Government Schemes",
  homeStartChatBtn: "Ask AI About This Crop",
  homeViewMarket: "View All Prices →",
  homeAvailable: "Always available · Free to use",
  homeCta: "Ready to get expert farming advice?",
  homeCtaDesc: "Start a conversation with Kisan Sahayak AI — in English, Hindi, or Telugu.",
  homeCtaBtn: "Start Chatting Free",
  chatPlaceholder: "Ask about crops, diseases, fertilizers...",
  chatSend: "Send",
  chatNewChat: "New chat",
  chatGuestMode: "Guest mode",
  chatSignUpToSave: "Sign up to save",
  chatStartConversation: "Start a conversation",
  chatStartDesc: "Ask about crops, diseases, market prices, or government schemes.",
  chatWelcome: "Hello! I am Kisan Sahayak AI",
  chatWelcomeDesc: "Ask me anything about farming, crops, diseases, or government schemes.",
  chatSuggestions: [
    "How to control bollworm in cotton?",
    "Best fertilizer for rice?",
    "PM-KISAN scheme details",
    "Tomato disease symptoms and treatment",
  ],
  chatViewHistory: "View all history",
  chatNoConversations: "No conversations yet",
  chatLoading: "Loading...",
  chatErrAi: "AI service is busy. Please try again in a moment.",
  chatErrNetwork: "Network error. Please check your connection and try again.",
  chatListening: "Listening...",
  chatVoiceNotSupported: "Voice input not supported in this browser.",
  chatSpeak: "Speak this response",
  loginTitle: "Sign in to Kisan Sahayak AI",
  loginTagline: "Your farm assistant awaits",
  loginEmail: "Email address",
  loginPassword: "Password",
  loginSubmit: "Sign in",
  loginLoading: "Signing in...",
  loginNoAccount: "New to Kisan Sahayak AI?",
  loginCreateAccount: "Create account",
  registerTitle: "Join Kisan Sahayak AI",
  registerTagline: "Create your farmer account",
  registerName: "Full Name",
  registerEmail: "Email address",
  registerPassword: "Password",
  registerLang: "Preferred Language",
  registerSubmit: "Create account",
  registerLoading: "Creating account...",
  registerHaveAccount: "Already have an account?",
  registerSignIn: "Sign in",
  faqTitle: "Frequently Asked Questions",
  faqSubtitle: "Common farming questions answered",
  marketTitle: "Farm Dashboard",
  marketSubtitle: "Market prices, government schemes, and seasonal tips",
  marketPrices: "Today's Market Prices",
  marketSeasonalTips: "Seasonal Tips",
  marketSchemes: "Government Schemes",
  marketLastUpdated: "Last updated",
  marketNoData: "No data available",
  marketUpdatedOn: "Updated on",
  marketReadMore: "Read more",
  marketShowLess: "Show less",
  marketLearnMore: "Learn more →",
  settingsTitle: "Settings",
  settingsSubtitle: "Manage your account and preferences",
  settingsAccount: "Account",
  settingsName: "Full Name",
  settingsEmail: "Email",
  settingsLang: "Language",
  settingsTheme: "Theme",
  settingsThemeLight: "Light",
  settingsThemeDark: "Dark",
  settingsSave: "Save changes",
  settingsSaving: "Saving...",
  settingsSaved: "Saved!",
  settingsLogout: "Sign out",
  langEn: "English",
  langHi: "हिंदी",
  langTe: "తెలుగు",
  loading: "Loading...",
  noData: "No data available",
  tryAgain: "Try again",
  per100kg: "per 100 kg",
  perKg: "per kg",
  notFound: "Page not found",
  notFoundDesc: "The page you are looking for doesn't exist.",
  goHome: "Go to home",
  historyTitle: "Chat History",
  historySubtitle: "Your past conversations",
  historyEmpty: "No conversations yet. Start chatting!",
  historyNoAuth: "Sign in to view your chat history.",
  favTitle: "Favorite Responses",
  favSubtitle: "Responses you've saved",
  favEmpty: "No favorites yet. Star a message in chat to save it here.",
  favNoAuth: "Sign in to view your favorite responses.",
  signInToAccess: "Sign in to access this feature.",
  signInBtn: "Sign in",
};

const hi: Translations = {
  appName: "किसान सहायक AI",
  appShort: "किसान AI",
  appTagline: "आपका विशेषज्ञ कृषि सलाहकार, हमेशा उपलब्ध",
  navChat: "चैट",
  navMarket: "बाजार",
  navFaq: "सहायता",
  navHistory: "इतिहास",
  navFavorites: "पसंदीदा",
  navSettings: "सेटिंग",
  navSignIn: "लॉगिन करें",
  navRegister: "पंजीकरण",
  navSignOut: "लॉगआउट",
  heroTitle: "आपका विशेषज्ञ कृषि सलाहकार, हमेशा उपलब्ध",
  heroDesc: "फसलों, बीमारियों, खाद, बाजार भाव, या सरकारी योजनाओं के बारे में कुछ भी पूछें — हिंदी, तेलुगु या अंग्रेजी में।",
  heroCta: "मुफ्त में चैट शुरू करें",
  heroCtaRegister: "खाता बनाएं",
  heroFine: "खाते की जरूरत नहीं · मुफ्त उपयोग · हिंदी और तेलुगु समर्थित",
  featCropTitle: "फसल मार्गदर्शन",
  featCropDesc: "आपके क्षेत्र और मौसम के अनुसार कोई भी फसल उगाने के बारे में विशेषज्ञ सलाह।",
  featDiseaseTitle: "रोग निदान",
  featDiseaseDesc: "लक्षण बताएं और तुरंत पहचान पाएं — उपचार और रोकथाम के साथ।",
  featMarketTitle: "बाजार भाव",
  featMarketDesc: "भारत भर की मंडियों से ताजा भाव ताकि आप सही समय पर सही जगह बेच सकें।",
  featLangTitle: "हिंदी और तेलुगु समर्थन",
  featLangDesc: "हिंदी और तेलुगु में पूर्ण समर्थन ताकि हर किसान अपनी भाषा में जानकारी पा सके।",
  featSchemesTitle: "सरकारी योजनाएं",
  featSchemesDesc: "PM-KISAN, फसल बीमा, सब्सिडी और अन्य किसान कल्याण कार्यक्रमों की जानकारी।",
  featSeasonalTitle: "मौसमी सुझाव",
  featSeasonalDesc: "मिट्टी तैयारी, सिंचाई, कीट नियंत्रण और फसल कटाई के बाद के प्रबंधन के लिए समय पर सलाह।",
  featEverything: "किसान की हर जरूरत के लिए",
  homeRecentCrops: "प्रमुख फसलें",
  homeMarketPrices: "बाजार भाव",
  homeGovtSchemes: "सरकारी योजनाएं",
  homeStartChatBtn: "इस फसल के बारे में AI से पूछें",
  homeViewMarket: "सभी भाव देखें →",
  homeAvailable: "हमेशा उपलब्ध · मुफ्त उपयोग",
  homeCta: "विशेषज्ञ कृषि सलाह के लिए तैयार हैं?",
  homeCtaDesc: "किसान सहायक AI से बातचीत शुरू करें — हिंदी, तेलुगु या अंग्रेजी में।",
  homeCtaBtn: "मुफ्त में चैट शुरू करें",
  chatPlaceholder: "फसल, बीमारी, खाद के बारे में पूछें...",
  chatSend: "भेजें",
  chatNewChat: "नई चैट",
  chatGuestMode: "अतिथि मोड",
  chatSignUpToSave: "सहेजने के लिए साइन अप करें",
  chatStartConversation: "बातचीत शुरू करें",
  chatStartDesc: "फसलों, बीमारियों, बाजार भाव, या सरकारी योजनाओं के बारे में पूछें।",
  chatWelcome: "नमस्ते! मैं किसान सहायक AI हूं",
  chatWelcomeDesc: "खेती, फसलों, बीमारियों, या सरकारी योजनाओं के बारे में कुछ भी पूछें।",
  chatSuggestions: [
    "कपास में बॉलवर्म कैसे नियंत्रित करें?",
    "धान के लिए सबसे अच्छा खाद कौन सा है?",
    "PM-KISAN योजना की जानकारी दें",
    "टमाटर के रोग के लक्षण और उपचार",
  ],
  chatViewHistory: "पूरा इतिहास देखें",
  chatNoConversations: "अभी तक कोई बातचीत नहीं",
  chatLoading: "लोड हो रहा है...",
  chatErrAi: "AI सेवा व्यस्त है। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
  chatErrNetwork: "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।",
  chatListening: "सुन रहा हूं...",
  chatVoiceNotSupported: "इस ब्राउज़र में आवाज इनपुट समर्थित नहीं है।",
  chatSpeak: "यह जवाब सुनें",
  loginTitle: "किसान सहायक AI में लॉगिन करें",
  loginTagline: "आपका कृषि सहायक प्रतीक्षा कर रहा है",
  loginEmail: "ईमेल पता",
  loginPassword: "पासवर्ड",
  loginSubmit: "लॉगिन करें",
  loginLoading: "लॉगिन हो रहा है...",
  loginNoAccount: "किसान सहायक AI में नए हैं?",
  loginCreateAccount: "खाता बनाएं",
  registerTitle: "किसान सहायक AI से जुड़ें",
  registerTagline: "अपना किसान खाता बनाएं",
  registerName: "पूरा नाम",
  registerEmail: "ईमेल पता",
  registerPassword: "पासवर्ड",
  registerLang: "पसंदीदा भाषा",
  registerSubmit: "खाता बनाएं",
  registerLoading: "खाता बन रहा है...",
  registerHaveAccount: "पहले से खाता है?",
  registerSignIn: "लॉगिन करें",
  faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
  faqSubtitle: "सामान्य कृषि प्रश्नों के उत्तर",
  marketTitle: "कृषि डैशबोर्ड",
  marketSubtitle: "बाजार भाव, सरकारी योजनाएं और मौसमी सुझाव",
  marketPrices: "आज के बाजार भाव",
  marketSeasonalTips: "मौसमी सुझाव",
  marketSchemes: "सरकारी योजनाएं",
  marketLastUpdated: "अंतिम अपडेट",
  marketNoData: "कोई डेटा उपलब्ध नहीं",
  marketUpdatedOn: "अपडेट किया",
  marketReadMore: "और पढ़ें",
  marketShowLess: "कम दिखाएं",
  marketLearnMore: "अधिक जानें →",
  settingsTitle: "सेटिंग",
  settingsSubtitle: "अपना खाता और प्राथमिकताएं प्रबंधित करें",
  settingsAccount: "खाता",
  settingsName: "पूरा नाम",
  settingsEmail: "ईमेल",
  settingsLang: "भाषा",
  settingsTheme: "थीम",
  settingsThemeLight: "हल्का",
  settingsThemeDark: "गहरा",
  settingsSave: "बदलाव सहेजें",
  settingsSaving: "सहेज रहे हैं...",
  settingsSaved: "सहेजा गया!",
  settingsLogout: "लॉगआउट",
  langEn: "English",
  langHi: "हिंदी",
  langTe: "తెలుగు",
  loading: "लोड हो रहा है...",
  noData: "कोई डेटा उपलब्ध नहीं",
  tryAgain: "पुनः प्रयास करें",
  per100kg: "प्रति 100 किग्रा",
  perKg: "प्रति किग्रा",
  notFound: "पेज नहीं मिला",
  notFoundDesc: "आप जो पेज खोज रहे हैं वह मौजूद नहीं है।",
  goHome: "होम पर जाएं",
  historyTitle: "चैट इतिहास",
  historySubtitle: "आपकी पिछली बातचीत",
  historyEmpty: "अभी तक कोई बातचीत नहीं। चैट शुरू करें!",
  historyNoAuth: "चैट इतिहास देखने के लिए लॉगिन करें।",
  favTitle: "पसंदीदा जवाब",
  favSubtitle: "आपके सहेजे गए जवाब",
  favEmpty: "अभी तक कोई पसंदीदा नहीं। चैट में संदेश को स्टार करके यहां सहेजें।",
  favNoAuth: "पसंदीदा जवाब देखने के लिए लॉगिन करें।",
  signInToAccess: "इस सुविधा को एक्सेस करने के लिए लॉगिन करें।",
  signInBtn: "लॉगिन करें",
};

const te: Translations = {
  appName: "కిసాన్ సహాయక్ AI",
  appShort: "కిసాన్ AI",
  appTagline: "మీ నిపుణ వ్యవసాయ సలహాదారు, ఎల్లప్పుడూ అందుబాటులో",
  navChat: "చాట్",
  navMarket: "మార్కెట్",
  navFaq: "సహాయం",
  navHistory: "చరిత్ర",
  navFavorites: "ఇష్టాలు",
  navSettings: "సెట్టింగ్‌లు",
  navSignIn: "సైన్ ఇన్",
  navRegister: "నమోదు",
  navSignOut: "సైన్ అవుట్",
  heroTitle: "మీ నిపుణ వ్యవసాయ సలహాదారు, ఎల్లప్పుడూ అందుబాటులో",
  heroDesc: "పంటలు, వ్యాధులు, ఎరువులు, మార్కెట్ ధరలు, లేదా ప్రభుత్వ పథకాల గురించి ఏదైనా అడగండి — తెలుగు, హిందీ లేదా ఇంగ్లీషులో.",
  heroCta: "ఉచితంగా చాట్ ప్రారంభించండి",
  heroCtaRegister: "ఖాతా సృష్టించండి",
  heroFine: "ఖాతా అవసరం లేదు · ఉచిత వినియోగం · తెలుగు మరియు హిందీ మద్దతు",
  featCropTitle: "పంట మార్గదర్శకం",
  featCropDesc: "మీ ప్రాంతం మరియు సీజన్‌కు అనుగుణంగా ఏ పంట పండించాలో నిపుణ సలహా.",
  featDiseaseTitle: "వ్యాధి నిర్ధారణ",
  featDiseaseDesc: "లక్షణాలు వివరించి, చికిత్స మరియు నివారణతో తక్షణ గుర్తింపు పొందండి.",
  featMarketTitle: "మార్కెట్ ధరలు",
  featMarketDesc: "భారతదేశమంతటా మండి ధరలు, తగిన సమయంలో తగిన చోట అమ్మడానికి సహాయం.",
  featLangTitle: "తెలుగు మరియు హిందీ మద్దతు",
  featLangDesc: "తెలుగు మరియు హిందీలో పూర్తి మద్దతు ఉంది.",
  featSchemesTitle: "ప్రభుత్వ పథకాలు",
  featSchemesDesc: "PM-KISAN, పంట బీమా, సబ్సిడీలు మరియు ఇతర రైతు సంక్షేమ కార్యక్రమాలపై తాజా సమాచారం.",
  featSeasonalTitle: "మౌసమీ సూచనలు",
  featSeasonalDesc: "మట్టి సిద్ధత, నీటిపారుదల, చీడపురుగుల నియంత్రణ మరియు పంట కోత తర్వాత నిర్వహణకు సకాలంలో సలహా.",
  featEverything: "రైతుకు కావలసినదంతా",
  homeRecentCrops: "ప్రముఖ పంటలు",
  homeMarketPrices: "మార్కెట్ ధరలు",
  homeGovtSchemes: "ప్రభుత్వ పథకాలు",
  homeStartChatBtn: "ఈ పంట గురించి AI తో అడగండి",
  homeViewMarket: "అన్ని ధరలు చూడండి →",
  homeAvailable: "ఎల్లప్పుడూ అందుబాటులో · ఉచిత వినియోగం",
  homeCta: "నిపుణ వ్యవసాయ సలహా పొందడానికి సిద్ధంగా ఉన్నారా?",
  homeCtaDesc: "కిసాన్ సహాయక్ AI తో సంభాషణ ప్రారంభించండి — తెలుగు, హిందీ లేదా ఇంగ్లీషులో.",
  homeCtaBtn: "ఉచితంగా చాట్ ప్రారంభించండి",
  chatPlaceholder: "పంటలు, వ్యాధులు, ఎరువుల గురించి అడగండి...",
  chatSend: "పంపు",
  chatNewChat: "కొత్త చాట్",
  chatGuestMode: "అతిథి మోడ్",
  chatSignUpToSave: "సేవ్ చేయడానికి సైన్ అప్",
  chatStartConversation: "సంభాషణ ప్రారంభించండి",
  chatStartDesc: "పంటలు, వ్యాధులు, మార్కెట్ ధరలు లేదా ప్రభుత్వ పథకాల గురించి అడగండి.",
  chatWelcome: "నమస్తే! నేను కిసాన్ సహాయక్ AI",
  chatWelcomeDesc: "వ్యవసాయం, పంటలు, వ్యాధులు, లేదా ప్రభుత్వ పథకాల గురించి ఏదైనా అడగండి.",
  chatSuggestions: [
    "పత్తిలో బాల్ వర్మ్ ఎలా నియంత్రించాలి?",
    "వరికి ఉత్తమ ఎరువు ఏమిటి?",
    "PM-KISAN పథకం వివరాలు చెప్పండి",
    "టమాటా వ్యాధి లక్షణాలు మరియు చికిత్స",
  ],
  chatViewHistory: "పూర్తి చరిత్ర చూడండి",
  chatNoConversations: "ఇంకా సంభాషణలు లేవు",
  chatLoading: "లోడ్ అవుతోంది...",
  chatErrAi: "AI సేవ బిజీగా ఉంది. దయచేసి కొద్దిసేపు తర్వాత మళ్ళీ ప్రయత్నించండి.",
  chatErrNetwork: "నెట్‌వర్క్ లోపం. దయచేసి మీ కనెక్షన్ తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.",
  chatListening: "వింటున్నాను...",
  chatVoiceNotSupported: "ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ మద్దతు లేదు.",
  chatSpeak: "ఈ జవాబు వినండి",
  loginTitle: "కిసాన్ సహాయక్ AI లో సైన్ ఇన్",
  loginTagline: "మీ వ్యవసాయ సహాయకుడు వేచి ఉన్నాడు",
  loginEmail: "ఇమెయిల్ చిరునామా",
  loginPassword: "పాస్‌వర్డ్",
  loginSubmit: "సైన్ ఇన్",
  loginLoading: "సైన్ ఇన్ అవుతోంది...",
  loginNoAccount: "కిసాన్ సహాయక్ AI కి కొత్తవారా?",
  loginCreateAccount: "ఖాతా సృష్టించండి",
  registerTitle: "కిసాన్ సహాయక్ AI లో చేరండి",
  registerTagline: "మీ రైతు ఖాతా సృష్టించండి",
  registerName: "పూర్తి పేరు",
  registerEmail: "ఇమెయిల్ చిరునామా",
  registerPassword: "పాస్‌వర్డ్",
  registerLang: "ఇష్టమైన భాష",
  registerSubmit: "ఖాతా సృష్టించండి",
  registerLoading: "ఖాతా సృష్టిస్తోంది...",
  registerHaveAccount: "ఇప్పటికే ఖాతా ఉందా?",
  registerSignIn: "సైన్ ఇన్",
  faqTitle: "తరచుగా అడిగే ప్రశ్నలు",
  faqSubtitle: "సాధారణ వ్యవసాయ ప్రశ్నలకు సమాధానాలు",
  marketTitle: "వ్యవసాయ డ్యాష్‌బోర్డ్",
  marketSubtitle: "మార్కెట్ ధరలు, ప్రభుత్వ పథకాలు మరియు మౌసమీ సూచనలు",
  marketPrices: "నేటి మార్కెట్ ధరలు",
  marketSeasonalTips: "మౌసమీ సూచనలు",
  marketSchemes: "ప్రభుత్వ పథకాలు",
  marketLastUpdated: "చివరిగా నవీకరించబడింది",
  marketNoData: "డేటా అందుబాటులో లేదు",
  marketUpdatedOn: "నవీకరించబడింది",
  marketReadMore: "మరింత చదవండి",
  marketShowLess: "తక్కువ చూపించు",
  marketLearnMore: "మరింత తెలుసుకోండి →",
  settingsTitle: "సెట్టింగ్‌లు",
  settingsSubtitle: "మీ ఖాతా మరియు ప్రాధాన్యతలను నిర్వహించండి",
  settingsAccount: "ఖాతా",
  settingsName: "పూర్తి పేరు",
  settingsEmail: "ఇమెయిల్",
  settingsLang: "భాష",
  settingsTheme: "థీమ్",
  settingsThemeLight: "లైట్",
  settingsThemeDark: "డార్క్",
  settingsSave: "మార్పులు సేవ్ చేయండి",
  settingsSaving: "సేవ్ అవుతోంది...",
  settingsSaved: "సేవ్ అయింది!",
  settingsLogout: "సైన్ అవుట్",
  langEn: "English",
  langHi: "हिंदी",
  langTe: "తెలుగు",
  loading: "లోడ్ అవుతోంది...",
  noData: "డేటా అందుబాటులో లేదు",
  tryAgain: "మళ్ళీ ప్రయత్నించండి",
  per100kg: "100 కిలోలకు",
  perKg: "కిలోకు",
  notFound: "పేజీ కనుగొనబడలేదు",
  notFoundDesc: "మీరు వెతుకుతున్న పేజీ లేదు.",
  goHome: "హోమ్‌కి వెళ్ళండి",
  historyTitle: "చాట్ చరిత్ర",
  historySubtitle: "మీ గత సంభాషణలు",
  historyEmpty: "ఇంకా సంభాషణలు లేవు. చాటింగ్ ప్రారంభించండి!",
  historyNoAuth: "చాట్ చరిత్ర చూడటానికి సైన్ ఇన్ చేయండి.",
  favTitle: "ఇష్టమైన జవాబులు",
  favSubtitle: "మీరు సేవ్ చేసిన జవాబులు",
  favEmpty: "ఇంకా ఇష్టాలు లేవు. చాట్‌లో మెసేజ్‌కి స్టార్ చేసి ఇక్కడ సేవ్ చేయండి.",
  favNoAuth: "ఇష్టమైన జవాబులు చూడటానికి సైన్ ఇన్ చేయండి.",
  signInToAccess: "ఈ ఫీచర్ వాడటానికి సైన్ ఇన్ చేయండి.",
  signInBtn: "సైన్ ఇన్",
};

export const translations: Record<Lang, Translations> = { en, hi, te };

export function t(lang: Lang, key: keyof Translations): string {
  const val = translations[lang][key];
  return typeof val === "string" ? val : "";
}

export function tArr(lang: Lang, key: keyof Translations): string[] {
  const val = translations[lang][key];
  return Array.isArray(val) ? val : [];
}
