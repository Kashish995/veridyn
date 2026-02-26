// utils/tier.util.js

export const getTierFromCompletionRate = (rate) => {
  if (rate >= 85) return "Elite";
  if (rate >= 75) return "Gold";
  if (rate >= 60) return "Silver";
  if (rate >= 50) return "Bronze";
  return "Distracted";
};

export const getTierRange = (tier) => {
  const ranges = {
    Elite: "85%+",
    Gold: "75% - 85%",
    Silver: "60% - 75%",
    Bronze: "50% - 60%",
    Distracted: "<50%"
  };

  return ranges[tier] || null;
};

export const getTierBadge = (tier) => {
  const badges = {
    Elite: "🏆",
    Gold: "🥇",
    Silver: "🥈",
    Bronze: "🥉",
    Distracted: "⚠️"
  };

  return badges[tier] || "⚠️";
};