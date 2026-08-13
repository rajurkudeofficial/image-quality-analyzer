import React from "react";
import clsx from "clsx";

const STATUS_STYLES = {
  Good: { badge: "badge-good", bar: "bg-success" },
  Average: { badge: "badge-average", bar: "bg-warning" },
  Poor: { badge: "badge-poor", bar: "bg-danger" },
};

/**
 * A single metric result card: icon, title, big percentage, progress bar,
 * status badge, and a small raw-value caption for technical users.
 */
export default function MetricCard({ icon: Icon, title, normalized, status, rawLabel, delay = 0 }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.Average;

  return (
    <div
      className="glass-card-solid p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <span className={styles.badge}>{status}</span>
      </div>

      <h3 className="text-sm font-medium text-ink-500 mb-1">{title}</h3>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-ink-900">{Math.round(normalized)}</span>
        <span className="text-sm text-ink-500">/100</span>
      </div>

      <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-700 ease-out", styles.bar)}
          style={{ width: `${Math.max(2, normalized)}%` }}
        />
      </div>

      {rawLabel && <p className="text-xs text-ink-500 mt-2.5">{rawLabel}</p>}
    </div>
  );
}
