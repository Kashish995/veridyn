import express from "express";
import StudyLog from "../models/StudyLog.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getToday } from "../utils/date.util.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

// Get array of "YYYY-MM-DD" strings for the last N days (today inclusive)
const getLastNDates = (n) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

// Calculate current streak — consecutive days ending today where completionRate >= 1
const calcCurrentStreak = (logMap) => {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (logMap[dateStr] && logMap[dateStr].completionRate >= 1.0) {
      streak++;
    } else {
      break; // streak broken
    }
  }
  return streak;
};

// Calculate longest ever streak
const calcLongestStreak = (logs) => {
  if (!logs.length) return 0;

  // Build sorted unique date set of days where goal was hit
  const hitDates = logs
    .filter((l) => l.completionRate >= 1.0)
    .map((l) => l.date)
    .sort();

  if (!hitDates.length) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < hitDates.length; i++) {
    const prev = new Date(hitDates[i - 1]);
    const curr = new Date(hitDates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

// Discipline score: average completionRate over last 30 days, capped at 100
const calcDisciplineScore = (logs) => {
  if (!logs.length) return 0;
  const avg = logs.reduce((sum, l) => sum + l.completionRate, 0) / logs.length;
  return Math.min(Math.round(avg * 100), 100);
};

// Risk score: 0 = no risk, 100 = high risk
// Based on: how many of last 7 days were missed (completionRate < 1)
const calcRiskScore = (last7Logs, logMap) => {
  const last7Dates = getLastNDates(7);
  const missedDays = last7Dates.filter(
    (d) => !logMap[d] || logMap[d].completionRate < 1.0
  ).length;
  // 0 missed = risk 0, 7 missed = risk 100
  return Math.round((missedDays / 7) * 100);
};

// Risk label from score
const getRiskLabel = (score) => {
  if (score <= 25) return "LOW RISK";
  if (score <= 55) return "MEDIUM RISK";
  return "HIGH RISK";
};

// Performance trend based on comparing this week vs last week discipline
const getTrend = (thisWeekScore, lastWeekScore) => {
  const diff = thisWeekScore - lastWeekScore;
  if (Math.abs(diff) <= 5) return { label: "Stable", diff: 0 };
  if (diff > 0) return { label: "Improving", diff };
  return { label: "Declining", diff };
};

// ─────────────────────────────────────────────────────────
// 1. GET /api/stats/dashboard
// Main dashboard summary — discipline score, streak, risk, trend
// ─────────────────────────────────────────────────────────
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all timer-based logs (subjectId: null)
    const allLogs = await StudyLog.find({ userId, subjectId: null }).lean();

    // Build a map: { "2026-04-04": log }
    const logMap = {};
    allLogs.forEach((l) => { logMap[l.date] = l; });

    const last30Dates = getLastNDates(30);
    const last30Logs = last30Dates.map((d) => logMap[d]).filter(Boolean);

    const last7Dates = getLastNDates(7);
    const prevWeekDates = getLastNDates(14).slice(0, 7);
    const last7Logs = last7Dates.map((d) => logMap[d]).filter(Boolean);
    const prevWeekLogs = prevWeekDates.map((d) => logMap[d]).filter(Boolean);

    const disciplineScore = calcDisciplineScore(last30Logs);
    const thisWeekScore = calcDisciplineScore(last7Logs);
    const lastWeekScore = calcDisciplineScore(prevWeekLogs);
    const currentStreak = calcCurrentStreak(logMap);
    const riskScore = calcRiskScore(last7Logs, logMap);
    const trend = getTrend(thisWeekScore, lastWeekScore);

    // Chapter-based stats from subject logs
    const subjectLogs = await StudyLog.find({ userId, subjectId: { $ne: null } }).lean();
    const totalChapters = subjectLogs.reduce((s, l) => s + (l.chaptersStudied || 0), 0);

    // Count unique study days (days where any log exists)
    const allDates = [...new Set(allLogs.map((l) => l.date))];

    res.json({
      disciplineScore,
      currentStreak,
      riskScore,
      riskLabel: getRiskLabel(riskScore),
      trend: trend.label,
      trendDiff: trend.diff,
      totalDaysTracked: allDates.length,
      totalChaptersStudied: totalChapters,
      monthlyAverage: disciplineScore, // same as 30-day discipline score
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// ─────────────────────────────────────────────────────────
// 2. GET /api/stats/weekly
// Last 7 days — loggedMinutes + completionRate per day
// ─────────────────────────────────────────────────────────
router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const last7 = getLastNDates(7);

    const logs = await StudyLog.find({
      userId,
      subjectId: null,
      date: { $in: last7 },
    }).lean();

    const logMap = {};
    logs.forEach((l) => { logMap[l.date] = l; });

    const weeklyData = last7.map((date) => ({
      date,
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      loggedMinutes: logMap[date]?.loggedMinutes || 0,
      goalMinutes: logMap[date]?.goalMinutes || 120,
      completionRate: logMap[date]?.completionRate || 0,
      goalHit: (logMap[date]?.completionRate || 0) >= 1.0,
    }));

    res.json(weeklyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch weekly stats" });
  }
});

// ─────────────────────────────────────────────────────────
// 3. GET /api/stats/weekly-performance
// This week vs last week comparison
// ─────────────────────────────────────────────────────────
router.get("/weekly-performance", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const thisWeekDates = getLastNDates(7);
    const last14 = getLastNDates(14);
    const lastWeekDates = last14.slice(0, 7);

    const allDates = [...thisWeekDates, ...lastWeekDates];

    const logs = await StudyLog.find({
      userId,
      subjectId: null,
      date: { $in: allDates },
    }).lean();

    const logMap = {};
    logs.forEach((l) => { logMap[l.date] = l; });

    const summarize = (dates) => {
      const dayLogs = dates.map((d) => logMap[d]).filter(Boolean);
      const totalMinutes = dayLogs.reduce((s, l) => s + l.loggedMinutes, 0);
      const goalsHit = dayLogs.filter((l) => l.completionRate >= 1.0).length;
      const score = calcDisciplineScore(dayLogs);
      return { totalMinutes, goalsHit, score, daysActive: dayLogs.length };
    };

    const thisWeek = summarize(thisWeekDates);
    const lastWeek = summarize(lastWeekDates);
    const diff = thisWeek.score - lastWeek.score;

    res.json({
      thisWeek,
      lastWeek,
      scoreDiff: diff,
      trend: diff > 5 ? "Improving" : diff < -5 ? "Declining" : "Stable",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch weekly performance" });
  }
});

// ─────────────────────────────────────────────────────────
// 4. GET /api/stats/insights
// Behavioral analytics for Insights Hub
// ─────────────────────────────────────────────────────────
router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const allLogs = await StudyLog.find({ userId, subjectId: null }).lean();
    const logMap = {};
    allLogs.forEach((l) => { logMap[l.date] = l; });

    const last30 = getLastNDates(30).map((d) => logMap[d]).filter(Boolean);
    const last7 = getLastNDates(7).map((d) => logMap[d]).filter(Boolean);

    const disciplineScore = calcDisciplineScore(last30);
    const riskScore = calcRiskScore(last7, logMap);
    const currentStreak = calcCurrentStreak(logMap);
    const longestStreak = calcLongestStreak(allLogs);

    // Volatility: std deviation of completionRate over last 30 days
    const rates = last30.map((l) => l.completionRate);
    const mean = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
    const variance = rates.length
      ? rates.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / rates.length
      : 0;
    const volatility = +Math.sqrt(variance).toFixed(2);
    const volatilityLabel = volatility < 0.2 ? "Stable" : volatility < 0.5 ? "Moderate" : "High";

    // Best day of week
    const dayTotals = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    allLogs.forEach((l) => {
      const day = new Date(l.date).getDay();
      dayTotals[day].push(l.completionRate);
    });
    const dayAvgs = Object.entries(dayTotals).map(([day, rates]) => ({
      day: Number(day),
      avg: rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0,
    }));
    const bestDay = dayAvgs.sort((a, b) => b.avg - a.avg)[0];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    res.json({
      disciplineScore,
      riskScore,
      riskLabel: getRiskLabel(riskScore),
      currentStreak,
      longestStreak,
      volatility,
      volatilityLabel,
      bestDayOfWeek: bestDay ? dayNames[bestDay.day] : "N/A",
      totalDaysLogged: allLogs.length,
      goalsHitLast30: last30.filter((l) => l.completionRate >= 1.0).length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch insights" });
  }
});

// ─────────────────────────────────────────────────────────
// 5. GET /api/stats/history
// All study sessions, newest first
// ─────────────────────────────────────────────────────────
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      StudyLog.find({ userId, subjectId: null })
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      StudyLog.countDocuments({ userId, subjectId: null }),
    ]);

    res.json({
      logs: logs.map((l) => ({
        date: l.date,
        loggedMinutes: l.loggedMinutes,
        goalMinutes: l.goalMinutes,
        completionRate: l.completionRate,
        goalHit: l.completionRate >= 1.0,
      })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// ─────────────────────────────────────────────────────────
// 6. GET /api/stats/longest-streak
// All-time longest streak calculation
// ─────────────────────────────────────────────────────────
router.get("/longest-streak", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const allLogs = await StudyLog.find({ userId, subjectId: null })
      .sort({ date: 1 })
      .lean();

    const logMap = {};
    allLogs.forEach((l) => { logMap[l.date] = l; });

    const longestStreak = calcLongestStreak(allLogs);
    const currentStreak = calcCurrentStreak(logMap);

    res.json({ longestStreak, currentStreak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch streak data" });
  }
});

// ─────────────────────────────────────────────────────────
// 7. GET /api/stats/monthly-aggregate
// Monthly totals for charts
// ─────────────────────────────────────────────────────────
router.get("/monthly-aggregate", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const allLogs = await StudyLog.find({ userId, subjectId: null }).lean();

    // Group by "YYYY-MM"
    const monthMap = {};
    allLogs.forEach((l) => {
      const month = l.date.slice(0, 7); // "2026-04"
      if (!monthMap[month]) {
        monthMap[month] = { totalMinutes: 0, goalsHit: 0, daysLogged: 0, rates: [] };
      }
      monthMap[month].totalMinutes += l.loggedMinutes;
      monthMap[month].daysLogged += 1;
      monthMap[month].rates.push(l.completionRate);
      if (l.completionRate >= 1.0) monthMap[month].goalsHit += 1;
    });

    const monthly = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        label: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        totalMinutes: data.totalMinutes,
        goalsHit: data.goalsHit,
        daysLogged: data.daysLogged,
        avgCompletionRate: +(data.rates.reduce((a, b) => a + b, 0) / data.rates.length).toFixed(2),
      }));

    res.json(monthly);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch monthly aggregate" });
  }
});

// ─────────────────────────────────────────────────────────
// 8. GET /api/stats/calendar?year=2026
// Heatmap data for a full year
// ─────────────────────────────────────────────────────────
router.get("/calendar", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const year = req.query.year || new Date().getFullYear();

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const logs = await StudyLog.find({
      userId,
      subjectId: null,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    // Return { "2026-04-04": completionRate } map
    const calendarData = {};
    logs.forEach((l) => {
      calendarData[l.date] = l.completionRate;
    });

    res.json(calendarData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch calendar data" });
  }
});

export default router;