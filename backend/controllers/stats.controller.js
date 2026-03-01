import {
  getWeeklyStats,
  getWeeklyPerformance,
  getFullInsights,
  getMonthlyPerformance,
  getMonthlyAggregate,
  getStreakRecords,
  getTierProgression,
  getPerformanceTrend
} from "../services/performanceService.js";
import * as performanceService from "../services/performanceService.js";

/* =========================
   WEEKLY
========================= */

export const getWeeklyStatsController = async (req, res, next) => {
  try {
    const data = await getWeeklyStats(req.user.id);
    res.success(data);
  } catch (err) {
    next(err);
  }
};

export const getWeeklyPerformanceController = async (req, res, next) => {
  try {
    const data = await getWeeklyPerformance(req.user.id);
    res.success(data);
  } catch (err) {
    next(err);
  }
};

/* =========================
   INSIGHTS
========================= */

export const getFullInsightsController = async (req, res, next) => {
  try {
    const data = await getFullInsights(req.user.id);
    res.success(data);
  } catch (err) {
    next(err);
  }
};

/* =========================
   MONTHLY
========================= */

export const getMonthlyPerformanceController = async (req, res, next) => {
  try {
    const data = await getMonthlyPerformance(req.user.id);
    res.success(data);
  } catch (err) {
    next(err);
  }
};

export const getMonthlyAggregateController = async (req, res, next) => {
  try {
    const data = await getMonthlyAggregate(req.user.id);
    res.success(data);
  } catch (err) {
    next(err);
  }
};

/* =========================
   HISTORY
========================= */

export const getDisciplineHistoryController = async (req, res, next) => {
  try {
    const history = await performanceService.getDisciplineHistory(req.user.id);
    res.success(history);
  } catch (error) {
    next(error);
  }
};

export const getStreakRecordsController = async (req, res, next) => {
  try {
    const data = await getStreakRecords(req.user.id);
    res.success(data);
  } catch (err) {
    next(err);
  }
};

export const getTierProgressionController = async (req, res, next) => {
  try {
    const data = await getTierProgression(req.user.id);
    res.success(data);
  } catch (err) {
    next(err);
  }
};
export const getPerformanceTrendController = async (req, res, next) => {
  try {
    const data = await getPerformanceTrend(req.user.id);
    res.success(data);
  } catch (err) {
    next(err);
  }
};
export const getLongestStreak = async (req, res, next) => {
  try {
   const data = await performanceService.getLongestStreak(req.user.id);
    return res.success(data);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res) => {
  try {
    res.status(200).json({ message: "History working" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};