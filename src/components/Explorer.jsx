import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Explorer({
  loadingFiles,
  fileError,
  files,
  loadFiles,
  formatBytes,
  activeStyle
}) {
  return (
    <div className="space-y-6 outline-none animate-in fade-in duration-300">
      <header className="flex justify-between items-start shrink-0 font-mono">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-widest text-slate-200">WORKSPACE FILES</h1>
          <p className="text-xs text-indigo-400 mt-0.5">Physical scanner parsing directory directories on local sector.</p>
        </div>
        <button onClick={loadFiles} disabled={loadingFiles} className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition border border-blue-500/10 ${activeStyle.btnGhost}`}>
          <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
          <span>REFRESH SECTORS</span>
        </button>
      </header>

      {fileError && <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-xs font-mono text-rose-400">{fileError}</div>}

      <div className="bg-[#0c1222]/85 border border-blue-500/10 rounded-xl overflow-hidden shadow-2xl select-text font-mono text-xs text-slate-300">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-blue-500/10 bg-blue-500/5">
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Sector Name</th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Sector Size</th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500/5">
            {loadingFiles ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">Scanning directory blocks...</td></tr>
            ) : files.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">Empty sectors.</td></tr>
            ) : (
              files.map((file, idx) => (
                <tr key={idx} className="hover:bg-blue-500/5 transition-colors">
                  <td className={`px-6 py-3.5 font-semibold flex items-center gap-2 ${file.isDirectory ? 'text-cyan-400' : 'text-slate-200'}`}>
                    <span>{file.isDirectory ? '📁' : '📄'}</span>
                    <span>{file.name}</span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-400">{file.isDirectory ? 'Directory' : 'File'}</td>
                  <td className="px-6 py-3.5 text-xs text-slate-400">{file.isDirectory ? '-' : formatBytes(file.size)}</td>
                  <td className="px-6 py-3.5 text-xs text-slate-400">{new Date(file.modified).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
