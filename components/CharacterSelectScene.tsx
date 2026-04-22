
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterType, Player, GameMode } from '../types';
import { CHARACTERS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, Zap, ArrowRight, Target, ChevronDown, ChevronUp, BookOpen, Swords, Shield, User, Globe, Wifi, CheckCircle2, Play, Loader2 } from 'lucide-react';
import { playSfx } from '../services/sound';

// School backgrounds and icons mapping
const SCHOOL_ASSETS: Record<CharacterType, { bg: string; icon: string; schoolName: string }> = {
  [CharacterType.Aris]: {
    bg: '/characterbackground/BG_GameDevRoom.jpg',
    icon: '/characterbackground/School_Icon_MILLENNIUM.png',
    schoolName: '千年学园'
  },
  [CharacterType.Yuuka]: {
    bg: '/characterbackground/bg_view_mainstadium.jpg',
    icon: '/characterbackground/School_Icon_MILLENNIUM.png',
    schoolName: '千年学园'
  },
  [CharacterType.Yuzu]: {
    bg: '/characterbackground/BG_GameDevRoom.jpg',
    icon: '/characterbackground/School_Icon_MILLENNIUM.png',
    schoolName: '千年学园'
  },
  [CharacterType.Midori]: {
    bg: '/characterbackground/BG_GameDevRoom.jpg',
    icon: '/characterbackground/School_Icon_MILLENNIUM.png',
    schoolName: '千年学园'
  },
  [CharacterType.Momoi]: {
    bg: '/characterbackground/BG_GameDevRoom.jpg',
    icon: '/characterbackground/School_Icon_MILLENNIUM.png',
    schoolName: '千年学园'
  },
  [CharacterType.Hoshino]: {
    bg: '/characterbackground/BG_SchoolFrontGate.jpg',
    icon: '/characterbackground/School_Icon_ABYDOS.png',
    schoolName: '阿拜多斯联邦学园'
  },
  [CharacterType.ShirokoTerror]: {
    bg: '/characterbackground/BG_SchoolFrontGate.jpg',
    icon: '/characterbackground/School_Icon_ABYDOS.png',
    schoolName: '阿拜多斯联邦学园'
  },
  [CharacterType.Sensei]: {
    bg: '/characterbackground/BG_View_Schale.jpg',
    icon: '/characterbackground/sensei schale.png',
    schoolName: '沙勒网络'
  }
};

// Text animation variants for character info (统一动画参数)
const textVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Skill card animation (与文字动画统一)
const skillCardVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: 0.05,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Staggered children animation
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

interface Props {
  p1Char: CharacterType;
  p2Char: CharacterType;
  setP1Char: (c: CharacterType) => void;
  setP2Char: (c: CharacterType) => void;
  gameMode: GameMode;
  onStart: () => void;
  onBack: () => void;
  isHost: boolean; 
  isP1Ready?: boolean;
  isP2Ready?: boolean;
  onReady?: () => void;
}

// Background Theme Colors
const CHAR_BG_THEMES: Record<CharacterType, string> = {
  [CharacterType.Aris]: "from-slate-900 to-blue-950",
  [CharacterType.Yuuka]: "from-slate-900 to-indigo-950",
  [CharacterType.Yuzu]: "from-slate-900 to-orange-950",
  [CharacterType.Midori]: "from-slate-900 to-emerald-950",
  [CharacterType.Momoi]: "from-slate-900 to-pink-950",
  [CharacterType.ShirokoTerror]: "from-black to-slate-950",
  [CharacterType.Sensei]: "from-slate-900 to-sky-950",
  [CharacterType.Hoshino]: "from-pink-900 to-orange-950",
};

// Accent Colors
const CHAR_ACCENT_COLORS: Record<CharacterType, string> = {
  [CharacterType.Aris]: "text-cyan-400 border-cyan-400 bg-cyan-500",
  [CharacterType.Yuuka]: "text-indigo-400 border-indigo-400 bg-indigo-500",
  [CharacterType.Yuzu]: "text-orange-400 border-orange-400 bg-orange-500",
  [CharacterType.Midori]: "text-emerald-400 border-emerald-400 bg-emerald-500",
  [CharacterType.Momoi]: "text-pink-400 border-pink-400 bg-pink-500",
  [CharacterType.ShirokoTerror]: "text-slate-300 border-slate-500 bg-slate-600",
  [CharacterType.Sensei]: "text-sky-400 border-sky-400 bg-sky-500",
  [CharacterType.Hoshino]: "text-pink-300 border-pink-400 bg-pink-500",
};

// Stats for flavor
const CHAR_STATS: Record<CharacterType, { atk: number; def: number; diff: number }> = {
  [CharacterType.Aris]: { atk: 5, def: 2, diff: 1 },
  [CharacterType.Yuuka]: { atk: 2, def: 5, diff: 2 },
  [CharacterType.Yuzu]: { atk: 4, def: 3, diff: 4 },
  [CharacterType.Midori]: { atk: 3, def: 3, diff: 2 },
  [CharacterType.Momoi]: { atk: 4, def: 1, diff: 1 },
  [CharacterType.ShirokoTerror]: { atk: 5, def: 5, diff: 5 },
  [CharacterType.Sensei]: { atk: 1, def: 1, diff: 5 },
  [CharacterType.Hoshino]: { atk: 4, def: 5, diff: 3 },
};

const CharacterFlameAura = ({ charType }: { charType: CharacterType }) => {
  const accent = CHAR_ACCENT_COLORS[charType];
  const colorPart = accent.split(' ').find(c => c.startsWith('bg-'))?.replace('bg-', '') || 'cyan-500';

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
       <motion.div 
         className={`absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-gradient-to-t from-${colorPart} to-transparent opacity-20 blur-3xl`}
         animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
       />
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
    </div>
  );
};

const CharacterPanel = ({ 
  player, charType, setChar, canEdit, activeChar, isReady, gameMode
}: { 
  player: Player, charType: CharacterType, setChar: (c: CharacterType) => void, canEdit: boolean, activeChar: CharacterType, isReady: boolean, gameMode: GameMode
}) => {
  const isP1 = player === Player.P1;
  const config = CHARACTERS[charType];
  const stats = CHAR_STATS[charType];
  const { text: textColor, border: borderColor } = CHAR_ACCENT_COLORS[charType] ? 
     (() => { const [t, b] = CHAR_ACCENT_COLORS[charType].split(' '); return { text: t, border: b }; })() 
     : { text: 'text-white', border: 'border-white' };

  // Get school assets
  const schoolAssets = SCHOOL_ASSETS[charType];
  const bgClass = CHAR_BG_THEMES[charType];

  // Unified Standee Logic
  const isWideCharacter = [CharacterType.Yuuka, CharacterType.Yuzu, CharacterType.Midori].includes(charType);
  const standeeRight = isWideCharacter 
     ? 'right-[-10%] md:right-0 lg:right-[10%]' 
     : 'right-[-25%] md:right-[-5%] lg:right-[5%]';

  const [showTips, setShowTips] = useState(true);

  // Label text logic
  let labelText = isP1 ? "PLAYER 1 SELECT" : "PLAYER 2 SELECT";
  if (gameMode === GameMode.AI && !isP1) labelText = "CPU OPPONENT SELECT";

  return (
    <div className={`relative w-full h-full overflow-hidden transition-all duration-500 bg-gradient-to-br ${bgClass}`}>
      <CharacterFlameAura charType={charType} />

      {/* Background Image Layer */}
      <motion.div 
        key={`bg-${charType}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={schoolAssets.bg}
          alt="background"
          className="w-full h-full object-cover opacity-60"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </motion.div>

      {/* School Icon - Center Background, behind standee */}
      <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
        <img 
          src={schoolAssets.icon}
          alt={schoolAssets.schoolName}
          className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain opacity-20 grayscale"
        />
      </div>

      {/* Standee */}
      <motion.div 
          key={charType}
          initial={{ opacity: 0, x: 50, scale: 1.1 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className={`
            absolute bottom-0 z-0 h-[85%] md:h-[95%] w-auto
            ${standeeRight}
          `}
        >
           <img 
             src={config.standee} 
             alt={config.name} 
             className={`
               h-full w-auto object-contain drop-shadow-2xl 
               ${isReady ? 'contrast-125 brightness-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]' : ''}
               ${charType === CharacterType.ShirokoTerror ? 'grayscale contrast-125 brightness-75' : ''}
               origin-bottom transition-all duration-500
             `}
           />
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 p-6 md:p-12 flex flex-col pointer-events-none">
         
         {/* Header */}
         <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-start w-full max-w-2xl"
         >
             <AnimatePresence mode="wait">
               <motion.div
                 key={`label-${charType}-${labelText}`}
                 variants={textVariants}
                 initial="initial"
                 animate="animate"
                 exit="exit"
                 className={`px-4 py-1.5 rounded bg-white/10 backdrop-blur font-black text-sm md:text-base tracking-[0.2em] shadow-lg mb-2 border-l-4 ${borderColor} text-white`}
               >
                 {labelText}
               </motion.div>
             </AnimatePresence>
             
             <AnimatePresence mode="wait">
               <motion.h1
                 key={`name-${charType}`}
                 variants={textVariants}
                 initial="initial"
                 animate="animate"
                 exit="exit"
                 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg leading-none mb-2"
               >
                  {config.name.split(' ')[0]}
               </motion.h1>
             </AnimatePresence>
             
             <motion.div 
               key={`type-${charType}`}
               variants={textVariants}
               initial="initial"
               animate="animate"
               exit="exit"
               className="flex items-center gap-4"
             >
               <h2 className={`text-base md:text-xl font-bold ${textColor} uppercase tracking-widest bg-black/40 px-3 py-1 rounded`}>
                  {config.type}
               </h2>
               
               {/* Mobile Stats */}
               <div className="flex md:hidden gap-3 bg-black/40 px-3 py-1 rounded">
                  <div className="flex items-center gap-1"><Swords size={14} className="text-red-400"/> <span className="text-sm font-mono text-white">{stats.atk}</span></div>
                  <div className="flex items-center gap-1"><Shield size={14} className="text-blue-400"/> <span className="text-sm font-mono text-white">{stats.def}</span></div>
               </div>
             </motion.div>
         </motion.div>

         {/* PC Stats */}
         <div className="mt-6 hidden md:flex flex-col gap-3">
             <div className="flex items-center gap-4 bg-black/60 w-fit px-4 py-2 rounded-r-full border-l-4 border-white/30 backdrop-blur-sm">
                <Swords size={18} className="text-red-400" />
                <div className="flex gap-1">{[...Array(5)].map((_,i) => <div key={i} className={`w-8 h-2 rounded-sm ${i<stats.atk ? 'bg-red-500' : 'bg-slate-700'}`}/>)}</div>
             </div>
             <div className="flex items-center gap-4 bg-black/60 w-fit px-4 py-2 rounded-r-full border-l-4 border-white/30 backdrop-blur-sm">
                <Shield size={18} className="text-blue-400" />
                <div className="flex gap-1">{[...Array(5)].map((_,i) => <div key={i} className={`w-8 h-2 rounded-sm ${i<stats.def ? 'bg-blue-500' : 'bg-slate-700'}`}/>)}</div>
             </div>
         </div>

         {/* Bottom Info - Lifted on Desktop as requested */}
         <div className="mt-auto pointer-events-auto w-full max-w-sm md:max-w-xl pb-24 md:pb-28 lg:pb-32">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`skill-${charType}`}
                variants={skillCardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`p-5 bg-black/70 backdrop-blur-md rounded-2xl border-l-4 shadow-xl ${borderColor}`}
              >
                  <div className="flex items-center gap-2 mb-2 font-bold text-white/60 text-xs md:text-sm uppercase tracking-wider">
                    <Zap size={16} className={textColor} /> 固有技能 / SKILL
                  </div>
                  <div className={`text-2xl md:text-4xl font-black ${textColor} mb-2`}>{config.skillName}</div>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed font-medium">{config.skillDescription}</p>
              </motion.div>
            </AnimatePresence>

            {/* Tips & Rules - Hidden on Mobile */}
            <div className="hidden md:flex flex-col gap-2 mt-4">
               <div className="p-3 bg-slate-900/80 backdrop-blur rounded-xl border border-white/10 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-wider">
                     <Target size={16} /> 胜利条件 / Victory Condition
                  </div>
                  <p className="text-sm text-slate-300">{config.winCondition}</p>
               </div>
               
               <div className="bg-slate-800/80 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
                  <button onClick={() => setShowTips(!showTips)} className="w-full flex justify-between items-center p-3 text-sm font-bold text-yellow-400 hover:bg-white/5 uppercase tracking-wider">
                     <div className="flex items-center gap-2"><BookOpen size={16} /> 战术指南 / TACTICAL TIPS</div>
                     {showTips ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}
                  </button>
                  <AnimatePresence>
                    {showTips && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-4 pt-0 text-sm text-slate-400 border-t border-white/10">
                           <ul className="list-disc list-inside space-y-1">
                             <li>五子连珠 或 积攒 5点 SP 获胜。</li>
                             <li>观察对手 SP 槽，预判技能释放。</li>
                             <li>灵活运用 4 分钟时限。</li>
                           </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
         </div>
      </div>

      {/* Character Selector - Floating on Right */}
      <div className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 md:gap-4 max-h-[80%] overflow-y-auto scrollbar-hide py-4 px-4 md:px-6 pointer-events-auto">
         {Object.values(CHARACTERS).map((c) => (
           <button
             key={c.type}
             onClick={() => { if(canEdit) { playSfx('click'); setChar(c.type); } }}
             disabled={!canEdit}
             className={`
                relative shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden transition-all duration-300 border-2 shadow-lg group
                ${activeChar === c.type ? `border-white scale-110 z-10 ring-4 ring-${borderColor.split('-')[1]}-500 ring-offset-4 ring-offset-black` : 'border-slate-600 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-105'}
             `}
           >
             <img src={c.icon} className="w-full h-full object-cover bg-slate-800" alt={c.name} />
             {/* Hover Name Tooltip */}
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-white text-center leading-tight px-1">{c.name.split(' ')[0]}</span>
             </div>
           </button>
         ))}
      </div>
    </div>
  );
};

export const CharacterSelectScene: React.FC<Props> = ({
  p1Char, p2Char, setP1Char, setP2Char, gameMode, onStart, onBack, isHost, isP1Ready, isP2Ready, onReady
}) => {
  // Correctly identify online modes. AI Mode is treated as "Local" flow for selection.
  const isOnline = gameMode === GameMode.OnlineHost || gameMode === GameMode.OnlineJoin;
  
  // Local Step: 0 = P1, 1 = P2
  const [localStep, setLocalStep] = useState<0 | 1>(0);

  // Determine who is actively selecting
  let activePlayer = Player.P1;
  if (!isOnline) {
      activePlayer = localStep === 0 ? Player.P1 : Player.P2;
  } else {
      activePlayer = isHost ? Player.P1 : Player.P2;
  }

  // Determine visual data
  const activeChar = activePlayer === Player.P1 ? p1Char : p2Char;
  const setActiveChar = activePlayer === Player.P1 ? setP1Char : setP2Char;
  const isMyReady = activePlayer === Player.P1 ? isP1Ready : isP2Ready;

  // Determine Opponent info for Online Mode
  const opponentPlayer = activePlayer === Player.P1 ? Player.P2 : Player.P1;
  const opponentChar = opponentPlayer === Player.P1 ? p1Char : p2Char;
  const isOpponentReady = opponentPlayer === Player.P1 ? isP1Ready : isP2Ready;
  const opponentName = CHARACTERS[opponentChar].name;

  const handleNext = () => {
      playSfx('click');
      if (!isOnline) {
          if (localStep === 0) setLocalStep(1);
          else onStart(); // Both picked
      } else {
          // Online Logic
          // BUG FIX: If Host and both are ready, proceed to Start
          if (isHost && isP1Ready && isP2Ready) {
              onStart(); 
          } else {
              // Otherwise toggle Ready
              if (onReady) onReady();
          }
      }
  };

  const handleBack = () => {
      playSfx('cancel');
      if (!isOnline && localStep === 1) {
          setLocalStep(0);
      } else {
          onBack();
      }
  };

  // Button States for Online
  const canStart = isHost && isP1Ready && isP2Ready;
  const readyButtonText = isMyReady 
      ? (canStart ? "START MISSION" : "READY! (WAITING)") 
      : "CONFIRM READY";
  
  const readyButtonIcon = canStart 
      ? <Play size={20} fill="currentColor" /> 
      : (isMyReady ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black overflow-hidden"
    >
      {/* Main Selection Area - Occupies Full Screen */}
      <AnimatePresence mode="wait">
        <motion.div 
            key={`panel-${activePlayer}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
        >
            <CharacterPanel 
               player={activePlayer} 
               charType={activeChar} 
               setChar={setActiveChar} 
               canEdit={!isMyReady} // Can't edit if ready in online
               activeChar={activeChar}
               isReady={!!isMyReady}
               gameMode={gameMode}
            />
        </motion.div>
      </AnimatePresence>

      {/* Online: Opponent Status Bar (Name Only) */}
      {isOnline && (
          <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
              <motion.div 
                key={opponentChar}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  ...(isOpponentReady ? { 
                    scale: [1, 1.05, 1], 
                    boxShadow: "0 0 30px rgba(74,222,128,0.3)" 
                  } : {})
                }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`
                   backdrop-blur-md border rounded-full px-6 py-2 flex items-center gap-4 shadow-2xl transition-colors duration-500
                   ${isOpponentReady ? 'bg-green-900/80 border-green-400' : 'bg-black/80 border-white/20'}
                `}
              >
                  <motion.div 
                    className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  >
                      <Globe size={14} /> Opponent
                  </motion.div>
                  <div className="h-4 w-px bg-white/20" />
                  <motion.div 
                    className={`font-bold font-mono text-sm flex items-center gap-2 ${isOpponentReady ? 'text-green-400' : 'text-slate-500'}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  >
                      {isOpponentReady ? <><CheckCircle2 size={14}/> READY</> : <><Loader2 size={14} className="animate-spin"/> SELECTING...</>}
                  </motion.div>
                  <div className="h-4 w-px bg-white/20" />
                  <motion.div 
                    className="text-white font-black italic tracking-wider text-lg truncate max-w-[150px]"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  >
                      {opponentName.split(' ')[0]}
                  </motion.div>
              </motion.div>
          </div>
      )}

      {/* Footer Controls */}
      <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 z-[70] flex justify-between items-end bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
         <div className="pointer-events-auto">
             <Button variant="ghost" onClick={handleBack} className="bg-black/40 text-white hover:bg-white/20 border-white/20 backdrop-blur-sm">
                <ArrowLeft size={18} /> BACK
             </Button>
         </div>
         
         <div className="pointer-events-auto">
            {isOnline ? (
                <Button 
                    variant={canStart ? "primary" : (isMyReady ? "secondary" : "primary")} 
                    onClick={handleNext}
                    className={`
                      px-8 py-3 md:px-12 md:py-4 text-lg shadow-xl transition-all duration-300
                      ${canStart ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.6)]' : ''}
                      ${isMyReady && !canStart ? 'opacity-80' : ''}
                    `}
                    icon={readyButtonIcon}
                >
                    {readyButtonText}
                </Button>
            ) : (
                <Button variant="primary" onClick={handleNext} className="px-8 py-3 md:px-12 md:py-4 text-lg shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                    {localStep === 0 ? <>PLAYER 2 SELECT <ArrowRight size={20} /></> : <>TO PIECE SELECT <ArrowRight size={20} /></>}
                </Button>
            )}
         </div>
      </div>
    </motion.div>
  );
};
