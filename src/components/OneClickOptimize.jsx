import React from 'react';
import { Rocket, CheckCircle, ShieldAlert, Cpu, Activity, ShieldCheck } from 'lucide-react';

export default function OneClickOptimize({ isOptimizing, isOptimized, onOptimize, onRevert, isAdmin, theme }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-full p-8 ${theme.bg}`}>
      
      <div className="text-center mb-6 max-w-2xl">
        <h1 className={`text-4xl font-bold mb-4 ${theme.textPrimary}`}>
          System Performance Optimizer
        </h1>
        <p className={`text-lg ${theme.textSub}`}>
          Achieve maximum performance and lowest latency for Valorant and competitive gaming with a single click. 
          We handle all the complex registry tweaks, power plan adjustments, and network optimizations under the hood.
        </p>
      </div>

      {!isAdmin && (
        <div className="w-full max-w-md mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3 text-red-200">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-red-400">Admin Privileges Required</h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              The app is running with standard user rights. Critical registry tweaks, latency adjustments, and network optimizations will fail. Close the app, right-click its launcher, and select <strong>Run as administrator</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Status & Button Card */}
      <div className={`p-8 rounded-2xl border backdrop-blur-md w-full max-w-md flex flex-col items-center shadow-2xl relative overflow-hidden ${theme.panelBg}`}>
        
        {/* Animated Background Glow */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000"
          style={{ 
            background: isOptimized 
              ? `radial-gradient(circle at center, #22c55e 0%, transparent 70%)` 
              : `radial-gradient(circle at center, ${theme.glowColor} 0%, transparent 70%)`
          }}
        />

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Status Icon */}
          <div className="mb-6">
            {isOptimizing ? (
              <div className="relative">
                <div className={`absolute inset-0 rounded-full animate-ping opacity-50 bg-blue-500`}></div>
                <Rocket className="w-24 h-24 text-blue-500 animate-pulse" />
              </div>
            ) : isOptimized ? (
              <CheckCircle className="w-24 h-24 text-green-500" />
            ) : (
              <ShieldAlert className={`w-24 h-24 ${theme.textAccent}`} />
            )}
          </div>

          {/* Status Text */}
          <h2 className={`text-2xl font-bold mb-2 ${isOptimized ? 'text-green-500' : theme.textPrimary}`}>
            {isOptimizing ? 'Optimizing System...' : isOptimized ? 'System Optimized' : 'System Needs Optimization'}
          </h2>
          <p className={`text-center mb-8 ${theme.textSub}`}>
            {isOptimizing 
              ? 'Applying registry tweaks and tuning hardware. Please wait.' 
              : isOptimized 
                ? 'Your system is tuned for peak gaming performance.' 
                : 'Your system is currently running on default settings.'}
          </p>

          {/* Action Button */}
          <button
            onClick={isOptimized ? onRevert : onOptimize}
            disabled={isOptimizing}
            className={`w-full py-4 px-8 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all duration-300
              ${isOptimizing 
                ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/50' 
                : isOptimized
                  ? 'bg-green-600/20 border border-green-500/40 text-green-400 cursor-default'
                  : `${theme.btnPrimary} hover:scale-105 active:scale-95`
              }
            `}
          >
            {isOptimizing ? (
              <>
                <Activity className="animate-spin" />
                Processing...
              </>
            ) : isOptimized ? (
              <>
                <ShieldCheck />
                Optimized
              </>
            ) : (
              <>
                <Rocket />
                1-Click Optimize
              </>
            )}
          </button>

          {isOptimized && !isOptimizing && (
            <button
              onClick={onRevert}
              className={`mt-4 text-xs font-semibold underline opacity-70 hover:opacity-100 transition-opacity cursor-pointer ${theme.textPrimary}`}
            >
              Restore Windows Defaults
            </button>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
        <div className={`p-5 rounded-xl border ${theme.innerBg}`}>
          <Cpu className={`w-8 h-8 mb-3 ${theme.textAccent}`} />
          <h3 className={`font-bold mb-2 ${theme.textPrimary}`}>CPU & Core Tuning</h3>
          <p className={`text-sm ${theme.textSub}`}>Unparks CPU cores, disables dynamic ticks, and assigns high priority to games.</p>
        </div>
        <div className={`p-5 rounded-xl border ${theme.innerBg}`}>
          <Activity className={`w-8 h-8 mb-3 ${theme.textAccent}`} />
          <h3 className={`font-bold mb-2 ${theme.textPrimary}`}>Latency Reduction</h3>
          <p className={`text-sm ${theme.textSub}`}>Disables mouse acceleration, USB suspend, and fullscreen optimizations for instant response.</p>
        </div>
        <div className={`p-5 rounded-xl border ${theme.innerBg}`}>
          <Rocket className={`w-8 h-8 mb-3 ${theme.textAccent}`} />
          <h3 className={`font-bold mb-2 ${theme.textPrimary}`}>Graphics Overdrive</h3>
          <p className={`text-sm ${theme.textSub}`}>Enables HAGS, disables Game DVR, and applies ultra-low latency tournament presets.</p>
        </div>
      </div>

    </div>
  );
}
