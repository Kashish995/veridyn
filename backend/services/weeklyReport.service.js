class WeeklyReportService {
  generateWeeklyReport(weekData) {
    const { weeklyStats = [], history = [], currentStreak = 0 } = weekData;

    // Calculate weekly metrics
    const bestDay = this.findBestDay(weeklyStats);
    const worstDay = this.findWorstDay(weeklyStats);
    const avgDiscipline = this.calculateAverageDiscipline(history);
    const trend = this.determineTrend(weeklyStats);
    const achievements = this.identifyAchievements(weekData);
    const improvements = this.suggestImprovements(weeklyStats, avgDiscipline);

    return {
      period: this.getWeekPeriod(),
      summary: {
        bestDay,
        worstDay,
        avgDiscipline: Math.round(avgDiscipline),
        trend,
        currentStreak
      },
      achievements,
      improvements,
      weeklyScore: this.calculateWeeklyScore(weeklyStats),
      nextWeekGoals: this.generateNextWeekGoals(trend, avgDiscipline)
    };
  }

  findBestDay(weeklyStats) {
    if (weeklyStats.length === 0) return { date: 'N/A', score: 0 };

    const best = weeklyStats.reduce((max, day) => {
      const total = day.completed + day.missed;
      const rate = total > 0 ? (day.completed / total) * 100 : 0;
      const maxTotal = max.completed + max.missed;
      const maxRate = maxTotal > 0 ? (max.completed / maxTotal) * 100 : 0;
      return rate > maxRate ? day : max;
    });

    const total = best.completed + best.missed;
    return {
      date: best.date,
      completionRate: total > 0 ? Math.round((best.completed / total) * 100) : 0,
      tasksCompleted: best.completed
    };
  }

  findWorstDay(weeklyStats) {
    if (weeklyStats.length === 0) return { date: 'N/A', score: 0 };

    const worst = weeklyStats.reduce((min, day) => {
      const total = day.completed + day.missed;
      const rate = total > 0 ? (day.completed / total) * 100 : 0;
      const minTotal = min.completed + min.missed;
      const minRate = minTotal > 0 ? (min.completed / minTotal) * 100 : 100;
      return rate < minRate ? day : min;
    });

    const total = worst.completed + worst.missed;
    return {
      date: worst.date,
      completionRate: total > 0 ? Math.round((worst.completed / total) * 100) : 0,
      tasksCompleted: worst.completed
    };
  }

  calculateAverageDiscipline(history) {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, day) => acc + (day.disciplineScore || 0), 0);
    return sum / history.length;
  }

  determineTrend(weeklyStats) {
    if (weeklyStats.length < 2) return 'Stable';

    const firstHalf = weeklyStats.slice(0, Math.floor(weeklyStats.length / 2));
    const secondHalf = weeklyStats.slice(Math.floor(weeklyStats.length / 2));

    const firstAvg = this.calculateAvgCompletion(firstHalf);
    const secondAvg = this.calculateAvgCompletion(secondHalf);

    const diff = secondAvg - firstAvg;

    if (diff >= 10) return 'Strong Improvement';
    if (diff > 0) return 'Improving';
    if (diff <= -10) return 'Declining';
    if (diff < 0) return 'Slight Decline';
    return 'Stable';
  }

  calculateAvgCompletion(stats) {
    if (stats.length === 0) return 0;
    const sum = stats.reduce((acc, day) => {
      const total = day.completed + day.missed;
      return acc + (total > 0 ? (day.completed / total) * 100 : 0);
    }, 0);
    return sum / stats.length;
  }

  identifyAchievements(weekData) {
    const achievements = [];
    const { currentStreak, weeklyStats = [] } = weekData;

    if (currentStreak >= 7) {
      achievements.push({ icon: '🔥', text: 'Maintained 7-day streak!', type: 'streak' });
    }

    const avgCompletion = this.calculateAvgCompletion(weeklyStats);
    if (avgCompletion >= 85) {
      achievements.push({ icon: '⭐', text: 'Achieved 85%+ completion rate', type: 'performance' });
    }

    const totalCompleted = weeklyStats.reduce((sum, day) => sum + day.completed, 0);
    if (totalCompleted >= 20) {
      achievements.push({ icon: '🎯', text: `Completed ${totalCompleted} tasks this week`, type: 'volume' });
    }

    return achievements;
  }

  suggestImprovements(weeklyStats, avgDiscipline) {
    const improvements = [];

    const avgCompletion = this.calculateAvgCompletion(weeklyStats);

    if (avgCompletion < 70) {
      improvements.push('Focus on completing at least 3 tasks daily');
    }

    if (avgDiscipline < 65) {
      improvements.push('Establish a consistent morning routine');
    }

    const consistency = this.measureConsistency(weeklyStats);
    if (consistency < 0.7) {
      improvements.push('Work on daily consistency - avoid zero-task days');
    }

    return improvements;
  }

  measureConsistency(weeklyStats) {
    if (weeklyStats.length === 0) return 0;
    const daysWithTasks = weeklyStats.filter(day => day.completed > 0).length;
    return daysWithTasks / weeklyStats.length;
  }

  calculateWeeklyScore(weeklyStats) {
    const avgCompletion = this.calculateAvgCompletion(weeklyStats);
    if (avgCompletion >= 85) return 'Excellent';
    if (avgCompletion >= 70) return 'Good';
    if (avgCompletion >= 50) return 'Fair';
    return 'Needs Improvement';
  }

  generateNextWeekGoals(trend, avgDiscipline) {
    const goals = [];

    if (trend.includes('Declining')) {
      goals.push('Reverse the declining trend - aim for 70%+ completion');
    } else if (trend.includes('Improving')) {
      goals.push('Maintain momentum - target 80%+ completion rate');
    } else {
      goals.push('Increase consistency - complete tasks daily');
    }

    if (avgDiscipline < 70) {
      goals.push('Improve discipline score to 75+');
    }

    goals.push('Build a 7-day streak');

    return goals;
  }

  getWeekPeriod() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    
    const format = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${format(weekAgo)} - ${format(now)}`;
  }
}

export default new WeeklyReportService();