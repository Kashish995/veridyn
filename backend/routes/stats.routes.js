import express from "express";
import { getWeeklyStats } from "../controllers/stats.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/weekly", authMiddleware, getWeeklyStats);

export default router;
