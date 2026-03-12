import DisciplineHistory from "../models/DisciplineHistory.js";
import { calculateStreaks } from "../utils/streakCalculator.js";
import mongoose from "mongoose";

export const getUserAnalyticsForAI = async (userId) => {

  const objectUserId = new mongoose.Types.ObjectId(userId);

  const history = await DisciplineHistory
    .find({ userId: objectUserId })
    .sort({ date: -1 })
    .limit(30);

  console.log("UserId used in query:", objectUserId);
  console.log("History found:", history);

  if (!history.length) return null;

  const latest = history[0];

  const scores = history.map(item => item.disciplineScore);

  const avgScore =
    scores.reduce((a, b) => a + b, 0) / scores.length;

  const { currentStreak, longestStreak } =
    calculateStreaks(history);

  return {
    disciplineScore: latest.disciplineScore,
    completionRate: latest.completionRate,
    tier: latest.tier,
    monthlyAverage: avgScore.toFixed(2),
    currentStreak,
    longestStreak,
    history: scores
  };
};