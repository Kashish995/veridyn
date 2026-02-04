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
        Authorization: `Bearer ${token}`
      }
    });
    setData(res.data);
  };

  const endDay = async () => {
    await axios.post("http://localhost:5000/api/goals/auto-adjust", {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    fetchDashboard(); // refresh after adjust
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  return (
  <div style={styles.container}>
    <div style={styles.card}>
      <h2 style={styles.title}>📊 Daily Dashboard</h2>

      <p>Tasks done: {data.completedToday} / {data.totalToday}</p>
      <p>Daily goal: {data.dailyTarget}</p>
      <p>Progress: {data.progressPercent}%</p>

      <div style={styles.barBg}>
        <div
          style={{
            ...styles.barFill,
            width: `${data.progressPercent}%`
          }}
        />
      </div>

      <p>🔥 Streak: {data.streak} days</p>

      <button onClick={endDay} style={styles.primaryBtn}>End Day</button>
      <button onClick={() => navigate("/tasks")} style={styles.secondaryBtn}>Go to Tasks</button>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
        style={styles.logoutBtn}
      >
        Logout
      </button>
    </div>
  </div>
);
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eef2f7"
  },
  card: {
    width: "320px",
    padding: "20px",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  title: {
    marginBottom: "10px",
    textAlign: "center"
  },
  barBg: {
    width: "100%",
    height: "10px",
    background: "#ddd",
    borderRadius: "6px",
    margin: "8px 0"
  },
  barFill: {
    height: "100%",
    background: "#4caf50",
    borderRadius: "6px"
  },
  primaryBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    background: "#4caf50",
    color: "white",
    cursor: "pointer"
  },
  secondaryBtn: {
    width: "100%",
    marginTop: "8px",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    background: "#2196f3",
    color: "white",
    cursor: "pointer"
  },
  logoutBtn: {
    width: "100%",
    marginTop: "8px",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    background: "#f44336",
    color: "white",
    cursor: "pointer"
  }
};


export default Dashboard;

