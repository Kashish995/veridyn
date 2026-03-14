import express from "express";
import { 
  getAIRecommendations, 
  getAIExplanation, 
  getAI7DayPlan,
  getAIInsights 
} from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Phase 6 Endpoints
router.post("/recommendations", authMiddleware, getAIRecommendations);
router.post("/explain", authMiddleware, getAIExplanation);
router.post("/7day-plan", authMiddleware, getAI7DayPlan);

// Your existing insights endpoint
router.post("/insights", authMiddleware, getAIInsights);

export default router;