import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function Sidebar() {
  const { activeAppTab, setActiveAppTab, valorantRunning } = useAppContext();

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'settings', icon: '🔧', label: 'Settings & Backup' }
  ];

  return (
    <aside className="w-full md:w-56 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#262626] p-3 md:p-4 flex flex-row md:flex-col gap-2 md:gap-2 overflow-x-auto md:overflow-y-auto shrink-0 relative custom-scrollbar scrollbar-hide">
      
      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-row md:flex-col gap-1.5 min-w-max md:min-w-0">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveAppTab(item.id)}
            className={`flex items-center justify-center md:justify-start gap-2.5 px-3 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap text-[13px] ${
              activeAppTab === item.id 
                ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30' 
                : 'text-gray-400 hover:bg-[#141414] hover:text-gray-200 border border-transparent'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="font-outfit">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Valorant Status Badge — compact indicator at bottom */}
      <div className="hidden md:flex items-center gap-2 mt-auto pt-3 border-t border-[#262626] px-2">
        <span className={`w-2 h-2 rounded-full ${valorantRunning ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`} />
        <span className="text-[11px] text-gray-500 font-medium font-outfit">
          {valorantRunning ? 'VALORANT Running' : 'VALORANT Idle'}
        </span>
      </div>

    </aside>
  );
}
