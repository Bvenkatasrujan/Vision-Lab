"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Layers, ListFilter, HelpCircle } from "lucide-react";

export default function SegmentationAnalysis() {
  const { segmentationData } = usePipelineStore();

  return (
    <div className="p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Layers className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Feature Analysis
        </h3>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
            Connected Components
          </span>
          <span className="text-[9px] font-bold text-[#16a34a] bg-[#f0fdf4] border border-[#dcfce7] px-2 py-0.5 rounded">
            Count: {segmentationData?.contourCount || 0}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {segmentationData?.objects && segmentationData.objects.length > 0 ? (
            segmentationData.objects.map((obj) => (
              <div
                key={obj.id}
                className="p-3 rounded-lg bg-[#f8fafc] border border-[#e5e7eb] text-[10px] flex justify-between items-center hover:border-[#2563eb] transition-all hover:bg-white shadow-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-[#111827]">Object #{obj.id}</span>
                  <span className="text-[9px] text-[#6b7280] font-medium">
                    Centroid: ({obj.centroid[0]}, {obj.centroid[1]})
                  </span>
                </div>
                <div className="text-right flex flex-col gap-0.5">
                  <span className="text-[#2563eb] font-bold">Area: {obj.area} px²</span>
                  <span className="text-[#6b7280] font-medium text-[9px]">
                    Circularity: {obj.circularity.toFixed(3)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-[10px] text-[#6b7280] font-medium leading-normal max-w-[200px] mx-auto">
              <ListFilter className="w-8 h-8 text-[#9ca3af] mb-1" />
              Adjust binarization sliders to extract contour boundaries.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
