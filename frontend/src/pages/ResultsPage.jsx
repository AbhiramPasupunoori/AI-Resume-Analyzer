import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAnalysis } from "../api/analysisApi";
import ScoreBreakdown from "../components/ScoreBreakdown";
import SkillList from "../components/SkillList";
import RecommendationList from "../components/RecommendationList";

function ResultsPage() {
  const { id } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true);
        const data = await getAnalysis(id);
        setAnalysis(data);
      } catch (error) {
        setError("Could not load analysis result.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [id]);

  if (loading) {
    return <main className="page">Loading result...</main>;
  }

  if (error) {
    return <main className="page error-box">{error}</main>;
  }

  if (!analysis) {
    return <main className="page">No analysis found.</main>;
  }

  return (
    <main className="page">
      <div className="result-header">
        <h1>Resume Analysis Result</h1>

        <div className="overall-score">
          <span>Overall Score</span>
          <strong>{analysis.overall_score} / 100</strong>
        </div>
      </div>

      <div className="card">
        <h2>Resume</h2>
        <p>{analysis.resume?.original_filename}</p>

        <h2>Job</h2>
        <p>
          {analysis.job_description?.job_title}
          {analysis.job_description?.company_name
            ? ` at ${analysis.job_description.company_name}`
            : ""}
        </p>
      </div>

      <ScoreBreakdown scoreBreakdown={analysis.score_breakdown} />

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

        {analysis.section_results?.present_sections && (
          <>
            <p>
              Present:{" "}
              {analysis.section_results.present_sections.join(", ")}
            </p>
            <p>
              Missing:{" "}
              {analysis.section_results.missing_sections.join(", ")}
            </p>
            <p>
              Completeness:{" "}
              {analysis.section_results.completeness_percentage}%
            </p>
          </>
        )}
      </div>

      <RecommendationList
        recommendations={analysis.recommendations}
      />
    </main>
  );
}

export default ResultsPage;