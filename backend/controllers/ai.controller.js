import { generateAIResponse } from "../services/ai.service.js";
import { buildAIPrompt } from "../services/promptBuilder.js";
import DisciplineHistory from "../models/DisciplineHistory.js";

export const getAIRecommendations = async (req, res) => {

  try {

    const userId = req.user.id;

    const latest = await DisciplineHistory
      .find({ userId })
      .sort({ date: -1 })
      .limit(7);

    if (!latest.length) {
      return res.status(404).json({
        message: "Not enough data for AI analysis"
      });
    }

    const disciplineScore = latest[0].disciplineScore;
    const completionRate = latest[0].completionRate;
    const tier = latest[0].tier;

    const data = {
      disciplineScore,
      completionRate,
      tier,
      trend: "Improving", // from your analytics
      volatility: "Moderate",
      currentStreak: 4,
      longestStreak: 9,
      monthlyAvgScore: 72
    };

    const prompt = buildAIPrompt(data);

    const aiResponse = await generateAIResponse(prompt);

    const parsed = JSON.parse(aiResponse);

    res.json(parsed);

  } catch (err) {
    res.status(500).json({
      error: "AI analysis failed"
    });
  }

};