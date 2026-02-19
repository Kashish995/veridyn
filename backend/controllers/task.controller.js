import Task from "../models/Task.js";
import User from "../models/User.js";
import DailyStats from "../models/DailyStats.js";
import { smartReschedule } from "./smartReschedule.js";
import sendResponse from "../utils/apiResponse.js";

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

    return sendResponse(
      res,
      201,
      true,
      "Task created successfully",
      task,
      null
    );

  } catch (err) {
    console.error("createTask error:", err);

    return sendResponse(
      res,
      500,
      false,
      "Failed to create task",
      null,
      err.message
    );
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
    return sendResponse(
      res,
      200,
      true,
      "Tasks fetched successfully",
      tasks,
      null
    );

  } catch (err) {
    console.error("getTasksByUser error:", err);
    return sendResponse(
        res,
        500,
        false,
        "Failed to fetch tasks",
        null,
        err.message
      );

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

    return sendResponse(
      res,
      200,
      true,
      "Tasks fetched successfully",
      tasks,
      null
    );
  } catch (err) {
    console.error("getTasksByDate error:", err);
   return sendResponse(
      res,
      500,
      false,
      "Failed to fetch tasks",
      null,
      err.message
    );
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
     return sendResponse(
      res,
      404,
      false,
      "Task not found",
      null,
      "TASK_NOT_FOUND"
    );

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

    return sendResponse(
      res,
      200,
      true,
      "Task updated successfully",
      task,
      null
    );
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

    return sendResponse(
      res,
      200,
      true,
      "Task deleted successfully",
      null,
      null
    );

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

    // Base scoring
      user.disciplineScore += completed * 5;
      user.disciplineScore -= missed * 3;

      // Extra penalty if zero productivity
      if (completed === 0 && tasks.length > 0) {
        user.disciplineScore -= 5;
      }

      /* 🔥 ADD THIS HERE */
      if (missed === 0 && completed > 0) {
        user.streak += 1;

        if (user.streak === 3) {
          user.disciplineScore += 5;
        }

        if (user.streak === 7) {
          user.disciplineScore += 10;
        }
      } else {
        user.streak = 0;
      }

      // Keep score in range
      if (user.disciplineScore < 0) user.disciplineScore = 0;
      if (user.disciplineScore > 100) user.disciplineScore = 100;

      await user.save();


    return sendResponse(
      res,
      200,
      true,
      "Day ended successfully",
      {
        disciplineScore: user.disciplineScore,
        completed,
        missed,
      },
      null
    );


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

    let upcomingTask = null;
    let minTimeDiff = Infinity;

    for (let task of tasks) {
      if (!task.startTime || !task.dueDate) continue;

      const [hours, minutes] = task.startTime.split(":").map(Number);

      if (isNaN(hours) || isNaN(minutes)) continue;

      const taskDateTime = new Date(task.dueDate);
      taskDateTime.setHours(hours, minutes, 0, 0);

      const timeDiff = taskDateTime - now;

      if (timeDiff > 0 && timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        upcomingTask = task;
      }
    }

    return sendResponse(
      res,
      200,
      true,
      "Next task fetched",
      upcomingTask || null,
      null
    );


  } catch (err) {
    console.error("Next task error:", err);
    res.status(500).json({ message: err.message });
  }
};

