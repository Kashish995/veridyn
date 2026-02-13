import Task from "../models/Task.js";
import User from "../models/User.js";
import DailyStats from "../models/DailyStats.js";
import { smartReschedule } from "./smartReschedule.js";

/* =========================
   CREATE TASK
========================= */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      estimatedTime,
      dueDate,
      startTime,
      endTime,
    } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      estimatedTime: Number(estimatedTime),
      dueDate: new Date(dueDate),
      startTime,
      endTime,
      userId: req.userId,
    });

    // ---- DailyStats Update ----
    const today = new Date().toISOString().split("T")[0];

    let stats = await DailyStats.findOne({
      userId: req.userId,
      date: today,
    });

    if (!stats) {
      stats = new DailyStats({
        userId: req.userId,
        date: today,
        totalTasks: 1,
      });
    } else {
      stats.totalTasks += 1;
    }

    await stats.save();

    res.json(task);
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   AUTO MARK MISSED
========================= */
const updateMissedTasks = async (userId) => {
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

      // ---- Discipline Penalty ----
      const user = await User.findById(userId);
      user.disciplineScore -= 15;
      if (user.disciplineScore < 0) user.disciplineScore = 0;
      await user.save();

      // ---- DailyStats Update ----
      const today = new Date().toISOString().split("T")[0];

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
      stats.scoreChange -= 15;

      await stats.save();
    }
  }
};

/* =========================
   GET TASKS (AUTO CHECK)
========================= */
export const getTasksByUser = async (req, res) => {
  try {
    await updateMissedTasks(req.userId);

    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (err) {
    console.error("getTasksByUser error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET TASKS BY DATE
========================= */
export const getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.userId;

    await smartReschedule(userId, new Date(date));

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: start, $lte: end },
    });

    res.json(tasks);
  } catch (err) {
    console.error("getTasksByDate error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE TASK STATUS
========================= */
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    await task.save();

    const user = await User.findById(req.userId);

    const today = new Date().toISOString().split("T")[0];

    let stats = await DailyStats.findOne({
      userId: req.userId,
      date: today,
    });

    if (!stats) {
      stats = await DailyStats.create({
        userId: req.userId,
        date: today,
      });
    }

    if (status === "completed") {
      user.disciplineScore += 10;
      stats.completed += 1;
      stats.scoreChange += 10;
    }

    if (status === "missed") {
      user.disciplineScore -= 15;
      stats.missed += 1;
      stats.scoreChange -= 15;
    }

    if (user.disciplineScore > 100) user.disciplineScore = 100;
    if (user.disciplineScore < 0) user.disciplineScore = 0;

    await user.save();
    await stats.save();

    res.json(task);
  } catch (err) {
    console.error("updateTaskStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE TASK
========================= */
export const deleteTask = async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.taskId,
      userId: req.userId,
    });

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const endDayTasks = async (req, res) => {
  try {
    await updateMissedTasks(req.userId);
    res.json({ message: "Day ended successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
