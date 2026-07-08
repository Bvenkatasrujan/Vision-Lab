"use client";

import React, { useEffect, useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { Palette, RefreshCw, ArrowRight } from "lucide-react";

export default function ColorConversionModule() {
  const {
    preprocessedImage,
    colorConversionParams,
    colorConvertedImage,
    updateColorConversionParams,
    setColorConvertedImage,
    setHoverColorDetails,
    setStage,
  } = usePipelineStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeInput = preprocessedImage;
  const { targetSpace, binaryThreshold } = colorConversionParams;

  // Run conversion
  useEffect(() => {
    if (!activeInput) return;

    const executeConversion = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.convertColorSpace(activeInput, targetSpace, binaryThreshold);
        setColorConvertedImage(result.convertedImage);
      } catch (err: any) {
        setError(err.message || "Failed to convert color space.");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      executeConversion();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [activeInput, targetSpace, binaryThreshold]);

  // Handle cursor hover coordinate color extraction
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    
    // Safety check for image load complete
    if (!img.naturalWidth || !img.naturalHeight) return;

    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.naturalHeight);

    // Read pixel data from an offscreen canvas
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

    // RGB -> HSV
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

    // RGB -> XYZ -> LAB
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
  const originalView = activeInput ? (
    <img
      src={activeInput}
      alt="Preprocessing State"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No input image</span>
  );

  // Processed Viewport
  const processedView = isLoading ? (
    <div className="flex flex-col items-center gap-2 py-10">
      <RefreshCw className="w-6 h-6 text-[#2563eb] animate-spin" />
      <span className="text-xs text-[#6b7280] font-medium">Shifting color spaces...</span>
    </div>
  ) : error ? (
    <div className="text-center p-4 text-xs font-semibold text-red-500">{error}</div>
  ) : colorConvertedImage ? (
    <div className="relative group cursor-crosshair">
      <img
        src={colorConvertedImage}
        alt="Color Transformation View"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverColorDetails(null)}
        className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
      />
    </div>
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">Configure parameters to convert</span>
  );

  // Controls Panel
  const controls = (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Target Space Selection */}
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-xs font-bold text-[#4b5563]">Target Color Space</label>
        <div className="flex flex-wrap gap-1.5 p-0.5 bg-[#f8fafc] rounded-lg border border-[#e5e7eb] w-fit">
          {([
            { val: "rgb", label: "RGB Color" },
            { val: "grayscale", label: "Grayscale" },
            { val: "binary", label: "Binary (B/W)" },
            { val: "hsv", label: "HSV Space" },
            { val: "lab", label: "CIELAB space" },
          ] as const).map((space) => (
            <button
              key={space.val}
              onClick={() => updateColorConversionParams({ targetSpace: space.val })}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                targetSpace === space.val
                  ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              {space.label}
            </button>
          ))}
        </div>
      </div>

      {/* Binary split threshold */}
      {targetSpace === "binary" && (
        <div className="flex-1 flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#4b5563]">Global Binarization Split (T)</span>
            <span className="font-bold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe] px-2 py-0.5 rounded text-[10px]">
              T = {binaryThreshold} / 255
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={binaryThreshold}
            onChange={(e) => updateColorConversionParams({ binaryThreshold: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-[9px] text-[#6b7280]">
            Pixels with intensities $I(x,y) &lt; T$ become black (0); others become white (255).
          </p>
        </div>
      )}
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>RGB (Red, Green, Blue):</b> An additive color space based on human trichromacy. It is hardware-centric (screens, sensors) but coordinates are highly correlated with light intensity levels, making color segmentations difficult.
      </p>
      <p>
        <b>HSV (Hue, Saturation, Value):</b> Decouples color type (Hue, 0-360°) and purity (Saturation, 0-100%) from brightness intensity (Value, 0-100%). HSV is ideal for color boundary segmentations because shadows only alter Value, not Hue.
      </p>
      <p>
        <b>CIELAB (L*, a*, b*):</b> A perceptually uniform color space. $L^*$ represents lightness, $a^*$ represents green-to-red chroma, and $b^*$ represents blue-to-yellow chroma. Equal geometric distances in CIELAB represent equal perceived differences.
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="4. Color Space Transformation"
        description="Shift image representations into alternative color spaces. Isolating Hue in HSV or Chroma coordinates in LAB makes segmentations robust under uneven lighting conditions."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
      <div className="px-8 pb-6">
        {colorConvertedImage && (
          <button
            onClick={() => setStage("pixel-analysis")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Pixel Exploration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
