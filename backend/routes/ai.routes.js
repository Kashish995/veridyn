import express from "express";
import AIService from "../services/ai.service.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();

// ── POST /api/ai/chat ─────────────────────────────────────
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { messages, userData } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const reply = await AIService.chat(messages, userData || null);
    res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ message: "AI service unavailable", reply: "Sorry, I couldn't connect right now. Please try again." });
  }
});

// ── POST /api/ai/recommendations ─────────────────────────
router.post("/recommendations", authMiddleware, async (req, res) => {
  try {
    const userData = req.body;
    const result = await AIService.generateRecommendations(userData);
    res.json(JSON.parse(result));
  } catch (err) {
    console.error("Recommendations error:", err.message);
    res.status(500).json({ message: "Failed to generate recommendations" });
  }
});

// ── POST /api/ai/explanation ──────────────────────────────
router.post("/explanation", authMiddleware, async (req, res) => {
  try {
    const { metric, currentValue, trend, context } = req.body;
    const result = await AIService.generateExplanation({ metric, currentValue, trend, context });
    res.json(JSON.parse(result));
  } catch (err) {
    console.error("Explanation error:", err.message);
    res.status(500).json({ message: "Failed to generate explanation" });
  }
});

// ── POST /api/ai/7-day-plan ───────────────────────────────
router.post("/7-day-plan", authMiddleware, async (req, res) => {
  try {
    const { userData, goals } = req.body;
    const result = await AIService.generate7DayPlan(userData, goals);
    res.json(JSON.parse(result));
  } catch (err) {
    console.error("7-day plan error:", err.message);
    res.status(500).json({ message: "Failed to generate plan" });
  }
});

router.post("/upload-syllabus", authMiddleware, upload.single("syllabus"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);
    const syllabusText = data.text;

    if (!syllabusText || syllabusText.trim().length < 20) {
      return res.status(400).json({ message: "Couldn't extract readable text from this PDF" });
    }

    res.json({ syllabusText });
  } catch (err) {
    console.error("Syllabus upload error:", err.message);
    res.status(500).json({ message: "Failed to process PDF" });
  }
});

// ── POST /api/ai/generate-study-plan ──────────────────────
router.post("/generate-study-plan", authMiddleware, async (req, res) => {
  try {
    const { subjectName, syllabusText, targetDate, dailyStudyHours } = req.body;
    const userId = req.userId; // Provided by authMiddleware

    if (!subjectName || !syllabusText || !targetDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const planJsonStr = await AIService.generateStudyPlan({
      subjectName,
      syllabusText,
      targetDate,
      dailyStudyHours: dailyStudyHours || 2
    });

    const topics = JSON.parse(planJsonStr);

    // Save Subject to DB
    const Subject = (await import("../models/Subject.js")).default;
    const newSubject = new Subject({
      name: subjectName,
      examDate: new Date(targetDate),
      totalChapters: topics.length,
      userId
    });
    await newSubject.save();

    // Map topics to Tasks
    const Task = (await import("../models/Task.js")).default;
    let currentDate = new Date();
    const endDate = new Date(targetDate);
    
    // Distribute tasks evenly from now to targetDate
    const diffTime = Math.abs(endDate - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysPerTopic = Math.max(1, Math.floor(diffDays / topics.length));

    const tasksToCreate = topics.map((topic, index) => {
      let taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + (index * daysPerTopic));
      if (taskDate > endDate) taskDate = endDate; // Cap at end date

      return {
        title: `[${subjectName}] ${topic.title}`,
        description: topic.description,
        status: "pending",
        priority: topic.priority || "medium",
        estimatedTime: topic.estimatedTime || 60,
        dueDate: taskDate,
        userId,
        subjectId: newSubject._id
      };
    });

    await Task.insertMany(tasksToCreate);

    res.json({ message: "Study plan generated successfully", tasks: tasksToCreate });
  } catch (err) {
    console.error("Generate study plan error:", err.message);
    res.status(500).json({ message: "Failed to generate study plan" });
  }
});
 

export default router;