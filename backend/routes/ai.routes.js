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
 

export default router;