"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Crosshair, Grid } from "lucide-react";

export default function PixelAnalysisAnalysis() {
  const {
    preprocessedImage,
    colorConvertedImage,
    pixelAnalysisParams,
  } = usePipelineStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeImage = colorConvertedImage || preprocessedImage;
  const { gridSize } = pixelAnalysisParams;

  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [neighborhood, setNeighborhood] = useState<{
    cells: Array<{
      x: number;
      y: number;
      r: number;
      g: number;
      b: number;
      intensity: number;
      hex: string;
      isCenter: boolean;
    }>;
    rows: number;
    cols: number;
  } | null>(null);

  // Read offscreen canvas from the store or reload here to track mouse movements globally
  // We can track the cursor details from `hoverColorDetails` if we push it!
  // Wait! In PixelAnalysis, we can push coordinate updates to `hoverColorDetails`!
  // Let's inspect usePipelineStore parameters.
  // We added `hoverColorDetails`. Let's use `hoverColorDetails` to draw the grid or we can load it locally by subscribing to hoverColorDetails!
  // Subscription:
  const { hoverColorDetails } = usePipelineStore();

  useEffect(() => {
    if (!hoverColorDetails) {
      setNeighborhood(null);
      setHoverCoord(null);
      return;
    }

    // Set coordinate
    setHoverCoord({ x: hoverColorDetails.x, y: hoverColorDetails.y });

    // In PixelAnalysis, we convolve a local neighborhood of size `gridSize`
    // We can pull the neighborhood pixels from an offscreen canvas. Let's do that!
    // Since the offscreen canvas is loaded when `activeImage` changes, we can extract the local box around `hoverColorDetails.x` and `hoverColorDetails.y`!
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const half = Math.floor(gridSize / 2);
    const cells = [];
    const width = canvas.width;
    const height = canvas.height;
    const cx = hoverColorDetails.x;
    const cy = hoverColorDetails.y;

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const px = cx + dx;
        const py = cy + dy;
        let r = 0, g = 0, b = 0, intensity = 0, hex = "#000000";

        if (px >= 0 && px < width && py >= 0 && py < height) {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          r = pixel[0];
          g = pixel[1];
          b = pixel[2];
          intensity = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }

        cells.push({
          x: px,
          y: py,
          r,
          g,
          b,
          intensity,
          hex,
          isCenter: dx === 0 && dy === 0,
        });
      }
    }

    setNeighborhood({
      cells,
      rows: gridSize,
      cols: gridSize,
    });
  }, [hoverColorDetails, gridSize]);

  // Offscreen canvas loader
  useEffect(() => {
    if (!activeImage) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeImage;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
    };
  }, [activeImage]);

  const getCellTextColor = (val: number) => {
    return val > 128 ? "text-[#111827] font-semibold" : "text-white font-semibold";
  };

  const centerCell = neighborhood?.cells.find((c) => c.isCenter);

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Grid className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Pixel Grid Explorer
        </h3>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {hoverCoord && centerCell && neighborhood ? (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
              Neighbor Matrix
            </span>
            <span className="text-[9px] font-bold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe] px-2 py-0.5 rounded">
              Center: ({hoverCoord.x}, {hoverCoord.y})
            </span>
          </div>

          {/* Grid render */}
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f8fafc] border border-[#e5e7eb]">
            <div
              className="grid gap-[1px] select-none"
              style={{
                gridTemplateColumns: `repeat(${neighborhood.cols}, minmax(0, 1fr))`,
              }}
            >
              {neighborhood.cells.map((cell, idx) => (
                <div
                  key={idx}
                  className={`pixel-cell-light aspect-square flex items-center justify-center rounded-[2px] border relative ${
                    cell.isCenter ? "border-[#2563eb] ring-2 ring-[#2563eb]/20 shadow-md" : "border-transparent"
                  } ${getCellTextColor(cell.intensity)}`}
                  style={{
                    backgroundColor: `rgb(${cell.r}, ${cell.g}, ${cell.b})`,
                    width: `${Math.min(26, 260 / gridSize)}px`,
                    height: `${Math.min(26, 260 / gridSize)}px`,
                  }}
                  title={`Coordinate: (${cell.x}, ${cell.y})\nRGB: (${cell.r}, ${cell.g}, ${cell.b})\nGrayscale: ${cell.intensity}`}
                >
                  <span className="text-[7px] pointer-events-none scale-85">
                    {cell.intensity}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[8px] text-[#6b7280] font-bold mt-3 text-center">
              Grayscale Intensities in {gridSize}×{gridSize} Neighborhood
            </div>
          </div>

          {/* Color Breakdown details */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#6b7280]">
              Focal Color Channels
            </span>

            <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg flex flex-col gap-2">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#4b5563]">
                  <span>Red Channel</span>
                  <span>{centerCell.r}</span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-rose-500" style={{ width: `${(centerCell.r / 255) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#4b5563]">
                  <span>Green Channel</span>
                  <span>{centerCell.g}</span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-emerald-500" style={{ width: `${(centerCell.g / 255) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#4b5563]">
                  <span>Blue Channel</span>
                  <span>{centerCell.b}</span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-blue-500" style={{ width: `${(centerCell.b / 255) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-[10px] text-[#6b7280] font-medium leading-normal max-w-[200px] mx-auto">
          <Crosshair className="w-8 h-8 text-[#9ca3af] mb-1" />
          Hover over the image canvas in the workspace to map neighborhood coordinates.
        </div>
      )}
    </div>
  );
}
