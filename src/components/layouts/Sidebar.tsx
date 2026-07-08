"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Stage } from "../../types";
import {
  Camera,
  Binary,
  Sliders,
  Palette,
  Crosshair,
  BarChart3,
  Cpu,
  Layers,
  Split,
  Download,
  Lock,
} from "lucide-react";

interface SidebarItem {
  id: Stage;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "acquisition", label: "Image Acquisition", icon: Camera, description: "Gallery or Webcam Camera" },
  { id: "representation", label: "Image Representation", icon: Binary, description: "Sampling & Bit Quantization" },
  { id: "preprocessing", label: "Preprocessing", icon: Sliders, description: "Spatial Denoising & Point Ops" },
  { id: "color-conversion", label: "Color Space", icon: Palette, description: "RGB, HSV & CIELAB Trans" },
  { id: "pixel-analysis", label: "Pixel Explorer", icon: Crosshair, description: "Interactive Coordinate Grid" },
  { id: "histogram", label: "Histogram Analysis", icon: BarChart3, description: "CDF plots & Equalizations" },
  { id: "image-processing", label: "Image Processing", icon: Cpu, description: "Edge, Morphology, Filters" },
  { id: "segmentation", label: "Feature Extraction", icon: Layers, description: "Contours & Object Profiling" },
  { id: "comparison", label: "Result Comparison", icon: Split, description: "SSIM maps & Sliding delta" },
  { id: "export", label: "Export Report", icon: Download, description: "Download CSV grids & PDF" },
];

export default function Sidebar() {
  const { currentStage, originalImage, setStage } = usePipelineStore();

  const isLocked = (stage: Stage): boolean => {
    if (stage === "acquisition") return false;
    return !originalImage; // Lock subsequent stages until image is acquired
  };

  return (
    <aside className="w-64 bg-white border-r border-[#e5e7eb] flex flex-col justify-between shrink-0 h-full overflow-y-auto select-none">
      <div className="py-4 px-3 flex flex-col gap-1">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-bold tracking-wider text-[#6b7280] uppercase">DIP Chapters</p>
        </div>

        {SIDEBAR_ITEMS.map((item, idx) => {
          const locked = isLocked(item.id);
          const active = currentStage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              disabled={locked}
              onClick={() => setStage(item.id)}
              className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                active
                  ? "bg-[#eff6ff] border border-[#dbeafe] text-[#2563eb]"
                  : locked
                  ? "opacity-40 cursor-not-allowed text-[#9ca3af]"
                  : "text-[#4b5563] hover:text-[#111827] hover:bg-[#f8fafc] border border-transparent"
              }`}
            >
              <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                {locked ? (
                  <Lock className="w-3.5 h-3.5 text-[#9ca3af]" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-[#2563eb]" : "text-[#6b7280] group-hover:text-[#4b5563]"}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold truncate leading-snug">
                  {idx + 1}. {item.label}
                </div>
                <p className="text-[9px] text-[#6b7280] truncate leading-normal">
                  {item.description}
                </p>
              </div>
              
              {/* Highlight bar */}
              {active && (
                <div className="w-1 h-3 rounded-full bg-[#2563eb] self-center"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#e5e7eb] bg-[#f8fafc] text-[9px] text-[#6b7280] leading-relaxed">
        <p className="font-semibold text-[#4b5563]">Pipeline Memory Model</p>
        <p className="mt-1">Images travel down the lattice. Tweak upstream sliders to recalculate downstream states automatically.</p>
      </div>
    </aside>
  );
}
