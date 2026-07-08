import cv2
import numpy as np
from utils.cv_helpers import cv2_to_base64

def process_histogram(img: np.ndarray, equalize: bool, channel: str):
    """
    Computes R, G, B, Grayscale, and Cumulative histograms.
    Optionally equalizes the image and returns the equalized version.
    """
    # 1. Convert to grayscale for intensity histogram
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. Compute individual histograms
    hist_gray = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten().tolist()
    
    b_channel, g_channel, r_channel = cv2.split(img)
    hist_b = cv2.calcHist([b_channel], [0], None, [256], [0, 256]).flatten().tolist()
    hist_g = cv2.calcHist([g_channel], [0], None, [256], [0, 256]).flatten().tolist()
    hist_r = cv2.calcHist([r_channel], [0], None, [256], [0, 256]).flatten().tolist()
    
    # 3. Compute Cumulative intensity histogram
    cumulative = np.cumsum(hist_gray).tolist()
    
    # 4. Handle Equalization preview
    equalized_img_b64 = None
    equalized_gray_hist = None
    
    if equalize:
        if len(img.shape) == 3:
            # For color images: Equalize the Luminance channel in YCrCb color space
            ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
            channels = list(cv2.split(ycrcb))
            channels[0] = cv2.equalizeHist(channels[0])
            eq_ycrcb = cv2.merge(channels)
            eq_img = cv2.cvtColor(eq_ycrcb, cv2.COLOR_YCrCb2BGR)
        else:
            eq_img = cv2.equalizeHist(gray)
            
        equalized_img_b64 = cv2_to_base64(eq_img)
        
        # Calculate grayscale histogram of the equalized image
        eq_gray = cv2.cvtColor(eq_img, cv2.COLOR_BGR2GRAY) if len(eq_img.shape) == 3 else eq_img
        equalized_gray_hist = cv2.calcHist([eq_gray], [0], None, [256], [0, 256]).flatten().tolist()

    return {
        "grayscale": hist_gray,
        "red": hist_r,
        "green": hist_g,
        "blue": hist_b,
        "cumulative": cumulative,
        "equalizedImage": equalized_img_b64,
        "equalizedGrayscale": equalized_gray_hist
    }
