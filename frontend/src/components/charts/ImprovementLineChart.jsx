import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { METRIC_LABELS } from "../../utils/format";

const CustomDot = (props) => {
  const { cx, cy, value } = props;
  const color = value >= 0 ? "#16A34A" : "#DC2626";
  return <circle cx={cx} cy={cy} r={4.5} fill={color} stroke="white" strokeWidth={2} />;
};

export default function ImprovementLineChart({ improvementPercentages }) {
  const data = Object.keys(METRIC_LABELS).map((key) => ({
    name: METRIC_LABELS[key],
    improvement: improvementPercentages?.[key] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748B" }}
          angle={-20}
          textAnchor="end"
          height={60}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748B" }}
          label={{ value: "% Change", angle: -90, position: "insideLeft", fontSize: 11, fill: "#94A3B8" }}
        />
        <ReferenceLine y={0} stroke="#CBD5E1" strokeWidth={1.5} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #F1F5F9",
            boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
            fontSize: 13,
          }}
          formatter={(value) => [`${value > 0 ? "+" : ""}${value}%`, "Improvement"]}
        />
        <Line
          type="monotone"
          dataKey="improvement"
          stroke="#2563EB"
          strokeWidth={2.5}
          dot={<CustomDot />}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
