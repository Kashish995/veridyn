import React, { useState, useEffect } from 'react';
import api from "../api/api";

const StudyPatternAnalyzer = ({ tasks = [] }) => {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPatterns = async () => {
    setLoading(true);
    
    try {
const response = await api.post('/ai/study-patterns', { tasks });
      
      setPatterns(response.data.data.patterns);
    } catch (err) {
      console.error('Pattern analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      fetchPatterns();
    }
  }, [tasks.length]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!patterns) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📊 Study Pattern Analysis
      </h2>

      {/* Peak Productivity */}
      <div className="bg-white rounded-lg p-5 mb-4 border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <span>⚡</span> Peak Productivity Time
        </h3>
        <div className="text-center">
          <p className="text-4xl font-bold text-purple-600 mb-2">
            {patterns.peakProductivityTime.timeRange}
          </p>
          <p className="text-sm text-gray-600">
            {patterns.peakProductivityTime.completionRate}% completion rate
          </p>
        </div>
      </div>

      {/* Best Hours */}
      {patterns.bestHours.length > 0 && (
        <div className="bg-green-50 rounded-lg p-5 mb-4 border border-green-200">
          <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <span>✅</span> Most Productive Hours
          </h3>
          <div className="space-y-2">
            {patterns.bestHours.map((hour, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-green-200">
                <div>
                  <p className="font-semibold text-green-800">{hour.timeRange}</p>
                  <p className="text-xs text-gray-600">
                    {hour.tasksCompleted}/{hour.totalTasks} tasks completed
                  </p>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {hour.completionRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Worst Hours */}
      {patterns.worstHours.length > 0 && (
        <div className="bg-red-50 rounded-lg p-5 mb-4 border border-red-200">
          <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <span>⚠️</span> Lowest Productivity Hours
          </h3>
          <div className="space-y-2">
            {patterns.worstHours.map((hour, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-red-200">
                <div>
                  <p className="font-semibold text-red-800">{hour.timeRange}</p>
                  <p className="text-xs text-gray-600">
                    {hour.tasksCompleted}/{hour.totalTasks} tasks completed
                  </p>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {hour.completionRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {patterns.insights.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span>💡</span> Key Insights
          </h3>
          <ul className="space-y-2">
            {patterns.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-blue-800">
                <span className="text-blue-600 font-bold">→</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudyPatternAnalyzer;