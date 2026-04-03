/**
 * VERIDYN AI SERVICE
 * 
 * Primary:   Groq (FREE — llama-3.1-70b, 30req/min, 14,400/day)
 *            API key: https://console.groq.com → free signup, no credit card
 * 
 * Secondary: Anthropic Claude (if ANTHROPIC_API_KEY set)
 *            SDK already installed: @anthropic-ai/sdk
 * 
 * Fallback:  Smart mock responses (always works, no API needed)
 */

class AIService {
  constructor() {
    this.groqModel      = 'llama-3.1-70b-versatile';
    this.anthropicModel = 'claude-haiku-4-5-20251001';
  }

  /* ── Get provider based on env vars ── */
  getProvider() {
    if (process.env.GROQ_API_KEY) return 'groq';
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
    return 'mock';
  }

  /* ── Groq call (OpenAI-compatible API) ── */
  async callGroq(messages, maxTokens = 1000) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.groqModel,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Groq error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /* ── Anthropic call (already installed SDK) ── */
  async callAnthropic(messages, maxTokens = 1000) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Convert OpenAI-style messages to Anthropic format
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsgs  = messages.filter(m => m.role !== 'system');

    const response = await client.messages.create({
      model: this.anthropicModel,
      max_tokens: maxTokens,
      system: systemMsg?.content || 'You are a helpful productivity coach.',
      messages: userMsgs.map(m => ({ role: m.role, content: m.content })),
    });

    return response.content[0].text;
  }

  /* ── Main generate method ── */
  async generateResponse(messages, maxTokens = 1000) {
    const provider = this.getProvider();

    try {
      if (provider === 'groq') {
        return await this.callGroq(messages, maxTokens);
      }
      if (provider === 'anthropic') {
        return await this.callAnthropic(messages, maxTokens);
      }
    } catch (error) {
      console.error(`AI provider (${provider}) error:`, error.message);
      // Fall through to mock
    }

    // Always fall back to smart mock
    return this.getMockResponse(messages);
  }

  /* ── Generate recommendations ── */
  async generateRecommendations(userData) {
    const { completedTasks = 0, totalTasks = 0, productivityScore = 0 } = userData;

    const messages = [
      {
        role: 'system',
        content: 'You are a productivity coach. Return ONLY valid JSON array, no markdown.',
      },
      {
        role: 'user',
        content: `Student data: ${completedTasks}/${totalTasks} tasks done, productivity: ${productivityScore}%.
Return 5 personalized recommendations as JSON array:
[{"title":"","description":"","priority":"high","category":""}]`,
      },
    ];

    try {
      const raw = await this.generateResponse(messages, 1200);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      JSON.parse(cleaned); // validate
      return cleaned;
    } catch {
      return JSON.stringify(this.mockRecommendations(productivityScore));
    }
  }

  /* ── Generate explanation ── */
  async generateExplanation({ metric, currentValue, trend, context }) {
    const messages = [
      { role: 'system', content: 'You are a productivity analyst. Return ONLY valid JSON, no markdown.' },
      {
        role: 'user',
        content: `Metric: ${metric}, Value: ${currentValue}%, Trend: ${trend}, Context: ${context}
Return: {"explanation":"","actionItem":""}`,
      },
    ];

    try {
      const raw = await this.generateResponse(messages, 600);
      return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } catch {
      return JSON.stringify({
        explanation: `Your ${metric} of ${currentValue}% shows ${trend.toLowerCase()} performance. Focus on daily consistency.`,
        actionItem: 'Set a minimum daily baseline: complete at least 3 tasks every day.',
      });
    }
  }

  /* ── Generate 7-day plan ── */
  async generate7DayPlan(userData, goals) {
    const messages = [
      { role: 'system', content: 'You are a study planner. Return ONLY valid JSON, no markdown.' },
      {
        role: 'user',
        content: `Productivity: ${userData?.currentProductivity || 0}%, Goals: ${goals}
Return a 7-day plan: {"planOverview":"","days":[{"day":1,"focus":"","goals":[],"successMetric":""}],"weeklyTarget":""}`,
      },
    ];

    try {
      const raw = await this.generateResponse(messages, 2000);
      return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } catch {
      return JSON.stringify(this.mockSevenDayPlan());
    }
  }

  /* ── AI Chat ── */
  async chat(messages, userData) {
    const context = userData
      ? `User stats: ${userData.completedTasks}/${userData.totalTasks} tasks, streak: ${userData.currentStreak} days, score: ${userData.disciplineScore}%`
      : '';

    const systemPrompt = `You are Veridyn, an expert AI productivity coach for students.
${context}

Be conversational, specific, and encouraging. Use bullet points when helpful.
Give real advice based on the user's actual data. Max 3-4 paragraphs.`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    try {
      const provider = this.getProvider();

      if (provider === 'groq') {
        return await this.callGroq(chatMessages, 600);
      }
      if (provider === 'anthropic') {
        return await this.callAnthropic(chatMessages, 600);
      }

      // Smart mock for chat
      return this.getMockChatResponse(messages);

    } catch (error) {
      console.error('Chat AI error:', error.message);

      // Specific error messages
      if (error.message?.includes('rate') || error.message?.includes('429')) {
        return this.getMockChatResponse(messages);
      }
      return this.getMockChatResponse(messages);
    }
  }

  /* ════════════════════════════════
     SMART MOCK RESPONSES
     Always available, no API needed
  ════════════════════════════════ */

  getMockResponse(messages) {
    const lastMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    return this.getMockChatResponse([{ role: 'user', content: lastMsg }]);
  }

  getMockChatResponse(messages) {
    const last = (messages.at(-1)?.content || '').toLowerCase();

    if (last.includes('plan') || last.includes('today') || last.includes('schedule')) {
      return `Here's a focused plan for today:\n\n**Morning (9–11 AM):** Tackle your hardest task first — DSA or whatever requires most concentration.\n\n**Midday (2–4 PM):** Project work or web dev practice — creative tasks work well here.\n\n**Evening (7–8 PM):** Review what you completed, prep tomorrow's task list.\n\nAim for 3 completed tasks minimum. What's your most important task today?`;
    }
    if (last.includes('dsa') || last.includes('leetcode') || last.includes('coding')) {
      return `For DSA improvement:\n\n• **Daily practice:** 2–3 problems/day beats cramming 20 once a week\n• **Pattern focus:** master sliding window, two pointers, BFS/DFS first\n• **Spaced repetition:** revisit problems you got wrong after 3 days\n• **Time yourself:** 20-25 min per medium problem is the target\n\nWhich topic feels weakest right now — trees, graphs, DP, or something else?`;
    }
    if (last.includes('motivat') || last.includes('tired') || last.includes('lazy')) {
      return `Motivation is unreliable — discipline is what you're building here.\n\nTry this: commit to just **2 minutes** of starting. Open the problem, write your name, do anything. Starting is 80% of the battle.\n\nAlso remember: your current streak and discipline score are proof you've already been doing the work. That momentum is real. What specifically feels hard right now?`;
    }
    if (last.includes('habit') || last.includes('routine') || last.includes('consistent')) {
      return `Habits are built through **tiny, non-negotiable daily actions**.\n\n• Pick ONE anchor habit (e.g., 9 AM = first task starts)\n• Stack it to something you already do (after breakfast → open laptop)\n• Track your streak — visible progress is powerful\n• Lower the bar to stay consistent: 1 task/day > 0 tasks/day\n\nWhat habit are you trying to build? I can help you design the specific trigger.`;
    }
    if (last.includes('adobe') || last.includes('internship') || last.includes('interview')) {
      return `For Adobe internship prep:\n\n• **DSA:** Focus on trees, graphs, DP — Adobe loves these\n• **System Design basics:** even for SDE intern roles, knowing LLD helps\n• **Projects:** VERIDYN itself is a strong talking point — full-stack + AI + analytics\n• **Timeline:** if internship is 6+ months away, 1 hour DSA/day is enough\n\nYour CGPA of 8.4 is solid. The differentiator will be your project depth. What part of prep do you want to focus on?`;
    }
    if (last.includes('stress') || last.includes('overwhelm') || last.includes('too much')) {
      return `When everything feels overwhelming, **zoom in, not out**.\n\nForget the full list. Ask: what is the ONE thing that, if done today, would make tomorrow easier?\n\nDo that. Just that. Then reassess.\n\nBig goals (Adobe internship, strong CGPA) are built from small daily wins. You don't have to solve everything today.`;
    }

    return `I'm your Veridyn AI coach — I can see your productivity data and give you specific guidance.\n\nI can help with:\n• **Study planning** — daily/weekly schedules\n• **DSA practice** — patterns, problems, approach\n• **Habit building** — consistency systems\n• **Interview prep** — Adobe/tech company strategies\n• **Motivation** — when you're stuck\n\nWhat do you want to work on right now?`;
  }

  mockRecommendations(score = 0) {
    return [
      { title: 'Start with your hardest task', description: 'Tackle the most challenging task first when energy is highest. This prevents decision fatigue later.', priority: 'high', category: 'focus' },
      { title: 'Use the Pomodoro technique', description: '25 minutes focused work, 5 min break. Prevents burnout and keeps consistency high.', priority: 'high', category: 'time-management' },
      { title: 'Track your energy patterns', description: 'Notice when you study best. Schedule hard tasks during peak hours.', priority: 'medium', category: 'habits' },
      { title: 'Active recall for learning', description: 'Test yourself after studying — flashcards and practice problems beat re-reading.', priority: 'medium', category: 'learning' },
      { title: 'Weekly review every Sunday', description: 'Review what worked and what didn\'t. Adjust your plan based on data.', priority: 'low', category: 'habits' },
    ];
  }

  mockSevenDayPlan() {
    return {
      planOverview: '7-day plan focused on building consistent daily habits and improving task completion.',
      days: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        focus: ['Foundation', 'Deep Work', 'Practice', 'Consolidation', 'Skill Building', 'Integration', 'Review'][i],
        goals: [`Complete ${3 + i} tasks`, 'Maintain discipline streak'],
        successMetric: `${70 + i * 3}%+ completion rate`,
      })),
      weeklyTarget: 'Achieve 85%+ task completion and build a 7-day streak.',
    };
  }
}

export default new AIService();
