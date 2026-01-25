import express from "express";
import { getPatterns } from "../controllers/pattern.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getPatterns);

export default router;
