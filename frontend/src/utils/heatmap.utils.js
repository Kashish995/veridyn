export const getColorByScore = (score) => {
  if (!score) return "#1e293b";
  if (score <= 20) return "#163d2a";
  if (score <= 40) return "#1f6f4a";
  if (score <= 60) return "#2ea043";
  if (score <= 80) return "#39d353";
  return "#56f97a";
};

export const buildYearMatrix = (year, data) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const dateMap = {};
  data.forEach((item) => {
    dateMap[item.date] = item.score;
  });

  const matrix = [];

  let current = new Date(start);

  while (current <= end) {
    const weekIndex = getWeekIndex(start, current);
    const dayIndex = current.getDay();

    if (!matrix[weekIndex]) {
      matrix[weekIndex] = new Array(7).fill(null);
    }

    const formatted = current.toISOString().split("T")[0];

    matrix[weekIndex][dayIndex] = {
      date: formatted,
      score: dateMap[formatted] || 0,
    };

    current.setDate(current.getDate() + 1);
  }

  return matrix;
};

const getWeekIndex = (startOfYear, currentDate) => {
  const diffInDays =
    Math.floor((currentDate - startOfYear) / (1000 * 60 * 60 * 24));

  return Math.floor(diffInDays / 7);
};