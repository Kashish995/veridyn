class RiskAnalysisService {
  calculateRisk(userData) {
    const {
      weeklyStats = [],
      history = [],
      currentStreak = 0,
      completionRate = 0,
      volatility = 0
    } = userData;

    let riskScore = 0;
    let riskReasons = [];
    let warnings = [];

    // 1. Check declining trend (last 3 days)
    if (weeklyStats.length >= 3) {
      const last3Days = weeklyStats.slice(-3);
      const rates = last3Days.map(d => {
        const total = d.completed + d.missed;
        return total > 0 ? (d.completed / total) * 100 : 0;
      });

      const isdeclining = rates[2] < rates[1] && rates[1] < rates[0];
      if (isdeclining) {
        riskScore += 30;
        riskReasons.push("Completion rate declining last 3 days");
      }
    }

    // 2. Check streak instability
    if (currentStreak < 3) {
      riskScore += 25;
      riskReasons.push("Streak instability detected");
      warnings.push("Current streak is below 3 days");
    }

    // 3. Check volatility
    if (volatility > 15) {
      riskScore += 20;
      riskReasons.push("High behavioral volatility detected");
    } else if (volatility > 10) {
      riskScore += 10;
      riskReasons.push("Moderate behavioral fluctuations");
    }

    // 4. Check current completion rate
    if (completionRate < 50) {
      riskScore += 25;
      riskReasons.push("Current completion rate below 50%");
      warnings.push("Immediate action needed to prevent further decline");
    } else if (completionRate < 70) {
      riskScore += 15;
      riskReasons.push("Completion rate below target threshold");
    }

    // 5. Determine risk level
    let riskLevel = "Low";
    let riskColor = "green";
    let riskIcon = "✅";

    if (riskScore >= 60) {
      riskLevel = "High";
      riskColor = "red";
      riskIcon = "🔴";
    } else if (riskScore >= 30) {
      riskLevel = "Medium";
      riskColor = "yellow";
      riskIcon = "⚠️";
    }

    // 6. Generate recommendations based on risk
    const recommendations = this.generateRiskRecommendations(riskLevel, riskReasons);

    return {
      riskLevel,
      riskScore,
      riskColor,
      riskIcon,
      reasons: riskReasons,
      warnings,
      recommendations,
      predictedOutcome: this.predictOutcome(riskLevel, completionRate)
    };
  }

  generateRiskRecommendations(riskLevel, reasons) {
    const recommendations = [];

    if (riskLevel === "High") {
      recommendations.push("URGENT: Take immediate action to stabilize productivity");
      recommendations.push("Reset your routine: Start with just 2 essential tasks tomorrow");
      recommendations.push("Identify and eliminate your biggest distraction today");
    } else if (riskLevel === "Medium") {
      recommendations.push("Warning signs detected - address them now before they worsen");
      recommendations.push("Review your schedule and remove non-essential commitments");
      recommendations.push("Focus on consistency over perfection for the next 3 days");
    } else {
      recommendations.push("Maintain your current momentum");
      recommendations.push("Consider gradually increasing task difficulty");
    }

    return recommendations;
  }

  predictOutcome(riskLevel, currentRate) {
    if (riskLevel === "High") {
      const predicted = Math.max(currentRate - 15, 20);
      return `If no action taken, productivity likely to drop to ${predicted}% within 3 days`;
    } else if (riskLevel === "Medium") {
      const predicted = Math.max(currentRate - 8, 40);
      return `Potential drop to ${predicted}% if trend continues`;
    } else {
      const predicted = Math.min(currentRate + 5, 95);
      return `On track to reach ${predicted}% with current habits`;
    }
  }
}

export default new RiskAnalysisService();