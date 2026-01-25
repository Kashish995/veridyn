import Task from "../models/Task.js";
import { smartReschedule } from "./smartReschedule.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, estimatedTime, dueDate, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      estimatedTime: Number(estimatedTime),
      dueDate: new Date(dueDate),
      userId
    });

    res.json(task);
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

export const getTasksByUser = async (req, res) => {
  const tasks = await Task.find({ userId: req.params.userId });
  res.json(tasks);
};

export const getTasksByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;

    await smartReschedule(userId, new Date(date));

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: start, $lte: end }
    });

    res.json(tasks);
  } catch (err) {
    console.error("getTasksByDate error:", err);
    res.status(500).json({ message: "Failed to fetch tasks by date" });
  }
};

export const updateTaskStatus = async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.taskId,
    req.body,
    { new: true }
  );
  res.json(task);
};

export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.taskId);
  res.json({ message: "Task deleted" });
};
