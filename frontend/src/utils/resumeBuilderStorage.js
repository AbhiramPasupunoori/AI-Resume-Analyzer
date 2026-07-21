const RESUME_KEY = "ai_resume_builder_data";
const TEMPLATE_KEY = "ai_resume_builder_template";
const TEMPLATE_COLOR_KEY = "ai_resume_builder_template_color";
const BUILDER_STEP_KEY = "ai_resume_builder_step";
const BUILDER_ROUTE_KEY = "ai_resume_builder_last_route";
const EDITED_HISTORY_KEY = "ai_resume_builder_history";
const CURRENT_RESUME_ID_KEY = "ai_resume_builder_current_id";

export const EMPTY_RESUME = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  desired_job_title: "",
  summary: "",
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  awards: [],
  hobbies: [],
  custom_section: {
    title: "",
    content: "",
  },
};

export function saveResumeDraft(resume) {
  localStorage.setItem(RESUME_KEY, JSON.stringify(resume));
}

export function loadResumeDraft() {
  const stored = localStorage.getItem(RESUME_KEY);

  if (!stored) {
    return EMPTY_RESUME;
  }

  try {
    return {
      ...EMPTY_RESUME,
      ...JSON.parse(stored),
    };
  } catch {
    return EMPTY_RESUME;
  }
}

export function saveSelectedTemplate(template) {
  localStorage.setItem(TEMPLATE_KEY, template);
}

export function saveSelectedTemplateColor(color) {
  localStorage.setItem(TEMPLATE_COLOR_KEY, color);
}

export function loadSelectedTemplateColor() {
  return localStorage.getItem(TEMPLATE_COLOR_KEY) || "";
}

export function loadSelectedTemplate() {
  return localStorage.getItem(TEMPLATE_KEY) || "ats-classic";
}

export function saveBuilderStep(step) {
  localStorage.setItem(BUILDER_STEP_KEY, String(step));
}

export function loadBuilderStep() {
  const step = Number(localStorage.getItem(BUILDER_STEP_KEY));
  if (step === 5) return 4;
  return Number.isInteger(step) && step >= 0 && step <= 4 ? step : 0;
}

export function saveLastBuilderRoute(route) {
  if (route?.startsWith("/resume-builder")) {
    localStorage.setItem(BUILDER_ROUTE_KEY, route);
  }
}

export function loadLastBuilderRoute() {
  return localStorage.getItem(BUILDER_ROUTE_KEY) || "/resume-builder";
}

export function loadEditedResumeHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(EDITED_HISTORY_KEY) || "[]");
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

export function saveEditedResumeSnapshot({ resume, template, templateColor, fileName }) {
  const history = loadEditedResumeHistory();
  const currentId = localStorage.getItem(CURRENT_RESUME_ID_KEY) ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const snapshot = {
    id: currentId,
    name: fileName || resume.full_name || "Untitled Resume",
    resume,
    template,
    templateColor,
    updatedAt: new Date().toISOString(),
  };
  const nextHistory = [snapshot, ...history.filter((item) => item.id !== currentId)];
  localStorage.setItem(CURRENT_RESUME_ID_KEY, currentId);
  localStorage.setItem(EDITED_HISTORY_KEY, JSON.stringify(nextHistory));
  return snapshot;
}

export function restoreEditedResume(snapshot) {
  if (!snapshot?.resume) return;
  localStorage.setItem(CURRENT_RESUME_ID_KEY, snapshot.id);
  saveResumeDraft(snapshot.resume);
  saveSelectedTemplate(snapshot.template || "ats-classic");
  saveSelectedTemplateColor(snapshot.templateColor || "");
}

export function deleteEditedResumeSnapshot(snapshotId) {
  const nextHistory = loadEditedResumeHistory().filter((item) => item.id !== snapshotId);
  localStorage.setItem(EDITED_HISTORY_KEY, JSON.stringify(nextHistory));
  if (localStorage.getItem(CURRENT_RESUME_ID_KEY) === snapshotId) {
    localStorage.removeItem(CURRENT_RESUME_ID_KEY);
  }
  return nextHistory;
}

export function clearResumeDraft() {
  localStorage.removeItem(RESUME_KEY);
  localStorage.removeItem(BUILDER_STEP_KEY);
  localStorage.removeItem(BUILDER_ROUTE_KEY);
  localStorage.removeItem(CURRENT_RESUME_ID_KEY);
}
