import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <span className="hero-badge">AI-Powered Resume Analyzer</span>

        <h1>Improve Your Resume for Any Job</h1>

        <p>
          Upload your resume, paste a job description, and get an ATS-style
          score with matched skills, missing skills, section checks and
          improvement suggestions.
        </p>

        <div className="hero-actions">
          <Link className="primary-button" to="/analyze">
            Start Resume Analysis
          </Link>

          <Link className="secondary-hero-link" to="/history">
            View Previous Results
          </Link>
        </div>
      </section>

      <section className="home-section">
        <h2>How It Works</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <span>1</span>
            <h3>Upload Resume</h3>
            <p>
              Upload your resume in PDF or DOCX format and the system extracts
              readable text automatically.
            </p>
          </div>

          <div className="feature-card">
            <span>2</span>
            <h3>Add Job Description</h3>
            <p>
              Paste the job description so the resume can be compared against
              the actual role requirements.
            </p>
          </div>

          <div className="feature-card">
            <span>3</span>
            <h3>Get AI Score</h3>
            <p>
              View your overall score, matched skills, missing skills and
              personalized improvement suggestions.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>What We Analyze</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Skill Match</h3>
            <p>
              Compares resume skills with job-description skills and identifies
              missing technical skills.
            </p>
          </div>

          <div className="feature-card">
            <h3>Semantic Similarity</h3>
            <p>
              Checks how closely the overall meaning of the resume matches the
              job description.
            </p>
          </div>

          <div className="feature-card">
            <h3>Resume Quality</h3>
            <p>
              Reviews sections, achievements, readability and formatting quality
              to improve your resume.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
