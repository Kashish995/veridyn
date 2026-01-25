import express from "express";
import { getGoal, adjustGoal } from "../controllers/goal.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getGoal);
router.post("/adjust", authMiddleware, adjustGoal);

export default router;
