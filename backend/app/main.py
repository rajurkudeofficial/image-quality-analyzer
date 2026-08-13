"""
Digital Image Quality Analyzer — FastAPI Backend
==================================================

Entry point. Wires up CORS, static file serving for enhanced images,
routers, and global error handling.

Run with:
    uvicorn app.main:app --reload --port 8000
"""
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import CORS_ORIGINS, ENHANCED_DIR
from app.routers import analyze, compare, enhance

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("main")

app = FastAPI(
    title="Digital Image Quality Analyzer API",
    description=(
        "AI-powered image quality analysis and enhancement API. "
        "Evaluates resolution, noise, blur, sharpness, brightness, contrast, "
        "compression artifacts, and entropy, then enhances images using "
        "Real-ESRGAN (or a classical fallback) and reports the improvement."
    ),
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server (and configured production origins)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static file serving for enhanced images so the frontend can <img src=...>
# and download them directly.
# ---------------------------------------------------------------------------
app.mount("/enhanced", StaticFiles(directory=str(ENHANCED_DIR)), name="enhanced")

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(analyze.router, tags=["Analysis"])
app.include_router(enhance.router, tags=["Enhancement"])
app.include_router(compare.router, tags=["Comparison"])


@app.get("/", tags=["Health"])
async def root():
    """Basic health check / API landing endpoint."""
    return {
        "service": "Digital Image Quality Analyzer API",
        "status": "online",
        "docs": "/docs",
        "endpoints": ["/analyze", "/enhance", "/compare"],
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Global error handling — ensure unhandled exceptions still return clean JSON
# instead of leaking stack traces to the frontend.
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred while processing the image."},
    )
