import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Spinner from './Spinner';

export default function DashboardOverview() {
  const {
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
    totalOptimizations = 11,
    setActiveAppTab
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

  return (
    <div className="p-4 md:p-8 font-inter text-gray-200 h-full overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 bg-[#0a0a0a]">
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">System Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome to NeurOptimize. Make your PC and games run smoother.</p>
        </div>
      </div>

      {/* Health Overview Card */}
      <div className="glass-panel p-6 rounded-2xl border border-[#262626] bg-[#141414]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/>
          </svg>
        </div>
        
        <h2 className="text-lg font-bold font-outfit text-white mb-2">System Health & Optimization</h2>
        <p className="text-sm text-gray-400 max-w-xl mb-6">
          This score represents how many safe optimizations are active on your system. A higher score means better gaming performance and responsiveness.
        </p>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
          {/* Circular Progress (Simplified) */}
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-[#0a0a0a] border-4 border-[#262626]">
            <span className="text-2xl font-bold text-white">{optimizationPercentage}%</span>
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span className="text-gray-300">Optimization Level</span>
              <span className={optimizationPercentage >= 80 ? 'text-[#3b82f6]' : optimizationPercentage >= 50 ? 'text-yellow-500' : 'text-[#ff4655]'}>
                {optimizationPercentage >= 80 ? 'Excellent' : optimizationPercentage >= 50 ? 'Good' : 'Needs Optimization'}
              </span>
            </div>
            <div className="w-full h-3 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#262626]">
              <div 
                className={`h-full transition-all duration-1000 ${optimizationPercentage >= 80 ? 'bg-[#3b82f6]' : optimizationPercentage >= 50 ? 'bg-yellow-500' : 'bg-[#ff4655]'}`}
                style={{ width: `${optimizationPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Profiles */}
      <div>
        <h2 className="text-xl font-bold font-outfit text-white mb-4">1-Click Profiles</h2>
        <p className="text-sm text-gray-400 mb-6">Choose how you want to use your PC right now. We'll handle the complex settings behind the scenes.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Gaming Profile */}
          <div className={`p-6 rounded-2xl border transition-all cursor-pointer ${boostProfile === 'aggressive' ? 'border-[#ff4655] bg-[#ff4655]/10 shadow-[0_0_15px_rgba(255,70,85,0.15)]' : 'border-[#262626] bg-[#141414]/50 hover:border-gray-500'}`}
               onClick={() => setBoostProfile('aggressive')}>
            <div className="w-10 h-10 rounded-full bg-[#ff4655]/20 flex items-center justify-center mb-4">
              <span className="text-xl">🎮</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Maximum Performance</h3>
            <p className="text-xs text-gray-400 mb-4 h-16">
              The ultimate gaming experience. Disables background apps and forces your hardware to run at maximum speed for the highest frames possible.
            </p>
            <span className="text-[10px] font-semibold text-[#ff4655] uppercase tracking-wider">⚠️ May require reboot</span>
          </div>

          {/* Balanced Profile */}
          <div className={`p-6 rounded-2xl border transition-all cursor-pointer ${boostProfile === 'safe' ? 'border-[#3b82f6] bg-[#3b82f6]/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-[#262626] bg-[#141414]/50 hover:border-gray-500'}`}
               onClick={() => setBoostProfile('safe')}>
            <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center mb-4">
              <span className="text-xl">⚖️</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Balanced Mode</h3>
            <p className="text-xs text-gray-400 mb-4 h-16">
              The recommended daily driver. Improves game responsiveness smoothly without aggressively shutting down your background applications.
            </p>
            <span className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider">✓ Safe & Stable</span>
          </div>

          {/* Restore Defaults */}
          <div className="p-6 rounded-2xl border border-[#262626] bg-[#141414]/50 hover:border-gray-500 transition-all cursor-pointer"
               onClick={() => runPreset('revert')}>
            <div className="w-10 h-10 rounded-full bg-gray-600/20 flex items-center justify-center mb-4">
              <span className="text-xl">↩️</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Restore Defaults</h3>
            <p className="text-xs text-gray-400 mb-4 h-16">
              Experiencing issues? Click here to revert all system tweaks back to standard Windows default settings.
            </p>
            {presetLoading === 'revert' ? (
               <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Spinner className="w-3 h-3"/> Reverting...</span>
            ) : (
               <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Click to Revert</span>
            )}
          </div>

        </div>

        {/* Master Apply Button */}
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={() => executeOperation(
              maxBoostActive ? "Reverting System Optimizations..." : "Boosting System Parameters...",
              () => maxBoostActive ? toggleMaxBoost(false) : toggleMaxBoost(true, boostProfile)
            )}
            disabled={isBusy}
            className={`w-full max-w-md py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-lg hover:scale-105 active:scale-95 ${
              isBoosting ? 'bg-[#3b82f6] text-white' 
              : isReverting ? 'bg-[#ff4655] text-white'
              : maxBoostActive ? 'bg-[#ff4655] text-white' 
              : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {isBoosting ? (
              <span className="flex items-center justify-center gap-2"><Spinner className="w-5 h-5"/> Applying Profile...</span>
            ) : isReverting ? (
              <span className="flex items-center justify-center gap-2"><Spinner className="w-5 h-5"/> Restoring System...</span>
            ) : maxBoostActive ? (
              'Stop Boost & Revert'
            ) : (
              'APPLY PROFILE NOW'
            )}
          </button>
          
          {(maxBoostActive || isBoosting || isReverting) && (
            <div className="w-full max-w-md mt-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>{isBoosting ? 'Optimizing...' : isReverting ? 'Restoring...' : 'Boost Active'}</span>
                <span>{maxBoostProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden border border-[#262626]">
                <div 
                  className={`h-full transition-all duration-300 ${isBoosting ? 'bg-[#3b82f6]' : isReverting ? 'bg-[#ff4655]' : 'bg-[#3b82f6]'}`}
                  style={{ width: `${maxBoostProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
