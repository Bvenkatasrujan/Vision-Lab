import cv2
import numpy as np
from utils.cv_helpers import cv2_to_base64

def process_representation(img: np.ndarray, sampling_rate: int, quantization_bits: int):
    """
    Downsamples the image by taking every Nth pixel (sampling_rate) and
    quantizes the values to 2^bits levels (quantization_bits).
    """
    h, w, c = img.shape
    
    # 1. Downsampling (spatial discretization)
    # Target size
    small_w = max(4, w // sampling_rate)
    small_h = max(4, h // sampling_rate)
    
    # Resize down using nearest neighbor to simulate spatial sampling
    img_sampled = cv2.resize(img, (small_w, small_h), interpolation=cv2.INTER_NEAREST)
    
    # 2. Quantization (amplitude discretization)
    # For B bits, there are 2^B levels.
    levels = 2 ** quantization_bits
    divisor = 256 // levels
    
    # Quantize by integer division and scaling back
    img_quantized = (img_sampled // divisor) * divisor
    
    # 3. Create a pixelated preview image by scaling it back up to original dimensions
    img_preview = cv2.resize(img_quantized, (w, h), interpolation=cv2.INTER_NEAREST)
    
    # 4. Extract numerical pixel matrix for frontend zoom exploration
    # To keep it readable on UI, let's extract a central grid of size up to 16x16
    grid_size_x = min(16, small_w)
    grid_size_y = min(16, small_h)
    
    start_x = (small_w - grid_size_x) // 2
    start_y = (small_h - grid_size_y) // 2
    
    sub_grid = img_quantized[start_y:start_y + grid_size_y, start_x:start_x + grid_size_x]
    
    # Convert sub-grid to single intensity value matrix (Grayscale equivalent)
    gray_grid = cv2.cvtColor(sub_grid, cv2.COLOR_BGR2GRAY)
    pixel_matrix = gray_grid.tolist()
    
    b64_str = cv2_to_base64(img_preview)
    
    return {
        "downsampledImage": b64_str,
        "pixelMatrix": pixel_matrix,
        "samplingWidth": grid_size_x,
        "samplingHeight": grid_size_y,
    }
