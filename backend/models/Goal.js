import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dailyTarget: {
      type: Number,
      default: 2,
      min: 1,
      max: 20,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
