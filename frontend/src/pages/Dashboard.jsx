import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from "react-chartjs-2";
import useDashboardData from "../hooks/useDashboardData";
import ProductivityCalendar from '../components/ProductivityCalendar';
import "../styles/dashboard.css";
import "../styles/calendar.css";
import { useDueTopics } from "../hooks/useDueTopics";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/* ─── Chart options for dark theme ─── */
const darkChartOptions = (label) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 }, boxWidth: 12 }
    },
    tooltip: {
      backgroundColor: '#1a2338',
      borderColor: 'rgba(99,102,241,0.3)',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      padding: 12,
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(99,120,200,0.08)' },
      ticks: { color: '#475569', font: { family: 'JetBrains Mono', size: 11 } }
    },
    y: {
      grid: { color: 'rgba(99,120,200,0.08)' },
      ticks: { color: '#475569', font: { family: 'JetBrains Mono', size: 11 } }
    }
  }
});

/* ─── Tier config ─── */
const getTier = (rate) => {
  if (rate >= 85) return { label: 'ELITE',  cls: 'tier-elite',  color: '#f59e0b' };
  if (rate >= 70) return { label: 'GOLD',   cls: 'tier-gold',   color: '#f97316' };
  if (rate >= 50) return { label: 'SILVER', cls: 'tier-silver', color: '#94a3b8' };
  return              { label: 'BRONZE', cls: 'tier-bronze', color: '#a16207' };
};

/* ─── Risk config ─── */
const getRisk = (score) => {
  if (score >= 60) return { label: 'HIGH',   color: '#f43f5e', dot: '#f43f5e' };
  if (score >= 30) return { label: 'MEDIUM', color: '#f59e0b', dot: '#f59e0b' };
  return              { label: 'LOW',    color: '#10d9a0', dot: '#10d9a0' };
};

export default function Dashboard() {
  const {
    data, weeklyStats, nextTask,
    insights, history, longestStreak,
    monthlyAggregate, loading, refreshDashboard,
  } = useDashboardData();

  const { dueToday, atRisk } = useDueTopics(); 
  const safeStats   = Array.isArray(weeklyStats) ? weeklyStats : [];
  const safeHistory = Array.isArray(history) ? history : [];

  /* ─── Metrics ─── */
  const completionRate = data?.today?.completionRate ?? 0;
  const currentStreak  = data?.currentStreak ?? 0;

  const sortedHistory = [...safeHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const scores = sortedHistory.map(h => h.disciplineScore ?? 0);

  const avgScore = scores.length ? scores.reduce((a,b) => a+b, 0) / scores.length : 0;
  const variance = scores.length ? scores.reduce((s,v) => s + Math.pow(v - avgScore, 2), 0) / scores.length : 0;
  const volatility = Math.round(Math.sqrt(variance));

  let diff = 0;
  if (scores.length >= 6) {
    const r = scores.slice(-3), p = scores.slice(-6, -3);
    diff = Math.round(r.reduce((a,b)=>a+b,0)/r.length - p.reduce((a,b)=>a+b,0)/p.length);
  } else if (scores.length >= 2) {
    diff = Math.round(scores.at(-1) - scores.at(-2));
  }

  const trend = diff >= 5 ? 'Strong Improvement' : diff > 0 ? 'Improving' :
                diff <= -5 ? 'Strong Decline'     : diff < 0 ? 'Declining' : 'Stable';

  const riskScore = Math.min(100,
    (completionRate < 50 ? 25 : completionRate < 70 ? 15 : 0) +
    (currentStreak < 3 ? 25 : 0) +
    (volatility > 15 ? 20 : volatility > 10 ? 10 : 0) +
    (diff <= -5 ? 30 : diff < 0 ? 15 : 0)
  );

  const tier  = getTier(completionRate);
  const risk  = getRisk(riskScore);

  const token = localStorage.getItem("token");
const userName = (() => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.name || payload.username || "there";
  } catch {
    return "there";
  }
})();

  /* ─── Chart data ─── */
  const weeklyChartData = useMemo(() => ({
    labels: safeStats.map(d => d.date?.slice(5) ?? ''),
    datasets: [
      {
        label: 'Completed',
        data: safeStats.map(d => d.completed ?? 0),
        borderColor: '#10d9a0',
        backgroundColor: 'rgba(16,217,160,0.08)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10d9a0',
        pointRadius: 4,
      },
      {
        label: 'Missed',
        data: safeStats.map(d => d.missed ?? 0),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244,63,94,0.08)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#f43f5e',
        pointRadius: 4,
      },
    ],
  }), [safeStats]);

  const historyChartData = useMemo(() => ({
    labels: sortedHistory.map(h => h.date ?? ''),
    datasets: [{
      label: 'Discipline Score',
      data: scores,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#6366f1',
      pointRadius: 3,
    }],
  }), [sortedHistory, scores]);

  /* ─── Trend config ─── */
  const trendCfg = {
    'Strong Improvement': { color: '#10d9a0', icon: '↑↑', dir: 'up' },
    'Improving':          { color: '#10d9a0', icon: '↑',  dir: 'up' },
    'Stable':             { color: '#6366f1', icon: '→',  dir: 'flat' },
    'Declining':          { color: '#f59e0b', icon: '↓',  dir: 'down' },
    'Strong Decline':     { color: '#f43f5e', icon: '↓↓', dir: 'down' },
  }[trend] ?? { color: '#6366f1', icon: '→', dir: 'flat' };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span className="loading-text">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-greeting">Good day, {userName}</div>
          <h1 className="dashboard-title">Performance Dashboard</h1>
          <div className="dashboard-date">
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
          </div>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary btn-sm" onClick={refreshDashboard}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Next Task Banner ── */}
      {nextTask && (
        <div className="next-task-card">
          <div className="next-task-dot" />
          <div>
            <div className="next-task-label">Up Next</div>
            <div className="next-task-title">{nextTask.title}</div>
          </div>
          {nextTask.startTime && (
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {nextTask.startTime}
            </div>
          )}
          <span style={{
            padding: '2px 10px', borderRadius: 'var(--r-full)',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            background: nextTask.priority === 'high' ? 'var(--rose-subtle)' : nextTask.priority === 'medium' ? 'var(--amber-subtle)' : 'var(--emerald-subtle)',
            color: Task.priority === 'high' ? 'var(--rose)' : nextTask.priority === 'medium' ? 'var(--amber)' : 'var(--emerald)',
          }}>
            {nextTask.priority}
          </span>
        </div>
      )}

      {/* ── Next Task Banner ── */}
      {nextTask && (
        <div className="next-task-card">
          <div className="next-task-dot" />
          <div>
            <div className="next-task-label">Up Next</div>
            <div className="next-task-title">{nextTask.title}</div>
          </div>
          {nextTask.startTime && (
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {nextTask.startTime}
            </div>
          )}
          <span style={{
            padding: '2px 10px', borderRadius: 'var(--r-full)',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            background: nextTask.priority === 'high' ? 'var(--rose-subtle)' : nextTask.priority === 'medium' ? 'var(--amber-subtle)' : 'var(--emerald-subtle)',
            color: nextTask.priority === 'high' ? 'var(--rose)' : nextTask.priority === 'medium' ? 'var(--amber)' : 'var(--emerald)',
          }}>
            {nextTask.priority}
          </span>
        </div>
      )}

      {/* ── Study Topic Reminders ── */}
      {dueToday.length > 0 && (
        <div className="next-task-card" style={{ borderLeft: '3px solid var(--indigo)' }}>
          <div className="next-task-dot" style={{ background: 'var(--indigo)' }} />
          <div>
            <div className="next-task-label">Due Today</div>
            <div className="next-task-title">
              {dueToday.map(t => t.name).join(', ')}
            </div>
          </div>
          <span style={{
            padding: '2px 10px', borderRadius: 'var(--r-full)',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            background: 'var(--indigo-subtle)', color: 'var(--indigo)',
          }}>
            {dueToday.length} topic{dueToday.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {atRisk.length > 0 && (
        <div className="next-task-card" style={{ borderLeft: '3px solid var(--rose)' }}>
          <div className="next-task-dot" style={{ background: 'var(--rose)' }} />
          <div>
            <div className="next-task-label">Falling Behind</div>
            <div className="next-task-title">
              {atRisk.map(t => t.name).join(', ')}
            </div>
          </div>
          <span style={{
            padding: '2px 10px', borderRadius: 'var(--r-full)',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            background: 'var(--rose-subtle)', color: 'var(--rose)',
          }}>
            {atRisk.length} topic{atRisk.length > 1 ? 's' : ''} at risk
          </span>
        </div>
      )}


      {/* ── Primary Metrics ── */}
      <div className="section-header">
        <span className="section-title">Key Metrics</span>
      </div>
      <div className="metrics-grid">

        {/* Discipline Score */}
        <div className="metric-card c-indigo">
          <div className="metric-header">
            <div className="metric-icon c-indigo">◎</div>
            <div className={`badge badge-indigo`}>{tier.label}</div>
          </div>
          <div className="metric-value">{completionRate}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></div>
          <div className="metric-label">Discipline Score</div>
          <div style={{ marginTop: 'var(--sp-4)', height: 4, background: 'var(--bg-elevated)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
            <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--indigo)', borderRadius: 'var(--r-full)', transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-2)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{data?.today?.completed ?? 0} done</span>
            <span>{data?.today?.totalTasks ?? 0} total</span>
          </div>
        </div>

        {/* Trend */}
        <div className="metric-card c-emerald">
          <div className="metric-header">
            <div className="metric-icon c-emerald">↗</div>
            <div className={`badge badge-${trendCfg.dir === 'up' ? 'emerald' : trendCfg.dir === 'down' ? 'rose' : 'indigo'}`}>
              {trendCfg.icon}
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            {trend}
          </div>
          <div className="metric-label">Performance Trend</div>
          <div className={`metric-trend ${trendCfg.dir}`} style={{ color: trendCfg.color }}>
            {diff > 0 ? `+${diff}` : diff} pts vs previous period
          </div>
        </div>

        {/* Risk Level */}
        <div className="metric-card c-amber">
          <div className="metric-header">
            <div className="metric-icon c-amber">⚠</div>
            <div className="badge" style={{
              background: `rgba(${risk.label === 'HIGH' ? '244,63,94' : risk.label === 'MEDIUM' ? '245,158,11' : '16,217,160'},0.1)`,
              color: risk.color,
              border: `1px solid ${risk.color}33`,
            }}>
              {risk.label} RISK
            </div>
          </div>
          <div className="metric-value" style={{ color: risk.color }}>
            {riskScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div className="metric-label">Risk Score</div>
          <div style={{ marginTop: 'var(--sp-4)', height: 4, background: 'var(--bg-elevated)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
            <div style={{ width: `${riskScore}%`, height: '100%', background: risk.color, borderRadius: 'var(--r-full)', transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Current Streak */}
        <div className="metric-card c-cyan">
          <div className="metric-header">
            <div className="metric-icon c-cyan">◈</div>
            <div className="badge badge-cyan">STREAK</div>
          </div>
          <div className="metric-value" style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
            {currentStreak}
          </div>
          <div className="metric-label">Days in a Row</div>
          {longestStreak?.longestStreak > 0 && (
            <div className="metric-trend flat" style={{ marginTop: 'var(--sp-3)' }}>
              Best: {longestStreak.longestStreak} days
            </div>
          )}
        </div>

      </div>

      {/* ── Charts ── */}
      <div className="section-header">
        <span className="section-title">Analytics</span>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title" style={{ '--c': '#10d9a0' }}>7-Day Task Performance</div>
          {safeStats.length > 0 ? (
            <div style={{ height: 220 }}>
              <Line data={weeklyChartData} options={darkChartOptions('7-Day')} />
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
              <div className="empty-state-icon">◎</div>
              <div className="empty-state-title">No weekly data yet</div>
              <div className="empty-state-desc">Add tasks to see your performance chart</div>
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">Discipline Score History</div>
          {sortedHistory.length > 0 ? (
            <div style={{ height: 220 }}>
              <Line data={historyChartData} options={darkChartOptions('History')} />
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
              <div className="empty-state-icon">▦</div>
              <div className="empty-state-title">No history yet</div>
              <div className="empty-state-desc">Complete tasks to build your history</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="section-header">
        <span className="section-title">Performance Overview</span>
      </div>
      <div className="stats-grid">

        {/* Tier */}
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-4)' }}>
            Current Tier
          </div>
          <div className={`tier-badge ${tier.cls}`}>{tier.label}</div>
          <div style={{ marginTop: 'var(--sp-3)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {completionRate >= 85 ? 'Top 5% performance' :
             completionRate >= 70 ? 'Above average' :
             completionRate >= 50 ? 'Building momentum' : 'Getting started'}
          </div>
        </div>

        {/* Volatility */}
        <div className="stat-card">
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-4)' }}>
            Consistency
          </div>
          <div className="stat-num" style={{ color: volatility > 20 ? 'var(--rose)' : volatility > 10 ? 'var(--amber)' : 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
            {volatility}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>
            Volatility score
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: 'var(--sp-2)', color: volatility > 20 ? 'var(--rose)' : volatility > 10 ? 'var(--amber)' : 'var(--emerald)' }}>
            {volatility > 20 ? 'High instability' : volatility > 10 ? 'Moderate fluctuation' : 'Stable pattern'}
          </div>
        </div>

        {/* Monthly */}
        <div className="stat-card">
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-4)' }}>
            Monthly Average
          </div>
          <div className="stat-num" style={{ fontFamily: 'var(--font-mono)', color: 'var(--indigo-light)' }}>
            {monthlyAggregate?.averageCompletionRate ?? 0}<span style={{ fontSize: '1rem' }}>%</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>
            {monthlyAggregate?.daysTracked ?? 0} days tracked
          </div>
          {monthlyAggregate?.dominantTier && (
            <div style={{ fontSize: '0.75rem', marginTop: 'var(--sp-2)', color: 'var(--text-muted)' }}>
              Dominant tier: {monthlyAggregate.dominantTier}
            </div>
          )}
        </div>

      </div>

      {/* ── Streak Cards ── */}
      <div className="streaks-grid">
        <div className="streak-card">
          <div className="streak-icon">🔥</div>
          <div>
            <div className="streak-value" style={{ color: 'var(--amber)' }}>{currentStreak}</div>
            <div className="streak-label">Current Streak (days)</div>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon">🏆</div>
          <div>
            <div className="streak-value" style={{ color: 'var(--cyan)' }}>{longestStreak?.longestStreak ?? 0}</div>
            <div className="streak-label">Longest Streak (days)</div>
          </div>
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div className="section-header">
        <span className="section-title">Productivity Heatmap</span>
      </div>
      <div className="heatmap-card">
        <ProductivityCalendar />
      </div>

    </div>
  );
}
