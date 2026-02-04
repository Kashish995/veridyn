import { useEffect, useState } from "react";
import api from "../api/api";
import WeeklyChart from "../components/WeeklyChart";

function Insights() {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [goal, setGoal] = useState(null);
  const [reflection, setReflection] = useState(null);
  const [suggestion, setSuggestion] = useState(null);

  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const todayRes = await api.get("/summary/today");
      const weeklyRes = await api.get("/summary/weekly");
      const patternRes = await api.get("/patterns");
      const goalRes = await api.get("/goals/dashboard");
      const reflectionRes = await api.get("/reflection/today");
      const suggestionRes = await api.get("/suggestions");

      setToday(todayRes.data);
      setWeekly(weeklyRes.data);
      setPatterns(patternRes.data.patterns || []);
      setGoal(goalRes.data);
      setReflection(reflectionRes.data);
      setSuggestion(suggestionRes.data);
    } catch (err) {
      console.error("Error loading insights", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!today || !weekly || !goal) return <p>Failed to load insights.</p>;

  const card = {
    background: "white",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  };

  return (
  <div style={styles.page}>
    <h1 style={styles.heading}>📊 Insights</h1>

    {/* TODAY CARD */}
    <div style={styles.card}>
      <h3>Today</h3>
      <p>
        Tasks: <b>{today.completedTasks}</b> / {today.totalTasks}
      </p>
      <p>
        Streak: 🔥 <b>{today.streakStatus}</b>
      </p>
      <p
        style={{
          color: today.feedback.includes("low") ? "#ef4444" : "#22c55e",
          fontWeight: "bold",
        }}
      >
        Feedback: {today.feedback}
      </p>
    </div>

    {/* SMART SUGGESTION */}
    {suggestion && (
      <div style={{ ...styles.card, background: "#eef6ff" }}>
        <h3>🤖 Smart Suggestion</h3>
        <p style={{ fontWeight: "bold" }}>{suggestion.suggestion}</p>
        <p style={{ color: "#555" }}>Reason: {suggestion.reason}</p>
      </div>
    )}

    {/* WEEKLY */}
    <div style={styles.card}>
      <h3>Weekly Progress</h3>
      <WeeklyChart weekly={weekly} />
    </div>

    {/* GOAL */}
    <div style={styles.card}>
      <h3>Goal</h3>
      <p style={{ fontSize: "18px", fontWeight: "bold" }}>
        Daily target: {goal.dailyTarget}
      </p>
      <button
        style={styles.blueButton}
        onClick={async () => {
          const res = await api.post("/goals/auto-adjust");
          alert(res.data.message);
          setGoal({ ...goal, dailyTarget: res.data.dailyTarget });
        }}
      >
        Auto Adjust Goal
      </button>
    </div>

    {/* PATTERNS */}
    {patterns.length > 0 && (
      <div style={styles.card}>
        <h3>Patterns</h3>
        {patterns.map((p, i) => (
          <p key={i}>• {p}</p>
        ))}
      </div>
    )}

    {/* REFLECTION */}
    <div style={styles.card}>
      <h3>Reflection</h3>
      {reflection ? (
        <p>
          Today’s blocker: <b>{reflection.reason}</b> — {reflection.note}
        </p>
      ) : (
        <div>
          <select
            style={styles.input}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">Select reason</option>
            <option value="distraction">Distraction</option>
            <option value="fatigue">Fatigue</option>
            <option value="poor planning">Poor planning</option>
            <option value="lack of motivation">Lack of motivation</option>
            <option value="other">Other</option>
          </select>

          <input
            style={styles.input}
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            style={styles.greenButton}
            onClick={async () => {
              await api.post("/reflection", { reason, note });
              fetchData();
            }}
          >
            Save Reflection
          </button>
        </div>
      )}
    </div>
  </div>
);
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
  },
  heading: {
    color: "#4f46e5",
    marginBottom: "20px",
    textAlign: "center",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "15px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },
  blueButton: {
    background: "#3b82f6",
    color: "white",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  greenButton: {
    background: "#22c55e",
    color: "white",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Insights;
