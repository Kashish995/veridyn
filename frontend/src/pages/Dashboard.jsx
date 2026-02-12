import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
    } catch (err) {
      console.error("End day error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>👋 Welcome Back</h2>

        {/* Discipline Score */}
        <div style={styles.scoreBox}>
          Discipline Score:{" "}
          <span style={styles.scoreValue}>
            {data.disciplineScore ?? 50} / 100
          </span>
        </div>

        {/* Stats */}
        <div style={styles.statRow}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Tasks</div>
            <div style={styles.statValue}>
              {data.completedTasks} / {data.totalTasks}
            </div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statLabel}>Goal</div>
            <div style={styles.statValue}>{data.goal}</div>
          </div>
        </div>

        {/* Progress */}
        <div style={styles.progressLabel}>Progress</div>
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

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <button style={styles.primaryBtn} onClick={endDay}>
            End Day
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/tasks")}
          >
            Go to Tasks
          </button>

          <button
            style={styles.dangerBtn}
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
    width: "420px",
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
  },

  scoreValue: {
    color: "#22c55e",
    fontWeight: "700",
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
  },

  primaryBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
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
};
