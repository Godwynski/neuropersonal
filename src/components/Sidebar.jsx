import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Cpu, Wrench, Zap, Terminal, FolderOpen } from 'lucide-react';

export default function Sidebar({ activeStyle, stats, theme }) {
  return (
    <aside className={`w-[230px] ${activeStyle.sidebarBg} border-r flex flex-col justify-between p-4 shrink-0 font-mono`}>
      <Tabs.List className="flex flex-col gap-1.5">
        <Tabs.Trigger 
          value="dashboard" 
          className={`titlebar-no-drag w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all border border-transparent text-slate-400 hover:text-blue-300 data-[state=active]:${activeStyle.bgAccentActive}`}
        >
          <Cpu className="w-4 h-4 shrink-0" />
          <span>REACTOR CORE</span>
        </Tabs.Trigger>

        <Tabs.Trigger 
          value="valorant" 
          className={`titlebar-no-drag w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all border border-transparent text-slate-400 hover:text-blue-300 data-[state=active]:${activeStyle.bgAccentActive}`}
        >
          <Zap className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
          <span>VALORANT BOOST</span>
        </Tabs.Trigger>
        
        <Tabs.Trigger 
          value="tweaks" 
          className={`titlebar-no-drag w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all border border-transparent text-slate-400 hover:text-blue-300 data-[state=active]:${activeStyle.bgAccentActive}`}
        >
          <Wrench className="w-4 h-4 shrink-0" />
          <span>TWEAK DECK</span>
        </Tabs.Trigger>

        <Tabs.Trigger 
          value="automation" 
          className={`titlebar-no-drag w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all border border-transparent text-slate-400 hover:text-blue-300 data-[state=active]:${activeStyle.bgAccentActive}`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>AUTO SENTINEL</span>
        </Tabs.Trigger>
        
        <Tabs.Trigger 
          value="terminal" 
          className={`titlebar-no-drag w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all border border-transparent text-slate-400 hover:text-blue-300 data-[state=active]:${activeStyle.bgAccentActive}`}
        >
          <Terminal className="w-4 h-4 shrink-0" />
          <span>COMMAND PANEL</span>
        </Tabs.Trigger>
        
        <Tabs.Trigger 
          value="files" 
          className={`titlebar-no-drag w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all border border-transparent text-slate-400 hover:text-blue-300 data-[state=active]:${activeStyle.bgAccentActive}`}
        >
          <FolderOpen className="w-4 h-4 shrink-0" />
          <span>EXPLORER</span>
        </Tabs.Trigger>
      </Tabs.List>

      <div className="flex flex-col gap-2 border-t border-blue-500/10 pt-4 text-xs">
        <span className="text-slate-500 font-bold block px-1">ACTIVE THEME</span>
        <span className={`tracking-wider font-bold capitalize px-2 py-1 rounded bg-[#090d16] border ${activeStyle.border} ${activeStyle.textAccent} text-center`}>
          {theme} Style
        </span>
      </div>
    </aside>
  );
}
