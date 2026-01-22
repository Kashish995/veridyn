import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import healthRoutes from "./routes/health.routes.js";
import studyTaskRoutes from "./routes/studyTask.routes.js";

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
