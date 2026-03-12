export const calculateDisciplineRisk = (history) => {

  if (!history || history.length < 5) {
    return {
      riskLevel: "Unknown",
      reason: "Not enough history"
    };
  }

  const scores = history.map(h => h.disciplineScore);

  const recent = scores.slice(0, 3);
  const older = scores.slice(3, 6);

  const recentAvg =
    recent.reduce((a,b)=>a+b,0) / recent.length;

  const olderAvg =
    older.reduce((a,b)=>a+b,0) / older.length;

  let riskLevel = "Low";
  let reason = "Stable productivity";

  if (recentAvg < olderAvg - 10) {
    riskLevel = "High";
    reason = "Productivity dropping quickly";
  }
  else if (recentAvg < olderAvg - 5) {
    riskLevel = "Medium";
    reason = "Productivity slightly declining";
  }

  return {
    riskLevel,
    reason,
    recentAverage: recentAvg.toFixed(2),
    previousAverage: olderAvg.toFixed(2)
  };

};