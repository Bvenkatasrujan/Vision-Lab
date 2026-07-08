import base64
import cv2
import numpy as np

def base64_to_cv2(b64_str: str) -> np.ndarray:
    """
    Converts a base64 encoded image string (with or without data URI header)
    into a OpenCV/NumPy BGR image.
    """
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]
    
    img_data = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image from base64 string")
    return img

def cv2_to_base64(img: np.ndarray, format_ext: str = "png") -> str:
    """
    Converts a OpenCV/NumPy image into a base64 Data URI string.
    """
    ext = format_ext.lower().replace("image/", "")
    if ext not in ["png", "jpg", "jpeg", "webp"]:
        ext = "png"
        
    dot_ext = f".{ext}"
    success, buffer = cv2.imencode(dot_ext, img)
    if not success:
        raise ValueError("Could not encode image to base64")
        
    b64_bytes = base64.b64encode(buffer)
    b64_str = b64_bytes.decode("utf-8")
    
    mime = "image/png"
    if ext in ["jpg", "jpeg"]:
        mime = "image/jpeg"
    elif ext == "webp":
        mime = "image/webp"
        
    return f"data:{mime};base64,{b64_str}"
