import { Router, type IRouter } from "express";
import { db, faqItems } from "@workspace/db";
import { ListFaqResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/faq", async (_req, res): Promise<void> => {
  const rows = await db.select().from(faqItems).orderBy(faqItems.category, faqItems.id);
  res.json(ListFaqResponse.parse(rows.map((r) => ({
    id: r.id,
    question: r.question,
    questionTelugu: r.questionTelugu ?? null,
    answer: r.answer,
    answerTelugu: r.answerTelugu ?? null,
    category: r.category,
  }))));
});

export default router;
