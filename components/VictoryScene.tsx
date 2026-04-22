
import React from 'react';
import { motion } from 'framer-motion';
import { CharacterConfig, Player, GameMode, VictoryReason } from '../types';
import { Button } from './Button';
import { RotateCcw, Home, Trophy, XCircle, Check } from 'lucide-react';

interface VictorySceneProps {
  winner: Player;
  character: CharacterConfig;
  onRestart: () => void;
  onHome: () => void;
  gameMode?: GameMode;
  isLocalWinner?: boolean;
  winnerName?: string;
  reason?: VictoryReason;
  rematchState?: { p1: boolean, p2: boolean };
}

export const VictoryScene: React.FC<VictorySceneProps> = ({ 
  winner, 
  character, 
  onRestart, 
  onHome, 
  gameMode = GameMode.Local, 
  isLocalWinner = true,
  winnerName,
  reason,
  rematchState
}) => {
  const isP1 = winner === Player.P1;
  const gradient = isP1 ? 'from-cyan-500 to-blue-600' : 'from-pink-500 to-rose-600';
  const textShadow = isP1 ? 'drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]' : 'drop-shadow-[0_0_30px_rgba(244,114,182,0.8)]';

  // Determine Title text (WIN or LOSE)
  const titleText = (gameMode !== GameMode.Local && !isLocalWinner) ? "LOSE" : "WIN";
  const Icon = (gameMode !== GameMode.Local && !isLocalWinner) ? XCircle : Trophy;

  // Determine Reason Text
  let reasonText = "";
  switch(reason) {
      case 'points': reasonText = "Tactical Win (5 SP)"; break;
      case 'timeout': reasonText = "Time Out"; break;
      case 'skill': reasonText = "Skill Victory"; break;
      case 'standard': reasonText = "Five in a Row"; break;
      default: reasonText = "Victory"; break;
  }

  // Rematch Status Logic
  const isOnline = gameMode !== GameMode.Local;
  const amIP1 = gameMode === GameMode.OnlineHost;
  const myRematch = isOnline ? (amIP1 ? rematchState?.p1 : rematchState?.p2) : false;
  const oppRematch = isOnline ? (amIP1 ? rematchState?.p2 : rematchState?.p1) : false;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
      {/* 1. Background Flash & Overlay */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-0"
      />
      
      {/* 2. Dynamic Background Stripes */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20 -skew-x-12 z-0 mix-blend-overlay`}
      />

      {/* 3. Main Content */}
      <div className="relative z-20 flex flex-col items-center text-center p-8 w-full max-w-4xl">
        
        {/* Header Label */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 mb-2"
        >
          <Icon className={`w-8 h-8 ${isP1 ? 'text-cyan-400' : 'text-pink-400'}`} />
          <span className="text-white/80 font-mono font-bold tracking-[0.5em] text-sm md:text-xl uppercase">
            Battle Result
          </span>
          <Icon className={`w-8 h-8 ${isP1 ? 'text-cyan-400' : 'text-pink-400'}`} />
        </motion.div>

        {/* Huge WIN/LOSE Text */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.6 }}
          className={`
             text-[8rem] md:text-[12rem] leading-none font-black italic text-transparent bg-clip-text 
             bg-gradient-to-b ${titleText === 'LOSE' ? 'from-slate-400 to-slate-600' : 'from-white to-white/50'}
             ${titleText === 'WIN' ? textShadow : 'drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]'} 
             pr-4 md:pr-8
          `}
        >
          {titleText}
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className={`w-full h-2 md:h-4 bg-gradient-to-r ${gradient} mb-6 md:mb-10`}
        />
        
        {/* Winner Info */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1 }}
           className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
             <h2 className="text-3xl md:text-6xl font-bold text-white uppercase tracking-wider shadow-black drop-shadow-md">
                {character.name.split(' ')[0]}
             </h2>
             
             {/* Player ID Display (Only if Online) */}
             {gameMode !== GameMode.Local && winnerName && (
                <div className="bg-black/40 backdrop-blur px-4 py-2 rounded-xl border border-white/20 mt-2 md:mt-0">
                   <span className="text-white font-mono font-bold text-xl md:text-3xl">{winnerName}</span>
                </div>
             )}
          </div>
          
          <div className="flex flex-col items-center mt-2">
            <div className="text-xl md:text-2xl text-yellow-400 font-bold uppercase tracking-widest border border-yellow-400/30 bg-yellow-400/10 px-4 py-1 rounded-full mb-1">
                {reasonText}
            </div>
            <div className="text-xl md:text-2xl text-white/70 font-light">
                {titleText === 'LOSE' ? 'Winner' : 'Victory'}
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col md:flex-row gap-4 md:gap-8 w-full md:w-auto items-center"
        >
          <div className="flex flex-col gap-2 w-full md:w-64">
             <Button 
               onClick={onRestart} 
               disabled={myRematch}
               className={`w-full py-4 md:py-6 text-xl shadow-xl border-2 ${myRematch ? 'border-green-400 bg-green-900/50 text-green-300' : 'border-white/20'}`}
               icon={myRematch ? <Check size={24} /> : <RotateCcw size={24} />}
             >
               {isOnline ? (myRematch ? "Wait Opponent" : "申请重赛") : "再来一局"}
             </Button>
             
             {/* Opponent Status Indicator */}
             {isOnline && oppRematch && (
                <div className="text-sm font-bold text-green-400 animate-pulse bg-black/50 px-2 py-1 rounded-full">
                   对手已准备! (Opponent Ready)
                </div>
             )}
          </div>
          
          <Button 
            variant="secondary" 
            onClick={onHome} 
            className="w-full md:w-64 py-4 md:py-6 text-xl shadow-xl"
            icon={<Home size={24} />}
          >
            返回主页
          </Button>
        </motion.div>
      </div>

      {/* 4. Confetti / Particles (Only if WIN) */}
      {titleText === 'WIN' && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-3 h-3 ${i % 2 ? 'bg-white' : (isP1 ? 'bg-cyan-400' : 'bg-pink-400')}`}
          initial={{ 
            x: "50vw", 
            y: "50vh", 
            scale: 0 
          }}
          animate={{ 
            x: `${Math.random() * 100}vw`, 
            y: `${Math.random() * 100}vh`, 
            scale: [0, 1, 0],
            rotate: 360
          }}
          transition={{ 
            duration: 1 + Math.random(), 
            delay: 0.5 + Math.random() * 0.5,
            ease: "circOut"
          }}
        />
      ))}
    </div>
  );
};
