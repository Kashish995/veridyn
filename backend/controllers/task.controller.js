import Task from "../models/Task.js";
import User from "../models/User.js";
import DailyStats from "../models/DailyStats.js";
import { smartReschedule } from "./smartReschedule.js";
import sendResponse from "../utils/apiResponse.js";
import { calculateDisciplineChange } from "../services/disciplineService.js";
import { updateMissedTasks } from "../services/taskLifecycleService.js";
import { completeTask } from "../services/task.service.js";
import { endDay } from "../services/task.service.js";
import { getToday } from "../utils/date.util.js";
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

    const userId = req.user.id;

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
      userId,
    });

    const today = getToday();

    let stats = await DailyStats.findOne({ userId, date: today });

    if (!stats) {
      stats = new DailyStats({
        userId,
        date: today,
        totalTasks: 1,
        completed: 0,
        missed: 0,
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
    const userId = req.user.id;

    await updateMissedTasks(userId);

    const tasks = await Task.find({ userId });

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
    const userId = req.user.id;
    const { date } = req.params;

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
    const userId = req.user.id;

    const task = await Task.findOne({
      _id: req.params.taskId,
      userId,
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
    const userId = req.user.id;

    await Task.findOneAndDelete({
      _id: req.params.taskId,
      userId,
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

/* =========================
   END DAY
========================= */
export const endDayTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await updateMissedTasks(userId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: todayStart, $lte: todayEnd },
    });

    let completed = 0;
    let missed = 0;

    tasks.forEach((task) => {
      if (task.status === "completed") completed++;
      if (task.status === "missed") missed++;
    });

    const user = await User.findById(userId);

    const { newScore, newStreak } =
      await calculateDisciplineChange({
        tasks,
        currentScore: user.disciplineScore,
        currentStreak: user.streak,
        userId
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

/* =========================
   GET NEXT TASK
========================= */
export const getNextTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const tasks = await Task.find({
      userId,
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

/* =========================
   COMPLETE TASK (SERVICE)
========================= */
export const completeTaskController = async (req, res, next) => {
  try {
    const task = await completeTask(req.params.id, req.user.id);
    return sendResponse(
      res,
      200,
      true,
      "Task completed successfully",
      task,
      null
    );
  } catch (error) {
    next(error);
  }
};
export const endDayHandler = async (req, res, next) => {
  try {
    const result = await endDay(req.userId);

    return res.status(200).json({
      success: true,
      message: "Day finalized successfully",
      data: result,
      error: null
    });

  } catch (error) {
    next(error);
  }
};