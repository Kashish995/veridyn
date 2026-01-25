import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    examDate: {
      type: Date,
      required: true
    },
    totalChapters: {
      type: Number,
      required: true
    },
    completedChapters: {
      type: Number,
      default: 0
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
