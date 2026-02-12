import Task from "../models/Task.js";
import { smartReschedule } from "./smartReschedule.js";
import User from "../models/User.js";

export const createTask = async (req, res) => {
  try {
    console.log("CREATE TASK USERID 👉", req.userId);

   const { 
      title, 
      description, 
      priority, 
      estimatedTime, 
      dueDate,
      startTime,
      endTime
    } = req.body;


    const task = await Task.create({
      title,
      description,
      priority,
      estimatedTime: Number(estimatedTime),
      dueDate: new Date(dueDate),
      startTime,
      endTime,
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

  const now = new Date();

  for (let task of tasks) {
    if (
      task.status === "pending" &&
      task.startTime &&
      task.endTime
    ) {
      const [endHour, endMinute] = task.endTime.split(":");

      const taskEndTime = new Date(task.dueDate);
      taskEndTime.setHours(
        Number(endHour),
        Number(endMinute),
        0,
        0
      );

      if (now > taskEndTime) {
        task.status = "missed";
        await task.save();

        const user = await User.findById(req.userId);
        user.disciplineScore -= 15;

        if (user.disciplineScore < 0) user.disciplineScore = 0;

        await user.save();

      }
    }
  }

  const updatedTasks = await Task.find({ userId: req.userId });

  res.json(updatedTasks);
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

  // Discipline Logic
  if (status === "completed") {
    user.disciplineScore += 10;
  }

  if (status === "missed") {
    user.disciplineScore -= 15;
  }

  // Clamp score between 0 and 100
  if (user.disciplineScore > 100) user.disciplineScore = 100;
  if (user.disciplineScore < 0) user.disciplineScore = 0;

  await user.save();

  res.json(task);
};

export const deleteTask = async (req, res) => {
  await Task.findOneAndDelete({
    _id: req.params.taskId,
    userId: req.userId
  });
  res.json({ message: "Task deleted" });
};

export const endDayTasks = async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  await Task.updateMany(
    {
      userId: req.userId,
      dueDate: { $gte: today, $lte: end },
      status: { $ne: "completed" }
    },
    { status: "missed" }
  );

  res.json({ message: "Day ended" });
};
export const updateMissedTasks = async (userId) => {
  const now = new Date();

  const tasks = await Task.find({
    userId,
    status: "pending"
  });

  for (let task of tasks) {
    if (!task.endTime) continue;

    const [hours, minutes] = task.endTime.split(":");

    const taskDeadline = new Date(task.dueDate);
    taskDeadline.setHours(hours);
    taskDeadline.setMinutes(minutes);

    if (now > taskDeadline) {
      task.status = "missed";
      await task.save();
    }
  }
};



