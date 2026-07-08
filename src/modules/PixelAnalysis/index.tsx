"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { Grid, ArrowRight } from "lucide-react";

export default function PixelAnalysisModule() {
  const {
    preprocessedImage,
    colorConvertedImage,
    pixelAnalysisParams,
    updatePixelAnalysisParams,
    setHoverColorDetails,
    setStage,
  } = usePipelineStore();

  const activeImage = colorConvertedImage || preprocessedImage;
  const { gridSize } = pixelAnalysisParams;

  // Track cursor movement to update color details globally
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    if (!img.naturalWidth || !img.naturalHeight) return;

    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.naturalHeight);

    // Read BGR pixel directly
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);

    const pixel = ctx.getImageData(
      Math.max(0, Math.min(img.naturalWidth - 1, x)),
      Math.max(0, Math.min(img.naturalHeight - 1, y)),
      1,
      1
    ).data;

    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

    // Standard conversions for tooltip coordinates
    const rf = r / 255, gf = g / 255, bf = b / 255;
    const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
    const d = max - min;
    let h = 0, s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
      switch (max) {
        case rf: h = (gf - bf) / d + (gf < bf ? 6 : 0); break;
        case gf: h = (bf - rf) / d + 2; break;
        case bf: h = (rf - gf) / d + 4; break;
      }
      h = Math.round(h * 60);
    }
    s = Math.round(s * 100);
    const vPct = Math.round(v * 100);

    // D65 reference CIELAB
    let r_n = rf > 0.04045 ? Math.pow((rf + 0.055) / 1.055, 2.4) : rf / 12.92;
    let g_n = gf > 0.04045 ? Math.pow((gf + 0.055) / 1.055, 2.4) : gf / 12.92;
    let b_n = bf > 0.04045 ? Math.pow((bf + 0.055) / 1.055, 2.4) : bf / 12.92;
    r_n *= 100; g_n *= 100; b_n *= 100;

    const x_c = r_n * 0.4124 + g_n * 0.3576 + b_n * 0.1805;
    const y_c = r_n * 0.2126 + g_n * 0.7152 + b_n * 0.0722;
    const z_c = r_n * 0.0193 + g_n * 0.1192 + b_n * 0.9505;

    const x_r = x_c / 95.047, y_r = y_c / 100.0, z_r = z_c / 108.883;
    const f = (val: number) => val > 0.008856 ? Math.pow(val, 1/3) : (7.787 * val) + (16/116);

    const l_lab = Math.round(116 * f(y_r) - 16);
    const a_lab = Math.round(500 * (f(x_r) - f(y_r)));
    const b_lab = Math.round(200 * (f(y_r) - f(z_r)));

    setHoverColorDetails({
      x, y, r, g, b, hex, h, s, v: vPct, l: l_lab, a: a_lab, b_lab
    });
  };

  // Original Viewport
  const originalView = preprocessedImage ? (
    <img
      src={preprocessedImage}
      alt="Preprocessing State"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No input image</span>
  );

  // Processed Viewport (Hover Explorer)
  const processedView = activeImage ? (
    <div className="relative group cursor-crosshair">
      <img
        src={activeImage}
        alt="Magnifier Active View"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverColorDetails(null)}
        className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
      />
    </div>
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No image loaded</span>
  );

  // Controls Panel
  const controls = (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-[#4b5563] flex items-center gap-1.5">
        <Grid className="w-3.5 h-3.5 text-[#2563eb]" /> Neighborhood Size (Convolve Box)
      </label>
      <div className="flex gap-1.5 p-0.5 bg-[#f8fafc] rounded-lg border border-[#e5e7eb] w-fit">
        {([3, 5, 7] as const).map((size) => (
          <button
            key={size}
            onClick={() => updatePixelAnalysisParams({ gridSize: size })}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              gridSize === size ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            {size} × {size} Matrix
          </button>
        ))}
      </div>
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>Neighborhood Processing:</b> Most Digital Image Processing (DIP) operators use spatial context. Instead of working on a single pixel in isolation, they compute output values by convolving a localized window of surrounding pixels (the neighborhood).
      </p>
      <p>
        <b>Spatial Matrices:</b> A $3\times3$ neighborhood contains 9 pixels; a $5\times5$ contains 25; a $7\times7$ contains 49. As the matrix size expands, operators gain a broader spatial context (higher low-frequency smoothing) but require more computations and can blur details.
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="5. Pixel Explorer"
        description="Inspect discrete pixel coordinates and local color values. Hovering over the canvas extracts neighboring coordinate intensites and channels, detailing how point values relate to spatial blocks."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
      <div className="px-8 pb-6">
        {activeImage && (
          <button
            onClick={() => setStage("histogram")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Histogram Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
