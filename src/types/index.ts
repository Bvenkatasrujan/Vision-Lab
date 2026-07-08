export type Stage =
  | "home"
  | "acquisition"
  | "representation"
  | "preprocessing"
  | "color-conversion"
  | "pixel-analysis"
  | "histogram"
  | "image-processing"
  | "segmentation"
  | "comparison"
  | "export";

export interface ImageMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

// Sub-sampling & quantization representation settings
export interface RepresentationParams {
  samplingRate: number; // e.g. 8 means take every 8th pixel
  quantizationBits: number; // 1 to 8 bits
  showPixelValues: boolean;
}

// Preprocessing stage parameters
export interface PreprocessingParams {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  denoiseType: "none" | "gaussian" | "median" | "bilateral";
  denoiseStrength: number; // 1 to 15
  stretchContrast: boolean;
  resizeWidth: number;
  resizeHeight: number;
  resizeEnabled: boolean;
  rotation: 0 | 90 | 180 | 270;
}

// Color conversion space options
export type ColorSpace = "rgb" | "grayscale" | "binary" | "hsv" | "lab";

export interface ColorConversionParams {
  targetSpace: ColorSpace;
  binaryThreshold: number; // 0 to 255
}

// Pixel analysis tracking
export interface PixelAnalysisParams {
  selectedPixel: { x: number; y: number } | null;
  gridSize: 3 | 5 | 7; // neighbor matrix size
}

// Histogram equalisation & selection
export interface HistogramParams {
  equalize: boolean;
  channel: "intensity" | "red" | "green" | "blue";
}

// Image processing: Filtering, Threshold, Edges, Morphology
export interface ImageProcessingParams {
  category: "filtering" | "thresholding" | "edges" | "morphology";
  
  // Filtering
  filterType: "box" | "gaussian" | "median" | "bilateral" | "laplacian" | "custom";
  filterKernelSize: number; // 3, 5, 7, 9
  filterSigma: number; // for Gaussian/Bilateral
  customKernel: number[][]; // 3x3 custom weights

  // Thresholding
  thresholdType: "binary" | "binary_inv" | "trunc" | "tozero" | "otsu" | "adaptive_mean" | "adaptive_gaussian";
  thresholdValue: number; // 0 to 255
  thresholdMaxValue: number; // 0 to 255
  adaptiveBlockSize: number; // 3, 5, 7, 11...
  adaptiveC: number;

  // Edge detection
  edgeType: "sobel_x" | "sobel_y" | "sobel_mag" | "laplacian" | "canny";
  cannyThreshold1: number;
  cannyThreshold2: number;

  // Morphology
  morphType: "erode" | "dilate" | "open" | "close" | "gradient" | "tophat" | "blackhat";
  morphElement: "rect" | "cross" | "ellipse";
  morphKernelSize: number;
}

// Segmentation parameters
export interface SegmentationParams {
  thresholdValue: number;
  minArea: number;
  maxArea: number;
  connectivity: 4 | 8;
  showBoundingBoxes: boolean;
  selectedContourIndex: number | null;
}

// Comparison view parameters
export interface ComparisonParams {
  sliderPosition: number; // 0 to 100
  viewMode: "side-by-side" | "split" | "difference";
  diffType: "absolute" | "ssim";
}

// Export parameters
export interface ExportParams {
  includeMetadata: boolean;
  includeHistograms: boolean;
  includePixelMatrix: boolean;
  reportNotes: string;
}

// Complete Pipeline state structure
export interface PipelineState {
  currentStage: Stage;
  maxStageReached: Stage;
  
  // Image buffers at various stages (Base64 data URLs)
  originalImage: string | null; // Acquired
  metadata: ImageMetadata | null;
  
  preprocessedImage: string | null; // Output of Module 4
  colorConvertedImage: string | null; // Output of Module 5
  processedImage: string | null; // Output of Module 8
  segmentedImage: string | null; // Output of Module 9
  
  // Individual stage parameters
  representationParams: RepresentationParams;
  preprocessingParams: PreprocessingParams;
  colorConversionParams: ColorConversionParams;
  pixelAnalysisParams: PixelAnalysisParams;
  histogramParams: HistogramParams;
  imageProcessingParams: ImageProcessingParams;
  segmentationParams: SegmentationParams;
  comparisonParams: ComparisonParams;
  exportParams: ExportParams;

  hoverColorDetails: any | null;

  // Analysis result data cached from API calls
  representationData: {
    downsampledImage: string;
    pixelMatrix: number[][]; // Downsampled numerical matrix
    samplingWidth: number;
    samplingHeight: number;
  } | null;
  
  histogramData: {
    grayscale: number[];
    red: number[];
    green: number[];
    blue: number[];
    cumulative: number[];
    equalizedImage: string | null;
    equalizedGrayscale: number[] | null;
  } | null;
  
  segmentationData: {
    segmentedImage: string;
    contourCount: number;
    objects: Array<{
      id: number;
      area: number;
      perimeter: number;
      centroid: [number, number];
      bbox: [number, number, number, number]; // x, y, w, h
      circularity: number;
    }>;
  } | null;

  comparisonData: {
    diffImage: string | null;
    ssimScore: number;
    meanSquaredError: number;
    pixelDifferenceCount: number;
  } | null;
}
