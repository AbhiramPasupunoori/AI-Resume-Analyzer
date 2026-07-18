import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <span className="hero-badge">AI-Powered Resume Screening</span>

        <h1>Analyze Your Resume for Any Job</h1>

        <p>
          Upload your resume, paste a job description and get an ATS-style
          score with matched skills, missing skills and improvement areas.
        </p>

        <div className="hero-actions">
          <Link className="primary-button" to="/analyze">
            Start Analysis
          </Link>

          <Link className="secondary-hero-link" to="/history">
            View History
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;