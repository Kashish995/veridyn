import React, { useState, useEffect } from 'react';
import api from '../api/api';

const RiskPredictor = ({ weeklyStats, history, currentStreak, completionRate, volatility }) => {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRiskPrediction = async () => {
    setLoading(true);
    
    try {
const response = await api.post('/ai/risk-prediction', { weeklyStats, history, currentStreak, completionRate, volatility });
      
      setRisk(response.data.data.risk);
    } catch (err) {
      console.error('Risk prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchRiskPrediction();
  }, [completionRate, currentStreak]);

  const getRiskStyle = (level) => {
    switch(level) {
      case 'High':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-800',
          badge: 'bg-red-600 text-white'
        };
      case 'Medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          badge: 'bg-yellow-600 text-white'
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-800',
          badge: 'bg-green-600 text-white'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!risk) return null;

  const style = getRiskStyle(risk.riskLevel);

  return (
    <div className={`rounded-xl shadow-lg p-6 border-2 ${style.border} ${style.bg}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {risk.riskIcon} Productivity Risk Prediction
        </h2>
        <span className={`px-4 py-2 rounded-full font-bold text-lg ${style.badge}`}>
          {risk.riskLevel} Risk
        </span>
      </div>

      {/* Risk Score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">Risk Score:</span>
          <span className={`text-2xl font-bold ${style.text}`}>{risk.riskScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${
              risk.riskLevel === 'High' ? 'bg-red-600' : 
              risk.riskLevel === 'Medium' ? 'bg-yellow-600' : 
              'bg-green-600'
            }`}
            style={{ width: `${risk.riskScore}%` }}
          ></div>
        </div>
      </div>

      {/* Reasons */}
      {risk.reasons.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>🔍</span> Detected Issues:
          </h3>
          <ul className="space-y-2">
            {risk.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-1">•</span>
                <span className={`${style.text} font-medium`}>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {risk.warnings.length > 0 && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-600 p-4 rounded">
          <h3 className="font-bold text-red-900 mb-2">⚠️ Warnings:</h3>
          {risk.warnings.map((warning, idx) => (
            <p key={idx} className="text-red-800 text-sm">{warning}</p>
          ))}
        </div>
      )}

      {/* Predicted Outcome */}
      <div className={`mb-4 p-4 rounded-lg border-2 ${style.border}`}>
        <h3 className="font-bold text-gray-800 mb-2">📊 Prediction:</h3>
        <p className={`${style.text} font-medium`}>{risk.predictedOutcome}</p>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span> Recommended Actions:
        </h3>
        <ul className="space-y-2">
          {risk.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span className="text-blue-800 font-medium">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 text-center">
        <button
          onClick={fetchRiskPrediction}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Refresh Analysis
        </button>
      </div>
    </div>
  );
};

export default RiskPredictor;