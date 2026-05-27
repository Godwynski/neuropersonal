import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';

export default function Sidebar({ stats, advancedMode, setAdvancedMode, setActiveTab }) {
  const navItems = [
    { value: 'optimizer', label: '1-Click Optimize' },
    ...(advancedMode ? [
      { value: 'dashboard', label: 'Dashboard' },
      { value: 'valorant',  label: 'Valorant Boost' },
      { value: 'tweaks',    label: 'Tweak Deck' },
      { value: 'automation',label: 'Auto Sentinel' },
      { value: 'terminal',  label: 'Command Panel' },
      { value: 'files',     label: 'Explorer' }
    ] : [])
  ];

  return (
    <aside className="w-48 border-r border-slate-200 flex flex-col justify-between p-4 bg-slate-50 font-sans select-none">
      <Tabs.List className="flex flex-col gap-2">
        {navItems.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="w-full text-left px-3 py-2 text-sm border border-slate-200 bg-white hover:bg-slate-100 rounded cursor-pointer data-[state=active]:bg-slate-200 data-[state=active]:border-slate-400 font-medium transition-colors"
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-xs text-slate-600">
        {/* Advanced Mode Toggle */}
        <div className="flex items-center justify-between p-2 border border-slate-200 bg-white rounded">
          <span className="font-bold">ADVANCED</span>
          <button
            onClick={() => {
              const next = !advancedMode;
              setAdvancedMode(next);
              if (!next) {
                setActiveTab('optimizer');
              }
            }}
            className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
              advancedMode ? 'bg-slate-800' : 'bg-slate-300'
            }`}
          >
            <span 
              className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${advancedMode ? 'translate-x-3.5' : 'translate-x-0'}`} 
            />
          </button>
        </div>

        {stats && stats.cpuLoad !== undefined && (
          <div className="p-2 border border-slate-200 bg-white rounded">
            <span className="font-bold block mb-1">CPU Load</span>
            <div className="w-full h-2 rounded bg-slate-200 overflow-hidden">
              <div 
                className="h-full bg-slate-600 transition-all"
                style={{ width: `${stats.cpuLoad}%` }}
              />
            </div>
            <span className="mt-1 block font-mono text-[10px]">{stats.cpuLoad}%</span>
          </div>
        )}
      </div>
    </aside>
  );
}
