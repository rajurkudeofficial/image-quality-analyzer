import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import clsx from "clsx";

const CHANNELS = [
  { key: "red", label: "Red", color: "#DC2626" },
  { key: "green", label: "Green", color: "#16A34A" },
  { key: "blue", label: "Blue", color: "#2563EB" },
];

/**
 * Renders the 32-bin per-channel histogram returned by the backend's
 * color_statistics. Lets the user toggle between original/enhanced and
 * between channels so all data is visible without cluttering one chart.
 */
export default function RgbHistogramChart({ originalStats, enhancedStats }) {
  const [source, setSource] = useState("original"); // original | enhanced
  const [channel, setChannel] = useState("red");

  const stats = source === "original" ? originalStats : enhancedStats;
  const activeChannel = CHANNELS.find((c) => c.key === channel);
  const histogram = stats?.[channel]?.histogram ?? [];

  const data = histogram.map((count, i) => ({
    bin: i * 8, // each of 32 bins spans 8 intensity values (0-255)
    count,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 bg-ink-100/60 rounded-lg p-1">
          {["original", "enhanced"].map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={clsx(
                "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors",
                source === s ? "bg-white text-accent-700 shadow-soft" : "text-ink-500 hover:text-ink-900"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {CHANNELS.map((c) => (
            <button
              key={c.key}
              onClick={() => setChannel(c.key)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all",
                channel === c.key
                  ? "border-transparent text-white shadow-soft"
                  : "border-ink-100 text-ink-500 hover:border-ink-300"
              )}
              style={channel === c.key ? { backgroundColor: c.color } : {}}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: channel === c.key ? "white" : c.color }}
              />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeChannel.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={activeChannel.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="bin"
            tick={{ fontSize: 11, fill: "#64748B" }}
            label={{ value: "Pixel Intensity", position: "insideBottom", offset: -2, fontSize: 11, fill: "#94A3B8" }}
          />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #F1F5F9",
              boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
              fontSize: 13,
            }}
            labelFormatter={(v) => `Intensity ~${v}`}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={activeChannel.color}
            strokeWidth={2}
            fill="url(#histFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
