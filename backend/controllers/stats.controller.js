import * as performanceService from "../services/performanceService.js";

export const getWeeklyStats = async (req, res, next) => {
  try {
    const stats = await performanceService.getWeeklyStats(req.userId);
    return res.success(stats);
  } catch (error) {
    next(error);
  }
};
// GET /api/stats/weekly-performance
export const getWeeklyPerformance = async (req, res, next) => {
  try {
    const performance =
      await performanceService.getWeeklyPerformance(req.userId);

    return res.success(performance);
  } catch (error) {
    next(error);
  }
};
// GET /api/stats/insights
export const getInsights = async (req, res) => {
  return res.success({
    trend: "Stable",
    riskLevel: "Low",
    feedback: "No sufficient data yet.",
    recommendation: "Start completing tasks to generate insights."
  });
};
export const getMonthlyPerformance = async (req, res, next) => {
  try {
    const result =
      await performanceService.getMonthlyPerformance(req.userId);

    return res.success(result);
  } catch (error) {
    next(error);
  }
};