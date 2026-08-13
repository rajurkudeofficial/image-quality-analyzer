import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { METRIC_LABELS } from "../../utils/format";

export default function QualityRadarChart({ original, enhanced }) {
  const data = Object.keys(METRIC_LABELS).map((key) => ({
    metric: METRIC_LABELS[key],
    Original: original?.[key]?.normalized ?? 0,
    Enhanced: enhanced?.[key]?.normalized ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748B" }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} />
        <Radar
          name="Original"
          dataKey="Original"
          stroke="#93B4FD"
          fill="#93B4FD"
          fillOpacity={0.35}
        />
        <Radar
          name="Enhanced"
          dataKey="Enhanced"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.35}
        />
        <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #F1F5F9",
            boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
            fontSize: 13,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
