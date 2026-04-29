import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SpeakerMetrics } from "../../types";

interface Props {
  metrics: SpeakerMetrics[];
}

const COLORS = [
  "#818cf8",
  "#34d399",
  "#fb923c",
  "#f472b6",
  "#38bdf8",
  "#a78bfa",
  "#4ade80",
  "#fbbf24",
];

export default function TalkTimeChart({ metrics }: Props) {
  const data = metrics.map((m) => ({
    name: m.name,
    seconds: Math.round(m.totalMs / 1000),
  }));

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-4">
        Talk time (seconds)
      </p>
      <ResponsiveContainer width="100%" height={Math.max(120, metrics.length * 50)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <XAxis type="number" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#475569"
            tick={{ fill: "#e2e8f0", fontSize: 13 }}
            width={80}
          />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
            itemStyle={{ color: "#818cf8" }}
            formatter={(value) => [`${value}s`, "Talk time"]}
          />
          <Bar dataKey="seconds" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
