const DailyStats = require("../models/DailyStats");

exports.getStreakAnalytics = async (userId) => {
  const stats = await DailyStats.find({ userId })
    .sort({ date: 1 }) // ascending order
    .lean();

  if (!stats.length) {
    return {
      longestStreak: 0,
      currentStreak: 0,
      streakStartDate: null,
      streakEndDate: null
    };
  }

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStart = null;
  let longestStart = null;
  let longestEnd = null;

  for (let i = 0; i < stats.length; i++) {
    const day = stats[i];

    const isValidDay =
      day.totalTasks > 0 &&
      day.completed === day.totalTasks;

    if (isValidDay) {
      currentStreak++;

      if (currentStreak === 1) {
        tempStart = day.date;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestStart = tempStart;
        longestEnd = day.date;
      }
    } else {
      currentStreak = 0;
    }
  }

  // Calculate real current streak (from latest backwards)
  let realCurrentStreak = 0;

  for (let i = stats.length - 1; i >= 0; i--) {
    const day = stats[i];

    const isValidDay =
      day.totalTasks > 0 &&
      day.completed === day.totalTasks;

    if (isValidDay) {
      realCurrentStreak++;
    } else {
      break;
    }
  }

  return {
    longestStreak,
    currentStreak: realCurrentStreak,
    streakStartDate: longestStart,
    streakEndDate: longestEnd
  };
};