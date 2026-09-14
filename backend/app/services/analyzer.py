"""
Image Quality Analysis Engine
==============================

Implements every metric requested in the spec using standard, well
established computer-vision formulas. Every function operates on a
NumPy array (BGR, as produced by cv2.imread) and returns plain
Python floats so results serialize cleanly to JSON.

Metrics implemented:
    - Resolution / dimensions
    - Noise estimation (Laplacian-of-Gaussian based, per Immerkaer's method)
    - Blur (variance of Laplacian)
    - Sharpness (mean gradient magnitude, Sobel)
    - Brightness (mean pixel intensity, HSV V-channel)
    - Contrast (standard deviation of luminance)
    - JPEG compression artifact / blockiness score (8x8 grid discontinuity)
    - Shannon entropy
    - Color statistics (per-channel mean/std)
    - Overall weighted quality score (0-100)
"""
from __future__ import annotations

import math
from typing import Dict, Any

import cv2
import numpy as np

from app.config import QUALITY_WEIGHTS


# ---------------------------------------------------------------------------
# Individual metric functions
# ---------------------------------------------------------------------------

def get_resolution(img: np.ndarray) -> Dict[str, int]:
    """Return width/height/megapixels for the image."""
    h, w = img.shape[:2]
    return {"width": int(w), "height": int(h), "megapixels": round((w * h) / 1_000_000, 2)}


def estimate_noise(gray: np.ndarray) -> float:
    """
    Fast noise estimation using Immerkaer's method: convolve with a
    Laplacian-like mask designed to cancel out image structure while
    preserving noise, then take the mean absolute response.
    """
    h, w = gray.shape
    mask = np.array([[1, -2, 1], [-2, 4, -2], [1, -2, 1]], dtype=np.float64)
    conv = cv2.filter2D(gray.astype(np.float64), -1, mask)
    sigma = np.sum(np.abs(conv))
    sigma = sigma * math.sqrt(0.5 * math.pi) / (6 * (w - 2) * (h - 2))
    return float(sigma)


def blur_score(gray: np.ndarray) -> float:
    """Variance of the Laplacian; lower values indicate a blurrier image."""
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    return float(lap.var())


def sharpness_score(gray: np.ndarray) -> float:
    """Mean gradient magnitude via Sobel operators in x and y."""
    gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    magnitude = np.sqrt(gx ** 2 + gy ** 2)
    return float(np.mean(magnitude))


def brightness_score(img_bgr: np.ndarray) -> float:
    """Average intensity via the V channel of HSV, 0-255 scale."""
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    return float(np.mean(hsv[:, :, 2]))


def contrast_score(gray: np.ndarray) -> float:
    """Standard deviation of pixel intensities — a classic global contrast proxy."""
    return float(np.std(gray))


def compression_artifact_score(gray: np.ndarray) -> float:
    """Estimate JPEG blockiness from 8x8 grid-boundary discontinuities."""
    h, w = gray.shape
    gray_f = gray.astype(np.float64)

    boundary_diffs = []
    non_boundary_diffs = []

    for x in range(1, w - 1):
        col_diff = np.mean(np.abs(gray_f[:, x] - gray_f[:, x - 1]))
        if x % 8 == 0:
            boundary_diffs.append(col_diff)
        else:
            non_boundary_diffs.append(col_diff)

    for y in range(1, h - 1):
        row_diff = np.mean(np.abs(gray_f[y, :] - gray_f[y - 1, :]))
        if y % 8 == 0:
            boundary_diffs.append(row_diff)
        else:
            non_boundary_diffs.append(row_diff)

    if not boundary_diffs or not non_boundary_diffs:
        return 0.0

    boundary_mean = float(np.mean(boundary_diffs))
    non_boundary_mean = float(np.mean(non_boundary_diffs)) or 1e-6
    blockiness_ratio = boundary_mean / non_boundary_mean
    score = max(0.0, min(100.0, (blockiness_ratio - 1.0) * 100))
    return float(score)


def entropy_score(gray: np.ndarray) -> float:
    """Shannon entropy of an 8-bit grayscale image, in bits."""
    histogram = np.bincount(gray.ravel(), minlength=256).astype(np.float64)
    probabilities = histogram / gray.size
    probabilities = probabilities[probabilities > 0]
    return float(-np.sum(probabilities * np.log2(probabilities)))


def color_statistics(img_bgr: np.ndarray) -> Dict[str, Dict[str, float]]:
    """Per-channel (R, G, B) mean/std plus a 32-bin histogram."""
    b, g, r = cv2.split(img_bgr)
    stats = {}
    for name, channel in (("red", r), ("green", g), ("blue", b)):
        hist = cv2.calcHist([channel], [0], None, [32], [0, 256]).flatten()
        stats[name] = {
            "mean": round(float(np.mean(channel)), 2),
            "std": round(float(np.std(channel)), 2),
            "histogram": [int(v) for v in hist],
        }
    return stats


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------

def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def normalize_sharpness(raw: float) -> float:
    return _clamp((raw / 40.0) * 100)


def normalize_blur(raw: float) -> float:
    return _clamp((raw / 500.0) * 100)


def normalize_noise(raw_sigma: float) -> float:
    return _clamp(100 - (raw_sigma / 20.0) * 100)


def normalize_brightness(raw: float) -> float:
    deviation = abs(raw - 127.5)
    return _clamp(100 - (deviation / 127.5) * 100)


def normalize_contrast(raw: float) -> float:
    return _clamp((raw / 65.0) * 100)


def normalize_compression(raw_score: float) -> float:
    return _clamp(100 - raw_score)


def normalize_entropy(raw: float) -> float:
    return _clamp((raw / 8.0) * 100)


def status_label(normalized_score: float) -> str:
    if normalized_score >= 75:
        return "Good"
    if normalized_score >= 45:
        return "Average"
    return "Poor"


# ---------------------------------------------------------------------------
# Recommendation generator
# ---------------------------------------------------------------------------

def generate_recommendations(metrics: Dict[str, Any]) -> list[str]:
    """Produce plain-language recommendations from normalized metric scores."""
    notes: list[str] = []

    blur_norm = metrics["blur"]["normalized"]
    if blur_norm < 45:
        notes.append("Image is noticeably blurred. Consider re-capturing with a steadier hand or better focus.")
    elif blur_norm < 75:
        notes.append("Image is slightly blurred but usable.")
    else:
        notes.append("Image is sharp with minimal blur.")

    noise_norm = metrics["noise"]["normalized"]
    if noise_norm < 45:
        notes.append("Noise level is high, likely from low-light capture or high ISO.")
    elif noise_norm < 75:
        notes.append("Noise is moderate and mostly unnoticeable.")
    else:
        notes.append("Noise is low across the image.")

    brightness_norm = metrics["brightness"]["normalized"]
    if brightness_norm < 45:
        notes.append("Brightness is far from optimal — image may be under- or over-exposed.")
    else:
        notes.append("Brightness is close to optimal.")

    contrast_norm = metrics["contrast"]["normalized"]
    if contrast_norm < 45:
        notes.append("Contrast is low, giving the image a flat appearance.")
    else:
        notes.append("Contrast is healthy, giving the image good depth.")

    compression_norm = metrics["compression"]["normalized"]
    if compression_norm < 60:
        notes.append("Compression artifacts detected — visible blocking from JPEG encoding.")
    else:
        notes.append("Minimal compression artifacts detected.")

    entropy_norm = metrics["entropy"]["normalized"]
    if entropy_norm < 45:
        notes.append("Low detail/information content — image may lack texture or be overly uniform.")

    overall = metrics["overall_score"]
    if overall >= 75:
        notes.append(f"Overall quality is Good ({overall}/100).")
    elif overall >= 45:
        notes.append(f"Overall quality is Average ({overall}/100).")
    else:
        notes.append(f"Overall quality is Poor ({overall}/100) — enhancement is recommended.")

    return notes


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def analyze_image(img_bgr: np.ndarray, file_size_bytes: int = 0, fmt: str = "") -> Dict[str, Any]:
    """Run the full analysis pipeline and return a JSON-serializable report."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    raw_noise = estimate_noise(gray)
    raw_blur = blur_score(gray)
    raw_sharpness = sharpness_score(gray)
    raw_brightness = brightness_score(img_bgr)
    raw_contrast = contrast_score(gray)
    raw_compression = compression_artifact_score(gray)
    raw_entropy = entropy_score(gray)

    norm_noise = normalize_noise(raw_noise)
    norm_blur = normalize_blur(raw_blur)
    norm_sharpness = normalize_sharpness(raw_sharpness)
    norm_brightness = normalize_brightness(raw_brightness)
    norm_contrast = normalize_contrast(raw_contrast)
    norm_compression = normalize_compression(raw_compression)
    norm_entropy = normalize_entropy(raw_entropy)

    overall = (
        norm_sharpness * QUALITY_WEIGHTS["sharpness"]
        + norm_blur * QUALITY_WEIGHTS["blur"]
        + norm_noise * QUALITY_WEIGHTS["noise"]
        + norm_brightness * QUALITY_WEIGHTS["brightness"]
        + norm_contrast * QUALITY_WEIGHTS["contrast"]
        + norm_compression * QUALITY_WEIGHTS["compression"]
        + norm_entropy * QUALITY_WEIGHTS["entropy"]
    )
    overall = round(_clamp(overall), 1)

    metrics: Dict[str, Any] = {
        "resolution": get_resolution(img_bgr),
        "noise": {"raw": round(raw_noise, 3), "normalized": round(norm_noise, 1), "status": status_label(norm_noise)},
        "blur": {"raw": round(raw_blur, 3), "normalized": round(norm_blur, 1), "status": status_label(norm_blur)},
        "sharpness": {"raw": round(raw_sharpness, 3), "normalized": round(norm_sharpness, 1), "status": status_label(norm_sharpness)},
        "brightness": {"raw": round(raw_brightness, 3), "normalized": round(norm_brightness, 1), "status": status_label(norm_brightness)},
        "contrast": {"raw": round(raw_contrast, 3), "normalized": round(norm_contrast, 1), "status": status_label(norm_contrast)},
        "compression": {"raw": round(raw_compression, 3), "normalized": round(norm_compression, 1), "status": status_label(norm_compression)},
        "entropy": {"raw": round(raw_entropy, 3), "normalized": round(norm_entropy, 1), "status": status_label(norm_entropy)},
        "overall_score": overall,
        "overall_status": status_label(overall),
        "color_statistics": color_statistics(img_bgr),
        "file_info": {
            "size_bytes": file_size_bytes,
            "size_kb": round(file_size_bytes / 1024, 2) if file_size_bytes else None,
            "size_mb": round(file_size_bytes / (1024 * 1024), 3) if file_size_bytes else None,
            "format": fmt,
        },
    }

    metrics["recommendations"] = generate_recommendations(metrics)
    return metrics
