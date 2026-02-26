import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createTask,
  getTasksByUser,
  getTasksByDate,
  updateTaskStatus,
  deleteTask,
  getNextTask,
  endDayTasks,
  completeTaskController
} from "../controllers/task.controller.js";

const router = Router();

// 🔐 PROTECTED ROUTES
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasksByUser);
router.get("/next", authMiddleware, getNextTask);   // MUST be before /:date
router.get("/:date", authMiddleware, getTasksByDate);
router.patch("/:taskId", authMiddleware, updateTaskStatus);
router.delete("/:taskId", authMiddleware, deleteTask);
router.post("/end-day", authMiddleware, endDayTasks);

export default router;
