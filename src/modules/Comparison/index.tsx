"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { Split, RefreshCw, ArrowRight } from "lucide-react";

export default function ComparisonModule() {
  const {
    originalImage,
    processedImage,
    preprocessedImage,
    comparisonParams,
    comparisonData,
    updateComparisonParams,
    setComparisonData,
    setStage,
  } = usePipelineStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeInput = originalImage;
  const activeProcessed = processedImage || preprocessedImage;

  const { sliderPosition, viewMode, diffType } = comparisonParams;

  // Split-screen mouse/drag references
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSliding, setIsSliding] = useState(false);

  // Trigger metrics calculation
  useEffect(() => {
    if (!activeInput || !activeProcessed) return;

    const executeComparison = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.compareImages(activeInput, activeProcessed, diffType);
        setComparisonData({
          diffImage: result.diffImage,
          ssimScore: result.ssimScore,
          meanSquaredError: result.meanSquaredError,
          pixelDifferenceCount: result.pixelDifferenceCount,
        });
      } catch (err: any) {
        setError(err.message || "Failed to compare images.");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      executeComparison();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [activeInput, activeProcessed, diffType]);

  // Handle sliding split divider
  const handleSplitMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    updateComparisonParams({ sliderPosition: Math.max(0, Math.min(100, pos)) });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSplitMove(e.touches[0].clientX);
    }
  };

  // Original Viewport
  const originalView = activeInput ? (
    <img
      src={activeInput}
      alt="Reference Input"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No input image</span>
  );

  // Processed Viewport (Side-by-side or heatmap or split)
  const processedView = isLoading ? (
    <div className="flex flex-col items-center gap-2 py-10">
      <RefreshCw className="w-6 h-6 text-[#2563eb] animate-spin" />
      <span className="text-xs text-[#6b7280] font-medium">Calculating structural differences...</span>
    </div>
  ) : error ? (
    <div className="text-center p-4 text-xs font-semibold text-red-500">{error}</div>
  ) : viewMode === "side-by-side" && activeProcessed ? (
    <img
      src={activeProcessed}
      alt="Processed Result"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : viewMode === "difference" && comparisonData?.diffImage ? (
    <div className="relative group">
      <img
        src={comparisonData.diffImage}
        alt="Mathematical Difference Map"
        className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
      />
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-100 text-[9px] text-[#dc2626] uppercase font-bold pointer-events-none">
        Difference Map
      </div>
    </div>
  ) : viewMode === "split" && activeInput && activeProcessed ? (
    <div
      ref={containerRef}
      className="relative w-full h-[260px] rounded border border-[#e5e7eb] overflow-hidden select-none bg-white flex items-center justify-center cursor-ew-resize"
      onMouseMove={(e) => {
        if (e.buttons === 1 || isSliding) {
          handleSplitMove(e.clientX);
        }
      }}
      onMouseDown={(e) => {
        setIsSliding(true);
        handleSplitMove(e.clientX);
      }}
      onMouseUp={() => setIsSliding(false)}
      onTouchMove={handleTouchMove}
      onTouchStart={() => setIsSliding(true)}
      onTouchEnd={() => setIsSliding(false)}
    >
      {/* Background (Processed) */}
      <img
        src={activeProcessed}
        alt="Processed state bg"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      
      {/* Overlay (Original) clipped */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none flex items-center"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={activeInput}
          alt="Original state overlay"
          className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
          style={{ width: containerRef.current?.getBoundingClientRect().width }}
        />
      </div>

      {/* Divider Line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-[#2563eb] shadow-md pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider knob handles */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#2563eb] border-2 border-white shadow flex items-center justify-center">
          <Split className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    </div>
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">Select view mode</span>
  );

  // Controls Panel
  const controls = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* View Mode select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#4b5563]">Viewport Mode</label>
          <div className="flex flex-wrap gap-1.5 p-0.5 bg-[#f8fafc] rounded-lg border border-[#e5e7eb] w-fit">
            {[
              { val: "side-by-side" as const, label: "Side-by-Side" },
              { val: "split" as const, label: "Split Screen Slider" },
              { val: "difference" as const, label: "Difference Heatmap" },
            ].map((mode) => (
              <button
                key={mode.val}
                onClick={() => updateComparisonParams({ viewMode: mode.val })}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  viewMode === mode.val
                    ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm"
                    : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difference calculation type */}
        {viewMode === "difference" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#4b5563]">Difference Metric Formula</label>
            <div className="flex gap-1.5 p-0.5 bg-[#f8fafc] rounded-lg border border-[#e5e7eb] w-fit">
              {[
                { val: "absolute" as const, label: "Absolute Delta (|A - B|)" },
                { val: "ssim" as const, label: "SSIM structural map" },
              ].map((dt) => (
                <button
                  key={dt.val}
                  onClick={() => updateComparisonParams({ diffType: dt.val })}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    diffType === dt.val
                      ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm"
                      : "text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewMode === "split" && (
        <p className="text-[10px] text-[#6b7280] leading-none mt-1">
          💡 Drag across the viewport canvas above to slidingly reveal reference input details.
        </p>
      )}
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>Mean Squared Error (MSE):</b> Calculates simple pixel differences: MSE = (1 / (M * N)) * Σ [I_1(x,y) - I_2(x,y)]². While fast, MSE is highly sensitive to simple offsets and does not track human perceptual similarity.
      </p>
      <p>
        <b>Structural Similarity Index (SSIM):</b> Evaluates image quality by measuring three distinct components:
        <br />
        • <b>Luminance (l):</b> Evaluates mean intensity alignment.
        <br />
        • <b>Contrast (c):</b> Evaluates variance offsets.
        <br />
        • <b>Structure (s):</b> Evaluates cross-covariance of patterns.
        <br />
        SSIM yields a decimal index from -1.0 to 1.0 (where 1.0 represents identical patterns). It aligns closely with human eye perception.
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="9. Result Comparison"
        description="Compare input reference images against processed results. Use sliding split screens or compute structural similarity indices (SSIM, MSE) to track exact channel modifications."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
      <div className="px-8 pb-6">
        {comparisonData && (
          <button
            onClick={() => setStage("export")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Export Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
