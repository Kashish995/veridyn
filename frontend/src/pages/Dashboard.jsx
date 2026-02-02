import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState(null);

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

  if (!data) return <p>Loading...</p>;

  return (
    <div style={styles.card}>
      <h2>📊 Daily Dashboard</h2>
      <p>Tasks done: {data.completedToday} / {data.totalToday}</p>
      <p>Daily goal: {data.dailyTarget}</p>
      <p>Progress: {data.progressPercent}%</p>

      <button onClick={endDay} style={styles.button}>
        End Day
      </button>
    </div>
  );
};

const styles = {
  card: {
    width: "300px",
    padding: "20px",
    borderRadius: "10px",
    background: "#f4f4f4",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  button: {
    marginTop: "10px",
    padding: "8px 12px",
    borderRadius: "5px",
    border: "none",
    background: "#4caf50",
    color: "white",
    cursor: "pointer"
  }
};

export default Dashboard;

