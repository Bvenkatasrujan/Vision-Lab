"use client";

import React, { useEffect, useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { Grid, Binary, RefreshCw, ArrowRight } from "lucide-react";

export default function RepresentationModule() {
  const {
    originalImage,
    representationParams,
    representationData,
    updateRepresentationParams,
    setRepresentationData,
    setStage,
  } = usePipelineStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { samplingRate, quantizationBits } = representationParams;

  // Trigger processing
  useEffect(() => {
    if (!originalImage) return;

    const executeRepresentation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getRepresentation(
          originalImage,
          samplingRate,
          quantizationBits
        );
        setRepresentationData(result);
      } catch (err: any) {
        setError(err.message || "Failed to digitize image.");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      executeRepresentation();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [originalImage, samplingRate, quantizationBits]);

  // Original Viewport
  const originalView = originalImage ? (
    <img
      src={originalImage}
      alt="Analog Continuous Signal"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No original image loaded</span>
  );

  // Processed Viewport
  const processedView = isLoading ? (
    <div className="flex flex-col items-center gap-2 py-10">
      <RefreshCw className="w-6 h-6 text-[#2563eb] animate-spin" />
      <span className="text-xs text-[#6b7280] font-medium">Digitizing pixel lattice...</span>
    </div>
  ) : error ? (
    <div className="text-center p-4 text-xs font-semibold text-red-500">{error}</div>
  ) : representationData ? (
    <img
      src={representationData.downsampledImage}
      alt="Digitized Discrete Signal"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">Configure parameters to digitize</span>
  );

  // Controls Panel
  const controls = (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sampling Rate control */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#4b5563] flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-[#2563eb]" />
            Spatial Sampling Rate (Sub-sampling)
          </label>
          <span className="font-bold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe] px-2 py-0.5 rounded text-[10px]">
            Every {samplingRate}px
          </span>
        </div>
        <input
          type="range"
          min="4"
          max="64"
          step="2"
          value={samplingRate}
          onChange={(e) => updateRepresentationParams({ samplingRate: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-[9px] text-[#9ca3af] font-bold">
          <span>HIGH RES (Fine Grid)</span>
          <span>LOW RES (Coarse Pixelation)</span>
        </div>
      </div>

      {/* Quantization bits control */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-[#4b5563] flex items-center gap-1.5">
            <Binary className="w-3.5 h-3.5 text-[#2563eb]" />
            Grayscale Quantization (Bit Depth)
          </label>
          <span className="font-bold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe] px-2 py-0.5 rounded text-[10px]">
            {quantizationBits} Bit ({2 ** quantizationBits} Gray Levels)
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="8"
          step="1"
          value={quantizationBits}
          onChange={(e) => updateRepresentationParams({ quantizationBits: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-[9px] text-[#9ca3af] font-bold">
          <span>1-BIT (Binary Black/White)</span>
          <span>8-BIT (Smooth Grayscale)</span>
        </div>
      </div>
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>Spatial Sampling:</b> Continuous analog image coordinate space must be digitized at specific intervals to create a discrete pixel lattice. Sub-sampling rates convolve coordinate step bounds. Taking fewer samples causes coordinate pixelation and structural blockiness.
      </p>
      <p>
        <b>Nyquist Limit:</b> To reconstruct visual patterns without aliasing artifacts (moiré patterns), the spatial sampling rate must exceed twice the maximum spatial frequency present in the continuous optical scene.
      </p>
      <p>
        <b>Amplitude Quantization:</b> Maps continuous light intensities (voltages) to discrete gray levels. For $B$ quantization bits, there are $2^B$ available intensity bins. Lowering the bit depth limits amplitude contrast transitions, causing false contouring edges.
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="2. Image Representation"
        description="Understand how continuous analog scenes map into digital coordinate matrices. Downsampling pixel spacing scales the coordinate lattices, while restricting bit depth limits gray intensity resolutions."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
      <div className="px-8 pb-6">
        {representationData && (
          <button
            onClick={() => setStage("preprocessing")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Preprocessing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
