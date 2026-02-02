import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createTask,
  getTasksByUser,
  getTasksByDate,
  updateTaskStatus,
  deleteTask
} from "../controllers/task.controller.js";

const router = Router();

// 🔐 PROTECTED ROUTES
router.post("/", createTask);
router.get("/", getTasksByUser);
router.get("/:date", getTasksByDate);
router.patch("/:taskId", updateTaskStatus);
router.delete("/:taskId", deleteTask);

export default router;
