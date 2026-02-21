import DailyStats from "../models/DailyStats.js";
import { calculateWeeklyPerformance } from "../services/analyticsService.js";

export const getWeeklyStats = async (req, res) => {
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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch weekly stats",
      data: null,
      error: error.message
    });
  }
};
export const getWeeklyPerformance = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await DailyStats.find({
      userId: req.userId,
      date: { $gte: sevenDaysAgo.toISOString().split("T")[0] }
    });

    if (!stats || stats.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No weekly data",
        data: {
          completionRate: 0,
          category: "No Data"
        },
        error: null
      });
    }

    let totalTasks = 0;
    let totalCompleted = 0;

    stats.forEach(day => {
      totalTasks += day.totalTasks || 0;
      totalCompleted += day.completed || 0;
    });

    const completionRate =
      totalTasks === 0
        ? 0
        : Math.round((totalCompleted / totalTasks) * 100);

    let category = "Distracted";

    if (completionRate >= 80) category = "Focused";
    else if (completionRate >= 50) category = "Average";

    return res.status(200).json({
      success: true,
      message: "Weekly performance calculated",
      data: {
        completionRate,
        category
      },
      error: null
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate weekly performance",
      data: null,
      error: error.message
    });
  }
};