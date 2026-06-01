import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function TelemetryMonitor() {
  const { stats, gpuInfo } = useAppContext();

  return (
    <div className="border-[3px] border-pencil-black bg-white p-4 wobbly-md hand-shadow space-y-4 relative">
      {/* Decorative tape at top */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-pencil-black/10 border-x border-pencil-black/30 rotate-1 pointer-events-none" />

      <h3 className="text-sm font-bold text-pencil-black uppercase tracking-wider border-b-2 border-pencil-black pb-1.5 font-kalam">
        📊 Telemetry Monitor
      </h3>
      
      <div className="space-y-4 text-xs">
        {/* CPU Load */}
        <div>
          <div className="flex justify-between font-bold text-pencil-black mb-1">
            <span>CPU Load</span>
            <span className="font-mono">{stats.cpuLoad}%</span>
          </div>
          <div className="w-full h-4 bg-paper-muted border-2 border-pencil-black wobbly overflow-hidden">
            <div 
              className="h-full bg-accent-blue border-r-2 border-pencil-black transition-all duration-300" 
              style={{ width: `${stats.cpuLoad}%` }} 
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between font-bold text-pencil-black mb-1">
            <span>RAM Usage</span>
            <span className="font-mono">{stats.usedMemGB} / {stats.totalMemGB} GB</span>
          </div>
          <div className="w-full h-4 bg-paper-muted border-2 border-pencil-black wobbly overflow-hidden">
            <div 
              className="h-full bg-accent-red border-r-2 border-pencil-black transition-all duration-300" 
              style={{ width: `${stats.memUsagePercent}%` }} 
            />
          </div>
          <div className="text-[10px] text-pencil-black/60 font-semibold text-right mt-0.5">
            {stats.memUsagePercent}% allocated
          </div>
        </div>

        {/* GPU Info */}
        {gpuInfo && gpuInfo.name && (
          <div className="pt-3 border-t-2 border-dashed border-pencil-black space-y-1.5 text-xs text-pencil-black">
            <div className="font-bold truncate font-kalam text-[11px]">🎮 {gpuInfo.name}</div>
            <div className="flex justify-between font-bold text-[10px] font-mono">
              <span className="text-accent-red">Temp: {gpuInfo.temperature}°C</span>
              <span className="text-accent-blue">Load: {gpuInfo.utilization}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
