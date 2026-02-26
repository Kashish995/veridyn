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
      type: String,
      required: true
    },
    completionRate: {
      type: Number,
      required: true
    },
    disciplineScore: {
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

export default mongoose.model("DisciplineHistory", disciplineHistorySchema);