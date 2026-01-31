import Task from "../models/Task.js";

const todaySummaryMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: start, $lte: end }
    });

    const completedTasks = tasks.filter(
      t => t.status === "completed"
    ).length;

    const totalTasks = tasks.length;

    req.todaySummary = { completedTasks, totalTasks };
    next();
  } catch (err) {
    console.error("TODAY SUMMARY ERROR 👉", err);
    res.status(500).json({ message: "Failed to build today summary" });
  }
};

export default todaySummaryMiddleware;
