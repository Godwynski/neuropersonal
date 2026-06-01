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
    <div className="border-[3px] border-pencil-black bg-white p-4 wobbly hand-shadow space-y-4 relative">
      {/* Tape decoration */}
      <div className="absolute -top-3 left-4 w-12 h-4.5 bg-pencil-black/10 border border-pencil-black/20 -rotate-2 pointer-events-none" />

      <div className="border-b-2 border-pencil-black pb-2">
        <h3 className="text-sm font-bold text-pencil-black font-kalam uppercase tracking-wider">🚀 1-Click Booster</h3>
        <p className="text-[11px] text-pencil-black/75">Instantly toggle game profiles and clean caches.</p>
      </div>

      {/* Profile Selection — only shown when idle */}
      {maxBoostStatus === 'idle' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 border-[3px] border-pencil-black p-1 bg-paper-muted wobbly-md text-xs">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setBoostProfile('safe')}
              className={`py-1.5 px-2 font-bold wobbly cursor-pointer transition-all text-center disabled:opacity-50 ${
                boostProfile === 'safe'
                  ? 'bg-white border-2 border-pencil-black text-pencil-black hand-shadow-sm font-kalam'
                  : 'bg-transparent border-2 border-transparent text-pencil-black/60'
              }`}
            >
              Safe Boost
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setBoostProfile('aggressive')}
              className={`py-1.5 px-2 font-bold wobbly cursor-pointer transition-all text-center disabled:opacity-50 ${
                boostProfile === 'aggressive'
                  ? 'bg-white border-2 border-pencil-black text-pencil-black hand-shadow-sm font-kalam'
                  : 'bg-transparent border-2 border-transparent text-pencil-black/60'
              }`}
            >
              Max Boost
            </button>
          </div>

          {/* Profile Explanations */}
          <div className="p-3 wobbly-md text-xs leading-relaxed border-2 border-pencil-black bg-paper-muted/30">
            {boostProfile === 'safe' ? (
              <div className="space-y-1">
                <span className="font-bold text-accent-blue block font-kalam">🟢 Safe Boost Mode</span>
                <p className="text-pencil-black/85">
                  Applies low-risk optimization policies (e.g. GameDVR disables, raw mouse acceleration bypass, USB suspend, Game Mode, High-Performance power plan, shader cache cleaning).
                </p>
                <span className="font-bold text-pencil-black/60 block mt-1">✓ No reboots. 100% stable.</span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-bold text-accent-red block font-kalam">🔥 Max Boost (Aggressive)</span>
                <p className="text-pencil-black/85">
                  Applies all Safe Boost tweaks PLUS aggressive registry modifications, network card latency tuning, CPU throttling disabling, platform clock (HPET) override, GPU driver performance profile injections, and virtualization safety (VBS/Core Isolation) disabling.
                </p>
                <span className="font-bold text-accent-red block mt-1">⚠️ Requires system reboot. Disables some security features.</span>
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
        className={`w-full flex items-center justify-center gap-2 py-2 px-3 font-bold text-sm border-[3px] border-pencil-black wobbly font-kalam cursor-pointer transition-all ${
          isBoosting
            ? 'bg-accent-blue text-white translate-x-[2px] translate-y-[2px] hand-shadow-sm'
            : isReverting
            ? 'bg-accent-red text-white translate-x-[2px] translate-y-[2px] hand-shadow-sm'
            : maxBoostActive
            ? 'bg-accent-red hover:bg-accent-red/90 text-white hand-shadow hover:hand-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
            : 'bg-[#fff9c4] hover:bg-[#fff7b1] text-pencil-black hand-shadow hover:hand-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
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
        <div className="space-y-3 pt-1">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-pencil-black/70 font-bold">
              <span>{isBoosting ? 'Applying optimizations...' : isReverting ? 'Reverting changes...' : 'Fully boosted'}</span>
              <span className="font-mono">{maxBoostProgress}%</span>
            </div>
            <div className="w-full h-4 bg-paper-muted border-2 border-pencil-black wobbly overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isBoosting ? 'bg-accent-blue' : isReverting ? 'bg-accent-red' : 'bg-accent-blue'}`}
                style={{ width: `${maxBoostProgress}%` }}
              />
            </div>
          </div>

          <div className="border-2 border-pencil-black bg-paper-muted/30 p-2 font-mono text-[10px] text-pencil-black/80 wobbly-md h-24 overflow-y-auto leading-relaxed">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="truncate">&gt; {log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Quick preset shortcuts — only when no boost is active */}
      {!maxBoostActive && maxBoostStatus === 'idle' && (
        <div className="border-t-2 border-dashed border-pencil-black pt-3 space-y-2">
          <span className="text-[10px] font-bold text-pencil-black/50 uppercase tracking-wider block font-kalam">Quick Presets</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'tournament', label: 'Tournament', color: 'bg-pencil-black text-white hover:bg-pencil-black/90' },
              { key: 'balanced', label: 'Balanced', color: 'bg-white text-pencil-black' },
              { key: 'revert', label: 'Defaults', color: 'bg-white text-pencil-black' }
            ].map(p => (
              <button
                key={p.key}
                onClick={() => runPreset(p.key)}
                disabled={!!presetLoading || isBusy}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-bold border-2 border-pencil-black wobbly-md cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-50 hand-shadow-sm hover:hand-shadow-sm/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${p.color}`}
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
