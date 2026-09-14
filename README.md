# Digital Image Quality Analyzer

## Live - https://rajurkudeofficial.github.io/image-quality-analyzer/

An AI-powered image quality analysis and enhancement platform. Upload an
image, get a 10-point quality report (resolution, noise, blur, sharpness,
brightness, contrast, compression artifacts, entropy, color statistics,
and an overall 0–100 score), then let AI enhance it and compare before vs.
after with interactive charts.

**Frontend:** React + Vite + Tailwind CSS · **Backend:** FastAPI + OpenCV + Real-ESRGAN

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Real-ESRGAN Setup (optional but recommended)](#real-esrgan-setup-optional-but-recommended)
- [API Reference](#api-reference)
- [How the Metrics Are Calculated](#how-the-metrics-are-calculated)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Features

- Drag-and-drop upload (PNG, JPG, JPEG, WEBP — up to 20MB)
- Full quality report: resolution, noise, blur, sharpness, brightness,
  contrast, JPEG compression artifacts, entropy, color statistics
- Weighted overall quality score (0–100) with a color-coded circular gauge
- AI enhancement via Real-ESRGAN, with an automatic classical CV fallback
  so the app works even without a GPU or downloaded model weights
- Side-by-side original vs. enhanced comparison with zoom-on-hover
- Bar chart, radar chart, line chart, and RGB histogram (Recharts)
- Plain-language recommendations ("Image is slightly blurred...",
  "Compression artifacts detected...", etc.)
- Toast notifications, loading skeletons, and graceful error handling
- Clean, documented, modular code — no framework magic

---

## Project Structure

```
image-quality-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, static files, routing
│   │   ├── config.py                # Central settings (paths, weights, limits)
│   │   ├── routers/
│   │   │   ├── analyze.py           # POST /analyze
│   │   │   ├── enhance.py           # POST /enhance
│   │   │   └── compare.py           # POST /compare
│   │   ├── services/
│   │   │   ├── analyzer.py          # All quality-metric math (OpenCV/skimage)
│   │   │   └── enhancer.py          # Real-ESRGAN + classical fallback
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic response models
│   │   └── utils/
│   │       └── image_io.py          # Upload validation, decode/encode helpers
│   ├── scripts/
│   │   └── download_weights.sh      # Fetches Real-ESRGAN model weights
│   ├── uploads/                     # Runtime scratch space (gitignored)
│   ├── enhanced/                    # Saved enhanced images, served at /enhanced
│   ├── weights/                     # Real-ESRGAN .pth weights go here
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.jsx                 # React entry point
    │   ├── App.jsx                  # Router + layout shell
    │   ├── index.css                # Tailwind + design-system utility classes
    │   ├── pages/
    │   │   ├── Home.jsx             # Landing page
    │   │   ├── Analyze.jsx          # Upload + processing flow
    │   │   ├── Results.jsx          # Full quality report page
    │   │   └── About.jsx            # Methodology explainer
    │   ├── components/
    │   │   ├── Navbar.jsx / Footer.jsx
    │   │   ├── UploadDropzone.jsx
    │   │   ├── MetricCard.jsx
    │   │   ├── QualityGauge.jsx
    │   │   ├── ImageCompareCard.jsx
    │   │   ├── skeletons/ResultsSkeleton.jsx
    │   │   └── charts/
    │   │       ├── ComparisonBarChart.jsx
    │   │       ├── QualityRadarChart.jsx
    │   │       ├── ImprovementLineChart.jsx
    │   │       └── RgbHistogramChart.jsx
    │   ├── context/AnalysisContext.jsx  # Shared upload/analysis state
    │   └── utils/
    │       ├── api.js               # Axios client
    │       ├── format.js            # Formatters, labels, color helpers
    │       └── metricIcons.js
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

---

## Quick Start

You'll need **Python 3.10+** and **Node.js 18+** installed.

```bash
# 1. Clone / unzip the project, then in one terminal:
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 2. In a second terminal:
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies API calls to
the backend on port 8000 automatically (see `vite.config.js`).

The interactive API docs are available at **http://localhost:8000/docs**.

---

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # optional — defaults work out of the box
uvicorn app.main:app --reload --port 8000
```

By default the backend runs with the **classical enhancement fallback**
(no GPU or model download required) so it works immediately. See below to
enable true Real-ESRGAN super-resolution.

> **Note on `torch` / `realesrgan` in requirements.txt:** these are heavy
> packages. If you only want to test the analysis pipeline (not AI
> enhancement) you can comment out `torch`, `torchvision`, `basicsr`, and
> `realesrgan` in `requirements.txt` before installing — the app detects
> their absence and automatically uses the classical fallback with zero
> configuration changes.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev       # development server on http://localhost:5173
npm run build      # production build to frontend/dist
npm run preview    # preview the production build locally
```

For a production deployment, serve `frontend/dist` behind the same
reverse proxy / domain as the backend (or set `CORS_ORIGINS` in the
backend `.env` to your frontend's origin).

---

## Real-ESRGAN Setup (optional but recommended)

The app works fully out of the box using a classical OpenCV enhancement
pipeline (Lanczos upscale → denoise → unsharp mask → CLAHE contrast).
To enable true AI super-resolution:

1. Install the full `requirements.txt`, including `torch`, `basicsr`,
   and `realesrgan`. For GPU acceleration, install the CUDA build of
   PyTorch that matches your system from
   [pytorch.org/get-started/locally](https://pytorch.org/get-started/locally/)
   **before** installing `requirements.txt`, so pip doesn't pull the
   CPU-only wheel.
2. Download the model weights:
   ```bash
   bash backend/scripts/download_weights.sh
   ```
   This saves `RealESRGAN_x4plus.pth` (~64MB) to `backend/app/weights/`.
3. Restart the backend. `ENHANCEMENT_BACKEND=auto` (the default) will
   detect the installed libraries and weights and automatically switch
   to Real-ESRGAN — no code changes needed. You can force a backend via
   the `.env` file:
   ```
   ENHANCEMENT_BACKEND=realesrgan   # force AI backend (errors if unavailable... falls back safely)
   ENHANCEMENT_BACKEND=classical    # force the lightweight fallback
   ```

The `/compare` and `/enhance` API responses always include a
`backend_used` field (`"realesrgan"` or `"classical"`) so the frontend
can be transparent about which engine produced a given result.

---

## API Reference

### `POST /analyze`
Analyze a single image. Multipart form field: `file`.
Returns the full metric report (see [How the Metrics Are Calculated](#how-the-metrics-are-calculated)).

### `POST /enhance`
Enhance a single image. Multipart form field: `file`.
```json
{
  "enhanced_image_url": "/enhanced/<uuid>.png",
  "backend_used": "realesrgan",
  "original_dimensions": { "width": 640, "height": 480 },
  "enhanced_dimensions": { "width": 2560, "height": 1920 }
}
```

### `POST /compare`
The primary endpoint used by the dashboard: analyze → enhance → re-analyze
→ diff. Multipart form field: `file`.
```json
{
  "original": { "...": "full analyze report" },
  "enhanced": { "...": "full analyze report" },
  "improvement_percentages": {
    "noise": 12.4, "blur": -76.5, "sharpness": 62.1,
    "brightness": 4.5, "contrast": -3.6, "compression": -9.4,
    "entropy": -0.7, "overall_score": -2.7
  },
  "enhanced_image_url": "/enhanced/<uuid>.png",
  "backend_used": "classical",
  "filename": "photo.jpg"
}
```

Full interactive schemas are always available at `/docs` (Swagger UI) or
`/redoc` while the backend is running.

---

## How the Metrics Are Calculated

| Metric | Method |
|---|---|
| Resolution | Image width × height from the decoded array |
| Noise | Immerkaer's fast Laplacian-mask noise-sigma estimator |
| Blur | Variance of the Laplacian (lower = blurrier) |
| Sharpness | Mean Sobel gradient magnitude |
| Brightness | Mean of the HSV value channel |
| Contrast | Standard deviation of grayscale intensities |
| Compression Artifacts | Blockiness ratio across 8×8 JPEG grid boundaries vs. non-boundary pixels |
| Entropy | Shannon entropy of the grayscale image (`skimage.measure.shannon_entropy`) |
| Overall Score | Weighted blend of all normalized (0–100) sub-scores — weights configurable in `app/config.py` |

Each raw metric is normalized to a 0–100 "goodness" scale (see
`normalize_*` functions in `app/services/analyzer.py`) and labeled
**Good** (≥75), **Average** (45–74), or **Poor** (<45).

> **A note on blur vs. sharpness:** these two metrics can diverge after
> denoising-heavy enhancement — a smoothing step can lower Laplacian
> variance (blur score) even while Sobel-based edge sharpness improves.
> Both are shown so you can cross-check rather than rely on one number.

---

## Configuration

All tunable values live in `backend/app/config.py`:

- `MAX_UPLOAD_SIZE_MB` — default 20
- `ALLOWED_EXTENSIONS` — `.png`, `.jpg`, `.jpeg`, `.webp`
- `QUALITY_WEIGHTS` — the weighting of each sub-score in the overall score
- `ENHANCEMENT_BACKEND` — `auto` / `realesrgan` / `classical`
- `CORS_ORIGINS` — comma-separated list, also settable via `.env`

---

## Troubleshooting

**"Can't reach the analysis server"** — make sure `uvicorn app.main:app`
is running on port 8000 and that `CORS_ORIGINS` includes your frontend's
origin.

**Enhancement is slow** — the classical fallback runs on CPU and is fast;
Real-ESRGAN on CPU (no CUDA) is much slower per image. For production use
with Real-ESRGAN, a CUDA-capable GPU is strongly recommended.

**`ModuleNotFoundError: basicsr` / `realesrgan`** — these are only needed
for the AI backend. The app runs fine without them (classical fallback);
install them plus `torch`/`torchvision` if you want Real-ESRGAN.

**Large uploads rejected** — the 20MB limit is enforced both client-side
(`UploadDropzone.jsx`) and server-side (`image_io.validate_upload`).
Adjust `MAX_UPLOAD_SIZE_MB` in `config.py` if you need a higher limit.

---

## License

MIT — use this freely as a starting point for your own projects.
