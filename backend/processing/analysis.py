import cv2
import numpy as np
from skimage.metrics import structural_similarity
from utils.cv_helpers import cv2_to_base64

def compare_cv_images(orig: np.ndarray, proc: np.ndarray, diff_type: str):
    """
    Compares two images: original vs processed.
    Returns delta heatmap/map, SSIM index, MSE score, and changed pixel counts.
    """
    h, w = orig.shape[:2]
    
    # 1. Resize processed image to match original if they differ (for comparison safety)
    if proc.shape[:2] != (h, w):
        proc = cv2.resize(proc, (w, h), interpolation=cv2.INTER_LINEAR)
        
    # 2. Convert to grayscale for metrics
    orig_gray = cv2.cvtColor(orig, cv2.COLOR_BGR2GRAY)
    proc_gray = cv2.cvtColor(proc, cv2.COLOR_BGR2GRAY)
    
    # 3. Compute Mean Squared Error (MSE)
    mse = float(np.mean((orig_gray.astype(np.float64) - proc_gray.astype(np.float64)) ** 2))
    
    # 4. Compute Absolute Difference & Threshold
    abs_diff = cv2.absdiff(orig_gray, proc_gray)
    _, thresh_diff = cv2.threshold(abs_diff, 10, 255, cv2.THRESH_BINARY)
    pixel_diff_count = int(np.sum(thresh_diff > 0))
    
    # Default outputs
    ssim_score = 1.0
    diff_image = None
    
    # 5. Handle SSIM vs Absolute Difference mapping
    if diff_type == "ssim":
        # Compute Structural Similarity
        ssim_score, diff_map = structural_similarity(orig_gray, proc_gray, full=True)
        ssim_score = float(ssim_score)
        
        # diff_map ranges from -1 to 1 (1 = identical).
        # We invert it so differences stand out in bright cyan/red, and identical is dark.
        # scaled_diff = (1.0 - diff_map) * 127.5
        inverted_diff = np.uint8((1.0 - diff_map) * 127.5)
        
        # Colorize diff map for a premium visualization (e.g. JET colormap)
        # Apply colormap to see heat regions of difference
        color_diff = cv2.applyColorMap(inverted_diff, cv2.COLORMAP_HOT)
        diff_image = cv2_to_base64(color_diff)
    else:
        # Absolute difference colored map
        color_diff = cv2.applyColorMap(abs_diff, cv2.COLORMAP_JET)
        diff_image = cv2_to_base64(color_diff)
        
        # Calculate standard SSIM as metadata even in absolute mode
        ssim_score, _ = structural_similarity(orig_gray, proc_gray, full=True)
        ssim_score = float(ssim_score)

    return {
        "diffImage": diff_image,
        "ssimScore": ssim_score,
        "meanSquaredError": mse,
        "pixelDifferenceCount": pixel_diff_count
    }
