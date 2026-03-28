import aiService from "../services/ai.service.js";
import AIService from "../services/ai.service.js";
import riskAnalysisService from "../services/riskAnalysis.service.js";
import patternAnalysisService from "../services/patternAnalysis.service.js";
import taskPrioritizationService from "../services/taskPrioritization.service.js";
import weeklyReportService from "../services/weeklyReport.service.js";
import Task from '../models/Task.js';
import DailyStats from '../models/DailyStats.js';
import StreakHistory from '../models/StreakHistory.js';

function cleanJSON(text) {
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Remove any leading/trailing whitespace or newlines
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  return cleaned;
}

export const getRecommendations = async (req, res) => {
  try {
    console.log("📥 Recommendations request:", req.body);
    
    const userData = req.body;
    const rawResponse = await aiService.generateRecommendations(userData);
    
    console.log("🤖 Raw AI Response:", rawResponse);
    
    const cleaned = cleanJSON(rawResponse);
    console.log("🧹 Cleaned Response:", cleaned);
    
    const recommendations = JSON.parse(cleaned);
    
    return res.success(
      { recommendations, generatedAt: new Date() },
      "Recommendations generated successfully"
    );
  } catch (error) {
    console.error('❌ Recommendations error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.fail(`Failed to generate recommendations: ${error.message}`, 500);
  }
};

export const getExplanation = async (req, res) => {
  try {
    console.log("📥 Explanation request:", req.body);
    
    const { metric, currentValue, trend, context } = req.body;
    const rawResponse = await aiService.generateExplanation({
      metric, currentValue, trend, context
    });
    
    console.log("🤖 Raw AI Response:", rawResponse);
    
    const cleaned = cleanJSON(rawResponse);
    const explanation = JSON.parse(cleaned);
    
    return res.success(
      { ...explanation },
      "Explanation generated successfully"
    );
  } catch (error) {
    console.error('❌ Explanation error:', error);
    console.error('Error message:', error.message);
    return res.fail(`Failed to generate explanation: ${error.message}`, 500);
  }
};

export const get7DayPlan = async (req, res) => {
  try {
    console.log("📥 7-Day Plan request:", req.body);
    
    const { userData, goals } = req.body;
    const rawResponse = await aiService.generate7DayPlan(userData, goals);
    
    console.log("🤖 Raw AI Response:", rawResponse);
    
    const cleaned = cleanJSON(rawResponse);
    const plan = JSON.parse(cleaned);
    
    return res.success(
      { plan, generatedAt: new Date() },
      "7-day plan generated successfully"
    );
  } catch (error) {
    console.error('❌ 7-Day plan error:', error);
    console.error('Error message:', error.message);
    return res.fail(`Failed to generate plan: ${error.message}`, 500);
  }
};

export const getInsights = async (req, res) => {
  try {
    return res.success({ message: "Insights endpoint" });
  } catch (error) {
    return res.fail("Failed to get insights", 500);
  }
};

export const getRiskPrediction = async (req, res) => {
  try {
    console.log("📥 Risk prediction request:", req.body);
    
    const userData = req.body;
    const riskAnalysis = riskAnalysisService.calculateRisk(userData);
    
    return res.success(
      { risk: riskAnalysis, generatedAt: new Date() },
      "Risk analysis completed successfully"
    );
  } catch (error) {
    console.error('❌ Risk prediction error:', error);
    return res.fail(`Failed to predict risk: ${error.message}`, 500);
  }
};

export const getStudyPatterns = async (req, res) => {
  try {
    const tasksData = req.body;
    const patterns = patternAnalysisService.analyzeStudyPatterns(tasksData);
    
    return res.success(
      { patterns, generatedAt: new Date() },
      "Pattern analysis completed successfully"
    );
  } catch (error) {
    console.error('❌ Pattern analysis error:', error);
    return res.fail(`Failed to analyze patterns: ${error.message}`, 500);
  }
};

export const getTaskPrioritization = async (req, res) => {
  try {
    const { tasks, userContext } = req.body;
    const prioritization = taskPrioritizationService.prioritizeTasks(tasks, userContext);
    
    return res.success(
      { prioritization, generatedAt: new Date() },
      "Task prioritization completed successfully"
    );
  } catch (error) {
    console.error('❌ Task prioritization error:', error);
    return res.fail(`Failed to prioritize tasks: ${error.message}`, 500);
  }
};

export const getWeeklyReport = async (req, res) => {
  try {
    const weekData = req.body;
    const report = weeklyReportService.generateWeeklyReport(weekData);
    
    return res.success(
      { report, generatedAt: new Date() },
      "Weekly report generated successfully"
    );
  } catch (error) {
    console.error('❌ Weekly report error:', error);
    return res.fail(`Failed to generate report: ${error.message}`, 500);
  }
};

export const chat = async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user.id;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array is required' });
    }

    // ✅ Query fields that actually exist in the models
    const [tasks, stats, streak] = await Promise.all([
      Task.find({ userId }),
      DailyStats.findOne({ userId }).sort({ date: -1 }),
      StreakHistory.findOne({ userId }).sort({ length: -1 }) // ✅ sort by length, not date
    ]);

    const userData = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      // ✅ StreakHistory has 'length' not 'streakCount'
      currentStreak: streak?.length || 0,
      // ✅ DailyStats has 'completed' and 'totalTasks', not 'disciplineScore'
      disciplineScore: stats?.totalTasks > 0
        ? Math.round((stats.completed / stats.totalTasks) * 100)
        : 0
    };

    const response = await aiService.chat(messages, userData);
    return res.json({ success: true, data: { message: response } });

  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process chat message' });
  }
};