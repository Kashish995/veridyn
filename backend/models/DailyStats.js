import mongoose from "mongoose";

const dailyStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Number,
      default: 0,
    },
    missed: {
      type: Number,
      default: 0,
    },
    scoreChange: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const DailyStats = mongoose.model("DailyStats", dailyStatsSchema);
export default DailyStats;

