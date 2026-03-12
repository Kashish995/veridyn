import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runAIAnalysis = async (prompt) => {
  return JSON.stringify({
    explanation: "Your productivity shows moderate consistency with occasional drops.",
    recommendations: [
      "Complete your most difficult task earlier in the day",
      "Avoid skipping tasks for more than one day",
      "Maintain a minimum completion rate of 70%"
    ],
    improvementPlan: [
      "Day 1: Complete at least 3 tasks",
      "Day 2: Focus on high priority goals",
      "Day 3: Maintain discipline streak",
      "Day 4: Avoid missed tasks",
      "Day 5: Review weekly progress",
      "Day 6: Improve task consistency",
      "Day 7: Reflect and plan next week"
    ]
  });
};