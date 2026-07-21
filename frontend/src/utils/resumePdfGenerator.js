import jsPDF from "jspdf";

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 6) {
  const lines = doc.splitTextToSize(text || "", maxWidth);

  lines.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });

  return y;
}

function addSection(doc, title, content, y) {
  if (!content || content.length === 0) {
    return y;
  }

  if (y > 260) {
    doc.addPage();
    y = 18;
  }

  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, 14, y);

  y += 3;
  doc.setDrawColor(37, 99, 235);
  doc.line(14, y, 196, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (Array.isArray(content)) {
    content.forEach((item) => {
      if (typeof item === "string") {
        y = addWrappedText(doc, `• ${item}`, 18, y, 170);
      }
    });
  } else {
    y = addWrappedText(doc, content, 18, y, 170);
  }

  return y + 2;
}

function addItemSection(doc, title, items, fields, y) {
  if (!items || items.length === 0) {
    return y;
  }

  y = addSection(doc, title, [" "], y);

  items.forEach((item) => {
    if (y > 260) {
      doc.addPage();
      y = 18;
    }

    const heading = fields
      .map((field) => item[field])
      .filter(Boolean)
      .join(" | ");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    y = addWrappedText(doc, heading, 18, y, 170);

    if (item.description) {
      doc.setFont("helvetica", "normal");
      y = addWrappedText(doc, item.description, 18, y, 170);
    }

    y += 3;
  });

  return y;
}

function buildBuiltResumePdf(resume) {
  const doc = new jsPDF();

  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(resume.full_name || "Your Name", 14, y);

  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const contact = [
    resume.email,
    resume.phone,
    resume.location,
    resume.linkedin,
    resume.github,
    resume.portfolio,
  ]
    .filter(Boolean)
    .join(" | ");

  y = addWrappedText(doc, contact, 14, y, 180);

  y = addSection(doc, "Summary", resume.summary, y);
  y = addSection(doc, "Skills", resume.skills, y);

  y = addItemSection(
    doc,
    "Experience",
    resume.experience,
    ["role", "company", "duration"],
    y
  );

  y = addItemSection(
    doc,
    "Education",
    resume.education,
    ["degree", "institution", "year"],
    y
  );

  y = addItemSection(
    doc,
    "Projects",
    resume.projects,
    ["title", "technologies"],
    y
  );

  y = addSection(doc, "Certifications", resume.certifications, y);
  y = addSection(doc, "Achievements", resume.achievements, y);
  y = addSection(doc, "Languages", resume.languages, y);
  y = addSection(doc, "Awards", resume.awards, y);
  y = addSection(doc, "Hobbies", resume.hobbies, y);
  if (resume.custom_section?.title) {
    y = addSection(doc, resume.custom_section.title, resume.custom_section.content, y);
  }

  return doc;
}

function getResumePdfFileName(resume, requestedName) {
  const baseName = (requestedName || resume.full_name || "resume")
    .toLowerCase()
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "resume";
  return `${baseName}.pdf`;
}

export function createBuiltResumePdfFile(resume, fileName) {
  const doc = buildBuiltResumePdf(resume);
  return new File([doc.output("blob")], getResumePdfFileName(resume, fileName), {
    type: "application/pdf",
    lastModified: Date.now(),
  });
}

export function downloadBuiltResumePdf(resume, fileName) {
  buildBuiltResumePdf(resume).save(getResumePdfFileName(resume, fileName));
}

export function downloadBuiltResumeTxt(resume) {
  const text = `
${resume.full_name || ""}
${[
  resume.email,
  resume.phone,
  resume.location,
  resume.linkedin,
  resume.github,
  resume.portfolio,
]
  .filter(Boolean)
  .join(" | ")}

SUMMARY
${resume.summary || ""}

SKILLS
${(resume.skills || []).join(", ")}

EXPERIENCE
${(resume.experience || [])
  .map((item) => `${item.role || ""} | ${item.company || ""} | ${item.duration || ""}
${item.description || ""}`)
  .join("\n\n")}

EDUCATION
${(resume.education || [])
  .map((item) => `${item.degree || ""} | ${item.institution || ""} | ${item.year || ""}`)
  .join("\n")}

PROJECTS
${(resume.projects || [])
  .map((item) => `${item.title || ""} | ${item.technologies || ""}
${item.description || ""}`)
  .join("\n\n")}
`;

  const blob = new Blob([text], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "resume.txt";
  link.click();

  URL.revokeObjectURL(url);
}
