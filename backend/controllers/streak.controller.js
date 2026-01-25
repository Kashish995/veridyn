import User from "../models/User.js";

export const useStreakFreeze = async (req, res) => {
  try {
    const userId = req.userId;

    const now = new Date();
    const week = `${now.getFullYear()}-${Math.ceil(
      (now.getDate() + 6 - now.getDay()) / 7
    )}`;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.streakFreezeUsed && user.streakFreezeWeek === week) {
      return res
        .status(400)
        .json({ message: "Streak freeze already used this week" });
    }

    user.streakFreezeUsed = true;
    user.streakFreezeWeek = week;

    await user.save();

    res.json({ message: "Streak freeze activated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
