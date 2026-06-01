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
    initMessage,
    isProcessing,
    processingMessage,
    toasts,
    removeToast,
    systemLogs,
    setSystemLogs
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
    <div className="flex flex-col h-screen select-none bg-paper-bg paper-texture text-pencil-black font-patrick overflow-hidden relative">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Floating Wobbly Initialization Toast */}
      {isInitializing && (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-auto animate-bounce">
          <div className="bg-[#fff9c4] border-[3px] border-pencil-black p-3.5 wobbly-md hand-shadow flex items-center gap-3 max-w-xs shadow-md">
            <span className="w-5 h-5 shrink-0 rounded-full border-2 border-pencil-black border-t-accent-blue animate-spin" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[11px] font-kalam text-pencil-black uppercase tracking-wide">✍️ Setup Diagnostics</div>
              <p className="text-[10px] text-pencil-black/90 font-bold truncate mt-0.5">{initMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Window Header */}
      <header className="titlebar-drag h-12 border-b-[3px] border-pencil-black bg-paper-muted flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-accent-red border border-pencil-black animate-pulse" />
          <span className="text-sm font-bold font-kalam uppercase tracking-wider text-pencil-black">✍️ NEUROPTIMIZE CONTROL DECK</span>
        </div>
        
        {/* Wobbly Window Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMinimize}
            title="Minimize"
            className="titlebar-no-drag w-6 h-6 border-2 border-pencil-black wobbly-sm flex items-center justify-center font-bold text-sm bg-white text-pencil-black hover:bg-[#fff9c4] hover:rotate-6 active:scale-95 transition-all cursor-pointer"
          >
            &minus;
          </button>
          <button 
            onClick={handleMaximize}
            title="Maximize"
            className="titlebar-no-drag w-6 h-6 border-2 border-pencil-black wobbly-sm flex items-center justify-center font-bold text-xs bg-white text-pencil-black hover:bg-blue-100 hover:-rotate-6 active:scale-95 transition-all cursor-pointer"
          >
            &#9633;
          </button>
          <button 
            onClick={handleClose}
            title="Close"
            className="titlebar-no-drag w-6 h-6 border-2 border-pencil-black wobbly-sm flex items-center justify-center font-bold text-xs bg-white text-pencil-black hover:bg-accent-red hover:text-white hover:rotate-12 active:scale-95 transition-all cursor-pointer"
          >
            &#10005;
          </button>
        </div>
      </header>

      {!isElectron && (
        <div className="bg-[#fff9c4] border-b-2 border-dashed border-pencil-black text-pencil-black text-[12px] font-bold px-4 py-2 flex items-center justify-between shrink-0 relative z-20">
          <span>⚠️ SIMULATION MODE: Settings are mock-saved. To apply actual Windows tweaks and timers, launch the packaged Electron dashboard.</span>
        </div>
      )}

      {/* Main Single Page Dashboard */}
      <div className="flex-1 flex overflow-hidden relative">

        {isProcessing && (
          <div className="absolute inset-0 bg-pencil-black/35 backdrop-blur-[2px] flex items-center justify-center z-50 transition-all duration-200">
            <div className="bg-white border-[3px] border-pencil-black p-6 wobbly hand-shadow-lg flex flex-col items-center gap-3 max-w-xs text-center">
              <span className="w-8 h-8 rounded-full border-[3px] border-paper-muted border-t-accent-red animate-spin" />
              <div className="font-bold text-sm font-kalam text-pencil-black">Applying Sketch Tweaks</div>
              <p className="text-[12px] text-pencil-black/70 font-semibold">{processingMessage || 'Please wait while Windows updates settings...'}</p>
            </div>
          </div>
        )}
        
        {/* Left Control Column (Sidebar) */}
        <Sidebar />

        {/* Right Optimization Columns (Game Booster) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white border-l-[3px] border-pencil-black">
          <div className="flex-1 p-6 overflow-y-auto">
            <ValorantOptimizer />
          </div>
          <BottomConsole 
            logs={systemLogs} 
            onClear={() => setSystemLogs([])} 
            theme={{
              panelBg: 'bg-paper-muted border-t-[3px]',
              border: 'border-pencil-black',
              textAccent: 'text-accent-blue font-bold',
              textPrimary: 'text-pencil-black'
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
