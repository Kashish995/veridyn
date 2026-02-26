import DailyStats from "../models/DailyStats.js";
import StreakHistory from "../models/StreakHistory.js";

export const checkAndPersistStreakBreak = async (userId) => {
  const stats = await DailyStats.find({ userId })
    .sort({ date: -1 })
    .limit(2)
    .lean();

  if (stats.length < 2) return;

  const [latest, previous] = stats;

  const latestValid =
    latest.totalTasks > 0 &&
    latest.completed === latest.totalTasks;

  const previousValid =
    previous.totalTasks > 0 &&
    previous.completed === previous.totalTasks;

  // If previous day was streak-valid but latest is not → streak broke
  if (previousValid && !latestValid) {
    // Now calculate how long that streak was
    const allStats = await DailyStats.find({ userId })
      .sort({ date: 1 })
      .lean();

    let tempLength = 0;
    let startDate = null;
    let endDate = null;

    for (let i = 0; i < allStats.length; i++) {
      const day = allStats[i];

      const isValid =
        day.totalTasks > 0 &&
        day.completed === day.totalTasks;

      if (isValid) {
        if (tempLength === 0) {
          startDate = day.date;
        }

        tempLength++;
        endDate = day.date;
      } else {
        if (tempLength > 0) {
          await StreakHistory.create({
            userId,
            startDate,
            endDate,
            length: tempLength
          });
        }

        tempLength = 0;
      }
    }
  }
};