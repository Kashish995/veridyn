import express from "express";
import Reflection from "../models/Reflection.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getToday } from "../utils/date.util.js";

const router = express.Router();

// SAVE reflection
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { reason, note } = req.body;

    const today = getToday();

    const reflection = await Reflection.create({
      userId: req.userId,
      reason,
      note,
      date: today,
    });

    res.json(reflection);
  } catch (err) {
    res.status(500).json({ message: "Failed to save reflection" });
  }
});

// GET today reflection
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = getToday();

    const reflection = await Reflection.findOne({
      userId: req.userId,
      date: today,
    });

    res.json(reflection);
  } catch (err) {
    res.status(500).json({ message: "Failed to load reflection" });
  }
});

export default router;
