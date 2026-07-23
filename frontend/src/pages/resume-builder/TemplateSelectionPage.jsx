import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ResumeTemplatePicker from "../../components/resume-builder/ResumeTemplatePicker";
import {
  RESUME_TEMPLATES,
  TEMPLATE_CATEGORIES,
} from "../../data/resumeTemplates";
import { saveSelectedTemplate, saveSelectedTemplateColor } from "../../utils/resumeBuilderStorage";

const PATTERN_ORDER = [
  "ATS",
  "Simple",
  "Modern",
  "One column",
  "Two column",
  "With photo",
  "Professional",
  "Academic",
  "Student",
  "International",
  "Fresher",
];

const MOBILE_TEMPLATES_PER_PAGE = 6;

function TemplateSelectionPage() {
  const navigate = useNavigate();
  const categoryTabsRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("All templates");
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 700px)").matches
  );
  const [mobilePage, setMobilePage] = useState(0);

  const visibleTemplates = useMemo(() => {
    if (activeCategory === "Recommended") {
      return RESUME_TEMPLATES.filter((template) => template.recommended);
    }

    const templates = activeCategory === "All templates"
      ? [...RESUME_TEMPLATES]
      : RESUME_TEMPLATES.filter(
      (template) =>
        template.category === activeCategory || template.tags.includes(activeCategory)
      );

    return templates.sort((first, second) => {
      const recommendedDifference = Number(Boolean(second.recommended)) - Number(Boolean(first.recommended));
      if (recommendedDifference) return recommendedDifference;

      const firstPattern = PATTERN_ORDER.indexOf(first.category);
      const secondPattern = PATTERN_ORDER.indexOf(second.category);
      if (firstPattern !== secondPattern) return firstPattern - secondPattern;
      return first.name.localeCompare(second.name);
    });
  }, [activeCategory]);

  const mobilePageCount = Math.max(
    1,
    Math.ceil(visibleTemplates.length / MOBILE_TEMPLATES_PER_PAGE)
  );

  const mobileTemplates = useMemo(() => {
    const start = mobilePage * MOBILE_TEMPLATES_PER_PAGE;
    return visibleTemplates.slice(start, start + MOBILE_TEMPLATES_PER_PAGE);
  }, [mobilePage, visibleTemplates]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 700px)");
    const handleChange = (event) => setIsMobile(event.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    setMobilePage(0);
  }, [activeCategory]);

  useEffect(() => {
    if (mobilePage >= mobilePageCount) {
      setMobilePage(mobilePageCount - 1);
    }
  }, [mobilePage, mobilePageCount]);

  function chooseTemplate(templateId, color) {
    saveSelectedTemplate(templateId);
    if (color) saveSelectedTemplateColor(color);
    navigate("/resume-builder/edit");
  }

  function scrollCategories(direction) {
    categoryTabsRef.current?.scrollBy({
      left: direction * Math.min(categoryTabsRef.current.clientWidth * 0.75, 520),
      behavior: "smooth",
    });
  }

  return (
    <main className="template-page">
      <div className="builder-back-row">
        <Link className="builder-back-link template-back-link" to="/resume-builder">
          ← Go Back
        </Link>
      </div>

      <header className="template-header">
        <h1>Resume templates</h1>
        <p>
          Pick a recruiter-ready layout. Your content stays safe when you switch
          styles later.
        </p>
        <button
          className="template-later-button"
          type="button"
          onClick={() => chooseTemplate("ats-classic")}
        >
          Skip for now
        </button>
      </header>

      <div className="template-tabs-shell">
        <button
          className="template-tabs-arrow template-tabs-arrow-left"
          type="button"
          onClick={() => scrollCategories(-1)}
          aria-label="Show previous template categories"
        >
          ‹
        </button>
        <nav className="template-tabs" aria-label="Template categories" ref={categoryTabsRef}>
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              type="button"
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={(event) => {
                setActiveCategory(category);
                event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </nav>
        <button
          className="template-tabs-arrow template-tabs-arrow-right"
          type="button"
          onClick={() => scrollCategories(1)}
          aria-label="Show next template categories"
        >
          ›
        </button>
      </div>

      <div className="template-count-row" aria-live="polite">
        <strong>{visibleTemplates.length}</strong>
        <span>{activeCategory === "All templates" ? "templates available" : `${activeCategory} templates`}</span>
      </div>

      {isMobile ? (
        <>
          <section className="template-grid template-mobile-grid" aria-live="polite">
            {mobileTemplates.map((template) => (
              <ResumeTemplatePicker
                key={template.id}
                template={template}
                onSelect={chooseTemplate}
              />
            ))}
            {visibleTemplates.length === 0 && (
              <p className="template-no-results">No templates match your search.</p>
            )}
          </section>

          {visibleTemplates.length > MOBILE_TEMPLATES_PER_PAGE && (
            <nav className="template-mobile-pagination" aria-label="Template pages">
              <button
                type="button"
                onClick={() => setMobilePage((page) => Math.max(0, page - 1))}
                disabled={mobilePage === 0}
              >
                ← Previous
              </button>
              <span>
                Page {mobilePage + 1} of {mobilePageCount}
              </span>
              <button
                type="button"
                onClick={() => setMobilePage((page) => Math.min(mobilePageCount - 1, page + 1))}
                disabled={mobilePage === mobilePageCount - 1}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      ) : activeCategory === "All templates" ? (
        <div className="template-pattern-groups" aria-live="polite">
          {PATTERN_ORDER.map((pattern) => {
            const patternTemplates = visibleTemplates.filter((template) => template.category === pattern);
            if (!patternTemplates.length) return null;

            return (
              <section className="template-pattern-group" key={pattern}>
                <header>
                  <h2>{pattern}</h2>
                  <span>{patternTemplates.length} templates</span>
                </header>
                <div className="template-grid">
                  {patternTemplates.map((template) => (
                    <ResumeTemplatePicker key={template.id} template={template} onSelect={chooseTemplate} />
                  ))}
                </div>
              </section>
            );
          })}
          {visibleTemplates.length === 0 && <p className="template-no-results">No templates match your search.</p>}
        </div>
      ) : (
        <section className="template-grid" aria-live="polite">
          {visibleTemplates.map((template) => (
            <ResumeTemplatePicker key={template.id} template={template} onSelect={chooseTemplate} />
          ))}
          {visibleTemplates.length === 0 && <p className="template-no-results">No templates match your search.</p>}
        </section>
      )}
    </main>
  );
}

export default TemplateSelectionPage;
