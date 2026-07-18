import ScoreCard from "./ScoreCard";

function ScoreBreakdown({ scoreBreakdown }) {
  if (!scoreBreakdown) {
    return null;
  }

  return (
    <div className="score-grid">
      <ScoreCard
        title="Skills"
        score={scoreBreakdown.skill?.score ?? 0}
        maximum={scoreBreakdown.skill?.maximum ?? 45}
      />

      <ScoreCard
        title="Semantic"
        score={scoreBreakdown.semantic?.score ?? 0}
        maximum={scoreBreakdown.semantic?.maximum ?? 25}
      />

      <ScoreCard
        title="Sections"
        score={scoreBreakdown.sections?.score ?? 0}
        maximum={scoreBreakdown.sections?.maximum ?? 15}
      />

      <ScoreCard
        title="Achievements"
        score={scoreBreakdown.achievements?.score ?? 0}
        maximum={scoreBreakdown.achievements?.maximum ?? 10}
      />

      <ScoreCard
        title="Readability"
        score={scoreBreakdown.readability?.score ?? 0}
        maximum={scoreBreakdown.readability?.maximum ?? 5}
      />
    </div>
  );
}

export default ScoreBreakdown;