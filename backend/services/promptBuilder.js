export const buildBehaviorPrompt = (analytics) => {

  return `
You are a behavioral productivity analyst.

A user's productivity analytics data is given below.

Discipline Score: ${analytics.disciplineScore}
Completion Rate: ${analytics.completionRate}
Tier: ${analytics.tier}
Monthly Average: ${analytics.monthlyAverage}
Current Streak: ${analytics.currentStreak}
Longest Streak: ${analytics.longestStreak}

Recent Discipline Scores:
${analytics.history.join(", ")}

Analyze the user's discipline behavior.

Provide:

1. Behavioral explanation
2. Three personalized productivity recommendations
3. A structured 7-day improvement plan

Respond ONLY in JSON:

{
 "explanation": "",
 "recommendations": [],
 "improvementPlan": []
}
`;
};