import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import healthRoutes from "./routes/health.routes.js";
import studyTaskRoutes from "./routes/studyTask.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
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
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/study-tasks", studyTaskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/planning", planningRoutes);
app.use("/api/auto-task", autoTaskRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/study-log", studyLogRoutes);
app.use("/api/completion", completionRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/reflection", reflectionRoutes);
app.use("/api/patterns", patternRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/insights", insightsRoutes);
/* Root test */
app.get("/", (req, res) => {
  res.send("API RUNNING");
});

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
