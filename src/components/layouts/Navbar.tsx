"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Cpu, Database, RefreshCw, Layers } from "lucide-react";

export default function Navbar() {
  const { originalImage, resetPipeline } = usePipelineStore();
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/health", {
          signal: AbortSignal.timeout(2000),
        });
        if (response.ok) {
          setIsBackendOnline(true);
        } else {
          setIsBackendOnline(false);
        }
      } catch (err) {
        setIsBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e5e7eb] px-6 h-15 flex items-center justify-between shrink-0">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-[#2563eb] flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-[#2563eb]/20">
          VL
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-[#111827]">
            VisionLab
          </h1>
          <p className="text-[9px] text-[#6b7280] font-extrabold uppercase tracking-wider">Enterprise Laboratory</p>
        </div>
      </Link>

      {/* Info & Global Actions */}
      <div className="flex items-center gap-3">
        {/* API connection indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8fafc] border border-[#e5e7eb]">
          <Database className={`w-3 h-3 ${isBackendOnline ? "text-[#16a34a]" : isBackendOnline === false ? "text-[#dc2626]" : "text-[#d97706]"}`} />
          <span className="text-[10px] font-bold text-[#4b5563]">
            API:{" "}
            {isBackendOnline ? (
              <span className="text-[#16a34a]">Connected</span>
            ) : isBackendOnline === false ? (
              <span className="text-[#dc2626]">Offline</span>
            ) : (
              <span className="text-[#d97706]">Checking...</span>
            )}
          </span>
        </div>

        {/* Pipeline Loaded Badge */}
        {originalImage && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff6ff] border border-[#dbeafe]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse"></span>
            <span className="text-[10px] font-bold text-[#2563eb]">Lattice Populated</span>
          </div>
        )}

        {/* Reset Lab Button */}
        <button
          onClick={() => {
            if (confirm("Reset current digital processing pipeline? All image layers will be cleared.")) {
              resetPipeline();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e7eb] hover:bg-[#f8fafc] text-[#4b5563] hover:text-[#111827] transition-all text-[10px] font-bold cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Lab</span>
        </button>
      </div>
    </header>
  );
}
