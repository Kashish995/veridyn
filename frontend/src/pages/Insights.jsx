import { useEffect, useState } from "react";
import api from "../api/api"; // your axios instance
import WeeklyChart from "../components/WeeklyChart";

export default function Insights() {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [goal, setGoal] = useState(null);
  const [reflection, setReflection] = useState(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  const [
    todayRes,
    weeklyRes,
    patternRes,
    goalRes,
    reflectionRes,
  ] = await Promise.all([
    api.get("/summary/today"),
    api.get("/summary/weekly"),
    api.get("/patterns"),
    api.get("/goal"),
    api.get("/reflection/today"),
  ]);

  setToday(todayRes.data);
  setWeekly(weeklyRes.data);
  setPatterns(patternRes.data.patterns);
  setGoal(goalRes.data);
  setReflection(reflectionRes.data);
};


  const submitReflection = async () => {
  await api.post("/reflection", { reason, note });
  const res = await api.get("/reflection/today");
  setReflection(res.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Insights</h2>

      {!today ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3>Today</h3>
          <p>Chapters studied: {today.totalChapters}</p>
          <p>
            Tasks: {today.completedTasks} / {today.plannedTasks}
          </p>
          <p>Streak: {today.streakStatus}</p>
          <p>Feedback: {today.feedback}</p>
         <h3>Weekly Progress</h3>
          {weekly ? <WeeklyChart weekly={weekly} /> : <p>Loading chart...</p>}

          <h3>Goal</h3>
          <p>Daily target: {goal?.dailyTarget}</p>

          <h3>Patterns</h3>
          <h3>Patterns</h3>
            {patterns.length === 0 ? (
            <p>No strong patterns detected yet.</p>
            ) : (
            patterns.map((p, i) => <p key={i}>• {p}</p>)
            )}
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

        </>
      )}
    </div>
  );
}
