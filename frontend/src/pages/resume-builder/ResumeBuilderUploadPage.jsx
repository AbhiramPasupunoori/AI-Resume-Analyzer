import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { uploadResume } from "../../api/resumeApi";
import ResumeUpload from "../../components/ResumeUpload";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getErrorMessage } from "../../utils/errorUtils";
import { clearResumeDraft, saveResumeDraft } from "../../utils/resumeBuilderStorage";
import { parseImportedResume } from "../../utils/importedResumeParser";

function ResumeBuilderUploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploadedResume, setUploadedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(file, validationError) {
    setSelectedFile(file);
    setFileError(validationError);
    setUploadedResume(null);
    setError("");
    if (file && !validationError) {
      void handleUpload(file);
    }
  }

  async function handleUpload(file) {
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      const response = await uploadResume(file);
      setUploadedResume(response.resume);
      clearResumeDraft();
      saveResumeDraft(parseImportedResume(
        response.resume.extracted_text,
        response.resume.detected_skills
      ));
      navigate("/resume-builder/templates");
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="builder-upload-page">
      <div className="builder-back-row">
        <Link className="builder-back-link" to="/resume-builder">
          ← Go Back
        </Link>
      </div>

      <section className="builder-upload-card">
        <h1>Upload your resume in seconds</h1>
        <p>We’ll help you upgrade every section and make your resume stand out.</p>

        {loading && <LoadingSpinner message="Uploading your resume..." />}
        {fileError && <ErrorMessage message={fileError} />}
        {error && <ErrorMessage message={error} />}

        {!uploadedResume && (
          <ResumeUpload
            selectedFile={selectedFile}
            uploadedResume={uploadedResume}
            onFileChange={handleFileChange}
          />
        )}

        {uploadedResume && (
          <section className="resume-import-result" aria-live="polite">
            <div className="import-success-heading">
              <span aria-hidden="true">✓</span>
              <div>
                <p>Import complete</p>
                <h2>Your resume is ready to improve</h2>
              </div>
            </div>

            <div className="import-file-summary">
              <div className="import-file-icon">📄</div>
              <div>
                <strong>{uploadedResume.original_filename}</strong>
                <p>{uploadedResume.file_type?.toUpperCase()} · {(uploadedResume.file_size / 1024).toFixed(1)} KB</p>
              </div>
              <button type="button" onClick={() => handleFileChange(null, "")}>Replace</button>
            </div>

            <div className="import-stat-grid">
              <div><strong>{uploadedResume.word_count}</strong><span>Words extracted</span></div>
              <div><strong>{uploadedResume.detected_skills?.length || 0}</strong><span>Skills detected</span></div>
              <div><strong>{uploadedResume.text_extracted ? "Ready" : "Review"}</strong><span>Import status</span></div>
            </div>

            <div className="import-review-grid">
              <div className="import-detected-skills">
                <h3>Skills we found</h3>
                <div>
                  {(uploadedResume.detected_skills || []).length ? (
                    uploadedResume.detected_skills.map((skill) => <span key={skill}>{skill}</span>)
                  ) : (
                    <p>No skills were confidently detected. You can add them in the editor.</p>
                  )}
                </div>
              </div>

              <div className="import-next-checklist">
                <h3>What happens next</h3>
                <p>✓ Add and review your contact details</p>
                <p>✓ Improve experience and bullet points</p>
                <p>✓ Add missing skills and sections</p>
                <p>✓ Choose a template and download</p>
              </div>
            </div>

            <div className="import-actions">
              <button className="glow-button" type="button" onClick={() => navigate("/resume-builder/templates")}>
                Review &amp; Edit Resume
              </button>
              <button className="outline-dark-button" type="button" onClick={() => navigate("/resume-builder/templates")}>
                Choose Template
              </button>
            </div>
          </section>
        )}

        {!uploadedResume && <p className="builder-small-text">
          No resume yet? <Link to="/resume-builder/templates" onClick={clearResumeDraft}>Build new resume</Link>
        </p>}
      </section>
    </main>
  );
}

export default ResumeBuilderUploadPage;
