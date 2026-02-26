import DailyStats from "../models/DailyStats.js";
import { getTierFromCompletionRate } from "../utils/tier.util.js";
import DisciplineHistory from "../models/DisciplineHistory.js";
import StreakHistory from "../models/StreakHistory.js";
import {
  groupByMonth,
  calculateAverageCompletion,
  calculateDominantTier
} from "./aggregation.util.js";
export const getStreakAnalytics = async (userId) => {
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

export const getProductivityVolatility = async (userId) => {
  const today = new Date();
  const last30 = new Date();
  last30.setDate(today.getDate() - 29);

  const startDate = last30.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const stats = await DailyStats.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).lean();

  if (!stats.length) {
    return {
      volatilityScore: 0,
      stabilityLevel: "No Data"
    };
  }

  const rates = stats
    .filter(day => day.totalTasks > 0)
    .map(day => day.completed / day.totalTasks);

  if (!rates.length) {
    return {
      volatilityScore: 0,
      stabilityLevel: "No Active Days"
    };
  }

  const mean =
    rates.reduce((a, b) => a + b, 0) / rates.length;

  const variance =
    rates.reduce((sum, rate) =>
      sum + Math.pow(rate - mean, 2), 0
    ) / rates.length;

  const stdDev = Math.sqrt(variance);

  let stabilityLevel = "Stable";

  if (stdDev > 0.25) stabilityLevel = "Unstable";
  else if (stdDev > 0.12) stabilityLevel = "Moderate";

  return {
    volatilityScore: Number(stdDev.toFixed(4)),
    stabilityLevel
  };
};
export const detectBurnoutRisk = async (userId) => {
  const today = new Date();

  const last10 = new Date();
  last10.setDate(today.getDate() - 9); // we need 10 days

  const startDate = last10.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const stats = await DailyStats.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 }).lean();

  if (stats.length < 5) {
   return {
      burnoutRisk: false,
      last3DayAverage: 0,
      previous7DayAverage: 0,
      severity: "No Data"
    };
  }

  const validDays = stats
    .filter(day => day.totalTasks > 0)
    .map(day => ({
      date: day.date,
      rate: day.completed / day.totalTasks
    }));

  if (validDays.length < 5) {
   return {
  burnoutRisk: false,
  severity: "No Data",
  last3DayAverage: 0,
  previous7DayAverage: 0
};
  }

  const last3 = validDays.slice(-3);
  const previous7 = validDays.slice(-10, -3);

  const last3Avg =
    last3.reduce((sum, d) => sum + d.rate, 0) / last3.length;

  const prev7Avg =
    previous7.length > 0
      ? previous7.reduce((sum, d) => sum + d.rate, 0) / previous7.length
      : 0;

  const burnoutRisk =
    last3Avg < 0.5 && prev7Avg >= 0.65;

  return {
    burnoutRisk,
    last3DayAverage: Number(last3Avg.toFixed(2)),
    previous7DayAverage: Number(prev7Avg.toFixed(2)),
    severity: burnoutRisk
      ? last3Avg < 0.3
        ? "High"
        : "Moderate"
      : "Stable"
  };
};

export const getWeeklyStats = async (userId) => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const startDate = sevenDaysAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const stats = await DailyStats.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 }).lean();

  return stats || [];
};
export const getWeeklyPerformance = async (userId) => {
  const stats = await getWeeklyStats(userId);

  if (!stats.length) {
    return {
      completionRate: 0,
      category: "No Data"
    };
  }

  let totalTasks = 0;
  let completed = 0;

  for (const day of stats) {
    totalTasks += day.totalTasks || 0;
    completed += day.completed || 0;
  }

  if (totalTasks === 0) {
    return {
      completionRate: 0,
      category: "No Data"
    };
  }

  const rate = (completed / totalTasks) * 100;

  let category = "Distracted";

  if (rate >= 85) category = "Focused";
  else if (rate >= 60) category = "Average";

  return {
    completionRate: Number(rate.toFixed(1)),
    category
  };
};
export const getMonthlyPerformance = async (userId) => {
  const today = new Date();
  const last30 = new Date();
  last30.setDate(today.getDate() - 29);

  const startDate = last30.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const stats = await DailyStats.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).lean();

  if (!stats.length) {
    return {
      totalTasks: 0,
      completed: 0,
      missed: 0,
      completionRate: 0,
      averageDailyCompletion: 0,
      daysTracked: 0
    };
  }

  let totalTasks = 0;
  let completed = 0;
  let missed = 0;

  for (const day of stats) {
    totalTasks += day.totalTasks || 0;
    completed += day.completed || 0;
    missed += day.missed || 0;
  }

  const completionRate =
    totalTasks === 0 ? 0 : (completed / totalTasks) * 100;

  const averageDailyCompletion =
    completed / stats.length;

  return {
    totalTasks,
    completed,
    missed,
    completionRate: Number(completionRate.toFixed(1)),
    averageDailyCompletion: Number(averageDailyCompletion.toFixed(1)),
    daysTracked: stats.length
  };
};

export const getPerformanceTier = async (userId) => {
  const monthly = await getMonthlyPerformance(userId);

  const tier = getTierFromCompletionRate(monthly.completionRate);

  return {
    tier,
    completionRate: monthly.completionRate
  };
};
export const getFullInsights = async (userId) => {
  const monthly = await getMonthlyPerformance(userId);
  const weekly = await getWeeklyPerformance(userId);
  const volatility = await getProductivityVolatility(userId);
  const tier = await getPerformanceTier(userId);
  const burnout = await detectBurnoutRisk(userId);

  return {
    monthly,
    weekly,
    volatility,
    tier,
    burnout
  };
};
export const getMonthlyAggregate = async (userId) => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const startDate = monthStart.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const history = await DisciplineHistory.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).lean();

  if (!history.length) {
    return {
      month: startDate.slice(0, 7),
      averageCompletionRate: 0,
      averageDisciplineScore: 0,
      dominantTier: "No Data",
      daysTracked: 0
    };
  }

  const totalCompletion = history.reduce(
    (sum, day) => sum + day.completionRate,
    0
  );

  const totalScore = history.reduce(
    (sum, day) => sum + day.disciplineScore,
    0
  );

  const tierCount = {};

  history.forEach(day => {
    tierCount[day.tier] = (tierCount[day.tier] || 0) + 1;
  });

  const dominantTier = Object.keys(tierCount).reduce((a, b) =>
    tierCount[a] > tierCount[b] ? a : b
  );

  return {
    month: startDate.slice(0, 7),
    averageCompletionRate: Number(
      (totalCompletion / history.length).toFixed(1)
    ),
    averageDisciplineScore: Number(
      (totalScore / history.length).toFixed(1)
    ),
    dominantTier,
    daysTracked: history.length
  };
};
export const getDisciplineHistory = async (userId) => {
  const history = await DisciplineHistory.find({ userId })
    .sort({ date: 1 })
    .lean();

  return history.map(day => ({
    date: day.date,
    completionRate: day.completionRate,
    disciplineScore: day.disciplineScore,
    tier: day.tier
  }));
};
export const getStreakRecords = async (userId) => {
  const records = await StreakHistory.find({ userId })
    .sort({ startDate: -1 })
    .lean();

  if (!records.length) {
    return {
      longestRecordedStreak: 0,
      totalCompletedStreaks: 0,
      records: []
    };
  }

  const longest = Math.max(...records.map(r => r.length));

  return {
    longestRecordedStreak: longest,
    totalCompletedStreaks: records.length,
    records
  };
};
export const getTierProgression = async (userId) => {
 const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

const startDate = oneYearAgo.toISOString().split("T")[0];

const history = await DisciplineHistory.find({
  userId,
  date: { $gte: startDate }
}).lean();

  if (!history.length) return [];

  const grouped = groupByMonth(history);

  return Object.keys(grouped)
    .sort()
    .map(month => ({
      month,
      averageCompletionRate: calculateAverageCompletion(grouped[month]),
      dominantTier: calculateDominantTier(grouped[month])
    }));
};
export const getPerformanceTrend = async (userId) => {
  const progression = await getTierProgression(userId);

  if (progression.length < 2) {
    return {
      trendDirection: "Insufficient Data",
      averageMonthlyGrowth: 0,
      projectedNextMonthCompletion: 0
    };
  }

  const rates = progression.map(p => p.averageCompletionRate);

  let totalGrowth = 0;

  for (let i = 1; i < rates.length; i++) {
    totalGrowth += (rates[i] - rates[i - 1]);
  }

  const avgGrowth = totalGrowth / (rates.length - 1);

  const lastMonthRate = rates[rates.length - 1];
  const projected = lastMonthRate + avgGrowth;

  let trendDirection = "Stable";

  if (avgGrowth > 2) trendDirection = "Improving";
  else if (avgGrowth < -2) trendDirection = "Declining";

  return {
    trendDirection,
    averageMonthlyGrowth: Number(avgGrowth.toFixed(1)),
    projectedNextMonthCompletion: Number(projected.toFixed(1))
  };
};
export const calculateBehavioralAdjustment = async (userId) => {
  const volatility = await getProductivityVolatility(userId);
  const burnout = await detectBurnoutRisk(userId);

  let adjustment = 0;

  // Penalize instability
  if (volatility.volatilityScore > 0.25) {
    adjustment -= 3;
  } else if (volatility.volatilityScore > 0.12) {
    adjustment -= 1;
  }

  // Penalize burnout
  if (burnout.burnoutRisk) {
    adjustment -= 5;
  }

  return adjustment;
};