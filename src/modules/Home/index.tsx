"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Stage } from "../../types";
import {
  Play,
  Upload,
  Camera,
  Layers,
  Cpu,
  Binary,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function HomeModule() {
  const { setStage, setOriginalImage } = usePipelineStore();

  const handleQuickLoad = async (filename: string) => {
    try {
      const response = await fetch(`/images/${filename}`);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Mock image metadata
        const metadata = {
          name: filename,
          size: blob.size,
          width: 512,
          height: 512,
          format: "image/png",
        };
        setOriginalImage(base64data, metadata);
        setStage("representation");
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      alert(`Error loading test image ${filename}. Is the Next.js server running?`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-10 bg-gradient-to-b from-[#0a0d18] to-[#070a13] h-[calc(100vh-73px)]">
      {/* Hero Section */}
      <div className="relative glass-panel p-8 md:p-12 overflow-hidden flex flex-col gap-4 border border-glass-border">
        {/* Glow effect backdrops */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/10 rounded-full blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-brand-violet/10 rounded-full blur-[100px] animate-pulse-glow"></div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-glass-border w-fit text-[10px] font-bold text-brand-cyan tracking-wider uppercase">
            Interactive CV Suite
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome to <span className="gradient-text-glow font-black">VisionLab</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-3xl leading-relaxed font-medium">
            An academic-grade interactive playground for digital image processing and computer vision. Explore how analog light signals translate to digital matrices, apply spatial filters, extract histogram equalization curves, and segment features with contour detection.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => setStage("acquisition")}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-teal text-slate-950 font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Processing</span>
            </button>
            <button
              onClick={() => setStage("acquisition")}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 border border-glass-border text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Quick Load Benchmark Images */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-slate-300 tracking-wide uppercase px-1">
          Quick-Load Benchmarks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "cameraman.png",
              title: "Grayscale Cameraman",
              desc: "Academic standard for sampling, quantization, and edge filters.",
              badge: "Grayscale (Luminance)",
            },
            {
              name: "coins.png",
              title: "Synthetic Coins",
              desc: "Perfect for object segmentation, morphology, and counting.",
              badge: "High Contrast",
            },
            {
              name: "test_pattern.png",
              title: "Resolution Grid",
              desc: "Radial grids and spatial scales ideal for sub-sampling and scaling.",
              badge: "Geometric Frequency",
            },
            {
              name: "color_chart.png",
              title: "Color Checker",
              desc: "Rich multi-channel gradients for color-space & RGB histograms.",
              badge: "Color (RGB/HSV)",
            },
          ].map((img) => (
            <div
              key={img.name}
              className="glass-panel p-5 flex flex-col justify-between gap-4 border border-glass-border hover:border-brand-cyan/35 hover:shadow-[0_4px_20px_rgba(6,182,212,0.06)] group transition-all"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/40 w-fit">
                  {img.badge}
                </span>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {img.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal font-medium">
                  {img.desc}
                </p>
              </div>
              <button
                onClick={() => handleQuickLoad(img.name)}
                className="w-full py-2 rounded-lg bg-slate-900 border border-glass-border text-[11px] font-bold text-slate-300 group-hover:text-slate-950 group-hover:bg-gradient-to-r group-hover:from-brand-cyan group-hover:to-brand-teal group-hover:border-transparent transition-all cursor-pointer text-center"
              >
                Load {img.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sequential Processing Pipeline Flow */}
      <div className="glass-panel p-6 border border-glass-border flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 pb-3 border-b border-glass-border">
          <h2 className="text-sm font-bold text-slate-300 tracking-wide uppercase">
            Image Processing Curriculum Pipeline
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            VisionLab mirrors the sequence taught in standard computer vision college courses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "Phase 1: Input",
              title: "Acquisition & Rep",
              desc: "Acquire light patterns via WebRTC or uploads. Sub-sample/quantize to visualize the analog-to-digital transition.",
              icon: Binary,
            },
            {
              step: "Phase 2: Prep",
              title: "Preprocessing & Colors",
              desc: "Normalize intensity, adjust contrast, and shift color spaces (RGB to HSV / Grayscale) for downstream analysis.",
              icon: Layers,
            },
            {
              step: "Phase 3: Filtering",
              title: "Convolution & Edges",
              desc: "Convolve spatial kernels for blurring and sharpening. Run thresholding, morphological erosion/dilation, and Sobel filters.",
              icon: Cpu,
            },
            {
              step: "Phase 4: Features",
              title: "Segmentation & Export",
              desc: "Extract contours, calculate geometric properties, compare the structural delta, and compile PDF reports.",
              icon: CheckCircle,
            },
          ].map((pipe, idx) => {
            const Icon = pipe.icon;
            return (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-glass-border flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-cyan" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">
                    {pipe.step}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200">{pipe.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal font-medium">
                    {pipe.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
