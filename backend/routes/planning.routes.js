import express from "express";
import Subject from "../models/Subject.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET planning for a subject
router.get("/:subjectId", authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      userId: req.userId
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const today = new Date();
    const examDate = new Date(subject.examDate);

    const daysLeft = Math.ceil(
      (examDate - today) / (1000 * 60 * 60 * 24)
    );

    const remainingChapters =
      subject.totalChapters - subject.completedChapters;

    const chaptersPerDay =
      daysLeft > 0 ? remainingChapters / daysLeft : remainingChapters;

    res.json({
      subject: subject.name,
      daysLeft,
      remainingChapters,
      chaptersPerDay: Number(chaptersPerDay.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate plan" });
  }
});

export default router;
