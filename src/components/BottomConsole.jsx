import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2, Copy, Check } from 'lucide-react';

export default function BottomConsole({ logs, onClear, theme }) {
  const scrollRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const errorLogs = logs.filter(
    (log) => log.toLowerCase().includes('error') || log.toLowerCase().includes('fail')
  );

  const handleCopyAllErrors = () => {
    if (errorLogs.length === 0) return;
    navigator.clipboard.writeText(errorLogs.join('\n'));
    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
    }, 2000);
  };

  return (
    <div className={`h-48 border-t flex flex-col ${theme.panelBg} ${theme.border}`}>
      <div className={`px-4 py-2 border-b flex justify-between items-center bg-black/20 ${theme.border}`}>
        <div className="flex items-center gap-2">
          <Terminal size={14} className={theme.textAccent} />
          <span className={`text-sm font-bold uppercase tracking-wider ${theme.textPrimary}`}>
            System Console
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {errorLogs.length > 0 && (
            <button
              onClick={handleCopyAllErrors}
              className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title="Copy All Errors"
            >
              {copiedAll ? (
                <>
                  <Check size={14} className="text-green-400" />
                  <span className="text-green-400 font-medium">Copied Errors!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="font-medium">Copy All Errors</span>
                </>
              )}
            </button>
          )}
          <button 
            onClick={onClear}
            className={`p-1 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors`}
            title="Clear Console"
          >
            <Trash2 size={14} />
          </button>
        </div>
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
              <div key={i} className={`group flex items-start justify-between mb-1 py-0.5 rounded px-1 hover:bg-white/5 transition-colors ${colorClass}`}>
                <div className="flex-1 break-all pr-2">
                  <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
                {isError && (
                  <button
                    onClick={() => handleCopy(log, i)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all self-center"
                    title="Copy Error"
                  >
                    {copiedIndex === i ? (
                      <Check size={12} className="text-green-400 animate-pulse" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
