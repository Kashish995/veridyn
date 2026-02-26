import { calculateBehavioralAdjustment } from "./performanceService.js";

export const calculateDisciplineChange = async ({
  tasks,
  currentScore,
  currentStreak,
  userId
}) => {

  if (!tasks || tasks.length === 0) {
    return {
      newScore: currentScore,
      newStreak: 0
    };
  }

  let weightedTotal = 0;
  let weightedCompleted = 0;
  let missedCount = 0;

  const weights = {
    high: 1.5,
    medium: 1,
    low: 0.7
  };

  tasks.forEach(task => {
    const weight = weights[task.priority] || 1;

    weightedTotal += weight;

    if (task.status === "completed") {
      weightedCompleted += weight;
    }

    if (task.status === "missed") {
      missedCount++;
    }
  });

  const completionRate =
    weightedTotal === 0
      ? 0
      : weightedCompleted / weightedTotal;

  let scoreChange = 0;

  // Base completion impact
  scoreChange += Math.round((completionRate - 0.5) * 20);

  // Zero productivity penalty
  if (weightedCompleted === 0 && weightedTotal > 0) {
    scoreChange -= 5;
  }

  // Miss penalty
  scoreChange -= missedCount * 2;

  // Clamp daily swing
  if (scoreChange > 10) scoreChange = 10;
  if (scoreChange < -10) scoreChange = -10;

  let newScore = currentScore + scoreChange;

  // Streak logic
  let newStreak = currentStreak;

  if (missedCount === 0 && weightedCompleted > 0) {
    newStreak += 1;
    newScore += Math.min(newStreak, 5); // capped streak bonus
  } else {
    newStreak = 0;
  }

  /* =========================
     Behavioral Adjustment v2
  ========================= */

  const behavioralAdjustment =
    await calculateBehavioralAdjustment(userId);

  newScore += behavioralAdjustment;

  /* =========================
     Final Clamp
  ========================= */

  newScore = Math.max(0, Math.min(100, newScore));

  return {
    newScore,
    newStreak
  };
};