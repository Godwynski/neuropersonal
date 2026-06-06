import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function TelemetryMonitor() {
  const { stats, gpuInfo } = useAppContext();

  return (
    <div className="glass-panel p-5 rounded-xl border border-[#262626] space-y-4 relative">
      <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-widest border-b border-[#262626] pb-3 font-outfit">
        📊 Telemetry Monitor
      </h3>
      
      <div className="space-y-4 text-xs">
        {/* CPU Load */}
        <div>
          <div className="flex justify-between font-medium text-gray-300 mb-1.5">
            <span>CPU Load</span>
            <span className="font-mono text-gray-400">{stats.cpuLoad}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#141414] border border-[#262626] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-300" 
              style={{ width: `${stats.cpuLoad}%` }} 
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between font-medium text-gray-300 mb-1.5">
            <span>RAM Usage</span>
            <span className="font-mono text-gray-400">{stats.usedMemGB} / {stats.totalMemGB} GB</span>
          </div>
          <div className="w-full h-2.5 bg-[#141414] border border-[#262626] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ff4655] shadow-[0_0_8px_rgba(255,70,85,0.5)] transition-all duration-300" 
              style={{ width: `${stats.memUsagePercent}%` }} 
            />
          </div>
          <div className="text-[10px] text-gray-500 font-medium text-right mt-1.5">
            {stats.memUsagePercent}% allocated
          </div>
        </div>

        {/* GPU Info */}
        {gpuInfo && gpuInfo.name && (
          <div className="pt-3 border-t border-dashed border-[#262626] space-y-2 text-xs text-gray-300">
            <div className="font-medium truncate font-outfit text-gray-200">🎮 {gpuInfo.name}</div>
            <div className="flex justify-between font-medium text-[10px] font-mono">
              <span className="text-[#ff4655]">Temp: {gpuInfo.temperature}°C</span>
              <span className="text-[#3b82f6]">Load: {gpuInfo.utilization}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
