import React, { createContext, useContext, useState, useCallback } from "react";
import { comparePipeline, extractErrorMessage } from "../utils/api";
import toast from "react-hot-toast";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | analyzing | done | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const selectFile = useCallback((newFile) => {
    setFile(newFile);
    setResult(null);
    setStatus("idle");
    setError(null);
    setProgress(0);
    if (newFile) {
      setPreviewUrl(URL.createObjectURL(newFile));
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!file) return;
    setStatus("uploading");
    setError(null);
    setProgress(0);

    try {
      const data = await comparePipeline(file, (pct) => {
        setProgress(pct);
        if (pct >= 100) setStatus("analyzing");
      });
      setResult(data);
      setStatus("done");
      toast.success("Analysis complete!");
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      setStatus("error");
      toast.error(message);
    }
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
  }, []);

  return (
    <AnalysisContext.Provider
      value={{
        file,
        previewUrl,
        result,
        status,
        progress,
        error,
        selectFile,
        runAnalysis,
        reset,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
