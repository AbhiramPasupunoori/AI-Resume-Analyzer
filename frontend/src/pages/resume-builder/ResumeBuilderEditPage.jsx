import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import BuilderStepper from "../../components/resume-builder/BuilderStepper";
import ResumePreview from "../../components/resume-builder/ResumePreview";
import ResumeScoreBadge from "../../components/resume-builder/ResumeScoreBadge";
import {
  EMPTY_RESUME,
  loadResumeDraft,
  loadSelectedTemplate,
  loadSelectedTemplateColor,
  loadBuilderStep,
  saveResumeDraft,
  saveBuilderStep,
} from "../../utils/resumeBuilderStorage";

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(values) {
  return Array.isArray(values) ? values.join("\n") : "";
}

function ResumeBuilderEditPage() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(() => loadBuilderStep());
  const [resume, setResume] = useState(() => loadResumeDraft() || EMPTY_RESUME);
  const [template] = useState(() => loadSelectedTemplate());
  const [templateColor] = useState(() => loadSelectedTemplateColor());
  const initialName = resume.full_name.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(initialName[0] || "");
  const [lastName, setLastName] = useState(initialName.slice(1).join(" "));
  const [showContactExtras, setShowContactExtras] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [openExtras, setOpenExtras] = useState(() => new Set());

  const [skillsText, setSkillsText] = useState(joinLines(resume.skills));
  const [certificationsText, setCertificationsText] = useState(
    joinLines(resume.certifications)
  );
  const [achievementsText, setAchievementsText] = useState(
    joinLines(resume.achievements)
  );
  const [languagesText, setLanguagesText] = useState(joinLines(resume.languages));
  const [awardsText, setAwardsText] = useState(joinLines(resume.awards));
  const [hobbiesText, setHobbiesText] = useState(joinLines(resume.hobbies));

  const previewResume = useMemo(
    () => ({
      ...resume,
      skills: splitLines(skillsText),
      certifications: splitLines(certificationsText),
      achievements: splitLines(achievementsText),
      languages: splitLines(languagesText),
      awards: splitLines(awardsText),
      hobbies: splitLines(hobbiesText),
    }),
    [
      resume,
      skillsText,
      certificationsText,
      achievementsText,
      languagesText,
      awardsText,
      hobbiesText,
    ]
  );

  useEffect(() => {
    saveResumeDraft(previewResume);
  }, [previewResume]);

  useEffect(() => {
    saveBuilderStep(activeStep);
  }, [activeStep]);

  function updateField(field, value) {
    setResume((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateName(first, last) {
    setFirstName(first);
    setLastName(last);
    updateField("full_name", `${first} ${last}`.trim());
  }

  function updateSkill(index, value) {
    const skills = splitLines(skillsText);
    skills[index] = value;
    setSkillsText(skills.join("\n"));
  }

  function removeSkill(index) {
    setSkillsText(splitLines(skillsText).filter((_, itemIndex) => itemIndex !== index).join("\n"));
  }

  function toggleExtra(section) {
    setOpenExtras((current) => {
      const next = new Set(current);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  function addExperience() {
    updateField("experience", [
      ...resume.experience,
      {
        role: "",
        company: "",
        duration: "",
        description: "",
      },
    ]);
  }

  function updateExperience(index, field, value) {
    const updated = [...resume.experience];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    updateField("experience", updated);
  }

  function removeExperience(index) {
    updateField(
      "experience",
      resume.experience.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addEducation() {
    updateField("education", [
      ...resume.education,
      {
        degree: "",
        institution: "",
        year: "",
        description: "",
      },
    ]);
  }

  function updateEducation(index, field, value) {
    const updated = [...resume.education];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    updateField("education", updated);
  }

  function removeEducation(index) {
    updateField(
      "education",
      resume.education.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addProject() {
    updateField("projects", [
      ...resume.projects,
      {
        title: "",
        technologies: "",
        description: "",
      },
    ]);
  }

  function updateProject(index, field, value) {
    const updated = [...resume.projects];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    updateField("projects", updated);
  }

  function removeProject(index) {
    updateField(
      "projects",
      resume.projects.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function goNext() {
    saveResumeDraft(previewResume);

    if (activeStep === 4) {
      navigate("/resume-builder/review");
      return;
    }

    setActiveStep((step) => step + 1);
  }

  function goBack() {
    if (activeStep === 0) {
      setShowLeaveConfirm(true);
      return;
    }
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  return (
    <main className="builder-editor-page">
      <section className="builder-editor-left">
        <BuilderStepper activeStep={activeStep} onStepChange={setActiveStep} />

        <div className="builder-editor-panel">
          {activeStep === 0 && (
            <section className="builder-step-content">
              <h1>Contacts</h1>
              <p>Add your up-to-date contact information so employers and recruiters can easily reach you.</p>

              <div className="builder-two-inputs">
                <label>First name<input value={firstName} onChange={(event) => updateName(event.target.value, lastName)} /></label>
                <label>Last name<input value={lastName} onChange={(event) => updateName(firstName, event.target.value)} /></label>
              </div>
              <label>Desired job title<input value={resume.desired_job_title} onChange={(event) => updateField("desired_job_title", event.target.value)} /></label>
              <div className="builder-two-inputs">
                <label>Phone<input value={resume.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
                <label>Email<input value={resume.email} onChange={(event) => updateField("email", event.target.value)} /></label>
              </div>
              <button className="builder-expand-button" type="button" onClick={() => setShowContactExtras(!showContactExtras)}>Additional information <span>{showContactExtras ? "⌃" : "⌄"}</span></button>
              {showContactExtras && <div className="builder-extra-fields">
                <label>Location<input value={resume.location} onChange={(event) => updateField("location", event.target.value)} /></label>
                <label>LinkedIn<input value={resume.linkedin} onChange={(event) => updateField("linkedin", event.target.value)} /></label>
                <label>GitHub<input value={resume.github} onChange={(event) => updateField("github", event.target.value)} /></label>
                <label>Portfolio<input value={resume.portfolio} onChange={(event) => updateField("portfolio", event.target.value)} /></label>
              </div>}
            </section>
          )}

          {activeStep === 1 && (
            <section className="builder-step-content">
              <div className="builder-section-heading"><div><h1>Experience</h1><p>List your work experience starting with the most recent position first.</p></div><button type="button" className="builder-tips-button">💡 Experience tips⌄</button></div>

              {resume.experience.map((item, index) => (
                <details className="builder-repeat-card builder-collapsible" key={`exp-${index}`}>
                  <summary><span>⋮⋮</span><strong>{[item.role, item.company].filter(Boolean).join(", ") || "New work experience"}<small>{item.duration}</small></strong><span>⌄</span></summary>
                  <div className="builder-collapsible-body">
                  <input
                    placeholder="Job title"
                    value={item.role}
                    onChange={(event) =>
                      updateExperience(index, "role", event.target.value)
                    }
                  />

                  <input
                    placeholder="Company"
                    value={item.company}
                    onChange={(event) =>
                      updateExperience(index, "company", event.target.value)
                    }
                  />

                  <input
                    placeholder="Duration"
                    value={item.duration}
                    onChange={(event) =>
                      updateExperience(index, "duration", event.target.value)
                    }
                  />

                  <textarea
                    placeholder="Description"
                    rows="4"
                    value={item.description}
                    onChange={(event) =>
                      updateExperience(index, "description", event.target.value)
                    }
                  />

                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => removeExperience(index)}
                  >
                    Delete
                  </button>
                  </div>
                </details>
              ))}

              <button className="builder-add-button" onClick={addExperience}>
                + Add work experience
              </button>
            </section>
          )}

          {activeStep === 2 && (
            <section className="builder-step-content">
              <div className="builder-section-heading"><div><h1>Education</h1><p>Add your education details - even if you haven’t graduated yet.</p></div><button type="button" className="builder-tips-button">💡 Education tips⌄</button></div>

              {resume.education.map((item, index) => (
                <details className="builder-repeat-card builder-collapsible" key={`edu-${index}`}>
                  <summary><span>⋮⋮</span><strong>{[item.institution, item.degree].filter(Boolean).join(", ") || "New education"}<small>{item.year}</small></strong><span>⌄</span></summary>
                  <div className="builder-collapsible-body">
                  <input
                    placeholder="Degree"
                    value={item.degree}
                    onChange={(event) =>
                      updateEducation(index, "degree", event.target.value)
                    }
                  />

                  <input
                    placeholder="Institution"
                    value={item.institution}
                    onChange={(event) =>
                      updateEducation(index, "institution", event.target.value)
                    }
                  />

                  <input
                    placeholder="Year"
                    value={item.year}
                    onChange={(event) =>
                      updateEducation(index, "year", event.target.value)
                    }
                  />

                  <textarea
                    placeholder="Description"
                    rows="3"
                    value={item.description}
                    onChange={(event) =>
                      updateEducation(index, "description", event.target.value)
                    }
                  />

                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => removeEducation(index)}
                  >
                    Delete
                  </button>
                  </div>
                </details>
              ))}

              <button className="builder-add-button" onClick={addEducation}>
                + Add education
              </button>
            </section>
          )}

          {activeStep === 3 && (
            <section className="builder-step-content">
              <div className="builder-section-heading"><div><h1>Skills</h1><p>Add your most relevant professional skills.</p></div><button type="button" className="builder-tips-button">💡 Skills tips⌄</button></div>

              <div className="suggested-skills-box">
                <strong>✦ Suggested skills for <span>{resume.desired_job_title || "your target role"}</span></strong>

                <div className="suggested-skills">
                  {[
                    "Python",
                    "Django",
                    "React",
                    "REST APIs",
                    "PostgreSQL",
                    "Docker",
                    "Git",
                    "Machine Learning",
                  ].map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() =>
                        setSkillsText((current) =>
                          current.includes(skill)
                            ? current
                            : `${current}\n${skill}`.trim()
                        )
                      }
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div className="builder-skill-list">
                {splitLines(skillsText).map((skill, index) => (
                  <div className="builder-skill-row" key={`${skill}-${index}`}>
                    <span className="drag-handle">⋮⋮</span>
                    <label>Skill<input value={skill} onChange={(event) => updateSkill(index, event.target.value)} /></label>
                    <button type="button" onClick={() => removeSkill(index)} aria-label={`Delete ${skill}`}>⌫</button>
                  </div>
                ))}
              </div>
              <button className="builder-add-button" type="button" onClick={() => setSkillsText(`${skillsText}\nNew skill`.trim())}>+ Add skill</button>
            </section>
          )}

          {activeStep === 4 && (
            <section className="builder-step-content">
              <h1>Additional Sections</h1>
              <p>Add certifications, languages, awards, or any extra details you want recruiters to see.</p>

              <label>Projects</label>

              {resume.projects.map((project, index) => (
                <div className="builder-repeat-card" key={`project-${index}`}>
                  <input
                    placeholder="Project title"
                    value={project.title}
                    onChange={(event) =>
                      updateProject(index, "title", event.target.value)
                    }
                  />

                  <input
                    placeholder="Technologies"
                    value={project.technologies}
                    onChange={(event) =>
                      updateProject(index, "technologies", event.target.value)
                    }
                  />

                  <textarea
                    rows="3"
                    placeholder="Project description"
                    value={project.description}
                    onChange={(event) =>
                      updateProject(index, "description", event.target.value)
                    }
                  />

                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => removeProject(index)}
                  >
                    Delete
                  </button>
                </div>
              ))}

              <button className="builder-add-button" onClick={addProject}>
                + Add project
              </button>

              <div className="additional-section-grid">
                {[{id:"certifications", icon:"♙", title:"Certifications and licenses", detail:"Add credentials that back up your expertise."},{id:"awards",icon:"🏆",title:"Awards and honors",detail:"Share achievements and milestones you’re proud of."},{id:"languages",icon:"◉",title:"Languages"},{id:"links",icon:"🔗",title:"Websites and social media"},{id:"hobbies",icon:"⌘",title:"Hobbies and interests"},{id:"custom",icon:"▦",title:"Custom section"}].map((section) => <button type="button" key={section.id} className={openExtras.has(section.id) ? "active" : ""} onClick={() => toggleExtra(section.id)}><span>{section.icon}</span><strong>{section.title}<small>{section.detail}</small></strong><i>{openExtras.has(section.id) ? "−" : "+"}</i></button>)}
              </div>
              {openExtras.has("certifications") && <><label>Certifications</label><textarea
                rows="4"
                value={certificationsText}
                onChange={(event) => setCertificationsText(event.target.value)}
              /></>}

              <label>Achievements</label>
              <textarea
                rows="4"
                value={achievementsText}
                onChange={(event) => setAchievementsText(event.target.value)}
              />

              {openExtras.has("languages") && <><label>Languages</label><textarea
                rows="3"
                value={languagesText}
                onChange={(event) => setLanguagesText(event.target.value)}
              /></>}

              {openExtras.has("awards") && <><label>Awards</label><textarea
                rows="3"
                value={awardsText}
                onChange={(event) => setAwardsText(event.target.value)}
              /></>}

              {openExtras.has("hobbies") && <><label>Hobbies</label><textarea
                rows="3"
                value={hobbiesText}
                onChange={(event) => setHobbiesText(event.target.value)}
              /></>}
              {openExtras.has("links") && <div className="builder-extra-fields additional-editor-panel">
                <label>LinkedIn<input value={resume.linkedin} onChange={(event) => updateField("linkedin", event.target.value)} placeholder="https://linkedin.com/in/your-name" /></label>
                <label>GitHub<input value={resume.github} onChange={(event) => updateField("github", event.target.value)} placeholder="https://github.com/your-name" /></label>
                <label>Portfolio or personal website<input value={resume.portfolio} onChange={(event) => updateField("portfolio", event.target.value)} placeholder="https://yourwebsite.com" /></label>
              </div>}
              {openExtras.has("custom") && <div className="additional-editor-panel">
                <label>Section title<input value={resume.custom_section?.title || ""} onChange={(event) => updateField("custom_section", { ...resume.custom_section, title: event.target.value })} placeholder="Community involvement" /></label>
                <label>Section content<textarea rows="5" value={resume.custom_section?.content || ""} onChange={(event) => updateField("custom_section", { ...resume.custom_section, content: event.target.value })} placeholder="Add the details you want recruiters to see..." /></label>
              </div>}
            </section>
          )}
        </div>

        <div className="builder-bottom-actions">
          <button className="outline-dark-button" onClick={goBack}>
            Back
          </button>

          <button className="glow-button" onClick={goNext}>
            {activeStep === 4 ? "Next: Download" : `Next: ${["Experience", "Education", "Skills", "Finalize"][activeStep]}`}
          </button>
        </div>
      </section>

      <aside className="builder-editor-right">
        <div className="builder-preview-top">
          <ResumeScoreBadge resume={previewResume} />
          <button className="outline-dark-button" onClick={() => navigate("/resume-builder/templates")}>
            Change Template
          </button>
        </div>

        <ResumePreview resume={previewResume} template={template} accentColor={templateColor} />
      </aside>

      {showLeaveConfirm && (
        <div className="builder-confirm-backdrop" role="presentation" onMouseDown={() => setShowLeaveConfirm(false)}>
          <section className="builder-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="leave-builder-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="builder-confirm-icon" aria-hidden="true">?</span>
            <h2 id="leave-builder-title">Leave the resume editor?</h2>
            <p>Your changes are saved. Are you sure you want to return to the template page?</p>
            <div>
              <button className="outline-dark-button" type="button" onClick={() => setShowLeaveConfirm(false)}>Keep editing</button>
              <button className="glow-button" type="button" onClick={() => navigate("/resume-builder/templates")}>Yes, go back</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default ResumeBuilderEditPage;
