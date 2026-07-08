"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Crosshair, Palette } from "lucide-react";

export default function ColorConversionAnalysis() {
  const { hoverColorDetails } = usePipelineStore();

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Palette className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Color Space Analysis
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
          Interactive Color Picker
        </span>

        {hoverColorDetails ? (
          <div className="flex flex-col gap-3.5">
            {/* Color Preview Block */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border border-[#e5e7eb] shadow-inner shrink-0"
                style={{ backgroundColor: `rgb(${hoverColorDetails.r}, ${hoverColorDetails.g}, ${hoverColorDetails.b})` }}
              ></div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-[#6b7280] font-bold uppercase">Lattice Coordinate</span>
                <span className="text-xs text-[#111827] font-bold">
                  X: {hoverColorDetails.x}, Y: {hoverColorDetails.y}
                </span>
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg flex justify-between items-center">
                <span className="text-[9px] text-[#6b7280] font-bold uppercase">RGB Channel Values</span>
                <span className="text-xs text-[#111827] font-bold">
                  R: {hoverColorDetails.r} G: {hoverColorDetails.g} B: {hoverColorDetails.b}
                </span>
              </div>

              <div className="p-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg flex justify-between items-center">
                <span className="text-[9px] text-[#6b7280] font-bold uppercase">Hex Color string</span>
                <span className="text-xs text-[#2563eb] font-bold">{hoverColorDetails.hex}</span>
              </div>

              <div className="p-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg flex justify-between items-center">
                <span className="text-[9px] text-[#6b7280] font-bold uppercase">HSV Space</span>
                <span className="text-xs text-[#111827] font-bold">
                  H: {hoverColorDetails.h}° S: {hoverColorDetails.s}% V: {hoverColorDetails.v}%
                </span>
              </div>

              <div className="p-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg flex justify-between items-center">
                <span className="text-[9px] text-[#6b7280] font-bold uppercase">CIELAB (L*a*b*)</span>
                <span className="text-xs text-[#111827] font-bold">
                  L: {hoverColorDetails.l} A: {hoverColorDetails.a} B: {hoverColorDetails.b_lab}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <Crosshair className="w-8 h-8 text-[#9ca3af]" />
            <span className="text-[10px] text-[#6b7280] font-medium leading-normal max-w-[200px]">
              Hover over the canvas image to inspect pixel channel parameters in real-time.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
