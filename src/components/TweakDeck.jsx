import React from 'react';

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
  setShowAddScroll
}) {
  return (
    <div className="space-y-6 font-sans text-slate-800 bg-white p-2">
      <header className="border-b border-slate-200 pb-3">
        <h1 className="text-lg font-bold">OS Control &amp; Cache Purger</h1>
        <p className="text-[11px] text-slate-500">Configure file paths, toggle registry parameters, and clean temp directories.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Defragmenter Drives */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 text-xs">
              <h3 className="font-bold text-slate-600">Temp Cache Sector Analysis</h3>
              <span className="font-bold">Size: {tempFolderSize}</span>
            </div>

            {/* Flat block grid list */}
            <div className="grid grid-cols-12 gap-1 p-2 bg-white border border-slate-200 rounded max-h-[140px] overflow-y-auto">
              {defragSectors.map((sec, idx) => (
                <div 
                  key={idx} 
                  className={`aspect-square border border-slate-100 rounded-[2px] ${
                    sec === 'empty' 
                      ? 'bg-slate-50' 
                      : sec === 'system'
                        ? 'bg-slate-400'
                        : sec === 'files'
                          ? 'bg-slate-600'
                          : 'bg-slate-850 animate-pulse'
                  }`} 
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-[10px] text-slate-500 pt-1">
              <div className="flex gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-450 rounded-sm" /> System Caches</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-650 rounded-sm" /> Active Files</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-850 rounded-sm" /> Junk Cache</span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={scanTempFolder} 
                  disabled={scanningTemp || purgingTemp} 
                  className="px-2.5 py-1 text-xs border border-slate-200 bg-white hover:bg-slate-100 rounded cursor-pointer disabled:opacity-50"
                >
                  Scan Size
                </button>
                <button 
                  onClick={purgeTempFolder} 
                  disabled={purgingTemp || scanningTemp} 
                  className="px-2.5 py-1 text-xs bg-slate-800 text-white hover:bg-slate-700 rounded cursor-pointer disabled:opacity-50"
                >
                  Purge Junk
                </button>
              </div>
            </div>
          </div>

          {/* Registry overrides */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3 text-xs">
            <h3 className="font-bold text-slate-600 border-b border-slate-200 pb-1.5 uppercase tracking-wider">Windows Registry overrides</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border border-slate-200 bg-white rounded">
                <div>
                  <span className="font-bold">Force Dark Mode Theme</span>
                  <p className="text-[10px] text-slate-500">AppsUseLightTheme configuration key.</p>
                </div>
                <button 
                  onClick={() => toggleTweak(
                    'darkMode',
                    'powershell -Command "Set-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name AppsUseLightTheme -Value 0"',
                    'powershell -Command "Set-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name AppsUseLightTheme -Value 1"'
                  )} 
                  className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded font-bold cursor-pointer"
                >
                  {tweaks.darkMode ? 'ON (DARK)' : 'OFF (LIGHT)'}
                </button>
              </div>

              <div className="flex justify-between items-center p-2 border border-slate-200 bg-white rounded">
                <div>
                  <span className="font-bold">Display Hidden Sectors</span>
                  <p className="text-[10px] text-slate-500">Explorer\Advanced\Hidden registry status.</p>
                </div>
                <button 
                  onClick={() => toggleTweak(
                    'hiddenFiles',
                    'powershell -Command "Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced -Name Hidden -Value 1"',
                    'powershell -Command "Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced -Name Hidden -Value 2"'
                  )} 
                  className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded font-bold cursor-pointer"
                >
                  {tweaks.hiddenFiles ? 'SHOWING' : 'HIDDEN'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns */}
        <div className="space-y-6 text-xs">
          
          {/* Admin shortcuts */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h3 className="font-bold text-slate-600 border-b border-slate-200 pb-1.5 uppercase tracking-wider">Admin Launchers</h3>
            <div className="grid grid-cols-2 gap-2">
              {['taskmgr', 'regedit', 'devmgmt', 'envvars'].map((util) => {
                const labels = { taskmgr: 'Task Mgr', regedit: 'Registry', devmgmt: 'Devices', envvars: 'Env Vars' };
                return (
                  <button 
                    key={util}
                    onClick={() => launchAdminPanel(util)} 
                    className="p-2 border border-slate-200 bg-white hover:bg-slate-100 rounded font-bold cursor-pointer text-center"
                  >
                    {labels[util]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Script scrolls */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3 flex flex-col max-h-[300px]">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 shrink-0">
              <h3 className="font-bold text-slate-600 uppercase tracking-wider">Script Scrolls</h3>
              <button 
                onClick={() => setShowAddScroll(!showAddScroll)} 
                className="text-[10px] underline font-bold cursor-pointer"
              >
                {showAddScroll ? 'Close' : 'Create'}
              </button>
            </div>

            {showAddScroll ? (
              <form onSubmit={addScroll} className="space-y-2 text-xs shrink-0" autoComplete="off">
                <input 
                  type="text" 
                  placeholder="Title" 
                  value={newScroll.title}
                  onChange={(e) => setNewScroll(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-1 border border-slate-200 rounded"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Desc" 
                  value={newScroll.desc}
                  onChange={(e) => setNewScroll(prev => ({ ...prev, desc: e.target.value }))}
                  className="w-full p-1 border border-slate-200 rounded"
                />
                <input 
                  type="text" 
                  placeholder="Command" 
                  value={newScroll.cmd}
                  onChange={(e) => setNewScroll(prev => ({ ...prev, cmd: e.target.value }))}
                  className="w-full p-1 border border-slate-200 rounded font-mono"
                  required
                />
                <button type="submit" className="w-full py-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded cursor-pointer font-bold">Save Scroll</button>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 text-[11px]">
                {scrolls.map(s => (
                  <div key={s.id} className="p-2 border border-slate-200 bg-white rounded relative group">
                    <span className="font-bold text-slate-800 block">{s.title}</span>
                    <span className="text-slate-500 block leading-tight">{s.desc}</span>
                    <code className="text-[10px] px-1 bg-slate-50 border rounded block truncate mt-1.5 font-mono">{s.cmd}</code>
                    <button 
                      onClick={() => removeScroll(s.id)}
                      className="absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-2 h-[120px] flex flex-col justify-between">
            <span className="font-bold text-slate-600 block border-b border-slate-200 pb-1.5">Tweak Logs</span>
            <div className="overflow-y-auto flex-1 font-mono text-[9px] text-slate-500 leading-normal">
              {tweakLogs.map((l, i) => (
                <div key={i} className="border-l border-slate-300 pl-1.5 mt-0.5">&gt; {l}</div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
