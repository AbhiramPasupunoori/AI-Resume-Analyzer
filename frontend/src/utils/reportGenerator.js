import jsPDF from "jspdf";

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 7) {
  const lines = doc.splitTextToSize(text || "Not available", maxWidth);

  lines.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });

  return y;
}

function addSectionTitle(doc, title, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, 14, y);

  doc.setDrawColor(37, 99, 235);
  doc.line(14, y + 2, 196, y + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  return y + 10;
}

function addList(doc, items, x, y, maxWidth) {
  if (!items || items.length === 0) {
    doc.text("No items available.", x, y);
    return y + 8;
  }

  items.forEach((item) => {
    y = addWrappedText(doc, `• ${item}`, x, y, maxWidth, 6);
  });

  return y + 4;
}

function checkPage(doc, y) {
  if (y > 270) {
    doc.addPage();
    return 18;
  }

  return y;
}

export function generateAnalysisReport(analysis) {
  const doc = new jsPDF();

  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("AI Resume Analyzer Report", 14, y);

  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Overall Score: ${analysis.overall_score || 0} / 100`, 14, y);

  y += 8;

  doc.text(
    `Resume: ${analysis.resume?.original_filename || "Not available"}`,
    14,
    y
  );

  y += 7;

  doc.text(
    `Job: ${analysis.job_description?.job_title || "Not available"}`,
    14,
    y
  );

  y += 7;

  doc.text(
    `Company: ${analysis.job_description?.company_name || "Not provided"}`,
    14,
    y
  );

  y += 12;

  y = addSectionTitle(doc, "Score Breakdown", y);

  const breakdown = analysis.score_breakdown || {};

  const scoreRows = [
    ["Skills", breakdown.skill?.score ?? 0, breakdown.skill?.maximum ?? 45],
    [
      "Semantic Similarity",
      breakdown.semantic?.score ?? 0,
      breakdown.semantic?.maximum ?? 25,
    ],
    [
      "Sections",
      breakdown.sections?.score ?? 0,
      breakdown.sections?.maximum ?? 15,
    ],
    [
      "Achievements",
      breakdown.achievements?.score ?? 0,
      breakdown.achievements?.maximum ?? 10,
    ],
    [
      "Readability",
      breakdown.readability?.score ?? 0,
      breakdown.readability?.maximum ?? 5,
    ],
  ];

  scoreRows.forEach(([label, score, maximum]) => {
    doc.text(`${label}: ${score} / ${maximum}`, 18, y);
    y += 7;
  });

  y += 4;
  y = checkPage(doc, y);

  y = addSectionTitle(doc, "Matched Skills", y);
  y = addList(doc, analysis.matched_skills || [], 18, y, 170);

  y = checkPage(doc, y);

  y = addSectionTitle(doc, "Missing Skills", y);
  y = addList(doc, analysis.missing_skills || [], 18, y, 170);

  y = checkPage(doc, y);

  y = addSectionTitle(doc, "Resume Sections", y);

  const sectionResults = analysis.section_results;

  if (sectionResults?.present_sections) {
    y = addWrappedText(
      doc,
      `Present Sections: ${sectionResults.present_sections.join(", ")}`,
      18,
      y,
      170
    );

    y = addWrappedText(
      doc,
      `Missing Sections: ${
        sectionResults.missing_sections?.join(", ") || "None"
      }`,
      18,
      y,
      170
    );

    doc.text(
      `Completeness: ${sectionResults.completeness_percentage || 0}%`,
      18,
      y
    );

    y += 8;
  } else {
    doc.text("No section results available.", 18, y);
    y += 8;
  }

  y = checkPage(doc, y);

  y = addSectionTitle(doc, "Recommendations", y);
  y = addList(doc, analysis.recommendations || [], 18, y, 170);

  doc.save(`resume-analysis-${analysis.id}.pdf`);
}
