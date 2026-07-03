import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Spinner from './Spinner';

export default function DashboardOverview() {
  const {
    stats,
    gpuInfo,
    maxBoostStatus,
    maxBoostActive,
    maxBoostProgress,
    toggleMaxBoost,
    isProcessing,
    executeOperation,
    optimizedCount,
    totalOptimizations,
    // Quick actions
    runningFix,
    runDiagnosticFix,
    tempFolderSize,
    shaderCacheSize,
    scanningTemp,
    scanningVal,
    purgingTemp,
    cleaningLogs,
    cleaningShaders,
    scanAllCaches,
    cleanAllCaches
  } = useAppContext();


  const isBoosting = maxBoostStatus === 'boosting';
  const isReverting = maxBoostStatus === 'reverting';
  const isBusy = isBoosting || isReverting || isProcessing;

  const optimizationPercentage = Math.round(((optimizedCount || 0) / totalOptimizations) * 100) || 0;
  const healthColor = optimizationPercentage >= 80 ? '#3b82f6' : optimizationPercentage >= 50 ? '#eab308' : '#ff4655';
  const healthLabel = optimizationPercentage >= 80 ? 'Excellent' : optimizationPercentage >= 50 ? 'Good' : 'Needs Work';

  return (
    <div className="p-4 md:p-6 font-inter text-gray-200 flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-[#0a0a0a]">
      
      {/* ── Top Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* CPU */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3.5">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-outfit mb-1.5">CPU</div>
          <div className="text-xl font-bold text-white font-outfit">{stats.cpuLoad}%</div>
          <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden mt-2 border border-[#262626]">
            <div className="h-full bg-[#3b82f6] transition-all duration-500" style={{ width: `${stats.cpuLoad}%` }} />
          </div>
          <div className="text-[10px] text-gray-500 mt-1.5 truncate">{stats.cpuCores} cores</div>
        </div>

        {/* RAM */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3.5">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-outfit mb-1.5">Memory</div>
          <div className="text-xl font-bold text-white font-outfit">{stats.memUsagePercent}%</div>
          <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden mt-2 border border-[#262626]">
            <div className="h-full bg-[#ff4655] transition-all duration-500" style={{ width: `${stats.memUsagePercent}%` }} />
          </div>
          <div className="text-[10px] text-gray-500 mt-1.5">{stats.usedMemGB} / {stats.totalMemGB} GB</div>
        </div>

        {/* GPU */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3.5">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-outfit mb-1.5">GPU</div>
          <div className="text-xl font-bold text-white font-outfit">{gpuInfo.temperature}°C</div>
          <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden mt-2 border border-[#262626]">
            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${gpuInfo.utilization}%` }} />
          </div>
          <div className="text-[10px] text-gray-500 mt-1.5 truncate">{gpuInfo.name !== 'Detecting...' ? gpuInfo.name : 'Detecting GPU...'}</div>
        </div>

        {/* Optimization Score */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3.5">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-outfit mb-1.5">Optimized</div>
          <div className="text-xl font-bold font-outfit" style={{ color: healthColor }}>{optimizationPercentage}%</div>
          <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden mt-2 border border-[#262626]">
            <div className="h-full transition-all duration-1000" style={{ width: `${optimizationPercentage}%`, backgroundColor: healthColor }} />
          </div>
          <div className="text-[10px] mt-1.5 font-semibold" style={{ color: healthColor }}>{optimizedCount}/{totalOptimizations} tweaks · {healthLabel}</div>
        </div>
      </div>

      {/* ── One-Click Performance Boost ── */}
      <div className="mb-6 bg-[#141414] border border-[#262626] rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative subtle background gradient glow */}
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] transition-all duration-700 pointer-events-none ${
          maxBoostActive ? 'bg-[#ff4655]/10' : 'bg-[#3b82f6]/5'
        }`} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold font-outfit text-white">One-Click Performance Boost</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Optimize CPU topology, system priority, power states, network latency, and driver profile settings in a single click. Skipped reboot-dependent actions to keep things seamless.
            </p>
            {maxBoostActive && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-pulse" />
                Active Boost Enabled
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-col items-stretch md:items-end w-full md:w-auto">
            <button
              onClick={() => executeOperation(
                maxBoostActive ? "Reverting System Optimizations..." : "Applying Performance Boost...",
                () => maxBoostActive ? toggleMaxBoost(false) : toggleMaxBoost(true)
              )}
              disabled={isBusy}
              className={`py-4 px-8 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg select-none ${
                isBoosting ? 'bg-[#3b82f6] text-white cursor-wait' 
                : isReverting ? 'bg-[#ff4655] text-white cursor-wait'
                : maxBoostActive ? 'bg-gradient-to-r from-[#ff4655] to-[#f43f5e] hover:shadow-[0_0_20px_rgba(255,70,85,0.4)] text-white hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-white text-[#0a0a0a] hover:bg-gray-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]'
              } disabled:opacity-60`}
            >
              {isBoosting ? (
                <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4"/> Boosting...</span>
              ) : isReverting ? (
                <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4"/> Reverting...</span>
              ) : maxBoostActive ? (
                'Revert Optimizations'
              ) : (
                'Boost Performance'
              )}
            </button>
          </div>
        </div>

        {/* Progress bar — only when boosting/reverting */}
        {(isBoosting || isReverting) && (
          <div className="mt-6 relative z-10">
            <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1.5">
              <span>{isBoosting ? 'Applying speed enhancements...' : 'Restoring original settings...'}</span>
              <span>{maxBoostProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#262626]">
              <div 
                className={`h-full transition-all duration-300 ${isBoosting ? 'bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]' : 'bg-[#ff4655] shadow-[0_0_8px_#ff4655]'}`}
                style={{ width: `${maxBoostProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Actions Strip ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold font-outfit text-white uppercase tracking-wider">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Clear RAM */}
          <button
            onClick={() => runDiagnosticFix('ramRejuvenation')}
            disabled={isBusy || runningFix !== null}
            className={`flex flex-col items-center justify-center gap-3 p-4 min-h-[90px] rounded-xl border transition-all duration-300 disabled:opacity-50 select-none ${
              runningFix === 'ramRejuvenation'
                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                : 'bg-[#141414] border-[#262626] text-gray-300 hover:bg-[#1c1c1c] hover:border-[#3f3f46]'
            }`}
          >
            <span className="text-2xl">🧠</span>
            <span className="text-xs font-bold font-outfit text-white">
              {runningFix === 'ramRejuvenation' ? <span className="flex items-center gap-1.5"><Spinner className="w-3.5 h-3.5"/>Clearing...</span> : 'Clear RAM'}
            </span>
          </button>

          {/* Restart Desktop UI */}
          <button
            onClick={() => runDiagnosticFix('chronosReset')}
            disabled={isBusy || runningFix !== null}
            className={`flex flex-col items-center justify-center gap-3 p-4 min-h-[90px] rounded-xl border transition-all duration-300 disabled:opacity-50 select-none ${
              runningFix === 'chronosReset'
                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                : 'bg-[#141414] border-[#262626] text-gray-300 hover:bg-[#1c1c1c] hover:border-[#3f3f46]'
            }`}
          >
            <span className="text-2xl">🖥️</span>
            <span className="text-xs font-bold font-outfit text-white">
              {runningFix === 'chronosReset' ? <span className="flex items-center gap-1.5"><Spinner className="w-3.5 h-3.5"/>Restarting...</span> : 'Restart UI'}
            </span>
          </button>

          {/* Scan Caches */}
          <button
            onClick={scanAllCaches}
            disabled={isBusy || scanningTemp || scanningVal || purgingTemp || cleaningLogs || cleaningShaders}
            className={`flex flex-col items-center justify-center gap-2 p-4 min-h-[90px] rounded-xl border transition-all duration-300 disabled:opacity-50 select-none ${
              scanningTemp || scanningVal
                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                : 'bg-[#141414] border-[#262626] text-gray-300 hover:bg-[#1c1c1c] hover:border-[#3f3f46]'
            }`}
          >
            <span className="text-2xl">🔍</span>
            <span className="text-xs font-bold font-outfit text-white text-center">
              {scanningTemp || scanningVal ? (
                <span className="flex items-center gap-1.5"><Spinner className="w-3.5 h-3.5"/>Scanning...</span>
              ) : (
                <>
                  <div>Scan Caches</div>
                  {tempFolderSize !== 'Click Scan' && shaderCacheSize !== 'Click Scan' && (
                    <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                      Temp: {tempFolderSize} · Shaders: {shaderCacheSize}
                    </div>
                  )}
                </>
              )}
            </span>
          </button>

          {/* Purge Caches */}
          <button
            onClick={cleanAllCaches}
            disabled={isBusy || scanningTemp || scanningVal || purgingTemp || cleaningLogs || cleaningShaders}
            className={`flex flex-col items-center justify-center gap-3 p-4 min-h-[90px] rounded-xl border transition-all duration-300 disabled:opacity-50 select-none ${
              purgingTemp || cleaningLogs || cleaningShaders
                ? 'bg-[#ff4655]/10 border-[#ff4655]/30 text-[#ff4655]'
                : 'bg-[#141414] border-[#262626] text-gray-300 hover:bg-[#1c1c1c] hover:border-[#3f3f46]'
            }`}
          >
            <span className="text-2xl">🗑️</span>
            <span className="text-xs font-bold font-outfit text-white">
              {purgingTemp || cleaningLogs || cleaningShaders ? (
                <span className="flex items-center gap-1.5"><Spinner className="w-3.5 h-3.5"/>Purging...</span>
              ) : (
                'Purge Caches'
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
