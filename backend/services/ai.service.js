import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

class AIService {
  constructor() {
    // Add this check to see if key is loaded
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables!');
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = 'gpt-4o-mini';
  }


  async generateResponse(prompt, maxTokens = 2000) {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert study and productivity coach helping students improve their academic performance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  // AI Recommendations
  async generateRecommendations(userData) {
    const prompt = this.buildRecommendationPrompt(userData);
    return await this.generateResponse(prompt);
  }

  // AI Explanation
  async generateExplanation(analysisData) {
    const prompt = this.buildExplanationPrompt(analysisData);
    return await this.generateResponse(prompt, 1000);
  }

  // AI 7-Day Plan
  async generate7DayPlan(userData, goals) {
    const prompt = this.build7DayPlanPrompt(userData, goals);
    return await this.generateResponse(prompt, 3000);
  }

  buildRecommendationPrompt(userData) {
    const {
      completedTasks = 0,
      totalTasks = 0,
      studyHours = 0,
      productivityScore = 0,
      recentActivities = [],
      weakAreas = []
    } = userData;

    return `Analyze this student's data and provide recommendations.

**Student Data:**
- Tasks: ${completedTasks}/${totalTasks}
- Study Hours: ${studyHours}
- Productivity: ${productivityScore}/100
- Activities: ${recentActivities.join(', ') || 'None'}
- Weak Areas: ${weakAreas.join(', ') || 'Not identified'}

Return ONLY valid JSON (no markdown):
[
  {
    "title": "title here",
    "description": "description here",
    "priority": "high",
    "category": "time-management"
  }
]`;
  }

  buildExplanationPrompt(analysisData) {
    const { metric = '', currentValue = 0, trend = '', context = '' } = analysisData;

    return `Explain this metric to a student.

Metric: ${metric}
Value: ${currentValue}
Trend: ${trend}
Context: ${context}

Return ONLY valid JSON (no markdown):
{
  "explanation": "explanation here",
  "actionItem": "action here"
}`;
  }

  build7DayPlanPrompt(userData, goals) {
    const {
      currentProductivity = 0,
      availableHoursPerDay = 4,
      subjects = [],
      examDates = []
    } = userData;

    return `Create a 7-day plan for a student.

Context:
- Productivity: ${currentProductivity}/100
- Hours/Day: ${availableHoursPerDay}
- Subjects: ${subjects.join(', ') || 'General'}
- Exams: ${examDates.join(', ') || 'None'}
- Goals: ${goals}

Return ONLY valid JSON with 7 days (no markdown):
{
  "planOverview": "overview",
  "days": [
    {
      "day": 1,
      "focus": "focus area",
      "goals": ["goal1", "goal2"],
      "timeBlocks": [
        {"time": "9AM-11AM", "activity": "activity", "subject": "subject"}
      ],
      "successMetric": "metric"
    }
  ],
  "weeklyTarget": "target"
}`;
  }
}

export default new AIService();