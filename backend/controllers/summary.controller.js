import StudyLog from "../models/StudyLog.js";
import Task from "../models/Task.js";

export const getTodaySummary = async (req, res) => {
  try {
    const userId = req.userId; // ✅ correct now
    const today = new Date().toISOString().split("T")[0];

    const studyLogs = await StudyLog.find({ userId, date: today });
    const totalChapters = studyLogs.reduce(
      (sum, log) => sum + log.chaptersStudied,
      0
    );

    const start = new Date(today);
    const end = new Date(today);
    end.setDate(end.getDate() + 1);

    const tasksToday = await Task.find({
      userId,
      dueDate: { $gte: start, $lt: end },
    });

    const plannedTasks = tasksToday.length;
    const completedTasks = tasksToday.filter(
      (t) => t.status === "completed"
    ).length;

    const streakStatus =
      plannedTasks > 0 && completedTasks >= plannedTasks
        ? "maintained"
        : "broken";

    let feedback = "Decent, but can improve";

    if (completedTasks >= plannedTasks && plannedTasks > 0) {
      feedback = "Strong consistency today";
    } else if (totalChapters >= 3 && completedTasks < plannedTasks) {
      feedback = "High effort, low efficiency";
    } else if (totalChapters === 0) {
      feedback = "Very low output today";
    }

    res.json({
      date: today,
      totalChapters,
      completedTasks,
      plannedTasks,
      streakStatus,
      feedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get daily summary" });
  }
};

export const getWeeklySummary = async (req, res) => {
  try {
    const userId = req.userId;

    const today = new Date();
    const last7Days = [];

    // Build last 7 dates (YYYY-MM-DD)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    // Fetch study logs
    const studyLogs = await StudyLog.find({
      userId,
      date: { $in: last7Days },
    });

    // Initialize map
    const dailyData = {};
    last7Days.forEach((d) => {
      dailyData[d] = 0;
    });

    // Sum chapters per day
    studyLogs.forEach((log) => {
      dailyData[log.date] += log.chaptersStudied;
    });

    const values = Object.values(dailyData);

    const bestDay = last7Days[values.indexOf(Math.max(...values))];
    const worstDay = last7Days[values.indexOf(Math.min(...values))];

    const total = values.reduce((a, b) => a + b, 0);
    const average = total / 7;

    res.json({
      days: dailyData,
      bestDay,
      worstDay,
      average: Number(average.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get weekly summary" });
  }
};
