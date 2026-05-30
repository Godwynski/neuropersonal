import React from 'react';
import TelemetryMonitor from './TelemetryMonitor';
import OneClickBooster from './OneClickBooster';
import SystemCleaners from './SystemCleaners';
import RegistryRollback from './RegistryRollback';

export default function Sidebar() {
  return (
    <aside className="w-80 border-r border-slate-200 bg-slate-100 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
      <TelemetryMonitor />
      <OneClickBooster />
      <SystemCleaners />
      <RegistryRollback />
    </aside>
  );
}
