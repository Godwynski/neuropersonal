import React from 'react';
import { Volume2 } from 'lucide-react';

export default function SynthDrawer({
  adsr,
  setAdsr,
  showSynthBoard,
  setShowSynthBoard,
  playCustomSynthNote,
  synthPianoKeys,
  activeStyle
}) {
  return (
    <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
      <div className="flex justify-between items-center border-b border-blue-500/10 pb-2">
        <div className="flex items-center gap-2">
          <Volume2 className={`w-4 h-4 ${activeStyle.textAccent}`} />
          <h3 className="text-sm font-mono font-bold tracking-widest text-slate-300 uppercase">
            Cybernetic Synthesizer & ADSR Sound Tuner
          </h3>
        </div>
        <button 
          onClick={() => setShowSynthBoard(!showSynthBoard)}
          className={`px-3 py-1.5 font-mono text-xs rounded border ${activeStyle.btnGhost} cursor-pointer`}
        >
          {showSynthBoard ? 'COLLAPSE DRAWER' : 'TUNE OSCILLATORS'}
        </button>
      </div>

      {showSynthBoard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs animate-in slide-in-from-top duration-300">
          
          <div className="space-y-3 lg:col-span-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">OSC Wave:</span>
              {['sine', 'triangle', 'sawtooth', 'square'].map(w => (
                <button 
                  key={w}
                  onClick={() => setAdsr(prev => ({ ...prev, waveform: w }))}
                  className={`px-2 py-0.5 rounded capitalize ${adsr.waveform === w ? activeStyle.bgAccentActive : 'bg-slate-950 text-slate-500 border border-white/5'} cursor-pointer`}
                >
                  {w}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-500">Attack: {adsr.attack}s</label>
                <input type="range" min="0.01" max="1" step="0.05" value={adsr.attack} onChange={(e) => setAdsr(prev => ({ ...prev, attack: parseFloat(e.target.value) }))} className="w-full accent-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500">Decay: {adsr.decay}s</label>
                <input type="range" min="0.01" max="1" step="0.05" value={adsr.decay} onChange={(e) => setAdsr(prev => ({ ...prev, decay: parseFloat(e.target.value) }))} className="w-full accent-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500">Sustain Gain: {adsr.sustain}</label>
                <input type="range" min="0.1" max="1" step="0.1" value={adsr.sustain} onChange={(e) => setAdsr(prev => ({ ...prev, sustain: parseFloat(e.target.value) }))} className="w-full accent-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500">Release: {adsr.release}s</label>
                <input type="range" min="0.01" max="2" step="0.1" value={adsr.release} onChange={(e) => setAdsr(prev => ({ ...prev, release: parseFloat(e.target.value) }))} className="w-full accent-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <span className="text-slate-500">Freq Synthesizer Keyboard:</span>
            <div className="flex bg-[#05080e] p-2 rounded-lg border border-blue-500/5 h-[90px] relative items-end">
              {synthPianoKeys.map((k, idx) => (
                <button
                  key={idx}
                  onClick={() => playCustomSynthNote(k.freq)}
                  className={`flex-1 transition-colors outline-none cursor-pointer rounded-b ${
                    k.isBlack 
                      ? 'bg-slate-950 hover:bg-slate-800 border-l border-r border-blue-500/30 text-[10px] text-blue-400 absolute h-[55px] z-20' 
                      : 'bg-slate-100 hover:bg-slate-300 text-slate-950 border border-slate-300 text-[11px] h-full z-10 flex items-end justify-center pb-1 font-bold'
                  }`}
                  style={k.isBlack ? { left: `${(idx * 7.4) + 6}%`, width: '6.2%' } : {}}
                >
                  {k.note}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
