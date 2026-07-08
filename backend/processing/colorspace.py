import cv2
import numpy as np

def process_colorspace(img: np.ndarray, target_space: str, binary_threshold: int) -> np.ndarray:
    """
    Converts image to target color space.
    Returns a BGR image that can be rendered directly by web browers.
    """
    if target_space == "grayscale":
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Convert back to 3-channel BGR for consistent frontend preview
        return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        
    elif target_space == "binary":
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, binary_threshold, 255, cv2.THRESH_BINARY)
        return cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
        
    elif target_space == "hsv":
        # Returns HSV image. Interpreting HSV channels directly as RGB channels
        # provides a beautiful academic visualization of Hue, Saturation, and Value.
        return cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
    elif target_space == "lab":
        # Returns L*a*b* image, similarly pseudo-colored for browser rendering.
        return cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        
    return img # Default RGB/BGR
