import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function TelemetryMonitor() {
  const { stats, gpuInfo } = useAppContext();

  return (
    <div className="border border-slate-200 bg-white p-4 rounded shadow-sm space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1.5">Telemetry Monitor</h3>
      
      <div className="space-y-3 text-xs">
        {/* CPU Load */}
        <div>
          <div className="flex justify-between font-bold text-slate-600 mb-0.5">
            <span>CPU Load</span>
            <span>{stats.cpuLoad}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded overflow-hidden">
            <div className="h-full bg-slate-800 transition-all duration-300" style={{ width: `${stats.cpuLoad}%` }} />
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between font-bold text-slate-600 mb-0.5">
            <span>RAM Usage</span>
            <span>{stats.usedMemGB} GB / {stats.totalMemGB} GB ({stats.memUsagePercent}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded overflow-hidden">
            <div className="h-full bg-slate-600 transition-all duration-300" style={{ width: `${stats.memUsagePercent}%` }} />
          </div>
        </div>

        {/* GPU Info */}
        {gpuInfo && gpuInfo.name && (
          <div className="pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-650">
            <div className="font-bold truncate">{gpuInfo.name}</div>
            <div className="flex justify-between text-slate-500 font-mono text-[10px]">
              <span>Temp: {gpuInfo.temperature}°C</span>
              <span>Load: {gpuInfo.utilization}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
