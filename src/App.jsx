import React from 'react';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import ValorantOptimizer from './components/ValorantOptimizer';
import BottomConsole from './components/BottomConsole';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';

function DashboardContent() {
  const {
    isElectron,
    isInitializing,
    isProcessing,
    processingMessage,
    toasts,
    removeToast,
    systemLogs,
    setSystemLogs
  } = useAppContext();

  return (
    <div className="flex flex-col h-screen select-none bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Window Header */}
      <header className="titlebar-drag h-10 border-b border-slate-200 bg-slate-900 text-slate-100 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-350">NEUROPTIMIZE GAME CONTROL DECK</span>
        </div>
      </header>

      {!isElectron && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-800 text-[11px] font-bold px-4 py-2 flex items-center justify-between shrink-0">
          <span>⚠️ SIMULATION MODE ACTIVE: System changes are simulated. To apply real tweaks and optimization commands, launch this dashboard as a packaged Electron application.</span>
        </div>
      )}

      {/* Main Single Page Dashboard */}
      <div className="flex-1 flex overflow-hidden relative">
        {isInitializing && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-xl flex flex-col items-center gap-3 max-w-xs text-center">
              <span className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin" />
              <div className="font-bold text-xs text-slate-800">Initializing Control Deck</div>
              <p className="text-[10px] text-slate-500">Querying hardware telemetry and subsystem configuration...</p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px] flex items-center justify-center z-50 transition-all duration-200">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-2xl flex flex-col items-center gap-3 max-w-xs text-center">
              <span className="w-8 h-8 rounded-full border-2 border-slate-100 border-t-indigo-600 animate-spin" />
              <div className="font-bold text-xs text-slate-800">Applying Optimization Tweak</div>
              <p className="text-[10px] text-slate-500 font-medium">{processingMessage || 'Please wait while Windows configures settings...'}</p>
            </div>
          </div>
        )}
        
        {/* Left Control Column (Sidebar) */}
        <Sidebar />

        {/* Right Optimization Columns (Game Booster) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 p-6 overflow-y-auto">
            <ValorantOptimizer />
          </div>
          <BottomConsole 
            logs={systemLogs} 
            onClear={() => setSystemLogs([])} 
            theme={{
              panelBg: 'bg-slate-950',
              border: 'border-slate-800',
              textAccent: 'text-indigo-400',
              textPrimary: 'text-slate-100'
            }} 
          />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
