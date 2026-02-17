import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  /* =========================
     FETCH DASHBOARD
  ========================= */
  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/goals/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("Dashboard error:", err.response?.data || err.message);
    }
  };

  /* =========================
     FETCH WEEKLY STATS
  ========================= */
  const fetchWeeklyStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/stats/weekly",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWeeklyStats(res.data);
    } catch (err) {
      console.error("Weekly stats error:", err.message);
    }
  };
  const fetchNextTask = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/tasks/next",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setNextTask(res.data);
  } catch (err) {
    console.error("Next task error:", err.message);
  }
};

  useEffect(() => {
    fetchDashboard();
    fetchWeeklyStats();
    fetchNextTask();
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
  const chartData = {
    labels: weeklyStats.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: "Completed",
        data: weeklyStats.map((d) => d.completed),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.3,
      },
      {
        label: "Missed",
        data: weeklyStats.map((d) => d.missed),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.3,
      },
    ],
  };
  const endDay = async () => {
  try {
    await axios.post(
      "http://localhost:5000/api/tasks/end-day",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchDashboard();
    fetchWeeklyStats();
  } catch (err) {
    console.error("End day error:", err.message);
  }
};

  return (
  <div style={styles.page}>
    <div style={styles.container}>

      {/* Discipline Card */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Discipline</h2>
        <div style={styles.scoreBox}>
          <span style={styles.scoreNumber}>
            {data.disciplineScore ?? 50}
          </span>
          <span style={styles.scoreTotal}> / 100</span>
        </div>
      </div>

      {/* Summary Card */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Today's Summary</h2>

        <div style={styles.statRow}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Tasks</div>
            <div style={styles.statValue}>
              {data.completedTasks} / {data.totalTasks}
            </div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statLabel}>Goal</div>
            <div style={styles.statValue}>
              {data.goal}
            </div>
          </div>
        </div>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${data.progress}%`,
            }}
          />
        </div>

        <div style={styles.progressText}>
          {data.progress}% completed
        </div>
      </div>
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
  {data.upcomingTask && (
  <div style={{ marginBottom: "20px" }}>
    <h3>Upcoming Task</h3>
    <div style={{
      background: "#f1f5f9",
      padding: "12px",
      borderRadius: "10px"
    }}>
      <div style={{ fontWeight: "600" }}>
        {data.upcomingTask.title}
      </div>
      <div style={{ fontSize: "13px", color: "#6b7280" }}>
        🕒 {data.upcomingTask.startTime} - {data.upcomingTask.endTime}
      </div>
    </div>
  </div>
)}

      {/* Weekly Graph Card */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Weekly Performance</h2>

        {weeklyStats.length > 0 ? (
          <Line data={chartData} />
        ) : (
          <p style={{ textAlign: "center" }}>
            No data yet
          </p>
        )}
      </div>
        <div style={styles.buttonRow}>
          <button style={styles.primaryBtn} onClick={endDay}>
            End Day
          </button>
        </div>

      {/* Buttons */}
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
  </div>
);

};

export default Dashboard;

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "60px",
  },

  card: {
    width: "450px",
    background: "white",
    padding: "28px",
    borderRadius: "20px",
    boxShadow:
      "0 12px 30px rgba(79,70,229,0.15), 0 0 40px rgba(236,72,153,0.08)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#4f46e5",
  },

  scoreBox: {
    textAlign: "center",
    marginBottom: "20px",
    fontWeight: "600",
    fontSize: "16px",
  },

  scoreValue: {
    color: "#22c55e",
    fontWeight: "700",
    marginLeft: "6px",
  },

  statRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },

  statBox: {
    flex: 1,
    background: "#eef2ff",
    borderRadius: "14px",
    padding: "14px",
    textAlign: "center",
  },

  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },

  statValue: {
    fontSize: "20px",
    fontWeight: "700",
    marginTop: "4px",
  },

  progressLabel: {
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "8px",
  },

  progressBar: {
    width: "100%",
    height: "12px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "10px",
  },

  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #4ade80)",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },

  progressText: {
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "20px",
  },

  buttonRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },

  secondaryBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  dangerBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
  width: "900px",
  display: "flex",
  flexDirection: "column",
  gap: "25px",
},

sectionTitle: {
  marginBottom: "15px",
  fontSize: "18px",
  fontWeight: "600",
},

scoreBox: {
  textAlign: "center",
  fontSize: "32px",
  fontWeight: "700",
},

scoreNumber: {
  color: "#22c55e",
},

scoreTotal: {
  color: "#6b7280",
  fontSize: "18px",
},

buttonRow: {
  display: "flex",
  gap: "15px",
  justifyContent: "center",
  marginTop: "20px",
},

primaryBtn: {
  background: "#4f46e5",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
},

logoutBtn: {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
},
buttonRow: {
  marginTop: "30px",
  display: "flex",
  justifyContent: "center",
},

primaryBtn: {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
},

};
