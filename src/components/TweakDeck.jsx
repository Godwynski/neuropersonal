import React from 'react';
import { Wrench, Trash2, ChevronRight, Trash } from 'lucide-react';

export default function TweakDeck({
  tempFolderSize,
  scanningTemp,
  purgingTemp,
  defragSectors,
  tweakLogs,
  tweaks,
  toggleTweak,
  scanTempFolder,
  purgeTempFolder,
  launchAdminPanel,
  scrolls,
  removeScroll,
  newScroll,
  setNewScroll,
  addScroll,
  showAddScroll,
  setShowAddScroll,
  activeStyle
}) {
  return (
    <div className="space-y-6 outline-none font-sans animate-in fade-in duration-300">
      <header className="border-b border-blue-500/10 pb-4">
        <h1 className="text-xl font-bold tracking-wide text-slate-200">OS Control &amp; Cache Purger</h1>
        <p className="text-xs text-indigo-400 mt-1">Toggle registry settings, manage scroll scripts, and purge temporary sectors</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Defragmenter Drive Map */}
          <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex justify-between items-center border-b border-blue-500/5 pb-2">
              <h3 className="text-sm font-semibold tracking-wide text-blue-400 uppercase">
                Temp Cache Sector Analysis
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Cache Size: {tempFolderSize}</span>
            </div>

            {/* 120-block grid */}
            <div className="grid grid-cols-12 gap-1.5 bg-[#05080e] p-4 rounded-lg border border-blue-500/5 max-h-[160px] overflow-y-auto">
              {defragSectors.map((sec, idx) => (
                <div 
                  key={idx} 
                  className={`aspect-square rounded-[1px] transition-colors duration-150 ${
                    sec === 'empty' 
                      ? 'bg-slate-900 border border-white/2' 
                      : sec === 'system'
                        ? 'bg-blue-600/80 shadow-[0_0_2px_rgba(59,130,246,0.5)]'
                        : sec === 'files'
                          ? 'bg-cyan-600/80 shadow-[0_0_2px_rgba(6,182,212,0.5)]'
                          : 'bg-amber-500 animate-pulse shadow-[0_0_4px_rgba(245,158,11,0.8)]'
                  }`} 
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs text-slate-400 pt-1">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" /> System Caches</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-600 rounded-sm" /> Active Files</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" /> Junk Cache</span>
              </div>

              <div className="flex gap-2">
                <button onClick={scanTempFolder} disabled={scanningTemp || purgingTemp} className={`px-3 py-1.5 rounded text-xs font-bold ${activeStyle.btnGhost} cursor-pointer disabled:opacity-50`}>SCAN</button>
                <button onClick={purgeTempFolder} disabled={purgingTemp || scanningTemp} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer disabled:opacity-50">PURGE TEMP CACHE</button>
              </div>
            </div>
          </div>

          {/* Registry settings overrides */}
          <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
            <h3 className="text-sm font-semibold tracking-wide text-blue-400 uppercase border-b border-blue-500/10 pb-2">
              Windows Registry Tweaks (HKCU Overrides)
            </h3>
            
            <div className="divide-y divide-blue-500/5 text-sm">
              
              {/* Dark Mode */}
              <div className="flex justify-between items-center py-3.5">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-200 block text-sm">Force Dark Mode Theme</span>
                  <span className="text-xs text-slate-400 block font-mono">Personalize\AppsUseLightTheme</span>
                </div>
                <button onClick={() => toggleTweak(
                  'darkMode',
                  'powershell -Command "Set-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name AppsUseLightTheme -Value 0"',
                  'powershell -Command "Set-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name AppsUseLightTheme -Value 1"'
                )} className={`px-4 py-2 rounded text-xs font-bold border ${activeStyle.border} hover:bg-white/3 cursor-pointer transition`}>
                  {tweaks.darkMode ? 'ON (DARK)' : 'OFF (LIGHT)'}
                </button>
              </div>

              {/* Hidden Files */}
              <div className="flex justify-between items-center py-3.5">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-200 block text-sm">Display Hidden Sectors</span>
                  <span className="text-xs text-slate-400 block font-mono">Explorer\Advanced\Hidden (1=Show, 2=Hide)</span>
                </div>
                <button onClick={() => toggleTweak(
                  'hiddenFiles',
                  'powershell -Command "Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced -Name Hidden -Value 1"',
                  'powershell -Command "Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced -Name Hidden -Value 2"'
                )} className={`px-4 py-2 rounded text-xs font-bold border ${activeStyle.border} hover:bg-white/3 cursor-pointer transition`}>
                  {tweaks.hiddenFiles ? 'SHOWING' : 'HIDDEN'}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right column sidebar: Admin Panel launching & Script Scroll registry */}
        <div className="space-y-6">
          
          {/* Admin launchers */}
          <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-3`}>
            <h3 className="text-sm font-semibold tracking-wide text-blue-400 uppercase border-b border-blue-500/10 pb-2">Admin Launchers</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => launchAdminPanel('taskmgr')} className="bg-[#090d16] hover:bg-blue-500/15 border border-blue-500/5 hover:border-blue-500/30 p-2.5 rounded cursor-pointer transition font-semibold">Task Mgr</button>
              <button onClick={() => launchAdminPanel('regedit')} className="bg-[#090d16] hover:bg-blue-500/15 border border-blue-500/5 hover:border-blue-500/30 p-2.5 rounded cursor-pointer transition font-semibold">Registry</button>
              <button onClick={() => launchAdminPanel('devmgmt')} className="bg-[#090d16] hover:bg-blue-500/15 border border-blue-500/5 hover:border-blue-500/30 p-2.5 rounded cursor-pointer transition font-semibold">Devices</button>
              <button onClick={() => launchAdminPanel('envvars')} className="bg-[#090d16] hover:bg-blue-500/15 border border-blue-500/5 hover:border-blue-500/30 p-2.5 rounded cursor-pointer transition font-semibold">Env Vars</button>
            </div>
          </div>

          {/* Script Scroll registry */}
          <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-3 flex flex-col max-h-[300px]`}>
            <div className="flex justify-between items-center border-b border-blue-500/10 pb-2 shrink-0">
              <h3 className="text-sm font-semibold tracking-wide text-blue-400 uppercase">Script Scrolls</h3>
              <button onClick={() => setShowAddScroll(!showAddScroll)} className={`text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer`}>
                {showAddScroll ? 'CLOSE' : 'WRITE'}
              </button>
            </div>

            {showAddScroll ? (
              <form onSubmit={addScroll} className="space-y-2 text-xs shrink-0" autoComplete="off">
                <input 
                  type="text" 
                  placeholder="Scroll Name" 
                  value={newScroll.title}
                  onChange={(e) => setNewScroll(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#05080e] border border-white/5 rounded px-2.5 py-1.5 outline-none text-slate-100"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Description" 
                  value={newScroll.desc}
                  onChange={(e) => setNewScroll(prev => ({ ...prev, desc: e.target.value }))}
                  className="w-full bg-[#05080e] border border-white/5 rounded px-2.5 py-1.5 outline-none text-slate-100"
                />
                <input 
                  type="text" 
                  placeholder="Shell Command" 
                  value={newScroll.cmd}
                  onChange={(e) => setNewScroll(prev => ({ ...prev, cmd: e.target.value }))}
                  className="w-full bg-[#05080e] border border-white/5 rounded px-2.5 py-1.5 outline-none text-slate-100 font-mono"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded-lg font-bold cursor-pointer hover:bg-blue-500 transition text-xs">SAVE SCROLL</button>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
                {scrolls.map(s => (
                  <div key={s.id} className="bg-slate-950/80 p-3 rounded-lg border border-blue-500/5 relative group">
                    <span className="font-bold text-slate-200 block text-xs">{s.title}</span>
                    <span className="text-slate-400 text-xs block mb-2 leading-relaxed">{s.desc}</span>
                    <code className="text-cyan-400 text-xs bg-slate-950 border border-white/5 px-2 py-1 rounded select-all block truncate font-mono">{s.cmd}</code>
                    <button 
                      onClick={() => removeScroll(s.id)}
                      className="absolute top-2.5 right-2.5 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit log Console */}
          <div className="bg-[#05080e]/60 border border-blue-500/5 p-4 rounded-xl h-[125px] shrink-0 font-sans text-xs flex flex-col justify-between">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider border-b border-blue-500/5 pb-2 mb-2">Deck Logs</span>
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 text-slate-450 select-text leading-relaxed">
              {tweakLogs.length === 0 ? <div className="italic text-slate-600">Waiting for actions...</div> : tweakLogs.map((l, i) => <div key={i} className="border-l-2 border-blue-500/10 pl-2 text-xs">{l}</div>)}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
