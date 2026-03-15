import express from "express";
import { 
  getAIRecommendations, 
  getAIExplanation, 
  getAI7DayPlan,
  getAIInsights,
  getRiskPrediction,
  getStudyPatterns,
  getTaskPrioritization,
  getWeeklyReport
} from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Phase 6 Endpoints
router.post("/recommendations", authMiddleware, getAIRecommendations);
router.post("/explain", authMiddleware, getAIExplanation);
router.post("/7day-plan", authMiddleware, getAI7DayPlan);

// Your existing insights endpoint
router.post("/insights", authMiddleware, getAIInsights);
router.post("/risk-prediction", authMiddleware, getRiskPrediction);

router.post("/study-patterns", authMiddleware, getStudyPatterns);
router.post("/task-prioritization", authMiddleware, getTaskPrioritization);
router.post("/weekly-report", authMiddleware, getWeeklyReport);

export default router;