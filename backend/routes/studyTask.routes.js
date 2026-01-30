import express from "express";
import { createTask } from "../controllers/studyTask.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTask);

export default router;
