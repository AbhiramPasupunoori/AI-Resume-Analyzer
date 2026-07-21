import { useState } from "react";

import ResumePreview from "./ResumePreview";

const SAMPLE_RESUME = {
  full_name: "Alex Morgan",
  desired_job_title: "Product Designer",
  email: "alex.morgan@email.com",
  phone: "+1 555 014 208",
  location: "New York, NY",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  portfolio: "alexmorgan.design",
  summary: "Creative product designer with 6+ years of experience building simple, accessible digital products.",
  skills: ["Product strategy", "UX research", "Figma", "Design systems", "Prototyping", "Accessibility"],
  languages: ["English", "Spanish"],
  certifications: ["Google UX Design", "Accessibility Professional"],
  experience: [
    { role: "Senior Product Designer", company: "Northstar Labs", duration: "2022 — Present", description: "Led end-to-end design for customer-facing products and improved activation by 28%." },
    { role: "UX Designer", company: "Studio One", duration: "2019 — 2022", description: "Built research-backed experiences with product and engineering teams." },
    { role: "Product Design Intern", company: "Canvas Creative", duration: "2018 — 2019", description: "Created prototypes, usability studies and interaction specifications for mobile products." },
  ],
  education: [
    { degree: "BFA, Interaction Design", institution: "Parsons School of Design", year: "2019", description: "Graduated with honors." },
    { degree: "Human-Centered Design", institution: "IDEO U", year: "2021", description: "Advanced professional certificate." },
  ],
  projects: [
    { title: "Design System", technologies: "Figma · React", description: "Created reusable components used across four product teams." },
    { title: "Inclusive Checkout", technologies: "Research · Prototyping", description: "Redesigned checkout accessibility and reduced abandonment." },
  ],
  achievements: ["Improved product activation by 28%", "Mentored six junior designers"],
  awards: ["AIGA Emerging Designer Award"],
  hobbies: ["Urban sketching", "Community mentoring"],
};

const ACADEMIC_SAMPLE = {
  ...SAMPLE_RESUME,
  full_name: "Dr. Maya Chen",
  desired_job_title: "Research Scientist",
  email: "maya.chen@university.edu",
  phone: "+1 617 555 0184",
  location: "Cambridge, MA",
  linkedin: "linkedin.com/in/mayachen",
  portfolio: "mayachen.ai",
  skills: ["Machine Learning", "Data Analysis", "Python", "Research Methods", "PyTorch", "Scientific Writing"],
  certifications: ["Published researcher", "Graduate teaching fellow", "Responsible AI reviewer"],
  experience: [
    { role: "Research Fellow", company: "Institute for Intelligent Systems", duration: "2022 — Present", description: "Led interdisciplinary research in trustworthy machine learning and published peer-reviewed findings." },
    { role: "Teaching Assistant", company: "Northbridge University", duration: "2020 — 2022", description: "Taught data structures and supervised undergraduate research projects." },
    { role: "Research Intern", company: "AI Research Lab", duration: "2019 — 2020", description: "Developed reproducible experiments for natural-language understanding systems." },
  ],
  education: [
    { degree: "PhD, Computer Science", institution: "Northbridge University", year: "2022", description: "Research focus: interpretable artificial intelligence." },
    { degree: "MS, Data Science", institution: "Lakeside University", year: "2018", description: "Thesis on robust statistical learning." },
  ],
  projects: [
    { title: "Explainable AI Toolkit", technologies: "Python · PyTorch", description: "Open-source research toolkit for model interpretation." },
    { title: "Fair Models Benchmark", technologies: "Research · ML", description: "Benchmark suite cited by academic and industry teams." },
  ],
  achievements: ["12 peer-reviewed publications", "Best Paper Award — AI Systems 2024"],
  awards: ["National Research Fellowship"],
  languages: ["English", "Mandarin", "French"],
};

const STUDENT_SAMPLE = {
  ...SAMPLE_RESUME,
  full_name: "Priya Sharma",
  desired_job_title: "Computer Science Student",
  email: "priya.sharma@email.com",
  phone: "+91 98765 43210",
  location: "Hyderabad, India",
  linkedin: "linkedin.com/in/priyasharma",
  github: "github.com/priyasharma",
  skills: ["Java", "Python", "React", "SQL", "Data Structures", "Git"],
  certifications: ["AWS Cloud Foundations", "Java Programming"],
  experience: [
    { role: "Software Engineering Intern", company: "Bright Labs", duration: "Summer 2025", description: "Built and tested responsive web features with React and REST APIs." },
    { role: "Open Source Contributor", company: "Code for Community", duration: "2024 — Present", description: "Resolved accessibility issues and added automated tests to community projects." },
  ],
  education: [
    { degree: "BTech, Computer Science", institution: "Institute of Technology", year: "2026", description: "CGPA: 8.8/10" },
    { degree: "Senior Secondary", institution: "Central Public School", year: "2022", description: "Mathematics and Computer Science." },
  ],
  projects: [
    { title: "Campus Connect", technologies: "React · Node.js", description: "Developed a student events and collaboration platform." },
    { title: "Smart Attendance", technologies: "Python · OpenCV", description: "Built a privacy-aware classroom attendance prototype." },
  ],
  achievements: ["Winner — University Hackathon", "Solved 350+ coding challenges"],
  awards: ["Dean’s Merit Scholarship"],
  languages: ["English", "Hindi", "Telugu"],
};

const TECHNICAL_SAMPLE = {
  ...SAMPLE_RESUME,
  full_name: "Jordan Lee",
  desired_job_title: "Software Engineer",
  email: "jordan.lee@email.com",
  phone: "+1 415 555 0139",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/jordanlee",
  github: "github.com/jordanlee",
  skills: ["Python", "TypeScript", "Django", "PostgreSQL", "Docker", "AWS", "React"],
  certifications: ["AWS Certified Cloud Practitioner", "Kubernetes Fundamentals"],
  experience: [
    { role: "Software Engineer", company: "Cloudworks", duration: "2023 — Present", description: "Built reliable APIs and reduced deployment time through automated delivery pipelines." },
    { role: "Associate Developer", company: "Orbit Systems", duration: "2021 — 2023", description: "Implemented customer dashboards and optimized database queries for high-traffic services." },
    { role: "Engineering Intern", company: "Launchpad", duration: "Summer 2020", description: "Delivered test automation and internal developer tools." },
  ],
  education: [
    { degree: "BS, Computer Science", institution: "State University", year: "2021", description: "Coursework in distributed systems and databases." },
    { degree: "Cloud Engineering Certificate", institution: "Tech Academy", year: "2022", description: "Production infrastructure and observability." },
  ],
  projects: [
    { title: "Developer Analytics", technologies: "Python · React", description: "Created a dashboard for engineering delivery metrics." },
    { title: "Queue Monitor", technologies: "Django · Redis", description: "Open-source monitoring utility for background workloads." },
  ],
  achievements: ["Reduced API latency by 42%", "Maintainer of two open-source packages"],
  awards: ["Engineering Excellence Award"],
  languages: ["English", "Korean"],
};

function getTemplateSample(template) {
  if (template.tags.includes("Academic")) return ACADEMIC_SAMPLE;
  if (template.tags.some((tag) => ["Student", "Fresher"].includes(tag))) return STUDENT_SAMPLE;
  if (template.tags.some((tag) => ["ATS", "Technical"].includes(tag))) return TECHNICAL_SAMPLE;
  return SAMPLE_RESUME;
}

function ResumeTemplatePicker({ template, onSelect }) {
  const [selectedColor, setSelectedColor] = useState(template.colors[0]);
  const sampleResume = getTemplateSample(template);

  return (
    <article className="template-card">
      <div className="template-card-preview">
        {template.recommended && <span className="template-recommended">Recommended</span>}
        <div className="template-sample-scale" aria-hidden="true">
          <ResumePreview resume={sampleResume} template={template.id} accentColor={selectedColor} />
        </div>
        <button
          type="button"
          className="template-hover-action"
          onClick={() => onSelect(template.id, selectedColor)}
        >
          Use This Template
        </button>
      </div>

      <div className="template-color-row" aria-label={`Colors for ${template.name}`}>
        {template.colors.map((color) => (
          <button
            type="button"
            key={color}
            className={selectedColor === color ? "active" : ""}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
            aria-label={`Preview ${template.name} in ${color}`}
            aria-pressed={selectedColor === color}
          />
        ))}
        <span>PDF</span><span>DOCX</span>
      </div>

      <div className="template-card-body">
        <div className="template-card-badges">
          {template.tags.filter((tag) => tag !== "Overleaf").map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <h2>{template.name}</h2>
        <p>{template.description}</p>
      </div>
    </article>
  );
}

export default ResumeTemplatePicker;
