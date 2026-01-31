import express from "express";
console.log("✅ goal.routes.js loaded");

import authMiddleware from "../middleware/auth.middleware.js";
import todaySummaryMiddleware from "../middleware/todaySummary.middleware.js";
import { getGoal, autoAdjustGoal } from "../controllers/goal.controller.js";

const router = express.Router();
router.get("/test", (req, res) => {
  res.send("THIS IS THE REAL GOAL ROUTER");
});

router.get("/", authMiddleware, getGoal);

router.post(
  "/auto-adjust",
  authMiddleware,
  todaySummaryMiddleware,
  autoAdjustGoal
);

export default router;
