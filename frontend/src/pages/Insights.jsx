import { useState, useEffect } from 'react';
import RiskPredictor from '../components/RiskPredictor';
import StudyPatternAnalyzer from '../components/StudyPatternAnalyzer';
import SmartTaskPrioritizer from '../components/SmartTaskPrioritizer';
import WeeklyAIReport from '../components/WeeklyAIReport';
import AIRecommendationPanel from '../components/AIRecommendationPanel';
import AIExplanationPanel from '../components/AIExplanationPanel';
import AI7DayPlan from '../components/AI7DayPlan';
import ChatInterface from '../components/ChatInterface';
import '../styles/insights.css';
import '../styles/chat.css';
import api from '../api/api';

const TABS = [
  { id: 'overview',        icon: '▦',  label: 'Overview'       },
  { id: 'risk',            icon: '⚠',  label: 'Risk'           },
  { id: 'patterns',        icon: '◈',  label: 'Patterns'       },
  { id: 'recommendations', icon: '◎',  label: 'Recommendations'},
  { id: 'plan',            icon: '▸',  label: '7-Day Plan'     },
  { id: 'weekly',          icon: '▦',  label: 'Weekly Report'  },
  { id: 'chat',            icon: '✦',  label: 'AI Coach'       },
];

const FEATURES = [
  { icon: '⚠',  id: 'risk',            title: 'Risk Predictor',        desc: 'AI predicts discipline drops before they happen.' },
  { icon: '◈',  id: 'patterns',        title: 'Study Patterns',        desc: 'Find your peak productivity hours.' },
  { icon: '◎',  id: 'recommendations', title: 'Recommendations',       desc: '5 personalized tips based on your data.' },
  { icon: '▸',  id: 'plan',            title: '7-Day Action Plan',     desc: 'Structured daily goals to boost performance.' },
  { icon: '▦',  id: 'weekly',          title: 'Weekly AI Report',      desc: 'Comprehensive performance summary.' },
  { icon: '✦',  id: 'chat',            title: 'AI Coach',              desc: 'Chat with your personal productivity coach.' },
];

export default function Insights() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    api.get('/stats/dashboard')
      .then(r => { if (r.data.success) setDashboardData(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const aiUserData = {
    completedTasks: dashboardData?.completedTasks || 0,
    totalTasks:     dashboardData?.totalTasks     || 0,
    productivityScore: dashboardData?.completionRate || 0,
    recentActivities: [],
    weakAreas: [],
  };

  return (
    <div className="insights-page">
      <div className="insights-container">

        {/* Header */}
        <div className="insights-header">
          <div className="ai-badge">✦ AI Intelligence</div>
          <h1>Insights Hub</h1>
          <p>Behavioral analytics powered by AI — understand, predict, and improve.</p>
        </div>

        {/* Tabs */}
        <div className="insights-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="insights-content">

          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2>AI Features Overview</h2>
              <p className="tab-description">
                Six intelligence modules analyzing your behavioral data in real time.
              </p>
              <div className="features-grid">
                {FEATURES.map(f => (
                  <div
                    key={f.id}
                    className="feature-card"
                    onClick={() => setActiveTab(f.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="feature-icon">{f.icon}</span>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                    <div style={{ marginTop: 'var(--sp-4)', fontSize: '0.75rem', color: 'var(--indigo-light)', fontWeight: 600 }}>
                      Open →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="tab-content">
              <h2>Productivity Risk Analysis</h2>
              <p className="tab-description">
                Early warning system for discipline drops — analyzed from your real data.
              </p>
              {loading ? (
                <div style={{ padding: 'var(--sp-10)', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  Loading data...
                </div>
              ) : (
                <RiskPredictor userData={dashboardData} />
              )}
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="tab-content">
              <h2>Study Pattern Analysis</h2>
              <p className="tab-description">
                Discover your most productive hours and optimize your schedule.
              </p>
              <StudyPatternAnalyzer />
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="tab-content">
              <h2>AI Recommendations</h2>
              <p className="tab-description">
                Personalized productivity recommendations based on your behavioral patterns.
              </p>
              <AIRecommendationPanel userData={aiUserData} />
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="tab-content">
              <h2>7-Day Action Plan</h2>
              <p className="tab-description">
                A structured weekly plan with daily goals tailored to your performance data.
              </p>
              <AI7DayPlan userData={aiUserData} />
            </div>
          )}

          {activeTab === 'weekly' && (
            <div className="tab-content">
              <h2>Weekly AI Report</h2>
              <p className="tab-description">
                Comprehensive performance summary with trends, achievements, and improvement areas.
              </p>
              <WeeklyAIReport />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="tab-content">
              <h2>AI Productivity Coach</h2>
              <p className="tab-description">
                Chat with your personal AI coach — get real-time, data-aware guidance.
              </p>
              <ChatInterface />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
