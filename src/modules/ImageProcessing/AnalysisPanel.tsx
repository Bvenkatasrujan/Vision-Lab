"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Cpu, HelpCircle, Layers } from "lucide-react";

export default function ImageProcessingAnalysis() {
  const { imageProcessingParams } = usePipelineStore();
  const { category, filterType, thresholdType, edgeType, morphType } = imageProcessingParams;

  // Render mathematical kernel matrix structures for educational understanding
  const getDIPKernelMatrix = () => {
    if (category === "edges") {
      if (edgeType === "sobel_x") {
        return [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1],
        ];
      } else if (edgeType === "sobel_y") {
        return [
          [-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1],
        ];
      } else if (edgeType === "laplacian") {
        return [
          [0, 1, 0],
          [1, -4, 1],
          [0, 1, 0],
        ];
      }
    }
    return null;
  };

  const kernelMat = getDIPKernelMatrix();

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Cpu className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Algorithm Diagnostics
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
          Active DIP Chapter Operator
        </span>

        <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
          <span className="text-[9px] text-[#6b7280] font-bold uppercase block">Category Mode</span>
          <span className="text-xs text-[#111827] font-bold mt-0.5 capitalize">{category}</span>
        </div>

        {category === "filtering" && (
          <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="text-[9px] text-[#6b7280] font-bold uppercase block">Spatial Filter convolved</span>
            <span className="text-xs text-[#2563eb] font-bold mt-0.5 capitalize">{filterType} convolve</span>
          </div>
        )}

        {category === "thresholding" && (
          <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="text-[9px] text-[#6b7280] font-bold uppercase block">Segmentation Formula</span>
            <span className="text-xs text-[#2563eb] font-bold mt-0.5 capitalize">{thresholdType.replace("_", " ")}</span>
          </div>
        )}

        {category === "edges" && (
          <div className="flex flex-col gap-2.5">
            <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
              <span className="text-[9px] text-[#6b7280] font-bold uppercase block">Gradient Operator</span>
              <span className="text-xs text-[#2563eb] font-bold mt-0.5 capitalize">{edgeType.replace("_", " ")}</span>
            </div>

            {kernelMat && (
              <div className="p-3 bg-white border border-[#e5e7eb] rounded-lg flex flex-col gap-2 shadow-sm">
                <span className="text-[8px] text-[#6b7280] font-bold uppercase">Mathematical Kernel Matrix</span>
                <div className="grid grid-cols-3 gap-1.5 w-32 mx-auto">
                  {kernelMat.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="bg-[#f8fafc] border border-[#e5e7eb] rounded text-center text-[10px] font-bold py-1 text-[#111827]"
                      >
                        {val}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {category === "morphology" && (
          <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
            <span className="text-[9px] text-[#6b7280] font-bold uppercase block">Morphological element</span>
            <span className="text-xs text-[#2563eb] font-bold mt-0.5 capitalize">{morphType}ing convolve</span>
          </div>
        )}

        <div className="text-[10px] text-[#6b7280] leading-relaxed bg-[#f8fafc] border border-[#e5e7eb] p-3.5 rounded-lg flex gap-2">
          <HelpCircle className="w-4 h-4 text-[#6b7280] shrink-0 mt-0.5" />
          <span>
            Upstream convolve parameters map directly to discrete image coordinates, adapting high-frequency edges before segmentation.
          </span>
        </div>
      </div>
    </div>
  );
}
