import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Spinner from './Spinner';

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
    <div className="glass-panel p-5 rounded-xl border border-[#262626] space-y-4 relative">
      <div className="border-b border-[#262626] pb-3">
        <h3 className="text-sm font-semibold text-gray-100 font-outfit uppercase tracking-widest">🚀 1-Click Booster</h3>
        <p className="text-[11px] text-gray-400 mt-1">Instantly toggle game profiles and clean caches.</p>
      </div>

      {/* Profile Selection — only shown when idle */}
      {maxBoostStatus === 'idle' && (
        <div className="space-y-3">
          <div className="flex gap-2 p-1 bg-[#141414] border border-[#262626] rounded-lg text-xs">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setBoostProfile('safe')}
              className={`flex-1 py-1.5 px-2 font-medium rounded-md transition-all text-center disabled:opacity-50 ${
                boostProfile === 'safe'
                  ? 'bg-[#262626] text-white shadow-sm'
                  : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-[#262626]/50'
              }`}
            >
              Safe Boost
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setBoostProfile('aggressive')}
              className={`flex-1 py-1.5 px-2 font-medium rounded-md transition-all text-center disabled:opacity-50 ${
                boostProfile === 'aggressive'
                  ? 'bg-[#262626] text-white shadow-sm'
                  : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-[#262626]/50'
              }`}
            >
              Max Boost
            </button>
          </div>

          {/* Profile Explanations */}
          <div className="p-3 rounded-lg text-xs leading-relaxed border border-[#262626] bg-[#141414]/50">
            {boostProfile === 'safe' ? (
              <div className="space-y-1.5">
                <span className="font-semibold text-[#3b82f6] block">🟢 Safe Boost Mode</span>
                <p className="text-gray-300">
                  Applies all core optimizations: GameDVR disable, raw mouse input, USB suspend bypass, Game Mode, High-Performance power plan, TCP/Nagle latency fix, NIC interrupt moderation disable, visual effects strip, Defender exclusions, notification suppression, telemetry task cleanup, P-core affinity pinning, and shader cache cleaning.
                </p>
                <span className="font-medium text-gray-500 block mt-1">✓ No reboots. 100% stable. Every safe tweak applied.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <span className="font-semibold text-[#ff4655] block">🔥 Max Boost (Aggressive)</span>
                <p className="text-gray-300">
                  Applies ALL Safe Boost tweaks PLUS: power throttling bypass, CPU priority lock, timer resolution lock, NIC power saving disable, Xbox service kill, GPU driver profile injection, VBS/Core Isolation disable, HPET override, and Ultimate Performance power plan activation.
                </p>
                <span className="font-medium text-[#ff4655] block mt-1">⚠️ Requires system reboot. Maximum possible performance.</span>
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
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 font-semibold text-sm rounded-lg transition-all ${
          isBoosting
            ? 'bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
            : isReverting
            ? 'bg-[#ff4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.3)]'
            : maxBoostActive
            ? 'bg-[#ff4655] hover:bg-[#ff4655]/90 text-white shadow-[0_0_10px_rgba(255,70,85,0.2)]'
            : 'bg-[#0a0a0a] hover:bg-gray-200 text-[#0a0a0a] shadow-[0_0_10px_rgba(255,255,255,0.1)]'
        }`}
      >
        {isBoosting ? (
          <><Spinner className="w-4 h-4" /> BOOSTING SYSTEM...</>
        ) : isReverting ? (
          <><Spinner className="w-4 h-4" /> REVERTING...</>
        ) : maxBoostActive ? (
          'REVERT OPTIMIZATIONS'
        ) : (
          'BOOST SYSTEM'
        )}
      </button>

      {/* Progress and Logger — visible when boosting/active */}
      {(maxBoostActive || isBoosting || isReverting) && (
        <div className="space-y-3 pt-2">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>{isBoosting ? 'Applying optimizations...' : isReverting ? 'Reverting changes...' : 'Fully boosted'}</span>
              <span className="font-mono text-gray-300">{maxBoostProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#141414] border border-[#262626] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isBoosting ? 'bg-[#3b82f6]' : isReverting ? 'bg-[#ff4655]' : 'bg-[#3b82f6]'}`}
                style={{ width: `${maxBoostProgress}%` }}
              />
            </div>
          </div>

          <div className="border border-[#262626] bg-[#0a0a0a] rounded-lg p-2.5 font-mono text-[10px] text-gray-400 h-24 overflow-y-auto custom-scrollbar leading-relaxed">
            {systemLogs.map((log, idx) => {
              const text = typeof log === 'string' ? log : log.text || '';
              return <div key={idx} className="truncate">&gt; {text}</div>;
            })}
          </div>
        </div>
      )}

      {/* Quick preset shortcuts — only when no boost is active */}
      {!maxBoostActive && maxBoostStatus === 'idle' && (
        <div className="border-t border-[#262626] pt-4 space-y-2.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block font-outfit">Quick Presets</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'tournament', label: 'Tournament', color: 'bg-[#262626] text-white hover:bg-[#3f3f46]' },
              { key: 'balanced', label: 'Balanced', color: 'bg-[#141414] border border-[#262626] text-gray-300 hover:bg-[#262626]' },
              { key: 'revert', label: 'Defaults', color: 'bg-[#141414] border border-[#262626] text-gray-300 hover:bg-[#262626]' }
            ].map(p => (
              <button
                key={p.key}
                onClick={() => runPreset(p.key)}
                disabled={!!presetLoading || isBusy}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-[10px] font-medium rounded-md transition-all disabled:cursor-not-allowed disabled:opacity-50 ${p.color}`}
              >
                {presetLoading === p.key ? (
                  <><Spinner className="w-3 h-3" /> ...</>
                ) : p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
