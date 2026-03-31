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

// All routes already protected via server.js — authMiddleware here is redundant but harmless
router.post("/", validateTask, createTask);
router.get("/", getTasksByUser);
router.get("/next", getNextTask);            // Must be BEFORE /:date
router.post("/end-day", endDayHandler);       // Must be BEFORE /:taskId
router.get("/:date", getTasksByDate);
router.patch("/:taskId", updateTaskStatus);
router.put("/complete/:id", completeTaskController);
router.put("/:taskId", updateTaskStatus);
router.delete("/:taskId", deleteTask);

export default router;
