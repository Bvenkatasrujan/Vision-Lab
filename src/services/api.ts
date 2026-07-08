const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(endpoint: string, data: Record<string, any>): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Validate and get metadata of uploaded image
  async validateImage(base64Image: string, name: string): Promise<{
    valid: boolean;
    metadata: {
      name: string;
      size: number;
      width: number;
      height: number;
      format: string;
    };
  }> {
    return fetchJson("/api/acquire", { image: base64Image, name });
  },

  // Image Representation Downsampling & Quantization
  async getRepresentation(
    base64Image: string,
    samplingRate: number,
    quantizationBits: number
  ): Promise<{
    downsampledImage: string; // Base64
    pixelMatrix: number[][];
    samplingWidth: number;
    samplingHeight: number;
  }> {
    return fetchJson("/api/representation", {
      image: base64Image,
      sampling_rate: samplingRate,
      quantization_bits: quantizationBits,
    });
  },

  // Image Preprocessing (brightness, contrast, crop, resize, rotate, denoise)
  async preprocessImage(
    base64Image: string,
    params: {
      brightness: number;
      contrast: number;
      denoiseType: string;
      denoiseStrength: number;
      stretchContrast: boolean;
      resizeWidth: number;
      resizeHeight: number;
      resizeEnabled: boolean;
      rotation: number;
    }
  ): Promise<{
    processedImage: string; // Base64
    metadata: {
      width: number;
      height: number;
    };
  }> {
    return fetchJson("/api/preprocess", {
      image: base64Image,
      brightness: params.brightness,
      contrast: params.contrast,
      denoise_type: params.denoiseType,
      denoise_strength: params.denoiseStrength,
      stretch_contrast: params.stretchContrast,
      resize_width: params.resizeWidth,
      resize_height: params.resizeHeight,
      resize_enabled: params.resizeEnabled,
      rotation: params.rotation,
    });
  },

  // Color Space Conversion
  async convertColorSpace(
    base64Image: string,
    targetSpace: string,
    binaryThreshold: number
  ): Promise<{
    convertedImage: string; // Base64
  }> {
    return fetchJson("/api/color-space", {
      image: base64Image,
      target_space: targetSpace,
      binary_threshold: binaryThreshold,
    });
  },

  // Histogram calculation & Equalization
  async getHistogram(
    base64Image: string,
    equalize?: boolean,
    channel?: string
  ): Promise<{
    grayscale: number[];
    red: number[];
    green: number[];
    blue: number[];
    cumulative: number[];
    equalizedImage: string | null;
    equalizedGrayscale: number[] | null;
  }> {
    return fetchJson("/api/histogram", {
      image: base64Image,
      equalize,
      channel,
    });
  },

  // General Image Processing (Filters, Thresholds, Edges, Morphology)
  async processImage(
    base64Image: string,
    params: Record<string, any>
  ): Promise<{
    processedImage: string; // Base64
  }> {
    return fetchJson("/api/process", {
      image: base64Image,
      ...params,
    });
  },

  // Contours & Object Segmentation
  async segmentImage(
    base64Image: string,
    params: {
      thresholdValue: number;
      minArea: number;
      maxArea: number;
      connectivity: number;
    }
  ): Promise<{
    segmentedImage: string; // Base64 image with bounding boxes drawn
    contourCount: number;
    objects: Array<{
      id: number;
      area: number;
      perimeter: number;
      centroid: [number, number];
      bbox: [number, number, number, number];
      circularity: number;
    }>;
  }> {
    return fetchJson("/api/segmentation", {
      image: base64Image,
      threshold_value: params.thresholdValue,
      min_area: params.minArea,
      max_area: params.maxArea,
      connectivity: params.connectivity,
    });
  },

  // Compute Image Differences
  async compareImages(
    originalImage: string,
    processedImage: string,
    diffType: string
  ): Promise<{
    diffImage: string; // Base64 diff overlay
    ssimScore: number;
    meanSquaredError: number;
    pixelDifferenceCount: number;
  }> {
    return fetchJson("/api/compare", {
      original_image: originalImage,
      processed_image: processedImage,
      diff_type: diffType,
    });
  },

  // Export PDF Report (returns a Blob)
  async downloadReport(data: Record<string, any>): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/export/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },
};
