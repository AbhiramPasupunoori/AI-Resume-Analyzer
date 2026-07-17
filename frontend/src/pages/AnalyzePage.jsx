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

  return (
    <main className="page">
      <div className="page-header">
        <h1>Analyze Your Resume</h1>
        <p>
          Upload your resume and compare it with a job description.
        </p>
      </div>

      <div className="grid two-columns">
        <ResumeUpload
          selectedFile={selectedFile}
          uploadedResume={uploadedResume}
          onFileChange={handleFileChange}
        />

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

      <button
        className="primary-button"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Processing..." : "Analyze Resume"}
      </button>
    </main>
  );
}

export default AnalyzePage;