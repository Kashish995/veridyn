import express from "express";
import mongoose from "mongoose"
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import healthRoutes from "./routes/health.routes.js";

dotenv.config(); // MUST be at top

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api", healthRoutes);
app.use("/api", userRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });


// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
