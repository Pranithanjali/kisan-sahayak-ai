import { db, crops, diseases, seasonalTips } from "@workspace/db";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
  console.error("[AI] GROQ_API_KEY is not set. AI responses will fail.");
}

// Keep system prompts concise to preserve TPM budget
const SYSTEM_PROMPT_EN = `You are Kisan Sahayak AI, a helpful agriculture assistant for Indian farmers.
You know: crops, fertilizers, pesticides, plant diseases, irrigation, government schemes (PM-KISAN, PMFBY, KCC), market prices, and weather.
Rules: Give practical, step-by-step guidance. Use bullet points for lists. For diseases: symptoms, cause, treatment, prevention. Recommend government schemes when relevant. Be concise and clear. Use simple language.
Formatting: Use relevant emojis sparingly to make responses friendly (🌱 crops/seeds, 🌾 harvest, 💧 water/irrigation, 🐛 pests/disease, ☀️ weather, 🌿 organic, 💰 cost/market, 🏛️ government schemes). Use markdown headings (##) for sections, bold for key terms.`;

const SYSTEM_PROMPT_HI = `आप किसान सहायक AI हैं, भारतीय किसानों के लिए एक सहायक कृषि सहायक।
आप जानते हैं: फसलें, खाद, कीटनाशक, पौधों की बीमारियां, सिंचाई, सरकारी योजनाएं (PM-KISAN, PMFBY, KCC), बाजार भाव।
नियम: व्यावहारिक, चरण-दर-चरण मार्गदर्शन दें। सूची के लिए बुलेट पॉइंट। बीमारियों के लिए: लक्षण, कारण, उपचार, रोकथाम। सरल भाषा में।`;

const SYSTEM_PROMPT_TE = `మీరు కిసాన్ సహాయక్ AI, భారతీయ రైతులకు సహాయం చేసే వ్యవసాయ సహాయకుడు.
మీకు తెలుసు: పంటలు, ఎరువులు, పురుగుమందులు, వ్యాధులు, నీటిపారుదల, ప్రభుత్వ పథకాలు (PM-KISAN, PMFBY, KCC), మార్కెట్ ధరలు.
నియమాలు: ఆచరణాత్మక, దశల వారీ మార్గదర్శకత్వం. జాబితాలకు బుల్లెట్ పాయింట్లు. వ్యాధులకు: లక్షణాలు, కారణం, చికిత్స, నివారణ. సరళమైన భాష.`;

// Returns only the most relevant records to stay within TPM limits
async function getRelevantContext(userMessage: string): Promise<string> {
  const msg = userMessage.toLowerCase();

  // Only fetch context when message likely needs it
  const needsCropContext = /crop|seed|fertiliz|grow|plant|soil|season|sow|harvest|paddy|rice|wheat|cotton|maize|sugarcane|tomato|onion|potato|सोयाबीन|गेहूं|धान|పంట|విత్తనం/i.test(userMessage);
  const needsDiseaseContext = /disease|pest|insect|blight|wilt|rot|fungus|virus|symptom|spray|pesticide|bug|beetle|worm|రోగం|కీటకం|బీమారి|कीट|रोग/i.test(userMessage);
  const needsTipsContext = /tip|advice|suggest|season|kharif|rabi|zaid|సీజన్|सीजन/i.test(userMessage);

  const parts: string[] = [];

  if (needsCropContext) {
    const allCrops = await db.select().from(crops).limit(5);
    if (allCrops.length > 0) {
      parts.push("CROPS: " + allCrops.map(c =>
        `${c.name}: ${c.season} season, ${c.soilType} soil, water=${c.waterRequirement}, harvest=${c.harvestPeriod}`
      ).join("; "));
    }
  }

  if (needsDiseaseContext) {
    const allDiseases = await db.select().from(diseases).limit(4);
    if (allDiseases.length > 0) {
      parts.push("DISEASES: " + allDiseases.map(d =>
        `${d.name} (${d.affectedCrops}): symptoms=${d.symptoms}, treatment=${d.treatment}`
      ).join("; "));
    }
  }

  if (needsTipsContext) {
    const tips = await db.select().from(seasonalTips).limit(3);
    if (tips.length > 0) {
      parts.push("TIPS: " + tips.map(t => `${t.title}: ${t.content}`).join("; "));
    }
  }

  void msg; // suppress unused warning
  return parts.length > 0 ? "DATA: " + parts.join(" | ") : "";
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateAIResponse(
  userMessage: string,
  history: ChatMessage[],
  language: string = "en"
): Promise<string> {
  if (!GROQ_API_KEY) {
    return "AI is not configured. Please set the GROQ_API_KEY environment variable.";
  }

  const context = await getRelevantContext(userMessage);
  const systemPrompt =
    language === "te" ? SYSTEM_PROMPT_TE
    : language === "hi" ? SYSTEM_PROMPT_HI
    : SYSTEM_PROMPT_EN;

  const fullSystem = context ? `${systemPrompt}\n\n${context}` : systemPrompt;

  const messages = [
    { role: "system", content: fullSystem },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)  // keep last 6 messages (3 turns) to save tokens
      .map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await res.json() as any;

    if (!res.ok) {
      console.error("[AI] Groq error:", res.status, JSON.stringify(data));
      if (res.status === 429) {
        if (language === "hi") return "AI सेवा अभी व्यस्त है। कृपया 10 सेकंड बाद पुनः प्रयास करें।";
        if (language === "te") return "AI సేవ ప్రస్తుతం బిజీగా ఉంది. 10 సెకన్లు వేచి మళ్ళీ ప్రయత్నించండి.";
        return "AI is busy right now. Please wait a few seconds and try again.";
      }
      if (language === "hi") return `त्रुटि: ${data?.error?.message ?? res.status}। कृपया पुनः प्रयास करें।`;
      if (language === "te") return `లోపం: ${data?.error?.message ?? res.status}. మళ్ళీ ప్రయత్నించండి.`;
      return `AI error (${res.status}): ${data?.error?.message ?? "Unknown error"}`;
    }

    const text: string | undefined = data?.choices?.[0]?.message?.content;
    if (!text) {
      console.error("[AI] Empty Groq response:", JSON.stringify(data));
      if (language === "hi") return "क्षमा करें, उत्तर नहीं मिला। कृपया दोबारा पूछें।";
      if (language === "te") return "క్షమించండి, సమాధానం రాలేదు. మళ్ళీ అడగండి.";
      return "Sorry, no response was generated. Please try again.";
    }

    return text;
  } catch (error: any) {
    console.error("[AI] Fetch error:", error?.message);
    if (language === "hi") return "क्षमा करें, AI से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।";
    if (language === "te") return "క్షమించండి, AI తో కనెక్ట్ కాలేదు. మళ్ళీ ప్రయత్నించండి.";
    return `Connection error: ${error?.message ?? "Unknown"}. Please try again.`;
  }
}
