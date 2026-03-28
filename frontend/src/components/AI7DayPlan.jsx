import React, { useState } from 'react';
import api from "../api/api";

const AI7DayPlan = ({ userData, goals }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  const generatePlan = async () => {
    setLoading(true);
    
    try {
    const response = await api.post('/ai/7day-plan', { userData, goals });
      
      setPlan(response.data.data.plan);
    } catch (err) {
      console.error('Plan generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentDay = plan?.days?.find(d => d.day === selectedDay);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🎯 AI 7-Day Improvement Plan
      </h2>

      {!plan && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">
            Get a personalized 7-day plan tailored to your goals and schedule!
          </p>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? '🔄 AI is crafting your plan...' : '✨ Generate My 7-Day Plan'}
          </button>
        </div>
      )}

      {plan && (
        <div>
          {/* Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 mb-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2 text-lg">📋 Plan Overview</h3>
            <p className="text-blue-800 leading-relaxed">{plan.planOverview}</p>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                <strong className="font-semibold">🎯 Weekly Target:</strong> {plan.weeklyTarget}
              </p>
            </div>
          </div>

          {/* Day Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {plan.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`px-5 py-3 rounded-lg font-bold whitespace-nowrap transition-all ${
                  selectedDay === day.day
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          {/* Selected Day Details */}
          {currentDay && (
            <div className="space-y-5">
              <div className="border-l-4 border-blue-600 pl-4 bg-blue-50 py-3 rounded-r">
                <h3 className="text-2xl font-bold text-gray-800">
                  {currentDay.focus}
                </h3>
              </div>

              {/* Goals */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🎯</span> Today's Goals:
                </h4>
                <ul className="space-y-2">
                  {currentDay.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Time Blocks */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>⏰</span> Schedule:
                </h4>
                <div className="space-y-3">
                  {currentDay.timeBlocks.map((block, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-blue-600 text-lg">
                          {block.time}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                          {block.subject}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium">{block.activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Metric */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border-l-4 border-green-500">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <span>✅</span> Success Metric:
                </h4>
                <p className="text-green-800 font-medium">{currentDay.successMetric}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AI7DayPlan;