import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createAnalysis } from "../../api/analysisApi";
import {
  createBuiltResume,
  prepareBuiltResumeAnalysis,
} from "../../api/builtResumeApi";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import ResumePreview from "../../components/resume-builder/ResumePreview";
import { RESUME_TEMPLATES } from "../../data/resumeTemplates";
import {
  loadResumeDraft,
  loadSelectedTemplate,
  loadSelectedTemplateColor,
  saveBuilderStep,
  saveEditedResumeSnapshot,
  saveSelectedTemplate,
} from "../../utils/resumeBuilderStorage";
import {
  downloadBuiltResumePdf,
  downloadBuiltResumeTxt,
  createBuiltResumePdfFile,
} from "../../utils/resumePdfGenerator";
import { getErrorMessage } from "../../utils/errorUtils";

const SAMPLE_JOB_DESCRIPTION = `We are looking for a Python Full-Stack Developer with experience in Django, React, REST APIs, PostgreSQL, Git and Docker.`;

function EditIcon() {
  return (
    <svg
      className="resume-file-edit-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
      <path d="m16.5 4.5 3 3" />
    </svg>
  );
}

function ResumeReviewPage() {
  const navigate = useNavigate();

  const [resume] = useState(() => loadResumeDraft());
  const [template, setTemplate] = useState(() => loadSelectedTemplate());
  const [templateColor] = useState(() => loadSelectedTemplateColor());
  const [menuOpen, setMenuOpen] = useState(false);
  const [resumeFileName, setResumeFileName] = useState(
    () => `${(resume.full_name || "My Resume").replace(/\s+/g, "_")}_Resume`
  );

  const [jobTitle, setJobTitle] = useState("Python Full-Stack Developer");
  const [companyName, setCompanyName] = useState("Example Technologies");
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTION);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    saveEditedResumeSnapshot({
      resume,
      template,
      templateColor,
      fileName: resumeFileName,
    });
  }, [resume, template, templateColor, resumeFileName]);

  function changeTemplate(value) {
    setTemplate(value);
    saveSelectedTemplate(value);
  }

  function openAnalyzerWithResume() {
    const resumeFile = createBuiltResumePdfFile(resume, resumeFileName);
    navigate("/analyze", { state: { resumeFile, source: "resume-builder" } });
  }

  function editResumeSection(step) {
    saveBuilderStep(step);
    navigate("/resume-builder/edit");
  }

  async function analyzeResume() {
    try {
      setLoading(true);
      setError("");
      setLoadingMessage("Saving resume...");

      const savedResume = await createBuiltResume(resume);

      setLoadingMessage("Preparing analysis...");

      const prepared = await prepareBuiltResumeAnalysis(savedResume.id, {
        job_title: jobTitle,
        company_name: companyName,
        description: jobDescription,
      });

      setLoadingMessage("Running analysis...");

      const analysis = await createAnalysis({
        resumeId: prepared.resume_id,
        jobDescriptionId: prepared.job_description_id,
      });

      navigate(`/results/${analysis.id}`);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  return (
    <main className="resume-review-page">
      <header className="resume-review-header">
        <button
          className="review-home-link"
          type="button"
          onClick={() => navigate("/resume-builder")}
        >
          <span aria-hidden="true">←</span> Resume Builder Home
        </button>

        <span>Saved</span>

        <div className="review-download-area">
          <button className="glow-button" onClick={() => downloadBuiltResumePdf(resume, resumeFileName)}>
            Download PDF
          </button>

          <button className="outline-dark-button" onClick={openAnalyzerWithResume}>
            Analyze Your Resume
          </button>

          <button className="ghost-button" onClick={() => setMenuOpen(!menuOpen)}>
            ...
          </button>

          {menuOpen && (
            <div className="download-menu">
              <button onClick={() => downloadBuiltResumeTxt(resume)}>
                Download TXT
              </button>

              <button onClick={() => downloadBuiltResumeTxt(resume)}>
                Download DOC
              </button>
            </div>
          )}
        </div>
      </header>

      {loading && <LoadingSpinner message={loadingMessage} />}
      {error && <ErrorMessage message={error} />}

      <section className="review-layout">
        <aside className="review-sidebar">
          <h2>Templates</h2>

          {RESUME_TEMPLATES.map((item) => (
            <button
              key={item.id}
              className={template === item.id ? "review-template active" : "review-template"}
              onClick={() => changeTemplate(item.id)}
            >
              {item.name}
            </button>
          ))}

          <h2>Analyze Resume</h2>

          <input
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="Job title"
          />

          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Company"
          />

          <textarea
            rows="7"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />

          <button className="glow-button" onClick={analyzeResume}>
            Analyze Resume
          </button>
        </aside>

        <section className="review-preview-area">
          <label className="resume-file-name-editor">
            <span>PDF name</span>
            <input
              value={resumeFileName}
              onChange={(event) => setResumeFileName(event.target.value)}
              aria-label="Resume PDF filename"
              style={{ width: `${Math.max(resumeFileName.length + 1, 10)}ch` }}
            />
            <EditIcon />
          </label>
          <p className="review-edit-hint">Select any resume section to edit it again.</p>
          <ResumePreview resume={resume} template={template} accentColor={templateColor} onEditSection={editResumeSection} />
        </section>
      </section>
    </main>
  );
}

export default ResumeReviewPage;
