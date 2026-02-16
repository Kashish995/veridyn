import DailyStats from "../models/DailyStats.js";

export const getWeeklyStats = async (req, res) => {
  try {
    const userId = req.userId;

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const stats = await DailyStats.find({
      userId,
      date: {
        $gte: sevenDaysAgo.toISOString().split("T")[0],
      },
    }).sort({ date: 1 });

    res.json(stats);
  } catch (err) {
    console.error("Weekly stats error:", err);
    res.status(500).json({ message: err.message });
  }
};
