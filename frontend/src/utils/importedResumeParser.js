import { EMPTY_RESUME } from "./resumeBuilderStorage";

const SECTION_NAMES = {
  summary: ["summary", "profile", "professional summary", "objective", "about me"],
  experience: ["experience", "work experience", "employment", "employment history", "professional experience"],
  education: ["education", "academic background", "qualifications"],
  skills: ["skills", "technical skills", "core competencies", "competencies", "expertise"],
  projects: ["projects", "personal projects", "academic projects"],
  certifications: ["certifications", "certificates", "licenses and certifications"],
  achievements: ["achievements", "accomplishments"],
  languages: ["languages", "language"],
  awards: ["awards", "honors", "honours and awards"],
  hobbies: ["hobbies", "interests"],
};

const HEADING_LOOKUP = Object.entries(SECTION_NAMES).reduce((lookup, [key, names]) => {
  names.forEach((name) => { lookup[name] = key; });
  return lookup;
}, {});

function cleanLine(line) {
  return line.replace(/^[•●▪◦*\-–—]\s*/, "").replace(/\s+/g, " ").trim();
}

function sectionKey(line) {
  const normalized = line.toLowerCase().replace(/[:|]/g, "").trim();
  return HEADING_LOOKUP[normalized] || "";
}

function splitList(lines) {
  return [...new Set(lines.flatMap((line) => cleanLine(line).split(/[,;|•]/)).map((item) => item.trim()).filter(Boolean))];
}

function groupEntries(lines) {
  const entries = [];
  let current = [];
  lines.forEach((line) => {
    if (!line.trim()) {
      if (current.length) entries.push(current);
      current = [];
    } else {
      current.push(cleanLine(line));
    }
  });
  if (current.length) entries.push(current);
  return entries;
}

function parseExperience(lines) {
  return groupEntries(lines).map((entry) => ({
    role: entry[0] || "",
    company: entry[1] || "",
    duration: entry.find((line) => /(?:19|20)\d{2}|present|current/i.test(line)) || "",
    description: entry.slice(2).filter((line) => !/(?:19|20)\d{2}|present|current/i.test(line)).join("\n"),
  })).filter((item) => item.role);
}

function parseEducation(lines) {
  return groupEntries(lines).map((entry) => ({
    degree: entry[0] || "",
    institution: entry[1] || "",
    year: entry.find((line) => /(?:19|20)\d{2}/.test(line)) || "",
    description: entry.slice(2).filter((line) => !/(?:19|20)\d{2}/.test(line)).join("\n"),
  })).filter((item) => item.degree);
}

function parseProjects(lines) {
  return groupEntries(lines).map((entry) => ({
    title: entry[0] || "",
    technologies: entry[1] || "",
    description: entry.slice(2).join("\n"),
  })).filter((item) => item.title);
}

export function parseImportedResume(text, detectedSkills = []) {
  const rawLines = String(text || "").replace(/\r/g, "").split("\n");
  const lines = rawLines.map((line) => line.trim());
  const sections = {};
  const header = [];
  let activeSection = "";

  lines.forEach((line) => {
    const heading = sectionKey(line);
    if (heading) {
      activeSection = heading;
      sections[heading] ||= [];
    } else if (activeSection) {
      sections[activeSection].push(line);
    } else if (line) {
      header.push(line);
    }
  });

  const allText = lines.join(" ");
  const email = allText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = allText.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || "";
  const linkedin = allText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i)?.[0] || "";
  const github = allText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i)?.[0] || "";
  const contactPattern = /@|linkedin|github|https?:|\+?\d[\d\s().-]{7,}\d/i;
  const identityLines = header.filter((line) => !contactPattern.test(line));

  return {
    ...EMPTY_RESUME,
    full_name: identityLines[0] || "",
    desired_job_title: identityLines[1] || "",
    email,
    phone,
    linkedin,
    github,
    location: identityLines[2] || "",
    summary: (sections.summary || []).filter(Boolean).join(" "),
    skills: [...new Set([...(detectedSkills || []), ...splitList(sections.skills || [])])],
    experience: parseExperience(sections.experience || []),
    education: parseEducation(sections.education || []),
    projects: parseProjects(sections.projects || []),
    certifications: splitList(sections.certifications || []),
    achievements: splitList(sections.achievements || []),
    languages: splitList(sections.languages || []),
    awards: splitList(sections.awards || []),
    hobbies: splitList(sections.hobbies || []),
  };
}
