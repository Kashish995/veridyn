import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getWeeklyStats,
  getWeeklyPerformance,
  getInsights
} from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/weekly", authMiddleware, getWeeklyStats);
router.get("/weekly-performance", authMiddleware, getWeeklyPerformance);
router.get("/insights", authMiddleware, getInsights);

export default router;