import * as performanceService from "../services/performanceService.js";

// GET /api/stats/monthly
export const getMonthlyPerformance = async (req, res, next) => {
  try {
    const result = await performanceService.get30DayPerformance(req.userId);
    return res.success(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/streak
export const getStreakAnalytics = async (req, res, next) => {
  try {
    const result = await performanceService.getStreakAnalytics(req.userId);
    return res.success(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/performance (full analytics bundle later)
export const getPerformanceInsights = async (req, res, next) => {
  try {
    const result = await performanceService.getPerformanceInsights(req.userId);
    return res.success(result);
  } catch (error) {
    next(error);
  }
};