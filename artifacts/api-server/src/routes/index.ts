import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import chatRouter from "./chat";
import agricultureRouter from "./agriculture";
import faqRouter from "./faq";
import feedbackRouter from "./feedback";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(chatRouter);
router.use(agricultureRouter);
router.use(faqRouter);
router.use(feedbackRouter);

export default router;
