import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// ROUTES
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import healthRoutes from "./routes/health.routes.js";

dotenv.config();

const app = express();

// 🔴 BODY PARSER — MUST COME BEFORE ROUTES
app.use(express.json());
app.use(cors());

// 🔐 AUTH ROUTES
// POST /api/auth/register
// POST /api/auth/login
app.use("/api/auth", authRoutes);

// 👤 USER ROUTES
// GET /api/users
// DELETE /api/users/:id
app.use("/api/users", userRoutes);

// ❤️ HEALTH CHECK
app.use("/api/health", healthRoutes);

// 🚀 START SERVER + DB
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
