
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterType, Player } from '../types';
import { CHARACTERS } from '../constants';
import { playSfx } from '../services/sound';
import { Swords, Zap, Info, Target, FastForward, Trophy } from 'lucide-react';

interface Props {
  p1Char: CharacterType;
  p2Char: CharacterType;
  startingPlayer: Player;
  onComplete: () => void;
}

type Phase = 'briefing' | 'deciding' | 'result';

export const TurnDecisionOverlay: React.FC<Props> = ({
  p1Char,
  p2Char,
  startingPlayer,
  onComplete
}) => {
  const [phase, setPhase] = useState<Phase>('briefing');
  const [highlighted, setHighlighted] = useState<Player>(Player.None);
  
  const briefingTimer = useRef<number | null>(null);
  const decisionTimeout = useRef<number | null>(null);
  const resultTimer = useRef<number | null>(null);

  const startDeciding = () => {
    setPhase('deciding');
    const sequence = [50, 50, 50, 50, 50, 60, 60, 70, 80, 100, 120, 150, 200, 300, 500];
    let steps = sequence.length;
    
    if (startingPlayer === Player.P1 && steps % 2 === 0) steps++;
    else if (startingPlayer === Player.P2 && steps % 2 !== 0) steps++;
    
    const delays: number[] = [];
    for(let i=0; i<steps; i++) {
       if (i < sequence.length) delays.push(sequence[i]);
       else delays.push(sequence[sequence.length - 1] * 1.1);
    }
    
    let currentStep = 0;
    
    const loop = () => {
       if (currentStep >= steps) {
          finishDecision();
          return;
       }
       const delay = delays[currentStep];
       setHighlighted(currentStep % 2 === 0 ? Player.P1 : Player.P2);
       playSfx('hover');
       currentStep++;
       decisionTimeout.current = window.setTimeout(loop, delay);
    };
    loop();
  };

  const finishDecision = () => {
    setPhase('result');
    setHighlighted(startingPlayer);
    playSfx('start');
    resultTimer.current = window.setTimeout(() => {
       onComplete();
    }, 2500);
  };

  const handleSkip = () => {
    if (briefingTimer.current) clearTimeout(briefingTimer.current);
    if (decisionTimeout.current) clearTimeout(decisionTimeout.current);
    if (resultTimer.current) clearTimeout(resultTimer.current);

    if (phase === 'briefing') {
       playSfx('click');
       setPhase('result');
       setHighlighted(startingPlayer);
       setTimeout(onComplete, 1000);
    } else if (phase === 'deciding') {
       finishDecision();
    } else {
       onComplete();
    }
  };

  useEffect(() => {
    briefingTimer.current = window.setTimeout(() => {
       startDeciding();
    }, 4000);
    return () => {
      if (briefingTimer.current) clearTimeout(briefingTimer.current);
      if (decisionTimeout.current) clearTimeout(decisionTimeout.current);
      if (resultTimer.current) clearTimeout(resultTimer.current);
    };
  }, []);

  const p1Config = CHARACTERS[p1Char];
  const p2Config = CHARACTERS[p2Char];

  const getOpacity = (player: Player) => {
    if (phase === 'briefing') return 1;
    if (phase === 'deciding') return highlighted === player ? 1 : 0.3;
    if (phase === 'result') return highlighted === player ? 1 : 0.2;
    return 1;
  };

  const getScale = (player: Player) => {
    if (phase === 'result' && highlighted === player) return 1.1;
    if (phase === 'deciding' && highlighted === player) return 1.02;
    return 1;
  };
  
  const getFilter = (player: Player) => {
    if (phase === 'deciding' && highlighted !== player) return 'grayscale(0.5) brightness(0.5)';
    if (phase === 'result' && highlighted !== player) return 'grayscale(1) brightness(0.3)';
    if (phase === 'result' && highlighted === player) return 'brightness(1.2)';
    return 'none';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col md:flex-row bg-slate-900 overflow-hidden font-sans select-none"
      onClick={handleSkip}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <motion.span 
             initial={{ opacity: 0, scale: 2 }}
             animate={{ opacity: 0.1, scale: 1 }}
             className="text-[25vw] font-black italic text-white leading-none"
          >
            VS
          </motion.span>
      </div>

      {/* --- TOP/LEFT PANEL (P1) --- */}
      <motion.div 
        className="flex-1 relative flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-slate-800 transition-all duration-100"
        style={{ 
            backgroundColor: phase === 'briefing' ? '#0f172a' : (highlighted === Player.P1 ? '#083344' : '#020617'),
            opacity: getOpacity(Player.P1),
            scale: getScale(Player.P1),
            filter: getFilter(Player.P1),
            zIndex: highlighted === Player.P1 ? 10 : 0
        }}
      >
         {/* Desktop Standee - Updated Sizing */}
         <div className="absolute inset-0 overflow-hidden hidden md:flex items-end justify-center">
            {/* Background Tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
            <img 
                src={p1Config.standee} 
                className="h-[90%] w-auto max-w-[90%] object-contain object-bottom drop-shadow-2xl z-0" 
                alt="P1" 
            />
         </div>
         {/* Mobile Avatar */}
         <div className="md:hidden absolute inset-0 flex items-center justify-center">
             <img src={p1Config.icon} className="w-48 h-48 rounded-full border-4 border-cyan-500 shadow-[0_0_30px_cyan] object-cover" alt="P1" />
         </div>

         <div className="relative z-10 p-4 md:p-8 w-full flex flex-col items-center md:items-start h-full justify-end md:justify-center">
            <div className="bg-cyan-500 text-white text-xs font-black px-2 py-1 rounded mb-2 shadow">PLAYER 1</div>
            <div className="text-3xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-2 md:mb-4 drop-shadow-lg text-center md:text-left">
                {p1Config.name.split(' ')[0]}
            </div>
            
            {phase === 'result' && highlighted === Player.P1 && (
               <motion.div 
                 initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                 className="mt-2 md:mt-6 bg-yellow-400 text-black px-6 py-2 md:px-8 md:py-3 text-lg md:text-2xl font-black rounded-full shadow-[0_0_30px_rgba(250,204,21,0.6)] transform -skew-x-12 flex items-center gap-2"
               >
                 <Trophy size={20} /> FIRST ATTACK
               </motion.div>
            )}
         </div>
      </motion.div>

      {/* --- BOTTOM/RIGHT PANEL (P2) --- */}
      <motion.div 
        className="flex-1 relative flex flex-col items-center justify-center border-t-4 md:border-t-0 md:border-l-4 border-slate-800 transition-all duration-100"
        style={{ 
            backgroundColor: phase === 'briefing' ? '#0f172a' : (highlighted === Player.P2 ? '#4a044e' : '#020617'),
            opacity: getOpacity(Player.P2),
            scale: getScale(Player.P2),
            filter: getFilter(Player.P2),
            zIndex: highlighted === Player.P2 ? 10 : 0
        }}
      >
         {/* Desktop Standee - Updated Sizing */}
         <div className="absolute inset-0 overflow-hidden hidden md:flex items-end justify-center">
            {/* Background Tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
            <img 
                src={p2Config.standee} 
                className="h-[90%] w-auto max-w-[90%] object-contain object-bottom drop-shadow-2xl z-0 scale-x-[-1]" 
                alt="P2" 
            />
         </div>
         {/* Mobile Avatar */}
         <div className="md:hidden absolute inset-0 flex items-center justify-center">
             <img src={p2Config.icon} className="w-48 h-48 rounded-full border-4 border-pink-500 shadow-[0_0_30px_pink] object-cover" alt="P2" />
         </div>

         <div className="relative z-10 p-4 md:p-8 w-full flex flex-col items-center md:items-end h-full justify-start md:justify-center pt-8 md:pt-0">
            <div className="bg-pink-500 text-white text-xs font-black px-2 py-1 rounded mb-2 shadow">PLAYER 2</div>
            <div className="text-3xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-2 md:mb-4 drop-shadow-lg text-center md:text-right">
                {p2Config.name.split(' ')[0]}
            </div>

            {phase === 'result' && highlighted === Player.P2 && (
               <motion.div 
                 initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                 className="mt-2 md:mt-6 bg-yellow-400 text-black px-6 py-2 md:px-8 md:py-3 text-lg md:text-2xl font-black rounded-full shadow-[0_0_30px_rgba(250,204,21,0.6)] transform -skew-x-12 flex items-center gap-2"
               >
                 <Trophy size={20} /> FIRST ATTACK
               </motion.div>
            )}
         </div>
      </motion.div>

      {/* --- CENTRAL OVERLAY --- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
         <AnimatePresence>
            {phase === 'briefing' && (
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-2xl max-w-lg w-[90%] text-center"
                >
                    <div className="flex justify-center mb-4">
                        <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Target size={16} /> Mission Objective
                        </div>
                    </div>
                    <div className="space-y-4 text-white">
                        <div className="text-sm md:text-base font-medium bg-black/30 p-3 rounded-lg border border-white/10">
                           <span className="text-yellow-400 font-bold">★ 核心玩法:</span> 三子或四子连珠可获得 <strong>+1 SP</strong>。积攒 SP 释放角色技能来逆转战局！
                        </div>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>

         {phase === 'deciding' && (
             <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1.5, rotate: 0 }}
                className="relative"
             >
                <div className="absolute inset-0 bg-white/50 blur-xl rounded-full" />
                <div className="bg-slate-900 text-white w-24 h-24 rounded-full border-4 border-white flex items-center justify-center font-black text-4xl italic shadow-2xl">
                   VS
                </div>
             </motion.div>
         )}
         
         {phase === 'result' && (
             <motion.div 
               className="absolute inset-0 bg-white mix-blend-overlay"
               initial={{ opacity: 1 }}
               animate={{ opacity: 0 }}
               transition={{ duration: 0.5 }}
             />
         )}
      </div>

      <div className="absolute bottom-8 right-8 z-[60] pointer-events-auto">
         <button 
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest group"
         >
            <span className="group-hover:mr-2 transition-all">Click to Skip</span> <FastForward size={20} />
         </button>
      </div>
    </motion.div>
  );
};
