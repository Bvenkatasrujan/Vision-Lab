"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import ModuleWorkspace from "../../components/layouts/ModuleWorkspace";
import { FileText, Settings } from "lucide-react";

export default function ExportModule() {
  const {
    originalImage,
    processedImage,
    preprocessedImage,
    exportParams,
    updateExportParams,
  } = usePipelineStore();

  const activeProcessed = processedImage || preprocessedImage;
  const { reportNotes, includeMetadata, includeHistograms } = exportParams;

  // Original Viewport
  const originalView = originalImage ? (
    <img
      src={originalImage}
      alt="Acquisition Reference Input"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No input image</span>
  );

  // Processed Viewport
  const processedView = activeProcessed ? (
    <img
      src={activeProcessed}
      alt="Final Processed Output"
      className="max-h-[260px] object-contain rounded border border-[#e5e7eb] shadow-sm bg-white"
    />
  ) : (
    <span className="text-xs text-[#6b7280] font-medium">No processed output</span>
  );

  // Controls Panel
  const controls = (
    <div className="flex flex-col gap-4">
      {/* Parameters configuration */}
      <div className="flex flex-wrap gap-6 items-center bg-[#f8fafc] border border-[#e5e7eb] p-3.5 rounded-lg">
        <span className="text-[10px] font-extrabold uppercase text-[#6b7280] tracking-wider flex items-center gap-1.5 shrink-0">
          <Settings className="w-3.5 h-3.5 text-[#2563eb]" /> PDF Report Sections
        </span>
        
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4b5563] select-none font-bold">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => updateExportParams({ includeMetadata: e.target.checked })}
              className="w-3.5 h-3.5 rounded text-[#2563eb] accent-[#2563eb]"
            />
            <span>Include Parameter Log Tables</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4b5563] select-none font-bold">
            <input
              type="checkbox"
              checked={includeHistograms}
              onChange={(e) => updateExportParams({ includeHistograms: e.target.checked })}
              className="w-3.5 h-3.5 rounded text-[#2563eb] accent-[#2563eb]"
            />
            <span>Include Frequency Graphs</span>
          </label>
        </div>
      </div>

      {/* Notes Textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#4b5563] flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#2563eb]" /> Laboratory Research Notes & Observations
        </label>
        <textarea
          value={reportNotes}
          onChange={(e) => updateExportParams({ reportNotes: e.target.value })}
          rows={5}
          placeholder="Enter research summary observations, coordinate analyses, or algorithm evaluations. These notes compile directly into Section 4: Academic Observations of the ReportLab PDF."
          className="w-full bg-white border border-[#e5e7eb] rounded-lg p-3 text-xs text-[#111827] focus:outline-none focus:border-[#2563eb] font-medium leading-relaxed"
        />
      </div>
    </div>
  );

  // Theory Panel
  const theory = (
    <>
      <p>
        <b>Academic Report Compilation:</b> Packaging experimental configurations alongside processed image buffers and research evaluations represents a standard scientific workflow.
      </p>
      <p>
        <b>Dynamic PDF Layouts:</b> The FastAPI backend uses ReportLab libraries to compile parameter grids, image ratios, and user observations programmatically. Images are decoded from Base64 buffers and sized with aspect-ratio corrections to avoid distortions on standard letter pages.
      </p>
    </>
  );

  return (
    <div className="flex flex-col flex-1">
      <ModuleWorkspace
        title="10. Export Report"
        description="Compile observations, parameter tables, and image layers. Save processed results as high-fidelity PNG graphics, download spatial sub-grids as numeric CSV matrices, or trigger backend compilers to export PDF reports."
        originalView={originalView}
        processedView={processedView}
        controls={controls}
        theory={theory}
      />
    </div>
  );
}
