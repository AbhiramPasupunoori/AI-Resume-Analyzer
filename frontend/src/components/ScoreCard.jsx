function ScoreCard({ title, score, maximum }) {
  return (
    <div className="score-card">
      <h3>{title}</h3>
      <strong>
        {score} / {maximum}
      </strong>
    </div>
  );
}

export default ScoreCard;
