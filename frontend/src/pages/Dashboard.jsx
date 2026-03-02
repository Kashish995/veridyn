import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import Layout from "../components/Layout";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import useDashboardData from "../hooks/useDashboardData";
import "../styles/dashboard.css";
import PageHeader from "../components/PageHeader";

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

  return (
    <Layout>
        <PageHeader
    title="Dashboard"
    subtitle="Track your discipline and performance"
  />
      <div className="dashboard-grid">

        {/* ===== Discipline ===== */}
        <Card title="Discipline" className="wide">
          {loading ? (
            <>
              <Skeleton height="32px" width="80px" />
              <Skeleton height="16px" width="120px" />
            </>
          ) : (
            <>
              <div className="score-number">
                {data?.today?.completionRate ?? 0}%
              </div>
              <p>
                Tasks: {data?.today?.completed ?? 0} /{" "}
                {data?.today?.totalTasks ?? 0}
              </p>
            </>
          )}
        </Card>

        {/* ===== Upcoming Task ===== */}
        <Card title="Upcoming Task">
          {loading ? (
            <Skeleton height="20px" />
          ) : nextTask ? (
            <>
              <p><strong>{nextTask.title}</strong></p>
              <p>{nextTask.startTime} – {nextTask.endTime}</p>
              <p>Priority: {nextTask.priority}</p>
            </>
          ) : (
            <p className="center-text">No upcoming task</p>
          )}
        </Card>

        {/* ===== 7-Day Performance ===== */}
        <Card title="7-Day Performance" className="wide">
          {loading ? (
            <Skeleton height="220px" />
          ) : safeStats.length > 0 ? (
            <Line data={chartData} />
          ) : (
            <p className="center-text">No weekly data</p>
          )}
        </Card>

        {/* ===== Discipline History ===== */}
        <Card title="Discipline History" className="wide">
          {loading ? (
            <Skeleton height="220px" />
          ) : safeHistory.length > 0 ? (
            <Line data={historyChartData} />
          ) : (
            <p className="center-text">No history data</p>
          )}
        </Card>

        {/* ===== Insights ===== */}
        {insights && (
          <Card title="Performance Intelligence">
            <p><strong>Tier:</strong> {insights.tier?.tier}</p>
            <p>
              <strong>Monthly Completion:</strong>{" "}
              {insights.monthly?.completionRate ?? 0}%
            </p>
            <p>
              <strong>Volatility:</strong>{" "}
              {insights.volatility?.stabilityLevel} (
              {insights.volatility?.volatilityScore})
            </p>
          </Card>
        )}

        {/* ===== Monthly Aggregate ===== */}
        {monthlyAggregate && (
          <Card title="Monthly Performance">
            <p>
              Average Completion: {monthlyAggregate.averageCompletionRate ?? 0}%
            </p>
            <p>
              Average Discipline: {monthlyAggregate.averageDisciplineScore ?? 0}
            </p>
            <p>Dominant Tier: {monthlyAggregate.dominantTier}</p>
            <p>Days Tracked: {monthlyAggregate.daysTracked}</p>
          </Card>
        )}

        {/* ===== Longest Streak ===== */}
        {longestStreak && (
          <Card title="Longest Streak">
            <p>{longestStreak.longestStreak} Days</p>
            {longestStreak.startDate && (
              <p>
                {longestStreak.startDate} → {longestStreak.endDate}
              </p>
            )}
          </Card>
        )}

        {/* ===== Actions ===== */}
        <Card title="Actions">
          <Button variant="primary" onClick={refreshDashboard}>
            Refresh
          </Button>
        </Card>

      </div>
    </Layout>
  );
}