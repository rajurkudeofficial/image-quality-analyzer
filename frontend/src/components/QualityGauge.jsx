import React, { useEffect, useState } from "react";
import { scoreColor } from "../utils/format";

/**
 * Animated circular gauge (0-100) with color transitioning from
 * red -> yellow -> green based on score. Pure SVG, no chart library
 * needed for a single-value radial indicator.
 */
export default function QualityGauge({ score = 0, size = 220, strokeWidth = 16 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 150);
    return () => clearTimeout(timeout);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = scoreColor(score);

  const label = score >= 75 ? "Good" : score >= 45 ? "Average" : "Poor";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-extrabold text-ink-900 tabular-nums">
          {Math.round(animatedScore)}
        </span>
        <span className="text-sm text-ink-500 font-medium">out of 100</span>
        <span
          className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
