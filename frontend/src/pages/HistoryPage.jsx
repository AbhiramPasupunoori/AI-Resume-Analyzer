import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAnalyses } from "../api/analysisApi";

function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalyses() {
      try {
        setLoading(true);
        const data = await getAnalyses();

        if (Array.isArray(data)) {
          setAnalyses(data);
        } else if (Array.isArray(data.results)) {
          setAnalyses(data.results);
        } else {
          setAnalyses([]);
        }
      } catch (error) {
        setError("Could not load analysis history.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalyses();
  }, []);

  if (loading) {
    return <main className="page">Loading history...</main>;
  }

  return (
    <main className="page">
      <h1>Analysis History</h1>

      {error && <div className="error-box">{error}</div>}

      {analyses.length === 0 ? (
        <p>No analyses found.</p>
      ) : (
        <div className="history-list">
          {analyses.map((analysis) => (
            <div className="card history-item" key={analysis.id}>
              <h2>{analysis.job_description?.job_title}</h2>
              <p>{analysis.resume?.original_filename}</p>
              <p>Score: {analysis.overall_score} / 100</p>

              <Link to={`/results/${analysis.id}`}>
                View Result
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default HistoryPage;