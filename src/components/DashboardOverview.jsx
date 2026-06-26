import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Spinner from './Spinner';

export default function DashboardOverview() {
  const {
    stats,
    gpuInfo,
    maxBoostStatus,
    boostProfile,
    setBoostProfile,
    maxBoostActive,
    maxBoostProgress,
    toggleMaxBoost,
    isProcessing,
    executeOperation,
    applyOptimizationProfile,
    optimizedCount,
    totalOptimizations,
    setActiveAppTab,
    // Quick actions
    runningFix,
    runDiagnosticFix,
    tempFolderSize,
    scanningTemp,
    purgingTemp,
    scanTempFolder,
    purgeTempFolder,
    valorantRunning
  } = useAppContext();

  const [presetLoading, setPresetLoading] = useState(null);

  const isBoosting = maxBoostStatus === 'boosting';
  const isReverting = maxBoostStatus === 'reverting';
  const isBusy = isBoosting || isReverting || isProcessing;

  const runPreset = async (preset) => {
    if (isBusy || presetLoading) return;
    setPresetLoading(preset);
    try {
      await executeOperation(`Applying ${preset} profile...`, () => applyOptimizationProfile(preset));
    } finally {
      setPresetLoading(null);
    }
  };

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

      {/* ── Performance Profile Selection + Apply ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-outfit text-white">Performance Profile</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select a mode, then apply. We handle the complex settings.</p>
          </div>
          {maxBoostActive && (
            <span className="px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-[10px] font-bold uppercase tracking-wider border border-[#3b82f6]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
              Boost Active
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          
          {/* Low-End PC Mode */}
          <button 
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
              boostProfile === 'lowend' 
                ? 'border-[#10b981] bg-[#10b981]/8 shadow-[0_0_20px_rgba(16,185,129,0.08)]' 
                : 'border-[#262626] bg-[#141414]/50 hover:border-[#3f3f46]'
            }`}
            onClick={() => setBoostProfile('lowend')}
          >
            {boostProfile === 'lowend' && (
              <div className="absolute top-3 right-3">
                <svg className="w-4 h-4 text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#10b981]/15 flex items-center justify-center shrink-0">
                <span className="text-sm">⚡</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Low-End PC</h3>
                <span className="text-[10px] text-[#10b981] font-semibold">★ Best for 30fps</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Proven tweaks only. Forces minimum graphics, kills bloat. Designed for PCs struggling under 60fps.
            </p>
          </button>

          {/* Maximum Performance */}
          <button 
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
              boostProfile === 'aggressive' 
                ? 'border-[#ff4655] bg-[#ff4655]/8 shadow-[0_0_20px_rgba(255,70,85,0.08)]' 
                : 'border-[#262626] bg-[#141414]/50 hover:border-[#3f3f46]'
            }`}
            onClick={() => setBoostProfile('aggressive')}
          >
            {boostProfile === 'aggressive' && (
              <div className="absolute top-3 right-3">
                <svg className="w-4 h-4 text-[#ff4655]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#ff4655]/15 flex items-center justify-center shrink-0">
                <span className="text-sm">🎮</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Maximum Performance</h3>
                <span className="text-[10px] text-[#ff4655] font-semibold">⚠ May need reboot</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Kills background apps, disables VBS, forces maximum CPU/GPU clocks. Best for competitive gaming.
            </p>
          </button>

          {/* Balanced */}
          <button 
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
              boostProfile === 'safe' 
                ? 'border-[#3b82f6] bg-[#3b82f6]/8 shadow-[0_0_20px_rgba(59,130,246,0.08)]' 
                : 'border-[#262626] bg-[#141414]/50 hover:border-[#3f3f46]'
            }`}
            onClick={() => setBoostProfile('safe')}
          >
            {boostProfile === 'safe' && (
              <div className="absolute top-3 right-3">
                <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center shrink-0">
                <span className="text-sm">⚖️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Balanced Mode</h3>
                <span className="text-[10px] text-[#3b82f6] font-semibold">✓ Safe & Stable</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Improves game responsiveness without killing apps. Recommended daily driver for most users.
            </p>
          </button>

          {/* Restore Defaults */}
          <button 
            className="text-left p-4 rounded-xl border border-[#262626] bg-[#141414]/50 hover:border-[#3f3f46] transition-all"
            onClick={() => runPreset('revert')}
            disabled={isBusy}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gray-600/15 flex items-center justify-center shrink-0">
                <span className="text-sm">↩️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Restore Defaults</h3>
                {presetLoading === 'revert' ? (
                  <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1"><Spinner className="w-2.5 h-2.5"/> Reverting...</span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-semibold">Undo all tweaks</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Reverts all system tweaks back to Windows defaults. Use this if something feels off.
            </p>
          </button>

        </div>

        {/* Apply / Revert Button */}
        <button
          onClick={() => executeOperation(
            maxBoostActive ? "Reverting System Optimizations..." : "Applying Performance Profile...",
            () => maxBoostActive ? toggleMaxBoost(false) : toggleMaxBoost(true, boostProfile)
          )}
          disabled={isBusy}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all ${
            isBoosting ? 'bg-[#3b82f6] text-white' 
            : isReverting ? 'bg-[#ff4655] text-white'
            : maxBoostActive ? 'bg-[#ff4655] hover:bg-[#ff4655]/90 text-white' 
            : 'bg-white text-[#0a0a0a] hover:bg-gray-100'
          } disabled:opacity-60`}
        >
          {isBoosting ? (
            <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4"/> Applying Profile...</span>
          ) : isReverting ? (
            <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4"/> Restoring System...</span>
          ) : maxBoostActive ? (
            'Stop Boost & Revert to Defaults'
          ) : (
            `Apply ${boostProfile === 'aggressive' ? 'Maximum Performance' : boostProfile === 'lowend' ? 'Low-End PC Mode' : 'Balanced Mode'}`
          )}
        </button>
        
        {/* Progress bar — only when boosting/reverting */}
        {(isBoosting || isReverting) && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1">
              <span>{isBoosting ? 'Optimizing...' : 'Restoring...'}</span>
              <span>{maxBoostProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden border border-[#262626]">
              <div 
                className={`h-full transition-all duration-300 ${isBoosting ? 'bg-[#3b82f6]' : 'bg-[#ff4655]'}`}
                style={{ width: `${maxBoostProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Actions Strip ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold font-outfit text-white uppercase tracking-wider">Quick Actions</h2>
          <button 
            onClick={() => setActiveAppTab('advanced')}
            className="text-[11px] text-[#3b82f6] hover:text-[#3b82f6]/80 font-semibold transition-colors"
          >
            Advanced Tweaks →
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Clear RAM */}
          <button
            onClick={() => runDiagnosticFix('ramRejuvenation')}
            disabled={runningFix !== null || scanningTemp || purgingTemp}
            className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all disabled:opacity-50 ${
              runningFix === 'ramRejuvenation'
                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                : 'bg-[#141414] border-[#262626] text-gray-300 hover:bg-[#1a1a1a] hover:border-[#3f3f46]'
            }`}
          >
            <span className="text-xl">🧠</span>
            <span className="text-[11px] font-semibold font-outfit">
              {runningFix === 'ramRejuvenation' ? <span className="flex items-center gap-1"><Spinner className="w-3 h-3"/>Clearing...</span> : 'Clear RAM'}
            </span>
          </button>

          {/* Restart Desktop UI */}
          <button
            onClick={() => runDiagnosticFix('chronosReset')}
            disabled={runningFix !== null || scanningTemp || purgingTemp}
            className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all disabled:opacity-50 ${
              runningFix === 'chronosReset'
                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                : 'bg-[#141414] border-[#262626] text-gray-300 hover:bg-[#1a1a1a] hover:border-[#3f3f46]'
            }`}
          >
            <span className="text-xl">🖥️</span>
            <span className="text-[11px] font-semibold font-outfit">
              {runningFix === 'chronosReset' ? <span className="flex items-center gap-1"><Spinner className="w-3 h-3"/>Restarting...</span> : 'Restart UI'}
            </span>
          </button>

          {/* Scan Temp */}
          <button
            onClick={scanTempFolder}
            disabled={runningFix !== null || scanningTemp || purgingTemp}
            className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all disabled:opacity-50 ${
              scanningTemp
                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                : 'bg-[#141414] border-[#262626] text-gray-300 hover:bg-[#1a1a1a] hover:border-[#3f3f46]'
            }`}
          >
            <span className="text-xl">🔍</span>
            <span className="text-[11px] font-semibold font-outfit">
              {scanningTemp ? <span className="flex items-center gap-1"><Spinner className="w-3 h-3"/>Scanning...</span> : (
                <>Scan Temp<br/><span className="text-[9px] text-gray-500 font-normal">{tempFolderSize}</span></>
              )}
            </span>
          </button>

          {/* Purge Temp */}
          <button
            onClick={purgeTempFolder}
            disabled={runningFix !== null || scanningTemp || purgingTemp || tempFolderSize === 'Click Scan' || tempFolderSize === '0 Bytes'}
            className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all disabled:opacity-50 ${
              purgingTemp
                ? 'bg-[#ff4655]/10 border-[#ff4655]/30 text-[#ff4655]'
                : 'bg-[#141414] border-[#262626] text-gray-300 hover:bg-[#1a1a1a] hover:border-[#3f3f46]'
            }`}
          >
            <span className="text-xl">🗑️</span>
            <span className="text-[11px] font-semibold font-outfit">
              {purgingTemp ? <span className="flex items-center gap-1"><Spinner className="w-3 h-3"/>Purging...</span> : 'Purge Temp'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
