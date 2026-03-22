import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import Layout from "../components/Layout";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import useDashboardData from "../hooks/useDashboardData";
import "../styles/dashboard.css";
import PageHeader from "../components/PageHeader";
import Badge from "../ui/Badge";
import { motion } from "framer-motion";
import ProductivityHeatmap from "../components/ProductivityHeatmap";
import AIRecommendationPanel from '../components/AIRecommendationPanel';
import AIExplanationPanel from '../components/AIExplanationPanel';
import AI7DayPlan from '../components/AI7DayPlan';
import RiskPredictor from '../components/RiskPredictor';
import StudyPatternAnalyzer from '../components/StudyPatternAnalyzer';
import SmartTaskPrioritizer from '../components/SmartTaskPrioritizer';
import WeeklyAIReport from '../components/WeeklyAIReport';
import ProgressRing from '../components/ProgressRing';

export default function Dashboard() {
  const {
    data,
    weeklyStats,
    nextTask,
    insights,
    history,
    longestStreak,
    monthlyAggregate,
    loading,
    refreshDashboard,
  } = useDashboardData();

  const safeStats = Array.isArray(weeklyStats) ? weeklyStats : [];
  const safeHistory = Array.isArray(history) ? history : [];
 
  /* =========================
     MEMOIZED CHART DATA
  ========================= */

  const chartData = useMemo(
    () => ({
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
    }),
    [safeStats]
  );

  const historyChartData = useMemo(
    () => ({
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
    }),
    [safeHistory]
  );

  /* =========================
   PERFORMANCE METRICS
========================= */

const completionRate = data?.today?.completionRate ?? 0;

/* ---------- Tier Classification ---------- */

const performanceTier =
  completionRate >= 85
    ? "Elite"
    : completionRate >= 70
    ? "Gold"
    : completionRate >= 50
    ? "Silver"
    : "Bronze";

/* ---------- Sort History ---------- */

const sortedHistory = [...safeHistory].sort(
  (a, b) => new Date(a.date) - new Date(b.date)
);

const scores = sortedHistory.map((h) => h.disciplineScore);

/* ---------- Intelligent Trend (3-day average vs previous 3-day average) ---------- */

let difference = 0;

if (scores.length >= 6) {
  const recent = scores.slice(-3);
  const previous = scores.slice(-6, -3);

  const recentAvg =
    recent.reduce((a, b) => a + b, 0) / recent.length;

  const previousAvg =
    previous.reduce((a, b) => a + b, 0) / previous.length;

  difference = Math.round(recentAvg - previousAvg);
} else if (scores.length >= 2) {
  // fallback if not enough data
  difference =
    scores[scores.length - 1] - scores[scores.length - 2];
}

/* ---------- Trend Classification ---------- */

let trend = "Stable";

if (difference >= 5) {
  trend = "Strong Improvement";
} else if (difference > 0) {
  trend = "Improving";
} else if (difference <= -5) {
  trend = "Strong Decline";
} else if (difference < 0) {
  trend = "Declining";
}

/* ---------- Real Volatility (Standard Deviation) ---------- */

const average =
  scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;

const variance =
  scores.length > 0
    ? scores.reduce(
        (sum, val) => sum + Math.pow(val - average, 2),
        0
      ) / scores.length
    : 0;

const volatility = Number(Math.sqrt(variance).toFixed(2));

/* ---------- Risk Level ---------- */

let riskLevel = "Low";

if (volatility > 20) {
  riskLevel = "High";
} else if (volatility > 10) {
  riskLevel = "Moderate";
}

/* ---------- Performance Intelligence Message ---------- */

let performanceMessage = "";
let performanceTone = "neutral";

if (riskLevel === "High") {
  performanceMessage =
    "High behavioral instability detected. Prioritize consistency.";
  performanceTone = "danger";
} else if (riskLevel === "Moderate") {
  performanceMessage =
    "Moderate fluctuations. Stabilize daily execution.";
  performanceTone = "warning";
} else if (trend === "Strong Improvement") {
  performanceMessage =
    "Strong upward momentum. Maintain this execution pattern.";
  performanceTone = "success";
} else if (trend === "Strong Decline") {
  performanceMessage =
    "Performance declining sharply. Immediate correction needed.";
  performanceTone = "danger";
} else if (trend === "Improving") {
  performanceMessage =
    "Gradual improvement detected. Keep building consistency.";
  performanceTone = "success";
} else if (trend === "Declining") {
  performanceMessage =
    "Slight downward trend. Refocus and tighten execution.";
  performanceTone = "warning";
} else {
  performanceMessage =
    "Stable performance. Maintain structured discipline.";
  performanceTone = "neutral";
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

const calendarValues = Array.isArray(data?.calendar)
  ? data.calendar
  : [];

  const aiUserData = {
  completedTasks: data?.today?.completed || 0,
  totalTasks: data?.today?.totalTasks || 0,
  studyHours: monthlyAggregate?.totalStudyHours || 0,
  productivityScore: completionRate || 0,
  recentActivities: weeklyStats.slice(-3).map(d => `${d.date}: ${d.completed}/${d.completed + d.missed} tasks`) || [],
  weakAreas: volatility > 15 ? ['Consistency', 'Daily Execution'] : trend === 'Declining' ? ['Task Completion', 'Focus'] : []
};

const planUserData = {
  currentProductivity: completionRate || 0,
  availableHoursPerDay: 5,
  subjects: ['DSA', 'Web Development', 'DBMS', 'System Design'],
  examDates: []
};

return (
  <Layout>
    <PageHeader
      title="Dashboard"
      subtitle="Track your discipline and performance"
    />

    <motion.div
      className="dashboard-grid"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {/* ===== Discipline ===== */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="metric-card gradient-blue">
          {loading ? (
            <>
              <Skeleton height="32px" width="80px" />
              <Skeleton height="16px" width="120px" />
            </>
          ) : (
            <>
              <div className="metric-label">Discipline Score</div>
              <ProgressRing 
                percentage={completionRate} 
                color="#ffffff"
              />
              <Badge variant={performanceTier.toLowerCase()}>
                {performanceTier}
              </Badge>
              <p className="muted-text" style={{ marginTop: '1rem' }}>
                Tasks: {data?.today?.completed ?? 0} / {data?.today?.totalTasks ?? 0}
              </p>
            </>
          )}
        </div>
      </motion.div>

     {/* ===== Trend ===== */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="metric-card gradient-green">
          <div className="metric-label">Performance Trend</div>
          <div className="trend-icon">
            {trend === "Improving" || trend === "Strong Improvement" ? "📈" : "📉"}
          </div>
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>
            {trend}
          </div>
          <p className="muted-text">
            Change: {difference > 0 ? "+" : ""}{difference} points
          </p>
        </div>
      </motion.div>

      {/* ===== Performance Insight ===== */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className={`metric-card ${
          performanceTone === 'success' ? 'gradient-green' :
          performanceTone === 'warning' ? 'gradient-orange' :
          performanceTone === 'danger' ? 'gradient-pink' :
          'gradient-purple'
        }`}>
          <div className="metric-label">Performance Intelligence</div>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {performanceTone === 'success' ? '✅' :
             performanceTone === 'warning' ? '⚠️' :
             performanceTone === 'danger' ? '🔴' : 'ℹ️'}
          </div>
          <p className="muted-text" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
            {performanceMessage}
          </p>
        </div>
      </motion.div>
{/* ===== Upcoming Task ===== */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div className="metric-card gradient-teal">
          <div className="metric-label">Next Up</div>
          {loading ? (
            <Skeleton height="20px" />
          ) : nextTask ? (
            <>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '1rem', marginBottom: '0.5rem' }}>
                {nextTask.title}
              </div>
              <p className="muted-text">
                ⏰ {nextTask.startTime} – {nextTask.endTime}
              </p>
              <p className="muted-text">
                Priority: <strong>{nextTask.priority}</strong>
              </p>
            </>
          ) : (
            <p className="muted-text" style={{ textAlign: 'center', padding: '2rem 0' }}>
              No upcoming task
            </p>
          )}
        </div>
      </motion.div>

      {/* ===== 7-Day Performance ===== */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <Card title="7-Day Performance" className="wide glass-card">
          {loading ? (
            <Skeleton height="220px" />
          ) : safeStats.length > 0 ? (
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p className="center-text">No weekly data</p>
          )}
        </Card>
      </motion.div>

     {/* ===== Discipline History ===== */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <Card title="Discipline History" className="wide glass-card">
          {loading ? (
            <Skeleton height="220px" />
          ) : safeHistory.length > 0 ? (
            <div className="chart-container">
              <Line data={historyChartData} options={chartOptions} />
            </div>
          ) : (
            <p className="center-text">No history data</p>
          )}
        </Card>
      </motion.div>

      {/* ===== Performance Intelligence ===== */}
      {insights && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="stat-card glass-card">
            <div className="stat-card-label">TIER</div>
            <div className="stat-card-value">{insights.tier?.tier}</div>
            <div className="stat-card-label" style={{ marginTop: '1rem' }}>Monthly Completion</div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
              {insights.monthly?.completionRate ?? 0}%
            </div>
            <div className="stat-card-label" style={{ marginTop: '1rem' }}>Volatility</div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
              {insights.volatility?.stabilityLevel}
            </div>
          </div>
        </motion.div>
      )}

     {/* ===== Monthly Performance ===== */}
      {monthlyAggregate && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="stat-card glass-card">
            <div className="stat-card-label">Monthly Average</div>
            <ProgressRing 
              percentage={monthlyAggregate.averageCompletionRate ?? 0}
              size={100}
              color="#667eea"
            />
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <div className="stat-card-label">Dominant Tier</div>
              <div className="stat-card-value" style={{ fontSize: '1.25rem' }}>
                {monthlyAggregate.dominantTier}
              </div>
              <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>
                Days Tracked: {monthlyAggregate.daysTracked}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== Longest Streak ===== */}
      {longestStreak && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="metric-card gradient-pink">
            <div className="metric-label">Longest Streak</div>
            <div className="metric-value">
              {longestStreak.longestStreak}
              <span style={{ fontSize: '2rem', marginLeft: '0.5rem' }}>🏆</span>
            </div>
            {longestStreak.startDate && (
              <p className="muted-text">
                {new Date(longestStreak.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(longestStreak.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </motion.div>
      )}
      
      {/* ===== Current Streak ===== */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="metric-card gradient-orange">
          <div className="metric-label">Current Streak</div>
          <div className="metric-value">
            {data?.currentStreak ?? 0}
            <span style={{ fontSize: '2rem', marginLeft: '0.5rem' }}>🔥</span>
          </div>
          <p className="muted-text">Days in a row</p>
        </div>
      </motion.div>

      {/* ===== Actions ===== */}
     {/* ===== Actions ===== */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div className="stat-card glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
          <Button 
            variant="primary" 
            onClick={refreshDashboard}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Refresh Dashboard
          </Button>
        </div>
      </motion.div>
      
      {/* ===== Productivity Heatmap ===== */}
      <motion.div
        className="calendar-card"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <Card title="Productivity Calendar">
          <ProductivityHeatmap
            values={Array.isArray(data?.calendar) ? data.calendar : []}
          />
        </Card>
      </motion.div>

       <motion.div
        className="wide"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <AIRecommendationPanel userData={aiUserData} />
      </motion.div>

      {/* ===== AI Performance Explanation ===== */}
      <motion.div
        className="wide"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <Card title="Performance Analysis">
          <div className="mb-4">
            <p className="text-lg">
              <strong>Current Productivity:</strong> {completionRate}%
            </p>
            <p className="text-sm text-gray-600">
              <strong>Trend:</strong> {trend} | <strong>Volatility:</strong> {volatility}
            </p>
          </div>
          <AIExplanationPanel
            metric="Overall Productivity Performance"
            currentValue={completionRate}
            trend={trend}
            context={`Completion rate: ${completionRate}%, Volatility: ${volatility}, Risk Level: ${riskLevel}, Current streak: ${data?.currentStreak || 0} days`}
          />
        </Card>
      </motion.div>

      {/* ===== AI 7-Day Improvement Plan ===== */}
      <motion.div
        className="wide"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <AI7DayPlan 
          userData={planUserData} 
          goals="Improve task completion consistency, maintain 85%+ productivity score, and build study discipline for Adobe internship preparation"
        />
      </motion.div>

      {/* ===== AI Risk Predictor ===== */}
      <motion.div
        className="wide"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <RiskPredictor
          weeklyStats={safeStats}
          history={safeHistory}
          currentStreak={data?.currentStreak || 0}
          completionRate={completionRate}
          volatility={volatility}
        />
      </motion.div>
      {/* ===== Study Pattern Analyzer ===== */}
      <motion.div
        className="wide"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <StudyPatternAnalyzer tasks={data?.tasks || []} />
      </motion.div>

      {/* ===== Smart Task Prioritizer ===== */}
      <motion.div
        className="wide"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <SmartTaskPrioritizer tasks={data?.tasks || []} />
      </motion.div>

      {/* ===== Weekly AI Report ===== */}
      <motion.div
        className="wide"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <WeeklyAIReport 
          weeklyStats={safeStats}
          history={safeHistory}
          currentStreak={data?.currentStreak || 0}
        />
      </motion.div>
    </motion.div>
  </Layout>
);
}