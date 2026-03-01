import Task from "../models/Task.js";
import User from "../models/User.js";
import DailyStats from "../models/DailyStats.js";
import { getToday } from "../utils/date.util.js";

export const updateMissedTasks = async (userId) => {
  const now = new Date();

  const tasks = await Task.find({
    userId,
    status: "pending",
  });

  for (let task of tasks) {
    if (!task.endTime) continue;

    const [hours, minutes] = task.endTime.split(":");

    const deadline = new Date(task.dueDate);
    deadline.setHours(Number(hours), Number(minutes), 0, 0);

    if (now > deadline) {
      task.status = "missed";
      await task.save();

      const user = await User.findById(userId);
      user.disciplineScore -= 15;
      if (user.disciplineScore < 0) user.disciplineScore = 0;
      await user.save();

      const today = getToday();

      let stats = await DailyStats.findOne({
        userId,
        date: today,
      });

      if (!stats) {
        stats = await DailyStats.create({
          userId,
          date: today,
        });
      }

      stats.missed += 1;
      await stats.save();
    }
  }
};