import express from "express";
import {
  createStudyTask,
  getStudyTasksByUser,
} from "../controllers/studyTask.controller.js";

const router = express.Router();

router.post("/", createStudyTask);
router.get("/user/:userId", getStudyTasksByUser);

export default router;
