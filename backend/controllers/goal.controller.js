import Goal from "../models/Goal.js";

// GET current goal (simple)
export const getGoal = async (req, res) => {
  try {
    const userId = req.userId;

    let goal = await Goal.findOne({ userId });

    if (!goal) {
      goal = await Goal.create({ userId, dailyTarget: 2 });
    }

    res.json(goal);
  } catch (err) {
    console.error("GET GOAL ERROR:", err);
    res.status(500).json({ message: "Failed to get goal" });
  }
};

// DASHBOARD (with today summary)
export const getGoalDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const { completedTasks, totalTasks } = req.todaySummary;

    let goal = await Goal.findOne({ userId });

    if (!goal) {
      goal = await Goal.create({ userId, dailyTarget: 2 });
    }

    const progressPercent =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.json({
      dailyTarget: goal.dailyTarget,
      completedToday: completedTasks,
      totalToday: totalTasks,
      progressPercent,
      streak: goal.streak
    });

  } catch (err) {
    console.error("GOAL DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

// AUTO ADJUST GOAL (Option C logic)
export const autoAdjustGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const today = req.todaySummary;

    let goal = await Goal.findOne({ userId });

    if (!goal) {
      goal = await Goal.create({ userId, dailyTarget: 2 });
    }

    let newTarget = goal.dailyTarget;
      let message = "Goal unchanged";

      if (today.totalTasks > 0 && today.completedTasks === today.totalTasks) {
        newTarget = goal.dailyTarget + 1;
        goal.streak += 1;
        message = "Goal increased due to full completion";
      } else if (today.completedTasks < today.totalTasks / 2) {
        newTarget = Math.max(1, goal.dailyTarget - 1);
        goal.streak = 0;
        message = "Goal reduced due to low completion";
      }

      goal.dailyTarget = newTarget;
      await goal.save();

      res.json({
        dailyTarget: newTarget,
        streak: goal.streak,
        message
      });

  } catch (err) {
    console.error("AUTO GOAL ERROR:", err);
    res.status(500).json({ message: "Failed to auto-adjust goal" });
  }
};
