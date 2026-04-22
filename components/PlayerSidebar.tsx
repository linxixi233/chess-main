
import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, CharacterType, PieceTheme, GameMode } from '../types';
import { CHARACTERS } from '../constants';
import { CharacterSystem } from '../services/characterRules'; // New Import
import { Button } from './Button';
import { PiecePreview } from './PiecePreview';
import { Plus, Clock, Zap, Flame } from 'lucide-react';

interface PlayerSidebarProps {
  player: Player;
  isLeft: boolean;
  char: CharacterType;
  theme: PieceTheme;
  points: number;
  timeLeft: number;
  displayName: string;
  // Pass individual flags instead of full game object to minimize diffs
  currentPlayer: Player;
  winner: Player;
  arisAwakened: boolean;
  skillUsedInCurrentTurn: boolean;
  turnCount: number;
  yuzuSkillCost: number;
  momoiLastSkillTurn: number;
  lastPointGain: number;
  pointGainPlayer: Player;
  
  triggerSkill: (p: Player) => void;
  isMySkill: boolean;
  iconUrl: string;
  orientation?: 'vertical' | 'horizontal'; 
  className?: string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const PlayerSidebar: React.FC<PlayerSidebarProps> = memo(({
  player, isLeft, char, theme, points, timeLeft, displayName, 
  currentPlayer, winner, arisAwakened, skillUsedInCurrentTurn,
  turnCount, yuzuSkillCost, momoiLastSkillTurn, lastPointGain, pointGainPlayer,
  triggerSkill, isMySkill, iconUrl, orientation = 'vertical', className = ''
}) => {
  
  // Reconstruct partial game state for the logic service check
  // Note: ideally we pass full game state, but we are optimizing props.
  // We reconstruct just enough for the `canUseSkill` check of current characters.
  const mockState: any = {
      currentPlayer,
      turnCount,
      p1Points: points, // Warning: this logic assumes points prop matches player
      p2Points: points,
      p1ArisAwakened: arisAwakened, // Warning: assumes aris prop matches player
      p2ArisAwakened: arisAwakened,
      yuzuSkillCost,
      momoiLastSkillTurn,
      skillUsedInCurrentTurn,
      hoshinoStance: 'defense' // Default fallback if not passed, Hoshino logic might need full state but for visual sidebar usually OK
  };
  
  // To support Hoshino properly in Sidebar without passing full state, we rely on the parent updating `iconUrl` and `displayName`.
  // However, for cost/text, we really should fetch from system.
  // Ideally `PlayerSidebar` should receive `cost` and `skillName` as props calculated by parent.
  // But to keep architecture clean as per request "Easy to add new characters", we use the registry.
  // We will assume the parent component rerenders this when state changes.
  
  const logic = CharacterSystem.getLogic(char);
  
  // FIXME: Sidebar needs access to real GameState to display accurate dynamic info (Hoshino Stance).
  // Currently `App.tsx` passes a lot of loose props. 
  // For the purpose of this refactor, we will rely on static config unless props carry the info.
  // Hoshino Stance is missing in props!
  // BUT, since `App.tsx` handles the render, and we are using `CharacterSystem` in `App.tsx`,
  // we can trust `App.tsx` to pass the correct `iconUrl`. 
  // For Cost and Name, we might display defaults or need to add `hoshinoStance` to props.
  // Let's rely on standard cost for now or update `App.tsx` to pass cost/name explicitly?
  // No, let's keep it simple: Use base char config for static text, but use logic for `canUse`.
  
  const config = CHARACTERS[char];
  const isP1 = player === Player.P1;
  const isTurn = currentPlayer === player && winner === Player.None;
  
  // Visual indicators
  const isSkillActive = (skillUsedInCurrentTurn && currentPlayer === player) || (char === CharacterType.Aris && arisAwakened);
  
  const glowColor = player === Player.P1 ? 'rgba(34,211,238,0.8)' : 'rgba(236,72,153,0.8)';
  const baseColorClass = player === Player.P1 ? 'bg-cyan-500' : 'bg-pink-500';
  const skillGlowColor = 'rgba(250,204,21,0.9)'; 

  // Determine Status Text & Enabled state
  let status = { disabled: false, msg: config.skillName };
  let cost = config.skillCost;

  // Manual patches for dynamic values since we lack full state in this component's props
  if (char === CharacterType.Yuzu) cost = yuzuSkillCost;
  // Hoshino hack: We don't know stance here easily without prop drilling. 
  // However, `App.tsx` passes `iconUrl`. If icon matches Awakened, it's Attack mode (Cost 3).
  if (char === CharacterType.Hoshino) {
      const isAttack = iconUrl.includes("10097"); // Awakened ID
      cost = isAttack ? 3 : 2;
      status.msg = isAttack ? "铁之霍鲁斯" : "战术镇压";
  }

  // Basic checks
  if (skillUsedInCurrentTurn) status = { disabled: true, msg: "回合限一次" };
  else if (points < cost) status = { disabled: true, msg: `需要 ${cost} SP` };
  else if (char === CharacterType.Yuzu && turnCount < 5) status = { disabled: true, msg: "T5 解锁" };
  else if (char === CharacterType.Momoi && (turnCount - momoiLastSkillTurn) < 2) status = { disabled: true, msg: "冷却中" };
  else if (char === CharacterType.Aris && arisAwakened) status = { disabled: true, msg: "已觉醒" };

  const maxPoints = 5;
  const hasEnoughForSkill = points >= cost;
  const isVertical = orientation === 'vertical';
  const identityLabel = isMySkill ? "(YOU)" : "(OPPONENT)";
  const identityColor = isMySkill ? "text-green-600 bg-green-100" : "text-red-500 bg-red-100";

  return (
    <div className={`relative z-20 pointer-events-none transition-all ${isVertical ? `h-full flex flex-col justify-center gap-4 p-4 w-64 md:w-72 ${isLeft ? 'items-start' : 'items-end'}` : `w-full max-w-md flex flex-row items-center justify-between gap-2 p-1 h-auto`} ${className}`}>
       <AnimatePresence>
          {lastPointGain > 0 && pointGainPlayer === player && (
            <motion.div initial={{ y: 20, opacity: 0, scale: 0.5 }} animate={{ y: -60, opacity: 1, scale: 1.5 }} exit={{ opacity: 0 }} className={`absolute z-50 pointer-events-none ${isVertical ? (isLeft ? 'left-10 top-1/3' : 'right-10 top-1/3') : 'left-1/2 -top-12 -translate-x-1/2'}`}>
              <div className="text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] flex items-center gap-1 stroke-black"><Plus strokeWidth={4} /> {lastPointGain} SP</div>
            </motion.div>
          )}
       </AnimatePresence>

       <motion.div animate={isSkillActive ? { scale: isVertical ? 1.05 : 1.02, borderColor: '#facc15', boxShadow: `0 0 30px ${skillGlowColor}, inset 0 0 20px ${skillGlowColor}` } : (isTurn ? { scale: isVertical ? 1.02 : 1.01, borderColor: player === Player.P1 ? '#22d3ee' : '#f472b6', boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}` } : { scale: 1, borderColor: player === Player.P1 ? '#22d3ee' : '#f472b6', boxShadow: '0 0 0 rgba(0,0,0,0)' })} transition={{ duration: 0.5, repeat: isTurn && !isSkillActive ? Infinity : 0, repeatType: 'reverse' }} className={`pointer-events-auto bg-white/90 rounded-2xl border-2 transition-all duration-300 relative overflow-visible ${isVertical ? 'flex flex-col items-center gap-2 p-4 w-full' : 'flex flex-row items-center gap-3 p-2 w-full pr-3'}`}>
           <div className="relative shrink-0">
              <img src={iconUrl} className={`${isVertical ? 'w-20 h-20 rounded-xl' : 'w-12 h-12 rounded-lg'} bg-slate-100 object-cover relative z-10`} alt="Profile" />
              <AnimatePresence>
                {isSkillActive && (
                   <><motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="absolute inset-0 bg-yellow-400 mix-blend-overlay z-20 rounded-lg"/>
                      <motion.div initial={{ scale: 0, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }} className="absolute -top-2 -right-2 z-30 bg-yellow-400 text-white p-0.5 rounded-full border-2 border-white shadow-lg"><Zap size={12} fill="currentColor" className="text-black" /></motion.div>
                   </>
                )}
              </AnimatePresence>
              {isTurn && !isSkillActive && (<motion.div className={`absolute -inset-1 rounded-xl border-2 ${player === Player.P1 ? 'border-cyan-400' : 'border-pink-400'}`} animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1.1] }} transition={{ duration: 1.5, repeat: Infinity }} />)}
              {isVertical && (<div className={`absolute -bottom-2 ${isLeft ? '-right-2' : '-left-2'} z-20`}><PiecePreview char={char} theme={theme} isP1={isP1} /></div>)}
           </div>
           
           <div className={`${isVertical ? 'text-center w-full' : 'flex-1 min-w-0 flex flex-col justify-center'}`}>
               <div className="flex items-center justify-between gap-2">
                   <span className={`px-1.5 py-0.5 rounded text-[10px] font-black text-white shadow-sm shrink-0 ${baseColorClass}`}>{isP1 ? "P1" : "P2"}</span>
                   <div className={`flex flex-col min-w-0 ${isVertical ? 'items-center' : 'items-start flex-1'}`}>
                       <div className="font-black uppercase text-slate-800 leading-tight truncate w-full text-left md:text-center">{displayName}</div>
                       <div className={`text-[9px] font-bold px-1 rounded mt-0.5 ${identityColor}`}>{identityLabel}</div>
                   </div>
                   {!isVertical && (<div className={`flex items-center gap-1 font-mono text-xs font-bold bg-slate-100 rounded px-1.5 py-0.5 shrink-0 ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}><Clock size={10} className="shrink-0" />{formatTime(timeLeft)}</div>)}
               </div>
               
               <div className={`w-full ${isVertical ? 'mt-2 mb-1' : 'mt-1'}`}>
                 {isVertical && (<div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider"><span>SP Gauge</span><span className={hasEnoughForSkill ? "text-yellow-500 animate-pulse" : ""}>{points} / {maxPoints}</span></div>)}
                 <div className={`flex gap-1 bg-slate-200 rounded-full p-0.5 shadow-inner ${isVertical ? 'h-3' : 'h-2'}`}>
                    {[...Array(maxPoints)].map((_, i) => { const filled = i < points; return (<div key={i} className={`flex-1 rounded-sm transition-all duration-300 relative overflow-hidden ${filled ? (hasEnoughForSkill ? 'bg-yellow-400 shadow-[0_0_5px_#facc15]' : baseColorClass) : 'bg-slate-300/50'}`}>{filled && (<div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite] skew-x-12" />)}</div>) })}
                 </div>
                 {isVertical && (<div className="text-[10px] text-slate-400 text-center mt-1 scale-90">Connect 3+ to charge</div>)}
               </div>
               {isVertical && (<div className={`mt-1 flex items-center justify-center gap-1 font-mono text-sm font-bold bg-slate-100 rounded-md px-2 py-0.5 ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}><Clock size={12} className="shrink-0" />{formatTime(timeLeft)}</div>)}
           </div>

           {!isVertical && (<Button onClick={() => triggerSkill(player)} disabled={currentPlayer !== player || status.disabled || !isMySkill} className={`ml-2 px-3 py-2 rounded-xl h-full flex items-center justify-center ${currentPlayer === player && !status.disabled ? "shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse bg-gradient-to-br from-yellow-300 to-amber-500 text-white border-white" : "bg-slate-100 text-slate-400 border-slate-200 grayscale opacity-50"}`}><Zap size={20} fill={currentPlayer === player && !status.disabled ? "currentColor" : "none"} /></Button>)}
       </motion.div>

       {isVertical && (
           <Button onClick={() => triggerSkill(player)} disabled={currentPlayer !== player || status.disabled || !isMySkill} className={`pointer-events-auto w-full py-4 rounded-xl flex flex-col items-center gap-1 ${player === Player.P1 ? "border-l-4 border-cyan-400" : "border-r-4 border-pink-400"} ${currentPlayer === player && !status.disabled ? "shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse ring-2 ring-yellow-300 ring-offset-2" : "opacity-80 grayscale"}`}>
              <div className="flex items-center gap-2"><Zap size={20} className={!status.disabled ? 'fill-yellow-300 text-yellow-600' : ''} /><span className="font-black italic text-lg">SKILL</span></div>
              <span className="truncate max-w-full px-1 leading-tight text-xs opacity-80">{status.msg}</span>
           </Button>
       )}
    </div>
  );
});
