import { getResumeTemplate } from "../../data/resumeTemplates";

function ListSection({ title, items, className = "", onEdit }) {
  const visibleItems = (items || []).filter(Boolean);
  if (!visibleItems.length) return null;

  return (
    <section className={`builder-preview-section ${className} ${onEdit ? "preview-editable" : ""}`} onClick={onEdit} role={onEdit ? "button" : undefined} tabIndex={onEdit ? 0 : undefined} onKeyDown={onEdit ? (event) => { if (event.key === "Enter" || event.key === " ") onEdit(); } : undefined}>
      <h3>{title}</h3>
      <ul>{visibleItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
    </section>
  );
}

function ItemSection({ title, items, fields, onEdit }) {
  const visibleItems = (items || []).filter((item) =>
    fields.some((field) => item[field]) || item.description
  );
  if (!visibleItems.length) return null;

  return (
    <section className={`builder-preview-section ${onEdit ? "preview-editable" : ""}`} onClick={onEdit} role={onEdit ? "button" : undefined} tabIndex={onEdit ? 0 : undefined} onKeyDown={onEdit ? (event) => { if (event.key === "Enter" || event.key === " ") onEdit(); } : undefined}>
      <h3>{title}</h3>
      {visibleItems.map((item, index) => (
        <article className="builder-preview-item" key={`${title}-${index}`}>
          <div className="preview-item-heading">
            <strong>{fields.slice(0, 2).map((field) => item[field]).filter(Boolean).join(" · ")}</strong>
            {fields[2] && item[fields[2]] && <span>{item[fields[2]]}</span>}
          </div>
          {item.description && <p>{item.description}</p>}
        </article>
      ))}
    </section>
  );
}

function Identity({ resume, showPhoto, onEdit }) {
  return (
    <header className={`preview-identity ${onEdit ? "preview-editable" : ""}`} onClick={onEdit} role={onEdit ? "button" : undefined} tabIndex={onEdit ? 0 : undefined}>
      {showPhoto && <div className="preview-photo" aria-hidden="true">{(resume.full_name || "Y").charAt(0)}</div>}
      <div>
        <h2>{resume.full_name || "YOUR NAME"}</h2>
        <p>{resume.desired_job_title || "Desired Job Title"}</p>
      </div>
    </header>
  );
}

function ContactDetails({ resume, onEdit }) {
  const details = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github, resume.portfolio].filter(Boolean);
  return (
    <section className={`builder-preview-section preview-contact ${onEdit ? "preview-editable" : ""}`} onClick={onEdit} role={onEdit ? "button" : undefined} tabIndex={onEdit ? 0 : undefined}>
      <h3>Contact</h3>
      {details.length ? details.map((detail) => <p key={detail}>{detail}</p>) : <p>Add your contact details</p>}
    </section>
  );
}

function ResumePreview({ resume, template: templateId = "ats-classic", accentColor, onEditSection }) {
  const template = getResumeTemplate(templateId);
  const showPhoto = ["photo", "altacv", "hipster", "maltacv", "sixty-seconds", "designer", "navbar-cv"].includes(template.layout);

  return (
    <article
      className={`builder-preview-page layout-${template.layout} accent-${template.accent}`}
      style={accentColor ? { "--resume-accent": accentColor } : undefined}
    >
      <Identity resume={resume} showPhoto={showPhoto} onEdit={onEditSection ? () => onEditSection(0) : undefined} />

      <aside className="builder-preview-side">
        <ContactDetails resume={resume} onEdit={onEditSection ? () => onEditSection(0) : undefined} />
        <ListSection title="Skills" items={resume.skills} onEdit={onEditSection ? () => onEditSection(3) : undefined} />
        <ListSection title="Languages" items={resume.languages} onEdit={onEditSection ? () => onEditSection(4) : undefined} />
        <ListSection title="Certifications" items={resume.certifications} onEdit={onEditSection ? () => onEditSection(4) : undefined} />
      </aside>

      <main className="builder-preview-main">
        <ItemSection title="Experience" items={resume.experience} fields={["role", "company", "duration"]} onEdit={onEditSection ? () => onEditSection(1) : undefined} />
        <ItemSection title="Education" items={resume.education} fields={["degree", "institution", "year"]} onEdit={onEditSection ? () => onEditSection(2) : undefined} />
        <ItemSection title="Projects" items={resume.projects} fields={["title", "technologies"]} onEdit={onEditSection ? () => onEditSection(4) : undefined} />
        <ListSection title={template.layout === "research-publications" ? "Selected Publications" : "Achievements"} items={resume.achievements} onEdit={onEditSection ? () => onEditSection(4) : undefined} />
        <ListSection title="Awards" items={resume.awards} onEdit={onEditSection ? () => onEditSection(4) : undefined} />
        <ListSection title="Interests" items={resume.hobbies} onEdit={onEditSection ? () => onEditSection(4) : undefined} />
        {resume.custom_section?.title && resume.custom_section?.content && (
          <section className={`builder-preview-section ${onEditSection ? "preview-editable" : ""}`} onClick={onEditSection ? () => onEditSection(4) : undefined} role={onEditSection ? "button" : undefined} tabIndex={onEditSection ? 0 : undefined}>
            <h3>{resume.custom_section.title}</h3>
            <p>{resume.custom_section.content}</p>
          </section>
        )}
      </main>
    </article>
  );
}

export default ResumePreview;
