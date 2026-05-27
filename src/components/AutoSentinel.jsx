import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Trash2 } from 'lucide-react';

export default function AutoSentinel({
  stats,
  scrolls,
  isElectron,
  activeStyle,
  setTerminalLogs
}) {
  const [nodes, setNodes] = useState([
    { id: 'n-trig-cpu', type: 'trigger', subType: 'cpu', title: 'CPU Trigger', x: 50, y: 100, threshold: 45, active: false },
    { id: 'n-trig-ram', type: 'trigger', subType: 'ram', title: 'RAM Trigger', x: 50, y: 280, threshold: 80, active: false },
    { id: 'n-act-cmd', type: 'action', subType: 'cmd', title: 'Scroll Exec', x: 480, y: 280, scrollId: 's-dns', active: false }
  ]);
  
  const [connections, setConnections] = useState([
    { from: 'n-trig-ram', to: 'n-act-cmd' }
  ]);

  const [connectingFromId, setConnectingFromId] = useState(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [automationLogs, setAutomationLogs] = useState([]);
  
  // Track triggered actions to prevent multi-triggering
  const triggeredActionsRef = useRef({});

  const flowchartWorkspaceRef = useRef(null);

  // Geometry calculators
  const getNodePins = (node) => {
    const outputX = node.x + 260;
    const outputY = node.y + 60;
    const inputX = node.x;
    const inputY = node.y + 60;
    return { inputX, inputY, outputX, outputY };
  };

  const getBezierPath = (x1, y1, x2, y2) => {
    const dx = Math.abs(x2 - x1) * 0.45;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  // Node Flowchart Dragging controls
  const startDragNode = (e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const bounds = flowchartWorkspaceRef.current.getBoundingClientRect();
    const clientX = e.clientX - bounds.left;
    const clientY = e.clientY - bounds.top;

    setDraggedNodeId(nodeId);
    setDragOffset({ x: clientX - node.x, y: clientY - node.y });
  };

  const handleWorkspaceMouseMove = (e) => {
    if (!draggedNodeId) return;
    const bounds = flowchartWorkspaceRef.current.getBoundingClientRect();
    const clientX = e.clientX - bounds.left;
    const clientY = e.clientY - bounds.top;

    let targetX = clientX - dragOffset.x;
    let targetY = clientY - dragOffset.y;

    targetX = Math.max(10, Math.min(bounds.width - 280, targetX));
    targetY = Math.max(10, Math.min(bounds.height - 150, targetY));

    setNodes(prev => prev.map(n => n.id === draggedNodeId ? { ...n, x: targetX, y: targetY } : n));
  };

  const stopDragNode = () => setDraggedNodeId(null);

  // Link trigger output to action input
  const handlePinClick = (e, nodeId, pinType) => {
    e.stopPropagation();
    if (pinType === 'output') {
      setConnectingFromId(nodeId);
    } else if (pinType === 'input' && connectingFromId) {
      if (connectingFromId === nodeId) {
        setConnectingFromId(null);
        return;
      }
      const duplicate = connections.some(c => c.from === connectingFromId && c.to === nodeId);
      if (!duplicate) {
        setConnections(prev => [...prev, { from: connectingFromId, to: nodeId }]);
      }
      setConnectingFromId(null);
    }
  };

  const addFlowchartNode = (type) => {
    const randomId = `node-${type}-${Math.floor(Math.random() * 1000)}`;
    const bounds = flowchartWorkspaceRef.current.getBoundingClientRect();
    const x = bounds.width / 2 - 100;
    const y = bounds.height / 2 - 50;

    let newNode = { id: randomId, x, y, active: false };
    if (type === 'cpu') newNode = { ...newNode, type: 'trigger', subType: 'cpu', title: 'CPU Trigger', threshold: 50 };
    else if (type === 'ram') newNode = { ...newNode, type: 'trigger', subType: 'ram', title: 'RAM Trigger', threshold: 80 };
    else if (type === 'cmd') newNode = { ...newNode, type: 'action', subType: 'cmd', title: 'Scroll Exec', scrollId: scrolls[0]?.id || '' };

    setNodes(prev => [...prev, newNode]);
    setShowNodeSelector(false);
  };

  const removeFlowchartNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  const removeConnection = (index) => {
    setConnections(prev => prev.filter((_, idx) => idx !== index));
  };

  // Evaluate automation active states dynamically
  useEffect(() => {
    setNodes(prevNodes => {
      // 1. Calculate active state of all triggers
      const nextNodes = prevNodes.map(node => {
        if (node.type === 'trigger') {
          let active = false;
          if (node.subType === 'cpu') {
            active = stats.cpuLoad >= (node.threshold || 50);
          } else if (node.subType === 'ram') {
            active = stats.memUsagePercent >= (node.threshold || 80);
          }
          return { ...node, active };
        }
        return node;
      });

      // 2. Calculate active state of all actions based on connections
      return nextNodes.map(node => {
        if (node.type === 'action') {
          // Find any active trigger connected to this action
          const isTriggered = connections.some(c => {
            if (c.to !== node.id) return false;
            const fromNode = nextNodes.find(n => n.id === c.from);
            return fromNode && fromNode.active;
          });
          
          // Trigger actions on the rising edge
          if (isTriggered && !node.active) {
            // It just went active! Trigger action.
            const now = Date.now();
            // Prevent spamming (only run once every 8 seconds per node)
            if (!triggeredActionsRef.current[node.id] || now - triggeredActionsRef.current[node.id] > 8000) {
              triggeredActionsRef.current[node.id] = now;
              triggerActionSequence(node);
            }
          }

          return { ...node, active: isTriggered };
        }
        return node;
      });
    });
  }, [stats.cpuLoad, stats.memUsagePercent, connections]);

  const triggerActionSequence = async (node) => {
    const timestamp = new Date().toLocaleTimeString();
    
    if (node.subType === 'cmd') {
      const scroll = scrolls.find(s => s.id === node.scrollId);
      if (!scroll) {
        setAutomationLogs(prev => [`[${timestamp}] ⚠️ Automation execution failed: No script scroll selected`, ...prev]);
        return;
      }
      
      setAutomationLogs(prev => [`[${timestamp}] ⚙️ Executing scroll command: "${scroll.title}"`, ...prev]);
      
      if (isElectron) {
        try {
          const res = await window.api.runSystemCommand(scroll.cmd);
          if (res.success) {
            setAutomationLogs(prev => [`[${timestamp}] ✅ Command success: ${scroll.title}`, ...prev]);
            if (setTerminalLogs) {
              setTerminalLogs(prev => [...prev, `\n[Auto-Sentinel]: Action success: ${scroll.cmd}`]);
            }
          } else {
            setAutomationLogs(prev => [`[${timestamp}] ❌ Command failed: ${res.error}`, ...prev]);
          }
        } catch (e) {
          setAutomationLogs(prev => [`[${timestamp}] ❌ Exec exception: ${e.message}`, ...prev]);
        }
      } else {
        // Mock execution
        setAutomationLogs(prev => [`[${timestamp}] ✅ [Mock Success]: Executed: ${scroll.cmd}`, ...prev]);
        if (setTerminalLogs) {
          setTerminalLogs(prev => [...prev, `\n[Auto-Sentinel Mock]: Action success: ${scroll.cmd}`]);
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col space-y-5 outline-none animate-in fade-in duration-300 font-sans">
      <header className="flex justify-between items-center border-b border-blue-500/10 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-200">Auto-Sentinel Schematics</h1>
          <p className="text-sm text-indigo-400 mt-1">Wire physical indicator thresholds to automated optimization tasks</p>
        </div>

        <div className="relative font-sans">
          <button 
            onClick={() => setShowNodeSelector(!showNodeSelector)} 
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flow Node</span>
          </button>
          {showNodeSelector && (
            <div className="absolute right-0 mt-2 w-52 bg-[#0c1222]/95 border border-blue-500/35 rounded-lg shadow-2xl z-50 p-2 text-sm space-y-1 backdrop-blur-md animate-in slide-in-from-top-2 duration-150">
              <span className="text-xs text-slate-500 px-2 py-1 block uppercase font-bold tracking-widest">Triggers</span>
              <button onClick={() => addFlowchartNode('cpu')} className="w-full text-left hover:bg-blue-500/15 text-slate-300 hover:text-white px-3 py-2 rounded transition text-sm">⚡ CPU Load</button>
              <button onClick={() => addFlowchartNode('ram')} className="w-full text-left hover:bg-blue-500/15 text-slate-300 hover:text-white px-3 py-2 rounded transition text-sm">⚡ RAM Overflow</button>
              
              <span className="text-xs text-slate-500 px-2 py-1 block uppercase font-bold tracking-widest mt-2 border-t border-blue-500/10 pt-1.5 font-sans">Actions</span>
              <button onClick={() => addFlowchartNode('cmd')} className="w-full text-left hover:bg-blue-500/15 text-slate-300 hover:text-white px-3 py-2 rounded transition text-sm">⚙️ Execute Script Scroll</button>
            </div>
          )}
        </div>
      </header>

      <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3.5 text-sm text-blue-200/90 shrink-0 leading-relaxed shadow-sm">
        <span className="text-base text-blue-400 shrink-0 mt-0.5">ℹ️</span>
        <span>
          <strong className="font-semibold text-blue-300">Tutorial:</strong> Drag the header of any node to reposition it. Click the green <strong className="text-emerald-400">OUT</strong> dot on a Trigger node, then click the blue <strong className="text-blue-400">IN</strong> dot on an Action node to connect them.
        </span>
      </div>

      <div 
        ref={flowchartWorkspaceRef}
        onMouseMove={handleWorkspaceMouseMove}
        onMouseUp={stopDragNode}
        className="flex-1 min-h-[400px] bg-[#05080e] border border-blue-500/10 rounded-xl relative overflow-hidden cursor-default"
        style={{
          backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <filter id="glow-wire" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {connections.map((conn, idx) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;
            const p1 = getNodePins(from);
            const p2 = getNodePins(to);
            const pathStr = getBezierPath(p1.outputX, p1.outputY, p2.inputX, p2.inputY);
            const active = from.active || to.active;

            return (
              <g key={idx}>
                <path d={pathStr} fill="none" stroke={active ? 'rgba(168, 85, 247, 0.6)' : 'rgba(59, 130, 246, 0.3)'} strokeWidth="3.5" filter="url(#glow-wire)" className="transition-all" />
                <path d={pathStr} fill="none" stroke={active ? '#a855f7' : '#3b82f6'} strokeWidth="1.5" className={active ? 'animate-dash stroke-[2px]' : ''} style={active ? { strokeDasharray: '8, 5', animation: 'dash 0.8s linear infinite' } : {}} />
              </g>
            );
          })}

          {connectingFromId && (() => {
            const node = nodes.find(n => n.id === connectingFromId);
            if (!node) return null;
            const pins = getNodePins(node);
            return <path d={getBezierPath(pins.outputX, pins.outputY, pins.outputX + 80, pins.outputY)} fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2" strokeDasharray="4, 4" />;
          })()}
        </svg>

        {nodes.map(n => {
          const isTrig = n.type === 'trigger';
          return (
            <div
              key={n.id}
              style={{ left: n.x, top: n.y }}
              className={`absolute w-[260px] bg-[#0c1222]/95 border backdrop-blur-md rounded-xl shadow-2xl z-10 transition-all ${
                n.active ? 'border-blue-400 ring-2 ring-blue-500/25 shadow-[0_0_18px_rgba(59,130,246,0.3)]' : 'border-blue-500/20'
              }`}
            >
              <div onMouseDown={(e) => startDragNode(e, n.id)} className={`px-4 py-3 border-b font-sans font-bold text-sm tracking-wide flex items-center justify-between cursor-move rounded-t-xl ${isTrig ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' : 'bg-blue-500/10 text-blue-400 border-blue-500/15'}`}>
                <span>{n.title}</span>
                <button onClick={() => removeFlowchartNode(n.id)} className="text-slate-400 hover:text-rose-400 transition cursor-pointer p-0.5 rounded hover:bg-white/5">
                  <Trash className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 font-sans text-sm space-y-3.5">
                {n.subType === 'cpu' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>Threshold:</span>
                      <span className="text-emerald-400 font-bold font-mono">{n.threshold}% CPU</span>
                    </div>
                    <input type="range" min="10" max="95" step="5" value={n.threshold || 50} onChange={(e) => setNodes(prev => prev.map(nItem => nItem.id === n.id ? { ...nItem, threshold: parseInt(e.target.value) } : nItem))} className="w-full accent-emerald-500 h-1.5 cursor-pointer rounded-lg bg-slate-950" />
                  </div>
                )}
                {n.subType === 'ram' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>Threshold:</span>
                      <span className="text-emerald-400 font-bold font-mono">{n.threshold}% RAM</span>
                    </div>
                    <input type="range" min="10" max="95" step="5" value={n.threshold || 80} onChange={(e) => setNodes(prev => prev.map(nItem => nItem.id === n.id ? { ...nItem, threshold: parseInt(e.target.value) } : nItem))} className="w-full accent-emerald-500 h-1.5 cursor-pointer rounded-lg bg-slate-950" />
                  </div>
                )}
                {n.subType === 'cmd' && (
                  <div className="space-y-2 text-sm">
                    <label className="text-slate-300 font-semibold block">Select Script Scroll:</label>
                    <select 
                      value={n.scrollId}
                      onChange={(e) => setNodes(prev => prev.map(nItem => nItem.id === n.id ? { ...nItem, scrollId: e.target.value } : nItem))}
                      className="w-full bg-slate-950 border border-blue-500/20 hover:border-blue-500/40 text-blue-300 outline-none px-2.5 py-1.5 rounded-lg text-sm font-sans transition focus:border-blue-500/60"
                    >
                      <option value="">-- No Scroll Selected --</option>
                      {scrolls.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="px-4 pb-3 flex justify-between relative text-xs font-semibold text-slate-400 z-20">
                {!isTrig ? (
                  <div onClick={(e) => handlePinClick(e, n.id, 'input')} className="flex items-center gap-2 hover:text-blue-400 cursor-pointer py-1">
                    <div className={`w-3.5 h-3.5 rounded-full border border-blue-500/35 flex items-center justify-center ${connectingFromId ? 'bg-blue-500/40 animate-pulse' : 'bg-slate-950'}`}><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /></div>
                    <span>IN</span>
                  </div>
                ) : <div />}

                {isTrig ? (
                  <div onClick={(e) => handlePinClick(e, n.id, 'output')} className="flex items-center gap-2 hover:text-emerald-400 cursor-pointer ml-auto py-1">
                    <span>OUT</span>
                    <div className={`w-3.5 h-3.5 rounded-full border border-emerald-500/35 flex items-center justify-center ${connectingFromId === n.id ? 'bg-emerald-500/40' : 'bg-slate-950'}`}><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>
                  </div>
                ) : <div />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Automation Trigger Logs */}
      <div className={`p-5 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} text-sm shrink-0 flex flex-col md:flex-row gap-5 min-h-[140px]`}>
        <div className="flex-1 flex flex-col select-text">
          <span className="text-xs text-slate-400 font-bold tracking-wider block mb-2.5 uppercase">AUTOMATION SYSTEM LOGS</span>
          <div className="overflow-y-auto flex-1 text-slate-400 space-y-1.5 max-h-[80px] pr-2 select-text font-mono text-xs">
            {automationLogs.length === 0 ? (
              <span className="italic text-slate-500 text-xs font-sans">Waiting for sentinel trigger events...</span>
            ) : (
              automationLogs.map((log, idx) => <div key={idx} className="leading-relaxed border-l-2 border-blue-500/30 pl-3.5">{log}</div>)
            )}
          </div>
        </div>

        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-blue-500/10 pt-3 md:pt-0 md:pl-5 flex flex-col">
          <span className="text-xs text-slate-400 font-bold tracking-wider block mb-2.5 uppercase">ACTIVE AUTOLINKS ({connections.length})</span>
          <div className="flex-1 overflow-y-auto max-h-[80px] pr-2 flex flex-wrap gap-2 text-xs">
            {connections.length === 0 ? (
              <div className="italic text-slate-500 text-xs">No active flowchart links wired.</div>
            ) : (
              connections.map((c, i) => {
                const fromNode = nodes.find(n => n.id === c.from);
                const toNode = nodes.find(n => n.id === c.to);
                return (
                  <div key={i} className="bg-slate-950/80 border border-blue-500/20 hover:border-rose-500/30 px-3 py-1 rounded-lg flex items-center gap-2 group transition text-xs font-sans">
                    <span className="text-emerald-400 font-medium">{fromNode?.title.replace(' Trigger', '')}</span>
                    <span className="text-slate-500 font-bold">&rarr;</span>
                    <span className="text-blue-400 font-medium">{toNode?.title.replace(' Alarm', '').replace(' Exec', '')}</span>
                    <button onClick={() => removeConnection(i)} className="text-slate-500 hover:text-rose-400 cursor-pointer ml-1 pl-1.5 border-l border-white/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
