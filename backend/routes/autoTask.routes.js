import express from "express";
import Subject from "../models/Subject.js";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getToday } from "../utils/date.util.js";
const router = express.Router();

// AUTO GENERATE today's task for a subject
router.post("/:subjectId", authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      userId: req.userId
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const today = getToday();
    const todayDate = new Date();
    const examDate = new Date(subject.examDate);

    const daysLeft = Math.ceil(
    (examDate - todayDate) / (1000 * 60 * 60 * 24)
    );

    let priority = "low";
    if (daysLeft <= 7) priority = "high";
    else if (daysLeft <= 20) priority = "medium";


    // check if today's task already exists
    const existingTask = await Task.findOne({
      subjectId: subject._id,
      dueDate: today,
      userId: req.userId
    });

    if (existingTask) {
      return res.json({ message: "Today's task already generated" });
    }

    const nextChapter = subject.completedChapters + 1;

    if (nextChapter > subject.totalChapters) {
      return res.json({ message: "All chapters completed" });
    }
    const task = await Task.create({
    title: `Study Chapter ${nextChapter} of ${subject.name}`,
    description: `Auto-generated study task`,
    priority,              // ✅ dynamic now
    estimatedTime: 60,
    dueDate: today,
    userId: req.userId,
    subjectId: subject._id
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to auto-generate task" });
  }
});

export default router;
