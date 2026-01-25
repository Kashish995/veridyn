import Reflection from "../models/Reflection.js";
import Task from "../models/Task.js";
import StudyLog from "../models/StudyLog.js";

export const getPatterns = async (req, res) => {
  try {
    const userId = req.userId;

    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    // 1. Reflection pattern
    const reflections = await Reflection.find({
      userId,
      date: { $in: last7Days },
    });

    const reasonCount = {};
    reflections.forEach((r) => {
      reasonCount[r.reason] = (reasonCount[r.reason] || 0) + 1;
    });

    let topReason = null;
    let max = 0;
    for (let r in reasonCount) {
      if (reasonCount[r] > max) {
        max = reasonCount[r];
        topReason = r;
      }
    }

    // 2. Task completion pattern
    const start = new Date(last7Days[0]);
    const end = new Date(last7Days[6]);
    end.setDate(end.getDate() + 1);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: start, $lt: end },
    });

    let lowCompletionDays = 0;
    let totalDays = 7;

    const completionByDay = {};

    last7Days.forEach((d) => {
      completionByDay[d] = { total: 0, completed: 0 };
    });

    tasks.forEach((t) => {
      const day = t.dueDate.toISOString().split("T")[0];
      if (completionByDay[day]) {
        completionByDay[day].total += 1;
        if (t.status === "completed") {
          completionByDay[day].completed += 1;
        }
      }
    });

    Object.values(completionByDay).forEach((d) => {
      if (d.total > 0 && d.completed / d.total < 0.5) {
        lowCompletionDays++;
      }
    });

    const messages = [];

    if (topReason) {
      messages.push(`Most common blocker: ${topReason}`);
    }

    if (lowCompletionDays >= 3) {
      messages.push("You often complete less than half of your tasks");
    }

    res.json({
      patterns: messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to detect patterns" });
  }
};
