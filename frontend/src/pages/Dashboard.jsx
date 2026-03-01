import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [nextTask, setNextTask] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [weeklyPerformance, setWeeklyPerformance] = useState(null);
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);
  const [longestStreak, setLongestStreak] = useState(null);
  const [disciplineHistory, setDisciplineHistory] = useState([]);
  const [monthlyAggregate, setMonthlyAggregate] = useState(null);
  /* =========================
     FETCH DASHBOARD
  ========================= */
  const API = "http://localhost:5000/api";

const fetchDashboard = async () => {
  try {
    const res = await axios.get(`${API}/goals/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setData(res.data?.success ? res.data.data : res.data);
  } catch (err) {
    console.error("Dashboard error:", err.response?.data || err.message);
  }
};

const fetchWeeklyStats = async () => {
  try {
    const res = await axios.get(`${API}/stats/weekly`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setWeeklyStats(res.data?.success ? res.data.data || [] : []);
  } catch (err) {
    console.error("Weekly stats error:", err.message);
    setWeeklyStats([]);
  }
};

const fetchNextTask = async () => {
  try {
    const res = await axios.get(`${API}/tasks/next`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data?.success) {
      setNextTask(res.data.data);
    }
  } catch (err) {
    console.error("Next task error:", err.message);
  }
};

const fetchWeeklyPerformance = async () => {
  try {
    const res = await axios.get(`${API}/stats/weekly-performance`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data?.success) {
      setWeeklyPerformance(res.data.data);
    }
  } catch (err) {
    console.error("Weekly performance error:", err.message);
  }
};

const fetchInsights = async () => {
  try {
    const res = await axios.get(`${API}/stats/insights`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data?.success) {
      setInsights(res.data.data);
    }
  } catch (err) {
    console.error("Insights error:", err.message);
  }
};

const fetchHistory = async () => {
  try {
    const res = await axios.get(`${API}/stats/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setHistory(res.data?.success ? res.data.data || [] : []);
  } catch (err) {
    console.error("History fetch failed", err.message);
    setHistory([]);
  }
};
const fetchLongestStreak = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/stats/longest-streak",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      setLongestStreak(res.data.data);
    }
  } catch (err) {
    console.error("Longest streak error:", err.message);
  }
};

const fetchDisciplineHistory = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/stats/history",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      setDisciplineHistory(res.data.data);
    }
  } catch (err) {
    console.error("History error:", err.message);
  }
};

const fetchMonthlyAggregate = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/stats/monthly-aggregate",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      setMonthlyAggregate(res.data.data);
    }
  } catch (err) {
    console.error("Monthly aggregate error:", err.message);
  }
};

  useEffect(() => {
    fetchDashboard();
    fetchWeeklyStats();
    fetchNextTask();
    fetchWeeklyPerformance();
    fetchInsights();
    fetchHistory();

    fetchLongestStreak();
    fetchDisciplineHistory();
    fetchMonthlyAggregate();
  }, []);

  if (!data) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  /* =========================
     CHART DATA
  ========================= */
  const safeStats = Array.isArray(weeklyStats) ? weeklyStats : [];
  const safeHistory = Array.isArray(history) ? history : [];

const chartData = {
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
};

const historyChartData = {
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
};

const endDay = async () => {
  try {
    await axios.post(
      `${API}/tasks/end-day`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchDashboard();
    fetchWeeklyStats();
    fetchInsights();
    fetchHistory();
  } catch (err) {
    console.error("End day error:", err.message);
  }
};

 return (
  <Layout>
    <div style={styles.container}>

        {/* Discipline Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Discipline</h2>

          <div style={styles.scoreBox}>
            <span style={styles.scoreNumber}>
              {data?.disciplineScore ?? 50}
            </span>
            <span style={styles.scoreTotal}> / 100</span>
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            🔥 Streak: {data?.streak ?? 0} days
          </div>
        </div>

        {/* Today's Summary Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Today's Summary</h2>

          <div style={styles.statRow}>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Tasks</div>
              <div style={styles.statValue}>
                {data?.completedTasks ?? 0} / {data?.totalTasks ?? 0}
              </div>
            </div>

            <div style={styles.statBox}>
              <div style={styles.statLabel}>Goal</div>
              <div style={styles.statValue}>
                {data?.goal?.dailyTarget ?? 0}
              </div>
            </div>
          </div>

          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${data?.progress ?? 0}%`,
              }}
            />
          </div>

          <div style={styles.progressText}>
            {data?.progress ?? 0}% completed
          </div>
        </div>

        {/* 7-Day Performance Card */}
        {weeklyPerformance && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>📊 7-Day Performance</h2>

            <div style={{ fontSize: "28px", fontWeight: "700" }}>
              {weeklyPerformance.completionRate ?? 0}%
            </div>

            <div
              style={{
                marginTop: "8px",
                fontWeight: "600",
                color:
                  weeklyPerformance.category === "Focused"
                    ? "#22c55e"
                    : weeklyPerformance.category === "Average"
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            >
              {weeklyPerformance.category}
            </div>
          </div>
        )}

        {/* Performance Intelligence */}
        {insights && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>🧠 Performance Intelligence</h2>

            <div style={{ marginBottom: "10px" }}>
              <strong>Tier:</strong>{" "}
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background:
                    insights.tier?.tier === "Elite"
                      ? "#dcfce7"
                      : insights.tier?.tier === "Focused"
                      ? "#dbeafe"
                      : insights.tier?.tier === "Average"
                      ? "#fef3c7"
                      : "#fee2e2",
                }}
              >
                {insights.tier?.tier}
              </span>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>Monthly Completion:</strong>{" "}
              {insights.monthly?.completionRate ?? 0}%
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>Volatility:</strong>{" "}
              {insights.volatility?.stabilityLevel} (
              {insights.volatility?.volatilityScore})
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>Burnout Risk:</strong>{" "}
              {insights.burnout?.burnoutRisk
                ? `Yes (${insights.burnout?.severity})`
                : "No"}
            </div>

            {insights.burnout?.burnoutRisk && (
              <div
                style={{
                  background: "#fef3c7",
                  padding: "10px",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
              >
                ⚠️ Recent performance drop detected. Consider reducing load.
              </div>
            )}

            <div
              style={{
                marginTop: "12px",
                fontSize: "14px",
                background: "#f8fafc",
                padding: "10px",
                borderRadius: "10px",
                color: "#374151",
              }}
            >
              {insights.burnout?.burnoutRisk
                ? "Your recent performance has dropped sharply. Consider reducing task load."
                : insights.volatility?.stabilityLevel === "Unstable"
                ? "Your productivity pattern is inconsistent. Focus on routine stabilization."
                : insights.tier?.tier === "Elite"
                ? "You're operating at peak discipline. Maintain this structure."
                : "Build consistency to improve performance tier."}
            </div>
          </div>
        )}
        {longestStreak && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>🏆 Longest Streak</h2>

            <div style={{ fontSize: "28px", fontWeight: "700" }}>
              {longestStreak.longestStreak} Days
            </div>

            {longestStreak.startDate && (
              <div style={{ fontSize: "14px", marginTop: "8px" }}>
                {longestStreak.startDate} → {longestStreak.endDate}
              </div>
            )}
          </div>
        )}
        {/* Upcoming Task */}
        {nextTask && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>⏰ Upcoming Task</h2>

            <div style={{ fontWeight: "600", marginBottom: "6px" }}>
              {nextTask.title}
            </div>

            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              {nextTask.startTime} – {nextTask.endTime}
            </div>

            <div
              style={{
                marginTop: "6px",
                fontSize: "13px",
                fontWeight: "600",
                color:
                  nextTask.priority === "high"
                    ? "#ef4444"
                    : nextTask.priority === "medium"
                    ? "#f59e0b"
                    : "#22c55e",
              }}
            >
              Priority: {nextTask.priority}
            </div>
          </div>
        )}

        {/* Weekly Graph */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Weekly Performance</h2>

          {Array.isArray(weeklyStats) && weeklyStats.length > 0 ? (
            <Line data={chartData} />
          ) : (
            <p style={{ textAlign: "center" }}>No data yet</p>
          )}
        </div>

          {disciplineHistory.length > 0 && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>📈 Discipline History</h2>

              <Line
                data={{
                  labels: disciplineHistory.map(d => d.date.slice(5)),
                  datasets: [
                    {
                      label: "Discipline Score",
                      data: disciplineHistory.map(d => d.disciplineScore),
                      borderColor: "#4f46e5",
                      backgroundColor: "rgba(79,70,229,0.2)",
                      tension: 0.3
                    }
                  ]
                }}
              />
            </div>
          )}
          {monthlyAggregate && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>📅 Monthly Performance</h2>

              <div>Average Completion: {monthlyAggregate.averageCompletionRate}%</div>
              <div>Average Discipline: {monthlyAggregate.averageDisciplineScore}</div>
              <div>Dominant Tier: {monthlyAggregate.dominantTier}</div>
              <div>Days Tracked: {monthlyAggregate.daysTracked}</div>
            </div>
          )}
          
                  {/* Discipline History */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Discipline History</h2>

          {history.length > 0 ? (
            <Line data={historyChartData} />
          ) : (
            <p style={{ textAlign: "center" }}>No history yet</p>
          )}
        </div>

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <button style={styles.primaryBtn} onClick={endDay}>
            End Day
          </button>
        </div>

        <div style={styles.buttonRow}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/tasks")}
          >
            Go to Tasks
          </button>

          <button
            style={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>

      </div>
  </Layout>
);
};

export default Dashboard;

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    width: "100%",
  },

  container: {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
},

  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
  },

  scoreBox: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
  },

  scoreNumber: {
    fontSize: "40px",
    fontWeight: "700",
    color: "#22c55e",
  },

  scoreTotal: {
    fontSize: "18px",
    color: "#6b7280",
  },

  statRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px",
  },

  statBox: {
    flex: 1,
    background: "#f1f5f9",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "center",
  },

  statLabel: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "6px",
  },

  statValue: {
    fontSize: "20px",
    fontWeight: "600",
  },

  progressBar: {
    width: "100%",
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "8px",
  },

  progressFill: {
    height: "100%",
    background: "#6366f1",
    transition: "width 0.3s ease",
  },

  progressText: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
  },

  buttonRow: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginTop: "12px",
  },

  primaryBtn: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    background: "#6366f1",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },

  logoutBtn: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    background: "#ef4444",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
};