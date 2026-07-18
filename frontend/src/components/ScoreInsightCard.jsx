function getScoreStatus(score, maximum) {
  const numericScore = Number(score) || 0;
  const numericMaximum = Number(maximum) || 1;
  const percentage = (numericScore / numericMaximum) * 100;

  if (percentage >= 80) {
    return "Excellent";
  }

  if (percentage >= 60) {
    return "Good";
  }

  if (percentage >= 40) {
    return "Average";
  }

  return "Needs Work";
}

function ScoreInsightCard({
  title,
  score,
  maximum,
  description,
  suggestions = [],
}) {
  const status = getScoreStatus(score, maximum);
  const statusClass = status.toLowerCase().replace(" ", "-");

  return (
    <div className="insight-card">
      <div className="insight-card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <div className="insight-score">
          <strong>{score}</strong>
          <span>/ {maximum}</span>
        </div>
      </div>

      <span className={`score-status ${statusClass}`}>{status}</span>

      {suggestions.length > 0 && (
        <ul className="insight-suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion}-${index}`}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ScoreInsightCard;
