import React from 'react';
import TelemetryMonitor from './TelemetryMonitor';
import OneClickBooster from './OneClickBooster';
import SystemCleaners from './SystemCleaners';
import RegistryRollback from './RegistryRollback';

export default function Sidebar() {
  return (
    <aside className="w-80 bg-[#0a0a0a] border-r border-[#262626] p-5 flex flex-col gap-6 overflow-y-auto shrink-0 relative custom-scrollbar">
      <TelemetryMonitor />
      <OneClickBooster />
      <SystemCleaners />
      <RegistryRollback />
    </aside>
  );
}
