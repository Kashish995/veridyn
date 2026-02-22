import Task from "../models/Task.js";
import User from "../models/User.js";
import DailyStats from "../models/DailyStats.js";
import { smartReschedule } from "./smartReschedule.js";
import sendResponse from "../utils/apiResponse.js";
import { calculateDisciplineChange } from "../services/disciplineService.js";
import { updateMissedTasks } from "../services/taskLifecycleService.js";
/* =========================
   CREATE TASK
========================= */
export const createTask = async (req, res, next) => {
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

    if (!title || !dueDate || !startTime || !endTime) {
  const error = new Error("Missing required fields");
  error.statusCode = 400;
  return next(error);
}

if (priority && !["low", "medium", "high"].includes(priority)) {
  const error = new Error("Invalid priority value");
  error.statusCode = 400;
  return next(error);
}

if (isNaN(new Date(dueDate))) {
  const error = new Error("Invalid due date");
  error.statusCode = 400;
  return next(error);
}

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
  next(err);
}
};




/* =========================
   GET TASKS (AUTO CHECK)
========================= */
export const getTasksByUser = async (req, res, next) => {
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
  next(err);
}
};

/* =========================
   GET TASKS BY DATE
========================= */
export const getTasksByDate = async (req, res, next) => {
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
  next(err);
}
};

/* =========================
   UPDATE TASK STATUS
========================= */
export const updateTaskStatus = async (req, res, next) => {
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
  return sendResponse(
    res,
    400,
    false,
    "Missed tasks cannot be modified.",
    null,
    "TASK_LOCKED"
  );
}

if (req.body.status === "completed" && task.status === "missed") {
  return sendResponse(
    res,
    400,
    false,
    "You cannot complete a missed task.",
    null,
    "INVALID_STATUS_CHANGE"
  );
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
  next(err);
}
};

/* =========================
   DELETE TASK
========================= */
export const deleteTask = async (req, res, next) => {
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
  next(err);
}
};


export const endDayTasks = async (req, res, next) => {
  try {
    const userId = req.userId;

    // 1️⃣ Update missed tasks first
    await updateMissedTasks(req.userId);

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

const { newScore, newStreak } =
  calculateDisciplineChange({
    tasks,
    currentScore: user.disciplineScore,
    currentStreak: user.streak
  });

user.disciplineScore = newScore;
user.streak = newStreak;

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
  next(err);
}
};

export const getNextTask = async (req, res, next) => {
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
  next(err);
}
};

