import math
import cv2
import numpy as np
from utils.cv_helpers import cv2_to_base64

def process_contour_segmentation(img: np.ndarray, params):
    """
    Performs binary thresholding, detects contours, filters them by area constraints,
    draws overlays of boundaries + bounding boxes with indices, and computes geometric statistics.
    """
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 1. Apply thresholding to create binary image
    _, binary = cv2.threshold(gray, params.threshold_value, 255, cv2.THRESH_BINARY)
    
    # 2. Find contours
    contours, hierarchy = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Copy image to draw annotations
    annotated = img.copy()
    
    objects_list = []
    object_id = 1
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        
        # Filter by area constraints
        if area < params.min_area or area > params.max_area:
            continue
            
        perimeter = cv2.arcLength(cnt, True)
        
        # Centroid calculation using moments
        M = cv2.moments(cnt)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
        else:
            cx, cy = w // 2, h // 2
            
        # Bounding box
        x, y, bw, bh = cv2.boundingRect(cnt)
        
        # Circularity: 4 * pi * area / (perimeter^2)
        circularity = 0.0
        if perimeter > 0:
            circularity = (4 * math.pi * area) / (perimeter ** 2)
            
        # Add to objects list
        objects_list.append({
            "id": object_id,
            "area": float(area),
            "perimeter": float(perimeter),
            "centroid": [cx, cy],
            "bbox": [x, y, bw, bh],
            "circularity": float(circularity)
        })
        
        # Draw green contour boundary
        cv2.drawContours(annotated, [cnt], -1, (0, 255, 0), 2)
        
        # Draw red bounding box
        cv2.rectangle(annotated, (x, y), (x + bw, y + bh), (0, 0, 255), 2)
        
        # Draw ID text near bounding box
        cv2.putText(
            annotated,
            f"#{object_id}",
            (x, max(12, y - 5)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 255, 0),
            1,
            cv2.LINE_AA
        )
        
        object_id += 1

    b64_str = cv2_to_base64(annotated)
    
    return {
        "segmentedImage": b64_str,
        "contourCount": len(objects_list),
        "objects": objects_list
    }
