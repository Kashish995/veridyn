import express from "express";
import { getSubjectAnalytics } from "../controllers/insightsController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/subjects", authMiddleware, getSubjectAnalytics);

export default router;
