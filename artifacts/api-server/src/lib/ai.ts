import { openai } from "@workspace/integrations-openai-ai-server";
import { db, crops, diseases, seasonalTips } from "@workspace/db";

const SYSTEM_PROMPT_EN = `You are KrishiAI, an expert agriculture assistant helping Indian farmers. You have deep knowledge of:
- Crops, seeds, fertilizers, pesticides, and plant diseases
- Irrigation techniques and water management
- Seasonal crop recommendations for Indian climate zones
- Government agricultural schemes and subsidies
- Market prices and farming techniques
- Weather guidance and pest management

Guidelines:
- Give practical, step-by-step farming guidance
- For plant diseases, always describe: symptoms, causes, treatment, prevention
- Recommend crops based on season and region
- Suggest specific fertilizer/pesticide dosages and application methods
- If you're uncertain about something, clearly say so instead of guessing
- Keep responses concise but complete
- Use simple language farmers can understand`;

const SYSTEM_PROMPT_TE = `మీరు కృషిAI, భారతీయ రైతులకు సహాయం చేసే నిపుణ వ్యవసాయ సహాయకుడు. మీకు ఇవి బాగా తెలుసు:
- పంటలు, విత్తనాలు, ఎరువులు, పురుగుమందులు మరియు మొక్కల వ్యాధులు
- నీటిపారుదల పద్ధతులు మరియు నీటి నిర్వహణ
- భారత వాతావరణ మండలాలకు సీజనల్ పంట సిఫార్సులు
- ప్రభుత్వ వ్యవసాయ పథకాలు మరియు రాయితీలు
- మార్కెట్ ధరలు మరియు వ్యవసాయ పద్ధతులు

మార్గదర్శకాలు:
- ఆచరణాత్మక, దశల వారీ వ్యవసాయ మార్గదర్శకత్వం ఇవ్వండి
- మొక్కల వ్యాధులకు, ఎల్లప్పుడూ వివరించండి: లక్షణాలు, కారణాలు, చికిత్స, నివారణ
- సీజన్ మరియు ప్రాంతం ఆధారంగా పంటలను సూచించండి
- మీకు నిశ్చయం లేకపోతే, అంచనా వేయడం కాదు స్పష్టంగా చెప్పండి
- రైతులు అర్థం చేసుకోగలిగే సరళమైన భాష వాడండి`;

async function getRelevantContext(query: string): Promise<string> {
  const allCrops = await db.select().from(crops).limit(20);
  const allDiseases = await db.select().from(diseases).limit(10);
  const tips = await db.select().from(seasonalTips).limit(5);

  if (!allCrops.length && !allDiseases.length) return "";

  let context = "RELEVANT AGRICULTURAL DATABASE:\n";

  if (allCrops.length > 0) {
    context += "\nCROPS:\n";
    for (const crop of allCrops) {
      context += `- ${crop.name}: Season: ${crop.season}, Soil: ${crop.soilType}, Water: ${crop.waterRequirement}, Harvest: ${crop.harvestPeriod}\n`;
    }
  }

  if (allDiseases.length > 0) {
    context += "\nPLANT DISEASES:\n";
    for (const disease of allDiseases) {
      context += `- ${disease.name}: Affects ${disease.affectedCrops}. Symptoms: ${disease.symptoms}. Treatment: ${disease.treatment}\n`;
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
  const systemPrompt = language === "te" ? SYSTEM_PROMPT_TE : SYSTEM_PROMPT_EN;
  const fullSystem = context ? `${systemPrompt}\n\n${context}` : systemPrompt;

  const messages: ChatMessage[] = [
    { role: "system", content: fullSystem },
    ...history.slice(-10),
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1024,
    messages,
  });

  return response.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";
}
