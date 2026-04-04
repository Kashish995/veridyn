import express from "express";
import StudyLog from "../models/StudyLog.js";
import Subject from "../models/Subject.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getToday } from "../utils/date.util.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────
// YOUR EXISTING ROUTES (unchanged)
// ─────────────────────────────────────────────────────────

// LOG daily study (chapter-based)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { subjectId, chaptersStudied } = req.body;
    const today = getToday();
    const userId = req.user.id;

    let log = await StudyLog.findOne({ userId, subjectId, date: today });

    if (log) {
      log.chaptersStudied += chaptersStudied;
      await log.save();
    } else {
      log = await StudyLog.create({ userId, subjectId, date: today, chaptersStudied });
    }

    const subject = await Subject.findById(subjectId);
    if (subject) {
      subject.completedChapters += chaptersStudied;
      await subject.save();
    }

    res.json({ message: "Study logged", log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to log study" });
  }
});

// GET all study logs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const logs = await StudyLog.find({ userId }).populate("subjectId");
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch study logs" });
  }
});

// ─────────────────────────────────────────────────────────
// NEW TIMER ROUTES
// ─────────────────────────────────────────────────────────

// POST /api/study-logs/session
// Called when user stops the timer — adds minutes to today's day-level log
router.post("/session", authMiddleware, async (req, res) => {
  try {
    const { durationMinutes, goalMinutes } = req.body;
    const today = getToday(); // reusing your existing util ✅
    const userId = req.user.id;

    if (!durationMinutes || durationMinutes < 1) {
      return res.status(400).json({ message: "Session too short to log" });
    }

    // Day-level log (no subjectId) — find or create
    let log = await StudyLog.findOne({ userId, date: today, subjectId: null });

    if (log) {
      log.loggedMinutes += durationMinutes;
      if (goalMinutes) log.goalMinutes = goalMinutes;
    } else {
      log = new StudyLog({
        userId,
        date: today,
        subjectId: null,
        loggedMinutes: durationMinutes,
        goalMinutes: goalMinutes || 120,
      });
    }

    // Recalculate completion rate
    log.completionRate = +(log.loggedMinutes / log.goalMinutes).toFixed(2);
    await log.save();

    res.json({ success: true, log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save session" });
  }
});

// GET /api/study-logs/today
// Returns today's timer progress for the widget
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();

    const log = await StudyLog.findOne({ userId, date: today, subjectId: null });

    res.json(log || { loggedMinutes: 0, goalMinutes: 120, completionRate: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch today's log" });
  }
});

// GET /api/study-logs/heatmap
// Returns { "2026-04-04": 0.85, ... } for the dashboard heatmap
router.get("/heatmap", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Only day-level logs (subjectId: null) drive the heatmap
    const logs = await StudyLog.find({ userId, subjectId: null })
      .sort({ date: 1 })
      .select("date completionRate loggedMinutes -_id");

    const heatmapData = {};
    logs.forEach(log => {
      heatmapData[log.date] = log.completionRate;
    });

    res.json(heatmapData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch heatmap data" });
  }
});

export default router;