import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ResumeUpload from "../components/ResumeUpload";
import JobDescriptionForm from "../components/JobDescriptionForm";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";

import { uploadResume } from "../api/resumeApi";
import { createJobDescription } from "../api/jobDescriptionApi";
import { createAnalysis } from "../api/analysisApi";
import { getErrorMessage } from "../utils/errorUtils";

function AnalyzePage() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [uploadedResume, setUploadedResume] = useState(null);
  const [savedJobDescription, setSavedJobDescription] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  function handleFileChange(file, validationError) {
    setSelectedFile(file);
    setFileError(validationError);
    setUploadedResume(null);
    setUploadProgress(0);
    setError("");
  }

  function validateForm() {
    if (!selectedFile) {
      return "Please upload a resume file.";
    }

    if (fileError) {
      return fileError;
    }

    if (!jobTitle.trim()) {
      return "Please enter a job title.";
    }

    if (jobDescription.trim().length < 30) {
      return "Please enter a more detailed job description.";
    }

    return "";
  }

  async function handleAnalyze() {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setUploadProgress(0);

      setLoadingMessage("Uploading resume...");

      const resumeUploadResponse = await uploadResume(
        selectedFile,
        (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          setUploadProgress(percent);
        }
      );

      const resume = resumeUploadResponse.resume;
      setUploadedResume(resume);

      setLoadingMessage("Saving job description...");

      const job = await createJobDescription({
        jobTitle,
        companyName,
        description: jobDescription,
      });

      setSavedJobDescription(job);

      setLoadingMessage("Analyzing resume match...");

      const analysis = await createAnalysis({
        resumeId: resume.id,
        jobDescriptionId: job.id,
      });

      navigate(`/results/${analysis.id}`);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  const hasResume = Boolean(selectedFile && !fileError);
  const hasJobDetails = Boolean(
    jobTitle.trim() && jobDescription.trim().length >= 30
  );

  return (
    <main className="page analyze-page">
      <div className="page-header analyze-header">
        <span className="analyze-eyebrow">Resume Match Analysis</span>
        <h1>Analyze Your Resume</h1>
        <p>
          Complete the steps below to see how well your resume matches the role.
        </p>
      </div>

      <div className="analyze-steps" aria-label="Analysis steps">
        <div className={`analyze-step ${hasResume ? "is-complete" : "is-active"}`}>
          <span>{hasResume ? "✓" : "1"}</span>
          <div>
            <strong>Upload resume</strong>
            <small>PDF or DOCX</small>
          </div>
        </div>
        <div className="step-connector" aria-hidden="true"></div>
        <div
          className={`analyze-step ${
            hasJobDetails ? "is-complete" : hasResume ? "is-active" : ""
          }`}
        >
          <span>{hasJobDetails ? "✓" : "2"}</span>
          <div>
            <strong>Add job details</strong>
            <small>Role requirements</small>
          </div>
        </div>
        <div className="step-connector" aria-hidden="true"></div>
        <div
          className={`analyze-step ${
            hasResume && hasJobDetails ? "is-active" : ""
          }`}
        >
          <span>3</span>
          <div>
            <strong>Get your score</strong>
            <small>AI-powered insights</small>
          </div>
        </div>
      </div>

      <div className="analyze-content">
        <section className="analyze-section">
          <div className="section-step-number">1</div>
          <div className="section-content">
            <div className="section-heading">
              <p>Step 1</p>
              <h2>Upload your resume</h2>
              <span>Choose the resume you want to tailor for this role.</span>
            </div>
            <ResumeUpload
              selectedFile={selectedFile}
              uploadedResume={uploadedResume}
              onFileChange={handleFileChange}
            />
          </div>
        </section>

        <section className="analyze-section">
          <div className="section-step-number">2</div>
          <div className="section-content">
            <div className="section-heading">
              <p>Step 2</p>
              <h2>Add the target job</h2>
              <span>Provide the role details for an accurate comparison.</span>
            </div>
            <JobDescriptionForm
              jobTitle={jobTitle}
              companyName={companyName}
              jobDescription={jobDescription}
              savedJobDescription={savedJobDescription}
              onJobTitleChange={setJobTitle}
              onCompanyNameChange={setCompanyName}
              onJobDescriptionChange={setJobDescription}
            />
          </div>
        </section>

        <section className="analyze-section analyze-submit-section">
          <div className="section-step-number">3</div>
          <div className="section-content">
            <div className="section-heading">
              <p>Step 3</p>
              <h2>Generate your analysis</h2>
              <span>
                We’ll calculate your ATS-style score and highlight skill gaps.
              </span>
            </div>

            {fileError && <ErrorMessage message={fileError} />}
            {error && <ErrorMessage message={error} />}

            {loading && (
              <>
                <LoadingSpinner message={loadingMessage} />

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="progress-wrapper">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p>{uploadProgress}% uploaded</p>
                  </div>
                )}
              </>
            )}

            <div className="form-actions analyze-actions">
              <button
                className="primary-button"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? "Processing..." : "Analyze Resume"}
              </button>
              <p>Your resume is processed securely and used only for analysis.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AnalyzePage;
