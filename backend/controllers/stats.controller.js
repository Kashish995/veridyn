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