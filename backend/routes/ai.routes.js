import express from "express";
import { getAIRecommendations } from "../controllers/ai.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/recommendations", verifyToken, getAIRecommendations);

export default router;