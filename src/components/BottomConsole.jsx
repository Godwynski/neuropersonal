import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function BottomConsole({ logs, onClear, theme }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`h-48 border-t flex flex-col ${theme.panelBg} ${theme.border}`}>
      <div className={`px-4 py-2 border-b flex justify-between items-center bg-black/20 ${theme.border}`}>
        <div className="flex items-center gap-2">
          <Terminal size={14} className={theme.textAccent} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${theme.textPrimary}`}>
            System Console
          </span>
        </div>
        <button 
          onClick={onClear}
          className={`p-1 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors`}
          title="Clear Console"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-black/40"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">Waiting for system output...</div>
        ) : (
          logs.map((log, i) => {
            const isError = log.toLowerCase().includes('error') || log.toLowerCase().includes('fail');
            const isSuccess = log.toLowerCase().includes('success') || log.toLowerCase().includes('enabled') || log.toLowerCase().includes('disabled') || log.toLowerCase().includes('optimized');
            
            let colorClass = 'text-slate-300';
            if (isError) colorClass = 'text-red-400';
            else if (isSuccess) colorClass = 'text-green-400';
            
            return (
              <div key={i} className={`mb-1 ${colorClass}`}>
                <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
