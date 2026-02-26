// services/task.service.js

import Task from "../models/Task.js";
import DailyStats from "../models/DailyStats.js";
import { updateDailyDisciplineSnapshot } from "./history.service.js";
import { checkAndPersistStreakBreak } from "./streak.service.js";

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
    await updateDailyDisciplineSnapshot(userId, today);
    await checkAndPersistStreakBreak(userId);
  }

  return task;
};