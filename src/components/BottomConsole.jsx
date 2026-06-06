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
    (log) => log.text && (log.text.toLowerCase().includes('error') || log.text.toLowerCase().includes('fail'))
  );

  const handleCopyAllErrors = () => {
    if (errorLogs.length === 0) return;
    navigator.clipboard.writeText(errorLogs.map(l => l.text).join('\n'));
    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
    }, 2000);
  };

  return (
    <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'h-11' : 'h-64'} ${theme.panelBg} ${theme.border}`}>
      <div className={`px-5 py-2.5 flex justify-between items-center bg-[#0a0a0a] ${theme.border} border-b h-11 select-none cursor-pointer hover:bg-[#141414] transition-colors`} onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center gap-2.5">
          <Terminal size={16} className="text-[#3b82f6]" />
          <span className="text-xs font-semibold font-outfit uppercase tracking-widest text-gray-200">
            System Console
          </span>
          <span className="text-[11px] text-gray-500 font-medium ml-2">
            ({logs.length} entries — {isCollapsed ? 'Collapsed' : 'Expanded'})
          </span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isCollapsed && errorLogs.length > 0 && (
            <button
              onClick={handleCopyAllErrors}
              className="p-1.5 rounded bg-[#141414] border border-[#262626] text-gray-400 hover:text-gray-200 hover:bg-[#262626] transition-all flex items-center gap-1.5 text-[11px] font-medium"
              title="Copy All Errors"
            >
              {copiedAll ? (
                <>
                  <Check size={14} className="text-[#3b82f6]" />
                  <span className="text-[#3b82f6]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Errors</span>
                </>
              )}
            </button>
          )}
          {!isCollapsed && (
            <button 
              onClick={onClear}
              className="p-1.5 rounded bg-[#141414] border border-[#262626] hover:bg-[#ff4655] hover:border-[#ff4655] text-gray-400 hover:text-white transition-colors"
              title="Clear Console"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded bg-[#141414] border border-[#262626] text-gray-400 hover:text-gray-200 hover:bg-[#262626] transition-all"
            title={isCollapsed ? "Expand Console" : "Collapse Console"}
          >
            {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 font-mono text-[11px] bg-[#0a0a0a] custom-scrollbar"
        >
          {logs.length === 0 ? (
            <div className="text-gray-600 italic text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
              Waiting for system output...
            </div>
          ) : (
            logs.map((log, i) => {
              const text = typeof log === 'string' ? log : log.text || '';
              const time = typeof log === 'object' && log.time ? new Date(log.time) : new Date();
              const isError = text.toLowerCase().includes('error') || text.toLowerCase().includes('fail');
              const isSuccess = text.toLowerCase().includes('success') || text.toLowerCase().includes('enabled') || text.toLowerCase().includes('disabled') || text.toLowerCase().includes('optimized');
              
              let colorClass = 'text-gray-400';
              if (isError) colorClass = 'text-[#ff4655] font-semibold';
              else if (isSuccess) colorClass = 'text-[#3b82f6] font-semibold';
              
              return (
                <div key={i} className={`group flex items-start justify-between mb-1.5 py-1 border-b border-[#262626]/50 hover:bg-[#141414] transition-colors rounded px-2 -mx-2 ${colorClass}`}>
                  <div className="flex-1 break-all pr-3 leading-relaxed">
                    <span className="text-gray-600 mr-3 font-mono text-[10px]">[{time.toLocaleTimeString()}]</span>
                    <span>{text}</span>
                  </div>
                  {isError && (
                    <button
                      onClick={() => handleCopy(log, i)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded bg-[#262626] border border-[#3f3f46] text-gray-300 hover:text-white hover:bg-[#3f3f46] transition-all self-center"
                      title="Copy Error"
                    >
                      {copiedIndex === i ? (
                        <Check size={12} className="text-[#3b82f6] animate-pulse" />
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
      )}
    </div>
  );
}
