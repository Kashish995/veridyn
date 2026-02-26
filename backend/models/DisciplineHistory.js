// models/DisciplineHistory.js

import mongoose from "mongoose";

const disciplineHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    disciplineScore: {
      type: Number,
      required: true
    },
    completionRate: {
      type: Number,
      required: true
    },
    tier: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate records for same user + date
disciplineHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("DisciplineHistory", disciplineHistorySchema);