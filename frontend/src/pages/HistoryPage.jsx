import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAnalyses } from "../api/analysisApi";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

import { getErrorMessage } from "../utils/errorUtils";

function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAnalyses();

      if (Array.isArray(data)) {
        setAnalyses(data);
      } else if (Array.isArray(data.results)) {
        setAnalyses(data.results);
      } else {
        setAnalyses([]);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  if (loading) {
    return (
      <main className="page">
        <LoadingSpinner message="Loading analysis history..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <ErrorMessage message={error} onRetry={loadAnalyses} />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Analysis History</h1>
        <p>View your previous resume analysis results.</p>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          title="No analyses yet"
          message="Upload a resume and create your first analysis to see it here."
          action={
            <Link className="primary-button" to="/analyze">
              Start Analysis
            </Link>
          }
        />
      ) : (
        <div className="history-list">
          {analyses.map((analysis) => (
            <div className="card history-item" key={analysis.id}>
              <h2>{analysis.job_description?.job_title || "Untitled Job"}</h2>

              <p>
                Resume:{" "}
                {analysis.resume?.original_filename || "Not available"}
              </p>

              <p>Score: {analysis.overall_score} / 100</p>

              <p>Status: {analysis.status}</p>

              <Link className="secondary-link" to={`/results/${analysis.id}`}>
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