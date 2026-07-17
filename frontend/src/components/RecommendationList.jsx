function RecommendationList({ recommendations }) {
  return (
    <div className="card">
      <h2>Recommendations</h2>

      {recommendations && recommendations.length > 0 ? (
        <ul>
          {recommendations.map((recommendation, index) => (
            <li key={`${recommendation}-${index}`}>
              {recommendation}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">
          Recommendations will appear after the backend recommendation service is added.
        </p>
      )}
    </div>
  );
}

export default RecommendationList;