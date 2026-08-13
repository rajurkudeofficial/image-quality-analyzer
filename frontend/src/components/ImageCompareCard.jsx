import React from "react";
import { Download, ZoomIn } from "lucide-react";
import { formatBytes, formatDimensions } from "../utils/format";

/**
 * Displays a single image (original or enhanced) in a large card with
 * zoom-on-hover, a metadata strip, and an optional download action.
 */
export default function ImageCompareCard({
  label,
  imageUrl,
  fileSize,
  width,
  height,
  format,
  accentBadge,
  downloadable = false,
  downloadFilename = "image.png",
}) {
  return (
    <div className="glass-card-solid overflow-hidden group">
      <div className="relative overflow-hidden bg-ink-100/50">
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-72 object-contain transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/0 via-ink-900/0 to-ink-900/0 group-hover:from-ink-900/10 transition-all duration-300 pointer-events-none" />
        <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-ink-900 shadow-soft">
          {label}
        </span>
        {accentBadge && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-accent text-white text-xs font-semibold shadow-soft">
            {accentBadge}
          </span>
        )}
        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur text-ink-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-soft">
          <ZoomIn className="h-4 w-4" />
        </span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[11px] text-ink-500 font-medium uppercase tracking-wide">Size</p>
            <p className="text-sm font-semibold text-ink-900 mt-0.5">{formatBytes(fileSize)}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-500 font-medium uppercase tracking-wide">Dimensions</p>
            <p className="text-sm font-semibold text-ink-900 mt-0.5">{formatDimensions(width, height)}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-500 font-medium uppercase tracking-wide">Format</p>
            <p className="text-sm font-semibold text-ink-900 mt-0.5">{format || "—"}</p>
          </div>
        </div>

        {downloadable && (
          <a
            href={imageUrl}
            download={downloadFilename}
            className="btn-secondary w-full mt-4"
          >
            <Download className="h-4 w-4" />
            Download Enhanced Image
          </a>
        )}
      </div>
    </div>
  );
}
