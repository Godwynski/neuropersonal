import React from 'react';

export default function OneClickOptimize({ 
  isOptimizing, 
  isOptimized, 
  onOptimize, 
  onRevert, 
  isAdmin, 
  boostProfile = 'safe', 
  setBoostProfile 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 font-sans bg-white text-slate-800">
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl font-bold mb-2">System Performance Optimizer</h1>
        <p className="text-sm text-slate-500">
          Configure registry settings, power policies, and system latency adjustments.
        </p>
      </div>

      {!isAdmin && (
        <div className="w-full max-w-sm mb-6 p-3 border border-amber-300 bg-amber-50 text-amber-800 text-xs rounded">
          <strong>Notice:</strong> Running in non-admin mode. Some registry modifications may be skipped.
        </div>
      )}

      {/* Bare Skeleton Container */}
      <div className="w-full max-w-sm border border-slate-200 bg-slate-50 rounded p-6 flex flex-col items-center">
        <div className="mb-4 w-12 h-12 rounded-full border-2 border-slate-300 bg-slate-100 flex items-center justify-center font-bold text-slate-500">
          {isOptimizing ? '...' : isOptimized ? '✓' : '!'}
        </div>

        <h2 className="text-lg font-bold mb-1">
          {isOptimizing ? 'Optimizing...' : isOptimized ? 'System Optimized' : 'Optimization Standby'}
        </h2>
        
        <p className="text-xs text-slate-500 text-center mb-6">
          {isOptimizing 
            ? 'Updating registry profiles and cache parameters.' 
            : isOptimized 
              ? 'Windows is tuned for reduced system latency.' 
              : 'Windows defaults currently active.'}
        </p>

        {/* Profile Selector tabs */}
        {!isOptimized && !isOptimizing && (
          <div className="w-full mb-5 text-xs">
            <label className="block text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-wide text-center">
              Select Optimization Profile
            </label>
            <div className="grid grid-cols-2 gap-2 border border-slate-200 p-1 bg-white rounded">
              <button
                type="button"
                onClick={() => setBoostProfile('safe')}
                className={`py-2 px-3 font-bold rounded cursor-pointer transition-colors text-center ${
                  boostProfile === 'safe'
                    ? 'bg-green-50 border border-green-200 text-green-700 font-bold'
                    : 'bg-white hover:bg-slate-50 border border-transparent text-slate-500'
                }`}
              >
                Safe Boost
              </button>
              <button
                type="button"
                onClick={() => setBoostProfile('aggressive')}
                className={`py-2 px-3 font-bold rounded cursor-pointer transition-colors text-center ${
                  boostProfile === 'aggressive'
                    ? 'bg-amber-50 border border-amber-200 text-amber-705 font-bold'
                    : 'bg-white hover:bg-slate-50 border border-transparent text-slate-500'
                }`}
              >
                Max Boost
              </button>
            </div>
            
            <div className="mt-3 p-2 bg-slate-100/60 rounded text-[11px] leading-relaxed border border-slate-200/50">
              {boostProfile === 'safe' ? (
                <div>
                  <span className="font-bold text-green-700 block mb-0.5">🟢 Safe Profile details:</span>
                  Flushes DNS, cleans temp/shader caches, turns on Windows Game Mode, sets High Power Plan, and disables background DVR.
                  <span className="font-semibold text-slate-500 block mt-1">✓ Safely lowers latency without CPU stutters or 1% lows.</span>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-amber-700 block mb-0.5">⚠️ Max Profile details:</span>
                  Applies all Safe tweaks PLUS HAGS, core parking overrides, disabling dynamic tick, custom priority separation, and service disabling.
                  <span className="font-semibold text-amber-700 block mt-1">⚡ Warning: Overrides CPU scheduler. May cause 1% lows and system lag on some hardware.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isOptimized && (
          <div className="w-full mb-5 text-[11px] p-2.5 bg-slate-100 rounded border border-slate-200 text-center font-semibold text-slate-600">
            Active Profile: <span className={boostProfile === 'safe' ? 'text-green-700 font-bold uppercase' : 'text-amber-700 font-bold uppercase'}>{boostProfile === 'safe' ? 'Safe Boost' : 'Max Boost'}</span>
          </div>
        )}

        <button
          onClick={isOptimized ? onRevert : onOptimize}
          disabled={isOptimizing}
          className="w-full py-2.5 px-4 font-bold text-sm bg-slate-800 text-white hover:bg-slate-700 disabled:bg-slate-300 disabled:text-slate-500 rounded cursor-pointer transition-colors"
        >
          {isOptimizing ? 'Processing...' : isOptimized ? 'Revert Optimizations' : 'Optimize System'}
        </button>
      </div>

      {/* Feature Bullet Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-2xl text-xs">
        <div className="p-3 border border-slate-200 rounded bg-white">
          <h3 className="font-bold mb-1">CPU Policies</h3>
          <p className="text-slate-500">Configures core scheduling thresholds and process priorities.</p>
        </div>
        <div className="p-3 border border-slate-200 rounded bg-white">
          <h3 className="font-bold mb-1">OS Tweaks</h3>
          <p className="text-slate-500">Disables USB power suspension and background indexing checks.</p>
        </div>
        <div className="p-3 border border-slate-200 rounded bg-white">
          <h3 className="font-bold mb-1">GPU Telemetry</h3>
          <p className="text-slate-500">Toggles HAGS and adjusts multimedia profile variables.</p>
        </div>
      </div>
    </div>
  );
}
