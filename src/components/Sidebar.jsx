import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import TelemetryMonitor from './TelemetryMonitor';

export default function Sidebar() {
  const { activeAppTab, setActiveAppTab } = useAppContext();

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'advanced', icon: '⚙️', label: 'Advanced Tweaks' },
    { id: 'cleaners', icon: '🧹', label: 'System Cleaners' },
    { id: 'settings', icon: '🔧', label: 'Settings' }
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#262626] p-5 flex flex-col gap-6 overflow-y-auto shrink-0 relative custom-scrollbar">
      
      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map(item => !item.hidden && (
          <button
            key={item.id}
            onClick={() => setActiveAppTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeAppTab === item.id 
                ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30 shadow-sm' 
                : 'text-gray-400 hover:bg-[#141414] hover:text-gray-200 border border-transparent'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-outfit">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mini Telemetry widget at bottom to retain usefulness */}
      <div className="mt-auto pt-4 border-t border-[#262626]">
        <TelemetryMonitor />
      </div>

    </aside>
  );
}
