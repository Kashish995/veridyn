import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    streakFreezeUsed: {
      type: Boolean,
      default: false,
    },
    streakFreezeWeek: {
      type: String, // YYYY-WW
    },

  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
