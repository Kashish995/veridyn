import mongoose from "mongoose";

const doubtMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const doubtChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
  messages: [doubtMessageSchema],
}, { timestamps: true });

export default mongoose.model("DoubtChat", doubtChatSchema);