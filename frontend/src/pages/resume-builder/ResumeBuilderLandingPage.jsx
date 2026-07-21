import { Link } from "react-router-dom";

import { clearResumeDraft } from "../../utils/resumeBuilderStorage";

function ResumeBuilderLandingPage() {
  return (
    <main className="builder-landing-page">
      <section className="builder-landing-hero">
        <div className="builder-landing-left">
          <span className="modern-badge">AI-powered resume builder</span>

          <h1>
            Build a <span>free resume</span> in a few clicks
          </h1>

          <p>
            Create a professional resume from scratch or improve your existing
            resume using your AI Resume Analyzer.
          </p>

          <div className="builder-landing-buttons">
            <Link
              className="glow-button builder-landing-action"
              to="/resume-builder/templates"
              onClick={clearResumeDraft}
            >
              Create a New Resume
            </Link>

            <Link className="outline-dark-button builder-landing-action" to="/resume-builder/upload">
              Improve My Resume
            </Link>
          </div>

          <div className="builder-stats-row">
            <div>
              <strong>48%</strong>
              <p>more likely to get hired</p>
            </div>

            <div>
              <strong>ATS</strong>
              <p>friendly resume format</p>
            </div>
          </div>
        </div>

        <div className="builder-landing-right">
          <div className="resume-mockup-card">
            <div className="resume-mock-header">
              <div></div>
              <section>
                <strong>Your Name</strong>
                <span>Software Developer</span>
              </section>
            </div>

            <div className="resume-mock-section"></div>
            <div className="resume-mock-line long"></div>
            <div className="resume-mock-line"></div>
            <div className="resume-mock-line short"></div>

            <div className="resume-mock-section"></div>
            <div className="resume-mock-line long"></div>
            <div className="resume-mock-line"></div>
            <div className="resume-mock-line short"></div>
          </div>

          <div className="builder-ats-badge">ATS Perfect</div>
          <div className="builder-ai-card">
            <strong>AI-powered ideas</strong>
            <p>Get better resume suggestions instantly.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ResumeBuilderLandingPage;
