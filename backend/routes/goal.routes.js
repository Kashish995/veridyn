import express from "express";
import Goal from "../models/Goal.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET goal
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // ✅ FROM middleware

    let goal = await Goal.findOne({ userId });

    if (!goal) {
      goal = await Goal.create({
        userId,
        dailyTarget: 2,
      });
    }

    res.json(goal);
  } catch (err) {
    console.error("GOAL ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE goal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { dailyTarget } = req.body;
    const userId = req.userId; // ✅

    let goal = await Goal.findOneAndUpdate(
      { userId },
      { dailyTarget },
      { new: true, upsert: true }
    );

    res.json(goal);
  } catch (err) {
    console.error("GOAL UPDATE ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
