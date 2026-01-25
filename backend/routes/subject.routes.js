import express from "express";
import Subject from "../models/Subject.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// CREATE subject
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, examDate, totalChapters } = req.body;

    const subject = await Subject.create({
      name,
      examDate,
      totalChapters,
      userId: req.userId
    });

    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: "Failed to create subject" });
  }
});

// GET all subjects for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

export default router;
