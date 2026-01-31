import StudyLog from "../models/StudyLog.js";
import Task from "../models/Task.js";

export const getTomorrowSuggestion = async (req, res) => {
  try {
    const userId = req.userId;

    const today = new Date();
    const last7Days = [];

    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    const logs = await StudyLog.find({
      userId,
      date: { $in: last7Days },
    });

    const subjectTotals = {};

    logs.forEach((l) => {
      const key = l.subjectId.toString();
      subjectTotals[key] =
        (subjectTotals[key] || 0) + l.chaptersStudied;
    });

    let weakestSubject = null;
    let min = Infinity;

    for (let s in subjectTotals) {
      if (subjectTotals[s] < min) {
        min = subjectTotals[s];
        weakestSubject = s;
      }
    }

    // yesterday completion
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const start = new Date(yesterday.toISOString().split("T")[0]);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: start, $lt: end },
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;

    let suggestion = "Revise your weakest subject";
    let reason = "Based on your last 7 days performance";

    if (weakestSubject) {
      suggestion = `Study your weakest subject (2 chapters) and complete 2 tasks`;
      reason = "Low study count in this subject recently";
    }

    if (total > 0 && completed / total < 0.7) {
      reason += " and low task completion yesterday";
    }

    res.json({ suggestion, reason });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate suggestion" });
  }
};
