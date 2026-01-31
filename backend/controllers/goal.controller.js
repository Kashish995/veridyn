import Goal from "../models/Goal.js";

export const getGoal = async (req, res) => {
  try {
    console.log("REQ.USERID:", req.userId);

    let goal = await Goal.findOne({ userId: req.userId });

    if (!goal) {
      goal = await Goal.create({
        userId: req.userId,
        dailyTarget: 2,
      });
    }

    res.json(goal);
  } catch (err) {
    console.error("GOAL ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
};
