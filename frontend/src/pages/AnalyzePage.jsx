import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ResumeUpload from "../components/ResumeUpload";
import JobDescriptionForm from "../components/JobDescriptionForm";
import { uploadResume } from "../api/resumeApi";
import { createJobDescription } from "../api/jobDescriptionApi";
import { createAnalysis } from "../api/analysisApi";

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
  const [error, setError] = useState("");

  function handleFileChange(file, validationError) {
    setSelectedFile(file);
    setFileError(validationError);
    setUploadedResume(null);
  }

  async function handleAnalyze() {
    setError("");

    if (!selectedFile) {
      setError("Please upload a resume file.");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Please enter a job title.");
      return;
    }

    if (jobDescription.trim().length < 30) {
      setError("Please enter a detailed job description.");
      return;
    }

    try {
      setLoading(true);

      const resumeUploadResponse = await uploadResume(selectedFile);
      const resume = resumeUploadResponse.resume;

      setUploadedResume(resume);

      const job = await createJobDescription({
        jobTitle,
        companyName,
        description: jobDescription,
      });

      setSavedJobDescription(job);

      const analysis = await createAnalysis({
        resumeId: resume.id,
        jobDescriptionId: job.id,
      });

      navigate(`/results/${analysis.id}`);
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData) {
        setError(JSON.stringify(responseData));
      } else {
        setError("Something went wrong. Please check if Django is running.");
      }
    } finally {
      setLoading(false);
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

      {fileError && <div className="error-box">{fileError}</div>}
      {error && <div className="error-box">{error}</div>}

      <button
        className="primary-button"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </main>
  );
}

export default AnalyzePage;