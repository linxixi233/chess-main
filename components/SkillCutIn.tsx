
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterConfig } from '../types';

interface SkillCutInProps {
  character: CharacterConfig;
  isActive: boolean;
  onComplete: () => void;
  side: 'left' | 'right';
}

export const SkillCutIn: React.FC<SkillCutInProps> = ({ character, isActive, onComplete, side }) => {
  // Use a ref to track the latest onComplete callback without resetting the timer
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        onCompleteRef.current();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const isLeft = side === 'left';
  
  // Clip paths for dynamic diagonal background
  const clipInitial = isLeft 
    ? "polygon(0 0, 0 0, 0 100%, 0% 100%)"
    : "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)";
    
  const clipActive = isLeft 
    ? "polygon(0 0, 130% 0, 70% 100%, 0% 100%)" 
    : "polygon(30% 0, 100% 0, 100% 100%, -30% 100%)";

  const colorClass = isLeft ? 'bg-cyan-900/95' : 'bg-pink-900/95';
  const accentColor = isLeft ? 'bg-cyan-400' : 'bg-pink-400';
  const textColor = isLeft ? 'text-cyan-300' : 'text-pink-300';

  const imageSrc = character.standeeAwakened || character.standee;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onComplete()} // Manual skip/dismiss fallback
        >
          {/* 1. Diagonal Background Slice */}
          <motion.div 
            className={`absolute inset-0 ${colorClass} backdrop-blur-xl shadow-2xl pointer-events-none`}
            initial={{ clipPath: clipInitial }}
            animate={{ clipPath: clipActive }}
            exit={{ clipPath: clipInitial }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* 2. Scrolling Background Text (Decoration) */}
          <div className="absolute inset-0 opacity-10 flex flex-col justify-center select-none overflow-hidden pointer-events-none">
             {Array(6).fill(character.skillName).map((text, i) => (
               <div 
                key={i} 
                className="text-8xl md:text-[12rem] font-black text-white whitespace-nowrap leading-none"
                style={{ 
                  transform: `translateX(${i % 2 ? -50 : 0}px)`,
                  animation: `marquee-${isLeft ? 'left' : 'right'} ${25 + i * 2}s linear infinite` 
                }}
               >
                 {text} {text}
               </div>
             ))}
          </div>

          {/* 3. Speed Lines (Impact Effect) */}
          <motion.div 
            className={`absolute top-0 w-[60vw] h-[100vh] mix-blend-overlay opacity-20 pointer-events-none ${isLeft ? 'right-0 bg-cyan-400' : 'left-0 bg-pink-400'}`}
            initial={{ x: isLeft ? "100%" : "-100%" }}
            animate={{ x: "0%" }}
            style={{ clipPath: isLeft ? "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)" : "polygon(0 0, 60% 0, 100% 100%, 0% 100%)" }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />

          {/* 4. Character Standee - Re-adjusted for visibility */}
          <motion.div
             className={`absolute bottom-0 h-[85vh] md:h-[95vh] w-auto z-10 flex items-end pointer-events-none ${isLeft ? 'left-[-10%] md:left-[5%]' : 'right-[-10%] md:right-[5%]'}`}
             initial={{ x: isLeft ? -200 : 200, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: isLeft ? -100 : 100, opacity: 0 }}
             transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          >
             <img 
               src={imageSrc} 
               alt="Skill Standee"
               className={`h-full w-auto object-contain drop-shadow-2xl ${!isLeft ? 'scale-x-[-1]' : ''}`}
             />
          </motion.div>

          {/* 5. Skill Text Info - Positioned to avoid overlapping standee */}
          <div className={`
             absolute top-[15%] md:top-[30%] z-20 flex flex-col max-w-[60vw] md:max-w-2xl pointer-events-none
             ${isLeft ? 'right-[5%] md:right-[10%] text-right items-end' : 'left-[5%] md:left-[10%] text-left items-start'}
          `}>
             <motion.div
               initial={{ x: isLeft ? 100 : -100, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
             >
                {/* Header Label */}
                <div className={`flex items-center gap-3 mb-2 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div className={`h-1.5 w-20 md:w-32 ${accentColor} shadow-[0_0_10px_currentColor]`} />
                   <span className={`${textColor} font-mono tracking-[0.3em] uppercase text-sm md:text-xl font-bold`}>
                     Tactical Skill
                   </span>
                </div>
                
                {/* Skill Name */}
                <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] uppercase leading-[0.9] mb-6">
                  {character.skillName}
                </h2>
                
                {/* Description Box */}
                <div className={`
                  bg-black/20 p-4 md:p-8 backdrop-blur-md rounded-xl border-t border-b border-white/20
                  ${isLeft ? 'border-r-8' : 'border-l-8'} ${isLeft ? 'border-cyan-400' : 'border-pink-400'}
                  shadow-lg
                `}>
                   <p className="text-white text-base md:text-2xl font-medium leading-relaxed drop-shadow-md">
                     {character.skillDescription}
                   </p>
                </div>
             </motion.div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono animate-pulse pointer-events-none">
             TAP TO SKIP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
