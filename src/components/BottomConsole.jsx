import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function BottomConsole({ logs, onClear, theme }) {
  const scrollRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isCollapsed]);

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
    <div className={`flex flex-col transition-all duration-200 ${isCollapsed ? 'h-10' : 'h-52'} ${theme.panelBg} ${theme.border}`}>
      <div className={`px-4 py-2 border-b-2 flex justify-between items-center bg-[#fff9c4] ${theme.border} h-10 select-none cursor-pointer`} onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-accent-blue" />
          <span className="text-xs font-bold font-kalam uppercase tracking-wider text-pencil-black">
            System Console
          </span>
          <span className="text-[10px] text-pencil-black/60 font-semibold font-patrick">
            ({logs.length} entries — {isCollapsed ? 'Collapsed' : 'Expanded'})
          </span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isCollapsed && errorLogs.length > 0 && (
            <button
              onClick={handleCopyAllErrors}
              className="p-1 border border-pencil-black wobbly bg-white text-pencil-black hover:bg-paper-muted transition-all flex items-center gap-1 text-[10px] font-bold"
              title="Copy All Errors"
            >
              {copiedAll ? (
                <>
                  <Check size={12} className="text-accent-blue" />
                  <span className="text-accent-blue">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Errors</span>
                </>
              )}
            </button>
          )}
          {!isCollapsed && (
            <button 
              onClick={onClear}
              className="p-1 border border-pencil-black wobbly bg-white hover:bg-accent-red hover:text-white text-pencil-black transition-colors"
              title="Clear Console"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 border border-pencil-black wobbly bg-white text-pencil-black hover:bg-paper-muted transition-all"
            title={isCollapsed ? "Expand Console" : "Collapse Console"}
          >
            {isCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-[11px] bg-white border-t border-pencil-black/20"
        >
          {logs.length === 0 ? (
            <div className="text-pencil-black/50 italic font-patrick text-xs">Waiting for system output...</div>
          ) : (
            logs.map((log, i) => {
              const isError = log.toLowerCase().includes('error') || log.toLowerCase().includes('fail');
              const isSuccess = log.toLowerCase().includes('success') || log.toLowerCase().includes('enabled') || log.toLowerCase().includes('disabled') || log.toLowerCase().includes('optimized');
              
              let colorClass = 'text-pencil-black';
              if (isError) colorClass = 'text-accent-red font-bold';
              else if (isSuccess) colorClass = 'text-accent-blue font-bold';
              
              return (
                <div key={i} className={`group flex items-start justify-between mb-1 py-0.5 border-b border-dashed border-pencil-black/10 hover:bg-paper-muted/20 transition-colors ${colorClass}`}>
                  <div className="flex-1 break-all pr-2">
                    <span className="text-pencil-black/45 mr-2 font-mono text-[10px]">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                  {isError && (
                    <button
                      onClick={() => handleCopy(log, i)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 border border-pencil-black wobbly-md bg-white hover:bg-paper-muted text-pencil-black transition-all self-center"
                      title="Copy Error"
                    >
                      {copiedIndex === i ? (
                        <Check size={10} className="text-accent-blue animate-pulse" />
                      ) : (
                        <Copy size={10} />
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
