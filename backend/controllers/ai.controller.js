import aiService from "../services/ai.service.js";

// Helper to clean JSON
function cleanJSON(text) {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

// Get AI Recommendations
export const getAIRecommendations = async (req, res) => {
  try {
    const userData = req.body;
    
    const rawResponse = await aiService.generateRecommendations(userData);
    const cleaned = cleanJSON(rawResponse);
    const recommendations = JSON.parse(cleaned);
    
    return res.success(
      { recommendations, generatedAt: new Date() },
      "Recommendations generated successfully"
    );
  } catch (error) {
    console.error('Recommendations error:', error);
    return res.fail("Failed to generate recommendations", 500);
  }
};

// Get AI Explanation
export const getAIExplanation = async (req, res) => {
  try {
    const { metric, currentValue, trend, context } = req.body;
    
    const rawResponse = await aiService.generateExplanation({
      metric, currentValue, trend, context
    });
    
    const cleaned = cleanJSON(rawResponse);
    const explanation = JSON.parse(cleaned);
    
    return res.success(
      { ...explanation },
      "Explanation generated successfully"
    );
  } catch (error) {
    console.error('Explanation error:', error);
    return res.fail("Failed to generate explanation", 500);
  }
};

// Get AI 7-Day Plan
export const getAI7DayPlan = async (req, res) => {
  try {
    const { userData, goals } = req.body;
    
    const rawResponse = await aiService.generate7DayPlan(userData, goals);
    const cleaned = cleanJSON(rawResponse);
    const plan = JSON.parse(cleaned);
    
    return res.success(
      { plan, generatedAt: new Date() },
      "7-day plan generated successfully"
    );
  } catch (error) {
    console.error('7-Day plan error:', error);
    return res.fail("Failed to generate plan", 500);
  }
};

// Your existing insights controller (keep if you want)
export const getAIInsights = async (req, res) => {
  try {
    // Your existing logic here
    return res.success({ message: "Insights endpoint" });
  } catch (error) {
    return res.fail("Failed to get insights", 500);
  }
};