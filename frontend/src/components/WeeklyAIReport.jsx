import React, { useState, useEffect } from 'react';
import api from "../api/api";

const WeeklyAIReport = ({ weeklyStats = [], history = [], currentStreak = 0 }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ai/weekly-report',
        { weeklyStats, history, currentStreak },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setReport(response.data.data.report);
    } catch (err) {
      console.error('Weekly report error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (weeklyStats.length > 0) {
      generateReport();
    }
  }, [weeklyStats.length]);

  const getTrendColor = (trend) => {
    if (trend.includes('Improvement')) return 'text-green-600';
    if (trend.includes('Declining')) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getScoreColor = (score) => {
    switch(score) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-indigo-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📊 Weekly AI Report
          </h2>
          <p className="text-sm text-gray-600 mt-1">{report.period}</p>
        </div>
        <span className={`px-4 py-2 rounded-full font-bold text-lg border-2 ${getScoreColor(report.weeklyScore)}`}>
          {report.weeklyScore}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Best Day */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-700 font-semibold mb-1">Best Day</p>
          <p className="text-lg font-bold text-green-800">
            {new Date(report.summary.bestDay.date).toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
          <p className="text-sm text-green-600">{report.summary.bestDay.completionRate}%</p>
        </div>

        {/* Worst Day */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-700 font-semibold mb-1">Worst Day</p>
          <p className="text-lg font-bold text-red-800">
            {new Date(report.summary.worstDay.date).toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
          <p className="text-sm text-red-600">{report.summary.worstDay.completionRate}%</p>
        </div>

        {/* Avg Discipline */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold mb-1">Avg Discipline</p>
          <p className="text-2xl font-bold text-blue-800">{report.summary.avgDiscipline}</p>
        </div>

        {/* Current Streak */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-xs text-orange-700 font-semibold mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-orange-800">{report.summary.currentStreak} 🔥</p>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white rounded-lg p-5 mb-4 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-2">📈 Weekly Trend:</h3>
        <p className={`text-xl font-bold ${getTrendColor(report.summary.trend)}`}>
          {report.summary.trend}
        </p>
      </div>

      {/* Achievements */}
      {report.achievements.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-5 mb-4 border border-yellow-200">
          <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <span>🏆</span> This Week's Achievements
          </h3>
          <div className="space-y-2">
            {report.achievements.map((achievement, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded border border-yellow-200">
                <span className="text-2xl">{achievement.icon}</span>
                <span className="text-yellow-800 font-medium">{achievement.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {report.improvements.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-5 mb-4 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span>💡</span> Areas to Improve
          </h3>
          <ul className="space-y-2">
            {report.improvements.map((improvement, idx) => (
              <li key={idx} className="flex items-start gap-2 text-blue-800">
                <span className="text-blue-600 font-bold">→</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Week Goals */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <span>🎯</span> Next Week Goals
        </h3>
        <ul className="space-y-2">
          {report.nextWeekGoals.map((goal, idx) => (
            <li key={idx} className="flex items-start gap-2 text-purple-800">
              <span className="text-purple-600 font-bold">✓</span>
              <span className="font-medium">{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 text-center">
        <button
          onClick={generateReport}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Refresh Report
        </button>
      </div>
    </div>
  );
};

export default WeeklyAIReport;