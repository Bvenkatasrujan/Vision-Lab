"use client";

import React, { useEffect, useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { Layers, RefreshCw, ArrowRight } from "lucide-react";

export default function SegmentationModule() {
  const {
    processedImage,
    preprocessedImage,
    segmentationParams,
    segmentationData,
    updateSegmentationParams,
    setSegmentationData,
    setStage,
    setSegmentedImage,
  } = usePipelineStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Operate on processed image, fallback to preprocessed
  const activeImage = processedImage || preprocessedImage;
  const { thresholdValue, minArea, maxArea, connectivity } = segmentationParams;

  // Run segmentation
  useEffect(() => {
    if (!activeImage) return;

    const executeSegmentation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.segmentImage(activeImage, {
          thresholdValue,
          minArea,
          maxArea,
          connectivity,
        });
        setSegmentationData(result);
        setSegmentedImage(result.segmentedImage);
      } catch (err: any) {
        setError(err.message || "Failed to segment image.");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      executeSegmentation();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [activeImage, thresholdValue, minArea, maxArea, connectivity]);

  // Original Viewport
  const originalView = activeImage ? (
    <img
      src={activeImage}
      alt="Processing Engine Output"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No input image</span>
  );

  // Segmented Viewport
  const processedView = isLoading ? (
    <div className="flex flex-col items-center gap-2 py-10">
      <RefreshCw className="w-6 h-6 text-[#2563eb] animate-spin" />
      <span className="text-xs text-[#6b7280] font-medium">Finding connected contours...</span>
    </div>
  ) : error ? (
    <div className="text-center p-4 text-xs font-semibold text-red-500">{error}</div>
  ) : segmentationData ? (
    <div className="relative group">
      <img
        src={segmentationData.segmentedImage}
        alt="Contour Boundary Overlays"
        className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
      />
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#eff6ff]/90 px-2 py-0.5 rounded border border-[#dbeafe] text-[9px] text-[#2563eb] uppercase font-bold pointer-events-none">
        Feature Overlay
      </div>
    </div>
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">Configure parameters to segment</span>
  );

  // Controls Panel
  const controls = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      {/* Threshold split */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#4b5563]">Binarization Split</label>
          <span className="font-bold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe] px-1.5 py-0.5 rounded text-[10px]">
            {thresholdValue} / 255
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          value={thresholdValue}
          onChange={(e) => updateSegmentationParams({ thresholdValue: parseInt(e.target.value) })}
          className="w-full"
        />
        <p className="text-[9px] text-[#6b7280] leading-tight">
          Binarizes the input before locating connected boundaries.
        </p>
      </div>

      {/* Min size limit */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#4b5563]">Minimum Size Filter</label>
          <span className="font-bold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe] px-1.5 py-0.5 rounded text-[10px]">
            {minArea} px²
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="2000"
          step="10"
          value={minArea}
          onChange={(e) => updateSegmentationParams({ minArea: parseInt(e.target.value) })}
          className="w-full"
        />
        <p className="text-[9px] text-[#6b7280] leading-tight">
          Excludes small noise particles or border fragments.
        </p>
      </div>

      {/* Max size limit */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#4b5563]">Maximum Size Filter</label>
          <span className="font-bold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe] px-1.5 py-0.5 rounded text-[10px]">
            {maxArea} px²
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="100000"
          step="500"
          value={maxArea}
          onChange={(e) => updateSegmentationParams({ maxArea: parseInt(e.target.value) })}
          className="w-full"
        />
        <p className="text-[9px] text-[#6b7280] leading-tight">
          Excludes large background spaces or merged shapes.
        </p>
      </div>

      {/* Connectivity Selector */}
      <div className="flex flex-col gap-2 bg-[#f8fafc] border border-[#e5e7eb] p-3 rounded-lg">
        <span className="text-[9px] font-extrabold uppercase text-[#6b7280] tracking-wider">Neighborhood Pixel Scan</span>
        <div className="flex gap-1.5">
          {([4, 8] as const).map((conn) => (
            <button
              key={conn}
              onClick={() => updateSegmentationParams({ connectivity: conn })}
              className={`flex-1 py-1 px-2 rounded text-[10px] font-bold cursor-pointer transition-all border ${
                connectivity === conn
                  ? "bg-white text-[#2563eb] border-[#2563eb] shadow-sm"
                  : "bg-white text-[#6b7280] border-[#e5e7eb] hover:text-[#111827]"
              }`}
            >
              {conn}-Connected
            </button>
          ))}
        </div>
        <p className="text-[8px] text-[#6b7280] leading-tight">
          4-connected checks cardinal neighbors; 8-connected includes diagonals, binding corner points.
        </p>
      </div>
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>Connected Components Labeling (CCL):</b> Groups pixels in binary images into segments based on local neighborhood connectivity. Scanning pixel blocks labels matching neighbors, defining isolated objects.
      </p>
      <p>
        <b>Boundary Contour Tracking:</b> Traces outer border chains. This allows calculations of geometric parameters:
        <br />
        • <b>Area (A):</b> Pixel sum enclosed by the contour boundary.
        <br />
        • <b>Perimeter (P):</b> Count of pixel boundaries along the border chain.
        <br />
        • <b>Circularity (f_c):</b> Calculated as f_c = (4 * π * Area) / Perimeter². An ideal circle yields a value of 1.0; long, rectangular, or irregular shapes score much lower.
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="8. Feature Extraction"
        description="Extract connected components and evaluate structural metrics. Isolate foreground shapes, trace boundary contours, draw bounding boxes, and calculate area, perimeter, and circularity."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
      <div className="px-8 pb-6">
        {segmentationData && (
          <button
            onClick={() => setStage("comparison")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Result Comparison</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
