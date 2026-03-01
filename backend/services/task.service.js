import { getToday } from "../utils/date.util.js";
import Task from "../models/Task.js";
import DailyStats from "../models/DailyStats.js";
import DisciplineHistory from "../models/DisciplineHistory.js";
import { getPerformanceTier } from "./performanceService.js";
/* =========================================================
   CREATE TASK
========================================================= */
export const createTask = async (taskData, userId) => {
  const today = getToday();

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

    const today = getToday();

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

  const today = getToday();

  const tasks = await Task.find({ userId, date: today });

  if (!tasks.length) {
    return {
      totalTasks: 0,
      completed: 0,
      missed: 0,
      completionRate: 0,
      disciplineScore: 0,
      tier: "Bronze"
    };
  }

  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const missed = totalTasks - completed;

  await DailyStats.findOneAndUpdate(
    { userId, date: today },
    { totalTasks, completed, missed },
    { upsert: true }
  );

  const completionRate =
    totalTasks === 0 ? 0 : (completed / totalTasks) * 100;

  const disciplineScore = Math.round(completionRate);

  const tier = getPerformanceTier(completionRate);

  await DisciplineHistory.findOneAndUpdate(
    { userId, date: today },
    { completionRate, disciplineScore, tier },
    { upsert: true }
  );

  return {
    totalTasks,
    completed,
    missed,
    completionRate: Number(completionRate.toFixed(2)),
    disciplineScore,
    tier
  };
};