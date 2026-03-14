import OpenAI from "openai";

class AIService {
  constructor() {
    this.useMockData = true; // Set to false when you have OpenAI credits
    
    if (!this.useMockData) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.model = 'gpt-4o-mini';
    }
  }

  async generateResponse(prompt, maxTokens = 2000) {
    if (this.useMockData) {
      // Return mock data immediately
      return "Mock response";
    }

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

  async generateRecommendations(userData) {
    if (this.useMockData) {
      return JSON.stringify([
        {
          title: "Establish a Morning Routine",
          description: "Start your day with a consistent routine. Wake up at the same time, review your goals, and tackle your hardest task first. This builds momentum and improves daily completion rates.",
          priority: "high",
          category: "time-management"
        },
        {
          title: "Use the Pomodoro Technique",
          description: "Break study sessions into 25-minute focused blocks with 5-minute breaks. This prevents burnout and maintains high concentration levels throughout the day.",
          priority: "high",
          category: "focus"
        },
        {
          title: "Track Your Energy Patterns",
          description: "Notice when you're most productive during the day. Schedule challenging tasks like DSA practice during your peak energy hours and lighter tasks during low-energy periods.",
          priority: "medium",
          category: "habits"
        },
        {
          title: "Active Recall for Learning",
          description: "Instead of just reading notes, test yourself regularly. Use flashcards, practice problems, and teach concepts to others to strengthen retention.",
          priority: "medium",
          category: "learning-technique"
        },
        {
          title: "Weekly Progress Reviews",
          description: "Every Sunday, review what worked and what didn't. Adjust your schedule based on actual performance data rather than ideal plans.",
          priority: "low",
          category: "habits"
        }
      ]);
    }

    const prompt = this.buildRecommendationPrompt(userData);
    return await this.generateResponse(prompt);
  }

  async generateExplanation(analysisData) {
    if (this.useMockData) {
      const { metric, currentValue, trend } = analysisData;
      
      return JSON.stringify({
        explanation: `Your ${metric} of ${currentValue}% shows ${trend.toLowerCase()} performance. This indicates you're currently in a transition phase. The volatility in your scores suggests inconsistent daily execution. Focus on building stable habits rather than perfect scores.`,
        actionItem: "Set a minimum daily baseline: complete at least 3 tasks every day, no exceptions. Consistency beats intensity."
      });
    }

    const prompt = this.buildExplanationPrompt(analysisData);
    return await this.generateResponse(prompt, 1000);
  }

  async generate7DayPlan(userData, goals) {
    if (this.useMockData) {
      return JSON.stringify({
        planOverview: "This 7-day plan focuses on building consistency through incremental improvements. Each day targets a specific skill while maintaining your core study routine.",
        days: [
          {
            day: 1,
            focus: "Foundation Day - Establish Baseline",
            goals: [
              "Complete morning routine by 9 AM",
              "Finish 3 priority tasks",
              "Track time spent on each activity"
            ],
            timeBlocks: [
              {
                time: "7:00 AM - 8:00 AM",
                activity: "Morning routine: Exercise, breakfast, plan the day",
                subject: "Productivity"
              },
              {
                time: "9:00 AM - 11:30 AM",
                activity: "DSA Practice: Arrays and String problems",
                subject: "DSA"
              },
              {
                time: "2:00 PM - 4:00 PM",
                activity: "Web Development: Continue full-stack course",
                subject: "Web Development"
              },
              {
                time: "7:00 PM - 8:30 PM",
                activity: "DBMS Study: Normalization and SQL queries",
                subject: "DBMS"
              }
            ],
            successMetric: "Complete all 3 scheduled tasks and log time accurately"
          },
          {
            day: 2,
            focus: "Deep Work Day - Maximum Focus",
            goals: [
              "2-hour uninterrupted DSA session",
              "Complete one full project module",
              "Zero phone distractions during work blocks"
            ],
            timeBlocks: [
              {
                time: "8:00 AM - 10:00 AM",
                activity: "Deep DSA session: Linked Lists implementation",
                subject: "DSA"
              },
              {
                time: "10:30 AM - 12:30 PM",
                activity: "Project work: Backend API development",
                subject: "Web Development"
              },
              {
                time: "3:00 PM - 5:00 PM",
                activity: "System Design reading and note-taking",
                subject: "System Design"
              }
            ],
            successMetric: "Complete 2 hours of DSA without breaks, finish backend module"
          },
          {
            day: 3,
            focus: "Practice & Application",
            goals: [
              "Solve 5 medium-level DSA problems",
              "Build a small feature in VERIDYN",
              "Review and refactor yesterday's code"
            ],
            timeBlocks: [
              {
                time: "9:00 AM - 11:00 AM",
                activity: "LeetCode practice: 5 medium problems",
                subject: "DSA"
              },
              {
                time: "1:00 PM - 3:30 PM",
                activity: "VERIDYN feature: Add data visualization",
                subject: "Web Development"
              },
              {
                time: "7:00 PM - 8:00 PM",
                activity: "Code review and optimization",
                subject: "Web Development"
              }
            ],
            successMetric: "Submit all 5 problems successfully, deploy new feature"
          },
          {
            day: 4,
            focus: "Knowledge Consolidation",
            goals: [
              "Create summary notes for DSA patterns",
              "Document learnings from VERIDYN development",
              "Prepare questions for interview practice"
            ],
            timeBlocks: [
              {
                time: "8:00 AM - 10:00 AM",
                activity: "DSA pattern documentation: Sliding window, two pointers",
                subject: "DSA"
              },
              {
                time: "11:00 AM - 1:00 PM",
                activity: "Write technical blog post about recent learning",
                subject: "Productivity"
              },
              {
                time: "3:00 PM - 5:00 PM",
                activity: "Mock interview prep: Behavioral questions",
                subject: "Interview Prep"
              }
            ],
            successMetric: "Complete DSA cheat sheet, publish blog post draft"
          },
          {
            day: 5,
            focus: "Skill Expansion",
            goals: [
              "Learn new DSA topic: Trees",
              "Explore advanced MongoDB features",
              "Research Adobe tech stack"
            ],
            timeBlocks: [
              {
                time: "9:00 AM - 11:30 AM",
                activity: "Binary Trees: Traversals and basic operations",
                subject: "DSA"
              },
              {
                time: "1:00 PM - 3:00 PM",
                activity: "MongoDB: Aggregation pipelines",
                subject: "Web Development"
              },
              {
                time: "4:00 PM - 5:30 PM",
                activity: "Research Adobe products and required skills",
                subject: "Career Prep"
              }
            ],
            successMetric: "Implement 3 tree algorithms, complete MongoDB tutorial"
          },
          {
            day: 6,
            focus: "Integration & Projects",
            goals: [
              "Apply tree concepts to solve problems",
              "Integrate MongoDB aggregation in VERIDYN",
              "Build portfolio project update"
            ],
            timeBlocks: [
              {
                time: "8:00 AM - 10:00 AM",
                activity: "Tree problems: BST, DFS, BFS",
                subject: "DSA"
              },
              {
                time: "10:30 AM - 1:00 PM",
                activity: "VERIDYN: Add analytics dashboard with aggregations",
                subject: "Web Development"
              },
              {
                time: "3:00 PM - 5:00 PM",
                activity: "Update portfolio website with recent projects",
                subject: "Career Prep"
              }
            ],
            successMetric: "Solve 4 tree problems, deploy analytics feature"
          },
          {
            day: 7,
            focus: "Review & Planning",
            goals: [
              "Weekly performance review",
              "Plan next week's learning objectives",
              "Reflect on productivity patterns"
            ],
            timeBlocks: [
              {
                time: "9:00 AM - 10:30 AM",
                activity: "Review all DSA problems solved this week",
                subject: "DSA"
              },
              {
                time: "11:00 AM - 12:00 PM",
                activity: "Analyze VERIDYN data: What worked, what didn't",
                subject: "Productivity"
              },
              {
                time: "2:00 PM - 4:00 PM",
                activity: "Plan week 2: Set goals, prepare resources",
                subject: "Productivity"
              },
              {
                time: "7:00 PM - 8:00 PM",
                activity: "Leisure: Watch tech talk or read tech articles",
                subject: "Learning"
              }
            ],
            successMetric: "Complete week review, have clear plan for week 2"
          }
        ],
        weeklyTarget: "Achieve 85%+ task completion rate, solve 20+ DSA problems, ship 2 VERIDYN features, and establish consistent daily routine"
      });
    }

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
  "days": [...],
  "weeklyTarget": "target"
}`;
  }
}

export default new AIService();