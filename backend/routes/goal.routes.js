import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import todaySummaryMiddleware from "../middleware/todaySummary.middleware.js";
import { setGoal, getGoal, getGoalDashboard, autoAdjustGoal } from "../controllers/goal.controller.js";

const router = express.Router();

router.post("/", authMiddleware, setGoal);

router.get("/", authMiddleware, getGoal);

router.get("/dashboard", authMiddleware, todaySummaryMiddleware, getGoalDashboard);

router.post("/auto-adjust", authMiddleware, todaySummaryMiddleware, autoAdjustGoal);

export default router;
