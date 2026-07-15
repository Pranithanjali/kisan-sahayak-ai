import { Router, type IRouter } from "express";
import { eq, desc, count, sql } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import {
  CreateConversationBody,
  SendMessageBody,
  GetConversationParams,
  DeleteConversationParams,
  SendMessageParams,
  ToggleFavoriteMessageParams,
  SendGuestMessageBody,
  ListConversationsResponse,
  CreateConversationResponse,
  GetConversationResponse,
  DeleteConversationResponse,
  SendMessageResponse,
  ToggleFavoriteMessageResponse,
  ListFavoriteMessagesResponse,
  SendGuestMessageResponse,
} from "@workspace/api-zod";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import { generateAIResponse, analyzeImageWithAI, type ChatMessage } from "../lib/ai";

const router: IRouter = Router();

function formatMessage(msg: typeof messages.$inferSelect) {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    role: msg.role,
    content: msg.content,
    language: msg.language,
    isFavorited: msg.isFavorited,
    createdAt: msg.createdAt.toISOString(),
  };
}

router.get("/conversations", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  const rows = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      language: conversations.language,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
      messageCount: count(messages.id),
      lastMessageAt: sql<string | null>`MAX(${messages.createdAt})`,
    })
    .from(conversations)
    .leftJoin(messages, eq(messages.conversationId, conversations.id))
    .where(eq(conversations.userId, user.id))
    .groupBy(conversations.id)
    .orderBy(desc(conversations.updatedAt));

  res.json(ListConversationsResponse.parse(rows.map((r) => ({
    id: r.id,
    title: r.title,
    language: r.language,
    messageCount: Number(r.messageCount),
    lastMessageAt: r.lastMessageAt ? new Date(r.lastMessageAt).toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.post("/conversations", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const user = req.user!;
  const [conv] = await db
    .insert(conversations)
    .values({ userId: user.id, title: parsed.data.title, language: parsed.data.language ?? "en" })
    .returning();
  res.status(201).json(CreateConversationResponse.parse({
    id: conv.id,
    title: conv.title,
    language: conv.language,
    messageCount: 0,
    lastMessageAt: null,
    createdAt: conv.createdAt.toISOString(),
  }));
});

router.get("/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const user = req.user!;
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, params.data.id));
  if (!conv || conv.userId !== user.id) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(messages.createdAt);

  res.json(GetConversationResponse.parse({
    id: conv.id,
    title: conv.title,
    language: conv.language,
    createdAt: conv.createdAt.toISOString(),
    messages: msgs.map(formatMessage),
  }));
});

router.delete("/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const user = req.user!;
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, params.data.id));
  if (!conv || conv.userId !== user.id) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  await db.delete(conversations).where(eq(conversations.id, params.data.id));
  res.json(DeleteConversationResponse.parse({ success: true, message: "Conversation deleted" }));
});

router.post("/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const user = req.user!;
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, params.data.id));
  if (!conv || conv.userId !== user.id) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const lang = parsed.data.language ?? conv.language ?? "en";

  await db.insert(messages).values({
    conversationId: conv.id,
    role: "user",
    content: parsed.data.content,
    language: lang,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(messages.createdAt)
    .limit(20);

  const chatHistory: ChatMessage[] = history.slice(0, -1).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const aiContent = await generateAIResponse(parsed.data.content, chatHistory, lang);

  const [assistantMsg] = await db
    .insert(messages)
    .values({ conversationId: conv.id, role: "assistant", content: aiContent, language: lang })
    .returning();

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conv.id));

  res.json(SendMessageResponse.parse(formatMessage(assistantMsg)));
});

router.patch("/messages/:id/favorite", requireAuth, async (req, res): Promise<void> => {
  const params = ToggleFavoriteMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [msg] = await db.select().from(messages).where(eq(messages.id, params.data.id));
  if (!msg) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  const [updated] = await db
    .update(messages)
    .set({ isFavorited: !msg.isFavorited })
    .where(eq(messages.id, msg.id))
    .returning();
  res.json(ToggleFavoriteMessageResponse.parse(formatMessage(updated)));
});

router.get("/chat/favorites", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  const rows = await db
    .select({
      id: messages.id,
      content: messages.content,
      role: messages.role,
      conversationId: messages.conversationId,
      conversationTitle: conversations.title,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(sql`${messages.isFavorited} = true AND ${conversations.userId} = ${user.id}`)
    .orderBy(desc(messages.createdAt));

  res.json(ListFavoriteMessagesResponse.parse(rows.map((r) => ({
    id: r.id,
    content: r.content,
    role: r.role,
    conversationId: r.conversationId,
    conversationTitle: r.conversationTitle,
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.post("/chat/analyze-image", optionalAuth, async (req, res): Promise<void> => {
  const { imageBase64, imageUrl, question, language } = req.body as {
    imageBase64?: string;
    imageUrl?: string;
    question?: string;
    language?: string;
  };

  if (!imageBase64 && !imageUrl) {
    res.status(400).json({ error: "Either imageBase64 or imageUrl is required" });
    return;
  }

  const lang = language ?? "en";
  let imageData: string;

  if (imageBase64) {
    imageData = imageBase64;
  } else {
    try {
      const response = await fetch(imageUrl!);
      if (!response.ok) {
        res.status(400).json({ error: `Could not download image: HTTP ${response.status}` });
        return;
      }
      const contentType = response.headers.get("content-type") ?? "image/jpeg";
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      imageData = `data:${contentType};base64,${base64}`;
    } catch (err: any) {
      res.status(400).json({ error: `Failed to fetch image URL: ${err?.message}` });
      return;
    }
  }

  const content = await analyzeImageWithAI(imageData, question ?? "", lang);
  res.json({ content, language: lang });
});

router.post("/chat/guest", optionalAuth, async (req, res): Promise<void> => {
  const parsed = SendGuestMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const lang = parsed.data.language ?? "en";
  const history: ChatMessage[] = (parsed.data.history ?? []).map((h) => ({
    role: h.role as "user" | "assistant",
    content: h.content,
  }));
  const aiContent = await generateAIResponse(parsed.data.content, history, lang);
  res.json(SendGuestMessageResponse.parse({ content: aiContent, language: lang }));
});

export default router;
