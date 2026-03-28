import React, { useState } from 'react';
import api from "../api/api";

const AIExplanationPanel = ({ metric, currentValue, trend, context }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getExplanation = async () => {
    setLoading(true);
    
    try {
    const response = await api.post('/ai/explain', { metric, currentValue, trend, context });
      
      setExplanation(response.data.data);
    } catch (err) {
      console.error('Explanation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 mt-4 border border-purple-200">
      <button
        onClick={getExplanation}
        disabled={loading}
        className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-2 transition-colors"
      >
        <span className="text-xl">💡</span>
        {loading ? 'AI is analyzing...' : 'Get AI Explanation'}
      </button>

      {explanation && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-gray-800 leading-relaxed">{explanation.explanation}</p>
          </div>
          
          <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded">
            <p className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>🎯</span> Action Item:
            </p>
            <p className="text-blue-800 font-medium">{explanation.actionItem}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIExplanationPanel;