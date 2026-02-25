import DailyStats from "../models/DailyStats.js";

const todaySummaryMiddleware = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const stats = await DailyStats.findOne({
      userId: req.userId,
      date: today
    }).lean();

    if (!stats) {
      req.todaySummary = {
        totalTasks: 0,
        completed: 0,
        missed: 0,
        completionRate: 0
      };
      return next();
    }

    const completionRate =
      stats.totalTasks > 0
        ? stats.completed / stats.totalTasks
        : 0;

    req.todaySummary = {
      totalTasks: stats.totalTasks,
      completed: stats.completed,
      missed: stats.missed,
      completionRate
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default todaySummaryMiddleware;