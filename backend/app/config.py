"""
Application-wide configuration.

Centralizes constants so tuning the analyzer or swapping storage
locations never requires touching business logic.
"""
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
ENHANCED_DIR = BASE_DIR / "enhanced"
MODELS_DIR = BASE_DIR / "weights"

for _dir in (UPLOAD_DIR, ENHANCED_DIR, MODELS_DIR):
    _dir.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Upload constraints
# ---------------------------------------------------------------------------
MAX_UPLOAD_SIZE_MB = 20
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
# Keep decoded images bounded so CPU/RAM usage stays reasonable on small
# cloud instances. This is especially important because enhancement creates
# several temporary arrays and a 2x upscaled image.
MAX_IMAGE_PIXELS = 8_000_000
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,https://rajurkudeofficial.github.io"
).split(",")

# ---------------------------------------------------------------------------
# Enhancement engine
# ---------------------------------------------------------------------------
# "realesrgan"  -> requires torch + realesrgan + downloaded weights + (ideally) GPU
# "classical"   -> OpenCV/PIL based upscale+sharpen fallback, runs anywhere
ENHANCEMENT_BACKEND = os.getenv("ENHANCEMENT_BACKEND", "classical")  # auto | realesrgan | classical
REALESRGAN_MODEL_NAME = "RealESRGAN_x4plus"
REALESRGAN_SCALE = 4
REALESRGAN_WEIGHTS_PATH = MODELS_DIR / "RealESRGAN_x4plus.pth"
REALESRGAN_WEIGHTS_URL = (
    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"
)

# HuggingFace fallback (used only if explicitly configured with an API token)
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_ENHANCEMENT_MODEL = os.getenv(
    "HF_ENHANCEMENT_MODEL", "caidas/swin2SR-classical-sr-x4-64"
)

# ---------------------------------------------------------------------------
# Scoring weights — overall quality score is a weighted blend of normalized
# sub-scores. Weights sum to 1.0. Tune here without touching analyzer code.
# ---------------------------------------------------------------------------
QUALITY_WEIGHTS = {
    "sharpness": 0.20,
    "blur": 0.15,        # inverse contributor (less blur -> higher score)
    "noise": 0.15,       # inverse contributor (less noise -> higher score)
    "brightness": 0.10,
    "contrast": 0.15,
    "compression": 0.10,  # inverse contributor
    "entropy": 0.15,
}
