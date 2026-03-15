class PatternAnalysisService {
  analyzeStudyPatterns(tasksData) {
    const { tasks = [], studyLogs = [] } = tasksData;

    // Analyze by hour of day
    const hourlyProductivity = this.analyzeByHour(tasks);
    const bestHours = this.findBestHours(hourlyProductivity);
    const worstHours = this.findWorstHours(hourlyProductivity);
    const peakProductivityTime = this.findPeakTime(hourlyProductivity);

    // Analyze by day of week
    const dailyPatterns = this.analyzeByDay(tasks);

    return {
      bestHours,
      worstHours,
      peakProductivityTime,
      hourlyProductivity,
      dailyPatterns,
      insights: this.generateInsights(bestHours, worstHours, dailyPatterns)
    };
  }

  analyzeByHour(tasks) {
    const hourMap = {};

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourMap[i] = { completed: 0, total: 0, rate: 0 };
    }

    tasks.forEach(task => {
      if (task.startTime) {
        const hour = this.extractHour(task.startTime);
        hourMap[hour].total++;
        if (task.status === 'completed') {
          hourMap[hour].completed++;
        }
      }
    });

    // Calculate rates
    Object.keys(hourMap).forEach(hour => {
      const data = hourMap[hour];
      data.rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
    });

    return hourMap;
  }

  extractHour(timeString) {
    // Handle formats like "9:00 AM", "14:30", etc.
    const match = timeString.match(/(\d+):/);
    if (match) {
      let hour = parseInt(match[1]);
      if (timeString.includes('PM') && hour !== 12) hour += 12;
      if (timeString.includes('AM') && hour === 12) hour = 0;
      return hour;
    }
    return 0;
  }

  findBestHours(hourlyData) {
    const sortedHours = Object.entries(hourlyData)
      .filter(([_, data]) => data.total >= 2) // At least 2 tasks
      .sort((a, b) => b[1].rate - a[1].rate)
      .slice(0, 3);

    return sortedHours.map(([hour, data]) => ({
      hour: parseInt(hour),
      timeRange: this.formatTimeRange(parseInt(hour)),
      completionRate: Math.round(data.rate),
      tasksCompleted: data.completed,
      totalTasks: data.total
    }));
  }

  findWorstHours(hourlyData) {
    const sortedHours = Object.entries(hourlyData)
      .filter(([_, data]) => data.total >= 2)
      .sort((a, b) => a[1].rate - b[1].rate)
      .slice(0, 3);

    return sortedHours.map(([hour, data]) => ({
      hour: parseInt(hour),
      timeRange: this.formatTimeRange(parseInt(hour)),
      completionRate: Math.round(data.rate),
      tasksCompleted: data.completed,
      totalTasks: data.total
    }));
  }

  findPeakTime(hourlyData) {
    let maxRate = 0;
    let peakHour = 9;

    Object.entries(hourlyData).forEach(([hour, data]) => {
      if (data.total >= 2 && data.rate > maxRate) {
        maxRate = data.rate;
        peakHour = parseInt(hour);
      }
    });

    return {
      hour: peakHour,
      timeRange: this.formatTimeRange(peakHour),
      completionRate: Math.round(maxRate)
    };
  }

  analyzeByDay(tasks) {
    const dayMap = {
      Monday: { completed: 0, total: 0, rate: 0 },
      Tuesday: { completed: 0, total: 0, rate: 0 },
      Wednesday: { completed: 0, total: 0, rate: 0 },
      Thursday: { completed: 0, total: 0, rate: 0 },
      Friday: { completed: 0, total: 0, rate: 0 },
      Saturday: { completed: 0, total: 0, rate: 0 },
      Sunday: { completed: 0, total: 0, rate: 0 }
    };

    tasks.forEach(task => {
      if (task.date) {
        const day = new Date(task.date).toLocaleDateString('en-US', { weekday: 'long' });
        if (dayMap[day]) {
          dayMap[day].total++;
          if (task.status === 'completed') {
            dayMap[day].completed++;
          }
        }
      }
    });

    Object.keys(dayMap).forEach(day => {
      const data = dayMap[day];
      data.rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
    });

    return dayMap;
  }

  formatTimeRange(hour) {
    const start = hour;
    const end = (hour + 1) % 24;
    const formatHour = (h) => {
      if (h === 0) return '12 AM';
      if (h === 12) return '12 PM';
      if (h < 12) return `${h} AM`;
      return `${h - 12} PM`;
    };
    return `${formatHour(start)} - ${formatHour(end)}`;
  }

  generateInsights(bestHours, worstHours, dailyPatterns) {
    const insights = [];

    if (bestHours.length > 0) {
      const best = bestHours[0];
      insights.push(`Your peak productivity is during ${best.timeRange} with ${best.completionRate}% completion rate`);
    }

    if (worstHours.length > 0) {
      const worst = worstHours[0];
      insights.push(`Avoid scheduling important tasks during ${worst.timeRange} (${worst.completionRate}% completion)`);
    }

    // Find best day
    const bestDay = Object.entries(dailyPatterns)
      .filter(([_, data]) => data.total > 0)
      .sort((a, b) => b[1].rate - a[1].rate)[0];

    if (bestDay) {
      insights.push(`${bestDay[0]} is your most productive day`);
    }

    return insights;
  }
}

export default new PatternAnalysisService();