import React, { useState } from 'react';
import api from "../api/api";

const AIRecommendationPanel = ({ userData }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ai/recommendations',
        userData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setRecommendations(response.data.data.recommendations);
    } catch (err) {
      setError('Failed to get AI recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🤖 AI Recommendations
        </h2>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
        >
          {loading ? '🔄 Generating...' : '✨ Get AI Insights'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
          ⚠️ {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-800">
                  {rec.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed">{rec.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                  📁 {rec.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Click "Get AI Insights" to receive personalized recommendations! 🚀
        </div>
      )}
    </div>
  );
};

export default AIRecommendationPanel;
