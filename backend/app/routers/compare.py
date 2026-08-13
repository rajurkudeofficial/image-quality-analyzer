"""
POST /compare

The primary end-to-end endpoint used by the dashboard's "Analyze" flow:
  1. Analyze the original image.
  2. Enhance it (Real-ESRGAN or classical fallback).
  3. Analyze the enhanced image.
  4. Compute percentage improvement per metric.
  5. Return everything the Results page needs in one response.
"""
import logging

from fastapi import APIRouter, File, UploadFile

from app.config import ENHANCED_DIR
from app.services.analyzer import analyze_image
from app.services.enhancer import enhance_image
from app.utils.image_io import (
    bytes_to_bgr,
    detect_format,
    save_bgr_image,
    validate_upload,
)

logger = logging.getLogger("compare_router")
router = APIRouter()

# Metrics for which improvement is computed on the *normalized* (0-100,
# higher-is-better) score — this covers every quality metric consistently.
COMPARABLE_METRICS = [
    "noise", "blur", "sharpness", "brightness",
    "contrast", "compression", "entropy",
]


def _pct_improvement(before: float, after: float) -> float:
    """
    Percentage improvement of `after` over `before`. Guards against
    division by zero when the original score was 0.
    """
    if before == 0:
        return 100.0 if after > 0 else 0.0
    return round(((after - before) / before) * 100, 1)


@router.post("/compare")
async def compare(file: UploadFile = File(...)):
    """
    Run the full analyze -> enhance -> re-analyze -> compare pipeline
    and return original metrics, enhanced metrics, and improvement
    percentages in a single response.
    """
    content = await file.read()
    validate_upload(file, content)

    original_bgr = bytes_to_bgr(content)
    fmt = detect_format(content, file.filename or "")

    logger.info("Comparing '%s' (%d bytes)", file.filename, len(content))

    # 1. Analyze original
    original_report = analyze_image(original_bgr, file_size_bytes=len(content), fmt=fmt)

    # 2. Enhance
    enhanced_bgr, backend_used = enhance_image(original_bgr)
    filename, full_path = save_bgr_image(enhanced_bgr, ENHANCED_DIR, suffix="png")
    enhanced_file_size = full_path.stat().st_size

    # 3. Analyze enhanced
    enhanced_report = analyze_image(enhanced_bgr, file_size_bytes=enhanced_file_size, fmt="PNG")

    # 4. Compute improvement percentages
    improvement_percentages = {}
    for metric in COMPARABLE_METRICS:
        before = original_report[metric]["normalized"]
        after = enhanced_report[metric]["normalized"]
        improvement_percentages[metric] = _pct_improvement(before, after)

    improvement_percentages["overall_score"] = _pct_improvement(
        original_report["overall_score"], enhanced_report["overall_score"]
    )

    return {
        "original": original_report,
        "enhanced": enhanced_report,
        "improvement_percentages": improvement_percentages,
        "enhanced_image_url": f"/enhanced/{filename}",
        "backend_used": backend_used,
        "filename": file.filename,
    }
