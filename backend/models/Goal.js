import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    dailyTarget: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    },
    weeklyTarget: {
      type: Number,
      required: true,
      min: 1,
      max: 350
    }
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);