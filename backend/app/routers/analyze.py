"""
POST /analyze

Accepts an uploaded image and returns the full quality report:
resolution, noise, blur, sharpness, brightness, contrast, compression
artifacts, entropy, color statistics, overall score, and recommendations.
"""
from fastapi import APIRouter, File, UploadFile
import logging

from app.services.analyzer import analyze_image
from app.utils.image_io import bytes_to_bgr, detect_format, validate_upload

logger = logging.getLogger("analyze_router")
router = APIRouter()


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Analyze an uploaded image and return a full quality report as JSON.
    """
    content = await file.read()
    validate_upload(file, content)

    img_bgr = bytes_to_bgr(content)
    fmt = detect_format(content, file.filename or "")

    logger.info("Analyzing '%s' (%d bytes, format=%s)", file.filename, len(content), fmt)

    report = analyze_image(img_bgr, file_size_bytes=len(content), fmt=fmt)
    report["filename"] = file.filename
    return report
