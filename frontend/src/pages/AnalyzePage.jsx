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

const SAMPLE_JOB_DESCRIPTION = `We are looking for a Python Full-Stack Developer with experience in Django, Django REST Framework, React, PostgreSQL, Docker, Git, REST APIs and cloud deployment. The candidate should be able to build scalable backend APIs, integrate frontend applications and work with databases. Experience with testing, debugging and clean code practices is preferred.`;

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

  const hasResume = Boolean(selectedFile);

  const hasJobDescription =
    jobTitle.trim().length > 0 && jobDescription.trim().length >= 30;

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

  function fillExampleJobDescription() {
    setJobTitle("Python Full-Stack Developer");
    setCompanyName("Example Technologies");
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setError("");
  }

  function clearForm() {
    setSelectedFile(null);
    setFileError("");
    setJobTitle("");
    setCompanyName("");
    setJobDescription("");
    setUploadedResume(null);
    setSavedJobDescription(null);
    setUploadProgress(0);
    setError("");
  }

  function goToStep(stepId) {
    document.getElementById(stepId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  return (
    <main className="page analyze-page">
      <div className="page-header analyze-header">
        <span className="modern-badge">Resume Analysis</span>
        <h1>Analyze Your Resume</h1>
        <p>
          Follow the steps below to compare your resume with a job description
          and generate an ATS-style score.
        </p>
      </div>

      <div className="stepper">
        <button
          type="button"
          className={`step-item ${hasResume ? "completed" : "active"}`}
          onClick={() => goToStep("upload-resume-step")}
          aria-controls="upload-resume-step"
        >
          <span>1</span>
          <div>
            <strong>Upload Resume</strong>
            <p>PDF or DOCX format</p>
          </div>
        </button>

        <button
          type="button"
          className={`step-item ${
            hasJobDescription ? "completed" : hasResume ? "active" : ""
          }`}
          onClick={() => goToStep("job-description-step")}
          aria-controls="job-description-step"
        >
          <span>2</span>
          <div>
            <strong>Add Job Description</strong>
            <p>Paste target role details</p>
          </div>
        </button>

        <button
          type="button"
          className={`step-item ${
            hasResume && hasJobDescription ? "active" : ""
          }`}
          onClick={() => goToStep("run-analysis-step")}
          aria-controls="run-analysis-step"
        >
          <span>3</span>
          <div>
            <strong>Run Analysis</strong>
            <p>Generate score and suggestions</p>
          </div>
        </button>
      </div>

      <section className="analysis-steps">
        <div className="analysis-step-card" id="upload-resume-step">
          <div className="step-card-header">
            <span className="step-number">Step 1</span>
            <div>
              <h2>Upload Resume</h2>
              <p>
                Upload your latest resume so the backend can extract and analyze
                the text.
              </p>
            </div>
          </div>

          <ResumeUpload
            selectedFile={selectedFile}
            uploadedResume={uploadedResume}
            onFileChange={handleFileChange}
          />
        </div>

        <div className="analysis-step-card" id="job-description-step">
          <div className="step-card-header">
            <span className="step-number">Step 2</span>
            <div>
              <h2>Add Job Description</h2>
              <p>
                Paste the job description to compare your resume with the role
                requirements.
              </p>
            </div>
          </div>

          <div className="job-helper-actions">
            <button
              type="button"
              className="secondary-action-button"
              onClick={fillExampleJobDescription}
            >
              Use Example Job Description
            </button>

            <button type="button" className="ghost-button" onClick={clearForm}>
              Clear Form
            </button>
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

        <div
          className="analysis-step-card analyze-submit-card"
          id="run-analysis-step"
        >
          <div className="step-card-header">
            <span className="step-number">Step 3</span>
            <div>
              <h2>Run Resume Analysis</h2>
              <p>
                Once both steps are complete, generate the resume analysis
                result.
              </p>
            </div>
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

          <div className="analyze-summary">
            <div>
              <strong>Resume</strong>
              <p>{selectedFile ? selectedFile.name : "Not selected yet"}</p>
            </div>

            <div>
              <strong>Job Title</strong>
              <p>{jobTitle.trim() || "Not added yet"}</p>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="glow-button"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? "Processing..." : "Analyze Resume"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AnalyzePage;
