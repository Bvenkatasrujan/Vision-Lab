"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Sliders, CheckCircle2, XCircle } from "lucide-react";

export default function PreprocessingAnalysis() {
  const { preprocessingParams, metadata } = usePipelineStore();
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

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Sliders className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Preprocessing Analytics
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
          Active Pipeline Parameters
        </span>

        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs p-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="font-semibold text-[#4b5563]">Brightness Offset</span>
            <span className="font-bold text-[#2563eb]">{brightness > 0 ? `+${brightness}` : brightness}</span>
          </div>

          <div className="flex justify-between items-center text-xs p-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="font-semibold text-[#4b5563]">Contrast Factor</span>
            <span className="font-bold text-[#2563eb]">{contrast}%</span>
          </div>

          <div className="flex justify-between items-center text-xs p-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="font-semibold text-[#4b5563]">Min-Max Normalization</span>
            {stretchContrast ? (
              <span className="text-[#16a34a] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Stretched</span>
            ) : (
              <span className="text-[#6b7280] font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Bypassed</span>
            )}
          </div>

          <div className="flex flex-col gap-1 p-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="text-[9px] text-[#6b7280] font-bold uppercase">Convolved Denoise Filter</span>
            <div className="text-xs text-[#111827] font-bold mt-0.5">
              {denoiseType === "none" ? "None convolved" : `${denoiseType.toUpperCase()} blur (Kernel ${denoiseStrength * 2 + 1}x${denoiseStrength * 2 + 1})`}
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="text-[9px] text-[#6b7280] font-bold uppercase">Discretized Resolution</span>
            <div className="text-xs text-[#111827] font-bold mt-0.5">
              {resizeEnabled ? `${resizeWidth} × ${resizeHeight} px` : `${metadata?.width || 0} × ${metadata?.height || 0} px (Source)`}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs p-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="font-semibold text-[#4b5563]">Geometric Rotation</span>
            <span className="font-bold text-[#2563eb]">{rotation}° Clockwise</span>
          </div>
        </div>
      </div>
    </div>
  );
}
