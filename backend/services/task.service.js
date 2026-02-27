// backend/services/task.service.js

import Task from "../models/Task.js";
import DailyStats from "../models/DailyStats.js";
import DisciplineHistory from "../models/DisciplineHistory.js";
import { getPerformanceTier } from "./performanceService.js";
import { checkAndPersistStreakBreak } from "./streak.service.js";

/* =========================================================
   CREATE TASK
========================================================= */
export const createTask = async (taskData, userId) => {
  const today = new Date().toISOString().split("T")[0];

  const task = await Task.create({
    ...taskData,
    userId,
    date: today
  });

  // Optional: Keep DailyStats roughly in sync during day
  await DailyStats.findOneAndUpdate(
    { userId, date: today },
    {
      $inc: { totalTasks: 1 },
      $setOnInsert: { completed: 0, missed: 0 }
    },
    { upsert: true }
  );

  return task;
};

/* =========================================================
   COMPLETE TASK
========================================================= */
export const completeTask = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, userId });

  if (!task) {
    throw new Error("Task not found");
  }

  if (!task.completed) {
    task.completed = true;
    await task.save();

    const today = new Date().toISOString().split("T")[0];

    await DailyStats.findOneAndUpdate(
      { userId, date: today },
      {
        $inc: { completed: 1 },
        $setOnInsert: { totalTasks: 0, missed: 0 }
      },
      { upsert: true }
    );
  }

  return task;
};

/* =========================================================
   END DAY (PHASE 3 CORE LOGIC)
========================================================= */
export const endDay = async (userId) => {
  const today = new Date().toISOString().split("T")[0];

  const tasks = await Task.find({ userId, date: today });

  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const missed = totalTasks - completed;

  // Persist DailyStats (final authoritative write)
  await DailyStats.findOneAndUpdate(
    { userId, date: today },
    { totalTasks, completed, missed },
    { upsert: true }
  );

  // Calculate discipline metrics
  const completionRate =
    totalTasks === 0 ? 0 : (completed / totalTasks) * 100;

  const disciplineScore = Math.round(completionRate);

  const tier = getPerformanceTier(completionRate);

  // Persist historical discipline snapshot
  await DisciplineHistory.findOneAndUpdate(
    { userId, date: today },
    {
      completionRate,
      disciplineScore,
      tier
    },
    { upsert: true }
  );

  // Update streak AFTER final numbers are known
  await checkAndPersistStreakBreak(userId);

  return {
    totalTasks,
    completed,
    missed,
    completionRate: Number(completionRate.toFixed(2)),
    disciplineScore,
    tier
  };
};