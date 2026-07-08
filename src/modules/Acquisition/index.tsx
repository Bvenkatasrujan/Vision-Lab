"use client";

import React, { useRef, useState, useEffect } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { api } from "../../services/api";
import {
  Upload,
  Camera,
  Video,
  VideoOff,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BookOpen
} from "lucide-react";

export default function AcquisitionModule() {
  const { originalImage, metadata, setOriginalImage, setStage } = usePipelineStore();
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");
  
  // Camera variables
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Stop camera tracks helper
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraLoading(true);
    try {
      stopCamera();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError(
        "Could not access webcam. Ensure camera permissions are enabled in your browser settings."
      );
    } finally {
      setIsCameraLoading(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/png");
    processAcquiredImage(base64Image, `Captured_Frame_${Date.now()}.png`);
    stopCamera();
  };

  const processAcquiredImage = async (base64Str: string, filename: string) => {
    setUploadError(null);
    setIsValidating(true);
    try {
      const response = await api.validateImage(base64Str, filename);
      if (response.valid) {
        setOriginalImage(base64Str, response.metadata);
      } else {
        setUploadError("Image failed backend validation checks.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to validate image. Ensure API backend is running.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only PNG, JPEG, and WebP images are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Str = reader.result as string;
      processAcquiredImage(base64Str, file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 px-8 py-8 flex flex-col gap-6 bg-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col gap-1.5 pb-4 border-b border-[#e5e7eb]">
        <h2 className="text-lg font-black tracking-tight text-[#111827]">1. Image Acquisition</h2>
        <p className="text-xs text-[#6b7280] font-medium leading-relaxed max-w-4xl">
          Load an image into the digital laboratory. Upload a file or capture a webcam photo to populate the workspace coordinates and channels.
        </p>
      </div>

      {/* Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 flex flex-col gap-3 min-h-[340px] justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#2563eb]" /> Acquisition Source
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-[#f8fafc] rounded-lg p-2 border border-[#e5e7eb] overflow-hidden relative min-h-[260px]">
            {activeTab === "upload" ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl py-12 px-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all w-full h-full ${
                  dragActive ? "border-[#2563eb] bg-[#eff6ff]/30" : "border-[#cbd5e1] hover:border-[#94a3b8]"
                }`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileInput}
                />
                <div className="w-10 h-10 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] shadow-sm">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-[#111827]">
                    Drag & drop here, or <span className="text-[#2563eb] underline">browse</span>
                  </p>
                  <p className="text-[9px] text-[#6b7280] font-semibold">Supports PNG, JPEG, WebP up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-between p-2">
                <div className="aspect-video w-full rounded-xl bg-slate-900 border border-[#e5e7eb] overflow-hidden relative flex items-center justify-center min-h-[180px]">
                  {cameraError ? (
                    <div className="flex flex-col items-center gap-1.5 text-center p-3">
                      <VideoOff className="w-6 h-6 text-[#dc2626]" />
                      <p className="text-[10px] font-bold text-red-400">{cameraError}</p>
                    </div>
                  ) : isCameraLoading ? (
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  ) : stream ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <Video className="w-6 h-6 text-white" />
                  )}
                </div>
                {stream && (
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      onClick={stopCamera}
                      className="px-3 py-1.5 rounded border border-[#e5e7eb] bg-white text-[#4b5563] text-[10px] font-bold hover:bg-[#f8fafc] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCapture}
                      className="px-3 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[10px] font-bold cursor-pointer"
                    >
                      Capture Photo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 flex flex-col gap-3 min-h-[340px] justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" /> Acquired Image Preview
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-[#f8fafc] rounded-lg p-2 border border-[#e5e7eb] overflow-hidden relative min-h-[260px]">
            {originalImage ? (
              <img src={originalImage} alt="Acquired visual grid" className="max-h-[220px] max-w-full rounded border border-[#e5e7eb] object-contain shadow-sm bg-white" />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center py-6">
                <ImageIcon className="w-8 h-8 text-[#9ca3af]" />
                <p className="text-xs text-[#6b7280] font-bold">No image in memory</p>
                <p className="text-[9px] text-[#9ca3af] max-w-xs font-semibold">Perform file drop or camera capture to load.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm">
        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280] mb-4 pb-2 border-b border-[#f1f5f9]">
          Acquisition Controls
        </h3>
        <div className="flex gap-2 p-1 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg w-fit">
          <button
            onClick={() => { stopCamera(); setActiveTab("upload"); }}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "upload" ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm" : "text-[#6b7280] hover:text-[#4b5563]"
            }`}
          >
            Upload Image File
          </button>
          <button
            onClick={() => { setActiveTab("camera"); handleStartCamera(); }}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "camera" ? "bg-white text-[#2563eb] border border-[#e5e7eb] shadow-sm" : "text-[#6b7280] hover:text-[#4b5563]"
            }`}
          >
            Activate Camera Feed
          </button>
        </div>

        {(isValidating || uploadError) && (
          <div className={`p-4 border rounded-lg flex gap-3 items-start mt-4 ${uploadError ? "border-red-100 bg-red-50 text-[#dc2626]" : "border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]"}`}>
            {uploadError ? (
              <>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-[10px] font-bold leading-normal">{uploadError}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
                <span className="text-[10px] font-bold leading-normal">Parsing digital channels on FastAPI engine...</span>
              </>
            )}
          </div>
        )}

        {originalImage && (
          <button
            onClick={() => setStage("representation")}
            className="mt-5 flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold shadow-md shadow-[#2563eb]/10 cursor-pointer"
          >
            <span>Proceed to Digital Representation</span>
          </button>
        )}
      </div>

      {/* Theory */}
      <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-6">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563eb] mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2563eb]" /> Digital Image Acquisition Theory
        </h4>
        <div className="text-xs text-[#4b5563] leading-relaxed font-medium flex flex-col gap-2">
          <p>
            <b>CCD & CMOS Sensors:</b> Digital image acquisition captures incoming light particles (photons) on a semiconductor grid. Charge-Coupled Devices (CCD) or Active Pixel Sensors (CMOS) measure electrical charges, registering intensity levels for each color band.
          </p>
          <p>
            <b>Continuous to Discrete:</b> The raw optical scene is a continuous 2D light field $f(x,y)$. Image acquisition sample this continuous signal onto a spatial grid of row/column elements, mapping luminance into discrete digital intensity integers (0 to 255).
          </p>
        </div>
      </div>
    </div>
  );
}
