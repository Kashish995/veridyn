import aiService from "../services/ai.service.js";

function cleanJSON(text) {
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Remove any leading/trailing whitespace or newlines
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  return cleaned;
}

export const getAIRecommendations = async (req, res) => {
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

export const getAIExplanation = async (req, res) => {
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

export const getAI7DayPlan = async (req, res) => {
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

export const getAIInsights = async (req, res) => {
  try {
    return res.success({ message: "Insights endpoint" });
  } catch (error) {
    return res.fail("Failed to get insights", 500);
  }
};