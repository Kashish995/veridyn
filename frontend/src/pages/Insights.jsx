import { useEffect, useState } from "react";
import api from "../api/api";
import WeeklyChart from "../components/WeeklyChart";

function Insights() {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [goal, setGoal] = useState(null);
  const [reflection, setReflection] = useState(null);
  const [suggestion, setSuggestion] = useState(null); // 🔥 NEW

  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [freezeMessage, setFreezeMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [
        todayRes,
        weeklyRes,
        patternRes,
        goalRes,
        reflectionRes,
        suggestionRes, // 🔥 NEW
      ] = await Promise.all([
        api.get("/summary/today"),
        api.get("/summary/weekly"),
        api.get("/patterns"),
        api.get("/goal"),
        api.get("/reflection/today"),
        api.get("/suggestions"), // 🔥 NEW
      ]);

      setToday(todayRes.data);
      setWeekly(weeklyRes.data);
      setPatterns(patternRes.data.patterns || []);
      setGoal(goalRes.data || { dailyTarget: 1 });
      setReflection(reflectionRes.data);
      setSuggestion(suggestionRes.data); // 🔥 NEW
    } catch (err) {
      console.error("Error loading insights", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitReflection = async () => {
    try {
      await api.post("/reflection", { reason, note });
      const res = await api.get("/reflection/today");
      setReflection(res.data);
    } catch (err) {
      console.error("Error saving reflection", err);
    }
  };

  const useFreeze = async () => {
    try {
      const res = await api.post("/streak/freeze");
      setFreezeMessage(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || "Error using freeze";
      setFreezeMessage(msg);
    }
  };

  if (loading) return <p>Loading today’s data...</p>;
  if (!today || !weekly || !goal) return <p>Failed to load insights.</p>;

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    backgroundColor: "#fafafa",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Insights</h1>

      {/* TODAY */}
      <div style={cardStyle}>
        <h3>Today</h3>

        <p>Chapters studied: {today.chaptersStudied}</p>
        <p>
          Tasks: {today.completedTasks} / {today.totalTasks}
        </p>

        <p>
          Streak:{" "}
          <span
            style={{
              color: today.streakStatus === "active" ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {today.streakStatus}
          </span>
        </p>

        <button onClick={useFreeze}>Use Streak Freeze</button>
        {freezeMessage && <p>{freezeMessage}</p>}

        <p
          style={{
            color: today.feedback.includes("low") ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          Feedback: {today.feedback}
        </p>
      </div>

      {/* 🔥 SMART SUGGESTION (OPTION C PATH 1) */}
      {suggestion && (
        <div style={{ ...cardStyle, backgroundColor: "#eef6ff" }}>
          <h3>Smart Suggestion</h3>
          <p style={{ fontWeight: "bold" }}>{suggestion.suggestion}</p>
          <p style={{ fontStyle: "italic", color: "#555" }}>
            Reason: {suggestion.reason}
          </p>
        </div>
      )}

      {/* WEEKLY */}
      <h3>Weekly Progress</h3>
      <WeeklyChart weekly={weekly} />

      {/* GOAL */}
      <h3>Goal</h3>
      <p style={{ fontSize: "18px", fontWeight: "bold" }}>
        Daily target: {goal.dailyTarget}
      </p>
      
      <button
        onClick={async () => {
          const res = await api.post("/goal/auto-adjust");
          alert(res.data.message);
          setGoal({ ...goal, dailyTarget: res.data.dailyTarget });
        }}
      >
        Auto Adjust Goal
      </button>

      {/* PATTERNS */}
      {patterns.length > 0 && (
        <>
          <h3>Patterns</h3>
          {patterns.map((p, i) => (
            <p key={i}>• {p}</p>
          ))}
        </>
      )}

      {/* REFLECTION */}
      <h3>Reflection</h3>
      {reflection ? (
        <p>
          Today’s blocker: <b>{reflection.reason}</b> — {reflection.note}
        </p>
      ) : (
        <div>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Select reason</option>
            <option value="distraction">Distraction</option>
            <option value="fatigue">Fatigue</option>
            <option value="poor planning">Poor planning</option>
            <option value="lack of motivation">Lack of motivation</option>
            <option value="other">Other</option>
          </select>

          <br />

          <input
            type="text"
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <br />

          <button onClick={submitReflection}>Save Reflection</button>
        </div>
      )}
    </div>
  );
}

export default Insights;
