export const calculateDisciplineChange = ({
  tasks,
  currentScore,
  currentStreak
}) => {

  if (!tasks || tasks.length === 0) {
    return {
      newScore: currentScore,
      newStreak: 0
    };
  }

  let weightedTotal = 0;
  let weightedCompleted = 0;
  let missedCount = 0;

  const weights = {
    high: 1.5,
    medium: 1,
    low: 0.7
  };

  tasks.forEach(task => {
    const weight = weights[task.priority] || 1;

    weightedTotal += weight;

    if (task.status === "completed") {
      weightedCompleted += weight;
    }

    if (task.status === "missed") {
      missedCount++;
    }
  });

  const completionRate =
    weightedTotal === 0
      ? 0
      : weightedCompleted / weightedTotal;

  let scoreChange = 0;

  // Base rate scoring
  scoreChange += Math.round((completionRate - 0.5) * 20);

  // Zero productivity penalty
  if (weightedCompleted === 0 && weightedTotal > 0) {
    scoreChange -= 5;
  }

  // Miss penalty
  scoreChange -= missedCount * 2;

  // Clamp daily swing
  if (scoreChange > 10) scoreChange = 10;
  if (scoreChange < -10) scoreChange = -10;

  let newScore = currentScore + scoreChange;

  // Clamp overall score
  if (newScore > 100) newScore = 100;
  if (newScore < 0) newScore = 0;

  // Streak logic
  let newStreak = currentStreak;

  if (missedCount === 0 && weightedCompleted > 0) {
    newStreak += 1;
    newScore += Math.min(newStreak, 5); // streak bonus capped
  } else {
    newStreak = 0;
  }

  if (newScore > 100) newScore = 100;

  return {
    newScore,
    newStreak
  };
};