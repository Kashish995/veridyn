import express from "express";
import Topic from "../models/Topic.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/due", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const dueToday = await Topic.find({
      userId: req.user.id,
      status: { $ne: "done" },
      scheduledDate: { $lte: now },
    }).sort("scheduledDate");

    const atRisk = await Topic.find({
      userId: req.user.id,
      status: "in_progress",
      lastStudiedAt: { $lte: threeDaysAgo },
    });

    res.json({ dueToday, atRisk });
  } catch (err) {
    console.error("Due topics error:", err.message);
    res.status(500).json({ message: "Failed to fetch due topics" });
  }
});

export default router;