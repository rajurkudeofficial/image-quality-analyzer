export function formatBytes(bytes) {
  if (bytes === 0 || bytes === null || bytes === undefined) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDimensions(width, height) {
  if (!width || !height) return "—";
  return `${width} × ${height}px`;
}

export function statusToVariant(status) {
  switch ((status || "").toLowerCase()) {
    case "good":
      return "good";
    case "average":
      return "average";
    default:
      return "poor";
  }
}

export function scoreColor(score) {
  if (score >= 75) return "#16A34A"; // green
  if (score >= 45) return "#D97706"; // yellow/amber
  return "#DC2626"; // red
}

export const METRIC_LABELS = {
  noise: "Noise Level",
  blur: "Blur Score",
  sharpness: "Sharpness",
  brightness: "Brightness",
  contrast: "Contrast",
  compression: "Compression Artifacts",
  entropy: "Entropy",
};
