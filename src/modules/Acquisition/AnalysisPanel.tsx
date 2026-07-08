"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Info, Image as ImageIcon } from "lucide-react";

export default function AcquisitionAnalysis() {
  const { originalImage, metadata } = usePipelineStore();

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Info className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Acquisition Analysis
        </h3>
      </div>

      {originalImage && metadata ? (
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
            Image Metadata
          </span>

          <div className="flex flex-col gap-2.5">
            <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
              <span className="text-[9px] text-[#6b7280] font-bold uppercase">Filename</span>
              <div className="text-xs text-[#111827] font-bold truncate mt-0.5">{metadata.name}</div>
            </div>

            <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
              <span className="text-[9px] text-[#6b7280] font-bold uppercase">Spatial Dimensions</span>
              <div className="text-xs text-[#111827] font-bold mt-0.5">
                {metadata.width} × {metadata.height} px
              </div>
            </div>

            <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
              <span className="text-[9px] text-[#6b7280] font-bold uppercase">MIME Type Format</span>
              <div className="text-xs text-[#111827] font-bold mt-0.5 uppercase">
                {metadata.format.split("/")[1] || metadata.format}
              </div>
            </div>

            <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
              <span className="text-[9px] text-[#6b7280] font-bold uppercase">File Memory Size</span>
              <div className="text-xs text-[#2563eb] font-bold mt-0.5">
                {(metadata.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <ImageIcon className="w-8 h-8 text-[#9ca3af]" />
          <span className="text-[10px] text-[#6b7280] font-medium leading-normal max-w-[200px]">
            No image metadata convolved. Upload or capture a frame to analyze.
          </span>
        </div>
      )}
    </div>
  );
}
