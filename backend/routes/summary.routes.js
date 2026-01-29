import express from "express";
import Task from "../models/Task.js";
import StudyLog from "../models/StudyLog.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// TODAY SUMMARY
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const totalTasks = await Task.countDocuments({
      userId: req.userId,
      dueDate: today,
    });

    const completedTasks = await Task.countDocuments({
      userId: req.userId,
      dueDate: today,
      completed: true,
    });

    const chaptersStudied = await StudyLog.countDocuments({
      userId: req.userId,
      date: today,
    });

    res.json({
      totalTasks,
      completedTasks,
      chaptersStudied,
      streakStatus: completedTasks > 0 ? "active" : "broken",
      feedback:
        completedTasks === 0
          ? "Productivity is low"
          : "Good job, keep going",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load today summary" });
  }
});

// WEEKLY SUMMARY
router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const logs = await StudyLog.find({ userId: req.userId }).sort({ date: 1 });

    const grouped = {};

    logs.forEach((log) => {
      grouped[log.date] = (grouped[log.date] || 0) + 1;
    });

    const result = Object.entries(grouped).map(([date, count]) => ({
      date,
      chapters: count,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to load weekly summary" });
  }
});

export default router;
