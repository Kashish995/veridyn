import User from "../models/User.js";
import DailyStats from "../models/DailyStats.js";
import StreakHistory from "../models/StreakHistory.js";

export const checkAndPersistStreakBreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const todayStats = await DailyStats.findOne({
    userId,
    date: todayStr
  });

  const yesterdayStats = await DailyStats.findOne({
    userId,
    date: yesterdayStr
  });

  const todayCompleted = todayStats && todayStats.completed > 0;
  const yesterdayCompleted = yesterdayStats && yesterdayStats.completed > 0;

  // 🔹 Case 1: Today completed tasks → continue or start streak
  if (todayCompleted) {
    if (yesterdayCompleted) {
      // Continue streak
      user.currentStreak += 1;
    } else {
      // Start new streak
      user.currentStreak = 1;
      user.streakStartDate = todayStr;
    }

    await user.save();
    return;
  }

  // 🔹 Case 2: Today no completion → streak breaks
  if (!todayCompleted && user.currentStreak > 0) {
    await StreakHistory.create({
      userId,
      startDate: user.streakStartDate,
      endDate: yesterdayStr,
      length: user.currentStreak
    });

    user.currentStreak = 0;
    user.streakStartDate = null;
    await user.save();
  }
};