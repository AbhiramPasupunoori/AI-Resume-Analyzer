function calculateResumeScore(resume) {
  let score = 0;

  if (resume.full_name && resume.email && resume.phone) score += 20;
  if (resume.summary) score += 15;
  if (resume.skills?.length >= 4) score += 20;
  if (resume.education?.length > 0) score += 15;
  if (resume.experience?.length > 0 || resume.projects?.length > 0) score += 20;
  if (
    resume.certifications?.length > 0 ||
    resume.achievements?.length > 0 ||
    resume.languages?.length > 0
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

function ResumeScoreBadge({ resume }) {
  const score = calculateResumeScore(resume);

  return (
    <div className="resume-score-badge">
      <strong>{score}%</strong>
      <span>Your resume score 🔥</span>
    </div>
  );
}

export default ResumeScoreBadge;