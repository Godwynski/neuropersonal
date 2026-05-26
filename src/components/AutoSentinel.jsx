import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Trash2 } from 'lucide-react';

export default function AutoSentinel({
  stats,
  scrolls,
  isElectron,
  activeStyle,
  playPresetSound,
  playCustomSynthNote,
  setTerminalLogs
}) {
  const [nodes, setNodes] = useState([
    { id: 'n-trig-cpu', type: 'trigger', subType: 'cpu', title: 'CPU Trigger', x: 50, y: 100, threshold: 45, active: false },
    { id: 'n-trig-ram', type: 'trigger', subType: 'ram', title: 'RAM Trigger', x: 50, y: 280, threshold: 80, active: false },
    { id: 'n-act-beep', type: 'action', subType: 'beep', title: 'Sonic Pulse Alarm', x: 480, y: 100, active: false },
    { id: 'n-act-cmd', type: 'action', subType: 'cmd', title: 'Scroll Exec', x: 480, y: 280, scrollId: 's-dns', active: false }
  ]);
  
  const [connections, setConnections] = useState([
    { from: 'n-trig-cpu', to: 'n-act-beep' }
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
    const outputX = node.x + 230;
    const outputY = node.y + 48;
    const inputX = node.x;
    const inputY = node.y + 48;
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

    targetX = Math.max(10, Math.min(bounds.width - 250, targetX));
    targetY = Math.max(10, Math.min(bounds.height - 130, targetY));

    setNodes(prev => prev.map(n => n.id === draggedNodeId ? { ...n, x: targetX, y: targetY } : n));
  };

  const stopDragNode = () => setDraggedNodeId(null);

  // Link trigger output to action input
  const handlePinClick = (e, nodeId, pinType) => {
    e.stopPropagation();
    if (playPresetSound) playPresetSound('tweak');
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
        if (playPresetSound) playPresetSound('success');
      }
      setConnectingFromId(null);
    }
  };

  const addFlowchartNode = (type) => {
    if (playPresetSound) playPresetSound('tweak');
    const randomId = `node-${type}-${Math.floor(Math.random() * 1000)}`;
    const bounds = flowchartWorkspaceRef.current.getBoundingClientRect();
    const x = bounds.width / 2 - 100;
    const y = bounds.height / 2 - 50;

    let newNode = { id: randomId, x, y, active: false };
    if (type === 'cpu') newNode = { ...newNode, type: 'trigger', subType: 'cpu', title: 'CPU Trigger', threshold: 50 };
    else if (type === 'ram') newNode = { ...newNode, type: 'trigger', subType: 'ram', title: 'RAM Trigger', threshold: 80 };
    else if (type === 'beep') newNode = { ...newNode, type: 'action', subType: 'beep', title: 'Sonic Pulse Alarm' };
    else if (type === 'cmd') newNode = { ...newNode, type: 'action', subType: 'cmd', title: 'Scroll Exec', scrollId: scrolls[0]?.id || '' };

    setNodes(prev => [...prev, newNode]);
    setShowNodeSelector(false);
  };

  const removeFlowchartNode = (nodeId) => {
    if (playPresetSound) playPresetSound('tweak');
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  const removeConnection = (index) => {
    if (playPresetSound) playPresetSound('tweak');
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
    
    if (node.subType === 'beep') {
      setAutomationLogs(prev => [`[${timestamp}] 🔊 Alarm triggered: sonic pulse audio alarm`, ...prev]);
      if (playCustomSynthNote) {
        // Play a custom alarming tone sequence
        playCustomSynthNote(880);
        setTimeout(() => playCustomSynthNote(1200), 200);
        setTimeout(() => playCustomSynthNote(1000), 400);
      }
    } else if (node.subType === 'cmd') {
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
    <div className="h-full flex flex-col space-y-4 outline-none animate-in fade-in duration-300">
      <header className="flex justify-between items-center border-b border-blue-500/10 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-widest font-mono text-slate-200">AUTO SENTINEL SCHEMATICS</h1>
          <p className="text-xs text-indigo-400 font-mono mt-0.5">Wire physical indicators to automated script executions</p>
        </div>

        <div className="relative">
          <button onClick={() => setShowNodeSelector(!showNodeSelector)} className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition">
            <Plus className="w-4 h-4" />
            <span>ADD FLOW NODE</span>
          </button>
          {showNodeSelector && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0c1222] border border-blue-500/20 rounded-lg shadow-2xl z-50 p-2 font-mono text-xs space-y-1">
              <span className="text-xs text-slate-500 px-2 py-1 block uppercase font-bold tracking-wider">TRIGGERS</span>
              <button onClick={() => addFlowchartNode('cpu')} className="w-full text-left hover:bg-blue-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition text-xs">⚡ CPU Load</button>
              <button onClick={() => addFlowchartNode('ram')} className="w-full text-left hover:bg-blue-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition text-xs">⚡ RAM Overflow</button>
              
              <span className="text-xs text-slate-500 px-2 py-1 block uppercase font-bold tracking-wider mt-2 border-t border-blue-500/10 pt-1.5">ACTIONS</span>
              <button onClick={() => addFlowchartNode('beep')} className="w-full text-left hover:bg-blue-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition text-xs">⚙️ Synthesizer Alarm</button>
              <button onClick={() => addFlowchartNode('cmd')} className="w-full text-left hover:bg-blue-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition text-xs">⚙️ Execute Script Scroll</button>
            </div>
          )}
        </div>
      </header>

      <div className="bg-[#0c1222]/40 border border-blue-500/15 rounded-lg p-3 flex items-center gap-3 font-mono text-xs text-blue-300/90 shrink-0">
        <span className="text-blue-400 shrink-0">ℹ️</span>
        <span>
          <strong>TUTORIAL:</strong> Drag the header of any node to reposition it. Click the green <strong>OUT</strong> dot on a Trigger and click the blue <strong>IN</strong> dot on an Action to connect them.
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
              className={`absolute w-[230px] bg-[#0c1222]/90 border backdrop-blur-md rounded-lg shadow-2xl z-10 transition-all ${
                n.active ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'border-blue-500/10'
              }`}
            >
              <div onMouseDown={(e) => startDragNode(e, n.id)} className={`px-3 py-2 border-b font-mono font-bold text-xs tracking-wider flex items-center justify-between cursor-move rounded-t-lg ${isTrig ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-blue-500/10 text-blue-400 border-blue-500/10'}`}>
                <span>{n.title.toUpperCase()}</span>
                <button onClick={() => removeFlowchartNode(n.id)} className="text-slate-500 hover:text-rose-400 transition cursor-pointer">
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 font-mono text-xs space-y-2">
                {n.subType === 'cpu' && (
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Threshold: {n.threshold}% CPU</label>
                    <input type="range" min="10" max="95" step="5" value={n.threshold || 50} onChange={(e) => setNodes(prev => prev.map(nItem => nItem.id === n.id ? { ...nItem, threshold: parseInt(e.target.value) } : nItem))} className="w-full accent-emerald-500 h-1 cursor-pointer" />
                  </div>
                )}
                {n.subType === 'ram' && (
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Threshold: {n.threshold}% RAM</label>
                    <input type="range" min="10" max="95" step="5" value={n.threshold || 80} onChange={(e) => setNodes(prev => prev.map(nItem => nItem.id === n.id ? { ...nItem, threshold: parseInt(e.target.value) } : nItem))} className="w-full accent-emerald-500 h-1 cursor-pointer" />
                  </div>
                )}
                {n.subType === 'cmd' && (
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-400 block font-bold">Select Script Scroll:</label>
                    <select 
                      value={n.scrollId}
                      onChange={(e) => setNodes(prev => prev.map(nItem => nItem.id === n.id ? { ...nItem, scrollId: e.target.value } : nItem))}
                      className="w-full bg-slate-950 border border-blue-500/10 text-blue-300 outline-none px-1.5 py-0.5 rounded text-xs font-mono"
                    >
                      <option value="">-- No Scroll Selected --</option>
                      {scrolls.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                )}
                {n.subType === 'beep' && <span className="text-slate-400 italic block">Dispatches customized warning ADSR alarm sound.</span>}
              </div>

              <div className="px-3 pb-2 flex justify-between relative text-xs font-mono text-slate-500 z-20">
                {!isTrig ? (
                  <div onClick={(e) => handlePinClick(e, n.id, 'input')} className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                    <div className={`w-3 h-3 rounded-full border border-blue-500/35 flex items-center justify-center ${connectingFromId ? 'bg-blue-500/40 animate-pulse' : 'bg-slate-950'}`}><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /></div>
                    <span>IN</span>
                  </div>
                ) : <div />}

                {isTrig ? (
                  <div onClick={(e) => handlePinClick(e, n.id, 'output')} className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer ml-auto">
                    <span>OUT</span>
                    <div className={`w-3 h-3 rounded-full border border-emerald-500/35 flex items-center justify-center ${connectingFromId === n.id ? 'bg-emerald-500/40' : 'bg-slate-950'}`}><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>
                  </div>
                ) : <div />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Automation Trigger Logs */}
      <div className={`p-4 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} font-mono text-xs shrink-0 flex flex-col md:flex-row gap-4 h-[120px]`}>
        <div className="flex-1 flex flex-col">
          <span className="text-xs text-slate-500 font-bold tracking-widest block mb-2 uppercase">AUTOMATION SYSTEM LOGS</span>
          <div className="overflow-y-auto flex-1 text-slate-400 space-y-1 max-h-[60px] pr-2">
            {automationLogs.length === 0 ? (
              <span className="italic text-slate-600 text-xs">Waiting for sentinel trigger events...</span>
            ) : (
              automationLogs.map((log, idx) => <div key={idx} className="leading-4 border-l-2 border-blue-500/10 pl-2 text-[11px]">{log}</div>)
            )}
          </div>
        </div>

        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-blue-500/10 pt-2 md:pt-0 md:pl-4 flex flex-col">
          <span className="text-xs text-slate-500 font-bold tracking-widest block mb-2">ACTIVE AUTOLINKS ({connections.length})</span>
          <div className="flex-1 overflow-y-auto max-h-[60px] pr-2 flex flex-wrap gap-1.5 text-xs">
            {connections.length === 0 ? (
              <div className="italic text-slate-600">No wire links connected.</div>
            ) : (
              connections.map((c, i) => {
                const fromNode = nodes.find(n => n.id === c.from);
                const toNode = nodes.find(n => n.id === c.to);
                return (
                  <div key={i} className="bg-slate-950 border border-blue-500/10 hover:border-rose-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 group transition text-[11px]">
                    <span className="text-emerald-400 font-bold">{fromNode?.title.replace(' Trigger', '')}</span>
                    <span className="text-slate-600">&rarr;</span>
                    <span className="text-blue-400 font-bold">{toNode?.title.replace(' Alarm', '').replace(' Exec', '')}</span>
                    <button onClick={() => removeConnection(i)} className="text-slate-600 hover:text-rose-400 cursor-pointer ml-1 pl-1 border-l border-white/5">
                      <Trash2 className="w-3 h-3" />
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
