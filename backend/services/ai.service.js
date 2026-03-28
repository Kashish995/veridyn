import OpenAI from "openai";

class AIService {
  constructor() {
    this.model = 'gpt-4o-mini';
  }

  getClient() {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.client;
  }

  async generateResponse(prompt, maxTokens = 2000) {
    try {
      const client = this.getClient();
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert study and productivity coach. Always respond with valid JSON only, no markdown, no backticks.'
          },
          { role: 'user', content: prompt }
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

  async generateRecommendations(userData) {
    try {
      const prompt = this.buildRecommendationPrompt(userData);
      return await this.generateResponse(prompt);
    } catch {
      return JSON.stringify([
        { title: "Establish a Morning Routine", description: "Start your day with a consistent routine. Wake up at the same time, review your goals, and tackle your hardest task first.", priority: "high", category: "time-management" },
        { title: "Use the Pomodoro Technique", description: "Break study sessions into 25-minute focused blocks with 5-minute breaks. Prevents burnout and maintains concentration.", priority: "high", category: "focus" },
        { title: "Track Your Energy Patterns", description: "Notice when you're most productive. Schedule challenging tasks during peak energy hours.", priority: "medium", category: "habits" },
        { title: "Active Recall for Learning", description: "Test yourself regularly using flashcards and practice problems to strengthen retention.", priority: "medium", category: "learning-technique" },
        { title: "Weekly Progress Reviews", description: "Every Sunday, review what worked and adjust your schedule based on actual data.", priority: "low", category: "habits" }
      ]);
    }
  }

  async generateExplanation(analysisData) {
    try {
      const prompt = this.buildExplanationPrompt(analysisData);
      return await this.generateResponse(prompt, 1000);
    } catch {
      const { metric, currentValue, trend } = analysisData;
      return JSON.stringify({
        explanation: `Your ${metric} of ${currentValue}% shows ${String(trend).toLowerCase()} performance. Focus on building stable daily habits rather than chasing perfect scores.`,
        actionItem: "Set a minimum daily baseline: complete at least 3 tasks every day. Consistency beats intensity."
      });
    }
  }

  async generate7DayPlan(userData, goals) {
    try {
      const prompt = this.build7DayPlanPrompt(userData, goals);
      return await this.generateResponse(prompt, 3000);
    } catch {
      return JSON.stringify({
        planOverview: "A 7-day plan focused on building consistency through incremental improvements.",
        days: [
          { day: 1, focus: "Foundation Day", goals: ["Complete morning routine by 9 AM", "Finish 3 priority tasks"], timeBlocks: [{ time: "9:00 AM - 11:00 AM", activity: "DSA Practice", subject: "DSA" }, { time: "2:00 PM - 4:00 PM", activity: "Web Development", subject: "Web Dev" }], successMetric: "Complete all 3 tasks" },
          { day: 2, focus: "Deep Work Day", goals: ["2-hour uninterrupted DSA session", "Zero phone distractions"], timeBlocks: [{ time: "8:00 AM - 10:00 AM", activity: "Deep DSA Session", subject: "DSA" }, { time: "3:00 PM - 5:00 PM", activity: "System Design", subject: "System Design" }], successMetric: "2 hours DSA without breaks" },
          { day: 3, focus: "Practice & Application", goals: ["Solve 5 medium DSA problems", "Build a small feature"], timeBlocks: [{ time: "9:00 AM - 11:00 AM", activity: "LeetCode: 5 problems", subject: "DSA" }, { time: "1:00 PM - 3:00 PM", activity: "Project feature development", subject: "Web Dev" }], successMetric: "Submit all 5 problems" },
          { day: 4, focus: "Knowledge Consolidation", goals: ["Create summary notes", "Prepare interview questions"], timeBlocks: [{ time: "8:00 AM - 10:00 AM", activity: "DSA pattern documentation", subject: "DSA" }, { time: "3:00 PM - 5:00 PM", activity: "Mock interview prep", subject: "Interview Prep" }], successMetric: "Complete DSA cheat sheet" },
          { day: 5, focus: "Skill Expansion", goals: ["Learn new DSA topic: Trees", "Explore advanced DB features"], timeBlocks: [{ time: "9:00 AM - 11:00 AM", activity: "Binary Trees: Traversals", subject: "DSA" }, { time: "1:00 PM - 3:00 PM", activity: "Database aggregations", subject: "Web Dev" }], successMetric: "Implement 3 tree algorithms" },
          { day: 6, focus: "Integration Day", goals: ["Apply tree concepts", "Deploy new feature"], timeBlocks: [{ time: "8:00 AM - 10:00 AM", activity: "Tree problems: BST, DFS, BFS", subject: "DSA" }, { time: "10:30 AM - 1:00 PM", activity: "Project: Analytics dashboard", subject: "Web Dev" }], successMetric: "Solve 4 tree problems, deploy feature" },
          { day: 7, focus: "Review & Planning", goals: ["Weekly review", "Plan next week"], timeBlocks: [{ time: "9:00 AM - 10:30 AM", activity: "Review all DSA from week", subject: "DSA" }, { time: "2:00 PM - 4:00 PM", activity: "Plan week 2 objectives", subject: "Productivity" }], successMetric: "Clear plan for week 2" }
        ],
        weeklyTarget: "Achieve 85%+ task completion, solve 20+ DSA problems, establish consistent daily routine"
      });
    }
  }

  buildRecommendationPrompt(userData) {
    const { completedTasks = 0, totalTasks = 0, studyHours = 0, productivityScore = 0, recentActivities = [], weakAreas = [] } = userData;
    return `Analyze this student's data and provide 5 recommendations.
Student Data: Tasks: ${completedTasks}/${totalTasks}, Study Hours: ${studyHours}, Productivity: ${productivityScore}/100, Activities: ${recentActivities.join(', ') || 'None'}, Weak Areas: ${weakAreas.join(', ') || 'Not identified'}
Return ONLY valid JSON array (no markdown, no backticks):
[{"title":"title","description":"description","priority":"high","category":"time-management"}]`;
  }

  buildExplanationPrompt(analysisData) {
    const { metric = '', currentValue = 0, trend = '', context = '' } = analysisData;
    return `Explain this metric to a student.
Metric: ${metric}, Value: ${currentValue}, Trend: ${trend}, Context: ${context}
Return ONLY valid JSON (no markdown, no backticks):
{"explanation":"explanation here","actionItem":"action here"}`;
  }

  build7DayPlanPrompt(userData, goals) {
    const { currentProductivity = 0, availableHoursPerDay = 4, subjects = [], examDates = [] } = userData;
    return `Create a 7-day study plan.
Context: Productivity: ${currentProductivity}/100, Hours/Day: ${availableHoursPerDay}, Subjects: ${subjects.join(', ') || 'General'}, Exams: ${examDates.join(', ') || 'None'}, Goals: ${goals}
Return ONLY valid JSON (no markdown, no backticks):
{"planOverview":"overview","days":[{"day":1,"focus":"focus","goals":[],"timeBlocks":[{"time":"time","activity":"activity","subject":"subject"}],"successMetric":"metric"}],"weeklyTarget":"target"}`;
  }

  async chat(messages, userData) {
  try {
    const client = this.getClient();

    const context = userData
      ? `\nUser Stats: ${userData.completedTasks || 0}/${userData.totalTasks || 0} tasks completed, Streak: ${userData.currentStreak || 0} days, Discipline Score: ${userData.disciplineScore || 0}%`
      : '';

    const systemPrompt = `You are an expert AI productivity coach built into the Veridyn app — a personal productivity tracker for students.
${context}

Your job is to give smart, specific, actionable advice — just like ChatGPT would. You have access to the user's real task data and performance stats above.

Guidelines:
- Be conversational, warm, and encouraging
- Give SPECIFIC advice, not generic tips
- If asked for a schedule/plan, actually create a detailed one with times
- If asked about DSA, coding, or studying — give real technical guidance
- Keep responses focused and well-structured (use bullet points or numbered lists when helpful)
- Max 3-4 paragraphs or a clear structured list
- Never say "I'm just an AI" — act like a knowledgeable coach who knows the user personally`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    return response.choices[0].message.content;

  } catch (error) {
    // Log the REAL error so you can see what's failing
    console.error('❌ OpenAI Chat Error:', error?.status, error?.message, error?.code);
    
    // Only fall back to mock if it's not a config/auth error
    if (error?.status === 401 || error?.status === 403) {
      return "⚠️ OpenAI API key issue. Please check your OPENAI_API_KEY in the .env file.";
    }
    if (error?.status === 429) {
      return "⚠️ OpenAI rate limit reached. Please wait a moment and try again.";
    }
    if (error?.code === 'insufficient_quota') {
      return "⚠️ OpenAI quota exceeded. Please check your billing at platform.openai.com.";
    }
    
    return this.getMockChatResponse(messages);
  }
}

  getMockChatResponse(messages) {
    const last = messages[messages.length - 1]?.content?.toLowerCase() || '';
    if (last.includes('plan') || last.includes('today')) return "Great question! Start with your top 3 priorities for today. Block 90-minute focus sessions for deep work, take 15-minute breaks between them. What's your most important task today?";
    if (last.includes('motivation') || last.includes('tired')) return "I hear you! Remember why you started. Try the 2-minute rule: just commit to starting for 2 minutes. Often, starting is the hardest part. You've got this! 💪";
    if (last.includes('habit') || last.includes('routine')) return "Habits are built on consistency over intensity. Start small — 5 minutes daily beats 2 hours once a week. What habit are you trying to build?";
    if (last.includes('focus') || last.includes('distract')) return "Focus is a trainable skill! Try Pomodoro: 25 minutes focused work, 5-minute break. Turn off notifications. What's distracting you most?";
    if (last.includes('dsa') || last.includes('leetcode')) return "For DSA, consistency beats cramming. Aim for 2-3 problems daily. Focus on patterns: sliding window, two pointers, BFS/DFS. Which topic feels weakest right now?";
    return "I'm here to help you stay productive and crush your goals! I can help with planning, motivation, habits, and time management. What specific challenge are you facing right now?";
  }
}

export default new AIService();