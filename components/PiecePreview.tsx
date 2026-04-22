
import React, { memo } from 'react';
import { CharacterType, PieceTheme, Player } from '../types';
import { CHARACTERS } from '../constants';

interface PiecePreviewProps {
  char: CharacterType;
  theme: PieceTheme;
  isP1: boolean;
}

export const PiecePreview = memo(({ char, theme, isP1 }: PiecePreviewProps) => {
  const config = CHARACTERS[char];
  
  const bgGradient = theme.isDefault 
    ? (isP1 ? config.pieceGradientP1 : config.pieceGradientP2)
    : theme.gradient;
    
  const ringColor = theme.isDefault
    ? config.haloColor
    : theme.border;

  const shadow = theme.isDefault ? (isP1 ? "shadow-cyan-400/50" : "shadow-pink-400/50") : theme.shadow;

  return (
    <div className={`
      relative w-6 h-6 md:w-8 md:h-8 rounded-full shadow-lg border border-white/50 
      bg-gradient-to-br ${bgGradient}
      ${shadow ? shadow : ''}
    `}>
      <div className="absolute top-0.5 left-0.5 right-0.5 h-[40%] bg-gradient-to-b from-white/60 to-transparent rounded-full" />
      <div className={`absolute -inset-[1px] rounded-full border opacity-60 ${ringColor}`} />
    </div>
  );
});
