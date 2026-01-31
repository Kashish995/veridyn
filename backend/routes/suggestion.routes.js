import express from "express";
import { getTomorrowSuggestion } from "../controllers/suggestion.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/tomorrow", authMiddleware, getTomorrowSuggestion);

export default router;
