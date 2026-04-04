// models/StudyLog.js — ADD these fields to your existing schema
import mongoose from "mongoose";

const studyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // "YYYY-MM-DD" — your existing getToday() format
    required: true,
  },

  // ── Your existing fields ──────────────────────────
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  chaptersStudied: {
    type: Number,
    default: 0,
  },

  // ── New timer fields ──────────────────────────────
  loggedMinutes: {
    type: Number,
    default: 0,
  },
  goalMinutes: {
    type: Number,
    default: 120,
  },
  completionRate: {
    type: Number,
    default: 0, // 0.0 → 1.0+
  },
}, { timestamps: true });

export default mongoose.model("StudyLog", studyLogSchema);