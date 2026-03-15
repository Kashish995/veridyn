class TaskPrioritizationService {
  prioritizeTasks(tasks, userContext = {}) {
    const { currentHour = new Date().getHours(), energyLevel = 'medium' } = userContext;

    // Score each task
    const scoredTasks = tasks.map(task => ({
      ...task,
      score: this.calculatePriorityScore(task, currentHour, energyLevel),
      reasoning: this.generateReasoning(task, currentHour, energyLevel)
    }));

    // Sort by score (highest first)
    const sortedTasks = scoredTasks.sort((a, b) => b.score - a.score);

    return {
      orderedTasks: sortedTasks.slice(0, 10), // Top 10
      summary: this.generateSummary(sortedTasks),
      timeAllocation: this.suggestTimeAllocation(sortedTasks.slice(0, 5))
    };
  }

  calculatePriorityScore(task, currentHour, energyLevel) {
    let score = 0;

    // Base priority
    const priorityMap = { high: 40, medium: 25, low: 10 };
    score += priorityMap[task.priority?.toLowerCase()] || 20;

    // Deadline urgency
    if (task.dueDate) {
      const daysUntilDue = this.getDaysUntilDue(task.dueDate);
      if (daysUntilDue <= 1) score += 30;
      else if (daysUntilDue <= 3) score += 20;
      else if (daysUntilDue <= 7) score += 10;
    }

    // Task difficulty vs energy level
    const difficulty = task.difficulty || 'medium';
    if (energyLevel === 'high' && difficulty === 'hard') score += 15;
    if (energyLevel === 'low' && difficulty === 'easy') score += 15;

    // Time of day suitability
    if (currentHour >= 9 && currentHour <= 11 && difficulty === 'hard') {
      score += 10; // Morning for hard tasks
    }

    // Status penalty (deprioritize in-progress tasks slightly)
    if (task.status === 'in-progress') score -= 5;

    return score;
  }

  getDaysUntilDue(dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  generateReasoning(task, currentHour, energyLevel) {
    const reasons = [];

    if (task.priority === 'high') {
      reasons.push('High priority');
    }

    if (task.dueDate) {
      const days = this.getDaysUntilDue(task.dueDate);
      if (days <= 1) reasons.push('Due very soon');
      else if (days <= 3) reasons.push('Due this week');
    }

    if (task.difficulty === 'hard' && energyLevel === 'high') {
      reasons.push('Matches your current energy level');
    }

    if (currentHour >= 9 && currentHour <= 11) {
      reasons.push('Optimal time for focused work');
    }

    return reasons.join(' • ');
  }

  generateSummary(tasks) {
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const urgent = tasks.filter(t => {
      if (!t.dueDate) return false;
      return this.getDaysUntilDue(t.dueDate) <= 2;
    }).length;

    return {
      totalTasks: tasks.length,
      highPriority,
      urgent,
      recommendation: urgent > 0 
        ? `Focus on ${urgent} urgent task${urgent > 1 ? 's' : ''} first`
        : 'Start with highest priority tasks'
    };
  }

  suggestTimeAllocation(topTasks) {
    return topTasks.map((task, index) => ({
      task: task.title,
      suggestedTime: this.estimateTime(task),
      order: index + 1,
      reason: task.reasoning
    }));
  }

  estimateTime(task) {
    const difficultyTime = {
      easy: '30-45 min',
      medium: '1-2 hours',
      hard: '2-3 hours'
    };
    return difficultyTime[task.difficulty] || '1 hour';
  }
}

export default new TaskPrioritizationService();