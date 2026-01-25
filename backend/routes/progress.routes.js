import express from "express";
import Subject from "../models/Subject.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET progress feedback for subject
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

    const totalDays = Math.ceil(
      (examDate - new Date(subject.createdAt)) /
        (1000 * 60 * 60 * 24)
    );

    const daysPassed = Math.ceil(
      (today - new Date(subject.createdAt)) /
        (1000 * 60 * 60 * 24)
    );

    const expectedChaptersDone =
      (subject.totalChapters / totalDays) * daysPassed;

    let status = "on track";

    if (subject.completedChapters < expectedChaptersDone - 1) {
      status = "behind schedule";
    } else if (subject.completedChapters > expectedChaptersDone + 1) {
      status = "ahead of schedule";
    }

    res.json({
      subject: subject.name,
      completedChapters: subject.completedChapters,
      expectedChaptersDone: Math.floor(expectedChaptersDone),
      status
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate progress" });
  }
});

export default router;
