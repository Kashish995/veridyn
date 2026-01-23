import express from "express";
import {
  getStudyTasks,
  createStudyTask,
  updateStudyTask,
  deleteStudyTask,
} from "../controllers/studyTask.controller.js";

const router = express.Router();

router.get("/:userId", getStudyTasks);
router.post("/", createStudyTask);
router.patch("/:id", updateStudyTask);
router.delete("/:id", deleteStudyTask);

export default router;
