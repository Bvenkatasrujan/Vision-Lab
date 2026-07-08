"use client";

import React, { useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Grid, Binary, Hash } from "lucide-react";

export default function RepresentationAnalysis() {
  const { representationData, representationParams } = usePipelineStore();
  const [valueMode, setValueMode] = useState<"decimal" | "binary">("decimal");
  const { quantizationBits } = representationParams;

  // Convert decimal intensity to binary padded to the bit depth
  const toBinaryString = (val: number, bits: number) => {
    const levels = 2 ** bits;
    const step = 256 / levels;
    const discreteVal = Math.min(levels - 1, Math.floor(val / step));
    return discreteVal.toString(2).padStart(bits, "0");
  };

  const getCellTextColor = (val: number) => {
    return val > 128 ? "text-[#111827] font-semibold" : "text-white font-semibold";
  };

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Grid className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Matrix Representation
        </h3>
      </div>

      {representationData?.pixelMatrix ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
              Sub-Grid Explorer
            </span>
            {/* Dec / Bin toggles */}
            <div className="flex gap-1 p-0.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg">
              <button
                onClick={() => setValueMode("decimal")}
                className={`px-2 py-1 rounded text-[9px] font-bold flex items-center gap-0.5 cursor-pointer ${
                  valueMode === "decimal"
                    ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm"
                    : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                <Hash className="w-2.5 h-2.5" />
                <span>Dec</span>
              </button>
              <button
                onClick={() => setValueMode("binary")}
                className={`px-2 py-1 rounded text-[9px] font-bold flex items-center gap-0.5 cursor-pointer ${
                  valueMode === "binary"
                    ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm"
                    : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                <Binary className="w-2.5 h-2.5" />
                <span>Bin</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f8fafc] border border-[#e5e7eb]">
            <div
              className="grid gap-[1px] select-none"
              style={{
                gridTemplateColumns: `repeat(${representationData.samplingWidth}, minmax(0, 1fr))`,
              }}
            >
              {representationData.pixelMatrix.map((row, rIdx) =>
                row.map((val, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`pixel-cell-light aspect-square flex items-center justify-center rounded-[2px] relative ${getCellTextColor(
                      val
                    )}`}
                    style={{
                      backgroundColor: `rgb(${val}, ${val}, ${val})`,
                      width: `${Math.min(18, 260 / representationData.samplingWidth)}px`,
                      height: `${Math.min(18, 260 / representationData.samplingWidth)}px`,
                    }}
                    title={`Coordinate: (${cIdx}, ${rIdx}) | Value: ${val}`}
                  >
                    <span className="text-[6px] pointer-events-none scale-85">
                      {valueMode === "decimal"
                        ? val
                        : toBinaryString(val, quantizationBits)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="text-[8px] text-[#6b7280] font-bold mt-3 text-center">
              Central {representationData.samplingWidth} × {representationData.samplingHeight} Digital Quantized Matrix
            </div>
          </div>

          <div className="text-[10px] text-[#6b7280] leading-relaxed mt-2 bg-[#f8fafc] border border-[#e5e7eb] p-3 rounded-lg">
            Hover over the cells to observe coordinates and discrete values. Changing the spatial sampling rates adjusts the lattice grid counts.
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-[10px] text-[#6b7280] font-medium leading-normal max-w-[200px] mx-auto">
          <Binary className="w-8 h-8 text-[#9ca3af] mb-1" />
          Matrix values will populate upon binarization.
        </div>
      )}
    </div>
  );
}
