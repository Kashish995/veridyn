import express from "express";
import Subject from "../models/Subject.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET completion % for subject
router.get("/:subjectId", authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      userId: req.userId
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const percent =
      (subject.completedChapters / subject.totalChapters) * 100;

    res.json({
      subject: subject.name,
      completedChapters: subject.completedChapters,
      totalChapters: subject.totalChapters,
      completionPercent: Math.floor(percent)
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate completion" });
  }
});

export default router;
