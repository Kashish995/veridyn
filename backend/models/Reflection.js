import mongoose from "mongoose";

const reflectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "distraction",
        "fatigue",
        "poor planning",
        "lack of motivation",
        "other",
      ],
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reflection", reflectionSchema);
