import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { METRIC_LABELS } from "../../utils/format";

export default function ComparisonBarChart({ original, enhanced }) {
  const data = Object.keys(METRIC_LABELS).map((key) => ({
    name: METRIC_LABELS[key],
    Original: original?.[key]?.normalized ?? 0,
    Enhanced: enhanced?.[key]?.normalized ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 8 }} barGap={6}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748B" }}
          angle={-20}
          textAnchor="end"
          height={60}
          interval={0}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748B" }} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #F1F5F9",
            boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
        <Bar dataKey="Original" fill="#93B4FD" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Enhanced" fill="#2563EB" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
