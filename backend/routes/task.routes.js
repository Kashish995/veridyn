import { Router } from "express";
import {
  createTask,
  getTasksByUser,
  getTasksByDate,
  updateTaskStatus,
  deleteTask
} from "../controllers/task.controller.js";

const router = Router();

router.post("/", createTask);
router.get("/user/:userId", getTasksByUser);

// ✅ Option A route
router.get("/user/:userId/:date", getTasksByDate);

router.patch("/:taskId", updateTaskStatus);
router.delete("/:taskId", deleteTask);

export default router;
