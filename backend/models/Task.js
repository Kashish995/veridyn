import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "missed"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
    },

    endTime: {
      type: String,
    },

    estimatedTime: {
      type: Number, // in minutes
      required: true,
    },

    suggestedForTomorrow: {
      type: Boolean,
      default: false,
    },

    splitFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject"
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, status: 1 });
export default Task;

