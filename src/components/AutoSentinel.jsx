import React, { useState, useEffect, useRef } from 'react';

export default function AutoSentinel({
  stats,
  scrolls,
  isElectron,
  setTerminalLogs
}) {
  const [nodes, setNodes] = useState([
    { id: 'n-trig-cpu', type: 'trigger', subType: 'cpu', title: 'CPU Trigger', threshold: 45, active: false },
    { id: 'n-trig-ram', type: 'trigger', subType: 'ram', title: 'RAM Trigger', threshold: 80, active: false },
    { id: 'n-act-cmd', type: 'action', subType: 'cmd', title: 'Scroll Exec', scrollId: 's-dns', active: false }
  ]);
  
  const [connections, setConnections] = useState([
    { from: 'n-trig-ram', to: 'n-act-cmd' }
  ]);

  const [automationLogs, setAutomationLogs] = useState([]);
  const triggeredActionsRef = useRef({});

  // Adding node state
  const [newNodeType, setNewNodeType] = useState('cpu');
  const [newThreshold, setNewThreshold] = useState(50);
  const [newScrollId, setNewScrollId] = useState('');

  // Link connection state
  const [linkFrom, setLinkFrom] = useState('');
  const [linkTo, setLinkTo] = useState('');

  const addNode = (e) => {
    e.preventDefault();
    const id = `node-${newNodeType}-${Math.floor(Math.random() * 1000)}`;
    let nodeObj = { id, active: false };

    if (newNodeType === 'cpu') {
      nodeObj = { ...nodeObj, type: 'trigger', subType: 'cpu', title: 'CPU Trigger', threshold: newThreshold };
    } else if (newNodeType === 'ram') {
      nodeObj = { ...nodeObj, type: 'trigger', subType: 'ram', title: 'RAM Trigger', threshold: newThreshold };
    } else {
      nodeObj = { ...nodeObj, type: 'action', subType: 'cmd', title: 'Scroll Exec', scrollId: newScrollId };
    }

    setNodes(prev => [...prev, nodeObj]);
  };

  const removeNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  };

  const addConnection = (e) => {
    e.preventDefault();
    if (!linkFrom || !linkTo) return;
    const exists = connections.some(c => c.from === linkFrom && c.to === linkTo);
    if (!exists) {
      setConnections(prev => [...prev, { from: linkFrom, to: linkTo }]);
    }
  };

  const removeConnection = (index) => {
    setConnections(prev => prev.filter((_, i) => i !== index));
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
            const now = Date.now();
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
        setAutomationLogs(prev => [`[${timestamp}] ⚠️ Automation failed: No scroll selected`, ...prev]);
        return;
      }
      
      setAutomationLogs(prev => [`[${timestamp}] ⚙️ Running: "${scroll.title}"`, ...prev]);
      
      if (isElectron) {
        try {
          const res = await window.api.runSystemCommand(scroll.cmd);
          if (res.success) {
            setAutomationLogs(prev => [`[${timestamp}] ✅ Success: ${scroll.title}`, ...prev]);
            if (setTerminalLogs) {
              setTerminalLogs(prev => [...prev, `\n[Auto-Sentinel]: Action success: ${scroll.cmd}`]);
            }
          } else {
            setAutomationLogs(prev => [`[${timestamp}] ❌ Failed: ${res.error}`, ...prev]);
          }
        } catch (e) {
          setAutomationLogs(prev => [`[${timestamp}] ❌ Error: ${e.message}`, ...prev]);
        }
      } else {
        setAutomationLogs(prev => [`[${timestamp}] ✅ [Mock Success]: Executed: ${scroll.cmd}`, ...prev]);
        if (setTerminalLogs) {
          setTerminalLogs(prev => [...prev, `\n[Auto-Sentinel Mock]: Action success: ${scroll.cmd}`]);
        }
      }
    }
  };

  const triggerNodes = nodes.filter(n => n.type === 'trigger');
  const actionNodes = nodes.filter(n => n.type === 'action');

  return (
    <div className="space-y-6 font-sans text-slate-800 bg-white p-2">
      <header className="border-b border-slate-200 pb-3">
        <h1 className="text-lg font-bold">Auto-Sentinel Schematics</h1>
        <p className="text-[11px] text-slate-500">Automate script executions based on CPU/RAM thresholds.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Node Builder */}
        <div className="space-y-4">
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h3 className="text-xs font-bold text-slate-650 uppercase border-b border-slate-200 pb-1">Define Sentinel Nodes</h3>
            
            <form onSubmit={addNode} className="space-y-2 text-xs">
              <div className="flex gap-2">
                <select 
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value)}
                  className="flex-1 p-1 border border-slate-200 bg-white rounded cursor-pointer"
                >
                  <option value="cpu">CPU Load Trigger</option>
                  <option value="ram">RAM Overflow Trigger</option>
                  <option value="cmd">Execute Scroll Script</option>
                </select>

                {newNodeType === 'cmd' ? (
                  <select
                    value={newScrollId}
                    onChange={(e) => setNewScrollId(e.target.value)}
                    className="flex-1 p-1 border border-slate-200 bg-white rounded cursor-pointer"
                    required
                  >
                    <option value="">-- Choose Scroll --</option>
                    {scrolls.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                ) : (
                  <input 
                    type="number"
                    min="5"
                    max="99"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(parseInt(e.target.value) || 50)}
                    placeholder="Limit (%)"
                    className="w-20 p-1 border border-slate-200 rounded"
                    required
                  />
                )}
              </div>
              <button type="submit" className="w-full py-1 bg-slate-800 text-white rounded font-bold cursor-pointer hover:bg-slate-700">Add Node</button>
            </form>

            <div className="space-y-1.5 pt-2 max-h-[160px] overflow-y-auto">
              {nodes.map(n => (
                <div key={n.id} className="p-2 border border-slate-200 bg-white rounded text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold">{n.title}</span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      {n.subType === 'cmd' ? `Scroll ID: ${n.scrollId}` : `Threshold: ${n.threshold}%`}
                    </span>
                    <span className={`ml-2 text-[9px] font-bold px-1 rounded ${n.active ? 'bg-green-150 text-green-700 border border-green-300' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                      {n.active ? 'TRIGGERED' : 'IDLE'}
                    </span>
                  </div>
                  <button onClick={() => removeNode(n.id)} className="text-slate-400 hover:text-slate-700 font-bold font-mono">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Link Builder */}
        <div className="space-y-4">
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h3 className="text-xs font-bold text-slate-650 uppercase border-b border-slate-200 pb-1">Wire Auto-Links</h3>

            <form onSubmit={addConnection} className="space-y-2 text-xs">
              <div className="flex gap-2">
                <select
                  value={linkFrom}
                  onChange={(e) => setLinkFrom(e.target.value)}
                  className="flex-1 p-1 border border-slate-200 bg-white rounded cursor-pointer"
                  required
                >
                  <option value="">-- Select Trigger Node --</option>
                  {triggerNodes.map(n => <option key={n.id} value={n.id}>{n.title} ({n.id.slice(-4)})</option>)}
                </select>
                <select
                  value={linkTo}
                  onChange={(e) => setLinkTo(e.target.value)}
                  className="flex-1 p-1 border border-slate-200 bg-white rounded cursor-pointer"
                  required
                >
                  <option value="">-- Select Action Node --</option>
                  {actionNodes.map(n => <option key={n.id} value={n.id}>{n.title} ({n.id.slice(-4)})</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-1 bg-slate-800 text-white rounded font-bold cursor-pointer hover:bg-slate-700">Link Trigger to Action</button>
            </form>

            <div className="space-y-1.5 pt-2 max-h-[160px] overflow-y-auto">
              {connections.length === 0 ? (
                <div className="text-slate-400 italic text-center text-xs py-4">No active wiring.</div>
              ) : (
                connections.map((c, i) => {
                  const fromNode = nodes.find(n => n.id === c.from);
                  const toNode = nodes.find(n => n.id === c.to);
                  return (
                    <div key={i} className="p-2 border border-slate-200 bg-white rounded text-xs flex justify-between items-center">
                      <span>
                        <strong className="text-slate-600">{fromNode?.title || c.from}</strong>
                        <span className="mx-1.5 text-slate-400">&rarr;</span>
                        <strong className="text-slate-600">{toNode?.title || c.to}</strong>
                      </span>
                      <button onClick={() => removeConnection(i)} className="text-slate-400 hover:text-slate-700 font-bold font-mono">×</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Logs section */}
      <div className="border border-slate-200 bg-slate-50 p-4 rounded text-xs space-y-2 h-[130px] flex flex-col justify-between">
        <h3 className="font-bold text-slate-600 uppercase border-b border-slate-200 pb-1.5">Automation execution logs</h3>
        <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-500 leading-normal">
          {automationLogs.length === 0 ? (
            <span className="italic text-slate-400">Waiting for trigger check triggers...</span>
          ) : (
            automationLogs.map((log, idx) => (
              <div key={idx} className="border-l border-slate-300 pl-1.5 mt-0.5">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
