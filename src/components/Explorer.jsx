import React from 'react';

export default function Explorer({
  loadingFiles,
  fileError,
  files,
  loadFiles,
  formatBytes
}) {
  return (
    <div className="space-y-4 font-sans text-slate-800 bg-white p-2">
      <header className="flex justify-between items-center border-b border-slate-200 pb-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold">Workspace Explorer</h1>
          <p className="text-[11px] text-slate-500">Scan and list file descriptors in the project directory.</p>
        </div>
        <button 
          onClick={loadFiles} 
          disabled={loadingFiles} 
          className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 rounded text-xs cursor-pointer font-bold transition-colors"
        >
          {loadingFiles ? 'Scanning...' : 'Refresh Sectors'}
        </button>
      </header>

      {fileError && (
        <div className="p-3 border border-rose-350 bg-rose-50 text-rose-800 text-xs rounded">
          {fileError}
        </div>
      )}

      <div className="border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 font-bold text-slate-600">
              <th className="px-4 py-2">Sector Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Sector Size</th>
              <th className="px-4 py-2">Last Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loadingFiles ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                  Scanning directory...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                  No files detected.
                </td>
              </tr>
            ) : (
              files.map((file, idx) => (
                <tr key={idx} className="hover:bg-slate-50 text-slate-700">
                  <td className="px-4 py-2 flex items-center gap-1.5 font-bold">
                    <span>{file.isDirectory ? '📁' : '📄'}</span>
                    <span>{file.name}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-500">{file.isDirectory ? 'Directory' : 'File'}</td>
                  <td className="px-4 py-2 font-mono text-[10px] text-slate-500">{file.isDirectory ? '-' : formatBytes(file.size)}</td>
                  <td className="px-4 py-2 text-slate-500">{new Date(file.modified).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
