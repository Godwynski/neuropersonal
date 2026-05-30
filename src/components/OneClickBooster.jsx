import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function OneClickBooster() {
  const {
    maxBoostStatus,
    boostProfile,
    setBoostProfile,
    maxBoostActive,
    maxBoostProgress,
    systemLogs,
    toggleMaxBoost
  } = useAppContext();

  return (
    <div className="border border-slate-200 bg-white p-4 rounded shadow-sm space-y-3">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">1-Click Booster</h3>
        <p className="text-[10px] text-slate-400">Instantly toggle game profiles and clean caches.</p>
      </div>

      {/* Profile Selection */}
      {maxBoostStatus === 'idle' && (
        <div className="grid grid-cols-2 gap-1.5 border border-slate-200 p-1 bg-slate-50 rounded text-[11px] mb-2">
          <button
            type="button"
            onClick={() => setBoostProfile('safe')}
            className={`py-1 px-2 font-bold rounded cursor-pointer transition-colors text-center ${
              boostProfile === 'safe'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-white hover:bg-slate-50 border border-transparent text-slate-500'
            }`}
          >
            Safe Boost
          </button>
          <button
            type="button"
            onClick={() => setBoostProfile('aggressive')}
            className={`py-1 px-2 font-bold rounded cursor-pointer transition-colors text-center ${
              boostProfile === 'aggressive'
                ? 'bg-amber-50 border border-amber-250 text-amber-800'
                : 'bg-white hover:bg-slate-50 border border-transparent text-slate-500'
            }`}
          >
            Max Boost
          </button>
        </div>
      )}

      <button
        onClick={maxBoostActive ? () => toggleMaxBoost(false) : () => toggleMaxBoost(true, boostProfile)}
        disabled={maxBoostStatus === 'boosting' || maxBoostStatus === 'reverting'}
        className={`w-full py-2 px-3 font-bold text-xs rounded text-center cursor-pointer transition-colors ${
          maxBoostActive 
            ? 'bg-rose-600 hover:bg-rose-500 text-white' 
            : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        {maxBoostStatus === 'boosting' ? 'BOOSTING...' : maxBoostStatus === 'reverting' ? 'REVERTING...' : maxBoostActive ? 'REVERT OPTIMIZATIONS' : 'BOOST SYSTEM'}
      </button>

      {/* Progress and Logger */}
      {(maxBoostActive || maxBoostStatus === 'boosting' || maxBoostStatus === 'reverting') && (
        <div className="space-y-2 pt-1">
          <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded overflow-hidden">
            <div className="h-full bg-slate-700 transition-all duration-300" style={{ width: `${maxBoostProgress}%` }} />
          </div>
          <div className="border border-slate-200 bg-slate-50 p-2 font-mono text-[9px] text-slate-500 rounded h-24 overflow-y-auto leading-relaxed">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="truncate">&gt; {log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
