export const calculateWeeklyPerformance = (stats) => {
  if (!stats || stats.length === 0) {
    return {
      completionRate: 0,
      category: "No Data"
    };
  }

  let totalTasks = 0;
  let completed = 0;

  stats.forEach(day => {
    totalTasks += day.totalTasks || 0;
    completed += day.completed || 0;
  });

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

  let category = "Distracted";

  if (completionRate >= 80) category = "Focused";
  else if (completionRate >= 50) category = "Average";

  return {
    completionRate,
    category
  };
};