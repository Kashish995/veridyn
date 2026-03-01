import express from "express";
import StudyLog from "../models/StudyLog.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { useStreakFreeze } from "../controllers/streak.controller.js";
import { getToday } from "../utils/date.util.js";

const router = express.Router();

// GET streak for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const logs = await StudyLog.find({ userId: req.userId }).sort({ date: -1 });

    if (logs.length === 0) {
      return res.json({ streak: 0 });
    }

    let streak = 0;
    let currentDate = getToday();

    for (let log of logs) {
      if (log.date === currentDate) {
        streak++;
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        currentDate = d.toISOString().split("T")[0];
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate streak" });
  }
});

router.post("/freeze", authMiddleware, useStreakFreeze);

export default router;
