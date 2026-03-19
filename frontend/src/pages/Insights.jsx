import { useState } from 'react';
import RiskPredictor from '../components/RiskPredictor';
import StudyPatternAnalyzer from '../components/StudyPatternAnalyzer';
import SmartTaskPrioritizer from '../components/SmartTaskPrioritizer';
import WeeklyAIReport from '../components/WeeklyAIReport';
import AIRecommendationPanel from '../components/AIRecommendationPanel';
import AIExplanationPanel from '../components/AIExplanationPanel';
import AI7DayPlan from '../components/AI7DayPlan';
import '../styles/insights.css';

const Insights = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'risk', label: '⚠️ Risk Analysis', icon: '⚠️' },
    { id: 'patterns', label: '📈 Study Patterns', icon: '📈' },
    { id: 'prioritization', label: '🎯 Task Priority', icon: '🎯' },
    { id: 'weekly', label: '📅 Weekly Report', icon: '📅' },
    { id: 'recommendations', label: '💡 Recommendations', icon: '💡' },
    { id: 'explanations', label: '🤔 Explanations', icon: '🤔' },
    { id: 'plan', label: '📋 7-Day Plan', icon: '📋' },
  ];

  return (
    <div className="insights-page">
      <div className="insights-container">
        
        {/* Header */}
        <div className="insights-header">
          <h1>🤖 AI Insights Hub</h1>
          <p className="insights-subtitle">
            Unlock intelligent productivity insights powered by AI
          </p>
          <div className="insights-ai-badge">
            <span>✨</span>
            <span>Powered by Advanced AI</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="insights-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`insights-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="insights-content">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <h2 className="insights-content-title">
                <span>📊</span>
                <span>AI Features Overview</span>
              </h2>
              <div className="insights-grid">
                <div className="insights-card" onClick={() => setActiveTab('risk')}>
                  <div className="insights-card-icon">⚠️</div>
                  <h3 className="insights-card-title">Risk Predictor</h3>
                  <p className="insights-card-description">
                    Get early warnings about potential discipline drops and productivity risks.
                  </p>
                </div>

                <div className="insights-card" onClick={() => setActiveTab('patterns')}>
                  <div className="insights-card-icon">📈</div>
                  <h3 className="insights-card-title">Study Pattern Analyzer</h3>
                  <p className="insights-card-description">
                    Discover your peak productivity hours and optimize your study schedule.
                  </p>
                </div>

                <div className="insights-card" onClick={() => setActiveTab('prioritization')}>
                  <div className="insights-card-icon">🎯</div>
                  <h3 className="insights-card-title">Smart Task Prioritization</h3>
                  <p className="insights-card-description">
                    AI-ranked task list based on urgency, difficulty, and your energy levels.
                  </p>
                </div>

                <div className="insights-card" onClick={() => setActiveTab('weekly')}>
                  <div className="insights-card-icon">📅</div>
                  <h3 className="insights-card-title">Weekly AI Report</h3>
                  <p className="insights-card-description">
                    Comprehensive weekly summary with achievements and improvement areas.
                  </p>
                </div>

                <div className="insights-card" onClick={() => setActiveTab('recommendations')}>
                  <div className="insights-card-icon">💡</div>
                  <h3 className="insights-card-title">AI Recommendations</h3>
                  <p className="insights-card-description">
                    Personalized productivity tips based on your behavior patterns.
                  </p>
                </div>

                <div className="insights-card" onClick={() => setActiveTab('explanations')}>
                  <div className="insights-card-icon">🤔</div>
                  <h3 className="insights-card-title">Metric Explanations</h3>
                  <p className="insights-card-description">
                    Understand what your discipline score and metrics really mean.
                  </p>
                </div>

                <div className="insights-card" onClick={() => setActiveTab('plan')}>
                  <div className="insights-card-icon">📋</div>
                  <h3 className="insights-card-title">7-Day Action Plan</h3>
                  <p className="insights-card-description">
                    AI-generated weekly plan to boost your productivity and discipline.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* RISK TAB */}
          {activeTab === 'risk' && (
            <>
              <h2 className="insights-content-title">
                <span>⚠️</span>
                <span>Risk Prediction Analysis</span>
              </h2>
              <RiskPredictor />
            </>
          )}

          {/* PATTERNS TAB */}
          {activeTab === 'patterns' && (
            <>
              <h2 className="insights-content-title">
                <span>📈</span>
                <span>Study Pattern Analysis</span>
              </h2>
              <StudyPatternAnalyzer />
            </>
          )}

          {/* PRIORITIZATION TAB */}
          {activeTab === 'prioritization' && (
            <>
              <h2 className="insights-content-title">
                <span>🎯</span>
                <span>Smart Task Prioritization</span>
              </h2>
              <SmartTaskPrioritizer />
            </>
          )}

          {/* WEEKLY TAB */}
          {activeTab === 'weekly' && (
            <>
              <h2 className="insights-content-title">
                <span>📅</span>
                <span>Weekly AI Report</span>
              </h2>
              <WeeklyAIReport />
            </>
          )}

          {/* RECOMMENDATIONS TAB */}
          {activeTab === 'recommendations' && (
            <>
              <h2 className="insights-content-title">
                <span>💡</span>
                <span>AI Recommendations</span>
              </h2>
              <AIRecommendationPanel />
            </>
          )}

          {/* EXPLANATIONS TAB */}
          {activeTab === 'explanations' && (
            <>
              <h2 className="insights-content-title">
                <span>🤔</span>
                <span>Metric Explanations</span>
              </h2>
              <AIExplanationPanel />
            </>
          )}

          {/* PLAN TAB */}
          {activeTab === 'plan' && (
            <>
              <h2 className="insights-content-title">
                <span>📋</span>
                <span>7-Day Action Plan</span>
              </h2>
              <AI7DayPlan />
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default Insights;