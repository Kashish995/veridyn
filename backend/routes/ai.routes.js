import express from "express";
import { 
  getRecommendations, 
  getExplanation, 
  get7DayPlan, 
  getInsights,
  getRiskPrediction,
  getStudyPatterns,
  getTaskPrioritization,
  getWeeklyReport,
  chat
} from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// AI Recommendations
router.post("/recommendations", authMiddleware, getRecommendations);

// AI Explanation
router.post("/explain", authMiddleware, getExplanation);

// 7-Day Plan
router.post("/7day-plan", authMiddleware, get7DayPlan);

// AI Insights
router.post("/insights", authMiddleware, getInsights);

// Risk Prediction
router.post("/risk-prediction", authMiddleware, getRiskPrediction);

// Study Patterns
router.post("/study-patterns", authMiddleware, getStudyPatterns);

// Task Prioritization
router.post("/task-prioritization", authMiddleware, getTaskPrioritization);

// Weekly Report
router.post("/weekly-report", authMiddleware, getWeeklyReport);

// AI Chat
router.post("/chat", authMiddleware, chat);

export default router;