import DailyStats from "../models/DailyStats.js";
import { calculateWeeklyPerformance } from "../services/analyticsService.js";
import { generateInsights } from "../services/insightService.js";

export const getWeeklyStats = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await DailyStats.find({
      userId: req.userId,
      date: { $gte: sevenDaysAgo.toISOString().split("T")[0] }
    });

    return res.status(200).json({
      success: true,
      message: "Weekly stats fetched",
      data: stats,
      error: null
    });

  } catch (error) {
  next(error);
}
};
export const getWeeklyPerformance = async (req, res, next) => {
  try {
    const performance = await calculateWeeklyPerformance(req.userId);

    return res.status(200).json({
      success: true,
      message: "Weekly performance calculated",
      data: performance,
      error: null
    });

  } catch (error) {
  next(error);
}
};
export const getInsights = async (req, res, next) => {
  try {
    const insights = await generateInsights(req.userId);

    return res.status(200).json({
      success: true,
      message: "Insights generated",
      data: insights,
      error: null
    });

  } catch (error) {
  next(error);
}
};