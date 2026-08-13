import axios from "axios";

// In dev, Vite proxies /analyze, /enhance, /compare, /enhanced to the
// FastAPI backend (see vite.config.js), so relative paths work both in
// dev and in a same-origin production deployment behind a reverse proxy.
const client = axios.create({
  baseURL: "/",
  timeout: 120000, // enhancement can be slow, especially on CPU
});

/**
 * Run the full analyze -> enhance -> re-analyze -> compare pipeline.
 * @param {File} file
 * @param {(progress: number) => void} onUploadProgress
 */
export async function comparePipeline(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await client.post("/compare", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onUploadProgress && evt.total) {
        onUploadProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return data;
}

/** Analyze a single image without enhancement. */
export async function analyzeOnly(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Enhance a single image without a full comparison report. */
export async function enhanceOnly(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post("/enhance", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export function extractErrorMessage(error) {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.message === "Network Error") {
    return "Can't reach the analysis server. Make sure the backend is running on port 8000.";
  }
  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Try a smaller image or check the backend logs.";
  }
  return "Something went wrong while processing your image. Please try again.";
}

export default client;
