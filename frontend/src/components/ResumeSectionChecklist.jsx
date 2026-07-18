function ResumeSectionChecklist({ sectionResults }) {
  const sections = sectionResults?.sections
    ? Object.values(sectionResults.sections)
    : [];

  if (sections.length === 0) {
    return (
      <div className="card">
        <h2>Resume Sections</h2>
        <p className="muted">No section results available.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-card-header">
        <div>
          <h2>Resume Section Checklist</h2>
          <p className="muted">
            Checks whether your resume has the important sections expected in a
            professional resume.
          </p>
        </div>

        <div className="section-percentage">
          {sectionResults?.completeness_percentage ?? 0}%
        </div>
      </div>

      <div className="section-checklist">
        {sections.map((section) => (
          <div
            className={`section-check-item ${
              section.present ? "section-present" : "section-missing"
            }`}
            key={section.label}
          >
            <span>{section.present ? "✓" : "!"}</span>

            <div>
              <strong>{section.label}</strong>

              <p>
                {section.present
                  ? `Detected as "${section.matched_heading || section.label}"`
                  : "Missing from resume"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {sectionResults?.missing_sections?.length > 0 && (
        <div className="warning-box">
          Missing sections: {sectionResults.missing_sections.join(", ")}
        </div>
      )}
    </div>
  );
}

export default ResumeSectionChecklist;
