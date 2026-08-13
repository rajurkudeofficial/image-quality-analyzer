import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ImageIcon, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { formatBytes } from "../utils/format";

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

export default function UploadDropzone({ file, previewUrl, onFileSelect, onClear }) {
  const [dragError, setDragError] = useState(null);

  const onDrop = useCallback(
    (accepted, rejected) => {
      setDragError(null);
      if (rejected?.length) {
        const reason = rejected[0]?.errors?.[0]?.code;
        const message =
          reason === "file-too-large"
            ? `File exceeds the ${MAX_SIZE_MB}MB limit.`
            : "Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP.";
        setDragError(message);
        toast.error(message);
        return;
      }
      if (accepted?.length) {
        onFileSelect(accepted[0]);
        toast.success("Image ready to analyze");
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
  });

  if (file && previewUrl) {
    return (
      <div className="glass-card p-4 animate-scale-in">
        <div className="relative rounded-xl overflow-hidden group">
          <img
            src={previewUrl}
            alt="Selected preview"
            className="w-full max-h-[420px] object-contain bg-ink-100/50 rounded-xl"
          />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-soft text-ink-700 hover:bg-white hover:text-danger transition-all opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="h-4 w-4 text-accent shrink-0" />
            <span className="text-sm font-medium text-ink-900 truncate">{file.name}</span>
          </div>
          <span className="text-xs text-ink-500 shrink-0 ml-3">{formatBytes(file.size)}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-accent bg-accent-50/60 scale-[1.01]"
            : "border-ink-300 bg-ink-100/30 hover:border-accent-300 hover:bg-accent-50/30"
        }`}
      >
        <input {...getInputProps()} />
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
            isDragActive ? "bg-accent scale-110" : "bg-white shadow-soft"
          }`}
        >
          <UploadCloud
            className={`h-7 w-7 transition-colors ${isDragActive ? "text-white" : "text-accent"}`}
            strokeWidth={1.8}
          />
        </div>
        <div>
          <p className="text-base font-semibold text-ink-900">
            {isDragActive ? "Drop your image here" : "Drag & drop your image here"}
          </p>
          <p className="text-sm text-ink-500 mt-1">
            or <span className="text-accent-700 font-medium">browse files</span> from your device
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          {["PNG", "JPG", "JPEG", "WEBP"].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 rounded-md bg-white text-[11px] font-semibold text-ink-500 border border-ink-100"
            >
              {fmt}
            </span>
          ))}
        </div>
        <p className="text-xs text-ink-500">Maximum file size: {MAX_SIZE_MB}MB</p>
      </div>
      {dragError && (
        <div className="flex items-center gap-2 mt-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4" />
          {dragError}
        </div>
      )}
    </div>
  );
}
