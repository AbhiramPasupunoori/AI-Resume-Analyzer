import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deleteAnalysis, getAnalyses } from "../api/analysisApi";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

import { getErrorMessage } from "../utils/errorUtils";

function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  async function handleDeleteAnalysis(analysisId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(analysisId);
      setError("");
      setSuccessMessage("");

      await deleteAnalysis(analysisId);

      setAnalyses((currentAnalyses) =>
        currentAnalyses.filter((analysis) => analysis.id !== analysisId)
      );

      setSuccessMessage("Analysis deleted successfully.");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <LoadingSpinner message="Loading analysis history..." />
      </main>
    );
  }

  if (error && analyses.length === 0) {
    return (
      <main className="page">
        <ErrorMessage message={error} onRetry={loadAnalyses} />
      </main>
    );
  }

  return (
    <main className="page history-page">
      <div className="page-header">
        <span className="modern-badge">History</span>
        <h1>Analysis History</h1>
        <p>View or delete your previous resume analysis results.</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {successMessage && <div className="success-box">{successMessage}</div>}

      {analyses.length === 0 ? (
        <EmptyState
          title="No analyses yet"
          message="Upload a resume and create your first analysis to see it here."
          action={
            <Link className="glow-button" to="/analyze">
              Start Analysis
            </Link>
          }
        />
      ) : (
        <div className="history-list">
          {analyses.map((analysis) => (
            <div className="history-card" key={analysis.id}>
              <div>
                <h2>{analysis.job_description?.job_title || "Untitled Job"}</h2>

                <p>
                  Resume:{" "}
                  {analysis.resume?.original_filename || "Not available"}
                </p>

                <p>
                  Company:{" "}
                  {analysis.job_description?.company_name || "Not provided"}
                </p>

                <p>Status: {analysis.status}</p>
              </div>

              <div className="history-score-box">
                <span>Score</span>
                <strong>{analysis.overall_score} / 100</strong>
              </div>

              <div className="history-actions">
                <Link className="outline-dark-button" to={`/results/${analysis.id}`}>
                  View Result
                </Link>

                <button
                  className="danger-button"
                  onClick={() => handleDeleteAnalysis(analysis.id)}
                  disabled={deletingId === analysis.id}
                >
                  {deletingId === analysis.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default HistoryPage;
