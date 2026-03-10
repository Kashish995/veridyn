export const buildBehaviorPrompt = (analytics) => {

  return `
You are a behavioral productivity analyst.

User productivity data:

Discipline Score: ${analytics.disciplineScore}
Completion Rate: ${analytics.completionRate}
Tier: ${analytics.tier}
Monthly Average Score: ${analytics.monthlyAverage}
Current Streak: ${analytics.currentStreak}
Longest Streak: ${analytics.longestStreak}

Recent discipline scores:
${analytics.history.join(", ")}

Analyze the user's productivity behavior.

Return JSON only in this format:

{
  "explanation": "",
  "recommendations": [],
  "improvementPlan": []
}

Rules:
- recommendations must contain 3 items
- improvementPlan must contain 7 days
`;
};