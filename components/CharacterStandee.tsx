
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CharacterType, Player } from '../types';
import { CHARACTERS } from '../constants';

const CharacterStandee = memo(({ char, player, isAwakened, isTurn }: { char: CharacterType, player: Player, isAwakened: boolean, isTurn: boolean }) => {
  const config = CHARACTERS[char];
  const isP1 = player === Player.P1;
  const isSensei = char === CharacterType.Sensei;
  const isShirokoTerror = char === CharacterType.ShirokoTerror;
  
  // Generic logic: If the system says they are awakened/alternate mode, and an alternate image exists, use it.
  const src = (isAwakened && config.standeeAwakened) ? config.standeeAwakened : config.standee;
  
  return (
    <motion.div 
      className={`fixed bottom-0 ${isP1 ? 'left-[-5%]' : 'right-[-5%]'} z-[1] hidden xl:flex pointer-events-none h-[90vh] w-[45vw] items-end justify-center`}
      initial={{ opacity: 0, x: isP1 ? -100 : 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isP1 ? -100 : 100 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
       <motion.div
          animate={isTurn ? { y: [0, -20, 0] } : { y: 0 }}
          transition={isTurn ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
          className="h-full w-full flex items-end justify-center"
       >
         <img 
           src={src} 
           alt={config.name}
           className={`
             h-full w-auto max-w-full object-contain object-bottom drop-shadow-2xl 
             ${isP1 ? '' : 'scale-x-[-1]'} 
             ${isSensei ? 'origin-bottom -translate-y-60 scale-[0.55]' : ''}
             ${isShirokoTerror ? 'grayscale contrast-125 brightness-75' : ''}
           `}
           style={{ filter: `drop-shadow(0 0 ${isAwakened ? '40px' : '20px'} rgba(${isP1 ? '34, 211, 238' : '236, 72, 153'}, ${isAwakened ? 0.8 : 0.3}))` }}
           onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
         />
       </motion.div>
    </motion.div>
  );
});

export { CharacterStandee };
