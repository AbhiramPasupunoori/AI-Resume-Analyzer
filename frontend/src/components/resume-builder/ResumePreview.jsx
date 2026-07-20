function getCleanList(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => String(item).trim()).filter(Boolean);
}

function ListSection({ title, items }) {
  const cleanItems = getCleanList(items);

  if (cleanItems.length === 0) {
    return null;
  }

  return (
    <section className="resume-preview-section">
      <h3>{title}</h3>

      <ul>
        {cleanItems.map((item, index) => (
          <li key={`${title}-${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function DictSection({ title, items, titleFields }) {
  const visibleItems = Array.isArray(items)
    ? items.filter((item) => {
        if (!item || typeof item !== "object") {
          return false;
        }

        return (
          titleFields.some((field) => String(item[field] || "").trim()) ||
          String(item.description || "").trim() ||
          getCleanList(item.bullets).length > 0
        );
      })
    : [];

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="resume-preview-section">
      <h3>{title}</h3>

      {visibleItems.map((item, index) => {
        const itemTitle = titleFields
          .map((field) => String(item[field] || "").trim())
          .filter(Boolean)
          .join(" | ");
        const description = String(item.description || "").trim();
        const bullets = getCleanList(item.bullets);

        return (
          <div className="resume-preview-item" key={`${title}-${index}`}>
            {itemTitle && <strong>{itemTitle}</strong>}
            {description && <p>{description}</p>}

            {bullets.length > 0 && (
              <ul>
                {bullets.map((bullet, bulletIndex) => (
                  <li key={`${title}-${index}-${bullet}-${bulletIndex}`}>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}

function ResumePreview({ resume, templateId = "ats-classic" }) {
  const contactDetails = [
    resume.email,
    resume.phone,
    resume.location,
    resume.linkedin,
    resume.github,
    resume.portfolio,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return (
    <article
      className={`resume-preview-page resume-preview-${templateId}`}
      aria-label="Resume live preview"
    >
      <header className="resume-preview-header">
        <h2>{resume.full_name?.trim() || "Your Name"}</h2>

        {contactDetails.length > 0 ? (
          <p>{contactDetails.join(" | ")}</p>
        ) : (
          <p className="resume-preview-placeholder">
            Your contact details will appear here
          </p>
        )}
      </header>

      {resume.summary?.trim() && (
        <section className="resume-preview-section">
          <h3>Professional Summary</h3>
          <p>{resume.summary.trim()}</p>
        </section>
      )}

      <ListSection title="Skills" items={resume.skills} />

      <DictSection
        title="Education"
        items={resume.education}
        titleFields={["degree", "institution", "year"]}
      />

      <DictSection
        title="Experience"
        items={resume.experience}
        titleFields={["role", "company", "duration"]}
      />

      <DictSection
        title="Projects"
        items={resume.projects}
        titleFields={["title", "technologies"]}
      />

      <ListSection title="Certifications" items={resume.certifications} />
      <ListSection title="Achievements" items={resume.achievements} />
    </article>
  );
}

export default ResumePreview;
