import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchDashboard = async () => {
    const res = await axios.get("http://localhost:5000/api/goals/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setData(res.data);
  };

  const endDay = async () => {
    await axios.post(
      "http://localhost:5000/api/goals/auto-adjust",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    fetchDashboard();
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
  <div style={styles.page}>
    <div style={styles.card}>
      <h2 style={styles.heading}>👋 Welcome back</h2>

      <div style={styles.statRow}>
        <div style={styles.statBox}>
          <p>Tasks</p>
          <h3>{data.completedToday} / {data.totalToday}</h3>
        </div>
        <div style={styles.statBox}>
          <p>Goal</p>
          <h3>{data.dailyTarget}</h3>
        </div>
      </div>

      <p style={{ marginTop: "10px" }}>Progress</p>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${data.progressPercent}%`,
          }}
        />
      </div>

      <p style={{ marginTop: "8px" }}>{data.progressPercent}% completed</p>

      <div style={styles.buttonRow}>
        <button style={styles.greenButton} onClick={endDay}>End Day</button>
        <button style={styles.blueButton} onClick={() => navigate("/tasks")}>
          Go to Tasks
        </button>
        <button style={styles.redButton} onClick={logout}>Logout</button>
      </div>
    </div>
  </div>
);
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    width: "380px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
    animation: "fadeIn 0.6s ease-in-out",
  },
  heading: {
    color: "#4f46e5",
    marginBottom: "15px",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  statBox: {
    flex: 1,
    background: "#eef2ff",
    borderRadius: "12px",
    padding: "10px",
  },
  progressBar: {
    width: "100%",
    height: "12px",
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#22c55e",
    borderRadius: "10px",
    transition: "width 0.5s ease",
  },
  buttonRow: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  greenButton: {
    background: "#22c55e",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  blueButton: {
    background: "#3b82f6",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  redButton: {
    background: "#ef4444",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
};


export default Dashboard;
