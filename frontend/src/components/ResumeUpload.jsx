import { validateResumeFile } from "../utils/fileValidation";

function ResumeUpload({ selectedFile, onFileChange, uploadedResume }) {
  function handleSelectedFile(file) {
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

  function handleFileChange(event) {
    const file = event.target.files[0];
    handleSelectedFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    handleSelectedFile(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  return (
    <div className="upload-section">
      <div
        className="upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-icon">📄</div>

        <h3>Upload Your Resume</h3>

        <p>
          Drag and drop your resume here, or choose a file from your device.
        </p>

        <label className="file-upload-button">
          Choose Resume
          <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
        </label>

        <small>Supported formats: PDF, DOCX. Maximum size: 4 MB.</small>
      </div>

      {selectedFile && (
        <div className="selected-file-box">
          <strong>Selected file:</strong>
          <span>{selectedFile.name}</span>
        </div>
      )}

      {uploadedResume && (
        <div className="success-box">
          Resume uploaded successfully. Resume ID: {uploadedResume.id}
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
