"use client";

import React from "react";
import { Image as ImageIcon, BookOpen } from "lucide-react";

interface ModuleWorkspaceProps {
  title: string;
  description: string;
  originalView: React.ReactNode;
  processedView: React.ReactNode;
  controls: React.ReactNode;
  theory: React.ReactNode;
}

export default function ModuleWorkspace({
  title,
  description,
  originalView,
  processedView,
  controls,
  theory,
}: ModuleWorkspaceProps) {
  return (
    <div className="flex-1 px-8 py-8 flex flex-col gap-6 bg-[#f8fafc]">
      
      {/* Title & Description Header */}
      <div className="flex flex-col gap-1.5 pb-4 border-b border-[#e5e7eb]">
        <h2 className="text-lg font-black tracking-tight text-[#111827]">{title}</h2>
        <p className="text-xs text-[#6b7280] font-medium leading-relaxed max-w-4xl">{description}</p>
      </div>

      {/* Main Viewports: Original vs Processed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Image */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 flex flex-col gap-3 min-h-[340px] justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" /> Original Input
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-[#f8fafc] rounded-lg p-2 border border-[#e5e7eb] overflow-hidden relative min-h-[260px]">
            {originalView}
          </div>
        </div>

        {/* Right: Output/Processed Image */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 flex flex-col gap-3 min-h-[340px] justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" /> Processed Preview
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-[#f8fafc] rounded-lg p-2 border border-[#e5e7eb] overflow-hidden relative min-h-[260px]">
            {processedView}
          </div>
        </div>
      </div>

      {/* Parameter Controls Panel */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm">
        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280] mb-4 pb-2 border-b border-[#f1f5f9]">
          Parameter Controls
        </h3>
        <div>{controls}</div>
      </div>

      {/* Academic Theory Panel */}
      <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-6">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563eb] mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2563eb]" /> Digital Image Processing Theory
        </h4>
        <div className="text-xs text-[#4b5563] leading-relaxed font-medium flex flex-col gap-2">
          {theory}
        </div>
      </div>

    </div>
  );
}
