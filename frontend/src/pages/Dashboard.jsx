import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import Layout from "../components/Layout";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import useDashboardData from "../hooks/useDashboardData";
import "../styles/dashboard.css";
import PageHeader from "../components/PageHeader";
import Badge from "../ui/Badge";
import { motion } from "framer-motion";
import ProductivityHeatmap from "../components/ProductivityHeatmap";

export default function Dashboard() {
  const {
    data,
    weeklyStats,
    nextTask,
    insights,
    history,
    longestStreak,
    monthlyAggregate,
    loading,
    refreshDashboard,
  } = useDashboardData();

  const safeStats = Array.isArray(weeklyStats) ? weeklyStats : [];
  const safeHistory = Array.isArray(history) ? history : [];
 
  /* =========================
     MEMOIZED CHART DATA
  ========================= */

  const chartData = useMemo(
    () => ({
      labels: safeStats.map((d) => d.date?.slice(5) || ""),
      datasets: [
        {
          label: "Completed",
          data: safeStats.map((d) => d.completed || 0),
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.2)",
          tension: 0.3,
        },
        {
          label: "Missed",
          data: safeStats.map((d) => d.missed || 0),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.2)",
          tension: 0.3,
        },
      ],
    }),
    [safeStats]
  );

  const historyChartData = useMemo(
    () => ({
      labels: safeHistory.map((h) => h.date || ""),
      datasets: [
        {
          label: "Discipline Score",
          data: safeHistory.map((h) => h.disciplineScore || 0),
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.2)",
          tension: 0.3,
        },
      ],
    }),
    [safeHistory]
  );

  /* =========================
   PERFORMANCE METRICS
========================= */

const completionRate = data?.today?.completionRate ?? 0;

/* ---------- Tier Classification ---------- */

const performanceTier =
  completionRate >= 85
    ? "Elite"
    : completionRate >= 70
    ? "Gold"
    : completionRate >= 50
    ? "Silver"
    : "Bronze";

/* ---------- Sort History ---------- */

const sortedHistory = [...safeHistory].sort(
  (a, b) => new Date(a.date) - new Date(b.date)
);

const scores = sortedHistory.map((h) => h.disciplineScore);

/* ---------- Intelligent Trend (3-day average vs previous 3-day average) ---------- */

let difference = 0;

if (scores.length >= 6) {
  const recent = scores.slice(-3);
  const previous = scores.slice(-6, -3);

  const recentAvg =
    recent.reduce((a, b) => a + b, 0) / recent.length;

  const previousAvg =
    previous.reduce((a, b) => a + b, 0) / previous.length;

  difference = Math.round(recentAvg - previousAvg);
} else if (scores.length >= 2) {
  // fallback if not enough data
  difference =
    scores[scores.length - 1] - scores[scores.length - 2];
}

/* ---------- Trend Classification ---------- */

let trend = "Stable";

if (difference >= 5) {
  trend = "Strong Improvement";
} else if (difference > 0) {
  trend = "Improving";
} else if (difference <= -5) {
  trend = "Strong Decline";
} else if (difference < 0) {
  trend = "Declining";
}

/* ---------- Real Volatility (Standard Deviation) ---------- */

const average =
  scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;

const variance =
  scores.length > 0
    ? scores.reduce(
        (sum, val) => sum + Math.pow(val - average, 2),
        0
      ) / scores.length
    : 0;

const volatility = Number(Math.sqrt(variance).toFixed(2));

/* ---------- Risk Level ---------- */

let riskLevel = "Low";

if (volatility > 20) {
  riskLevel = "High";
} else if (volatility > 10) {
  riskLevel = "Moderate";
}

/* ---------- Performance Intelligence Message ---------- */

let performanceMessage = "";
let performanceTone = "neutral";

if (riskLevel === "High") {
  performanceMessage =
    "High behavioral instability detected. Prioritize consistency.";
  performanceTone = "danger";
} else if (riskLevel === "Moderate") {
  performanceMessage =
    "Moderate fluctuations. Stabilize daily execution.";
  performanceTone = "warning";
} else if (trend === "Strong Improvement") {
  performanceMessage =
    "Strong upward momentum. Maintain this execution pattern.";
  performanceTone = "success";
} else if (trend === "Strong Decline") {
  performanceMessage =
    "Performance declining sharply. Immediate correction needed.";
  performanceTone = "danger";
} else if (trend === "Improving") {
  performanceMessage =
    "Gradual improvement detected. Keep building consistency.";
  performanceTone = "success";
} else if (trend === "Declining") {
  performanceMessage =
    "Slight downward trend. Refocus and tighten execution.";
  performanceTone = "warning";
} else {
  performanceMessage =
    "Stable performance. Maintain structured discipline.";
  performanceTone = "neutral";
}
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

return (
  <Layout>
    <PageHeader
      title="Dashboard"
      subtitle="Track your discipline and performance"
    />

    <motion.div
      className="dashboard-grid"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {/* ===== Discipline ===== */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <Card title="Discipline" className="wide">
          {loading ? (
            <>
              <Skeleton height="32px" width="80px" />
              <Skeleton height="16px" width="120px" />
            </>
          ) : (
            <>
              <div className="metric-value">
                {completionRate}%
              </div>

              <Badge variant={performanceTier.toLowerCase()}>
                {performanceTier}
              </Badge>

              <p className="muted-text">
                Tasks: {data?.today?.completed ?? 0} /{" "}
                {data?.today?.totalTasks ?? 0}
              </p>
            </>
          )}
        </Card>
      </motion.div>

      {/* ===== Trend ===== */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <Card title="Trend">
          <div className="trend-icon">
            {trend === "Improving" ? "📈" : "📉"}
          </div>

          <div
            className={`trend-label ${
              trend === "Improving" ? "trend-up" : "trend-down"
            }`}
          >
            {trend}
          </div>

          <p className="muted-text">
            Change: {difference > 0 ? "+" : ""}
            {difference}
          </p>
        </Card>
      </motion.div>

      {/* ===== Performance Insight ===== */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <Card title="Performance Insight">
          <p className={`tone-${performanceTone}`}>
            {performanceMessage}
          </p>
        </Card>
      </motion.div>

      {/* ===== Upcoming Task ===== */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <Card title="Upcoming Task">
          {loading ? (
            <Skeleton height="20px" />
          ) : nextTask ? (
            <>
              <p><strong>{nextTask.title}</strong></p>
              <p className="muted-text">
                {nextTask.startTime} – {nextTask.endTime}
              </p>
              <p className="muted-text">
                Priority: {nextTask.priority}
              </p>
            </>
          ) : (
            <p className="center-text">No upcoming task</p>
          )}
        </Card>
      </motion.div>

      {/* ===== 7-Day Performance ===== */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <Card title="7-Day Performance" className="wide">
          {loading ? (
            <Skeleton height="220px" />
          ) : safeStats.length > 0 ? (
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p className="center-text">No weekly data</p>
          )}
        </Card>
      </motion.div>

      {/* ===== Discipline History ===== */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <Card title="Discipline History" className="wide">
          {loading ? (
            <Skeleton height="220px" />
          ) : safeHistory.length > 0 ? (
            <div className="chart-container">
              <Line data={historyChartData} />
            </div>
          ) : (
            <p className="center-text">No history data</p>
          )}
        </Card>
      </motion.div>

      {/* ===== Performance Intelligence ===== */}
      {insights && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card title="Performance Intelligence">
            <p><strong>Tier:</strong> {insights.tier?.tier}</p>
            <p><strong>Monthly Completion:</strong> {insights.monthly?.completionRate ?? 0}%</p>
            <p>
              <strong>Volatility:</strong>{" "}
              {insights.volatility?.stabilityLevel} (
              {insights.volatility?.volatilityScore})
            </p>
          </Card>
        </motion.div>
      )}

      {/* ===== Monthly Performance ===== */}
      {monthlyAggregate && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card title="Monthly Performance">
            <p>Average Completion: {monthlyAggregate.averageCompletionRate ?? 0}%</p>
            <p>Average Discipline: {monthlyAggregate.averageDisciplineScore ?? 0}</p>
            <p>Dominant Tier: {monthlyAggregate.dominantTier}</p>
            <p>Days Tracked: {monthlyAggregate.daysTracked}</p>
          </Card>
        </motion.div>
      )}

      {/* ===== Longest Streak ===== */}
      {longestStreak && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card title="Longest Streak">
            <p>{longestStreak.longestStreak} Days</p>
            {longestStreak.startDate && (
              <p className="muted-text">
                {longestStreak.startDate} → {longestStreak.endDate}
              </p>
            )}
          </Card>
        </motion.div>
      )}

      {/* ===== Actions ===== */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <Card title="Actions">
          <Button variant="primary" onClick={refreshDashboard}>
            Refresh
          </Button>
        </Card>
      </motion.div>
      {/* ===== Productivity Heatmap ===== */}
      <motion.div
        className="calendar-card"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <Card title="Productivity Calendar">
          <ProductivityHeatmap />
        </Card>
      </motion.div>
    </motion.div>
  </Layout>
);
}