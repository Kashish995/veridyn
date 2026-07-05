import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 1 },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  status: { type: String, enum: ["not_started", "in_progress", "done"], default: "not_started" },
  scheduledDate: { type: Date, default: null },
  lastStudiedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Topic", topicSchema);