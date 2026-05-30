import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';

function Spinner({ className = 'w-3 h-3' }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

export default function OneClickBooster() {
  const {
    maxBoostStatus,
    boostProfile,
    setBoostProfile,
    maxBoostActive,
    maxBoostProgress,
    systemLogs,
    toggleMaxBoost,
    isProcessing,
    executeOperation,
    applyOptimizationProfile
  } = useAppContext();

  const [presetLoading, setPresetLoading] = useState(null); // 'tournament' | 'balanced' | 'revert'

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

  return (
    <div className="border border-slate-200 bg-white p-4 rounded shadow-sm space-y-3">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">1-Click Booster</h3>
        <p className="text-[10px] text-slate-400">Instantly toggle game profiles and clean caches.</p>
      </div>

      {/* Profile Selection — only shown when idle */}
      {maxBoostStatus === 'idle' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5 border border-slate-200 p-1 bg-slate-50 rounded text-[11px]">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setBoostProfile('safe')}
              className={`py-1 px-2 font-bold rounded cursor-pointer transition-colors text-center disabled:opacity-50 ${
                boostProfile === 'safe'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-white hover:bg-slate-50 border border-transparent text-slate-500'
              }`}
            >
              Safe Boost
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setBoostProfile('aggressive')}
              className={`py-1 px-2 font-bold rounded cursor-pointer transition-colors text-center disabled:opacity-50 ${
                boostProfile === 'aggressive'
                  ? 'bg-amber-50 border border-amber-250 text-amber-800'
                  : 'bg-white hover:bg-slate-50 border border-transparent text-slate-500'
              }`}
            >
              Max Boost
            </button>
          </div>

          {/* Profile Explanations */}
          <div className="p-2.5 rounded text-[10px] leading-relaxed border bg-slate-50/50 border-slate-200">
            {boostProfile === 'safe' ? (
              <div className="space-y-1">
                <span className="font-bold text-green-700 block">🟢 Safe Boost Mode</span>
                <p className="text-slate-650">
                  Applies low-risk optimization policies (e.g. GameDVR disables, raw mouse acceleration bypass, USB suspend, Game Mode, High-Performance power plan, shader cache cleaning).
                </p>
                <span className="font-semibold text-slate-500 block mt-1">✓ No reboots required. 100% stable.</span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-bold text-amber-850 block">🔥 Max Boost (Aggressive Mode)</span>
                <p className="text-slate-650">
                  Applies all Safe Boost tweaks PLUS aggressive registry modifications, network card latency tuning, CPU throttling disabling, platform clock (HPET) override, GPU driver performance profile injections, and virtualization safety (VBS/Core Isolation) disabling.
                </p>
                <span className="font-semibold text-amber-700 block mt-1">⚠️ Requires system reboot. Disables some security features.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Boost Button */}
      <button
        onClick={() => executeOperation(
          maxBoostActive ? "Reverting System Optimizations..." : "Boosting System Parameters...",
          () => maxBoostActive ? toggleMaxBoost(false) : toggleMaxBoost(true, boostProfile)
        )}
        disabled={isBusy}
        className={`w-full flex items-center justify-center gap-2 py-2 px-3 font-bold text-xs rounded text-center cursor-pointer transition-all disabled:cursor-not-allowed ${
          isBoosting
            ? 'bg-indigo-600 text-white'
            : isReverting
            ? 'bg-amber-600 text-white'
            : maxBoostActive
            ? 'bg-rose-600 hover:bg-rose-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        {isBoosting ? (
          <><Spinner className="w-3.5 h-3.5" /> BOOSTING SYSTEM...</>
        ) : isReverting ? (
          <><Spinner className="w-3.5 h-3.5" /> REVERTING...</>
        ) : maxBoostActive ? (
          'REVERT OPTIMIZATIONS'
        ) : (
          'BOOST SYSTEM'
        )}
      </button>

      {/* Progress and Logger — visible when boosting/active */}
      {(maxBoostActive || isBoosting || isReverting) && (
        <div className="space-y-2 pt-1">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
              <span>{isBoosting ? 'Applying optimizations...' : isReverting ? 'Reverting changes...' : 'Fully boosted'}</span>
              <span className="font-mono font-bold">{maxBoostProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isBoosting ? 'bg-indigo-500' : isReverting ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${maxBoostProgress}%` }}
              />
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-50 p-2 font-mono text-[9px] text-slate-500 rounded h-24 overflow-y-auto leading-relaxed">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="truncate">&gt; {log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Quick preset shortcuts — only when no boost is active */}
      {!maxBoostActive && maxBoostStatus === 'idle' && (
        <div className="border-t border-slate-100 pt-2 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets</span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { key: 'tournament', label: 'Tournament', color: 'bg-slate-800 text-white hover:bg-slate-700' },
              { key: 'balanced', label: 'Balanced', color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' },
              { key: 'revert', label: 'Defaults', color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' }
            ].map(p => (
              <button
                key={p.key}
                onClick={() => runPreset(p.key)}
                disabled={!!presetLoading || isBusy}
                className={`flex items-center justify-center gap-1 py-1 px-1.5 text-[9px] font-bold rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-all ${p.color}`}
              >
                {presetLoading === p.key ? (
                  <><Spinner className="w-2.5 h-2.5" /> ...</>
                ) : p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
