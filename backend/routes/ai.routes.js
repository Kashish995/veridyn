import express from "express";
import { getAIInsights } from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/insights", authMiddleware, getAIInsights);

router.post("/insights", authMiddleware, (req,res,next)=>{
  console.log("AI ROUTE HIT");
  next();
}, getAIInsights);

export default router;