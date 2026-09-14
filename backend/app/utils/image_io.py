"""
Image loading, validation, and persistence helpers shared across routers.
"""
from __future__ import annotations

import io
import uuid
from pathlib import Path
from typing import Tuple

import cv2
import numpy as np
from fastapi import HTTPException, UploadFile
from PIL import Image

from app.config import (
    ALLOWED_CONTENT_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_IMAGE_PIXELS,
    MAX_UPLOAD_SIZE_BYTES,
)


def validate_upload(file: UploadFile, content: bytes) -> None:
    """Raise HTTPException if the uploaded file fails format/size checks."""
    ext = Path(file.filename or "").suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: PNG, JPG, JPEG, WEBP.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type '{file.content_type}'. Allowed: PNG, JPG, JPEG, WEBP.",
        )

    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(content) / (1024*1024):.1f} MB). Maximum allowed is 20 MB.",
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Check dimensions before OpenCV fully decodes the image. This prevents
    # very large compressed images from consuming excessive RAM on cloud hosts.
    try:
        with Image.open(io.BytesIO(content)) as im:
            width, height = im.size
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image dimensions. File may be corrupted.")

    if width * height > MAX_IMAGE_PIXELS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Image is too large ({width}x{height}). "
                f"Maximum supported resolution is {MAX_IMAGE_PIXELS:,} pixels."
            ),
        )


def bytes_to_bgr(content: bytes) -> np.ndarray:
    """Decode raw image bytes into an OpenCV BGR ndarray. Raises 400 on failure."""
    arr = np.frombuffer(content, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image. File may be corrupted.")
    return img


def detect_format(content: bytes, fallback_filename: str = "") -> str:
    """Best-effort detection of the actual image format via PIL."""
    try:
        with Image.open(io.BytesIO(content)) as im:
            return (im.format or "").upper() or Path(fallback_filename).suffix.lstrip(".").upper()
    except Exception:
        return Path(fallback_filename).suffix.lstrip(".").upper()


def save_bgr_image(img_bgr: np.ndarray, directory: Path, suffix: str = "png") -> Tuple[str, Path]:
    """Persist a BGR ndarray to disk with a unique filename. Returns (filename, full_path)."""
    filename = f"{uuid.uuid4().hex}.{suffix}"
    full_path = directory / filename
    cv2.imwrite(str(full_path), img_bgr)
    return filename, full_path


def bgr_to_png_bytes(img_bgr: np.ndarray) -> bytes:
    """Encode a BGR ndarray as PNG bytes (for streaming responses)."""
    success, buf = cv2.imencode(".png", img_bgr)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode enhanced image.")
    return buf.tobytes()
