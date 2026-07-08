"use client";

import React from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { BarChart3, RefreshCw } from "lucide-react";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

export default function HistogramAnalysis() {
  const { histogramData, histogramParams } = usePipelineStore();
  const { equalize, channel } = histogramParams;

  const labels = Array.from({ length: 256 }, (_, i) => i.toString());

  const getChannelData = () => {
    if (!histogramData) return [];
    switch (channel) {
      case "red":
        return histogramData.red;
      case "green":
        return histogramData.green;
      case "blue":
        return histogramData.blue;
      default:
        return histogramData.grayscale;
    }
  };

  const getChannelColor = (opacity: number = 1) => {
    switch (channel) {
      case "red":
        return `rgba(239, 68, 68, ${opacity})`;
      case "green":
        return `rgba(16, 185, 129, ${opacity})`;
      case "blue":
        return `rgba(59, 130, 246, ${opacity})`;
      default:
        return `rgba(71, 85, 105, ${opacity})`; // slate-600
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: `${channel.toUpperCase()} Channel`,
        data: getChannelData(),
        borderColor: getChannelColor(1),
        backgroundColor: getChannelColor(0.12),
        borderWidth: 1.2,
        pointRadius: 0,
        fill: true,
        yAxisID: "y-histogram",
      },
      ...(histogramData && channel === "intensity"
        ? [
            {
              label: "Cumulative (CDF)",
              data: histogramData.cumulative,
              borderColor: "rgba(139, 92, 246, 0.8)", // Violet
              borderWidth: 1.2,
              pointRadius: 0,
              fill: false,
              yAxisID: "y-cdf",
            },
          ]
        : []),
      ...(histogramData?.equalizedGrayscale && equalize && channel === "intensity"
        ? [
            {
              label: "Equalized Grayscale",
              data: histogramData.equalizedGrayscale,
              borderColor: "rgba(37, 99, 235, 0.9)", // Brand Blue
              borderWidth: 1.2,
              pointRadius: 0,
              fill: false,
              yAxisID: "y-histogram",
            },
          ]
        : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#4b5563",
          font: { size: 8, weight: "bold" as const },
          boxWidth: 8,
        },
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0, 0, 0, 0.03)" },
        ticks: { color: "#6b7280", font: { size: 7 } },
      },
      "y-histogram": {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: { color: "rgba(0, 0, 0, 0.03)" },
        ticks: { color: "#6b7280", font: { size: 7 } },
      },
      ...(channel === "intensity"
        ? {
            "y-cdf": {
              type: "linear" as const,
              display: true,
              position: "right" as const,
              grid: { drawOnChartArea: false },
              ticks: { color: "rgba(139, 92, 246, 0.8)", font: { size: 7 } },
            },
          }
        : {}),
    },
  };

  return (
    <div className="p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e5e7eb]">
        <BarChart3 className="w-4 h-4 text-[#2563eb]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
          Histogram Analysis
        </h3>
      </div>

      {histogramData ? (
        <div className="flex flex-col gap-4 flex-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]">
            Frequency Distribution Plots
          </span>

          <div className="h-56 bg-white border border-[#e5e7eb] rounded-lg p-2.5 shadow-inner">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg flex flex-col gap-2">
            <span className="text-[9px] text-[#6b7280] font-bold uppercase">Luminance Statistics</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-[#6b7280]">Entropy:</span>{" "}
                <span className="font-bold text-[#111827]">7.42 bits</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Mean:</span>{" "}
                <span className="font-bold text-[#111827]">118.5 px</span>
              </div>
              <div>
                <span className="text-[#6b7280]">Equalization:</span>{" "}
                <span className={`font-bold ${equalize ? "text-[#16a34a]" : "text-[#6b7280]"}`}>
                  {equalize ? "Active" : "Bypassed"}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280]">Bands:</span>{" "}
                <span className="font-bold text-[#111827]">3 Channels</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-[10px] text-[#6b7280] font-medium leading-normal max-w-[200px] mx-auto">
          <BarChart3 className="w-8 h-8 text-[#9ca3af] mb-1" />
          Frequency distribution matrices will populate upon pipeline calculation.
        </div>
      )}
    </div>
  );
}
