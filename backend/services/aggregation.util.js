export const groupByMonth = (history) => {
  const grouped = {};

  history.forEach(day => {
    const month = day.date.slice(0, 7);

    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(day);
  });

  return grouped;
};

export const calculateAverageCompletion = (records) => {
  if (!records.length) return 0;

  const total = records.reduce(
    (sum, r) => sum + r.completionRate,
    0
  );

  return Number((total / records.length).toFixed(1));
};

export const calculateDominantTier = (records) => {
  const tierCount = {};

  records.forEach(r => {
    tierCount[r.tier] =
      (tierCount[r.tier] || 0) + 1;
  });

  return Object.keys(tierCount).reduce((a, b) =>
    tierCount[a] > tierCount[b] ? a : b
  );
};