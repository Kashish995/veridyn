export const buildBehaviorPrompt = (analytics) => {
  return `
You are a behavioral productivity analyst AI.

User productivity data:
- Discipline Score: ${analytics.disciplineScore}
- Completion Rate: ${analytics.completionRate}%
- Performance Tier: ${analytics.tier}
- Monthly Average Score: ${analytics.monthlyAverage}
- Current Streak: ${analytics.currentStreak} days
- Longest Streak: ${analytics.longestStreak} days

Recent discipline scores (last 30 days):
${analytics.history.join(", ")}

Analyze the user's behavioral productivity patterns.

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{
  "explanation": "2-3 sentences analyzing the user's current behavioral pattern",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "improvementPlan": [
    { "day": 1, "task": "Day 1 action" },
    { "day": 2, "task": "Day 2 action" },
    { "day": 3, "task": "Day 3 action" },
    { "day": 4, "task": "Day 4 action" },
    { "day": 5, "task": "Day 5 action" },
    { "day": 6, "task": "Day 6 action" },
    { "day": 7, "task": "Day 7 action" }
  ],
  "risk": {
    "riskLevel": "Low | Medium | High",
    "reason": "Brief reason for this risk level"
  }
}

Rules:
- recommendations must contain exactly 3 items
- improvementPlan must contain exactly 7 days
- risk.riskLevel must be one of: Low, Medium, High
- Base risk assessment on: completion rate below 50% = High, below 70% = Medium, else Low
`;
};
