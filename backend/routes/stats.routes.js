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
  getPerformanceTrendController,
  getLongestStreak,
  getCalendarHeatmapController,
} from "../controllers/stats.controller.js";
import { getHistory } from "../controllers/stats.controller.js";
import { calculateStreaks } from "../utils/streakCalculator.js";

import Task from "../models/Task.js";
import DailyStats from "../models/DailyStats.js";
import StreakHistory from "../models/StreakHistory.js";

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
router.get("/calendar", authMiddleware, getCalendarHeatmapController);
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
router.get("/longest-streak", authMiddleware, getLongestStreak);

// Dashboard summary
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all necessary data
    const [tasks, dailyStats, streakData] = await Promise.all([
      Task.find({ user: userId }),
      DailyStats.find({ user: userId }).sort({ date: -1 }).limit(30),
      StreakHistory.findOne({ user: userId }).sort({ date: -1 })
    ]);

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const weeklyStats = dailyStats.slice(0, 7).map(d => ({
      date: d.date,
      disciplineScore: d.disciplineScore || 0,
      completionRate: d.completionRate || 0
    }));

    const history = dailyStats.map(d => ({
      date: d.date,
      disciplineScore: d.disciplineScore || 0
    }));

    // Calculate volatility (standard deviation of last 7 days)
    const scores = weeklyStats.map(w => w.disciplineScore);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const variance = scores.length > 0 ? scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length : 0;
    const volatility = Math.round(Math.sqrt(variance));

    res.success({
      weeklyStats,
      history,
      currentStreak: streakData?.currentStreak || 0,
      completionRate,
      volatility,
      totalTasks,
      completedTasks
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.fail('Failed to fetch dashboard stats');
  }
});

export default router;