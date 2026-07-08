import { create } from "zustand";
import {
  Stage,
  ImageMetadata,
  PipelineState,
  RepresentationParams,
  PreprocessingParams,
  ColorConversionParams,
  PixelAnalysisParams,
  HistogramParams,
  ImageProcessingParams,
  SegmentationParams,
  ComparisonParams,
  ExportParams,
} from "../types";

// Helper for stage ordering to keep track of pipeline limits
const STAGE_ORDER: Stage[] = [
  "home",
  "acquisition",
  "representation",
  "preprocessing",
  "color-conversion",
  "pixel-analysis",
  "histogram",
  "image-processing",
  "segmentation",
  "comparison",
  "export",
];

interface PipelineActions {
  setStage: (stage: Stage) => void;
  resetPipeline: () => void;
  setOriginalImage: (image: string | null, metadata: ImageMetadata | null) => void;
  
  // Specific setters for preprocessed state
  setPreprocessedImage: (image: string | null) => void;
  setColorConvertedImage: (image: string | null) => void;
  setProcessedImage: (image: string | null) => void;
  setSegmentedImage: (image: string | null) => void;
  
  // State setters
  updateRepresentationParams: (params: Partial<RepresentationParams>) => void;
  updatePreprocessingParams: (params: Partial<PreprocessingParams>) => void;
  updateColorConversionParams: (params: Partial<ColorConversionParams>) => void;
  updatePixelAnalysisParams: (params: Partial<PixelAnalysisParams>) => void;
  updateHistogramParams: (params: Partial<HistogramParams>) => void;
  updateImageProcessingParams: (params: Partial<ImageProcessingParams>) => void;
  updateSegmentationParams: (params: Partial<SegmentationParams>) => void;
  updateComparisonParams: (params: Partial<ComparisonParams>) => void;
  updateExportParams: (params: Partial<ExportParams>) => void;

  setRepresentationData: (data: PipelineState["representationData"]) => void;
  setHistogramData: (data: PipelineState["histogramData"]) => void;
  setSegmentationData: (data: PipelineState["segmentationData"]) => void;
  setComparisonData: (data: PipelineState["comparisonData"]) => void;
  setHoverColorDetails: (details: any | null) => void;
}

const initialParams = {
  representationParams: {
    samplingRate: 8,
    quantizationBits: 8,
    showPixelValues: false,
  },
  preprocessingParams: {
    brightness: 0,
    contrast: 0,
    denoiseType: "none" as const,
    denoiseStrength: 3,
    stretchContrast: false,
    resizeWidth: 400,
    resizeHeight: 400,
    resizeEnabled: false,
    rotation: 0 as const,
  },
  colorConversionParams: {
    targetSpace: "rgb" as const,
    binaryThreshold: 127,
  },
  pixelAnalysisParams: {
    selectedPixel: null,
    gridSize: 5 as const,
  },
  histogramParams: {
    equalize: false,
    channel: "intensity" as const,
  },
  imageProcessingParams: {
    category: "filtering" as const,
    filterType: "gaussian" as const,
    filterKernelSize: 3,
    filterSigma: 1.0,
    customKernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    thresholdType: "binary" as const,
    thresholdValue: 127,
    thresholdMaxValue: 255,
    adaptiveBlockSize: 11,
    adaptiveC: 2,
    edgeType: "canny" as const,
    cannyThreshold1: 100,
    cannyThreshold2: 200,
    morphType: "erode" as const,
    morphElement: "rect" as const,
    morphKernelSize: 3,
  },
  segmentationParams: {
    thresholdValue: 127,
    minArea: 100,
    maxArea: 50000,
    connectivity: 8 as const,
    showBoundingBoxes: true,
    selectedContourIndex: null,
  },
  comparisonParams: {
    sliderPosition: 50,
    viewMode: "split" as const,
    diffType: "absolute" as const,
  },
  exportParams: {
    includeMetadata: true,
    includeHistograms: true,
    includePixelMatrix: false,
    reportNotes: "",
  },
};

export const usePipelineStore = create<PipelineState & PipelineActions>((set) => ({
  // Initial state
  currentStage: "acquisition",
  maxStageReached: "acquisition",
  
  originalImage: null,
  metadata: null,
  
  preprocessedImage: null,
  colorConvertedImage: null,
  processedImage: null,
  segmentedImage: null,

  representationData: null,
  histogramData: null,
  segmentationData: null,
  comparisonData: null,
  hoverColorDetails: null,

  ...initialParams,

  // Actions
  setStage: (stage) =>
    set((state) => {
      const currentIndex = STAGE_ORDER.indexOf(state.maxStageReached);
      const newIndex = STAGE_ORDER.indexOf(stage);
      const maxStageReached = newIndex > currentIndex ? stage : state.maxStageReached;
      return { currentStage: stage, maxStageReached };
    }),

  resetPipeline: () =>
    set(() => ({
      currentStage: "acquisition",
      maxStageReached: "acquisition",
      originalImage: null,
      metadata: null,
      preprocessedImage: null,
      colorConvertedImage: null,
      processedImage: null,
      segmentedImage: null,
      representationData: null,
      histogramData: null,
      segmentationData: null,
      ...initialParams,
    })),

  setOriginalImage: (image, metadata) =>
    set((state) => {
      if (!image) {
        return {
          originalImage: null,
          metadata: null,
          preprocessedImage: null,
          colorConvertedImage: null,
          processedImage: null,
          segmentedImage: null,
          representationData: null,
          histogramData: null,
          segmentationData: null,
        };
      }
      
      // Auto advance to representation if we are setting image
      const nextStage = state.currentStage === "acquisition" ? "representation" : state.currentStage;
      const currentMaxIndex = STAGE_ORDER.indexOf(state.maxStageReached);
      const targetMaxIndex = STAGE_ORDER.indexOf("representation");
      const maxStageReached = targetMaxIndex > currentMaxIndex ? ("representation" as Stage) : state.maxStageReached;

      // Automatically reset downstream stages when a new image is loaded
      return {
        originalImage: image,
        metadata,
        currentStage: nextStage,
        maxStageReached,
        // Reset processed stages
        preprocessedImage: image, // Starts identical
        colorConvertedImage: null,
        processedImage: null,
        segmentedImage: null,
        representationData: null,
        histogramData: null,
        segmentationData: null,
      };
    }),

  setPreprocessedImage: (image) => set({ preprocessedImage: image }),
  setColorConvertedImage: (image) => set({ colorConvertedImage: image }),
  setProcessedImage: (image) => set({ processedImage: image }),
  setSegmentedImage: (image) => set({ segmentedImage: image }),

  updateRepresentationParams: (params) =>
    set((state) => ({
      representationParams: { ...state.representationParams, ...params },
    })),

  updatePreprocessingParams: (params) =>
    set((state) => ({
      preprocessingParams: { ...state.preprocessingParams, ...params },
    })),

  updateColorConversionParams: (params) =>
    set((state) => ({
      colorConversionParams: { ...state.colorConversionParams, ...params },
    })),

  updatePixelAnalysisParams: (params) =>
    set((state) => ({
      pixelAnalysisParams: { ...state.pixelAnalysisParams, ...params },
    })),

  updateHistogramParams: (params) =>
    set((state) => ({
      histogramParams: { ...state.histogramParams, ...params },
    })),

  updateImageProcessingParams: (params) =>
    set((state) => ({
      imageProcessingParams: { ...state.imageProcessingParams, ...params },
    })),

  updateSegmentationParams: (params) =>
    set((state) => ({
      segmentationParams: { ...state.segmentationParams, ...params },
    })),

  updateComparisonParams: (params) =>
    set((state) => ({
      comparisonParams: { ...state.comparisonParams, ...params },
    })),

  updateExportParams: (params) =>
    set((state) => ({
      exportParams: { ...state.exportParams, ...params },
    })),

  setRepresentationData: (representationData) => set({ representationData }),
  setHistogramData: (histogramData) => set({ histogramData }),
  setSegmentationData: (segmentationData) => set({ segmentationData }),
  setComparisonData: (comparisonData) => set({ comparisonData }),
  setHoverColorDetails: (hoverColorDetails) => set({ hoverColorDetails }),
}));
