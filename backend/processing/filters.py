import cv2
import numpy as np

def process_general_filters(img: np.ndarray, params) -> np.ndarray:
    """
    Unified filters handler executing operations in Filtering, Thresholding, Edge Detection,
    or Morphological processing based on parameters.
    """
    category = params.category
    out = img.copy()
    
    # Pre-calculate grayscale since Edge detection & Thresholding need it
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    if category == "filtering":
        ksize = params.filter_kernel_size
        # Ensure ksize is odd where needed
        if ksize % 2 == 0:
            ksize += 1
            
        if params.filter_type == "box":
            out = cv2.blur(out, (ksize, ksize))
        elif params.filter_type == "gaussian":
            out = cv2.GaussianBlur(out, (ksize, ksize), params.filter_sigma)
        elif params.filter_type == "median":
            out = cv2.medianBlur(out, ksize)
        elif params.filter_type == "bilateral":
            d = ksize
            out = cv2.bilateralFilter(out, d, params.filter_sigma * 10, params.filter_sigma * 10)
        elif params.filter_type == "laplacian":
            lap = cv2.Laplacian(gray, cv2.CV_64F, ksize=ksize)
            lap = np.uint8(np.absolute(lap))
            out = cv2.cvtColor(lap, cv2.COLOR_GRAY2BGR)
        elif params.filter_type == "custom":
            if params.custom_kernel:
                kernel = np.array(params.custom_kernel, dtype=np.float32)
                # Normalize custom kernel if requested, or apply directly
                out = cv2.filter2D(out, -1, kernel)

    elif category == "thresholding":
        ttype = params.threshold_type
        val = params.threshold_value
        max_val = params.threshold_max_value
        
        if ttype == "binary":
            _, thresh = cv2.threshold(gray, val, max_val, cv2.THRESH_BINARY)
        elif ttype == "binary_inv":
            _, thresh = cv2.threshold(gray, val, max_val, cv2.THRESH_BINARY_INV)
        elif ttype == "trunc":
            _, thresh = cv2.threshold(gray, val, max_val, cv2.THRESH_TRUNC)
        elif ttype == "tozero":
            _, thresh = cv2.threshold(gray, val, max_val, cv2.THRESH_TOZERO)
        elif ttype == "otsu":
            _, thresh = cv2.threshold(gray, 0, max_val, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        elif ttype == "adaptive_mean":
            bsize = params.adaptive_block_size
            if bsize % 2 == 0: bsize += 1
            thresh = cv2.adaptiveThreshold(gray, max_val, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, bsize, params.adaptive_c)
        elif ttype == "adaptive_gaussian":
            bsize = params.adaptive_block_size
            if bsize % 2 == 0: bsize += 1
            thresh = cv2.adaptiveThreshold(gray, max_val, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, bsize, params.adaptive_c)
        else:
            thresh = gray
            
        out = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)

    elif category == "edges":
        etype = params.edge_type
        
        if etype == "sobel_x":
            sobx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            sobx = np.uint8(np.absolute(sobx))
            out = cv2.cvtColor(sobx, cv2.COLOR_GRAY2BGR)
        elif etype == "sobel_y":
            soby = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            soby = np.uint8(np.absolute(soby))
            out = cv2.cvtColor(soby, cv2.COLOR_GRAY2BGR)
        elif etype == "sobel_mag":
            sobx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            soby = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            mag = np.sqrt(sobx**2 + soby**2)
            mag = np.uint8(np.clip(mag, 0, 255))
            out = cv2.cvtColor(mag, cv2.COLOR_GRAY2BGR)
        elif etype == "laplacian":
            lap = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
            lap = np.uint8(np.absolute(lap))
            out = cv2.cvtColor(lap, cv2.COLOR_GRAY2BGR)
        elif etype == "canny":
            canny = cv2.Canny(gray, params.canny_threshold1, params.canny_threshold2)
            out = cv2.cvtColor(canny, cv2.COLOR_GRAY2BGR)

    elif category == "morphology":
        mtype = params.morph_type
        element_type = params.morph_element
        msize = params.morph_kernel_size
        
        if msize % 2 == 0:
            msize += 1
            
        # Get Structuring Element
        shape = cv2.MORPH_RECT
        if element_type == "cross":
            shape = cv2.MORPH_CROSS
        elif element_type == "ellipse":
            shape = cv2.MORPH_ELLIPSE
            
        kernel = cv2.getStructuringElement(shape, (msize, msize))
        
        if mtype == "erode":
            res = cv2.erode(gray, kernel)
        elif mtype == "dilate":
            res = cv2.dilate(gray, kernel)
        elif mtype == "open":
            res = cv2.morphologyEx(gray, kernel, cv2.MORPH_OPEN)
        elif mtype == "close":
            res = cv2.morphologyEx(gray, kernel, cv2.MORPH_CLOSE)
        elif mtype == "gradient":
            res = cv2.morphologyEx(gray, kernel, cv2.MORPH_GRADIENT)
        elif mtype == "tophat":
            res = cv2.morphologyEx(gray, kernel, cv2.MORPH_TOPHAT)
        elif mtype == "blackhat":
            res = cv2.morphologyEx(gray, kernel, cv2.MORPH_BLACKHAT)
        else:
            res = gray
            
        out = cv2.cvtColor(res, cv2.COLOR_GRAY2BGR)

    return out
