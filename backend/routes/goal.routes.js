import express from "express";
import Goal from "../models/Goal.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// CREATE or UPDATE goal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { dailyTarget } = req.body;

    if (!dailyTarget) {
      return res.status(400).json({ message: "dailyTarget is required" });
    }

    // 👇 FIX IS HERE
    const userId = req.user.id; // NOT req.userId

    let goal = await Goal.findOne({ userId });

    if (goal) {
      goal.dailyTarget = dailyTarget;
      await goal.save();
    } else {
      goal = await Goal.create({
        userId,        // now defined ✅
        dailyTarget
      });
    }

    res.status(201).json(goal);
  } catch (err) {
    console.error("GOAL ERROR:", err);
    res.status(500).json({ message: "Failed to save goal" });
  }
});

// GET goal
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // same fix here
    const goal = await Goal.findOne({ userId });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch goal" });
  }
});

export default router;
