import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from io import BytesIO

from models.schemas import (
    AcquireRequest,
    RepresentationRequest,
    PreprocessRequest,
    ColorSpaceRequest,
    HistogramRequest,
    ProcessRequest,
    SegmentationRequest,
    CompareRequest,
    ExportRequest,
)

from utils.cv_helpers import base64_to_cv2, cv2_to_base64

# Import processing functions
from processing.representation import process_representation
from processing.preprocessing import process_preprocessing
from processing.colorspace import process_colorspace
from processing.histogram import process_histogram
from processing.filters import process_general_filters
from processing.segmentation import process_contour_segmentation
from processing.analysis import compare_cv_images
from reports.pdf_generator import generate_pdf_report

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "message": "FastAPI processing engine is online"}

@router.post("/acquire")
async def acquire_image(req: AcquireRequest):
    try:
        img = base64_to_cv2(req.image)
        h, w, c = img.shape
        size_bytes = len(req.image) * 3 // 4  # Estimate bytes from base64 length
        
        # Simple format inference
        fmt = "image/png"
        if "data:" in req.image:
            header = req.image.split(";")[0]
            fmt = header.replace("data:", "")
            
        return {
            "valid": True,
            "metadata": {
                "name": req.name,
                "size": size_bytes,
                "width": w,
                "height": h,
                "format": fmt,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

@router.post("/representation")
async def representation(req: RepresentationRequest):
    try:
        img = base64_to_cv2(req.image)
        result = process_representation(img, req.sampling_rate, req.quantization_bits)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/preprocess")
async def preprocess(req: PreprocessRequest):
    try:
        img = base64_to_cv2(req.image)
        processed_img, width, height = process_preprocessing(img, req)
        b64_str = cv2_to_base64(processed_img)
        return {
            "processedImage": b64_str,
            "metadata": {
                "width": width,
                "height": height
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/color-space")
async def color_space(req: ColorSpaceRequest):
    try:
        img = base64_to_cv2(req.image)
        converted_img = process_colorspace(img, req.target_space, req.binary_threshold)
        b64_str = cv2_to_base64(converted_img)
        return {"convertedImage": b64_str}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/histogram")
async def histogram(req: HistogramRequest):
    try:
        img = base64_to_cv2(req.image)
        result = process_histogram(img, req.equalize, req.channel)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/process")
async def process(req: ProcessRequest):
    try:
        img = base64_to_cv2(req.image)
        processed_img = process_general_filters(img, req)
        b64_str = cv2_to_base64(processed_img)
        return {"processedImage": b64_str}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/segmentation")
async def segmentation(req: SegmentationRequest):
    try:
        img = base64_to_cv2(req.image)
        result = process_contour_segmentation(img, req)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/compare")
async def compare(req: CompareRequest):
    try:
        orig = base64_to_cv2(req.original_image)
        proc = base64_to_cv2(req.processed_image)
        result = compare_cv_images(orig, proc, req.diff_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/export/report")
async def export_report(req: ExportRequest):
    try:
        pdf_bytes = generate_pdf_report(req)
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=VisionLab_Analysis_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
