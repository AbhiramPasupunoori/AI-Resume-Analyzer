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
    <div className="card chart-card">
      <h2>Score Breakdown Chart</h2>
      <p className="muted">Visual comparison of each scoring category.</p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="scoreBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>

              <linearGradient
                id="maximumBarGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar
              dataKey="score"
              name="Score"
              fill="url(#scoreBarGradient)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="maximum"
              name="Maximum"
              fill="url(#maximumBarGradient)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ScoreChart;
