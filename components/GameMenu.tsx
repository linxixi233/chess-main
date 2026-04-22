
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Undo2, X, Music, Volume2, VolumeX, LogOut, SkipForward, Play, Volume1, Tablet, Smartphone } from 'lucide-react';
import { Button } from './Button';
import { GameMode } from '../types';
import { BGM_PLAYLIST } from './BGMPlayer';

interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onHome: () => void;
  onUndo: () => void;
  gameMode: GameMode;
  isMyTurn: boolean;
  canUndo: boolean;
  bgmMuted: boolean;
  toggleBgm: () => void;
  bgmVolume: number;
  onVolumeChange: (vol: number) => void;
  onNextTrack: () => void; 
  currentTrackIndex?: number;
  onSelectTrack?: (index: number) => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  isOpen,
  onClose,
  onRestart,
  onHome,
  onUndo,
  gameMode,
  canUndo,
  bgmMuted,
  toggleBgm,
  bgmVolume,
  onVolumeChange,
  onNextTrack,
  currentTrackIndex = 0,
  onSelectTrack,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Menu Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/90 backdrop-blur-xl w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border border-white/50 pointer-events-auto flex flex-col"
            >
              
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-white flex justify-between items-center shrink-0">
                <h2 className="text-xl font-black italic tracking-tighter">暂停菜单</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-3">
                
                {/* Audio Controls */}
                <div className="bg-slate-100/80 p-3 rounded-2xl mb-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                      <Music size={18} className="text-cyan-500" />
                      <span>背景音乐 (BGM)</span>
                    </div>
                    <button 
                      onClick={toggleBgm}
                      className={`p-2 rounded-xl transition-all ${!bgmMuted ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-200 text-slate-400'}`}
                    >
                      {!bgmMuted ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-3 px-2 mb-2">
                      <Volume1 size={16} className="text-slate-400" />
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={bgmVolume} 
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        disabled={bgmMuted}
                        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
                      />
                      <Volume2 size={16} className="text-slate-400" />
                  </div>
                  
                  {/* Playlist View */}
                  <div className="mt-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
                     <div className="max-h-40 overflow-y-auto p-1 custom-scrollbar">
                        {BGM_PLAYLIST.map((track, index) => {
                           const isActive = index === currentTrackIndex;
                           return (
                             <button
                               key={track.id}
                               onClick={() => onSelectTrack && onSelectTrack(index)}
                               className={`
                                 w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 mb-1 last:mb-0
                                 ${isActive 
                                    ? 'bg-cyan-500 text-white shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-cyan-600'
                                 }
                               `}
                             >
                               {isActive && <Play size={10} fill="currentColor" />}
                               <span className="truncate flex-1">{track.title}</span>
                               {isActive && !bgmMuted && (
                                 <span className="flex gap-0.5 items-end h-3">
                                    <motion.span animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-white/70" />
                                    <motion.span animate={{ height: [8, 4, 12] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-white/70" />
                                    <motion.span animate={{ height: [12, 8, 4] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-white/70" />
                                 </span>
                               )}
                             </button>
                           );
                        })}
                     </div>
                  </div>
                </div>

                {/* Game Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {gameMode === GameMode.Local && (
                    <Button 
                      variant="secondary" 
                      onClick={() => { onUndo(); onClose(); }}
                      disabled={!canUndo}
                      className="w-full justify-center text-sm"
                    >
                      <Undo2 size={16} /> 悔棋
                    </Button>
                  )}
                  
                  <Button 
                    variant="primary" 
                    onClick={() => { onRestart(); onClose(); }}
                    className={`w-full justify-center text-sm ${gameMode !== GameMode.Local ? 'col-span-2' : ''}`}
                  >
                    <RotateCcw size={16} /> 重开本局
                  </Button>
                </div>

                <div className="h-px bg-slate-200 my-1" />

                {/* System Actions */}
                <Button 
                  variant="danger" 
                  onClick={onHome}
                  className="w-full justify-center text-sm"
                >
                  <LogOut size={16} /> 返回主标题
                </Button>

              </div>
              
              {/* Footer Info */}
              <div className="bg-slate-50 p-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 shrink-0">
                Kivotos Gobang System
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
