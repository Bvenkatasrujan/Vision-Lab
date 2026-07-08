"use client";

import React, { useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import { Download, FileCheck, Table, Image as ImageIcon, RefreshCw, CheckCircle } from "lucide-react";

export default function ExportAnalysis() {
  const {
    originalImage,
    preprocessedImage,
    colorConvertedImage,
    processedImage,
    segmentedImage,
    metadata,
    representationData,
    representationParams,
    preprocessingParams,
    colorConversionParams,
    imageProcessingParams,
    segmentationParams,
    exportParams,
  } = usePipelineStore();

  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const activeProcessed = processedImage || preprocessedImage;
  const { reportNotes } = exportParams;

  const showSuccessNotification = (type: string) => {
    setDownloadSuccess(type);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 3000);
  };

  const handleDownloadImage = () => {
    if (!activeProcessed) return;
    const link = document.createElement("a");
    link.href = activeProcessed;
    link.download = `VisionLab_Processed_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessNotification("image");
  };

  const handleDownloadCSV = () => {
    if (!representationData?.pixelMatrix) return;
    const matrix = representationData.pixelMatrix;
    let csvContent = "data:text/csv;charset=utf-8,";
    const header = Array.from({ length: representationData.samplingWidth }, (_, i) => `Col_${i}`).join(",");
    csvContent += header + "\n";
    matrix.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `VisionLab_Pixel_Matrix_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessNotification("csv");
  };

  const handleDownloadPDF = async () => {
    if (!originalImage) return;
    setIsCompiling(true);
    setError(null);
    try {
      const payload = {
        original_image: originalImage,
        preprocessed_image: preprocessedImage,
        color_converted_image: colorConvertedImage,
        processed_image: processedImage,
        segmented_image: segmentedImage,
        metadata: metadata || {},
        parameters: {
          representationParams,
          preprocessingParams,
          colorConversionParams,
          imageProcessingParams,
          segmentationParams,
        },
        report_notes: reportNotes,
      };

      const pdfBlob = await api.downloadReport(payload);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VisionLab_Analysis_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccessNotification("pdf");
    } catch (err: any) {
      setError(err.message || "Failed to compile report. Ensure backend is running.");
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <Download className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Export Actions
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
          Export Center
        </span>

        <div className="flex flex-col gap-2.5">
          {/* 1. PDF Report */}
          <button
            disabled={isCompiling}
            onClick={handleDownloadPDF}
            className={`w-full py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isCompiling ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            {isCompiling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-3.5 h-3.5" />
                <span>Compile PDF Report</span>
              </>
            )}
          </button>

          {/* 2. PNG Graphic */}
          <button
            onClick={handleDownloadImage}
            className="w-full py-2 rounded-lg bg-white border border-[#e5e7eb] hover:bg-[#f8fafc] text-[#4b5563] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>Download PNG Result</span>
          </button>

          {/* 3. CSV Matrix */}
          {representationData?.pixelMatrix && (
            <button
              onClick={handleDownloadCSV}
              className="w-full py-2 rounded-lg bg-white border border-[#e5e7eb] hover:bg-[#f8fafc] text-[#4b5563] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Table className="w-3.5 h-3.5 text-[#6b7280]" />
              <span>Download Pixel CSV Grid</span>
            </button>
          )}
        </div>

        {/* Dynamic notifications */}
        <div className="mt-2">
          {downloadSuccess && (
            <div className="p-2.5 rounded-lg bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>
                {downloadSuccess === "pdf"
                  ? "PDF report compiled."
                  : downloadSuccess === "image"
                  ? "PNG graphic saved."
                  : "Pixel CSV matrix saved."}
              </span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-[#dc2626] text-[10px] font-semibold leading-normal">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
