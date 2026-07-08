from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AcquireRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image string")
    name: str = Field("uploaded_image.png", description="Original filename")

class RepresentationRequest(BaseModel):
    image: str
    sampling_rate: int = Field(8, ge=2, le=64)
    quantization_bits: int = Field(8, ge=1, le=8)

class PreprocessRequest(BaseModel):
    image: str
    brightness: int = Field(0, ge=-100, le=100)
    contrast: int = Field(0, ge=-100, le=100)
    denoise_type: str = Field("none", description="none, gaussian, median, bilateral")
    denoise_strength: int = Field(3, ge=1, le=15)
    stretch_contrast: bool = False
    resize_width: int = Field(400, ge=10, le=2000)
    resize_height: int = Field(400, ge=10, le=2000)
    resize_enabled: bool = False
    rotation: int = Field(0, description="0, 90, 180, 270")

class ColorSpaceRequest(BaseModel):
    image: str
    target_space: str = Field("rgb", description="rgb, grayscale, binary, hsv, lab")
    binary_threshold: int = Field(127, ge=0, le=255)

class HistogramRequest(BaseModel):
    image: str
    equalize: bool = False
    channel: str = Field("intensity", description="intensity, red, green, blue")

class ProcessRequest(BaseModel):
    image: str
    category: str = Field("filtering", description="filtering, thresholding, edges, morphology")
    
    # Filtering params
    filter_type: str = Field("gaussian", description="box, gaussian, median, bilateral, laplacian, custom")
    filter_kernel_size: int = Field(3, ge=1, le=15)
    filter_sigma: float = Field(1.0, ge=0.1, le=10.0)
    custom_kernel: Optional[List[List[float]]] = None

    # Thresholding params
    threshold_type: str = Field("binary", description="binary, binary_inv, trunc, tozero, otsu, adaptive_mean, adaptive_gaussian")
    threshold_value: int = Field(127, ge=0, le=255)
    threshold_max_value: int = Field(255, ge=0, le=255)
    adaptive_block_size: int = Field(11, ge=3, le=99)
    adaptive_c: float = Field(2.0, ge=-20.0, le=20.0)

    # Edge detection params
    edge_type: str = Field("canny", description="sobel_x, sobel_y, sobel_mag, laplacian, canny")
    canny_threshold1: float = Field(100.0, ge=0.0, le=500.0)
    canny_threshold2: float = Field(200.0, ge=0.0, le=500.0)

    # Morphology params
    morph_type: str = Field("erode", description="erode, dilate, open, close, gradient, tophat, blackhat")
    morph_element: str = Field("rect", description="rect, cross, ellipse")
    morph_kernel_size: int = Field(3, ge=1, le=21)

class SegmentationRequest(BaseModel):
    image: str
    threshold_value: int = Field(127, ge=0, le=255)
    min_area: float = Field(100.0, ge=0.0)
    max_area: float = Field(50000.0, ge=0.0)
    connectivity: int = Field(8, description="4 or 8")

class CompareRequest(BaseModel):
    original_image: str
    processed_image: str
    diff_type: str = Field("absolute", description="absolute, ssim")

class ExportRequest(BaseModel):
    original_image: str
    preprocessed_image: Optional[str] = None
    color_converted_image: Optional[str] = None
    processed_image: Optional[str] = None
    segmented_image: Optional[str] = None
    metadata: Dict[str, Any]
    parameters: Dict[str, Any]
    report_notes: str = ""
