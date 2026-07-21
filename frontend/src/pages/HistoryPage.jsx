import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { deleteAnalysis, getAnalyses } from "../api/analysisApi";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

import { getErrorMessage } from "../utils/errorUtils";
import {
  deleteEditedResumeSnapshot,
  loadEditedResumeHistory,
  restoreEditedResume,
  saveBuilderStep,
} from "../utils/resumeBuilderStorage";

function HistoryPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [editedResumes, setEditedResumes] = useState(() => loadEditedResumeHistory());
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

  if (error && analyses.length === 0 && editedResumes.length === 0) {
    return (
      <main className="page">
        <ErrorMessage message={error} onRetry={loadAnalyses} />
      </main>
    );
  }

  function reopenResume(snapshot, destination) {
    restoreEditedResume(snapshot);
    saveBuilderStep(0);
    navigate(destination);
  }

  function handleDeleteEditedResume(snapshotId) {
    const confirmed = window.confirm("Are you sure you want to delete this saved resume?");
    if (confirmed) {
      setEditedResumes(deleteEditedResumeSnapshot(snapshotId));
      setSuccessMessage("Saved resume deleted successfully.");
    }
  }

  return (
    <main className="page history-page">
      {error && <ErrorMessage message={error} />}

      {successMessage && <div className="success-box">{successMessage}</div>}

      <details className="history-accordion" open>
        <summary>
          <span className="history-accordion-copy">
            <strong>Resume History</strong>
            <small>Continue editing or reopen your saved resume-builder drafts.</small>
          </span>
          <span className="history-accordion-arrow" aria-hidden="true" />
        </summary>
        <section className="history-section">
        {editedResumes.length === 0 ? (
          <EmptyState
            title="No edited resumes yet"
            message="Finalize a resume in the builder and it will appear here."
            action={<Link className="glow-button" to="/resume-builder">Build a Resume</Link>}
          />
        ) : (
          <div className="edited-resume-grid">
            {editedResumes.map((snapshot) => (
              <article className="edited-resume-card" key={snapshot.id}>
                <div className="edited-resume-icon" aria-hidden="true">▤</div>
                <div className="edited-resume-details">
                  <span>Edited resume</span>
                  <h3>{snapshot.name}</h3>
                  <p>{snapshot.resume?.desired_job_title || "No desired job title"}</p>
                  <small>Updated {new Date(snapshot.updatedAt).toLocaleString()}</small>
                  <small>Template: {snapshot.template || "ATS Classic"}</small>
                </div>
                <div className="edited-resume-actions">
                  <button className="glow-button" type="button" onClick={() => reopenResume(snapshot, "/resume-builder/edit")}>Continue Editing</button>
                  <button className="outline-dark-button" type="button" onClick={() => reopenResume(snapshot, "/resume-builder/review")}>Open Final Resume</button>
                  <button className="danger-button" type="button" onClick={() => handleDeleteEditedResume(snapshot.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
        </section>
      </details>

      <details className="history-accordion">
        <summary>
          <span className="history-accordion-copy">
            <strong>Analysis History</strong>
            <small>Review your previous ATS scores and resume analysis results.</small>
          </span>
          <span className="history-accordion-arrow" aria-hidden="true" />
        </summary>
        <section className="history-section analysis-history-section">
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
        </section>
      </details>
    </main>
  );
}

export default HistoryPage;
