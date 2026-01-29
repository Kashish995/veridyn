import { useEffect, useState } from "react";
import api from "../api/api";
import WeeklyChart from "../components/WeeklyChart";

function Insights() {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [goal, setGoal] = useState(null);
  const [reflection, setReflection] = useState(null);

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
        setLoading(true);

        const [
          todayRes,
          weeklyRes,
          patternRes,
          goalRes,
          reflectionRes,
          subjectRes,
        ] = await Promise.all([
          api.get("/summary/today"),
          api.get("/summary/weekly"),
          api.get("/patterns"),
          api.get("/goal"),
          api.get("/reflection/today"),
          api.get("/insights/subjects"),
        ]);

        setToday(todayRes.data);
        setWeekly(weeklyRes.data);
        setPatterns(patternRes.data.patterns || []);
        setGoal(goalRes.data);
        setReflection(reflectionRes.data);

        setSubjectStats(subjectRes.data.subjects || []);
        setWeakest(subjectRes.data.weakest || "");
        setStrongest(subjectRes.data.strongest || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load insights");
      } finally {
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
  if (!today || !weekly || !goal) return <p>Incomplete data</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Insights</h1>

      <div>
        <h3>Today</h3>
        <p>Chapters studied: {today.chaptersStudied}</p>
        <p>Tasks: {today.completedTasks} / {today.totalTasks}</p>
        <p>Streak: {today.streakStatus}</p>
        <button onClick={useFreeze}>Use Freeze</button>
        {freezeMessage && <p>{freezeMessage}</p>}
        <p>Feedback: {today.feedback}</p>
      </div>

      <div>
        <h3>Weekly</h3>
        <WeeklyChart weekly={weekly} />
      </div>

      <div>
        <h3>Goal</h3>
        <p>Daily target: {goal.dailyTarget}</p>
      </div>

      <div>
        <h3>Subject Analytics</h3>
        {subjectStats.map((s) => (
          <p key={s.name}>{s.name}: {s.chapters}</p>
        ))}
        {weakest && <p>Weakest: {weakest}</p>}
        {strongest && <p>Strongest: {strongest}</p>}
      </div>

      <div>
        <h3>Patterns</h3>
        {patterns.map((p, i) => <p key={i}>• {p}</p>)}
      </div>

      <div>
        <h3>Reflection</h3>
        {reflection ? (
          <p>{reflection.reason} — {reflection.note}</p>
        ) : (
          <>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select reason</option>
              <option value="distraction">Distraction</option>
              <option value="fatigue">Fatigue</option>
              <option value="poor planning">Poor planning</option>
              <option value="lack of motivation">Lack of motivation</option>
            </select>
            <input value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={submitReflection}>Save</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Insights;
