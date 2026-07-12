import { openai } from "@workspace/integrations-openai-ai-server";
import { db, crops, diseases, seasonalTips } from "@workspace/db";

const SYSTEM_PROMPT_EN = `You are Kisan Sahayak AI, an expert agriculture assistant helping Indian farmers. You have deep knowledge of:
- Crops, seeds, fertilizers, pesticides, and plant diseases
- Irrigation techniques and water management
- Seasonal crop recommendations for Indian climate zones
- Government agricultural schemes and subsidies (PM-KISAN, PMFBY, KCC, etc.)
- Market prices and farming techniques
- Weather guidance and pest management

Guidelines:
- Give practical, step-by-step farming guidance
- For plant diseases, always describe: symptoms, causes, treatment, prevention
- Recommend crops based on season and region
- Suggest specific fertilizer/pesticide dosages and application methods
- Mention government schemes relevant to the farmer's question
- If uncertain, clearly say so instead of guessing
- Keep responses concise but complete with clear sections
- Use simple language farmers can understand
- Format with bullet points or numbered steps when listing items`;

const SYSTEM_PROMPT_HI = `आप किसान सहायक AI हैं, भारतीय किसानों की मदद करने वाले कृषि विशेषज्ञ। आपको इन विषयों का गहरा ज्ञान है:
- फसलें, बीज, खाद, कीटनाशक और पौधों की बीमारियां
- सिंचाई तकनीक और जल प्रबंधन
- भारतीय जलवायु क्षेत्रों के लिए मौसमी फसल की सिफारिशें
- सरकारी कृषि योजनाएं और सब्सिडी (PM-KISAN, PMFBY, KCC आदि)
- बाजार भाव और खेती की तकनीकें
- मौसम मार्गदर्शन और कीट प्रबंधन

दिशानिर्देश:
- व्यावहारिक, चरण-दर-चरण खेती मार्गदर्शन दें
- पौधों की बीमारियों के लिए हमेशा बताएं: लक्षण, कारण, उपचार, रोकथाम
- मौसम और क्षेत्र के आधार पर फसलें सुझाएं
- विशिष्ट खाद/कीटनाशक खुराक और उपयोग के तरीके बताएं
- सरकारी योजनाओं का उल्लेख करें जो किसान के प्रश्न से संबंधित हों
- यदि अनिश्चित हों तो स्पष्ट रूप से कहें, अनुमान न लगाएं
- किसानों के लिए सरल भाषा में उत्तर दें
- सूची बनाते समय बुलेट पॉइंट या क्रमांकित चरणों का उपयोग करें`;

const SYSTEM_PROMPT_TE = `మీరు కిసాన్ సహాయక్ AI, భారతీయ రైతులకు సహాయం చేసే నిపుణ వ్యవసాయ సహాయకుడు. మీకు ఇవి బాగా తెలుసు:
- పంటలు, విత్తనాలు, ఎరువులు, పురుగుమందులు మరియు మొక్కల వ్యాధులు
- నీటిపారుదల పద్ధతులు మరియు నీటి నిర్వహణ
- భారత వాతావరణ మండలాలకు సీజనల్ పంట సిఫార్సులు
- ప్రభుత్వ వ్యవసాయ పథకాలు మరియు రాయితీలు (PM-KISAN, PMFBY, KCC మొదలైనవి)
- మార్కెట్ ధరలు మరియు వ్యవసాయ పద్ధతులు
- వాతావరణ మార్గదర్శకత్వం మరియు చీడపురుగుల నిర్వహణ

మార్గదర్శకాలు:
- ఆచరణాత్మక, దశల వారీ వ్యవసాయ మార్గదర్శకత్వం ఇవ్వండి
- మొక్కల వ్యాధులకు, ఎల్లప్పుడూ వివరించండి: లక్షణాలు, కారణాలు, చికిత్స, నివారణ
- సీజన్ మరియు ప్రాంతం ఆధారంగా పంటలను సూచించండి
- నిర్దిష్ట ఎరువు/పురుగుమందు మోతాదులు మరియు వాడే పద్ధతులు చెప్పండి
- రైతు ప్రశ్నకు సంబంధించిన ప్రభుత్వ పథకాలను ప్రస్తావించండి
- నిశ్చయం లేకపోతే స్పష్టంగా చెప్పండి, అంచనా వేయకండి
- రైతులు అర్థం చేసుకోగలిగే సరళమైన భాష వాడండి
- జాబితా చేసేటప్పుడు బుల్లెట్ పాయింట్లు లేదా నంబర్ చేసిన దశలు వాడండి`;

async function getRelevantContext(query: string): Promise<string> {
  const allCrops = await db.select().from(crops).limit(20);
  const allDiseases = await db.select().from(diseases).limit(10);
  const tips = await db.select().from(seasonalTips).limit(5);

  if (!allCrops.length && !allDiseases.length) return "";

  let context = "RELEVANT AGRICULTURAL DATABASE:\n";

  if (allCrops.length > 0) {
    context += "\nCROPS:\n";
    for (const crop of allCrops) {
      context += `- ${crop.name}${crop.nameTelugu ? ` (${crop.nameTelugu})` : ""}: Season: ${crop.season}, Soil: ${crop.soilType}, Water: ${crop.waterRequirement}, Growing: ${crop.growingConditions}, Harvest: ${crop.harvestPeriod}\n`;
    }
  }

  if (allDiseases.length > 0) {
    context += "\nPLANT DISEASES:\n";
    for (const disease of allDiseases) {
      context += `- ${disease.name}: Affects ${disease.affectedCrops}. Symptoms: ${disease.symptoms}. Treatment: ${disease.treatment}. Prevention: ${disease.prevention ?? "N/A"}\n`;
    }
  }

  if (tips.length > 0) {
    context += "\nSEASONAL TIPS:\n";
    for (const tip of tips) {
      context += `- ${tip.title} (${tip.season}): ${tip.content}\n`;
    }
  }

  return context;
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
  const context = await getRelevantContext(userMessage);
  const systemPrompt =
    language === "te"
      ? SYSTEM_PROMPT_TE
      : language === "hi"
      ? SYSTEM_PROMPT_HI
      : SYSTEM_PROMPT_EN;

  const fullSystem = context ? `${systemPrompt}\n\n${context}` : systemPrompt;

  const messages: ChatMessage[] = [
    { role: "system", content: fullSystem },
    ...history.slice(-10),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages,
    });

    return (
      response.choices[0]?.message?.content ??
      "I'm sorry, I couldn't generate a response. Please try again."
    );
  } catch (error: any) {
    console.error("[AI] OpenAI error:", JSON.stringify({
      status: error?.status,
      code: error?.code,
      message: error?.message,
      type: error?.type,
    }));
    if (error?.status === 429 || error?.code === "insufficient_quota") {
      if (language === "hi") return "AI सेवा अभी व्यस्त है। कृपया कुछ देर बाद पुनः प्रयास करें।";
      if (language === "te") return "AI సేవ ప్రస్తుతం బిజీగా ఉంది. దయచేసి కొద్దిసేపు తర్వాత మళ్ళీ ప్రయత్నించండి.";
      return "AI service is currently busy. Please try again in a moment.";
    }
    if (language === "hi") return "क्षमा करें, आपके अनुरोध को संसाधित करने में समस्या हुई। कृपया पुनः प्रयास करें।";
    if (language === "te") return "క్షమించండి, మీ అభ్యర్థనను ప్రాసెస్ చేయడంలో సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.";
    return `Error: ${error?.message ?? "Unknown error"}. Please try again.`;
  }
}
