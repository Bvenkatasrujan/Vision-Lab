"use client";

import React from "react";
import Link from "next/link";
import {
  Play,
  Binary,
  Layers,
  Cpu,
  Columns,
  Workflow,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      
      {/* 1. Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e5e7eb] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#2563eb] flex items-center justify-center text-white font-bold shadow-md shadow-[#2563eb]/20">
            VL
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[#111827]">VisionLab</h1>
            <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">DIP Laboratory Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-bold text-[#6b7280]">
          <a href="#about" className="hover:text-[#2563eb] transition-colors">DIP Overview</a>
          <a href="#pipeline" className="hover:text-[#2563eb] transition-colors">Pipeline</a>
          <a href="#applications" className="hover:text-[#2563eb] transition-colors">Applications</a>
          <Link
            href="/workspace"
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all text-xs font-bold shadow-sm shadow-[#2563eb]/10"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Start Lab</span>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-[#f8fafc] to-white border-b border-[#e5e7eb] overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2563eb]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-8 flex flex-col items-center text-center gap-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff6ff] border border-[#dbeafe] text-[10px] font-extrabold text-[#2563eb] tracking-wider uppercase">
            Interactive Learning Sandbox
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#111827] max-w-4xl leading-tight">
            Interactive Computer Vision & <br className="hidden md:inline" />
            <span className="text-[#2563eb]">Digital Image Processing</span> Lab
          </h1>
          <p className="text-sm md:text-base text-[#6b7280] max-w-2xl leading-relaxed font-medium">
            This is not Photoshop. This is not an image editor. VisionLab is an interactive, academic playground designed to explain the mathematical stages of computer vision—from pixel lattices to edge gradients and contour measurements.
          </p>

          <div className="flex gap-4 mt-4">
            <Link
              href="/workspace"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black hover:shadow-lg hover:shadow-[#2563eb]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start VisionLab</span>
            </Link>
            <a
              href="#about"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-[#e5e7eb] hover:bg-[#f8fafc] text-[#4b5563] font-bold transition-all text-xs"
            >
              <span>Explore Curriculum</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. What is CV & DIP? Section */}
      <section id="about" className="py-20 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Card 1: What is CV? */}
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-[#111827]">What is Computer Vision?</h2>
            <p className="text-xs text-[#6b7280] leading-relaxed font-medium">
              Computer Vision (CV) is the field of computer science focused on creating digital systems that process, analyze, and interpret visual data (images and videos) in the same way human eyes do. It translates raw pixel arrays into semantic descriptions, identifying objects, actions, and geometries in real-world scenes.
            </p>
          </div>

          {/* Card 2: What is DIP? */}
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <Binary className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-[#111827]">What is Digital Image Processing?</h2>
            <p className="text-xs text-[#6b7280] leading-relaxed font-medium">
              Digital Image Processing (DIP) lies at the core of computer vision. It is the mathematical manipulation of multidimensional arrays representing light intensity values. By convolving spatial filter matrices, shifting color scales, or equalizing histograms, DIP alters image attributes to simplify feature extraction.
            </p>
          </div>

        </div>
      </section>

      {/* 4. VisionLab Pipeline Section */}
      <section id="pipeline" className="py-20 bg-[#f8fafc] border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-8 flex flex-col gap-10">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl font-black tracking-tight text-[#111827]">The VisionLab Curriculum</h2>
            <p className="text-xs text-[#6b7280] font-medium">Everything happens inside ONE workspace, mirroring standard academic textbooks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { idx: "1-2", title: "Acquire & Represent", desc: "Upload images, stream webcam frames, and inspect the sampling/quantization pixel structures.", icon: Binary },
              { idx: "3-4", title: "Preprocess & Transform", desc: "Sharpen, rotate, smooth out sensor noise, and convert RGB to HSV/LAB spaces.", icon: Layers },
              { idx: "5-6", title: "Explore & Equalize", desc: "Hover coordinates to magnifying neighbor cells, and equalize contrast distributions.", icon: Columns },
              { idx: "7-8", title: "Convolve & Segment", desc: "Apply Sobel edges, Canny trackers, morphological elements, and isolate object contours.", icon: Cpu },
              { idx: "9-10", title: "Compare & Export", desc: "Analyze MSE/SSIM deltas with split-sliders and compile structured PDF reports.", icon: Workflow }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="bg-white border border-[#e5e7eb] rounded-xl p-5 flex flex-col gap-3.5 shadow-sm hover:border-[#2563eb] transition-colors">
                  <span className="text-[10px] font-black text-[#2563eb] uppercase bg-[#eff6ff] px-2 py-0.5 rounded w-fit">
                    CH {step.idx}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon className="w-4 h-4 text-[#6b7280]" />
                    <h4 className="text-xs font-bold text-[#111827]">{step.title}</h4>
                  </div>
                  <p className="text-[10px] text-[#6b7280] leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Applications Section */}
      <section id="applications" className="py-20 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-8 flex flex-col gap-10">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl font-black tracking-tight text-[#111827]">Practical Applications</h2>
            <p className="text-xs text-[#6b7280] font-medium">DIP operators drive critical real-world systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Industrial Diagnostics", desc: "Connected component contours measure shape circularity and pixel bounding boxes to count assemblies and scan defects on conveyor belts.", icon: Sparkles },
              { title: "Satellite Analysis", desc: "Histogram equalizations and local adaptive thresholding balance uneven shadows, enhancing agricultural crop borders and mapping terrains.", icon: Globe },
              { title: "Optical Character Recognition", desc: "Spatial binarization and morphological opening/closing isolate characters from document backgrounds, simplifying text extraction.", icon: Zap }
            ].map((app, idx) => {
              const Icon = app.icon;
              return (
                <div key={idx} className="bg-[#f8fafc] border border-[#e5e7eb] rounded-xl p-6 flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111827]">{app.title}</h4>
                  <p className="text-xs text-[#6b7280] leading-relaxed font-medium">
                    {app.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Technology Stack */}
      <section className="py-20 bg-[#f8fafc] border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-8 flex flex-col gap-6 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6b7280]">Academic Technology Architecture</h2>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-extrabold text-[#4b5563]">
            <span>Next.js 16</span>
            <span className="text-[#cbd5e1]">•</span>
            <span>React 19</span>
            <span className="text-[#cbd5e1]">•</span>
            <span>TypeScript</span>
            <span className="text-[#cbd5e1]">•</span>
            <span>FastAPI Backend</span>
            <span className="text-[#cbd5e1]">•</span>
            <span>OpenCV Python</span>
            <span className="text-[#cbd5e1]">•</span>
            <span>NumPy</span>
            <span className="text-[#cbd5e1]">•</span>
            <span>ReportLab PDF</span>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <section className="py-24 bg-white text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl font-black text-[#111827] tracking-tight">Ready to start the experiments?</h2>
        <p className="text-xs text-[#6b7280] max-w-md font-medium leading-relaxed">
          No signups, no credit cards, no complex configurations. Open the digital workspace directly and start processing.
        </p>
        <Link
          href="/workspace"
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black hover:shadow-lg hover:shadow-[#2563eb]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Enter Digital Workspace</span>
        </Link>
      </section>
      
      {/* Footer */}
      <footer className="py-6 border-t border-[#e5e7eb] bg-[#f8fafc] text-center text-[10px] text-[#94a3b8] font-semibold uppercase tracking-wider">
        VisionLab Laboratory Suite • macOS Engine 1.0
      </footer>
    </div>
  );
}
