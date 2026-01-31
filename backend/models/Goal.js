import mongoose from "mongoose";

 export const goalSchema = new mongoose.Schema(
  {
    userId: {   // ✅ MUST be userId
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dailyTarget: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
