import React from 'react';
import { Cpu, Monitor, Sparkles, Zap } from 'lucide-react';

export default function Dashboard({ 
  stats, 
  activeStyle, 
  canvasRef, 
  xp, 
  credits, 
  doubleCreditBuff, 
  unlockedUpgrades, 
  buyUpgrade, 
  setTheme, 
  castSpell, 
  castingSpell,
  premadeMacros,
  runningMacro,
  runMacro,
  spellStatusText
}) {
  return (
    <div className="space-y-6 outline-none">
      
      {castingSpell && (
        <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between animate-pulse font-mono text-sm">
          <span>⚡ {spellStatusText}</span>
          <span className="animate-spin text-blue-400">&curren;</span>
        </div>
      )}

      {/* Overview stats layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reactor Core canvas */}
        <div className={`p-6 flex flex-col items-center justify-center relative rounded-xl bg-slate-950/40 border ${activeStyle.panelBg}`}>
          <span className="absolute top-3 left-4 text-xs font-mono tracking-widest text-slate-500 uppercase font-bold">Reactor Spin Grid</span>
          <canvas ref={canvasRef} width={180} height={180} />
          <span className={`text-sm font-mono ${activeStyle.textAccent} font-bold mt-2`}>
            {stats.cpuModel.includes('Intel') ? 'Intel Core Sorcerer' : 'AMD Multi-Thread Summoner'}
          </span>
        </div>

        {/* Attribute Gauges */}
        <div className={`lg:col-span-2 p-6 flex flex-col justify-between rounded-xl bg-slate-950/40 border ${activeStyle.panelBg}`}>
          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase border-b border-blue-500/5 pb-2">Core Attributes</h3>
            
            {/* HP RAM */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between font-bold">
                <span className="text-emerald-400">🟢 HP [RAM CORE CAPACITY]</span>
                <span>{stats.usedMemGB} GB / {stats.totalMemGB} GB ({stats.memUsagePercent}%)</span>
              </div>
              <div className={`w-full bg-slate-950 h-5 p-[2px] rounded border ${activeStyle.border}`}>
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded transition-all" style={{ width: `${stats.memUsagePercent}%` }} />
              </div>
            </div>

            {/* MP CPU */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between font-bold">
                <span className="text-purple-400">🟣 MP [REACTOR FREQUENCY]</span>
                <span>{100 - stats.cpuLoad}% Available</span>
              </div>
              <div className={`w-full bg-slate-950 h-5 p-[2px] rounded border ${activeStyle.border}`}>
                <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 h-full rounded transition-all" style={{ width: `${100 - stats.cpuLoad}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-blue-500/5 text-center font-mono text-xs">
            <div className="bg-[#090d16] p-2 rounded border border-blue-500/5">
              <span className="text-slate-500 uppercase block font-semibold">Uptime Buff</span>
              <span className={`font-bold ${activeStyle.textAccent}`}>{xp * 5}s</span>
            </div>
            <div className="bg-[#090d16] p-2 rounded border border-blue-500/5">
              <span className="text-slate-500 uppercase block font-semibold">Thread Pool</span>
              <span className="text-slate-300 font-bold">{stats.cpuCores} Lines</span>
            </div>
            <div className="bg-[#090d16] p-2 rounded border border-blue-500/5">
              <span className="text-slate-500 uppercase block font-semibold">Active multiplier</span>
              <span className="text-amber-400 font-bold">{doubleCreditBuff ? 'x2.0' : 'x1.0'}</span>
            </div>
            <div className="bg-[#090d16] p-2 rounded border border-blue-500/5">
              <span className="text-slate-500 uppercase block font-semibold">Upgrade Nodes</span>
              <span className="text-slate-300 font-bold">{unlockedUpgrades.length} / 5</span>
            </div>
          </div>
        </div>

      </div>

      {/* Premade One-Click Macros Section (Sentinel Arsenal) */}
      <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
        <div className="flex justify-between items-center border-b border-blue-500/10 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className={`w-4 h-4 ${activeStyle.textAccent}`} />
            <h3 className="text-sm font-mono font-bold tracking-widest text-slate-300 uppercase">
              Sentinel Arsenal (One-Click Macros)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 uppercase">Runs native sequences immediately</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {premadeMacros.map(macro => {
            const MacroIcon = macro.icon;
            const isRunning = runningMacro === macro.key;

            return (
              <button
                key={macro.key}
                onClick={() => runMacro(macro.key, macro.name, macro.cmd)}
                disabled={runningMacro !== null}
                className="bg-slate-950/40 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/35 rounded-lg p-4 text-left transition-all duration-300 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1.5 text-blue-400 group-hover:text-cyan-400 transition-colors">
                    <MacroIcon className="w-4 h-4 shrink-0" />
                    <h4 className="font-bold text-slate-200">{macro.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">{macro.desc}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between w-full">
                  <code className="text-cyan-500 text-[9px] bg-slate-950 px-1 py-0.5 rounded block truncate max-w-[140px] select-all">{macro.cmd}</code>
                  <span className="bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white px-2 py-0.5 rounded text-[10px] font-bold transition">
                    {isRunning ? 'RUNNING...' : 'DEPLOY'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upgrade tree */}
      <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
        <h3 className="text-sm font-mono font-bold tracking-widest text-slate-300 uppercase border-b border-blue-500/10 pb-2">
          SENTINEL SKILL UPGRADE TREE
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono text-xs">
          
          <div className="bg-slate-950 p-4 border border-emerald-500/35 rounded-lg flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-emerald-400 font-bold block uppercase tracking-widest text-xs">Base Monitor</span>
              <p className="text-xs text-slate-500">Core hardware dashboard statistics tracker.</p>
            </div>
            <span className="text-emerald-400 font-bold block mt-3 text-xs">UNLOCKED</span>
          </div>

          <div className={`bg-slate-950 p-4 border rounded-lg flex flex-col justify-between transition-colors ${unlockedUpgrades.includes('u-matrix') ? 'border-emerald-500/35' : 'border-blue-500/10'}`}>
            <div className="space-y-1">
              <span className="text-emerald-400 font-bold block uppercase tracking-widest text-xs">Matrix UI</span>
              <p className="text-xs text-slate-500">Unlocks classic green-hacker retro mainframe console theme.</p>
            </div>
            {unlockedUpgrades.includes('u-matrix') ? (
              <button onClick={() => setTheme('matrix')} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-full py-1.5 rounded mt-3 cursor-pointer text-xs">DEPLOY</button>
            ) : (
              <button onClick={() => buyUpgrade('u-matrix', 60, 'matrix')} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1.5 rounded mt-3 cursor-pointer text-xs">BUY: 60 CR</button>
            )}
          </div>

          <div className={`bg-slate-950 p-4 border rounded-lg flex flex-col justify-between transition-colors ${unlockedUpgrades.includes('u-vaporwave') ? 'border-emerald-500/35' : 'border-blue-500/10'}`}>
            <div className="space-y-1">
              <span className="text-fuchsia-400 font-bold block uppercase tracking-widest text-xs">Vaporwave UI</span>
              <p className="text-xs text-slate-500">Unlocks magenta synthwave holographic retro styling grid.</p>
            </div>
            {unlockedUpgrades.includes('u-vaporwave') ? (
              <button onClick={() => setTheme('vaporwave')} className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 w-full py-1.5 rounded mt-3 cursor-pointer text-xs">DEPLOY</button>
            ) : (
              <button onClick={() => buyUpgrade('u-vaporwave', 90, 'vaporwave')} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1.5 rounded mt-3 cursor-pointer text-xs">BUY: 90 CR</button>
            )}
          </div>

          <div className={`bg-slate-950 p-4 border rounded-lg flex flex-col justify-between transition-colors ${unlockedUpgrades.includes('u-solarized') ? 'border-emerald-500/35' : 'border-blue-500/10'}`}>
            <div className="space-y-1">
              <span className="text-amber-400 font-bold block uppercase tracking-widest text-xs">Solarized UI</span>
              <p className="text-xs text-slate-500">Unlocks terminal amber-monochrome high-contrast dashboard skin.</p>
            </div>
            {unlockedUpgrades.includes('u-solarized') ? (
              <button onClick={() => setTheme('solarized')} className="bg-amber-500/10 text-amber-400 border border-amber-500/30 w-full py-1.5 rounded mt-3 cursor-pointer text-xs">DEPLOY</button>
            ) : (
              <button onClick={() => buyUpgrade('u-solarized', 120, 'solarized')} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1.5 rounded mt-3 cursor-pointer text-xs">BUY: 120 CR</button>
            )}
          </div>

          <div className={`bg-slate-950 p-4 border rounded-lg flex flex-col justify-between transition-colors ${unlockedUpgrades.includes('u-double-credit') ? 'border-emerald-500/35' : 'border-blue-500/10'}`}>
            <div className="space-y-1">
              <span className="text-amber-400 font-bold block uppercase tracking-widest text-xs">Credit Boost</span>
              <p className="text-xs text-slate-500">Permanently doubles Credits harvested per active monitoring tick.</p>
            </div>
            {unlockedUpgrades.includes('u-double-credit') ? (
              <span className="text-emerald-400 font-bold block mt-3 text-xs">ACTIVE (x2.0)</span>
            ) : (
              <button onClick={() => buyUpgrade('u-double-credit', 150)} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1.5 rounded mt-3 cursor-pointer text-xs">BUY: 150 CR</button>
            )}
          </div>

        </div>
      </div>

      {/* Diagnostics / Spells panel */}
      <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
        <span className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase block">Active Diagnostics (Spells)</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <button onClick={() => castSpell('dnsCleanse')} disabled={castingSpell !== null} className={`p-4 rounded-lg text-left border ${activeStyle.btnGhost} cursor-pointer`}>
            <h4 className="text-xs font-bold text-slate-200">Aura Cleanse (Flush DNS)</h4>
            <p className="text-xs text-slate-400 mt-1 font-sans">Flashes physical DNS address blocks to refresh routing sectors.</p>
          </button>
          <button onClick={() => castSpell('ramRejuvenation')} disabled={castingSpell !== null} className={`p-4 rounded-lg text-left border ${activeStyle.btnGhost} cursor-pointer`}>
            <h4 className="text-xs font-bold text-slate-200">Mana Rejuvenation (GC Collect)</h4>
            <p className="text-xs text-slate-400 mt-1 font-sans">Collects heap garbage sectors and compacts virtual RAM sets.</p>
          </button>
          <button onClick={() => castSpell('chronosReset')} disabled={castingSpell !== null} className={`p-4 rounded-lg text-left border ${activeStyle.btnGhost} cursor-pointer`}>
            <h4 className="text-xs font-bold text-slate-200">Chronos Reset (Explorer Restart)</h4>
            <p className="text-xs text-slate-400 mt-1 font-sans">Terminates explorer.exe shell and restarts graphics dimension.</p>
          </button>
        </div>
      </div>

    </div>
  );
}
