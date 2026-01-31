import express from "express";
console.log("🚀 THIS server.js is running");
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

/* Middleware */
import authMiddleware from "./middleware/auth.middleware.js";

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

dotenv.config();

const app = express();

/* Middleware */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(express.json());

/* Routes */
/* Public routes (NO auth) */
/* Public routes (NO TOKEN) */
app.use("/api/auth", authRoutes);

/* Protected routes (TOKEN REQUIRED) */
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

app.use("/api/goals", (req, res, next) => {
  console.log("🔥 /api/goals route HIT");
  next();
}, goalRoutes);

app.use("/api/insights", insightsRoutes);
app.use("/api/suggestions", authMiddleware, suggestionRoutes);

app.use("/api/health", healthRoutes);

app.get("/", (req, res) => {
  res.send("API RUNNING");
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR 👉", err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

/* Root test */

const PORT = 5000;

/* 🔥 CONNECT DB FIRST, THEN START SERVER ONCE */
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
