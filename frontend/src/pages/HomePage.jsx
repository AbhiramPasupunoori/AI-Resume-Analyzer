import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <h1>AI Resume Analyzer</h1>
        <p>
          Upload your resume, compare it with a job description,
          and get an ATS-style score with improvement suggestions.
        </p>

        <Link className="primary-button" to="/analyze">
          Start Analysis
        </Link>
      </section>
    </main>
  );
}

export default HomePage;