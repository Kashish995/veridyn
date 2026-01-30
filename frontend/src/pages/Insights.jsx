import { useEffect, useState } from "react";
import api from "../api/api";
import WeeklyChart from "../components/WeeklyChart";

function Insights() {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [goal, setGoal] = useState(null);
  const [reflection, setReflection] = useState(null);

  // Subject analytics
  const [subjectStats, setSubjectStats] = useState([]);
  const [weakest, setWeakest] = useState("");
  const [strongest, setStrongest] = useState("");

  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [freezeMessage, setFreezeMessage] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const todayRes = await api.get("/summary/today");
        const weeklyRes = await api.get("/summary/weekly");
        const patternsRes = await api.get("/patterns");
        const goalRes = await api.get("/goal");
        const reflectionRes = await api.get("/reflection/today");
        const subjectsRes = await api.get("/insights/subjects");

        setToday(todayRes.data);
        setWeekly(weeklyRes.data);
        setPatterns(patternsRes.data);
        setGoal(goalRes.data);
        setReflection(reflectionRes.data);
        setSubjectStats(subjectsRes.data);

        // optional strongest/weakest logic
        if (subjectsRes.data.length > 0) {
          const sorted = [...subjectsRes.data].sort(
            (a, b) => a.chapters - b.chapters
          );
          setWeakest(sorted[0].name);
          setStrongest(sorted[sorted.length - 1].name);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load insights", err);
        setError("Failed to load insights");
        setLoading(false);
      }
    };

    fetchInsights();
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

  if (loading) return <p>Loading insights...</p>;
  if (error) return <p>{error}</p>;
  if (!today || !goal) return <p>Incomplete data</p>;

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "16px",
    backgroundColor: "#fafafa",
  };

  const sectionTitle = { marginBottom: "10px" };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Insights</h1>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>Today</h3>
        <p>Chapters studied: {today.chaptersStudied}</p>
        <p>
          Tasks: {today.completedTasks} / {today.totalTasks}
        </p>
        <p>
          Streak:{" "}
          <b style={{ color: today.streakStatus === "active" ? "green" : "red" }}>
            {today.streakStatus}
          </b>
        </p>

        <button onClick={useFreeze}>Use Streak Freeze</button>
        {freezeMessage && <p>{freezeMessage}</p>}

        <p style={{ fontWeight: "bold" }}>Feedback: {today.feedback}</p>
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>Weekly Progress</h3>
        <WeeklyChart weekly={weekly} />
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>Goal</h3>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
          Daily target: {goal.dailyTarget}
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>Subject Analytics</h3>

        {subjectStats.length > 0 ? (
          subjectStats.map((s) => (
            <p key={s.name}>
              {s.name}: {s.chapters} chapters
            </p>
          ))
        ) : (
          <p>No subject data yet.</p>
        )}

        {weakest && <p style={{ color: "red" }}>Weakest: {weakest}</p>}
        {strongest && <p style={{ color: "green" }}>Strongest: {strongest}</p>}
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>Patterns</h3>
        {patterns.length > 0 ? (
          patterns.map((p, i) => (
            <p key={i}>• {p}</p>
          ))
        ) : (
          <p>No strong patterns detected yet.</p>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>Reflection</h3>

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
    </div>
  );
}

export default Insights;
