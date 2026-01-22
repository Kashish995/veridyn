import mongoose from "mongoose";

const studyTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
    },

    deadline: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const StudyTask = mongoose.model("StudyTask", studyTaskSchema);
export default StudyTask;