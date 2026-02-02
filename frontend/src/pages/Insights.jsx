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
  const [freezeMessage, setFreezeMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "15px",
  backgroundColor: "#fafafa",
  };

  const fetchData = async () => {
  try {
    const todayRes = await api.get("/summary/today");
    const weeklyRes = await api.get("/summary/weekly");
    const patternRes = await api.get("/patterns");
    const goalRes = await api.get("/goals");
    const suggestionRes = await api.get("/suggestions");

    setToday(todayRes.data);
    setWeekly(weeklyRes.data);
    setPatterns(patternRes.data.patterns || []);
    setGoal(goalRes.data || { dailyTarget: 1 });
    setSuggestion(suggestionRes.data);

    try {
      const reflectionRes = await api.get("/reflection/today");
      setReflection(reflectionRes.data);
    } catch {
      setReflection(null);
    }

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
    await api.post("/reflection", { reason, note });
    const res = await api.get("/reflection/today");
    setReflection(res.data);
  };

  const useFreeze = async () => {
    try {
      const res = await api.post("/streak/freeze");
      setFreezeMessage(res.data.message);
    } catch (err) {
      setFreezeMessage("Freeze failed");
    }
  };

  if (loading) return <p>Loading today’s data...</p>;
  if (!today || !weekly || !goal) return <p>Failed to load insights.</p>;


  return (
    <div style={{ padding: "20px" }}>
      <h1>Insights</h1>

      <h3>Today</h3>
      <p>Tasks: {today.completedTasks} / {today.totalTasks}</p>
      <p>Streak: {today.streakStatus}</p>
      <p>Feedback: {today.feedback}</p>

      <button onClick={useFreeze}>Use Streak Freeze</button>
      {freezeMessage && <p>{freezeMessage}</p>}

    {/* SMART SUGGESTION */}
      {suggestion && (
        <div style={{ ...cardStyle, backgroundColor: "#eef6ff" }}>
          <h3>Smart Suggestion</h3>
          <p><b>{suggestion.suggestion}</b></p>
          <p>Reason: {suggestion.reason}</p>
        </div>
      )}


      <h3>Weekly</h3>
      <WeeklyChart weekly={weekly} />

      <h3>Goal</h3>
      <p>Daily target: {goal.dailyTarget}</p>
      <button
        onClick={async () => {
          const res = await api.post("/goals/auto-adjust");
          alert(res.data.message);
          setGoal({ ...goal, dailyTarget: res.data.dailyTarget });
        }}
      >
        Auto Adjust Goal
      </button>

      {patterns.length > 0 && (
        <>
          <h3>Patterns</h3>
          {patterns.map((p, i) => (
            <p key={i}>• {p}</p>
          ))}
        </>
      )}

      <h3>Reflection</h3>
      {reflection ? (
        <p>{reflection.reason} — {reflection.note}</p>
      ) : (
        <>
          <select value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">Select reason</option>
            <option value="distraction">Distraction</option>
            <option value="fatigue">Fatigue</option>
            <option value="poor planning">Poor planning</option>
            <option value="lack of motivation">Lack of motivation</option>
          </select>

          <input
            placeholder="Note"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <button onClick={submitReflection}>Save Reflection</button>
        </>
      )}
    </div>
  );
}

export default Insights;
