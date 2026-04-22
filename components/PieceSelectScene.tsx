
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterType, Player, GameMode, PieceTheme } from '../types';
import { CHARACTERS, PIECE_THEMES } from '../constants';
import { Button } from './Button';
import { ArrowLeft, Play, CircleDot, Ban, Sparkles, ArrowRight } from 'lucide-react';
import { playSfx } from '../services/sound';

interface Props {
  p1Char: CharacterType;
  p2Char: CharacterType;
  p1Theme: PieceTheme;
  p2Theme: PieceTheme;
  setP1Theme: (t: PieceTheme) => void;
  setP2Theme: (t: PieceTheme) => void;
  gameMode: GameMode;
  onStart: () => void;
  onBack: () => void;
  isHost: boolean;
}

export const PieceSelectScene: React.FC<Props> = ({
  p1Char, p2Char, p1Theme, p2Theme, setP1Theme, setP2Theme,
  gameMode, onStart, onBack, isHost
}) => {
  const [mobileStep, setMobileStep] = useState<0 | 1>(0);
  
  // Allow editing in AI Mode too
  const canEditP1 = gameMode === GameMode.Local || gameMode === GameMode.AI || gameMode === GameMode.OnlineHost;
  const canEditP2 = gameMode === GameMode.Local || gameMode === GameMode.AI || gameMode === GameMode.OnlineJoin;

  const handleMobileNext = () => {
    if (mobileStep === 0) setMobileStep(1);
    else onStart();
  };

  const handleMobileBack = () => {
    if (mobileStep === 1) setMobileStep(0);
    else onBack();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex flex-col overflow-y-auto md:overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      
      <div className="pt-8 pb-4 text-center z-20 shrink-0">
        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">
          PIECE CUSTOMIZATION
        </h1>
        <p className="text-slate-400 text-xs md:text-sm font-bold tracking-widest uppercase">Select your tactical markers</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 p-4 md:p-8 relative z-10">
        
        {/* P1 Section - Hidden on Mobile if Step 1 */}
        <div className={`${mobileStep === 0 ? 'block' : 'hidden md:block'} w-full md:w-auto`}>
            <PieceSelector 
              player={Player.P1}
              char={p1Char}
              opponentChar={p2Char}
              theme={p1Theme}
              setTheme={setP1Theme}
              canEdit={canEditP1}
              occupiedThemeId={p2Theme.id}
            />
        </div>

        {/* VS Divider - Desktop Only */}
        <div className="h-full w-px bg-white/20 hidden md:block" />

        {/* P2 Section - Hidden on Mobile if Step 0 */}
        <div className={`${mobileStep === 1 ? 'block' : 'hidden md:block'} w-full md:w-auto`}>
            <PieceSelector 
              player={Player.P2}
              char={p2Char}
              opponentChar={p1Char}
              theme={p2Theme}
              setTheme={setP2Theme}
              canEdit={canEditP2}
              occupiedThemeId={p1Theme.id}
            />
        </div>

      </div>

      {/* Footer Controls */}
      <div className="p-4 md:p-8 flex justify-between items-end relative z-20 shrink-0 mt-auto">
         <Button variant="ghost" onClick={handleMobileBack} className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 text-sm">
           <ArrowLeft size={16} /> BACK
         </Button>

         <div className="absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-8 w-full flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
                {/* Mobile Next Step Button */}
                <Button 
                    variant="primary" 
                    onClick={() => { playSfx('click'); handleMobileNext(); }} 
                    className="md:hidden px-8 py-3 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                    {mobileStep === 0 ? "NEXT" : "START"} <ArrowRight size={20} />
                </Button>

                {/* Desktop Start Button */}
                <div className="hidden md:block">
                    {gameMode !== GameMode.Local && gameMode !== GameMode.AI && !isHost && gameMode !== GameMode.OnlineHost ? (
                    <div className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold animate-pulse shadow-xl border-2 border-slate-600 text-sm md:text-base">
                        等待房主开始...
                    </div>
                    ) : (
                    <Button variant="primary" onClick={onStart} className="px-8 py-3 md:px-12 md:py-4 text-lg md:text-xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <Play size={24} fill="currentColor" /> 开始作战
                    </Button>
                    )}
                </div>
            </div>
         </div>

         <div className="w-20 md:w-32" /> 
      </div>
    </motion.div>
  );
};

const PieceSelector = ({ 
  player, char, opponentChar, theme, setTheme, canEdit, occupiedThemeId 
}: { 
  player: Player, char: CharacterType, opponentChar: CharacterType, theme: PieceTheme, setTheme: (t: PieceTheme) => void, canEdit: boolean, occupiedThemeId: string
}) => {
  const isP1 = player === Player.P1;
  const config = CHARACTERS[char];
  
  const defaultGradient = isP1 ? config.pieceGradientP1 : config.pieceGradientP2;
  const defaultBorder = config.haloColor;
  
  const currentGradient = theme.isDefault ? defaultGradient : theme.gradient;
  const currentBorder = theme.isDefault ? defaultBorder : theme.border;
  const currentShadow = theme.isDefault ? (isP1 ? "shadow-cyan-400/50" : "shadow-pink-400/50") : theme.shadow;

  return (
    <div className={`flex flex-col items-center gap-4 md:gap-6 w-full max-w-md ${!canEdit ? 'opacity-80' : ''}`}>
      <div className={`text-lg md:text-xl font-bold ${isP1 ? 'text-cyan-400' : 'text-pink-400'} uppercase tracking-widest flex items-center gap-2`}>
        <img src={config.icon} className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-slate-800" alt="icon" />
        {isP1 ? "P1" : "P2"} - {config.name.split(' ')[0]}
      </div>

      <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
         <div className="absolute inset-0 bg-white/10 rounded-xl transform rotate-45 border border-white/20 backdrop-blur-md shadow-2xl" />
         <motion.div
           key={theme.id}
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
           className={`
             relative w-32 h-32 md:w-40 md:h-40 rounded-full shadow-2xl
             bg-gradient-to-br ${currentGradient}
             ${currentShadow ? `shadow-[0_0_40px_rgba(0,0,0,0)] ${currentShadow.replace('shadow-', 'shadow-[0_0_40px_')}` : ''}
           `}
         >
            <div className="absolute top-2 left-2 right-2 h-[40%] bg-gradient-to-b from-white/60 to-transparent rounded-full" />
            <div className={`absolute -inset-2 md:-inset-3 rounded-full border-4 opacity-80 ${currentBorder}`} />
            <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay">
               <CircleDot size={32} className="text-white md:w-12 md:h-12" />
            </div>
         </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
         <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-1">
            {canEdit ? "Select Style" : "Waiting for Opponent..."}
         </div>
         {PIECE_THEMES.map(t => {
            const isActive = theme.id === t.id;
            const isTaken = (t.id === occupiedThemeId) && (!t.isDefault || (t.isDefault && char === opponentChar));
            const dotGrad = t.isDefault ? defaultGradient : t.gradient;
            let label = t.name;
            if (t.isDefault) label = `${config.name.split(' ')[0]}`;

            return (
              <button
                key={t.id}
                onClick={() => canEdit && !isTaken && (() => { playSfx('click'); setTheme(t); })()}
                disabled={!canEdit || isTaken}
                className={`
                   relative flex items-center gap-2 p-2 md:p-3 rounded-lg border transition-all text-left overflow-hidden group
                   ${isActive ? 'bg-white/20 border-white shadow-lg scale-[1.02]' : isTaken ? 'bg-black/40 border-slate-700/50 cursor-not-allowed opacity-60' : 'bg-black/20 border-white/5 hover:bg-white/10 hover:border-white/20'}
                `}
              >
                <div className="shrink-0 relative">
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${dotGrad} shadow-sm border border-white/30 ${isTaken ? 'opacity-50 grayscale-[50%]' : ''}`} />
                    {isTaken && <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-black/50 rounded-full"><Ban size={14} strokeWidth={3} /></div>}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className={`text-xs md:text-sm font-bold truncate ${isActive ? 'text-white' : isTaken ? 'text-slate-500 line-through decoration-red-500/50' : 'text-slate-400'}`}>{label}</span>
                    {t.isDefault && <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isActive ? 'text-yellow-300' : 'text-slate-500'}`}><Sparkles size={8} /> 专属</span>}
                </div>
              </button>
            );
         })}
      </div>
    </div>
  );
};
