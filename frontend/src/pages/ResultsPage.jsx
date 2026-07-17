import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAnalysis } from "../api/analysisApi";

import OverallScoreCircle from "../components/OverallScoreCircle";
import ScoreBreakdown from "../components/ScoreBreakdown";
import ScoreChart from "../components/ScoreChart";
import SkillList from "../components/SkillList";
import RecommendationList from "../components/RecommendationList";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

import { getErrorMessage } from "../utils/errorUtils";

function ResultsPage() {
  const { id } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAnalysis(id);
      setAnalysis(data);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  if (loading) {
    return (
      <main className="page">
        <LoadingSpinner message="Loading analysis result..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <ErrorMessage message={error} onRetry={loadAnalysis} />
      </main>
    );
  }

  if (!analysis) {
    return (
      <main className="page">
        <EmptyState
          title="No analysis found"
          message="The requested analysis result could not be found."
        />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="result-header">
        <div>
          <h1>Resume Analysis Result</h1>
          <p className="muted">
            Review your resume match score, missing skills and improvement areas.
          </p>
        </div>

        <OverallScoreCircle score={analysis.overall_score} />
      </div>

      <div className="card">
        <h2>Resume</h2>
        <p>{analysis.resume?.original_filename || "Not available"}</p>

        <h2>Job</h2>
        <p>
          {analysis.job_description?.job_title || "Not available"}
          {analysis.job_description?.company_name
            ? ` at ${analysis.job_description.company_name}`
            : ""}
        </p>
      </div>

      <ScoreBreakdown scoreBreakdown={analysis.score_breakdown} />

      <ScoreChart scoreBreakdown={analysis.score_breakdown} />

      <div className="grid two-columns">
        <SkillList
          title="Matched Skills"
          skills={analysis.matched_skills}
          emptyMessage="No matched skills found."
        />

        <SkillList
          title="Missing Skills"
          skills={analysis.missing_skills}
          emptyMessage="No missing skills found."
        />
      </div>

      <div className="card">
        <h2>Section Results</h2>

        {analysis.section_results?.present_sections ? (
          <>
            <p>
              <strong>Present:</strong>{" "}
              {analysis.section_results.present_sections.join(", ")}
            </p>

            <p>
              <strong>Missing:</strong>{" "}
              {analysis.section_results.missing_sections.join(", ")}
            </p>

            <p>
              <strong>Completeness:</strong>{" "}
              {analysis.section_results.completeness_percentage}%
            </p>
          </>
        ) : (
          <p className="muted">No section results available.</p>
        )}
      </div>

      <RecommendationList recommendations={analysis.recommendations} />
    </main>
  );
}

export default ResultsPage;