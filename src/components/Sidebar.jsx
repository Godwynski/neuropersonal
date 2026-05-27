import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Cpu, Wrench, Zap, Terminal, FolderOpen, LayoutDashboard, Bot, Rocket, Sliders } from 'lucide-react';

export default function Sidebar({ activeStyle, stats, theme, advancedMode, setAdvancedMode, setActiveTab }) {
  const isLight = activeStyle.isLight;

  // Base inactive style adapts to theme
  const inactiveClass = isLight
    ? 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 border-transparent'
    : 'text-slate-400 hover:text-blue-300 hover:bg-white/5 border-transparent';

  const navItems = [
    { value: 'optimizer', label: '1-Click Optimize', icon: Rocket, iconClass: 'text-green-500 animate-pulse' },
    ...(advancedMode ? [
      { value: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard },
      { value: 'valorant',  label: 'Valorant Boost', icon: Zap, iconClass: 'text-amber-500' },
      { value: 'tweaks',    label: 'Tweak Deck',     icon: Wrench },
      { value: 'automation',label: 'Auto Sentinel',  icon: Bot },
      { value: 'terminal',  label: 'Command Panel',  icon: Terminal },
      { value: 'files',     label: 'Explorer',       icon: FolderOpen },
    ] : [])
  ];

  return (
    <aside className={`w-[220px] ${activeStyle.sidebarBg} border-r flex flex-col justify-between p-4 shrink-0 font-sans`}>
      <Tabs.List className="flex flex-col gap-1">
        {navItems.map(({ value, label, icon: Icon, iconClass }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className={`titlebar-no-drag w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all border cursor-pointer ${inactiveClass} data-[state=active]:${activeStyle.bgAccentActive}`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${iconClass || ''}`} />
            <span>{label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Bottom: Advanced Mode Toggle + active theme chip + live CPU stat */}
      <div className={`flex flex-col gap-3 border-t pt-4 text-xs ${activeStyle.border}`}>
        {/* Advanced Mode Toggle */}
        <div className={`flex items-center justify-between p-2 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-white/5'}`}>
          <div className="flex items-center gap-2">
            <Sliders size={14} className={advancedMode ? activeStyle.textAccent : 'text-slate-500'} />
            <span className={`font-bold text-xs uppercase tracking-widest ${activeStyle.textSub}`}>Advanced</span>
          </div>
          <button
            onClick={() => {
              const next = !advancedMode;
              setAdvancedMode(next);
              if (!next) {
                setActiveTab('optimizer');
              }
            }}
            className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${advancedMode ? 'bg-green-500' : 'bg-slate-600'}`}
          >
            <span 
              className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${advancedMode ? 'translate-x-4' : 'translate-x-0'}`} 
            />
          </button>
        </div>

        <div>
          <span className={`font-bold block px-1 mb-1.5 text-xs uppercase tracking-widest ${activeStyle.textSub}`}>Active Theme</span>
          <span className={`tracking-wider font-bold capitalize px-2 py-1.5 rounded-lg border flex items-center justify-center ${activeStyle.innerBg} ${activeStyle.border} ${activeStyle.textAccent}`}>
            {theme.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </div>
        {stats.cpuLoad > 0 && (
          <div className={`px-2 py-2 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-white/5'}`}>
            <span className={`text-xs uppercase tracking-widest font-bold block mb-1 ${activeStyle.textSub}`}>CPU Load</span>
            <div className={`w-full h-1.5 rounded-full ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
              <div 
                className={`h-full rounded-full transition-all ${stats.cpuLoad > 80 ? 'bg-red-500' : stats.cpuLoad > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${stats.cpuLoad}%` }}
              />
            </div>
            <span className={`text-xs mt-1 block font-bold ${activeStyle.textBody}`}>{stats.cpuLoad}% used</span>
          </div>
        )}
      </div>
    </aside>
  );
}
