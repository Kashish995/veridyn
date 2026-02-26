import * as performanceService from "../services/performanceService.js";
import { getMonthlyAggregate } from "../services/performanceService.js";

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
export const getInsights = async (req, res, next) => {
  try {
    const insights =
      await performanceService.getFullInsights(req.userId);

    return res.success(insights);
  } catch (error) {
    next(error);
  }
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
export const getMonthlyAggregateController = async (req, res, next) => {
  try {
    const data = await getMonthlyAggregate(req.user.id);
    res.success(data);
  } catch (error) {
    next(error);
  }
};