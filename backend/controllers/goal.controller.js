import Goal from "../models/Goal.js";
import StudyLog from "../models/StudyLog.js";

export const getGoal = async (req, res) => {
  const userId = req.userId;

  let goal = await Goal.findOne({ userId });
  if (!goal) {
    goal = await Goal.create({ userId, dailyTarget: 2 });
  }

  res.json(goal);
};

export const adjustGoal = async (req, res) => {
  try {
    const userId = req.userId;

    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    const logs = await StudyLog.find({
      userId,
      date: { $in: last7Days },
    });

    let total = 0;
    logs.forEach((l) => (total += l.chaptersStudied));

    const avg = total / 7;

    let goal = await Goal.findOne({ userId });
    if (!goal) {
      goal = await Goal.create({ userId, dailyTarget: 2 });
    }

    let message = "Goal unchanged";

    if (avg < goal.dailyTarget * 0.6) {
      goal.dailyTarget = Math.max(1, goal.dailyTarget - 1);
      message = "Goal reduced due to low completion";
    } else if (avg > goal.dailyTarget * 0.85) {
      goal.dailyTarget += 1;
      message = "Goal increased due to strong consistency";
    }

    await goal.save();

    res.json({
      dailyTarget: goal.dailyTarget,
      message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to adjust goal" });
  }
};
