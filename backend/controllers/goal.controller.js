import Goal from "../models/Goal.js";
import * as goalService from "../services/goalService.js";

// GET current goal (simple)
export const setGoal = async (req, res, next) => {
  try {
    const { dailyTarget, weeklyTarget } = req.body;

    const goal = await goalService.setUserGoal(
      req.userId,
      dailyTarget,
      weeklyTarget
    );

    return res.success(goal);
  } catch (error) {
    next(error);
  }
};

export const getGoal = async (req, res, next) => {
  try {
    const goal = await goalService.getUserGoal(req.userId);
    return res.success(goal);
  } catch (error) {
    next(error);
  }
};

// DASHBOARD (with today summary)
export const getGoalDashboard = async (req, res, next) => {
  try {
    const goal = await goalService.getUserGoal(req.userId);

    const today = req.todaySummary || {
      totalTasks: 0,
      completed: 0,
      missed: 0,
      completionRate: 0
    };

    return res.success({
      goal,
      today
    });

  } catch (error) {
    next(error);
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
