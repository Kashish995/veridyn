import dotenv from "dotenv";
dotenv.config();

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authMiddleware from "./middleware/auth.middleware.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter, authLimiter, aiLimiter } from './middleware/rateLimiter.js';

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import taskRoutes from "./routes/task.routes.js";
import studyTaskRoutes from "./routes/studyTask.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import planningRoutes from "./routes/planning.routes.js";
import autoTaskRoutes from "./routes/autoTask.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import studyLogRoutes from "./routes/studyLog.routes.js";
import completionRoutes from "./routes/completion.routes.js";
import streakRoutes from "./routes/streak.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import reflectionRoutes from "./routes/reflection.routes.js";
import patternRoutes from "./routes/pattern.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import suggestionRoutes from "./routes/suggestion.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import topicRoutes from "./routes/topic.routes.js";

const app = express();
 
/* ── CORS ───────────────────────────────────────────── */
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL,
    /https:\/\/veridyn-.*\.vercel\.app$/
  ],
  credentials: true
}));
 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
/* ── RATE LIMITERS ───────────────────────────────────── */
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai',            aiLimiter);
app.use('/api',               apiLimiter);
 
/* ── GLOBAL RESPONSE HELPERS ────────────────────────── */
app.use((req, res, next) => {
  res.success = (data, message = "Success") =>
    res.status(200).json({ success: true, message, data, error: null });
  res.fail = (message = "Error", status = 400) =>
    res.status(status).json({ success: false, message, data: null, error: message });
  next();
});
 
/* ── ROUTES ──────────────────────────────────────────── */
app.use("/api/auth",        authRoutes);
app.use("/api/users",       authMiddleware, userRoutes);
app.use("/api/profile",     authMiddleware, profileRoutes);
app.use("/api/tasks",       authMiddleware, taskRoutes);
app.use("/api/study-tasks", authMiddleware, studyTaskRoutes);
app.use("/api/subjects",    authMiddleware, subjectRoutes);
app.use("/api/planning",    authMiddleware, planningRoutes);
app.use("/api/auto-task",   authMiddleware, autoTaskRoutes);
app.use("/api/progress",    authMiddleware, progressRoutes);
app.use("/api/study-logs",  authMiddleware, studyLogRoutes);
app.use("/api/completion",  authMiddleware, completionRoutes);
app.use("/api/streak",      authMiddleware, streakRoutes);
app.use("/api/summary",     authMiddleware, summaryRoutes);
app.use("/api/reflection",  authMiddleware, reflectionRoutes);
app.use("/api/patterns",    authMiddleware, patternRoutes);
app.use("/api/goals",       authMiddleware, goalRoutes);
app.use("/api/insights",    authMiddleware, insightsRoutes);
app.use("/api/suggestions", authMiddleware, suggestionRoutes);
app.use("/api/stats",       authMiddleware, statsRoutes);
app.use("/api/ai",          authMiddleware, aiRoutes);
app.use("/api/topics",      authMiddleware, topicRoutes);
// app.use("/api/health",   authMiddleware, healthRoutes); ← broken, kept off
 
app.get("/",     (req, res) => res.send("VERIDYN API RUNNING ✅"));
app.get("/test", (req, res) => res.json({ message: "API working", status: "ok" }));
 
/* ── ERROR HANDLER ───────────────────────────────────── */
app.use(errorHandler);
 
/* ── DB + SERVER ─────────────────────────────────────── */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // ── Keep Render free tier alive ──────────────────────────
    import('https').then(({ default: https }) => {
      setInterval(() => {
        https.get('https://veridyn.onrender.com/test', (res) => {
          console.log(`Keep-alive ping: ${res.statusCode}`);
        }).on('error', (err) => {
          console.error('Keep-alive failed:', err.message);
        });
      }, 14 * 60 * 1000);
    });

  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });