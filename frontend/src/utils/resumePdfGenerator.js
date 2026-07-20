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
const DEFAULT_TEMPLATE_ID = "ats-classic";

const TEMPLATE_STYLES = {
  "ats-classic": {
    headerName: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 20,
      color: [17, 24, 39],
    },
    contact: {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 10,
      color: [55, 65, 81],
    },
    section: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 12,
      color: [17, 24, 39],
      dividerColor: [37, 99, 235],
      dividerWidth: 0.2,
      textCase: "title",
    },
    itemTitle: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 10,
      color: [17, 24, 39],
    },
    body: {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 10,
      color: [17, 24, 39],
    },
  },
  modern: {
    headerName: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 24,
      color: [15, 61, 86],
    },
    contact: {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 9.5,
      color: [15, 118, 110],
    },
    section: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 11,
      color: [15, 118, 110],
      dividerColor: [20, 184, 166],
      dividerWidth: 0.6,
      textCase: "uppercase",
    },
    itemTitle: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 10,
      color: [15, 61, 86],
    },
    body: {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 10,
      color: [30, 41, 59],
    },
  },
  minimal: {
    headerName: {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 18,
      color: [17, 24, 39],
    },
    contact: {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 9,
      color: [107, 114, 128],
    },
    section: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 9.5,
      color: [75, 85, 99],
      dividerColor: [209, 213, 219],
      dividerWidth: 0.15,
      textCase: "uppercase",
    },
    itemTitle: {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 9.5,
      color: [31, 41, 55],
    },
    body: {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 9.5,
      color: [31, 41, 55],
    },
  },
  professional: {
    headerName: {
      font: "times",
      fontStyle: "bold",
      fontSize: 22,
      color: [91, 35, 51],
    },
    contact: {
      font: "times",
      fontStyle: "normal",
      fontSize: 10,
      color: [75, 85, 99],
    },
    section: {
      font: "times",
      fontStyle: "bold",
      fontSize: 13,
      color: [91, 35, 51],
      dividerColor: [176, 137, 59],
      dividerWidth: 0.4,
      textCase: "title",
    },
    itemTitle: {
      font: "times",
      fontStyle: "bold",
      fontSize: 10.5,
      color: [55, 48, 46],
    },
    body: {
      font: "times",
      fontStyle: "normal",
      fontSize: 10,
      color: [55, 48, 46],
    },
  },
};

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

function resolveTemplateStyle(templateId) {
  const normalizedId = toText(templateId).toLowerCase();
  return TEMPLATE_STYLES[normalizedId] || TEMPLATE_STYLES[DEFAULT_TEMPLATE_ID];
}

function applyTextStyle(doc, style) {
  doc.setFont(style.font, style.fontStyle);
  doc.setFontSize(style.fontSize);
  doc.setTextColor(...style.color);
}

function formatSectionTitle(title, textCase) {
  const text = toText(title);
  return textCase === "uppercase" ? text.toUpperCase() : text;
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

function addSectionHeading(doc, title, y, templateStyle) {
  // Keep the heading, divider, and at least one body line on the same page.
  y = ensureSpace(doc, y, SECTION_GAP + 16);
  y += SECTION_GAP;

  applyTextStyle(doc, templateStyle.section);
  doc.text(
    formatSectionTitle(title, templateStyle.section.textCase),
    PAGE_MARGIN.left,
    y
  );

  y += 3;

  doc.setDrawColor(...templateStyle.section.dividerColor);
  doc.setLineWidth(templateStyle.section.dividerWidth);
  doc.line(
    PAGE_MARGIN.left,
    y,
    doc.internal.pageSize.getWidth() - PAGE_MARGIN.right,
    y
  );

  applyTextStyle(doc, templateStyle.body);

  return y + 7;
}

function addSection(doc, title, content, y, templateStyle) {
  const listItems = Array.isArray(content) ? toTextList(content) : null;
  const text = listItems ? "" : toText(content);

  if ((listItems && listItems.length === 0) || (!listItems && !text)) {
    return y;
  }

  y = addSectionHeading(doc, title, y, templateStyle);

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

function addDictSection(doc, title, values, fields, y, templateStyle) {
  const items = Array.isArray(values)
    ? values.filter((item) => hasDictItemContent(item, fields))
    : [];

  if (items.length === 0) {
    return y;
  }

  y = addSectionHeading(doc, title, y, templateStyle);

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
      applyTextStyle(doc, templateStyle.itemTitle);
      y = addWrappedText(doc, titleLine.join(" | "), x, y, maxWidth);
    }

    const description = toText(item.description);

    if (description) {
      applyTextStyle(doc, templateStyle.body);
      y = addWrappedText(doc, description, x, y, maxWidth);
    }

    const bullets = toTextList(item.bullets);

    if (bullets.length > 0) {
      applyTextStyle(doc, templateStyle.body);

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

export function createBuiltResumePdf(resume = {}, templateId = DEFAULT_TEMPLATE_ID) {
  const data = resume && typeof resume === "object" ? resume : {};
  const templateStyle = resolveTemplateStyle(templateId);
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  let y = PAGE_MARGIN.top;

  applyTextStyle(doc, templateStyle.headerName);
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
    applyTextStyle(doc, templateStyle.contact);
    y = addWrappedText(
      doc,
      contact,
      PAGE_MARGIN.left,
      y,
      doc.internal.pageSize.getWidth() - PAGE_MARGIN.left - PAGE_MARGIN.right
    );
  }

  y = addSection(doc, "Professional Summary", data.summary, y, templateStyle);
  y = addSection(doc, "Skills", data.skills, y, templateStyle);
  y = addDictSection(
    doc,
    "Education",
    data.education,
    ["degree", "institution", "year"],
    y,
    templateStyle
  );
  y = addDictSection(
    doc,
    "Experience",
    data.experience,
    ["role", "company", "duration"],
    y,
    templateStyle
  );
  y = addDictSection(
    doc,
    "Projects",
    data.projects,
    ["title", "technologies"],
    y,
    templateStyle
  );
  y = addSection(doc, "Certifications", data.certifications, y, templateStyle);
  addSection(doc, "Achievements", data.achievements, y, templateStyle);

  return doc;
}

export function downloadBuiltResumePdf(
  resume = {},
  templateId = DEFAULT_TEMPLATE_ID
) {
  const doc = createBuiltResumePdf(resume, templateId);
  doc.save(getBuiltResumePdfFileName(resume?.full_name));
  return doc;
}
