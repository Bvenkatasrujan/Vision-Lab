import cv2
import numpy as np

def process_preprocessing(img: np.ndarray, params) -> tuple[np.ndarray, int, int]:
    """
    Applies image preprocessing operations: resizing, denoising, contrast stretching,
    brightness, contrast, and rotation.
    """
    out = img.copy()
    
    # 1. Resize if enabled
    if params.resize_enabled:
        out = cv2.resize(out, (params.resize_width, params.resize_height), interpolation=cv2.INTER_LINEAR)
        
    # 2. Denoise / Smoothing filter
    if params.denoise_type == "gaussian":
        # Kernel size must be odd
        ksize = params.denoise_strength * 2 + 1
        out = cv2.GaussianBlur(out, (ksize, ksize), 0)
    elif params.denoise_type == "median":
        ksize = params.denoise_strength * 2 + 1
        out = cv2.medianBlur(out, ksize)
    elif params.denoise_type == "bilateral":
        # d, sigmaColor, sigmaSpace
        d = params.denoise_strength
        out = cv2.bilateralFilter(out, d, d * 15, d * 15)
        
    # 3. Brightness & Contrast
    # Formula: new_img = alpha * img + beta
    # contrast: -100 to 100 -> alpha: 0.0 to 3.0
    # brightness: -100 to 100 -> beta: -100 to 100
    alpha = 1.0
    if params.contrast > 0:
        alpha = 1.0 + (params.contrast / 50.0)
    elif params.contrast < 0:
        alpha = 1.0 + (params.contrast / 100.0) # Down to 0
        
    beta = params.brightness
    
    out = cv2.convertScaleAbs(out, alpha=alpha, beta=beta)
    
    # 4. Contrast Stretching (Min-Max Normalization)
    if params.stretch_contrast:
        # Check channels
        if len(out.shape) == 3:
            # Color image
            channels = cv2.split(out)
            stretched_channels = []
            for ch in channels:
                min_val, max_val, _, _ = cv2.minMaxLoc(ch)
                if max_val - min_val > 0:
                    stretched = cv2.normalize(ch, None, 0, 255, cv2.NORM_MINMAX)
                else:
                    stretched = ch
                stretched_channels.append(stretched)
            out = cv2.merge(stretched_channels)
        else:
            # Grayscale
            min_val, max_val, _, _ = cv2.minMaxLoc(out)
            if max_val - min_val > 0:
                out = cv2.normalize(out, None, 0, 255, cv2.NORM_MINMAX)

    # 5. Rotation
    if params.rotation == 90:
        out = cv2.rotate(out, cv2.ROTATE_90_CLOCKWISE)
    elif params.rotation == 180:
        out = cv2.rotate(out, cv2.ROTATE_180)
    elif params.rotation == 270:
        out = cv2.rotate(out, cv2.ROTATE_90_COUNTERCLOCKWISE)
        
    h, w = out.shape[:2]
    return out, w, h
