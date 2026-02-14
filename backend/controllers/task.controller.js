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
    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🚨 LOCK MISSED TASKS
    if (task.status === "missed") {
      return res.status(400).json({
        message: "Missed tasks cannot be modified.",
      });
    }

    // 🚫 Prevent changing missed back to completed
    if (req.body.status === "completed" && task.status === "missed") {
      return res.status(400).json({
        message: "You cannot complete a missed task.",
      });
    }

    task.status = req.body.status || task.status;

    await task.save();

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
    const userId = req.userId;

    // 1️⃣ Update missed tasks first
    await updateMissedTasks(userId);

    // 2️⃣ Get today's tasks
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: todayStart, $lte: todayEnd },
    });

    // 3️⃣ Count completed & missed
    let completed = 0;
    let missed = 0;

    tasks.forEach((task) => {
      if (task.status === "completed") completed++;
      if (task.status === "missed") missed++;
    });

    // 4️⃣ Update discipline score
    const user = await User.findById(userId);

    user.disciplineScore += completed * 5;
    user.disciplineScore -= missed * 3;

    // Extra penalty if nothing done
    if (completed === 0 && tasks.length > 0) {
      user.disciplineScore -= 5;
    }

    // Keep within 0–100
    if (user.disciplineScore < 0) user.disciplineScore = 0;
    if (user.disciplineScore > 100) user.disciplineScore = 100;

    await user.save();

    res.json({
      message: "Day ended successfully",
      disciplineScore: user.disciplineScore,
      completed,
      missed,
    });

  } catch (err) {
    console.error("endDayTasks error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getNextTask = async (req, res) => {
  try {
    const now = new Date();

    const tasks = await Task.find({
      userId: req.userId,
      status: "pending",
    });

    let upcoming = null;

    for (let task of tasks) {
      if (!task.startTime) continue;

      const [hours, minutes] = task.startTime.split(":");

      const taskTime = new Date(task.dueDate);
      taskTime.setHours(Number(hours), Number(minutes), 0, 0);

      if (taskTime > now) {
        if (!upcoming || taskTime < upcoming.time) {
          upcoming = {
            task,
            time: taskTime,
          };
        }
      }
    }

    if (!upcoming) {
      return res.json(null);
    }

    res.json(upcoming.task);
  } catch (err) {
    console.error("Next task error:", err);
    res.status(500).json({ message: err.message });
  }
};
