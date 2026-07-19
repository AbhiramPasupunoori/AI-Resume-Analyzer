import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createBuiltResume,
  prepareBuiltResumeAnalysis,
  updateBuiltResume,
} from "../api/builtResumeApi";
import { createAnalysis } from "../api/analysisApi";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import ResumePreview from "../components/resume-builder/ResumePreview";
import { getErrorMessage } from "../utils/errorUtils";
import { downloadBuiltResumePdf } from "../utils/resumePdfGenerator";

const SAMPLE_JOB_DESCRIPTION = `We are looking for a Python Full-Stack Developer with experience in Django, Django REST Framework, React, PostgreSQL, Docker, Git and REST APIs. The candidate should be able to build backend APIs, connect React frontend applications and work with databases.`;

const EMPTY_RESUME = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
};

const PERSONAL_FIELDS = [
  {
    name: "full_name",
    label: "Full name",
    placeholder: "Abhiram Pasupunoori",
    autoComplete: "name",
    required: true,
    maxLength: 150,
  },
  {
    name: "email",
    label: "Email",
    placeholder: "yourname@email.com",
    type: "email",
    autoComplete: "email",
    required: true,
    maxLength: 254,
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "+91 98765 43210",
    type: "tel",
    autoComplete: "tel",
    maxLength: 30,
  },
  {
    name: "location",
    label: "Location",
    placeholder: "Hyderabad, India",
    autoComplete: "address-level2",
    maxLength: 150,
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    type: "url",
    maxLength: 200,
  },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
    type: "url",
    maxLength: 200,
  },
  {
    name: "portfolio",
    label: "Portfolio",
    placeholder: "https://yourportfolio.com",
    type: "url",
    wide: true,
    maxLength: 200,
  },
];

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(values) {
  return Array.isArray(values) ? values.join("\n") : "";
}

function isValidWebUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function cleanCollection(items, fields) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const cleanedItem = Object.fromEntries(
        fields.map((field) => [field, String(item[field] || "").trim()])
      );

      return {
        ...cleanedItem,
        description: String(item.description || "").trim(),
        bullets: Array.isArray(item.bullets)
          ? item.bullets.map((bullet) => String(bullet).trim()).filter(Boolean)
          : splitLines(item.bullets),
      };
    })
    .filter((item) =>
      [...fields, "description"].some((field) => item[field]) ||
      item.bullets.length > 0
    );
}

function ResumeBuilderPage() {
  const navigate = useNavigate();

  const [resume, setResume] = useState(EMPTY_RESUME);
  const [savedResumeId, setSavedResumeId] = useState(null);
  const [skillsText, setSkillsText] = useState("");
  const [certificationsText, setCertificationsText] = useState("");
  const [achievementsText, setAchievementsText] = useState("");

  const [jobTitle, setJobTitle] = useState("Python Full-Stack Developer");
  const [companyName, setCompanyName] = useState("Example Technologies");
  const [jobDescription, setJobDescription] = useState(
    SAMPLE_JOB_DESCRIPTION
  );

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function clearFeedback() {
    setError("");
    setSuccessMessage("");
  }

  function updateField(field, value) {
    setResume((currentResume) => ({
      ...currentResume,
      [field]: value,
    }));
    clearFeedback();
  }

  function updateListText(setter, value) {
    setter(value);
    clearFeedback();
  }

  function addCollectionItem(collection, emptyItem) {
    updateField(collection, [...resume[collection], emptyItem]);
  }

  function updateCollectionItem(collection, index, field, value) {
    const updatedItems = resume[collection].map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    );

    updateField(collection, updatedItems);
  }

  function removeCollectionItem(collection, index) {
    updateField(
      collection,
      resume[collection].filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function buildResumePayload() {
    return {
      full_name: resume.full_name.trim(),
      email: resume.email.trim(),
      phone: resume.phone.trim(),
      location: resume.location.trim(),
      linkedin: resume.linkedin.trim(),
      github: resume.github.trim(),
      portfolio: resume.portfolio.trim(),
      summary: resume.summary.trim(),
      skills: splitLines(skillsText),
      education: cleanCollection(resume.education, [
        "degree",
        "institution",
        "year",
      ]),
      experience: cleanCollection(resume.experience, [
        "role",
        "company",
        "duration",
      ]),
      projects: cleanCollection(resume.projects, ["title", "technologies"]),
      certifications: splitLines(certificationsText),
      achievements: splitLines(achievementsText),
    };
  }

  function validateResume(data) {
    if (!data.full_name) {
      return "Please enter your full name.";
    }

    if (!data.email) {
      return "Please enter your email.";
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      return "Please enter a valid email address.";
    }

    const urlFields = [
      ["LinkedIn", data.linkedin],
      ["GitHub", data.github],
      ["portfolio", data.portfolio],
    ];

    for (const [label, value] of urlFields) {
      if (!isValidWebUrl(value)) {
        return `Please enter a valid ${label} URL beginning with http:// or https://.`;
      }
    }

    if (!data.summary) {
      return "Please enter a professional summary.";
    }

    if (data.skills.length === 0) {
      return "Please add at least one skill.";
    }

    return "";
  }

  function applySavedResume(savedResume) {
    setResume({
      ...EMPTY_RESUME,
      ...savedResume,
      education: Array.isArray(savedResume.education)
        ? savedResume.education
        : [],
      experience: Array.isArray(savedResume.experience)
        ? savedResume.experience
        : [],
      projects: Array.isArray(savedResume.projects) ? savedResume.projects : [],
    });
    setSkillsText(joinLines(savedResume.skills));
    setCertificationsText(joinLines(savedResume.certifications));
    setAchievementsText(joinLines(savedResume.achievements));
  }

  async function saveResume(data) {
    const savedResume = savedResumeId
      ? await updateBuiltResume(savedResumeId, data)
      : await createBuiltResume(data);

    setSavedResumeId(savedResume.id);
    applySavedResume(savedResume);

    return savedResume;
  }

  async function handleSaveResume() {
    const data = buildResumePayload();
    const validationError = validateResume(data);

    if (validationError) {
      setError(validationError);
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Saving resume...");
      clearFeedback();

      await saveResume(data);
      setSuccessMessage("Resume saved successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  function handleDownloadPdf() {
    const data = buildResumePayload();
    const validationError = validateResume(data);

    if (validationError) {
      setError(validationError);
      setSuccessMessage("");
      return;
    }

    try {
      clearFeedback();
      downloadBuiltResumePdf(data);
      setSuccessMessage("Your resume PDF has been downloaded.");
    } catch (pdfError) {
      setError(
        pdfError instanceof Error
          ? pdfError.message
          : "The PDF could not be generated. Please try again."
      );
    }
  }

  async function handleAnalyzeBuiltResume() {
    const data = buildResumePayload();
    const validationError = validateResume(data);

    if (validationError) {
      setError(validationError);
      setSuccessMessage("");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Please enter a job title before analysis.");
      setSuccessMessage("");
      return;
    }

    if (jobDescription.trim().length < 30) {
      setError("Please enter a detailed job description before analysis.");
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Saving resume...");
      clearFeedback();

      const savedResume = await saveResume(data);

      setLoadingMessage("Preparing resume for analysis...");

      const prepared = await prepareBuiltResumeAnalysis(savedResume.id, {
        job_title: jobTitle.trim(),
        company_name: companyName.trim(),
        description: jobDescription.trim(),
      });

      setLoadingMessage("Running analysis...");

      const analysis = await createAnalysis({
        resumeId: prepared.resume_id,
        jobDescriptionId: prepared.job_description_id,
      });

      navigate(`/results/${analysis.id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  const previewResume = buildResumePayload();

  return (
    <main className="page resume-builder-page">
      <div className="page-header resume-builder-header">
        <span className="modern-badge">Resume Builder</span>
        <h1>Build Your Resume</h1>
        <p>
          Create a polished resume, see every update live, download a PDF, and
          measure it against the role you want.
        </p>
      </div>

      {loading && <LoadingSpinner message={loadingMessage} />}
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="success-box" role="status">
          {successMessage}
        </div>
      )}

      <section className="resume-builder-layout">
        <div className="resume-builder-form">
          <section className="builder-form-section" aria-labelledby="personal-heading">
            <div className="builder-section-heading">
              <div>
                <span>01</span>
                <h2 id="personal-heading">Personal details</h2>
              </div>
              <p>Start with the details recruiters use to reach you.</p>
            </div>

            <div className="builder-field-grid">
              {PERSONAL_FIELDS.map((field) => (
                <div
                  className={`builder-field ${field.wide ? "builder-field-wide" : ""}`}
                  key={field.name}
                >
                  <label htmlFor={`resume-${field.name}`}>
                    {field.label}
                    {field.required && <span aria-hidden="true"> *</span>}
                  </label>
                  <input
                    id={`resume-${field.name}`}
                    type={field.type || "text"}
                    value={resume[field.name]}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    maxLength={field.maxLength}
                    required={field.required}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="builder-form-section" aria-labelledby="summary-heading">
            <div className="builder-section-heading">
              <div>
                <span>02</span>
                <h2 id="summary-heading">Professional profile</h2>
              </div>
              <p>Summarize the value you bring in two to four sentences.</p>
            </div>

            <label htmlFor="resume-summary">Professional summary *</label>
            <textarea
              id="resume-summary"
              rows="5"
              value={resume.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              placeholder="Write a concise summary of your experience, strengths, and goals..."
              disabled={loading}
            />

            <label htmlFor="resume-skills">Skills (one per line) *</label>
            <textarea
              id="resume-skills"
              rows="6"
              value={skillsText}
              onChange={(event) =>
                updateListText(setSkillsText, event.target.value)
              }
              placeholder={"Python\nDjango\nReact\nPostgreSQL\nDocker\nGit"}
              disabled={loading}
            />
          </section>

          <section className="builder-form-section" aria-labelledby="education-heading">
            <div className="builder-section-heading builder-section-heading-action">
              <div>
                <span>03</span>
                <h2 id="education-heading">Education</h2>
              </div>
              <button
                className="secondary-action-button compact-action"
                type="button"
                onClick={() =>
                  addCollectionItem("education", {
                    degree: "",
                    institution: "",
                    year: "",
                    description: "",
                    bullets: [],
                  })
                }
                disabled={loading}
              >
                <span aria-hidden="true">+</span> Add education
              </button>
            </div>

            {resume.education.length === 0 && (
              <p className="builder-empty-copy">
                Add a degree, course, or other relevant education.
              </p>
            )}

            {resume.education.map((education, index) => (
              <div className="builder-repeat-card" key={`education-${index}`}>
                <div className="builder-repeat-header">
                  <h3>Education {index + 1}</h3>
                  <button
                    className="builder-remove-button"
                    type="button"
                    onClick={() => removeCollectionItem("education", index)}
                    aria-label={`Remove education ${index + 1}`}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>

                <div className="builder-field-grid">
                  <div className="builder-field">
                    <label htmlFor={`education-degree-${index}`}>Degree</label>
                    <input
                      id={`education-degree-${index}`}
                      value={education.degree || ""}
                      onChange={(event) =>
                        updateCollectionItem(
                          "education",
                          index,
                          "degree",
                          event.target.value
                        )
                      }
                      placeholder="Bachelor of Technology"
                      disabled={loading}
                    />
                  </div>
                  <div className="builder-field">
                    <label htmlFor={`education-institution-${index}`}>
                      Institution
                    </label>
                    <input
                      id={`education-institution-${index}`}
                      value={education.institution || ""}
                      onChange={(event) =>
                        updateCollectionItem(
                          "education",
                          index,
                          "institution",
                          event.target.value
                        )
                      }
                      placeholder="University or college"
                      disabled={loading}
                    />
                  </div>
                  <div className="builder-field builder-field-wide">
                    <label htmlFor={`education-year-${index}`}>Year</label>
                    <input
                      id={`education-year-${index}`}
                      value={education.year || ""}
                      onChange={(event) =>
                        updateCollectionItem(
                          "education",
                          index,
                          "year",
                          event.target.value
                        )
                      }
                      placeholder="2021 – 2025"
                      disabled={loading}
                    />
                  </div>
                </div>

                <label htmlFor={`education-description-${index}`}>Details</label>
                <textarea
                  id={`education-description-${index}`}
                  rows="3"
                  value={education.description || ""}
                  onChange={(event) =>
                    updateCollectionItem(
                      "education",
                      index,
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Relevant coursework, specialization, or grade..."
                  disabled={loading}
                />
                <label htmlFor={`education-bullets-${index}`}>
                  Highlights (one per line)
                </label>
                <textarea
                  id={`education-bullets-${index}`}
                  rows="3"
                  value={
                    Array.isArray(education.bullets)
                      ? joinLines(education.bullets)
                      : education.bullets || ""
                  }
                  onChange={(event) =>
                    updateCollectionItem(
                      "education",
                      index,
                      "bullets",
                      event.target.value
                    )
                  }
                  placeholder="Graduated with distinction"
                  disabled={loading}
                />
              </div>
            ))}
          </section>

          <section className="builder-form-section" aria-labelledby="experience-heading">
            <div className="builder-section-heading builder-section-heading-action">
              <div>
                <span>04</span>
                <h2 id="experience-heading">Experience</h2>
              </div>
              <button
                className="secondary-action-button compact-action"
                type="button"
                onClick={() =>
                  addCollectionItem("experience", {
                    role: "",
                    company: "",
                    duration: "",
                    description: "",
                    bullets: [],
                  })
                }
                disabled={loading}
              >
                <span aria-hidden="true">+</span> Add experience
              </button>
            </div>

            {resume.experience.length === 0 && (
              <p className="builder-empty-copy">
                Add internships, full-time roles, or meaningful freelance work.
              </p>
            )}

            {resume.experience.map((experience, index) => (
              <div className="builder-repeat-card" key={`experience-${index}`}>
                <div className="builder-repeat-header">
                  <h3>Experience {index + 1}</h3>
                  <button
                    className="builder-remove-button"
                    type="button"
                    onClick={() => removeCollectionItem("experience", index)}
                    aria-label={`Remove experience ${index + 1}`}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>

                <div className="builder-field-grid">
                  <div className="builder-field">
                    <label htmlFor={`experience-role-${index}`}>Role</label>
                    <input
                      id={`experience-role-${index}`}
                      value={experience.role || ""}
                      onChange={(event) =>
                        updateCollectionItem(
                          "experience",
                          index,
                          "role",
                          event.target.value
                        )
                      }
                      placeholder="Software Developer"
                      disabled={loading}
                    />
                  </div>
                  <div className="builder-field">
                    <label htmlFor={`experience-company-${index}`}>Company</label>
                    <input
                      id={`experience-company-${index}`}
                      value={experience.company || ""}
                      onChange={(event) =>
                        updateCollectionItem(
                          "experience",
                          index,
                          "company",
                          event.target.value
                        )
                      }
                      placeholder="Company name"
                      disabled={loading}
                    />
                  </div>
                  <div className="builder-field builder-field-wide">
                    <label htmlFor={`experience-duration-${index}`}>
                      Duration
                    </label>
                    <input
                      id={`experience-duration-${index}`}
                      value={experience.duration || ""}
                      onChange={(event) =>
                        updateCollectionItem(
                          "experience",
                          index,
                          "duration",
                          event.target.value
                        )
                      }
                      placeholder="Jan 2024 – Present"
                      disabled={loading}
                    />
                  </div>
                </div>

                <label htmlFor={`experience-description-${index}`}>
                  Role summary
                </label>
                <textarea
                  id={`experience-description-${index}`}
                  rows="3"
                  value={experience.description || ""}
                  onChange={(event) =>
                    updateCollectionItem(
                      "experience",
                      index,
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Briefly describe your scope and responsibilities..."
                  disabled={loading}
                />
                <label htmlFor={`experience-bullets-${index}`}>
                  Achievements (one per line)
                </label>
                <textarea
                  id={`experience-bullets-${index}`}
                  rows="4"
                  value={
                    Array.isArray(experience.bullets)
                      ? joinLines(experience.bullets)
                      : experience.bullets || ""
                  }
                  onChange={(event) =>
                    updateCollectionItem(
                      "experience",
                      index,
                      "bullets",
                      event.target.value
                    )
                  }
                  placeholder={
                    "Built REST APIs used by 5,000+ users\nReduced response times by 30%"
                  }
                  disabled={loading}
                />
              </div>
            ))}
          </section>

          <section className="builder-form-section" aria-labelledby="projects-heading">
            <div className="builder-section-heading builder-section-heading-action">
              <div>
                <span>05</span>
                <h2 id="projects-heading">Projects</h2>
              </div>
              <button
                className="secondary-action-button compact-action"
                type="button"
                onClick={() =>
                  addCollectionItem("projects", {
                    title: "",
                    technologies: "",
                    description: "",
                    bullets: [],
                  })
                }
                disabled={loading}
              >
                <span aria-hidden="true">+</span> Add project
              </button>
            </div>

            {resume.projects.length === 0 && (
              <p className="builder-empty-copy">
                Add projects that demonstrate your strongest, most relevant skills.
              </p>
            )}

            {resume.projects.map((project, index) => (
              <div className="builder-repeat-card" key={`project-${index}`}>
                <div className="builder-repeat-header">
                  <h3>Project {index + 1}</h3>
                  <button
                    className="builder-remove-button"
                    type="button"
                    onClick={() => removeCollectionItem("projects", index)}
                    aria-label={`Remove project ${index + 1}`}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>

                <div className="builder-field-grid">
                  <div className="builder-field">
                    <label htmlFor={`project-title-${index}`}>Project title</label>
                    <input
                      id={`project-title-${index}`}
                      value={project.title || ""}
                      onChange={(event) =>
                        updateCollectionItem(
                          "projects",
                          index,
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="AI Resume Analyzer"
                      disabled={loading}
                    />
                  </div>
                  <div className="builder-field">
                    <label htmlFor={`project-technologies-${index}`}>
                      Technologies
                    </label>
                    <input
                      id={`project-technologies-${index}`}
                      value={project.technologies || ""}
                      onChange={(event) =>
                        updateCollectionItem(
                          "projects",
                          index,
                          "technologies",
                          event.target.value
                        )
                      }
                      placeholder="Django, React, PostgreSQL"
                      disabled={loading}
                    />
                  </div>
                </div>

                <label htmlFor={`project-description-${index}`}>
                  Project summary
                </label>
                <textarea
                  id={`project-description-${index}`}
                  rows="3"
                  value={project.description || ""}
                  onChange={(event) =>
                    updateCollectionItem(
                      "projects",
                      index,
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="What did you build and why does it matter?"
                  disabled={loading}
                />
                <label htmlFor={`project-bullets-${index}`}>
                  Highlights (one per line)
                </label>
                <textarea
                  id={`project-bullets-${index}`}
                  rows="4"
                  value={
                    Array.isArray(project.bullets)
                      ? joinLines(project.bullets)
                      : project.bullets || ""
                  }
                  onChange={(event) =>
                    updateCollectionItem(
                      "projects",
                      index,
                      "bullets",
                      event.target.value
                    )
                  }
                  placeholder="Implemented ATS-style scoring and actionable recommendations"
                  disabled={loading}
                />
              </div>
            ))}
          </section>

          <section className="builder-form-section" aria-labelledby="extras-heading">
            <div className="builder-section-heading">
              <div>
                <span>06</span>
                <h2 id="extras-heading">Credentials & achievements</h2>
              </div>
              <p>Use one line for each certification or achievement.</p>
            </div>

            <label htmlFor="resume-certifications">Certifications</label>
            <textarea
              id="resume-certifications"
              rows="4"
              value={certificationsText}
              onChange={(event) =>
                updateListText(setCertificationsText, event.target.value)
              }
              placeholder={"Python Certification\nReact Certification"}
              disabled={loading}
            />

            <label htmlFor="resume-achievements">Achievements</label>
            <textarea
              id="resume-achievements"
              rows="4"
              value={achievementsText}
              onChange={(event) =>
                updateListText(setAchievementsText, event.target.value)
              }
              placeholder={
                "Built three full-stack projects\nImproved API response time by 30%"
              }
              disabled={loading}
            />
          </section>

          <section className="builder-form-section builder-analysis-section" aria-labelledby="analysis-heading">
            <div className="builder-section-heading">
              <div>
                <span>07</span>
                <h2 id="analysis-heading">Analyze this resume</h2>
              </div>
              <p>Compare your draft with a real job description before applying.</p>
            </div>

            <div className="builder-field-grid">
              <div className="builder-field">
                <label htmlFor="builder-job-title">Target job title</label>
                <input
                  id="builder-job-title"
                  value={jobTitle}
                  onChange={(event) => {
                    setJobTitle(event.target.value);
                    clearFeedback();
                  }}
                  placeholder="Python Full-Stack Developer"
                  maxLength={200}
                  disabled={loading}
                />
              </div>
              <div className="builder-field">
                <label htmlFor="builder-company-name">Company name</label>
                <input
                  id="builder-company-name"
                  value={companyName}
                  onChange={(event) => {
                    setCompanyName(event.target.value);
                    clearFeedback();
                  }}
                  placeholder="Example Technologies"
                  maxLength={200}
                  disabled={loading}
                />
              </div>
            </div>

            <label htmlFor="builder-job-description">Job description</label>
            <textarea
              id="builder-job-description"
              rows="8"
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value);
                clearFeedback();
              }}
              placeholder="Paste the complete job description here..."
              disabled={loading}
            />
            <p className="builder-field-hint">
              {jobDescription.trim().length} characters · at least 30 required
            </p>
          </section>

          <div className="builder-actions">
            <button
              className="secondary-action-button"
              type="button"
              onClick={handleSaveResume}
              disabled={loading}
            >
              {savedResumeId ? "Update resume" : "Save resume"}
            </button>

            <button
              className="outline-dark-button"
              type="button"
              onClick={handleDownloadPdf}
              disabled={loading}
            >
              Download PDF
            </button>

            <button
              className="glow-button"
              type="button"
              onClick={handleAnalyzeBuiltResume}
              disabled={loading}
            >
              Analyze this resume
            </button>
          </div>
        </div>

        <aside className="resume-preview-wrapper" aria-labelledby="preview-heading">
          <div className="preview-sticky">
            <div className="preview-heading-row">
              <h2 id="preview-heading">Live preview</h2>
              <span>Updates as you type</span>
            </div>
            <ResumePreview resume={previewResume} />
          </div>
        </aside>
      </section>
    </main>
  );
}

export default ResumeBuilderPage;
