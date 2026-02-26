import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  getWeeklyStatsController,
  getWeeklyPerformanceController,
  getFullInsightsController,
  getMonthlyPerformanceController,
  getMonthlyAggregateController,
  getDisciplineHistoryController,
  getStreakRecordsController,
  getTierProgressionController,
  getPerformanceTrendController
} from "../controllers/stats.controller.js";
const router = express.Router();

// Weekly
router.get("/weekly", authMiddleware, getWeeklyStatsController);
router.get("/weekly-performance", authMiddleware, getWeeklyPerformanceController);

// Insights
router.get("/insights", authMiddleware, getFullInsightsController);

// Monthly
router.get("/monthly", authMiddleware, getMonthlyPerformanceController);
router.get("/monthly-aggregate", authMiddleware, getMonthlyAggregateController);

// Historical
router.get("/history", authMiddleware, getDisciplineHistoryController);
router.get("/streak-records", authMiddleware, getStreakRecordsController);

router.get(
  "/tier-progression",
  authMiddleware,
  getTierProgressionController
);
router.get(
  "/performance-trend",
  authMiddleware,
  getPerformanceTrendController
);
export default router;