import DailyStats from "../models/DailyStats.js";

export const generateInsights = async (userId) => {
  const last14Days = new Date();
  last14Days.setDate(last14Days.getDate() - 14);

  const stats = await DailyStats.find({
    userId,
    date: { $gte: last14Days.toISOString().split("T")[0] }
  }).sort({ date: 1 });

  if (!stats || stats.length < 7) {
    return {
      trend: "Insufficient Data",
      riskLevel: "Unknown",
      feedback: "Not enough data to analyze behavior.",
      recommendation: "Keep logging tasks daily."
    };
  }

  const mid = Math.floor(stats.length / 2);

  const firstHalf = stats.slice(0, mid);
  const secondHalf = stats.slice(mid);

  const calcRate = (arr) => {
    let total = 0;
    let completed = 0;
    arr.forEach(day => {
      total += day.totalTasks || 0;
      completed += day.completed || 0;
    });
    return total === 0 ? 0 : completed / total;
  };

  const firstRate = calcRate(firstHalf);
  const secondRate = calcRate(secondHalf);

  let trend = "Stable";

  if (secondRate > firstRate + 0.1) trend = "Improving";
  if (secondRate < firstRate - 0.1) trend = "Declining";

  let riskLevel = "Low";

  if (secondRate < 0.4) riskLevel = "High";
  else if (secondRate < 0.7) riskLevel = "Medium";

  let feedback = "";
  let recommendation = "";

  if (trend === "Improving") {
    feedback = "Your consistency is improving steadily.";
    recommendation = "Maintain streak momentum and increase challenge gradually.";
  } else if (trend === "Declining") {
    feedback = "Your productivity is trending downward.";
    recommendation = "Reduce daily goal slightly and focus on high-priority tasks.";
  } else {
    feedback = "Your performance is stable.";
    recommendation = "Introduce one additional high-priority task for growth.";
  }

  return {
    trend,
    riskLevel,
    feedback,
    recommendation
  };
};