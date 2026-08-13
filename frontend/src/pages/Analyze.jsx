import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import UploadDropzone from "../components/UploadDropzone.jsx";
import { useAnalysis } from "../context/AnalysisContext.jsx";

const PROCESSING_STAGES = [
  "Reading image data",
  "Measuring resolution & color",
  "Estimating noise & blur",
  "Running AI enhancement",
  "Comparing results",
];

export default function Analyze() {
  const navigate = useNavigate();
  const {
    file,
    previewUrl,
    status,
    progress,
    error,
    selectFile,
    runAnalysis,
    reset,
  } = useAnalysis();

  const isProcessing = status === "uploading" || status === "analyzing";

  useEffect(() => {
    if (status === "done") {
      navigate("/results");
    }
  }, [status, navigate]);

  const activeStageIndex = isProcessing
    ? Math.min(
        PROCESSING_STAGES.length - 1,
        Math.floor((progress / 100) * (PROCESSING_STAGES.length - 1)) +
          (status === "analyzing" ? 2 : 0)
      )
    : -1;

  return (
    <div className="section-container py-14 lg:py-20">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-accent-700 text-xs font-semibold mb-5">
          <Sparkles className="h-3.5 w-3.5" />
          Step 1 of 2
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900">
          Upload your image
        </h1>
        <p className="mt-3 text-ink-500">
          We'll analyze quality across 10 dimensions, then enhance it with AI.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <UploadDropzone
          file={file}
          previewUrl={previewUrl}
          onFileSelect={selectFile}
          onClear={reset}
        />

        {error && status === "error" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">Analysis failed</p>
              <p className="text-sm text-ink-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {isProcessing ? (
          <div className="glass-card-solid mt-6 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Loader2 className="h-5 w-5 text-accent animate-spin" />
              <span className="text-sm font-semibold text-ink-900">
                {status === "uploading" ? "Uploading image…" : "Analyzing & enhancing…"}
              </span>
              <span className="ml-auto text-sm font-medium text-ink-500 tabular-nums">
                {status === "uploading" ? `${progress}%` : ""}
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden mb-5">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
                style={{
                  width:
                    status === "uploading"
                      ? `${Math.max(4, progress)}%`
                      : "100%",
                  ...(status === "analyzing" && {
                    backgroundImage:
                      "linear-gradient(90deg, #2563EB 0%, #93B4FD 50%, #2563EB 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.6s infinite linear",
                  }),
                }}
              />
            </div>

            <ul className="space-y-2.5">
              {PROCESSING_STAGES.map((stage, i) => (
                <li key={stage} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      i <= activeStageIndex ? "bg-accent" : "bg-ink-300"
                    }`}
                  />
                  <span className={i <= activeStageIndex ? "text-ink-900 font-medium" : "text-ink-500"}>
                    {stage}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-500 mt-5 text-center">
              This can take up to a minute depending on image size and enhancement backend.
            </p>
          </div>
        ) : (
          <button
            onClick={runAnalysis}
            disabled={!file}
            className="btn-primary w-full mt-6 py-3.5 text-[15px]"
          >
            Analyze Image
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
