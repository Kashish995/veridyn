import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getNextTask } from "../controllers/task.controller.js";

import {
  createTask,
  getTasksByUser,
  getTasksByDate,
  updateTaskStatus,
  deleteTask
} from "../controllers/task.controller.js";
import { endDayTasks } from "../controllers/task.controller.js";

const router = Router();

// 🔐 PROTECTED ROUTES
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasksByUser);
router.get("/:date", authMiddleware, getTasksByDate);
router.get("/next", authMiddleware, getNextTask);
router.patch("/:taskId", authMiddleware, updateTaskStatus);
router.delete("/:taskId", authMiddleware, deleteTask);

// End day → mark pending tasks as missed
router.post("/end-day", authMiddleware, endDayTasks);



export default router;
