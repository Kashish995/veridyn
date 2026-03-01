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
import "../styles/dashboard.css";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Skeleton from "../ui/Skeleton";

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

  const [loading, setLoading] = useState(true);

 useEffect(() => {
   console.log("Dashboard useEffect triggered");

  const fetchAllData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchDashboard(),
        fetchWeeklyStats(),
        fetchNextTask(),
        fetchWeeklyPerformance(),
        fetchInsights(),
        fetchHistory(),
        fetchLongestStreak(),
        fetchDisciplineHistory(),
        fetchMonthlyAggregate(),
      ]);

    } catch (error) {
      console.error("Dashboard loading failed:", error);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setLoading(false);
    }
  };

  fetchAllData();
}, []);


  /* =========================
     CHART DATA
  ========================= */
  const safeStats = Array.isArray(weeklyStats) ? weeklyStats : [];
  const safeHistory = Array.isArray(history) ? history : [];
  console.log("Loading:", loading);
  
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
    <div className="dashboard-grid">

      {/* Discipline Summary */}
    <Card title="Discipline">
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
        Tasks: {data?.today?.completed ?? 0} / {data?.today?.totalTasks ?? 0}
      </p>
    </>
  )}
</Card>

      {/* Today's Summary */}
      <Card title="Today's Summary">
        <p>
          Tasks: {data?.completedTasks ?? 0} / {data?.totalTasks ?? 0}
        </p>
        <p>Goal: {data?.goal?.dailyTarget ?? 0}</p>
        <p>Progress: {data?.progress ?? 0}%</p>
      </Card>

      {/* 7-Day Performance Chart */}
      <Card title="7-Day Performance">
        {loading ? (
          <Skeleton height="220px" />
        ) : (
          <Line data={chartData} />
        )}
      </Card>
      
           {/* Discipline History */}
      <Card title="Discipline History">
        {Array.isArray(history) && history.length > 0 ? (
          <Line data={historyChartData} />
        ) : (
          <p className="center-text">No history yet</p>
        )}
      </Card>

      {/* Performance Intelligence */}
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
          <p>
            <strong>Burnout Risk:</strong>{" "}
            {insights.burnout?.burnoutRisk
              ? `Yes (${insights.burnout?.severity})`
              : "No"}
          </p>
        </Card>
      )}

 
      {/* Monthly Performance */}
      {monthlyAggregate && (
        <Card title="Monthly Performance">
          <p>
            Average Completion: {monthlyAggregate.averageCompletionRate}%
          </p>
          <p>
            Average Discipline: {monthlyAggregate.averageDisciplineScore}
          </p>
          <p>Dominant Tier: {monthlyAggregate.dominantTier}</p>
          <p>Days Tracked: {monthlyAggregate.daysTracked}</p>
        </Card>
      )}

      {/* Longest Streak */}
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

    
      {/* Upcoming Task */}
      {nextTask && (
        <Card title="Upcoming Task">
          <p><strong>{nextTask.title}</strong></p>
          <p>
            {nextTask.startTime} – {nextTask.endTime}
          </p>
          <p>Priority: {nextTask.priority}</p>
        </Card>
      )}

      {/* Actions */}
      <Card title="Actions">
        <Button variant="primary" onClick={endDay}>
          End Day
        </Button>
        <Button variant="secondary" onClick={() => navigate("/tasks")}>
          Go to Tasks
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </Card>

    </div>
  </Layout>
);
};

export default Dashboard;
