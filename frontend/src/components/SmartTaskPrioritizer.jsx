import React, { useState } from 'react';
import api from "../api/api";

const SmartTaskPrioritizer = ({ tasks = [] }) => {
  const [prioritization, setPrioritization] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPrioritization = async () => {
    setLoading(true);
    
    try {
      const currentHour = new Date().getHours();
      
      const response = await api.post('/ai/task-prioritization', { tasks: tasks.filter(t => t.status !== 'completed'), userContext: { currentHour, energyLevel: 'medium' } });
      
      setPrioritization(response.data.data.prioritization);
    } catch (err) {
      console.error('Task prioritization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
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
          🎯 AI Task Prioritization
        </h2>
        <button
          onClick={getPrioritization}
          disabled={loading || tasks.length === 0}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
        >
          {loading ? '🔄 Analyzing...' : '✨ Get Priority Order'}
        </button>
      </div>

      {!prioritization && !loading && (
        <div className="text-center py-8 text-gray-500">
          Click "Get Priority Order" to let AI suggest the best task sequence! 🚀
        </div>
      )}

      {prioritization && (
        <div>
          {/* Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6 border border-indigo-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {prioritization.summary.totalTasks}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {prioritization.summary.highPriority}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-orange-600">
                  {prioritization.summary.urgent}
                </p>
              </div>
            </div>
            <p className="text-center mt-4 font-semibold text-indigo-800">
              💡 {prioritization.summary.recommendation}
            </p>
          </div>

          {/* Ordered Tasks */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 mb-3">📋 AI Priority Order:</h3>
            {prioritization.orderedTasks.slice(0, 8).map((task, idx) => (
              <div 
                key={task._id || idx} 
                className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {/* Rank Number */}
                  <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>

                  {/* Task Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800">{task.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                        {task.priority?.toUpperCase()}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Priority Score:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${Math.min(task.score, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">{Math.round(task.score)}</span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    {task.reasoning && (
                      <p className="text-sm text-gray-600 italic">
                        🧠 {task.reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Time Allocation */}
          {prioritization.timeAllocation && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">⏰ Suggested Time Allocation:</h3>
              <div className="space-y-2">
                {prioritization.timeAllocation.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">
                      {item.order}. {item.task}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {item.suggestedTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartTaskPrioritizer;