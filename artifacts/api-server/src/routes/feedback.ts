import { Router, type IRouter } from "express";
import { db, feedback } from "@workspace/db";
import { SubmitFeedbackBody, SubmitFeedbackResponse } from "@workspace/api-zod";
import { optionalAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/feedback", optionalAuth, async (req, res): Promise<void> => {
  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db.insert(feedback).values({
    userId: req.user?.id ?? null,
    messageId: parsed.data.messageId ?? null,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  });
  res.status(201).json(SubmitFeedbackResponse.parse({ success: true, message: "Feedback submitted" }));
});

export default router;
