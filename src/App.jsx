import React from 'react';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import ValorantOptimizer from './components/ValorantOptimizer';
import BottomConsole from './components/BottomConsole';
import DashboardOverview from './components/DashboardOverview';
import SystemCleaners from './components/SystemCleaners';
import RegistryRollback from './components/RegistryRollback';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import ErrorBoundary from './components/ErrorBoundary';

function DashboardContent() {
  const {
    isElectron,
    isInitializing,
    initMessage,
    isProcessing,
    processingMessage,
    showRebootPrompt,
    setShowRebootPrompt,
    toasts,
    removeToast,
    systemLogs,
    setSystemLogs,
    activeAppTab
  } = useAppContext();

  const handleMinimize = () => {
    if (window.api?.minimizeWindow) {
      window.api.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.api?.maximizeWindow) {
      window.api.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.api?.closeWindow) {
      window.api.closeWindow();
    }
  };

  return (
    <div className="flex flex-col h-screen select-none bg-[#0a0a0a] text-gray-200 font-inter overflow-hidden relative">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Floating Initialization Toast */}
      {isInitializing && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
          <div className="glass-panel p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm border border-[#262626]">
            <span className="w-5 h-5 shrink-0 rounded-full border-2 border-[#262626] border-t-[#3b82f6] animate-spin" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-gray-100 uppercase tracking-widest font-outfit">System Diagnostics</div>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{initMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Window Header */}
      <header className="titlebar-drag h-14 border-b border-[#262626] bg-[#141414]/80 backdrop-blur-md flex items-center px-5 shrink-0 justify-between z-30">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff4655] shadow-[0_0_8px_rgba(255,70,85,0.6)] animate-pulse" />
          <span className="text-xs font-semibold font-outfit uppercase tracking-[0.2em] text-gray-200">NeurOptimize</span>
        </div>
        
        {/* Sleek Window Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMinimize}
            title="Minimize"
            className="titlebar-no-drag w-7 h-7 rounded hover:bg-[#262626] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor">
              <rect width="12" height="2" rx="1" />
            </svg>
          </button>
          <button 
            onClick={handleMaximize}
            title="Maximize"
            className="titlebar-no-drag w-7 h-7 rounded hover:bg-[#262626] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="8" height="8" rx="1" />
            </svg>
          </button>
          <button 
            onClick={handleClose}
            title="Close"
            className="titlebar-no-drag w-7 h-7 rounded hover:bg-[#ff4655] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1L9 9M9 1L1 9" />
            </svg>
          </button>
        </div>
      </header>

      {!isElectron && (
        <div className="bg-[#ff4655]/10 border-b border-[#ff4655]/30 text-[#ff4655] text-xs font-medium px-5 py-2.5 flex items-center justify-between shrink-0 relative z-20 backdrop-blur-sm">
          <span>⚠️ SIMULATION MODE: Settings are mock-saved. To apply actual Windows tweaks and timers, launch the packaged Electron dashboard.</span>
        </div>
      )}

      {/* Main Single Page Dashboard */}
      <div className="flex-1 flex overflow-hidden relative">

        {isProcessing && (
          <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="glass-panel p-8 rounded-2xl neon-shadow flex flex-col items-center gap-4 max-w-sm text-center border border-[#262626]">
              <span className="w-10 h-10 rounded-full border-[3px] border-[#262626] border-t-[#ff4655] animate-spin" />
              <div className="font-semibold text-lg font-outfit text-gray-100">Applying Kernel Tweaks</div>
              <p className="text-sm text-gray-400">{processingMessage || 'Please wait while Windows updates parameters...'}</p>
            </div>
          </div>
        )}

        {showRebootPrompt && (
          <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-[#141414] p-8 rounded-2xl flex flex-col items-center gap-6 max-w-md text-center border border-[#ff4655] shadow-[0_0_30px_rgba(255,70,85,0.2)]">
              <div className="w-16 h-16 rounded-full bg-[#ff4655]/20 flex items-center justify-center text-3xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-xl font-bold font-outfit text-white mb-2">System Restart Required</h3>
                <p className="text-sm text-gray-400">
                  Some advanced kernel tweaks have been modified. You need to restart your PC for these changes to take full effect and avoid system instability.
                </p>
              </div>
              <div className="flex w-full gap-4 mt-2">
                <button 
                  onClick={() => setShowRebootPrompt(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#262626] text-gray-400 hover:text-white hover:bg-[#262626] font-bold transition-all"
                >
                  Restart Later
                </button>
                <button 
                  onClick={() => { if (window.api && window.api.restartPc) window.api.restartPc(); }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#ff4655] hover:bg-[#ff4655]/80 text-white font-bold transition-all"
                >
                  Restart Now
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Left Control Column (Sidebar) */}
        <Sidebar />

        {/* Right Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] border-l border-[#262626]">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeAppTab === 'dashboard' && <DashboardOverview />}
            {activeAppTab === 'advanced' && <ValorantOptimizer />}
            {activeAppTab === 'cleaners' && (
              <div className="p-8 max-w-5xl w-full mx-auto"><SystemCleaners /></div>
            )}
            {activeAppTab === 'settings' && (
              <div className="p-8 max-w-5xl w-full mx-auto"><RegistryRollback /></div>
            )}
          </div>
          <BottomConsole 
            logs={systemLogs} 
            onClear={() => setSystemLogs([])} 
            theme={{
              panelBg: 'bg-[#141414] border-t border-[#262626]',
              border: 'border-[#262626]',
              textAccent: 'text-[#3b82f6] font-semibold',
              textPrimary: 'text-gray-300'
            }} 
          />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <DashboardContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
