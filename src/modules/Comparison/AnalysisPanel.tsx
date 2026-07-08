"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Split, Columns } from "lucide-react";

export default function ComparisonAnalysis() {
  const { comparisonData, comparisonParams } = usePipelineStore();
  const { viewMode } = comparisonParams;

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Split className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Comparison Analysis
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
          Similarity Statistics
        </span>

        {comparisonData && viewMode === "difference" ? (
          <div className="flex flex-col gap-3.5">
            {/* SSIM Match Card */}
            <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
              <span className="text-[9px] text-[#6b7280] font-bold block uppercase">Structural Similarity (SSIM)</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-[#2563eb] font-extrabold">
                  {(comparisonData.ssimScore * 100).toFixed(2)}% Match
                </span>
                <span className="text-[9px] text-[#6b7280] font-bold">Index: {comparisonData.ssimScore.toFixed(4)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-[#2563eb]"
                  style={{ width: `${Math.max(0, Math.min(100, comparisonData.ssimScore * 100))}%` }}
                ></div>
              </div>
            </div>

            {/* MSE and Pixel Diff Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
                <span className="text-[8px] text-[#6b7280] font-bold block uppercase">Mean Squared Error</span>
                <span className="text-xs text-[#111827] font-bold">{comparisonData.meanSquaredError.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
                <span className="text-[8px] text-[#6b7280] font-bold block uppercase">Altered Pixels</span>
                <span className="text-xs text-[#dc2626] font-bold">{comparisonData.pixelDifferenceCount} px</span>
              </div>
            </div>

            <div className="text-[9px] text-[#6b7280] leading-relaxed bg-[#eff6ff] border border-[#dbeafe] p-3 rounded-lg">
              SSIM compares local patterns of luminance, contrast, and structure. Heatmap hotspots highlight where processing has shifted pixel distributions.
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2 max-w-[200px] mx-auto">
            <Columns className="w-8 h-8 text-[#9ca3af]" />
            <span className="text-[10px] text-[#6b7280] font-medium leading-normal">
              Toggle the viewport to "Difference Heatmap" in controls to calculate structural indices (SSIM, MSE) and delta matrices.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
