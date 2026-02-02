import Goal from "../models/Goal.js";

// GET current goal (simple)
export const getGoal = async (req, res) => {
  try {
    const userId = req.userId;

    const goal = await Goal.findOneAndUpdate(
      { userId },
      { $setOnInsert: { dailyTarget: 2 } },
      { new: true, upsert: true }
    );

    res.json(goal);
  } catch (err) {
    console.error("GET GOAL ERROR 👉", err);
    res.status(500).json({ message: "Failed to get goal" });
  }
};


// DASHBOARD (goal + today summary)
export const getGoalDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const { completedTasks, totalTasks } = req.todaySummary;

    const goal = await Goal.findOneAndUpdate(
      { userId },
      { $setOnInsert: { dailyTarget: 2 } },
      { new: true, upsert: true }
    );

    const progressPercent =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.json({
      dailyTarget: goal.dailyTarget,
      completedToday: completedTasks,
      totalToday: totalTasks,
      progressPercent
    });
  } catch (err) {
    console.error("GOAL DASHBOARD ERROR 👉", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};


// AUTO adjust goal based on performance
export const autoAdjustGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const today = req.todaySummary;

    if (!today) {
      return res.status(400).json({ message: "Today summary not available" });
    }

    const goal = await Goal.findOneAndUpdate(
      { userId },
      { $setOnInsert: { dailyTarget: 2 } },
      { new: true, upsert: true }
    );

    let newTarget = goal.dailyTarget;
    let message = "Goal unchanged";

    if (today.completedTasks < today.totalTasks / 2) {
      newTarget = Math.max(1, goal.dailyTarget - 1);
      message = "Goal reduced due to low completion";
    } else if (today.completedTasks === today.totalTasks) {
      newTarget = goal.dailyTarget + 1;
      message = "Goal increased due to full completion";
    }

    goal.dailyTarget = newTarget;
    await goal.save();

    res.json({ dailyTarget: newTarget, message });
  } catch (err) {
    console.error("AUTO GOAL ERROR 👉", err);
    res.status(500).json({ message: "Failed to auto-adjust goal" });
  }
};