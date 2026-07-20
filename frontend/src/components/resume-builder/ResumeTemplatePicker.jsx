import { useId, useState } from "react";

function MiniResumePreview({ templateId }) {
  return (
    <div
      className={`template-mini-page template-mini-${templateId}`}
      aria-hidden="true"
    >
      <div className="template-mini-header">
        <span className="template-mini-avatar" />
        <div className="template-mini-identity">
          <span className="template-mini-name" />
          <span className="template-mini-contact" />
        </div>
      </div>

      <div className="template-mini-content">
        <aside className="template-mini-sidebar">
          <span className="template-mini-section-title" />
          <span className="template-mini-line template-mini-line-long" />
          <span className="template-mini-line template-mini-line-medium" />
          <span className="template-mini-line template-mini-line-short" />
          <span className="template-mini-section-title" />
          <span className="template-mini-line template-mini-line-medium" />
          <span className="template-mini-line template-mini-line-long" />
        </aside>

        <div className="template-mini-main">
          <span className="template-mini-section-title" />
          <span className="template-mini-line template-mini-line-long" />
          <span className="template-mini-line template-mini-line-long" />
          <span className="template-mini-line template-mini-line-medium" />
          <span className="template-mini-section-title" />
          <span className="template-mini-line template-mini-line-long" />
          <span className="template-mini-line template-mini-line-medium" />
          <span className="template-mini-line template-mini-line-short" />
        </div>
      </div>
    </div>
  );
}

function ResumeTemplatePicker({
  templates = [],
  selectedTemplate,
  onSelect,
  disabled = false,
}) {
  const headingId = useId();
  const [activeCategory, setActiveCategory] = useState("all");
  const availableTemplates = Array.isArray(templates) ? templates : [];
  const categories = [
    ...new Set(
      availableTemplates
        .map((template) => template.category)
        .filter(Boolean)
    ),
  ];
  const selectedCategory = categories.includes(activeCategory)
    ? activeCategory
    : "all";
  const visibleTemplates =
    selectedCategory === "all"
      ? availableTemplates
      : availableTemplates.filter(
          (template) => template.category === selectedCategory
        );

  return (
    <section className="resume-template-picker" aria-labelledby={headingId}>
      <div className="template-picker-header">
        <div>
          <span className="modern-badge">Resume templates</span>
          <h2 id={headingId}>Choose a style that fits your story</h2>
        </div>
        <p>
          Start with a recruiter-friendly design. You can switch templates
          without losing your resume details.
        </p>
      </div>

      <div className="template-filter-list" aria-label="Filter resume templates">
        <button
          className={`template-filter-button ${
            selectedCategory === "all" ? "active-template-filter" : ""
          }`}
          type="button"
          onClick={() => setActiveCategory("all")}
          aria-pressed={selectedCategory === "all"}
          disabled={disabled}
        >
          All templates
        </button>

        {categories.map((category) => (
          <button
            className={`template-filter-button ${
              selectedCategory === category ? "active-template-filter" : ""
            }`}
            type="button"
            key={category}
            onClick={() => setActiveCategory(category)}
            aria-pressed={selectedCategory === category}
            disabled={disabled}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="template-card-grid">
        {visibleTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              className={`template-card ${
                isSelected ? "selected-template-card" : ""
              }`}
              type="button"
              key={template.id}
              onClick={() => onSelect?.(template.id)}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Selected" : "Choose"} ${
                template.name
              } resume template`}
              disabled={disabled}
            >
              <div className="template-card-preview">
                <MiniResumePreview templateId={template.id} />
              </div>

              <div className="template-card-body">
                <div className="template-card-badges">
                  <span className="template-category-badge">
                    {template.category}
                  </span>
                  {template.recommended && (
                    <span className="template-recommended-badge recommended-badge">
                      Recommended
                    </span>
                  )}
                </div>

                <h3>{template.name}</h3>
                <p>{template.description}</p>

                <span className="template-card-action">
                  {isSelected ? "Selected" : "Use this template"}
                  <span aria-hidden="true">{isSelected ? " ✓" : " →"}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ResumeTemplatePicker;
