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

const router = express.Router();

// Auth already applied via server.js — no double middleware here

router.post("/recommendations",   getRecommendations);
router.post("/explain",           getExplanation);
router.post("/7day-plan",         get7DayPlan);
router.post("/insights",          getInsights);
router.post("/risk-prediction",   getRiskPrediction);
router.post("/study-patterns",    getStudyPatterns);
router.post("/task-prioritization", getTaskPrioritization);
router.post("/weekly-report",     getWeeklyReport);
router.post("/chat",              chat);

export default router;
