import Task from "../models/Task.js";
import { smartReschedule } from "./smartReschedule.js";

export const createTask = async (req, res) => {
  try {
    console.log("CREATE TASK USERID 👉", req.userId);

    const { title, description, priority, estimatedTime, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      estimatedTime: Number(estimatedTime),
      dueDate: new Date(dueDate),
      userId: req.userId
    });

    res.json(task);
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getTasksByUser = async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
};

export const getTasksByDate = async (req, res) => {
  const { date } = req.params;
  const userId = req.userId;

  await smartReschedule(userId, new Date(date));

  const start = new Date(date);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const tasks = await Task.find({
    userId,
    dueDate: { $gte: start, $lte: end }
  });

  res.json(tasks);
};

export const updateTaskStatus = async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.taskId, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(task);
};

export const deleteTask = async (req, res) => {
  await Task.findOneAndDelete({
    _id: req.params.taskId,
    userId: req.userId
  });
  res.json({ message: "Task deleted" });
};


