import mongoose from "mongoose";

const streakHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    length: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("StreakHistory", streakHistorySchema);