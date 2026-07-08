"use client";

import React, { useEffect, useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { BarChart3, RefreshCw, ArrowRight } from "lucide-react";

export default function HistogramModule() {
  const {
    colorConvertedImage,
    preprocessedImage,
    histogramParams,
    histogramData,
    updateHistogramParams,
    setHistogramData,
    setStage,
  } = usePipelineStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeImage = colorConvertedImage || preprocessedImage;
  const { equalize, channel } = histogramParams;

  // Run histogram API calculation
  useEffect(() => {
    if (!activeImage) return;

    const executeHistogram = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getHistogram(activeImage);
        setHistogramData(result);
      } catch (err: any) {
        setError(err.message || "Failed to calculate histogram.");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      executeHistogram();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [activeImage]);

  // Original Viewport
  const originalView = activeImage ? (
    <img
      src={activeImage}
      alt="Lattice Input"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No input image</span>
  );

  // Equalized Viewport
  const processedView = isLoading ? (
    <div className="flex flex-col items-center gap-2 py-10">
      <RefreshCw className="w-6 h-6 text-[#2563eb] animate-spin" />
      <span className="text-xs text-[#6b7280] font-medium">Calculating frequency matrices...</span>
    </div>
  ) : error ? (
    <div className="text-center p-4 text-xs font-semibold text-red-500">{error}</div>
  ) : equalize && histogramData?.equalizedImage ? (
    <img
      src={histogramData.equalizedImage}
      alt="Equalized Output"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <div className="flex flex-col items-center gap-2 py-16 text-center text-[10px] text-[#6b7280] font-medium max-w-[200px]">
      <BarChart3 className="w-8 h-8 text-[#9ca3af] mb-1" />
      <span>Select "Equalize Contrast Distribution" below to preview probability equalizations.</span>
    </div>
  );

  // Controls Panel
  const controls = (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Channel toggles */}
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-xs font-bold text-[#4b5563]">Active Histogram Band</label>
        <div className="flex flex-wrap gap-1.5 p-0.5 bg-[#f8fafc] rounded-lg border border-[#e5e7eb] w-fit">
          {[
            { val: "intensity" as const, label: "Grayscale" },
            { val: "red" as const, label: "Red Band" },
            { val: "green" as const, label: "Green Band" },
            { val: "blue" as const, label: "Blue Band" },
          ].map((ch) => (
            <button
              key={ch.val}
              onClick={() => updateHistogramParams({ channel: ch.val })}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                channel === ch.val
                  ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equalize Toggle */}
      {channel === "intensity" && (
        <div className="flex-1 flex flex-col justify-center bg-[#f8fafc] border border-[#e5e7eb] p-3.5 rounded-lg w-full">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={equalize}
              onChange={(e) => updateHistogramParams({ equalize: e.target.checked })}
              className="w-4 h-4 rounded text-[#2563eb] accent-[#2563eb]"
            />
            <div>
              <span className="text-xs font-bold text-[#111827]">Equalize Contrast Distribution</span>
              <p className="text-[9px] text-[#6b7280] leading-tight mt-0.5">
                Redistributes gray levels based on the cumulative distribution function (CDF).
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>Image Histogram:</b> A discrete function representing the distribution of pixel intensities. For an 8-bit image, the histogram maps each gray level $r_k$ (0 to 255) to the total number of pixels $n_k$ having that intensity.
      </p>
      <p>
        <b>Probability Density Function (PDF):</b> Dividing pixel counts by the total image dimensions yields the PDF, expressing the likelihood of any pixel taking a specific value.
      </p>
      <p>
        <b>Cumulative Distribution Function (CDF):</b> The running sum of the PDF. The CDF maps values monotonically from 0.0 to 1.0.
      </p>
      <p>
        <b>Histogram Equalization:</b> A transformation function $s = T(r)$ that uses the normalized CDF to map input intensities into a uniform output histogram. This spreads crowded gray levels, maximizing image contrast.
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="6. Histogram Analysis"
        description="Compute intensity histograms and cumulative frequency distributions. Spreading crowded light levels equalizes dynamic ranges, revealing structures hidden in dark shadow fields."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
      <div className="px-8 pb-6">
        {histogramData && (
          <button
            onClick={() => setStage("image-processing")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Image Processing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
