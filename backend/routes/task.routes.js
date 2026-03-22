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
  completeTaskController,
  endDayHandler
} from "../controllers/task.controller.js";
import { validateTask } from '../middleware/validation.js';

const router = Router();

// 🔐 PROTECTED ROUTES
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasksByUser);
router.get("/next", authMiddleware, getNextTask);   // MUST be before /:date
router.get("/:date", authMiddleware, getTasksByDate);
router.patch("/:taskId", authMiddleware, updateTaskStatus);
router.delete("/:taskId", authMiddleware, deleteTask);
router.post("/end-day", authMiddleware, endDayTasks);
router.put("/complete/:id", authMiddleware, completeTaskController);
router.put("/:taskId", authMiddleware, updateTaskStatus);

router.post('/', authMiddleware, validateTask, createTask);
router.post("/end-day", endDayHandler);

export default router;
