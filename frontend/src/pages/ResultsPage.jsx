import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { deleteAnalysis, getAnalysis } from "../api/analysisApi";

import OverallScoreCircle from "../components/OverallScoreCircle";
import ScoreBreakdown from "../components/ScoreBreakdown";
import ScoreChart from "../components/ScoreChart";
import SkillList from "../components/SkillList";
import RecommendationList from "../components/RecommendationList";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ResumeSectionChecklist from "../components/ResumeSectionChecklist";
import ScoreInsightCard from "../components/ScoreInsightCard";

import { getErrorMessage } from "../utils/errorUtils";
import { generateAnalysisReport } from "../utils/reportGenerator";

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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

  async function handleDeleteAnalysis() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteAnalysis(id);

      navigate("/history");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <LoadingSpinner message="Loading analysis result..." />
      </main>
    );
  }

  if (error && !analysis) {
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

  const scoreBreakdown = analysis.score_breakdown || {};

  const skillScore = toNumber(scoreBreakdown.skill?.score);
  const skillMaximum = toNumber(scoreBreakdown.skill?.maximum || 45);

  const semanticScore = toNumber(scoreBreakdown.semantic?.score);
  const semanticMaximum = toNumber(scoreBreakdown.semantic?.maximum || 25);

  const sectionScore = toNumber(scoreBreakdown.sections?.score);
  const sectionMaximum = toNumber(scoreBreakdown.sections?.maximum || 15);

  const achievementScore = toNumber(scoreBreakdown.achievements?.score);
  const achievementMaximum = toNumber(
    scoreBreakdown.achievements?.maximum || 10
  );

  const readabilityScore = toNumber(scoreBreakdown.readability?.score);
  const readabilityMaximum = toNumber(scoreBreakdown.readability?.maximum || 5);

  const matchedSkills = analysis.matched_skills || [];
  const missingSkills = analysis.missing_skills || [];

  return (
    <main className="page results-page">
      <span className="modern-badge page-badge">Analysis Result</span>

      <div className="result-hero">
        <div className="result-hero-content">
          <h1>Resume Analysis Report</h1>

          <p>
            Review your resume match score, missing skills, section quality and
            improvement recommendations.
          </p>

          <div className="result-actions">
            <Link className="outline-dark-button" to="/history">
              Back to History
            </Link>

            <button
              className="secondary-action-button"
              onClick={() => generateAnalysisReport(analysis)}
            >
              Download PDF Report
            </button>

            <button
              className="danger-button"
              onClick={handleDeleteAnalysis}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Analysis"}
            </button>
          </div>
        </div>

        <OverallScoreCircle score={analysis.overall_score} />
      </div>

      {error && <ErrorMessage message={error} />}

      <section className="result-info-grid">
        <div className="result-info-card">
          <span>Resume</span>
          <strong>{analysis.resume?.original_filename || "Not available"}</strong>
        </div>

        <div className="result-info-card">
          <span>Job Title</span>
          <strong>{analysis.job_description?.job_title || "Not available"}</strong>
        </div>

        <div className="result-info-card">
          <span>Company</span>
          <strong>
            {analysis.job_description?.company_name || "Not provided"}
          </strong>
        </div>

        <div className="result-info-card">
          <span>Status</span>
          <strong>{analysis.status}</strong>
        </div>
      </section>

      <section className="result-section">
        <div className="section-title-row">
          <div>
            <h2>Score Breakdown</h2>
            <p>
              Your overall score is calculated from skill matching, semantic
              similarity, resume sections, achievements and readability.
            </p>
          </div>
        </div>

        <ScoreBreakdown scoreBreakdown={scoreBreakdown} />

        <ScoreChart scoreBreakdown={scoreBreakdown} />
      </section>

      <section className="result-section">
        <div className="section-title-row">
          <div>
            <h2>Detailed Score Insights</h2>
            <p>
              These cards explain what each score means and what to improve.
            </p>
          </div>
        </div>

        <div className="insight-grid">
          <ScoreInsightCard
            title="Skill Match"
            score={skillScore}
            maximum={skillMaximum}
            description="Measures how many required job skills are present in your resume."
            suggestions={[
              missingSkills.length > 0
                ? `Add important missing skills: ${missingSkills
                    .slice(0, 4)
                    .join(", ")}.`
                : "Your resume covers the detected job skills well.",
            ]}
          />

          <ScoreInsightCard
            title="Semantic Similarity"
            score={semanticScore}
            maximum={semanticMaximum}
            description="Checks whether the overall meaning of your resume matches the job description."
            suggestions={[
              "Customize your summary and project descriptions for the target role.",
              "Use keywords from the job description naturally.",
            ]}
          />

          <ScoreInsightCard
            title="Section Completeness"
            score={sectionScore}
            maximum={sectionMaximum}
            description="Checks if your resume has important sections like Summary, Skills, Education and Projects."
            suggestions={[
              analysis.section_results?.missing_sections?.length > 0
                ? `Add missing sections: ${analysis.section_results.missing_sections.join(
                    ", "
                  )}.`
                : "Your resume has the main expected sections.",
            ]}
          />

          <ScoreInsightCard
            title="Achievements"
            score={achievementScore}
            maximum={achievementMaximum}
            description="Checks for action verbs, numbers, percentages and measurable results."
            suggestions={[
              "Use lines like: Improved performance by 35% or Built 3 REST APIs.",
              "Start bullet points with strong action verbs.",
            ]}
          />

          <ScoreInsightCard
            title="Readability"
            score={readabilityScore}
            maximum={readabilityMaximum}
            description="Checks basic clarity, resume length and formatting quality."
            suggestions={[
              "Keep bullet points short and clear.",
              "Avoid very long sentences and repeated blank lines.",
            ]}
          />
        </div>
      </section>

      <section className="result-section">
        <div className="section-title-row">
          <div>
            <h2>Skills Comparison</h2>
            <p>
              Matched skills are already present in your resume. Missing skills
              are found in the job description but not in your resume.
            </p>
          </div>
        </div>

        <div className="grid two-columns">
          <SkillList
            title={`Matched Skills (${matchedSkills.length})`}
            skills={matchedSkills}
            emptyMessage="No matched skills found."
          />

          <SkillList
            title={`Missing Skills (${missingSkills.length})`}
            skills={missingSkills}
            emptyMessage="No missing skills found."
          />
        </div>
      </section>

      <section className="result-section">
        <ResumeSectionChecklist sectionResults={analysis.section_results} />
      </section>

      <section className="result-section">
        <RecommendationList recommendations={analysis.recommendations} />
      </section>
    </main>
  );
}

export default ResultsPage;
