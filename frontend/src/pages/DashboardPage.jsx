import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAnalyses } from "../api/analysisApi";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

import { getErrorMessage } from "../utils/errorUtils";

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function DashboardPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
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
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const total = analyses.length;

    const scores = analyses.map((analysis) => toNumber(analysis.overall_score));

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    const missingSkillCounts = {};

    analyses.forEach((analysis) => {
      const missingSkills = analysis.missing_skills || [];

      missingSkills.forEach((skill) => {
        missingSkillCounts[skill] = (missingSkillCounts[skill] || 0) + 1;
      });
    });

    const commonMissingSkills = Object.entries(missingSkillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      total,
      averageScore: averageScore.toFixed(1),
      bestScore: bestScore.toFixed(1),
      commonMissingSkills,
    };
  }, [analyses]);

  if (loading) {
    return (
      <main className="page">
        <LoadingSpinner message="Loading dashboard..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <ErrorMessage message={error} onRetry={loadDashboard} />
      </main>
    );
  }

  return (
    <main className="page dashboard-page">
      <span className="modern-badge page-badge">Dashboard</span>

      <div className="dashboard-hero">
        <div>
          <h1>Resume Analysis Dashboard</h1>
          <p>
            Track your previous resume analyses, average score and improvement
            areas.
          </p>
        </div>

        <Link className="glow-button" to="/analyze">
          New Analysis
        </Link>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          title="No data yet"
          message="Create your first resume analysis to view dashboard insights."
          action={
            <Link className="glow-button" to="/analyze">
              Start Analysis
            </Link>
          }
        />
      ) : (
        <>
          <section className="dashboard-stat-grid">
            <div className="dashboard-stat-card">
              <span>Total Analyses</span>
              <strong>{stats.total}</strong>
            </div>

            <div className="dashboard-stat-card">
              <span>Average Score</span>
              <strong>{stats.averageScore}</strong>
            </div>

            <div className="dashboard-stat-card">
              <span>Best Score</span>
              <strong>{stats.bestScore}</strong>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="card">
              <h2>Common Missing Skills</h2>

              {stats.commonMissingSkills.length > 0 ? (
                <div className="skill-list">
                  {stats.commonMissingSkills.map(([skill, count]) => (
                    <span className="skill-badge" key={skill}>
                      {skill} ({count})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted">No missing skills found.</p>
              )}
            </div>

            <div className="card">
              <h2>Recent Analyses</h2>

              <div className="recent-list">
                {analyses.slice(0, 5).map((analysis) => (
                  <Link
                    className="recent-item"
                    to={`/results/${analysis.id}`}
                    key={analysis.id}
                  >
                    <div>
                      <strong>
                        {analysis.job_description?.job_title || "Untitled Job"}
                      </strong>
                      <span>
                        {analysis.resume?.original_filename || "No resume name"}
                      </span>
                    </div>

                    <b>{analysis.overall_score}</b>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default DashboardPage;
