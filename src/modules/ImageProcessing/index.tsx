"use client";

import React, { useEffect, useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { Cpu, RefreshCw, ArrowRight, Grid } from "lucide-react";

export default function ImageProcessingModule() {
  const {
    preprocessedImage,
    colorConvertedImage,
    imageProcessingParams,
    processedImage,
    updateImageProcessingParams,
    setProcessedImage,
    setStage,
  } = usePipelineStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeImage = colorConvertedImage || preprocessedImage;

  // Destructure parameters
  const {
    category,
    filterType,
    filterKernelSize,
    filterSigma,
    customKernel,
    thresholdType,
    thresholdValue,
    thresholdMaxValue,
    adaptiveBlockSize,
    adaptiveC,
    edgeType,
    cannyThreshold1,
    cannyThreshold2,
    morphType,
    morphElement,
    morphKernelSize,
  } = imageProcessingParams;

  // Run image processing API call
  useEffect(() => {
    if (!activeImage) return;

    const executeProcessing = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const payload: Record<string, any> = { category };
        
        if (category === "filtering") {
          payload.filter_type = filterType;
          payload.filter_kernel_size = filterKernelSize;
          payload.filter_sigma = filterSigma;
          if (filterType === "custom") {
            payload.custom_kernel = customKernel;
          }
        } else if (category === "thresholding") {
          payload.threshold_type = thresholdType;
          payload.threshold_value = thresholdValue;
          payload.threshold_max_value = thresholdMaxValue;
          payload.adaptive_block_size = adaptiveBlockSize;
          payload.adaptive_c = adaptiveC;
        } else if (category === "edges") {
          payload.edge_type = edgeType;
          payload.canny_threshold1 = cannyThreshold1;
          payload.canny_threshold2 = cannyThreshold2;
        } else if (category === "morphology") {
          payload.morph_type = morphType;
          payload.morph_element = morphElement;
          payload.morph_kernel_size = morphKernelSize;
        }

        const result = await api.processImage(activeImage, payload);
        setProcessedImage(result.processedImage);
      } catch (err: any) {
        setError(err.message || "Failed to process image.");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      executeProcessing();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [
    activeImage,
    category,
    filterType,
    filterKernelSize,
    filterSigma,
    customKernel,
    thresholdType,
    thresholdValue,
    thresholdMaxValue,
    adaptiveBlockSize,
    adaptiveC,
    edgeType,
    cannyThreshold1,
    cannyThreshold2,
    morphType,
    morphElement,
    morphKernelSize,
  ]);

  // Handle custom kernel grid value change
  const handleKernelChange = (row: number, col: number, val: string) => {
    const parsed = parseFloat(val) || 0;
    const newKernel = customKernel.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? parsed : c))
    );
    updateImageProcessingParams({ customKernel: newKernel });
  };

  // Preset custom kernels
  const applyCustomKernelPreset = (type: "sharpen" | "ridge" | "emboss") => {
    if (type === "sharpen") {
      updateImageProcessingParams({
        customKernel: [
          [0, -1, 0],
          [-1, 5, -1],
          [0, -1, 0],
        ],
      });
    } else if (type === "ridge") {
      updateImageProcessingParams({
        customKernel: [
          [-1, -1, -1],
          [-1, 8, -1],
          [-1, -1, -1],
        ],
      });
    } else if (type === "emboss") {
      updateImageProcessingParams({
        customKernel: [
          [-2, -1, 0],
          [-1, 1, 1],
          [0, 1, 2],
        ],
      });
    }
  };

  // Original Viewport
  const originalView = activeImage ? (
    <img
      src={activeImage}
      alt="Processing Input"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No input image</span>
  );

  // Processed Viewport
  const processedView = isLoading ? (
    <div className="flex flex-col items-center gap-2 py-10">
      <RefreshCw className="w-6 h-6 text-[#2563eb] animate-spin" />
      <span className="text-xs text-[#6b7280] font-medium">Convolving kernel matrices...</span>
    </div>
  ) : error ? (
    <div className="text-center p-4 text-xs font-semibold text-red-500">{error}</div>
  ) : processedImage ? (
    <img
      src={processedImage}
      alt="Processed Output"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">Adjust settings to process</span>
  );

  // Render controls depending on category
  const renderCategoryControls = () => {
    switch (category) {
      case "filtering":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filter selection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#4b5563]">Spatial Convolution Filter</span>
              <select
                value={filterType}
                onChange={(e) => updateImageProcessingParams({ filterType: e.target.value as any })}
                className="bg-white border border-[#e5e7eb] rounded px-2.5 py-1.5 text-xs text-[#4b5563] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="box">Box Blur</option>
                <option value="gaussian">Gaussian Smooth</option>
                <option value="median">Median Blur</option>
                <option value="bilateral">Bilateral Filter</option>
                <option value="laplacian">Laplacian Derivative</option>
                <option value="custom">Custom 3x3 Kernel</option>
              </select>
              
              {filterType !== "custom" && filterType !== "laplacian" && (
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between text-[10px] text-[#6b7280] font-bold">
                    <span>Kernel Window Size</span>
                    <span className="text-[#2563eb]">{filterKernelSize} × {filterKernelSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="2"
                    value={filterKernelSize}
                    onChange={(e) => updateImageProcessingParams({ filterKernelSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Sigma / Parameters */}
            <div className="flex flex-col gap-2">
              {filterType === "gaussian" || filterType === "bilateral" ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#4b5563]">
                    <span>Standard Deviation (Sigma)</span>
                    <span className="text-[#2563eb]">{filterSigma}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="8.0"
                    step="0.1"
                    value={filterSigma}
                    onChange={(e) => updateImageProcessingParams({ filterSigma: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              ) : (
                <span className="text-[10px] text-[#6b7280] font-medium mt-6">
                  No additional spatial coefficients needed.
                </span>
              )}
            </div>

            {/* Custom Kernel Grid */}
            {filterType === "custom" && (
              <div className="flex flex-col gap-2 border border-[#e5e7eb] p-3 rounded-lg bg-[#f8fafc]">
                <span className="text-[10px] font-bold text-[#4b5563] flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5 text-[#2563eb]" /> Custom 3x3 Matrix
                </span>
                <div className="grid grid-cols-3 gap-1 w-36 mx-auto my-1">
                  {customKernel.map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <input
                        key={`${rIdx}-${cIdx}`}
                        type="number"
                        step="0.1"
                        value={val}
                        onChange={(e) => handleKernelChange(rIdx, cIdx, e.target.value)}
                        className="bg-white border border-[#e5e7eb] rounded py-0.5 px-1 text-center text-xs text-[#111827] font-bold focus:outline-none focus:border-[#2563eb]"
                      />
                    ))
                  )}
                </div>
                <div className="flex gap-1.5 justify-center mt-1">
                  <button
                    onClick={() => applyCustomKernelPreset("sharpen")}
                    className="px-2 py-0.5 rounded bg-white border border-[#e5e7eb] text-[9px] text-[#6b7280] hover:text-[#2563eb] cursor-pointer"
                  >
                    Sharpen
                  </button>
                  <button
                    onClick={() => applyCustomKernelPreset("ridge")}
                    className="px-2 py-0.5 rounded bg-white border border-[#e5e7eb] text-[9px] text-[#6b7280] hover:text-[#2563eb] cursor-pointer"
                  >
                    Edge
                  </button>
                  <button
                    onClick={() => applyCustomKernelPreset("emboss")}
                    className="px-2 py-0.5 rounded bg-white border border-[#e5e7eb] text-[9px] text-[#6b7280] hover:text-[#2563eb] cursor-pointer"
                  >
                    Emboss
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case "thresholding":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Threshold type */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#4b5563]">Segmentation Algorithm</span>
              <select
                value={thresholdType}
                onChange={(e) => updateImageProcessingParams({ thresholdType: e.target.value as any })}
                className="bg-white border border-[#e5e7eb] rounded px-2.5 py-1.5 text-xs text-[#4b5563] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="binary">Binary (Global)</option>
                <option value="binary_inv">Binary Inverse</option>
                <option value="trunc">Truncate</option>
                <option value="tozero">Threshold To Zero</option>
                <option value="otsu">Otsu's (Auto-Threshold)</option>
                <option value="adaptive_mean">Adaptive Mean (Local)</option>
                <option value="adaptive_gaussian">Adaptive Gaussian (Local)</option>
              </select>
            </div>

            {/* Threshold sliders (Global) */}
            {thresholdType !== "otsu" && !thresholdType.startsWith("adaptive") ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-[#4b5563]">
                    <span>Threshold Limit (T)</span>
                    <span className="text-[#2563eb]">{thresholdValue}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={thresholdValue}
                    onChange={(e) => updateImageProcessingParams({ thresholdValue: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-[#4b5563]">
                    <span>Maximum Value</span>
                    <span className="text-[#2563eb]">{thresholdMaxValue}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={thresholdMaxValue}
                    onChange={(e) => updateImageProcessingParams({ thresholdMaxValue: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            ) : thresholdType.startsWith("adaptive") ? (
              /* Adaptive Local parameters */
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-[#4b5563]">
                    <span>Local Block Window Size</span>
                    <span className="text-[#2563eb]">{adaptiveBlockSize} × {adaptiveBlockSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="31"
                    step="2"
                    value={adaptiveBlockSize}
                    onChange={(e) => updateImageProcessingParams({ adaptiveBlockSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-[#4b5563]">
                    <span>Constant Subtract (C)</span>
                    <span className="text-[#2563eb]">{adaptiveC}</span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="0.5"
                    value={adaptiveC}
                    onChange={(e) => updateImageProcessingParams({ adaptiveC: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-[#6b7280] font-medium mt-6">
                Otsu's binarization automatically calculates threshold levels based on histogram variance.
              </span>
            )}
          </div>
        );

      case "edges":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Edge selection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#4b5563]">Edge Operator</span>
              <select
                value={edgeType}
                onChange={(e) => updateImageProcessingParams({ edgeType: e.target.value as any })}
                className="bg-white border border-[#e5e7eb] rounded px-2.5 py-1.5 text-xs text-[#4b5563] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="sobel_mag">Sobel Gradient Magnitude</option>
                <option value="sobel_x">Sobel X (Horizontal)</option>
                <option value="sobel_y">Sobel Y (Vertical)</option>
                <option value="laplacian">Laplacian Derivative</option>
                <option value="canny">Canny (Dual Threshold Hysteresis)</option>
              </select>
            </div>

            {/* Canny parameters */}
            {edgeType === "canny" ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-[#4b5563]">
                    <span>Hysteresis Low Threshold</span>
                    <span className="text-[#2563eb]">{cannyThreshold1}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={cannyThreshold1}
                    onChange={(e) => updateImageProcessingParams({ cannyThreshold1: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-[#4b5563]">
                    <span>Hysteresis High Threshold</span>
                    <span className="text-[#2563eb]">{cannyThreshold2}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    value={cannyThreshold2}
                    onChange={(e) => updateImageProcessingParams({ cannyThreshold2: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-[#6b7280] font-medium mt-6">
                Derivative operators convolve fixed gradient kernels.
              </span>
            )}
          </div>
        );

      case "morphology":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Morph type */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#4b5563]">Morphological Operator</span>
              <select
                value={morphType}
                onChange={(e) => updateImageProcessingParams({ morphType: e.target.value as any })}
                className="bg-white border border-[#e5e7eb] rounded px-2.5 py-1.5 text-xs text-[#4b5563] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="erode">Erosion (Shrink Boundary)</option>
                <option value="dilate">Dilation (Expand Boundary)</option>
                <option value="open">Opening (Remove Noise)</option>
                <option value="close">Closing (Fill Holes)</option>
                <option value="gradient">Morphological Gradient</option>
                <option value="tophat">Top Hat (Bright Elements)</option>
                <option value="blackhat">Black Hat (Dark Elements)</option>
              </select>
            </div>

            {/* Structuring element element */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#4b5563]">Structuring Element Shape</span>
              <select
                value={morphElement}
                onChange={(e) => updateImageProcessingParams({ morphElement: e.target.value as any })}
                className="bg-white border border-[#e5e7eb] rounded px-2.5 py-1.5 text-xs text-[#4b5563] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="rect">Rectangle Element</option>
                <option value="cross">Cross Element</option>
                <option value="ellipse">Ellipse Element</option>
              </select>
            </div>

            {/* Kernel size */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold text-[#4b5563]">
                <span>Kernel Element Size</span>
                <span className="text-[#2563eb]">{morphKernelSize} × {morphKernelSize} px</span>
              </div>
              <input
                type="range"
                min="1"
                max="21"
                step="2"
                value={morphKernelSize}
                onChange={(e) => updateImageProcessingParams({ morphKernelSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const controls = (
    <div className="flex flex-col gap-5">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-0.5 bg-[#f8fafc] rounded-lg border border-[#e5e7eb] w-fit">
        {([
          { value: "filtering", label: "Spatial Filtering" },
          { value: "thresholding", label: "Binarization Threshold" },
          { value: "edges", label: "Edge Detectors" },
          { value: "morphology", label: "Morphological Shapes" },
        ] as const).map((cat) => (
          <button
            key={cat.value}
            onClick={() => updateImageProcessingParams({ category: cat.value })}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              category === cat.value
                ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm"
                : "text-[#6b7280] hover:text-[#4b5563]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dynamic parameters rendering */}
      <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#e5e7eb]">
        {renderCategoryControls()}
      </div>
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>Spatial Convolution Filtering:</b> High-pass and low-pass filtering. High-pass filters (like Laplacian derivatives) enhance edge boundaries by calculating differences between neighboring pixel amplitudes.
      </p>
      <p>
        <b>Binarization Thresholding:</b> Splits gray intensities. <b>Otsu's Method</b> chooses an optimal split value automatically by maximizing the between-class variance of foreground/background histograms.
      </p>
      <p>
        <b>Edge Extraction:</b> Locates high spatial frequency regions. The <b>Canny edge detector</b> is an optimal multi-stage tracker: it applies Gaussian smoothing, calculates gradients (Sobel), performs non-maximum suppression, and chains lines using dual threshold hysteresis.
      </p>
      <p>
        <b>Morphological Operations:</b> Applies structured shapes. **Erosion** shrinks foreground structures based on hit-or-miss rules, while **Dilation** expands boundaries. Combining them defines **Opening** (erode then dilate, removing small noise objects) and **Closing** (dilate then erode, filling holes).
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="7. Image Processing Engine"
        description="Apply filtering kernels, binarization segmentation thresholds, edge extraction matrices, and morphological boundaries. Adjust convolution coefficients to isolate structures and clean components for contour matching."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
      <div className="px-8 pb-6">
        {processedImage && (
          <button
            onClick={() => setStage("segmentation")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Feature Extraction</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
