export function calculateStreaks(records) {
  if (!records.length) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // sort by date
  const sorted = records.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);

    const diff =
      (curr - prev) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // current streak calculation
  let today = new Date();
  let lastRecord = new Date(sorted[sorted.length - 1].date);

  const diffToday =
    (today - lastRecord) / (1000 * 60 * 60 * 24);

  if (diffToday <= 1) {
    currentStreak = tempStreak;
  }

  return {
    currentStreak,
    longestStreak,
  };
}