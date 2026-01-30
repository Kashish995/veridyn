import express from "express";
import Subject from "../models/Subject.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// CREATE subject
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, totalChapters, examDate } = req.body;

    const subject = await Subject.create({
      userId: req.user.id,   // ✅ FIXED
      name,
      totalChapters,
      completedChapters: 0,
      examDate             // ✅ REQUIRED FIELD
    });

    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create subject" });
  }
});

// GET all subjects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id }); // ✅ FIXED
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

export default router;
