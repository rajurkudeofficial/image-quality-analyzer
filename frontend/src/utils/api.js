import axios from "axios";

// Local development uses Vite's proxy. Production points directly at the
// separately hosted FastAPI backend with VITE_API_URL.
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const client = axios.create({
  baseURL: API_URL || "/",
  timeout: 120000,
});

function resolveBackendUrl(value) {
  if (!value || !API_URL || !value.startsWith("/")) return value;
  return `${API_URL}${value}`;
}

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

  if (data.enhanced_image_url) {
    data.enhanced_image_url = resolveBackendUrl(data.enhanced_image_url);
  }

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
  if (data.enhanced_image_url) {
    data.enhanced_image_url = resolveBackendUrl(data.enhanced_image_url);
  }
  return data;
}

export function extractErrorMessage(error) {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.message === "Network Error") {
    return "Can't reach the analysis server. Make sure the backend is running and the API URL is configured.";
  }
  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Try a smaller image or check the backend logs.";
  }
  return "Something went wrong while processing your image. Please try again.";
}

export default client;
