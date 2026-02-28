import {
  getWeeklyStats,
  getWeeklyPerformance,
  getFullInsights,
  getMonthlyPerformance,
  getMonthlyAggregate,
  getDisciplineHistory,
  getStreakRecords,
  getTierProgression,
  getPerformanceTrend
} from "../services/performanceService.js";

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
    const history = await getDisciplineHistory(req.userId);
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
    const data = await performanceService.getLongestStreak(req.userId);
    return res.success(data);
  } catch (error) {
    next(error);
  }
};