"use client";

import React, { useEffect, useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { Sliders, Sun, Contrast, RotateCw, Trash2, ArrowRight, RefreshCw } from "lucide-react";

export default function PreprocessingModule() {
  const {
    originalImage,
    preprocessingParams,
    preprocessedImage,
    updatePreprocessingParams,
    setPreprocessedImage,
    setStage,
  } = usePipelineStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    brightness,
    contrast,
    denoiseType,
    denoiseStrength,
    stretchContrast,
    resizeWidth,
    resizeHeight,
    resizeEnabled,
    rotation,
  } = preprocessingParams;

  // Run preprocessing API call
  useEffect(() => {
    if (!originalImage) return;

    const executePreprocessing = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.preprocessImage(originalImage, preprocessingParams);
        setPreprocessedImage(result.processedImage);
      } catch (err: any) {
        setError(err.message || "Failed to preprocess image.");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      executePreprocessing();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [
    originalImage,
    brightness,
    contrast,
    denoiseType,
    denoiseStrength,
    stretchContrast,
    resizeWidth,
    resizeHeight,
    resizeEnabled,
    rotation,
  ]);

  const handleReset = () => {
    updatePreprocessingParams({
      brightness: 0,
      contrast: 0,
      denoiseType: "none",
      denoiseStrength: 3,
      stretchContrast: false,
      resizeWidth: 400,
      resizeHeight: 400,
      resizeEnabled: false,
      rotation: 0,
    });
  };

  const applyPreset = (preset: "normalize" | "denoise" | "sharpen") => {
    if (preset === "normalize") {
      updatePreprocessingParams({
        stretchContrast: true,
        contrast: 10,
        brightness: 5,
      });
    } else if (preset === "denoise") {
      updatePreprocessingParams({
        denoiseType: "gaussian",
        denoiseStrength: 4,
      });
    } else if (preset === "sharpen") {
      updatePreprocessingParams({
        contrast: 30,
        brightness: -5,
      });
    }
  };

  // Original Viewport
  const originalView = originalImage ? (
    <img
      src={originalImage}
      alt="Acquisition Input"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No original image loaded</span>
  );

  // Processed Viewport
  const processedView = isLoading ? (
    <div className="flex flex-col items-center gap-2 py-10">
      <RefreshCw className="w-6 h-6 text-[#2563eb] animate-spin" />
      <span className="text-xs text-[#6b7280] font-medium">Preprocessing pixel matrices...</span>
    </div>
  ) : error ? (
    <div className="text-center p-4 text-xs font-semibold text-red-500">{error}</div>
  ) : preprocessedImage ? (
    <img
      src={preprocessedImage}
      alt="Preprocessed Output"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">Configure parameters to process</span>
  );

  // Controls Panel
  const controls = (
    <div className="flex flex-col gap-5">
      {/* Brightness / Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#4b5563] flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#2563eb]" /> Brightness Offset
            </span>
            <span className="font-bold text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded text-[10px]">
              {brightness > 0 ? `+${brightness}` : brightness}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={brightness}
            onChange={(e) => updatePreprocessingParams({ brightness: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#4b5563] flex items-center gap-1.5">
              <Contrast className="w-3.5 h-3.5 text-[#2563eb]" /> Contrast Scaling
            </span>
            <span className="font-bold text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded text-[10px]">
              {contrast}%
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={contrast}
            onChange={(e) => updatePreprocessingParams({ contrast: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex flex-col justify-center bg-[#f8fafc] border border-[#e5e7eb] p-3.5 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stretchContrast}
              onChange={(e) => updatePreprocessingParams({ stretchContrast: e.target.checked })}
              className="w-4 h-4 rounded text-[#2563eb] accent-[#2563eb]"
            />
            <div>
              <span className="text-xs font-bold text-[#111827]">Min-Max Contrast Stretching</span>
              <p className="text-[9px] text-[#6b7280] leading-tight mt-0.5">Scales dynamic levels to span 0-255 bounds.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Denoise / Sizing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div className="flex flex-col gap-2 bg-[#f8fafc] border border-[#e5e7eb] p-3.5 rounded-lg">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#4b5563]">Smoothing Filters (Low-Pass convolve)</span>
            {denoiseType !== "none" && (
              <span className="font-bold text-[#2563eb] text-[10px]">Size: {denoiseStrength * 2 + 1}²</span>
            )}
          </div>
          <select
            value={denoiseType}
            onChange={(e: any) => updatePreprocessingParams({ denoiseType: e.target.value })}
            className="bg-white border border-[#e5e7eb] rounded px-2.5 py-1.5 text-xs text-[#4b5563] focus:outline-none focus:border-[#2563eb]"
          >
            <option value="none">No Filter</option>
            <option value="gaussian">Gaussian Blur</option>
            <option value="median">Median Blur</option>
            <option value="bilateral">Bilateral (Edge Preserved)</option>
          </select>
          {denoiseType !== "none" && (
            <input
              type="range"
              min="1"
              max="10"
              value={denoiseStrength}
              onChange={(e) => updatePreprocessingParams({ denoiseStrength: parseInt(e.target.value) })}
              className="w-full mt-1.5"
            />
          )}
        </div>

        <div className="flex flex-col gap-2 bg-[#f8fafc] border border-[#e5e7eb] p-3.5 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="resize-toggle"
              checked={resizeEnabled}
              onChange={(e) => updatePreprocessingParams({ resizeEnabled: e.target.checked })}
              className="w-3.5 h-3.5 text-[#2563eb] accent-[#2563eb]"
            />
            <label htmlFor="resize-toggle" className="text-xs font-bold text-[#4b5563] cursor-pointer">
              Discretize Coordinate Size
            </label>
          </div>
          <div className="flex gap-2 items-center mt-1">
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-[8px] text-[#6b7280] font-bold uppercase">Width</span>
              <input
                type="number"
                disabled={!resizeEnabled}
                value={resizeWidth}
                onChange={(e) => updatePreprocessingParams({ resizeWidth: Math.max(10, parseInt(e.target.value) || 0) })}
                className="w-full bg-white border border-[#e5e7eb] rounded px-2 py-1 text-xs text-[#4b5563] focus:outline-none disabled:opacity-40"
              />
            </div>
            <span className="text-xs text-[#9ca3af] mt-3 font-semibold">×</span>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-[8px] text-[#6b7280] font-bold uppercase">Height</span>
              <input
                type="number"
                disabled={!resizeEnabled}
                value={resizeHeight}
                onChange={(e) => updatePreprocessingParams({ resizeHeight: Math.max(10, parseInt(e.target.value) || 0) })}
                className="w-full bg-white border border-[#e5e7eb] rounded px-2 py-1 text-xs text-[#4b5563] focus:outline-none disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 bg-[#f8fafc] border border-[#e5e7eb] p-3.5 rounded-lg justify-between">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#4b5563] flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-[#2563eb]" /> Spatial Rotation
            </span>
            <span className="font-bold text-[#2563eb] text-[10px]">{rotation}°</span>
          </div>
          <div className="flex gap-1 p-0.5 bg-white rounded border border-[#e5e7eb] w-fit">
            {([0, 90, 180, 270] as const).map((angle) => (
              <button
                key={angle}
                onClick={() => updatePreprocessingParams({ rotation: angle })}
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                  rotation === angle ? "bg-[#f8fafc] text-[#2563eb] border border-[#e5e7eb] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase text-[#6b7280] tracking-wider">Presets:</span>
          <button
            onClick={() => applyPreset("normalize")}
            className="px-3 py-1.5 rounded bg-white border border-[#e5e7eb] text-[#4b5563] hover:text-[#2563eb] hover:border-[#2563eb] text-[10px] font-bold transition-all cursor-pointer shadow-sm"
          >
            Contrast Stretch
          </button>
          <button
            onClick={() => applyPreset("denoise")}
            className="px-3 py-1.5 rounded bg-white border border-[#e5e7eb] text-[#4b5563] hover:text-[#2563eb] hover:border-[#2563eb] text-[10px] font-bold transition-all cursor-pointer shadow-sm"
          >
            Gaussian Smooth
          </button>
          <button
            onClick={() => applyPreset("sharpen")}
            className="px-3 py-1.5 rounded bg-white border border-[#e5e7eb] text-[#4b5563] hover:text-[#2563eb] hover:border-[#2563eb] text-[10px] font-bold transition-all cursor-pointer shadow-sm"
          >
            Sharpen Details
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:text-red-500 hover:border-red-200 text-[10px] font-bold transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>Contrast Stretching:</b> A point operator that maps the minimum intensity of an image to 0 and the maximum to 255. This linear contrast stretch spreads the histogram, improving overall image visibility.
      </p>
      <p>
        <b>Gaussian Blurring:</b> Convolves a spatial Gaussian kernel containing coefficients based on the normal distribution: G(x,y) = [1 / (2 * π * σ²)] * e^(-(x² + y²) / (2 * σ²)). It acts as a low-pass filter to smooth noise.
      </p>
      <p>
        <b>Bilateral Filtering:</b> A highly advanced spatial filter convolving both domain (distance) and range (intensity similarity) kernels. It blurs flat regions while preserving sharp edge boundaries.
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="3. Image Preprocessing"
        description="Apply point operations and low-pass spatial filters to format and denoise the image matrix. This stage cleans sensor noise and balances dynamic ranges before segmenting shapes."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
      <div className="px-8 pb-6">
        {preprocessedImage && (
          <button
            onClick={() => setStage("color-conversion")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Color Conversion</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
