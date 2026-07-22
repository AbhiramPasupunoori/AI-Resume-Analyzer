const SKILLS = [
  "AWS", "Azure", "C++", "CSS", "Docker", "Django", "Excel", "Express", "Figma",
  "Git", "GitHub", "Go", "GraphQL", "HTML", "Java", "JavaScript", "Kubernetes",
  "MongoDB", "MySQL", "Node.js", "PostgreSQL", "Power BI", "Python", "React",
  "Redis", "REST APIs", "Ruby", "SQL", "Tableau", "TypeScript", "Vue",
];

export function extractSkills(text = "") {
  const normalized = ` ${text.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ")} `;
  return SKILLS.filter((skill) => normalized.includes(` ${skill.toLowerCase()} `));
}

function sectionResult(text) {
  const sectionNames = {
    Summary: /summary|profile|objective/i,
    Skills: /skills|technologies|competencies/i,
    Experience: /experience|employment|work history/i,
    Education: /education|academic/i,
    Projects: /projects?/i,
    Certifications: /certifications?|licenses?/i,
  };
  const present = Object.entries(sectionNames).filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const missing = Object.keys(sectionNames).filter((name) => !present.includes(name));
  return { present_sections: present, missing_sections: missing, present_count: present.length, total_sections: 6, completeness_percentage: Math.round(present.length / 6 * 100) };
}

export function analyze(resume, job) {
  const resumeText = resume.extracted_text || "";
  const jobSkills = extractSkills(job.description);
  const resumeSkills = extractSkills(resumeText);
  const matched = jobSkills.filter((skill) => resumeSkills.includes(skill));
  const missing = jobSkills.filter((skill) => !resumeSkills.includes(skill));
  const coverage = jobSkills.length ? matched.length / jobSkills.length * 100 : 0;
  const skillScore = coverage * 0.45;
  const sections = sectionResult(resumeText);
  const sectionScore = sections.present_count / sections.total_sections * 15;
  const resumeWords = new Set(resumeText.toLowerCase().match(/[a-z]{3,}/g) || []);
  const jobWords = [...new Set(job.description.toLowerCase().match(/[a-z]{3,}/g) || [])];
  const similarity = jobWords.length ? jobWords.filter((word) => resumeWords.has(word)).length / jobWords.length * 100 : 0;
  const semanticScore = similarity * 0.25;
  const achievements = (resumeText.match(/\b\d+(?:\.\d+)?%|\b\d+[kKmM+]\b/g) || []).length;
  const achievementScore = Math.min(10, achievements * 2.5);
  const averageWords = resumeText.split(/[.!?]+/).filter(Boolean).reduce((sum, sentence) => sum + sentence.trim().split(/\s+/).length, 0) / Math.max(1, resumeText.split(/[.!?]+/).filter(Boolean).length);
  const readabilityScore = averageWords <= 24 ? 5 : averageWords <= 32 ? 3 : 1;
  const overall = Math.min(100, skillScore + semanticScore + sectionScore + achievementScore + readabilityScore);
  const round = (value) => Math.round(value * 100) / 100;
  const recommendations = [
    ...missing.map((skill) => `Add evidence of ${skill} experience where it is accurate.`),
    ...sections.missing_sections.map((section) => `Add a clear ${section} section.`),
    ...(achievements ? [] : ["Quantify achievements with measurable outcomes."]),
  ];
  return {
    status: "completed", overall_score: round(overall), skill_score: round(skillScore),
    semantic_score: round(semanticScore), section_score: round(sectionScore),
    achievement_score: round(achievementScore), readability_score: readabilityScore,
    semantic_similarity: round(similarity), skill_coverage_percentage: round(coverage),
    resume_skills: resumeSkills, job_skills: jobSkills, matched_skills: matched,
    missing_skills: missing, section_results: sections,
    achievement_results: { quantified_achievements: achievements, score: achievementScore },
    readability_results: { average_sentence_words: round(averageWords), score: readabilityScore },
    recommendations, error_message: "", analysis_time_ms: 1,
    score_breakdown: {
      skill: { score: round(skillScore), maximum: 45 }, semantic: { score: round(semanticScore), maximum: 25 },
      sections: { score: round(sectionScore), maximum: 15 }, achievements: { score: round(achievementScore), maximum: 10 },
      readability: { score: readabilityScore, maximum: 5 }, overall: { score: round(overall), maximum: 100 },
    },
  };
}

export function resumeText(data) {
  const lines = [data.full_name, [data.email, data.phone, data.location, data.linkedin, data.github, data.portfolio].filter(Boolean).join(" | ")];
  for (const [title, value] of Object.entries({ Summary: data.summary, Skills: data.skills, Education: data.education, Experience: data.experience, Projects: data.projects, Certifications: data.certifications, Achievements: data.achievements })) {
    if (!value || (Array.isArray(value) && !value.length)) continue;
    lines.push("", title, Array.isArray(value) ? value.map((item) => typeof item === "string" ? `- ${item}` : Object.values(item).filter((entry) => typeof entry === "string" && entry).join(" | ")).join("\n") : value);
  }
  return lines.filter((value) => value !== undefined).join("\n");
}
