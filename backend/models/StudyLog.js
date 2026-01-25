import mongoose from "mongoose";

const studyLogSchema = new mongoose.Schema(
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
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    chaptersStudied: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("StudyLog", studyLogSchema);
