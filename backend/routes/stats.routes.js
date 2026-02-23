import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getMonthlyPerformance,
  getStreakAnalytics,
  getPerformanceInsights
} from "../controllers/stats.controller.js";

const router = express.Router();

// 30-day rolling performance
router.get("/monthly", authMiddleware, getMonthlyPerformance);

// historical + current streak
router.get("/streak", authMiddleware, getStreakAnalytics);

// full performance intelligence bundle
router.get("/performance", authMiddleware, getPerformanceInsights);

export default router;