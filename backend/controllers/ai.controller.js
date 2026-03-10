import { getUserAnalyticsForAI } from "../services/analyticsAggregator.service.js";
import { buildBehaviorPrompt } from "../services/promptBuilder.js";
import { runAIAnalysis } from "../services/ai.service.js";

export const getAIInsights = async (req, res) => {

  try {

    const userId = req.user.id;

    console.log("Logged user:", userId);  // ✔ allowed here
    console.log("User from token:", req.user.id);
    
    const analytics = await getUserAnalyticsForAI(userId);

    if (!analytics) {
      return res.status(400).json({
        error: "Not enough productivity data"
      });
    }

    const prompt = buildBehaviorPrompt(analytics);

    const aiRaw = await runAIAnalysis(prompt);

    let result;

    try {
      result = JSON.parse(aiRaw);
    } catch {
      result = {
        explanation: aiRaw,
        recommendations: [],
        improvementPlan: []
      };
    }

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "AI analysis failed"
    });

  }
};