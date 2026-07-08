"use client";

import React from "react";
import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="h-10 bg-white border-t border-[#e5e7eb] px-6 flex items-center justify-between text-[10px] text-[#6b7280] font-medium shrink-0 z-10">
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#2563eb]">
        <Cpu className="w-3.5 h-3.5" />
        <span>Acquire • Process • Analyze • Visualize</span>
      </div>
      <div>
        <span>VisionLab Laboratory Suite</span>
        <span className="mx-2 text-[#e5e7eb]">|</span>
        <span>macOS Engine v1.0</span>
      </div>
    </footer>
  );
}
