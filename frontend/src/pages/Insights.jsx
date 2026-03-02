import { useEffect, useState } from "react";
import api from "../api/api";
import WeeklyChart from "../components/WeeklyChart";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Card from "../ui/Card";
import Button from "../ui/Button";
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
  <Layout>
    <PageHeader
      title="Insights"
      subtitle="Analyze trends and performance intelligence"
    />

    <div className="dashboard-grid">

      {/* TODAY CARD */}
      <Card title="Today">
        <p>
          Tasks: <b>{today.completedTasks}</b> / {today.totalTasks}
        </p>
        <p>
          Streak: 🔥 <b>{today.streakStatus}</b>
        </p>
        <p
          style={{
            color: today.feedback?.includes("low")
              ? "var(--danger)"
              : "var(--success)",
            fontWeight: "600",
          }}
        >
          Feedback: {today.feedback}
        </p>
      </Card>

      {/* SMART SUGGESTION */}
      {suggestion && (
        <Card title="Smart Suggestion" className="wide">
          <p style={{ fontWeight: 600 }}>{suggestion.suggestion}</p>
          <p style={{ color: "var(--text-muted)" }}>
            Reason: {suggestion.reason}
          </p>
        </Card>
      )}

      {/* WEEKLY */}
      <Card title="Weekly Progress" className="wide">
        <WeeklyChart weekly={weekly} />
      </Card>

      {/* GOAL */}
      <Card title="Goal">
        <p style={{ fontSize: "18px", fontWeight: 600 }}>
          Daily target: {goal.dailyTarget}
        </p>

        <Button
          variant="primary"
          onClick={async () => {
            const res = await api.post("/goals/auto-adjust");
            alert(res.data.message);
            setGoal({ ...goal, dailyTarget: res.data.dailyTarget });
          }}
        >
          Auto Adjust Goal
        </Button>
      </Card>

      {/* PATTERNS */}
      {patterns.length > 0 && (
        <Card title="Patterns">
          {patterns.map((p, i) => (
            <p key={i}>• {p}</p>
          ))}
        </Card>
      )}

      {/* REFLECTION */}
      <Card title="Reflection">
        {reflection ? (
          <p>
            Today’s blocker: <b>{reflection.reason}</b> — {reflection.note}
          </p>
        ) : (
          <>
            <select
              className="input"
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
              className="input"
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <Button
              variant="success"
              onClick={async () => {
                await api.post("/reflection", { reason, note });
                fetchData();
              }}
            >
              Save Reflection
            </Button>
          </>
        )}
      </Card>

    </div>
  </Layout>
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
