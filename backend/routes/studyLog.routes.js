import express from "express";
import StudyLog from "../models/StudyLog.js";
import Subject from "../models/Subject.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getToday } from "../utils/date.util.js";

const router = express.Router();

// GET /study-logs/today → returns today's logged minutes (for StudyTimer)
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today  = getToday();

    const log = await StudyLog.findOne({ userId, date: today, subjectId: null });
    res.json({ loggedMinutes: log?.loggedMinutes || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch today's log" });
  }
});

// POST /study-logs/session → saves a timer session (for StudyTimer)
router.post("/session", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today  = getToday();
    const { durationMinutes, goalMinutes } = req.body;

    let log = await StudyLog.findOne({ userId, date: today, subjectId: null });

    if (log) {
      log.loggedMinutes += durationMinutes;
      log.goalMinutes    = goalMinutes;
      await log.save();
    } else {
      log = await StudyLog.create({
        userId,
        date:            today,
        subjectId:       null,
        loggedMinutes:   durationMinutes,
        goalMinutes:     goalMinutes,
        chaptersStudied: 0,
      });
    }

    const completionRate = log.loggedMinutes / log.goalMinutes;
    res.json({ log: { loggedMinutes: log.loggedMinutes, completionRate } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save session" });
  }
});

// POST /study-logs → log daily study by subject/chapters
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { subjectId, chaptersStudied } = req.body;
    const userId = req.user.id;
    const today  = getToday();

    let log = await StudyLog.findOne({ userId, subjectId, date: today });

    if (log) {
      log.chaptersStudied += chaptersStudied;
      await log.save();
    } else {
      log = await StudyLog.create({
        userId,
        subjectId,
        date: today,
        chaptersStudied,
      });
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

// GET /study-logs → get all logs for logged-in user
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

export default router;