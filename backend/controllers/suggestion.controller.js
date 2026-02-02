import Task from "../models/Task.js";

export const getSuggestion = async (req, res) => {
  try {
    const userId = req.userId;

    const tasks = await Task.find({ userId });

    if (!tasks.length) {
      return res.json({
        suggestion: "Add your first task today",
        reason: "No tasks found for today"
      });
    }

    const completed = tasks.filter(t => t.status === "completed").length;
    const total = tasks.length;

    if (completed === 0) {
      return res.json({
        suggestion: "Start with the easiest task",
        reason: "You haven’t completed any task yet"
      });
    }

    if (completed < total) {
      return res.json({
        suggestion: "Finish one pending task",
        reason: "You already made progress today"
      });
    }

    return res.json({
      suggestion: "Great job! Plan tomorrow’s tasks",
      reason: "All tasks completed"
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to get suggestion" });
  }
};
