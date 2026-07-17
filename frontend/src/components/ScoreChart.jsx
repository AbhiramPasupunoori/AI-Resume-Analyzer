import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function ScoreChart({ scoreBreakdown }) {
  if (!scoreBreakdown) {
    return null;
  }

  const chartData = [
    {
      name: "Skills",
      score: toNumber(scoreBreakdown.skill?.score),
      maximum: toNumber(scoreBreakdown.skill?.maximum || 45),
    },
    {
      name: "Semantic",
      score: toNumber(scoreBreakdown.semantic?.score),
      maximum: toNumber(scoreBreakdown.semantic?.maximum || 25),
    },
    {
      name: "Sections",
      score: toNumber(scoreBreakdown.sections?.score),
      maximum: toNumber(scoreBreakdown.sections?.maximum || 15),
    },
    {
      name: "Achievements",
      score: toNumber(scoreBreakdown.achievements?.score),
      maximum: toNumber(scoreBreakdown.achievements?.maximum || 10),
    },
    {
      name: "Readability",
      score: toNumber(scoreBreakdown.readability?.score),
      maximum: toNumber(scoreBreakdown.readability?.maximum || 5),
    },
  ];

  return (
    <div className="card">
      <h2>Score Breakdown Chart</h2>
      <p className="muted">
        Visual comparison of each scoring category.
      </p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar
              dataKey="score"
              name="Score"
              radius={[8, 8, 0, 0]}
            />

            <Bar
              dataKey="maximum"
              name="Maximum"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ScoreChart;