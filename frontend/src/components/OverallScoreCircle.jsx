function OverallScoreCircle({ score }) {
  const numericScore = Number(score) || 0;
  const boundedScore = Math.min(Math.max(numericScore, 0), 100);

  const radius = 72;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const strokeDashoffset =
    circumference - (boundedScore / 100) * circumference;

  function getScoreLabel(value) {
    if (value >= 80) {
      return "Excellent";
    }

    if (value >= 60) {
      return "Good";
    }

    if (value >= 40) {
      return "Average";
    }

    return "Needs Work";
  }

  return (
    <div className="overall-score-card">
      <svg height={radius * 2} width={radius * 2} className="score-circle">
        <circle
          stroke="rgba(148, 163, 184, 0.25)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke="#60a5fa"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="score-circle-progress"
        />
      </svg>

      <div className="score-circle-content">
        <strong>{boundedScore.toFixed(1)}</strong>
        <span>/ 100</span>
      </div>

      <h3>{getScoreLabel(boundedScore)}</h3>
      <p>Overall resume match score</p>
    </div>
  );
}

export default OverallScoreCircle;
