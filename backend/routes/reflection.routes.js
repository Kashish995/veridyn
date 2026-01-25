import express from "express";
import {
  saveReflection,
  getTodayReflection,
} from "../controllers/reflection.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, saveReflection);
router.get("/today", authMiddleware, getTodayReflection);

export default router;
