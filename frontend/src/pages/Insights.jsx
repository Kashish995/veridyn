import { useState, useEffect } from 'react';
import AIRecommendationPanel from '../components/AIRecommendationPanel';
import AIExplanationPanel from '../components/AIExplanationPanel';
import AI7DayPlan from '../components/AI7DayPlan';
import RiskPredictor from '../components/RiskPredictor';
import StudyPatternAnalyzer from '../components/StudyPatternAnalyzer';
import SmartTaskPrioritizer from '../components/SmartTaskPrioritizer';
import WeeklyAIReport from '../components/WeeklyAIReport';
import ChatInterface from '../components/ChatInterface';
import '../styles/insights.css';
import '../styles/chat.css';
import api from '../api/api';

const Insights = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'risk', label: '⚠️ Risk Analysis', icon: '⚠️' },
    { id: 'patterns', label: '📈 Study Patterns', icon: '📈' },
    { id: 'priority', label: '🎯 Task Priority', icon: '🎯' },
    { id: 'weekly', label: '📅 Weekly Report', icon: '📅' },
    { id: 'recommendations', label: '💡 Recommendations', icon: '💡' },
    { id: 'explanations', label: '🔍 Explanations', icon: '🔍' },
    { id: 'plan', label: '📋 7-Day Plan', icon: '📋' },
    { id: 'chat', label: '💬 AI Coach', icon: '💬' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ NEW
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.get('/stats/dashboard');
    if (response.data.success) {
      setDashboardData(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="insights-container">
        <div className="insights-header">
          <h1>🤖 AI Insights Hub</h1>
          <p>Loading your productivity insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h1>🤖 AI Insights Hub</h1>
        <p>Unlock intelligent productivity insights powered by AI</p>
        <div className="ai-badge">
          <span>✨ Powered by Advanced AI</span>
        </div>
      </div>

      <div className="insights-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="insights-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <h2>📊 AI Features Overview</h2>
            <p className="tab-description">
              Explore powerful AI-driven tools to analyze your productivity, predict risks, and get personalized recommendations.
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">⚠️</div>
                <h3>Risk Predictor</h3>
                <p>Get early warnings about potential discipline drops and productivity risks.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Study Patterns</h3>
                <p>Discover your peak performance hours and optimal study schedules.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Task Prioritization</h3>
                <p>AI-powered task ranking based on urgency, importance, and context.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <h3>Weekly Reports</h3>
                <p>Comprehensive weekly performance summaries with actionable insights.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💡</div>
                <h3>Recommendations</h3>
                <p>Personalized productivity tips tailored to your behavior patterns.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>7-Day Action Plans</h3>
                <p>Structured improvement plans with daily goals and targets.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Metric Explanations</h3>
                <p>Understand what your discipline score and performance metrics mean.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>AI Coach</h3>
                <p>Chat with your personal AI productivity coach for real-time guidance.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="tab-content">
            <h2>⚠️ Productivity Risk Analysis</h2>
            <p className="tab-description">
              Get predictive insights about potential productivity drops before they happen.
            </p>
            <RiskPredictor userData={dashboardData} />
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="tab-content">
            <h2>📈 Study Pattern Analysis</h2>
            <p className="tab-description">
              Discover your most productive hours and optimize your schedule accordingly.
            </p>
            <StudyPatternAnalyzer />
          </div>
        )}

        {activeTab === 'priority' && (
          <div className="tab-content">
            <h2>🎯 Smart Task Prioritization</h2>
            <p className="tab-description">
              AI-powered task ranking to help you focus on what matters most.
            </p>
            <SmartTaskPrioritizer />
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="tab-content">
            <h2>📅 Weekly Performance Report</h2>
            <p className="tab-description">
              Comprehensive weekly summary with trends, achievements, and improvement areas.
            </p>
            <WeeklyAIReport />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="tab-content">
            <h2>💡 AI Recommendations</h2>
            <p className="tab-description">
              Personalized productivity recommendations based on your data and patterns.
            </p>
            <AIRecommendationPanel userData={dashboardData} />
          </div>
        )}

        {activeTab === 'explanations' && (
          <div className="tab-content">
            <h2>🔍 Metric Explanations</h2>
            <p className="tab-description">
              Understand what your performance metrics mean and how to improve them.
            </p>
            <AIExplanationPanel />
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="tab-content">
            <h2>📋 7-Day Action Plan</h2>
            <p className="tab-description">
              Get a structured weekly plan with daily goals to boost your productivity.
            </p>
            <AI7DayPlan userData={dashboardData} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="tab-content">
            <h2>💬 AI Productivity Coach</h2>
            <p className="tab-description">
              Chat with your personal AI productivity coach for guidance, motivation, and personalized advice.
            </p>
            <ChatInterface />
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;