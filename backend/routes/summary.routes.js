import express from "express";
import { getTodaySummary, getWeeklySummary } from "../controllers/summary.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/today", authMiddleware, getTodaySummary);
router.get("/weekly", authMiddleware, getWeeklySummary);

export default router;
