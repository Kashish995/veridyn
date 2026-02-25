import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getWeeklyStats,
  getWeeklyPerformance,
  getInsights,
  getMonthlyPerformance
} from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/weekly", authMiddleware, getWeeklyStats);
router.get("/weekly-performance", authMiddleware, getWeeklyPerformance);
router.get("/insights", authMiddleware, getInsights);
router.get("/monthly", authMiddleware, getMonthlyPerformance);

export default router;