function JobDescriptionForm({
  jobTitle,
  companyName,
  jobDescription,
  onJobTitleChange,
  onCompanyNameChange,
  onJobDescriptionChange,
  savedJobDescription,
}) {
  return (
    <div className="card">
      <h2>Job Description</h2>
      <p className="muted">
        Paste the target job description so the system can compare your resume.
      </p>

      <label>Job Title</label>
      <input
        type="text"
        value={jobTitle}
        onChange={(event) => onJobTitleChange(event.target.value)}
        placeholder="Python Full-Stack Developer"
      />

      <label>Company Name</label>
      <input
        type="text"
        value={companyName}
        onChange={(event) => onCompanyNameChange(event.target.value)}
        placeholder="Example Technologies"
      />

      <label>Job Description</label>
      <textarea
        value={jobDescription}
        onChange={(event) =>
          onJobDescriptionChange(event.target.value)
        }
        placeholder="Paste the full job description here..."
        rows="10"
      />

      {savedJobDescription && (
        <div className="success-box">
          Job description saved. ID: {savedJobDescription.id}
        </div>
      )}
    </div>
  );
}

export default JobDescriptionForm;