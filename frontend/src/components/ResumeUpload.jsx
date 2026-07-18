import { validateResumeFile } from "../utils/fileValidation";

function ResumeUpload({ selectedFile, onFileChange, uploadedResume }) {
  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      onFileChange(null, "Please select a resume file.");
      return;
    }

    const validationError = validateResumeFile(file);

    if (validationError) {
      onFileChange(null, validationError);
      return;
    }

    onFileChange(file, "");
  }

  return (
    <div className="card">
      <h2>Upload Resume</h2>
      <p className="muted">Upload your resume in PDF or DOCX format.</p>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
      />

      {selectedFile && (
        <div className="success-box">
          Selected: {selectedFile.name}
        </div>
      )}

      {uploadedResume && (
        <div className="success-box">
          Resume uploaded successfully. ID: {uploadedResume.id}
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;