import mongoose from "mongoose";

const studyTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    targetChapters: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("StudyTask", studyTaskSchema);
