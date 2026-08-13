"""
Pydantic response models. Defined loosely (Dict/Any-friendly) because the
analyzer produces a naturally nested structure; these models exist mainly
to document the API's response shape in the auto-generated OpenAPI docs.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class MetricDetail(BaseModel):
    raw: float
    normalized: float
    status: str


class ResolutionInfo(BaseModel):
    width: int
    height: int
    megapixels: float


class FileInfo(BaseModel):
    size_bytes: int
    size_kb: Optional[float] = None
    size_mb: Optional[float] = None
    format: str


class AnalyzeResponse(BaseModel):
    resolution: ResolutionInfo
    noise: MetricDetail
    blur: MetricDetail
    sharpness: MetricDetail
    brightness: MetricDetail
    contrast: MetricDetail
    compression: MetricDetail
    entropy: MetricDetail
    overall_score: float
    overall_status: str
    color_statistics: Dict[str, Any]
    file_info: FileInfo
    recommendations: List[str]


class EnhanceResponse(BaseModel):
    enhanced_image_url: str
    backend_used: str
    original_dimensions: Dict[str, int]
    enhanced_dimensions: Dict[str, int]


class CompareResponse(BaseModel):
    original: AnalyzeResponse
    enhanced: AnalyzeResponse
    improvement_percentages: Dict[str, float]
    enhanced_image_url: str
    backend_used: str
