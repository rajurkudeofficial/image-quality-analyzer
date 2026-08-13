"""
POST /enhance

Accepts an uploaded image, runs it through the AI enhancement pipeline
(Real-ESRGAN when available, classical fallback otherwise), saves the
result, and returns a URL the frontend can use to display/download it.
"""
import logging

from fastapi import APIRouter, File, UploadFile

from app.config import ENHANCED_DIR
from app.services.enhancer import enhance_image
from app.utils.image_io import bytes_to_bgr, save_bgr_image, validate_upload

logger = logging.getLogger("enhance_router")
router = APIRouter()


@router.post("/enhance")
async def enhance(file: UploadFile = File(...)):
    """
    Enhance an uploaded image using AI super-resolution and return the
    saved file's URL plus which backend produced it.
    """
    content = await file.read()
    validate_upload(file, content)

    img_bgr = bytes_to_bgr(content)
    original_h, original_w = img_bgr.shape[:2]

    logger.info("Enhancing '%s' (%dx%d)", file.filename, original_w, original_h)

    enhanced_bgr, backend_used = enhance_image(img_bgr)
    enhanced_h, enhanced_w = enhanced_bgr.shape[:2]

    filename, _ = save_bgr_image(enhanced_bgr, ENHANCED_DIR, suffix="png")

    return {
        "enhanced_image_url": f"/enhanced/{filename}",
        "backend_used": backend_used,
        "original_dimensions": {"width": original_w, "height": original_h},
        "enhanced_dimensions": {"width": enhanced_w, "height": enhanced_h},
    }
