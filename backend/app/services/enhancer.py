"""
Image Enhancement Engine
=========================

Two backends are supported:

1. "realesrgan" — true AI super-resolution using Real-ESRGAN. Requires
   `torch`, `basicsr`, and `realesrgan` to be installed, model weights
   downloaded to app/weights/, and ideally a CUDA-capable GPU. This is
   the preferred path per the project spec.

2. "classical"  — a dependency-light OpenCV/PIL fallback that performs
   Lanczos upscaling + unsharp masking + mild denoising. It runs
   anywhere (CPU only, no model download) and is used automatically
   when the Real-ESRGAN stack or weights aren't available, so the
   product still works end-to-end out of the box.

`enhance_image()` auto-selects the best available backend unless the
caller forces one via app.config.ENHANCEMENT_BACKEND.
"""
from __future__ import annotations

import logging
from typing import Tuple

import cv2
import numpy as np

from app.config import (
    ENHANCEMENT_BACKEND,
    REALESRGAN_MODEL_NAME,
    REALESRGAN_SCALE,
    REALESRGAN_WEIGHTS_PATH,
)

logger = logging.getLogger("enhancer")

# ---------------------------------------------------------------------------
# Real-ESRGAN backend (lazy-loaded — heavy imports only happen if used)
# ---------------------------------------------------------------------------
_realesrgan_instance = None
_realesrgan_available: bool | None = None  # tri-state cache: None = not yet checked


def _check_realesrgan_available() -> bool:
    """
    Verify the Real-ESRGAN stack is importable AND weights exist on disk.
    Cached after first check to avoid repeated heavy import attempts.
    """
    global _realesrgan_available
    if _realesrgan_available is not None:
        return _realesrgan_available

    try:
        import torch  # noqa: F401
        from basicsr.archs.rrdbnet_arch import RRDBNet  # noqa: F401
        from realesrgan import RealESRGANer  # noqa: F401

        _realesrgan_available = REALESRGAN_WEIGHTS_PATH.exists()
        if not _realesrgan_available:
            logger.warning(
                "Real-ESRGAN libraries are installed but weights were not found at %s. "
                "Download them from the Real-ESRGAN releases page. Falling back to classical enhancement.",
                REALESRGAN_WEIGHTS_PATH,
            )
    except ImportError:
        logger.warning(
            "Real-ESRGAN stack (torch/basicsr/realesrgan) not installed. "
            "Falling back to classical enhancement. Install requirements.txt "
            "and download model weights to enable AI super-resolution."
        )
        _realesrgan_available = False

    return _realesrgan_available


def _get_realesrgan_instance():
    """Lazily construct and cache the RealESRGANer upsampler."""
    global _realesrgan_instance
    if _realesrgan_instance is not None:
        return _realesrgan_instance

    import torch
    from basicsr.archs.rrdbnet_arch import RRDBNet
    from realesrgan import RealESRGANer

    model = RRDBNet(
        num_in_ch=3, num_out_ch=3, num_feat=64,
        num_block=23, num_grow_ch=32, scale=REALESRGAN_SCALE,
    )
    _realesrgan_instance = RealESRGANer(
        scale=REALESRGAN_SCALE,
        model_path=str(REALESRGAN_WEIGHTS_PATH),
        model=model,
        tile=400,          # tile large images to bound memory usage
        tile_pad=10,
        pre_pad=0,
        half=torch.cuda.is_available(),  # fp16 only makes sense on GPU
    )
    return _realesrgan_instance


def _enhance_realesrgan(img_bgr: np.ndarray) -> np.ndarray:
    """Run Real-ESRGAN super-resolution on a BGR image. Returns BGR uint8."""
    upsampler = _get_realesrgan_instance()
    output, _ = upsampler.enhance(img_bgr, outscale=REALESRGAN_SCALE)
    return output


# ---------------------------------------------------------------------------
# Classical fallback backend
# ---------------------------------------------------------------------------

def _enhance_classical(img_bgr: np.ndarray, scale: int = 2) -> np.ndarray:
    """
    Dependency-light enhancement pipeline:
      1. Lanczos upscaling (highest quality interpolation OpenCV offers)
      2. Mild edge-preserving denoise
      3. Unsharp mask to recover perceived sharpness lost in upscaling
      4. Slight contrast/brightness normalization (CLAHE on luminance)
    """
    h, w = img_bgr.shape[:2]
    upscaled = cv2.resize(
        img_bgr, (w * scale, h * scale), interpolation=cv2.INTER_LANCZOS4
    )

    # Mild denoise that preserves edges better than a plain Gaussian blur
    denoised = cv2.bilateralFilter(upscaled, d=5, sigmaColor=35, sigmaSpace=35)

    # Unsharp mask: sharpened = original + (original - blurred) * amount
    blurred = cv2.GaussianBlur(denoised, (0, 0), sigmaX=2.0)
    sharpened = cv2.addWeighted(denoised, 1.5, blurred, -0.5, 0)

    # CLAHE (adaptive histogram equalization) on the L channel for a
    # gentle, natural-looking contrast boost without blowing out colors
    lab = cv2.cvtColor(sharpened, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
    l_eq = clahe.apply(l_ch)
    enhanced_lab = cv2.merge((l_eq, a_ch, b_ch))
    result = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    return result


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def enhance_image(img_bgr: np.ndarray) -> Tuple[np.ndarray, str]:
    """
    Enhance an image using the best available backend.

    Returns:
        (enhanced_bgr_image, backend_used) where backend_used is
        "realesrgan" or "classical" so the API/UI can report which
        engine actually produced the result.
    """
    backend = ENHANCEMENT_BACKEND

    if backend == "auto":
        backend = "realesrgan" if _check_realesrgan_available() else "classical"

    if backend == "realesrgan":
        if not _check_realesrgan_available():
            logger.warning("realesrgan backend requested but unavailable, using classical fallback.")
            return _enhance_classical(img_bgr), "classical"
        try:
            return _enhance_realesrgan(img_bgr), "realesrgan"
        except Exception as exc:  # pragma: no cover - hardware/runtime dependent
            logger.exception("Real-ESRGAN inference failed (%s); falling back to classical.", exc)
            return _enhance_classical(img_bgr), "classical"

    return _enhance_classical(img_bgr), "classical"
