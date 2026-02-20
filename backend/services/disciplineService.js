export const calculateDailyDiscipline = ({
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

  let totalWeight = 0;
  let completedWeight = 0;
  let missedCount = 0;

  tasks.forEach(task => {
    let weight = 1;

    if (task.priority === "high") weight = 3;
    if (task.priority === "medium") weight = 2;

    totalWeight += weight;

    if (task.status === "completed") {
      completedWeight += weight;
    }

    if (task.status === "missed") {
      missedCount++;
    }
  });

  const completionRate =
    totalWeight === 0 ? 0 : completedWeight / totalWeight;

  let scoreChange = Math.round(completionRate * 20);

  if (missedCount === 0 && completionRate > 0) {
    currentStreak += 1;
    scoreChange += currentStreak; // streak multiplier
  } else {
    currentStreak = 0;
  }

  let newScore = currentScore + scoreChange;

  newScore = Math.max(0, Math.min(100, newScore));

  return {
    newScore,
    newStreak: currentStreak
  };
};