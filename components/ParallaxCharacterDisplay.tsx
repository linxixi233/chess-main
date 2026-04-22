import React, { useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { CharacterType, Player } from '../types';
import { CHARACTERS } from '../constants';

// Ribbon color scheme per character
const RIBBON_COLORS: Record<CharacterType, { primary: string; secondary: string }> = {
  [CharacterType.Aris]: { primary: '#FFD700', secondary: '#87CEEB' },
  [CharacterType.Yuuka]: { primary: '#8B5CF6', secondary: '#C4B5FD' },
  [CharacterType.Yuzu]: { primary: '#FB923C', secondary: '#FED7AA' },
  [CharacterType.Midori]: { primary: '#34D399', secondary: '#A7F3D0' },
  [CharacterType.Momoi]: { primary: '#F472B6', secondary: '#FBCFE8' },
  [CharacterType.ShirokoTerror]: { primary: '#64748B', secondary: '#CBD5E1' },
  [CharacterType.Sensei]: { primary: '#38BDF8', secondary: '#BAE6FD' },
  [CharacterType.Hoshino]: { primary: '#FB7185', secondary: '#FECDD3' },
};

interface ParallaxCharacterDisplayProps {
  char: CharacterType;
  player: Player;
  isAwakened?: boolean;
  isTurn?: boolean;
}

const ParallaxCharacterDisplay: React.FC<ParallaxCharacterDisplayProps> = memo(({
  char,
  player,
  isAwakened = false,
  isTurn = false,
}) => {
  const config = CHARACTERS[char];
  const isP1 = player === Player.P1;
  const { primary, secondary } = RIBBON_COLORS[char];
  
  const standeeSrc = (isAwakened && config.standeeAwakened) ? config.standeeAwakened : config.standee;

  return (
    <div className={`fixed bottom-0 ${isP1 ? 'left-[-5%]' : 'right-[-5%]'} z-[1] hidden xl:flex pointer-events-none h-[90vh] w-[45vw] items-end justify-center`}>
      {/* Layer 1: Background grid pattern */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        animate={{ scale: [1, 1.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: '50%', originY: '50%' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(30deg, ${primary}22 12%, transparent 12.5%, transparent 87%, ${primary}22 87.5%, ${primary}22),
              linear-gradient(150deg, ${primary}22 12%, transparent 12.5%, transparent 87%, ${primary}22 87.5%, ${primary}22),
              linear-gradient(30deg, ${secondary}22 12%, transparent 12.5%, transparent 87%, ${secondary}22 87.5%, ${secondary}22),
              linear-gradient(150deg, ${secondary}22 12%, transparent 12.5%, transparent 87%, ${secondary}22 87.5%, ${secondary}22),
              linear-gradient(60deg, ${primary}44 0%, transparent 0%), linear-gradient(60deg, ${secondary}44 0%, transparent 0%)
            `,
            backgroundSize: '100px 100px',
            transform: 'perspective(500px) rotateX(10deg)',
          }}
        />
      </motion.div>

      {/* Layer 2: Back Ribbons */}
      <div className="absolute inset-0 overflow-hidden">
        <RibbonStripe color={primary} delay={0} speed={25} angle={30} offsetY={0} />
        <RibbonStripe color={secondary} delay={2} speed={30} angle={-30} offsetY={15} />
      </div>

      {/* Layer 3: Character Subject */}
      <motion.div
        animate={{
          scale: [1, 1.3],
          y: isTurn ? [0, -20, 0] : [0, -10, 0],
        }}
        transition={{
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          y: isTurn
            ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ originX: '50%', originY: '100%' }}
        className="h-full w-full flex items-end justify-center"
      >
        <img
          src={standeeSrc}
          alt={config.name}
          className={`
            h-full w-auto max-w-full object-contain object-bottom drop-shadow-2xl
            ${isP1 ? '' : 'scale-x-[-1]'}
            ${char === CharacterType.Sensei ? 'origin-bottom -translate-y-60 scale-[0.55]' : ''}
            ${char === CharacterType.ShirokoTerror ? 'grayscale contrast-125 brightness-75' : ''}
          `}
          style={{
            filter: `drop-shadow(0 0 ${isAwakened ? '40px' : '20px'} rgba(${isP1 ? '34, 211, 238' : '236, 72, 153'}, ${isAwakened ? 0.8 : 0.3}))`
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </motion.div>

      {/* Layer 4: Foreground Ribbons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <RibbonStripe color={primary} delay={1} speed={15} angle={30} offsetY={50} isForeground />
        <RibbonStripe color={secondary} delay={3} speed={20} angle={-30} offsetY={65} isForeground />
      </div>
    </div>
  );
});

ParallaxCharacterDisplay.displayName = 'ParallaxCharacterDisplay';

interface RibbonStripeProps {
  color: string;
  delay: number;
  speed: number;
  angle: number;
  offsetY: number;
  isForeground?: boolean;
}

const RibbonStripe: React.FC<RibbonStripeProps> = memo(({
  color,
  delay,
  speed,
  angle,
  offsetY,
  isForeground = false,
}) => {
  const ribbonRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationId: number;
    let position = 0;
    
    const animate = () => {
      if (ribbonRef.current) {
        position -= speed * 0.016;
        const ribbonWidth = ribbonRef.current.scrollWidth / 2;
        
        if (position <= -ribbonWidth) {
          position = 0;
        }
        
        ribbonRef.current.style.transform = `translateX(${position}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };
    
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, delay * 1000);
    
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, [speed, delay]);

  const radians = (angle * Math.PI) / 180;
  const diagonal = Math.sqrt(2) * 100;
  const height = Math.abs(Math.sin(radians)) * 30 + 10;

  return (
    <div
      ref={ribbonRef}
      className={`absolute left-1/2 ${isForeground ? 'z-30' : 'z-10'}`}
      style={{
        top: `${offsetY}%`,
        height: `${height}vh`,
        width: `${diagonal}vw`,
        transform: `translateX(-50%) rotate(${angle}deg)`,
        background: `linear-gradient(90deg, 
          transparent 0%, 
          ${color}33 10%, 
          ${color}66 30%, 
          ${color}99 50%, 
          ${color}66 70%, 
          ${color}33 90%, 
          transparent 100%
        )`,
        backgroundSize: '50% 100%',
        willChange: 'transform',
        mixBlendMode: isForeground ? 'screen' : 'multiply',
        opacity: isForeground ? 0.6 : 0.4,
      }}
    />
  );
});

RibbonStripe.displayName = 'RibbonStripe';

export { ParallaxCharacterDisplay };
export type { ParallaxCharacterDisplayProps } from './ParallaxCharacterDisplay';