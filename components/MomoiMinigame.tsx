
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Timer } from 'lucide-react';
import { playSfx } from '../services/sound';

export type RPSChoice = 'rock' | 'paper' | 'scissors' | 'timeout';

interface Props {
  onWin: () => void;
  onFail: () => void;
  isOnline: boolean;
  // If online, these are used
  onChoice?: (c: RPSChoice) => void;
  opponentChoice?: RPSChoice | null;
  isInitiator?: boolean; // True if this player triggered the skill
}

const CHOICES: RPSChoice[] = ['rock', 'paper', 'scissors'];

const ICONS: Record<string, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
  timeout: '⌛'
};

export const MomoiMinigame: React.FC<Props> = ({ 
  onWin, onFail, isOnline, onChoice, opponentChoice, isInitiator 
}) => {
  const [gameState, setGameState] = useState<'pick' | 'waiting' | 'reveal' | 'result'>('pick');
  const [playerChoice, setPlayerChoice] = useState<RPSChoice | null>(null);
  const [localCpuChoice, setLocalCpuChoice] = useState<RPSChoice | null>(null); // For local play
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [message, setMessage] = useState("Janken... Pon!");
  const [timeLeft, setTimeLeft] = useState(10);

  // Timer Logic
  useEffect(() => {
    if (gameState === 'pick') {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Time out!
        handleChoose('timeout');
      }
    }
  }, [timeLeft, gameState]);

  // Online: Watch for opponent choice to trigger reveal
  useEffect(() => {
    if (isOnline && gameState === 'waiting' && opponentChoice && playerChoice) {
      resolveGame(playerChoice, opponentChoice);
    }
  }, [isOnline, gameState, opponentChoice, playerChoice]);

  const handleChoose = (choice: RPSChoice) => {
    if (gameState !== 'pick') return;
    
    playSfx(choice === 'timeout' ? 'cancel' : 'click');
    setPlayerChoice(choice);
    
    if (isOnline) {
      setGameState('waiting');
      if (onChoice) onChoice(choice);
    } else {
      // Local Mode
      const cpu = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      setLocalCpuChoice(cpu);
      resolveGame(choice, cpu);
    }
  };

  const resolveGame = (p1: RPSChoice, p2: RPSChoice) => {
    setGameState('reveal');

    // Logic: p1 is Self, p2 is Opponent (or CPU)
    let outcome: 'win' | 'lose' | 'draw' = 'draw';

    // Timeout Logic based on prompt: "If timeout, initiator wins"
    // Interpretation: If I played, and opponent timed out, I win.
    // If I timed out, I lose (even if I am initiator, usually).
    
    if (p1 === 'timeout' && p2 === 'timeout') {
       outcome = 'draw'; 
       setMessage("Both hesitated...");
    } else if (p1 === 'timeout') {
       outcome = 'lose'; // I timed out
       setMessage("Time Over!");
    } else if (p2 === 'timeout') {
       outcome = 'win'; // Opponent timed out
       setMessage("Opponent Time Over!");
    } else if (p1 === p2) {
       outcome = 'draw';
       setMessage("Aiko de... (Draw!)");
    } else if (
      (p1 === 'rock' && p2 === 'scissors') ||
      (p1 === 'paper' && p2 === 'rock') ||
      (p1 === 'scissors' && p2 === 'paper')
    ) {
      outcome = 'win';
      setMessage("You Win!");
    } else {
      outcome = 'lose';
      setMessage("You Lose...");
    }

    setResult(outcome);
    if (outcome === 'win') playSfx('start');
    else if (outcome === 'lose') playSfx('cancel');

    // Finalize
    setTimeout(() => {
      setGameState('result');
      
      setTimeout(() => {
         if (outcome === 'draw') {
             // Reset round
             setGameState('pick');
             setPlayerChoice(null);
             setLocalCpuChoice(null);
             setResult(null);
             setMessage("Sho!! (Go!)");
             setTimeLeft(5); // Shorter time for draw breaker
         } else if (outcome === 'win') {
             onWin();
         } else {
             onFail();
         }
      }, 1500);
    }, 1000);
  };

  const displayOpponentChoice = isOnline ? (opponentChoice || '❓') : localCpuChoice;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="bg-white p-4 md:p-8 rounded-[40px] shadow-2xl text-center max-w-lg w-full border-4 border-pink-400 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-pink-50 opacity-50 z-0 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
             <Gamepad2 className="w-8 h-8 text-pink-500" />
             <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                <Timer size={20} /> {timeLeft}s
             </div>
             <div className="w-8" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 uppercase tracking-wider italic">
            Momoi's Janken
          </h2>
          
          <div className="bg-pink-100/50 p-6 rounded-3xl mb-8 min-h-[160px] flex flex-col items-center justify-center relative">
             <div className="text-xl md:text-2xl font-bold text-pink-600 mb-4 animate-bounce">{message}</div>
             
             <div className="flex gap-8 items-center justify-center">
                {/* Player Hand */}
                <div className="flex flex-col gap-2 items-center">
                   <div className="text-sm font-bold text-slate-400 uppercase">You</div>
                   <div className="text-6xl filter drop-shadow-md transition-transform">
                      {playerChoice ? ICONS[playerChoice] : '❓'}
                   </div>
                </div>

                <div className="text-2xl font-black text-slate-300">VS</div>

                {/* Opponent Hand */}
                <div className="flex flex-col gap-2 items-center">
                   <div className="text-sm font-bold text-pink-400 uppercase">{isOnline ? 'Opponent' : 'Momoi'}</div>
                   <div className="text-6xl filter drop-shadow-md">
                      {gameState === 'reveal' || gameState === 'result' 
                        ? (displayOpponentChoice ? ICONS[displayOpponentChoice as string] : '❓') 
                        : '❓'}
                   </div>
                </div>
             </div>
             
             {gameState === 'waiting' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-3xl">
                   <div className="font-bold text-slate-500 animate-pulse">Waiting for opponent...</div>
                </div>
             )}
          </div>

          {/* Controls */}
          <AnimatePresence mode="wait">
            {gameState !== 'pick' ? (
               <motion.div 
                 key="waiting-ui"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="h-20 flex items-center justify-center font-bold text-slate-400"
               >
                 {/* Placeholder for layout stability */}
               </motion.div>
            ) : (
               <motion.div 
                 key="buttons"
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                 className="flex gap-4 justify-center"
               >
                 {CHOICES.map((choice) => (
                   <button
                     key={choice}
                     onClick={() => handleChoose(choice)}
                     className="
                       group flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl bg-white border-2 border-slate-200 
                       hover:border-pink-400 hover:bg-pink-50 hover:scale-110 transition-all shadow-lg
                     "
                   >
                     <span className="text-3xl md:text-4xl group-hover:rotate-12 transition-transform duration-300">{ICONS[choice]}</span>
                   </button>
                 ))}
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
