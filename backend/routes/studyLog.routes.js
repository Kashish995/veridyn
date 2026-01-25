import express from "express";
import StudyLog from "../models/StudyLog.js";
import Subject from "../models/Subject.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// LOG daily study
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { subjectId, chaptersStudied } = req.body;

    const today = new Date().toISOString().split("T")[0];

    let log = await StudyLog.findOne({
      userId: req.userId,
      subjectId,
      date: today
    });

    if (log) {
      log.chaptersStudied += chaptersStudied;
      await log.save();
    } else {
      log = await StudyLog.create({
        userId: req.userId,
        subjectId,
        date: today,
        chaptersStudied
      });
    }

    // update subject completed chapters
    const subject = await Subject.findById(subjectId);
    subject.completedChapters += chaptersStudied;
    await subject.save();

    res.json({ message: "Study logged", log });
  } catch (err) {
    res.status(500).json({ message: "Failed to log study" });
  }
});

export default router;
