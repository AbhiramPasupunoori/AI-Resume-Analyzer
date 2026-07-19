import { jsPDF } from "jspdf";

const PAGE_MARGIN = {
  top: 18,
  right: 14,
  bottom: 18,
  left: 14,
};

const CONTENT_INDENT = 4;
const BODY_LINE_HEIGHT = 6;
const SECTION_GAP = 5;

function toText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(", ");
  }

  return String(value).trim();
}

function toTextList(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map(toText).filter(Boolean);
}

function pageBottom(doc) {
  return doc.internal.pageSize.getHeight() - PAGE_MARGIN.bottom;
}

function ensureSpace(doc, y, requiredHeight = BODY_LINE_HEIGHT) {
  if (y + requiredHeight <= pageBottom(doc)) {
    return y;
  }

  doc.addPage();
  return PAGE_MARGIN.top;
}

function addWrappedText(
  doc,
  value,
  x,
  y,
  maxWidth,
  lineHeight = BODY_LINE_HEIGHT
) {
  const text = toText(value);

  if (!text) {
    return y;
  }

  const wrapped = doc.splitTextToSize(text, maxWidth);
  const lines = Array.isArray(wrapped) ? wrapped : [wrapped];

  lines.forEach((line) => {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(toText(line), x, y);
    y += lineHeight;
  });

  return y;
}

function addBullet(doc, value, x, y, maxWidth) {
  const text = toText(value);

  if (!text) {
    return y;
  }

  const bulletIndent = 4;
  const wrapped = doc.splitTextToSize(text, maxWidth - bulletIndent);
  const lines = Array.isArray(wrapped) ? wrapped : [wrapped];

  lines.forEach((line, index) => {
    y = ensureSpace(doc, y);

    if (index === 0) {
      doc.text("\u2022", x, y);
    }

    doc.text(toText(line), x + bulletIndent, y);
    y += BODY_LINE_HEIGHT;
  });

  return y;
}

function addSectionHeading(doc, title, y) {
  // Keep the heading, divider, and at least one body line on the same page.
  y = ensureSpace(doc, y, SECTION_GAP + 16);
  y += SECTION_GAP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, PAGE_MARGIN.left, y);

  y += 3;

  doc.setDrawColor(37, 99, 235);
  doc.line(
    PAGE_MARGIN.left,
    y,
    doc.internal.pageSize.getWidth() - PAGE_MARGIN.right,
    y
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  return y + 7;
}

function addSection(doc, title, content, y) {
  const listItems = Array.isArray(content) ? toTextList(content) : null;
  const text = listItems ? "" : toText(content);

  if ((listItems && listItems.length === 0) || (!listItems && !text)) {
    return y;
  }

  y = addSectionHeading(doc, title, y);

  if (listItems) {
    listItems.forEach((item) => {
      y = addBullet(
        doc,
        item,
        PAGE_MARGIN.left + CONTENT_INDENT,
        y,
        doc.internal.pageSize.getWidth() -
          PAGE_MARGIN.left -
          PAGE_MARGIN.right -
          CONTENT_INDENT
      );
    });
  } else {
    y = addWrappedText(
      doc,
      text,
      PAGE_MARGIN.left + CONTENT_INDENT,
      y,
      doc.internal.pageSize.getWidth() -
        PAGE_MARGIN.left -
        PAGE_MARGIN.right -
        CONTENT_INDENT
    );
  }

  return y + 2;
}

function hasDictItemContent(item, fields) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  return (
    fields.some((field) => toText(item[field])) ||
    Boolean(toText(item.description)) ||
    toTextList(item.bullets).length > 0
  );
}

function addDictSection(doc, title, values, fields, y) {
  const items = Array.isArray(values)
    ? values.filter((item) => hasDictItemContent(item, fields))
    : [];

  if (items.length === 0) {
    return y;
  }

  y = addSectionHeading(doc, title, y);

  const x = PAGE_MARGIN.left + CONTENT_INDENT;
  const maxWidth =
    doc.internal.pageSize.getWidth() -
    PAGE_MARGIN.left -
    PAGE_MARGIN.right -
    CONTENT_INDENT;

  items.forEach((item) => {
    y = ensureSpace(doc, y, BODY_LINE_HEIGHT * 2);

    const titleLine = fields.map((field) => toText(item[field])).filter(Boolean);

    if (titleLine.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      y = addWrappedText(doc, titleLine.join(" | "), x, y, maxWidth);
    }

    const description = toText(item.description);

    if (description) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y = addWrappedText(doc, description, x, y, maxWidth);
    }

    const bullets = toTextList(item.bullets);

    if (bullets.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      bullets.forEach((bullet) => {
        y = addBullet(doc, bullet, x + CONTENT_INDENT, y, maxWidth - CONTENT_INDENT);
      });
    }

    y += 3;
  });

  return y;
}

export function getBuiltResumePdfFileName(fullName) {
  const slug = toText(fullName)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${slug || "resume"}.pdf`;
}

export function createBuiltResumePdf(resume = {}) {
  const data = resume && typeof resume === "object" ? resume : {};
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  let y = PAGE_MARGIN.top;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  y = addWrappedText(
    doc,
    toText(data.full_name) || "Your Name",
    PAGE_MARGIN.left,
    y,
    doc.internal.pageSize.getWidth() - PAGE_MARGIN.left - PAGE_MARGIN.right,
    8
  );

  const contact = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.github,
    data.portfolio,
  ]
    .map(toText)
    .filter(Boolean)
    .join(" | ");

  if (contact) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addWrappedText(
      doc,
      contact,
      PAGE_MARGIN.left,
      y,
      doc.internal.pageSize.getWidth() - PAGE_MARGIN.left - PAGE_MARGIN.right
    );
  }

  y = addSection(doc, "Professional Summary", data.summary, y);
  y = addSection(doc, "Skills", data.skills, y);
  y = addDictSection(
    doc,
    "Education",
    data.education,
    ["degree", "institution", "year"],
    y
  );
  y = addDictSection(
    doc,
    "Experience",
    data.experience,
    ["role", "company", "duration"],
    y
  );
  y = addDictSection(
    doc,
    "Projects",
    data.projects,
    ["title", "technologies"],
    y
  );
  y = addSection(doc, "Certifications", data.certifications, y);
  addSection(doc, "Achievements", data.achievements, y);

  return doc;
}

export function downloadBuiltResumePdf(resume = {}) {
  const doc = createBuiltResumePdf(resume);
  doc.save(getBuiltResumePdfFileName(resume?.full_name));
  return doc;
}
