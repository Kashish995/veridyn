import { Router } from "express";
import {
  createTask,
  getTasksByUser,
  updateTaskStatus,
  deleteTask
} from "../controllers/task.controller.js";

const router = Router();

router.post("/", createTask);
router.get("/user/:userId", getTasksByUser);
router.patch("/:taskId", updateTaskStatus);
router.delete("/:taskId", deleteTask);

export default router;
