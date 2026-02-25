import Goal from "../models/Goal.js";

export const setUserGoal = async (userId, dailyTarget, weeklyTarget) => {
  if (!dailyTarget || !weeklyTarget) {
    throw new Error("Daily and weekly targets are required");
  }

  const updatedGoal = await Goal.findOneAndUpdate(
    { userId },
    { dailyTarget, weeklyTarget },
    { new: true, upsert: true }
  );

  return updatedGoal;
};

export const getUserGoal = async (userId) => {
  const goal = await Goal.findOne({ userId }).lean();

  if (!goal) {
    return {
      dailyTarget: 0,
      weeklyTarget: 0,
      goalConfigured: false
    };
  }

  return {
    ...goal,
    goalConfigured: true
  };
};