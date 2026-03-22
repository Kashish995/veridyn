import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";


/* Middleware */
import authMiddleware from "./middleware/auth.middleware.js";
import errorHandler from "./middleware/errorHandler.js";

/* Routes */
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
import healthRoutes from "./routes/health.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { apiLimiter, authLimiter, aiLimiter } from './middleware/rateLimiter.js';



const app = express();


/* ---------------- GLOBAL MIDDLEWARE ---------------- */


app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://veridyn-five.vercel.app',
    /https:\/\/veridyn-.*\.vercel\.app$/
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 🔥 GLOBAL RESPONSE WRAPPER (IMPORTANT) */
app.use((req, res, next) => {
  res.success = (data, message = "Success") => {
    return res.status(200).json({
      success: true,
      message,
      data,
      error: null,
    });
  };

  res.fail = (message = "Error", status = 400) => {
    return res.status(status).json({
      success: false,
      message,
      data: null,
      error: message,
    });
  };

  next();
});

/* ---------------- ROUTES ---------------- */

/* Public */
app.use("/api/auth", authRoutes);

/* Protected */
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/profile", authMiddleware, profileRoutes);

app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/study-tasks", authMiddleware, studyTaskRoutes);
app.use("/api/subjects", authMiddleware, subjectRoutes);
app.use("/api/planning", authMiddleware, planningRoutes);
app.use("/api/auto-task", authMiddleware, autoTaskRoutes);

app.use("/api/progress", authMiddleware, progressRoutes);
app.use("/api/studyLog", authMiddleware, studyLogRoutes);
app.use("/api/completion", authMiddleware, completionRoutes);
app.use("/api/streak", authMiddleware, streakRoutes);

app.use("/api/summary", authMiddleware, summaryRoutes);
app.use("/api/reflection", authMiddleware, reflectionRoutes);
app.use("/api/patterns", authMiddleware, patternRoutes);

app.use("/api/goals", authMiddleware, goalRoutes);
app.use("/api/insights", authMiddleware, insightsRoutes);
app.use("/api/suggestions", authMiddleware, suggestionRoutes);
app.use("/api/health", authMiddleware, healthRoutes);

/* Stats route (already protected inside file if needed) */
app.use("/api/stats", authMiddleware, statsRoutes);
app.use("/api/ai", aiRoutes);

/* Root */
app.get("/", (req, res) => {
  res.send("API RUNNING");
});

app.get("/test", (req, res) => {
  res.json({ message: "API working" });
});

/* ---------------- ERROR HANDLER ---------------- */

// Apply rate limiters
app.use('/api', apiLimiter); // General API limit
app.use('/api/auth/login', authLimiter); // Stricter for login
app.use('/api/auth/register', authLimiter); // Stricter for register
app.use('/api/ai', aiLimiter); // Stricter for AI endpoints

app.use(errorHandler);
/* ---------------- DATABASE + SERVER START ---------------- */

const PORT = 5000;


console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });