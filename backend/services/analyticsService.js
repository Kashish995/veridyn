import DailyStats from "../models/DailyStats.js";

export const calculateWeeklyPerformance = async (userId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stats = await DailyStats.find({
    userId,
    date: { $gte: sevenDaysAgo.toISOString().split("T")[0] }
  });

  if (!stats || stats.length === 0) {
    return {
      completionRate: 0,
      consistencyScore: 0,
      streakImpact: 0,
      category: "No Data"
    };
  }

  let totalTasks = 0;
  let totalCompleted = 0;
  let activeDays = 0;

  stats.forEach(day => {
    totalTasks += day.totalTasks || 0;
    totalCompleted += day.completed || 0;
    if ((day.completed || 0) > 0) activeDays++;
  });

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round((totalCompleted / totalTasks) * 100);

  const consistencyScore = Math.round((activeDays / 7) * 100);

  const streakImpact = Math.round(
    (completionRate * 0.7) + (consistencyScore * 0.3)
  );

  let category = "Distracted";

  if (streakImpact >= 80) category = "Focused";
  else if (streakImpact >= 50) category = "Average";

  return {
    completionRate,
    consistencyScore,
    streakImpact,
    category
  };
};