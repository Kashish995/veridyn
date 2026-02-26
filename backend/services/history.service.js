// services/history.service.js

import DisciplineHistory from "../models/DisciplineHistory.js";
import DailyStats from "../models/DailyStats.js";
import { getTierFromCompletionRate } from "../utils/tier.util.js";

export const updateDailyDisciplineSnapshot = async (userId, date) => {
  const stats = await DailyStats.findOne({ userId, date });

  if (!stats) return;

  const { totalTasks, completed } = stats;

  if (totalTasks === 0) return;

  const completionRate = Number(
    ((completed / totalTasks) * 100).toFixed(2)
  );

  // You can evolve this formula later
  const disciplineScore = completionRate;

  const tier = getTierFromCompletionRate(completionRate);

  await DisciplineHistory.findOneAndUpdate(
    { userId, date },
    {
      userId,
      date,
      disciplineScore,
      completionRate,
      tier
    },
    { upsert: true, new: true }
  );
};