"use client";

import React from "react";
import Navbar from "../../components/layouts/Navbar";
import Sidebar from "../../components/layouts/Sidebar";
import Footer from "../../components/layouts/Footer";
import { usePipelineStore } from "../../store/usePipelineStore";

// Import center canvas views
import AcquisitionModule from "../../modules/Acquisition";
import RepresentationModule from "../../modules/Representation";
import PreprocessingModule from "../../modules/Preprocessing";
import ColorConversionModule from "../../modules/ColorConversion";
import PixelAnalysisModule from "../../modules/PixelAnalysis";
import HistogramModule from "../../modules/Histogram";
import ImageProcessingModule from "../../modules/ImageProcessing";
import SegmentationModule from "../../modules/Segmentation";
import ComparisonModule from "../../modules/Comparison";
import ExportModule from "../../modules/Export";

// Import right-side analysis views
import AcquisitionAnalysis from "../../modules/Acquisition/AnalysisPanel";
import RepresentationAnalysis from "../../modules/Representation/AnalysisPanel";
import PreprocessingAnalysis from "../../modules/Preprocessing/AnalysisPanel";
import ColorConversionAnalysis from "../../modules/ColorConversion/AnalysisPanel";
import PixelAnalysisAnalysis from "../../modules/PixelAnalysis/AnalysisPanel";
import HistogramAnalysis from "../../modules/Histogram/AnalysisPanel";
import ImageProcessingAnalysis from "../../modules/ImageProcessing/AnalysisPanel";
import SegmentationAnalysis from "../../modules/Segmentation/AnalysisPanel";
import ComparisonAnalysis from "../../modules/Comparison/AnalysisPanel";
import ExportAnalysis from "../../modules/Export/AnalysisPanel";

export default function WorkspacePage() {
  const { currentStage } = usePipelineStore();

  // Renders the center canvas and controls
  const renderMainCanvas = () => {
    switch (currentStage) {
      case "acquisition":
        return <AcquisitionModule />;
      case "representation":
        return <RepresentationModule />;
      case "preprocessing":
        return <PreprocessingModule />;
      case "color-conversion":
        return <ColorConversionModule />;
      case "pixel-analysis":
        return <PixelAnalysisModule />;
      case "histogram":
        return <HistogramModule />;
      case "image-processing":
        return <ImageProcessingModule />;
      case "segmentation":
        return <SegmentationModule />;
      case "comparison":
        return <ComparisonModule />;
      case "export":
        return <ExportModule />;
      default:
        return <AcquisitionModule />;
    }
  };

  // Renders the right-side dynamic diagnostic/analysis tools
  const renderAnalysisPanel = () => {
    switch (currentStage) {
      case "acquisition":
        return <AcquisitionAnalysis />;
      case "representation":
        return <RepresentationAnalysis />;
      case "preprocessing":
        return <PreprocessingAnalysis />;
      case "color-conversion":
        return <ColorConversionAnalysis />;
      case "pixel-analysis":
        return <PixelAnalysisAnalysis />;
      case "histogram":
        return <HistogramAnalysis />;
      case "image-processing":
        return <ImageProcessingAnalysis />;
      case "segmentation":
        return <SegmentationAnalysis />;
      case "comparison":
        return <ComparisonAnalysis />;
      case "export":
        return <ExportAnalysis />;
      default:
        return <AcquisitionAnalysis />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111827] select-none">
      {/* Top Navbar */}
      <Navbar />

      {/* Tri-Column workspace */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-100px)]">
        {/* Left column: Pipeline Navigation */}
        <Sidebar />

        {/* Center column: Main Canvas & Controls */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto border-r border-[#e5e7eb] bg-[#f8fafc]">
          {renderMainCanvas()}
        </main>

        {/* Right column: Diagnostic / Analysis Panel */}
        <aside className="w-80 overflow-y-auto bg-white border-l border-[#e5e7eb] flex flex-col">
          {renderAnalysisPanel()}
        </aside>
      </div>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}
