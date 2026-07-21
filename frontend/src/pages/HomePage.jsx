import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="modern-home">
      <section className="modern-hero">
        <div className="hero-left">
          <span className="modern-badge">AI Resume Analyzer</span>

          <h1>
            Optimize Your Resume for Your{" "}
            <span className="gradient-text">Dream Job</span>
          </h1>

          <p>
            Upload your resume, paste a job description, and get an ATS-style
            score with matched skills, missing skills, resume section checks,
            achievement analysis and improvement suggestions.
          </p>

          <div className="modern-hero-actions">
            <Link className="glow-button" to="/analyze">
              Analyze Your Resume
            </Link>

            <Link className="glow-button" to="/resume-builder">
              Build Your Resume
            </Link>

            <Link className="outline-dark-button" to="/history">
              View History
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>100</strong>
              <span>Point score</span>
            </div>

            <div>
              <strong>5+</strong>
              <span>Score categories</span>
            </div>

            <div>
              <strong>PDF</strong>
              <span>DOCX supported</span>
            </div>
          </div>
        </div>

        <div className="hero-preview dark-card">
          <div className="preview-header">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <Link
            className="upload-preview-box"
            to="/analyze"
            aria-label="Upload your resume for analysis"
          >
            <div className="upload-preview-icon">📄</div>
            <h3>Upload Resume</h3>
            <p>PDF or DOCX · Click to get started</p>
          </Link>

          <div className="preview-score-row">
            <div>
              <span>Overall Score</span>
              <strong>82 / 100</strong>
            </div>

            <div className="mini-score-circle">82%</div>
          </div>

          <div className="preview-bars">
            <div>
              <span>Skills</span>
              <div className="bar">
                <i style={{ width: "86%" }}></i>
              </div>
            </div>

            <div>
              <span>Semantic Match</span>
              <div className="bar">
                <i style={{ width: "74%" }}></i>
              </div>
            </div>

            <div>
              <span>Achievements</span>
              <div className="bar">
                <i style={{ width: "68%" }}></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="modern-section">
        <h2>How It Works</h2>

        <div className="modern-feature-grid">
          <div className="modern-feature-card dark-card">
            <span>01</span>
            <h3>Upload Resume</h3>
            <p>
              Upload your resume in PDF or DOCX format. The backend extracts
              readable text automatically.
            </p>
          </div>

          <div className="modern-feature-card dark-card">
            <span>02</span>
            <h3>Paste Job Description</h3>
            <p>
              Add the job description so your resume can be compared with the
              actual role requirements.
            </p>
          </div>

          <div className="modern-feature-card dark-card">
            <span>03</span>
            <h3>Get AI Score</h3>
            <p>
              View your score, matched skills, missing skills, charts and
              improvement suggestions.
            </p>
          </div>
        </div>
      </section>

      <section className="modern-section">
        <h2>What Your Resume Gets Checked For</h2>

        <div className="modern-feature-grid">
          <div className="modern-feature-card dark-card">
            <h3>Skill Match</h3>
            <p>
              Detects technical skills from your resume and compares them with
              the job description.
            </p>
          </div>

          <div className="modern-feature-card dark-card">
            <h3>Semantic Similarity</h3>
            <p>
              Checks how closely your resume content matches the meaning of the
              target job role.
            </p>
          </div>

          <div className="modern-feature-card dark-card">
            <h3>Resume Quality</h3>
            <p>
              Reviews sections, achievements, readability and recommendations
              for improvement.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
