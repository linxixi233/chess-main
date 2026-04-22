
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CellState, Position, CharacterType, PieceTheme, Player } from '../types';
import { CHARACTERS, BOARD_SIZE } from '../constants';
import { playSfx } from '../services/sound';
import { X, EyeOff } from 'lucide-react'; // Added icons

interface BoardProps {
  board: CellState[][];
  onCellClick: (pos: Position) => void;
  lastMove: Position | null;
  winningLine: Position[] | null;
  isLocked: boolean;
  p1Char: CharacterType;
  p2Char: CharacterType;
  p1Theme: PieceTheme;
  p2Theme: PieceTheme;
  // Darkness Logic Props
  darknessTurns: number;
  darknessUser: Player;
  currentPlayer: Player;
  viewPlayer: Player; // NEW: The player observing the board
}

interface CellProps {
  state: CellState;
  isLastMove: boolean;
  isWin?: boolean;
  p1Char: CharacterType;
  p2Char: CharacterType;
  p1Theme: PieceTheme;
  p2Theme: PieceTheme;
  isHidden: boolean;
}

const Cell: React.FC<CellProps> = memo(({ state, isLastMove, isWin, p1Char, p2Char, p1Theme, p2Theme, isHidden }) => {
  // If hidden by darkness, render a "fog" indicator
  // Use absolute positioning to avoid messing up the flex layout of the parent cell
  if (isHidden) {
     return (
       <div className="absolute inset-1 rounded-sm bg-slate-900/90 animate-pulse flex items-center justify-center opacity-60 z-10 pointer-events-none">
          {/* Subtle noise pattern or icon could go here, but keep it clean for "void" look */}
       </div>
     );
  }

  if (state === CellState.Empty) return null;

  const isP1 = state === CellState.Black; 
  const isBomb = state === CellState.Bomb;

  if (isBomb) {
    return (
      <motion.div 
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        style={{ willChange: 'transform' }}
        // Match the exact dimensions and shadow logic of the normal piece below
        className="w-[85%] h-[85%] z-20 rounded-full shadow-lg flex items-center justify-center border border-white/40 relative bg-gradient-to-br from-slate-800 to-black"
      >
        {/* Same highlight structure as piece */}
        <div className="absolute top-1 left-1 right-1 h-[40%] bg-gradient-to-b from-white/30 to-transparent rounded-full" />
        {/* Orange glow specific to bomb */}
        <div className="absolute -inset-[1px] md:-inset-1 rounded-full border border-orange-500 opacity-80" />
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(249,115,22,0.5)]" />
        <X size="60%" className="text-orange-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" strokeWidth={3} />
      </motion.div>
    );
  }

  // Resolve Theme Colors
  const activeTheme = isP1 ? p1Theme : p2Theme;
  const config = CHARACTERS[isP1 ? p1Char : p2Char];
  
  // If theme is 'default', fallback to character config
  const bgGradient = activeTheme.isDefault 
    ? (isP1 ? config.pieceGradientP1 : config.pieceGradientP2)
    : activeTheme.gradient;
    
  const ringColor = activeTheme.isDefault
    ? config.haloColor
    : activeTheme.border;

  const bgClass = `bg-gradient-to-br ${bgGradient}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ willChange: 'transform' }}
      className={`
        w-[85%] h-[85%] rounded-full z-20 shadow-lg relative border border-white/40 ${bgClass}
      `}
    >
      <div className="absolute top-1 left-1 right-1 h-[40%] bg-gradient-to-b from-white/60 to-transparent rounded-full" />
      <div className={`absolute -inset-[1px] md:-inset-1 rounded-full border opacity-50 ${ringColor} ${isLastMove ? 'animate-pulse' : ''}`} />
      
      {isLastMove && (
        <motion.div 
          className="absolute inset-[-4px] md:inset-[-6px] rounded-full border-2 border-white/80"
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
        </motion.div>
      )}
      
      {isWin && (
         <motion.div 
         className="absolute inset-[-6px] md:inset-[-8px] rounded-full border-2 md:border-4 border-yellow-400 z-30 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
         animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
         transition={{ duration: 0.8, repeat: Infinity }}
       />
      )}
    </motion.div>
  );
});

export const Board: React.FC<BoardProps> = memo(({ 
  board, 
  onCellClick, 
  lastMove, 
  winningLine,
  isLocked,
  p1Char,
  p2Char,
  p1Theme,
  p2Theme,
  darknessTurns,
  darknessUser,
  currentPlayer,
  viewPlayer
}) => {
  
  // --- FOG OF WAR LOGIC ---
  const isDarknessActive = darknessTurns > 0;
  
  // Calculate visible set if darkness is active
  const visibleSet = React.useMemo(() => {
    const set = new Set<string>();
    if (!isDarknessActive || !lastMove) return null; // Null means all visible

    // Determine who is viewing.
    // If viewPlayer is None (e.g. spectator or error), assume darkness affects them as passive.
    const isUser = viewPlayer === darknessUser;
    
    // Rule: User sees 5x5 (radius 2) around last move. Victim sees Cross around last move.
    
    // User Vision: 5x5
    if (isUser) {
        for(let dy = -2; dy <= 2; dy++) {
            for(let dx = -2; dx <= 2; dx++) {
                set.add(`${lastMove.x + dx},${lastMove.y + dy}`);
            }
        }
    } 
    // Victim Vision: Cross (Up, Down, Left, Right, Center)
    else {
        set.add(`${lastMove.x},${lastMove.y}`); // Center
        set.add(`${lastMove.x},${lastMove.y - 1}`); // Up
        set.add(`${lastMove.x},${lastMove.y + 1}`); // Down
        set.add(`${lastMove.x - 1},${lastMove.y}`); // Left
        set.add(`${lastMove.x + 1},${lastMove.y}`); // Right
    }
    return set;
  }, [isDarknessActive, lastMove, viewPlayer, darknessUser]);

  return (
    <div className="relative flex items-center justify-center h-full w-full">
       {/* Corner Decals (Decor) */}
       {/* Note: Corner decals still use Character Halo color to keep character identity presence */}
       <div className={`absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 rounded-tl-3xl z-0 opacity-50 ${CHARACTERS[p1Char].haloColor.replace('border-', 'border-')}`} style={{borderColor: 'currentColor'}} />
       <div className={`absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 rounded-br-3xl z-0 opacity-50 ${CHARACTERS[p2Char].haloColor}`} />

       {/* Darkness Overlay Indicator */}
       {isDarknessActive && (
          <div className="absolute top-0 right-0 left-0 -mt-10 flex justify-center z-30 pointer-events-none">
             <div className="bg-slate-900 text-slate-300 border border-slate-700 px-4 py-1 rounded-full text-xs font-mono flex items-center gap-2 animate-pulse shadow-xl">
                <EyeOff size={14} /> DARKNESS ACTIVE ({darknessTurns})
             </div>
          </div>
       )}

       {/* Main Board Container */}
       {/* PC Style: Large Glass Slab | Mobile Style: Tight & Fit */}
       <div className="relative">
          {/* Flowing Light Border Effect - OPTIMIZED: Changed from animating backgroundPosition to opacity pulse to save GPU */}
          <motion.div 
            className="absolute -inset-[2px] md:-inset-[3px] rounded-2xl md:rounded-[42px] z-[-1] blur-sm"
            style={{ 
              background: isDarknessActive 
                ? "linear-gradient(45deg, #1e293b, #475569, #1e293b, #475569)" 
                : "linear-gradient(45deg, #22d3ee, #e879f9, #22d3ee, #e879f9)",
              backgroundSize: "200% 200%",
              opacity: 0.7
            }}
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Static Glow Backing */}
          <div className={`absolute -inset-1 rounded-2xl md:rounded-[42px] blur-xl z-[-2] ${isDarknessActive ? 'bg-black/50' : 'bg-white/20'}`} />

          <div className={`
             relative backdrop-blur-md 
             p-2 md:p-8 rounded-2xl md:rounded-[40px] 
             shadow-lg md:shadow-[0_20px_60px_rgba(0,0,0,0.15)] 
             border border-white/40 md:border-white/60
             ${isDarknessActive ? 'bg-slate-900/90 border-slate-600' : 'bg-white/60 md:bg-white/40'}
             transition-colors duration-1000
          `}>
            
            {/* Grid Container */}
            <div 
              className="grid relative touch-manipulation transition-all duration-300" 
              style={{ 
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                // Mobile: Constrained tightly to fit landscape height or width
                // PC: Allowed to grow much larger for impact
                width: 'var(--board-size)',
                height: 'var(--board-size)',
              }}
            >
              {/* Inject dynamic CSS variable for size */}
              <style>{`
                 :root { 
                    --board-size: min(85vw, 60vh); 
                 }
                 @media (min-width: 768px) {
                   :root { --board-size: min(85vh, 85vw, 850px); }
                 }
              `}</style>

              {board.map((row, y) => (
                row.map((cell, x) => {
                   const isLeft = x === 0;
                   const isRight = x === BOARD_SIZE - 1;
                   const isTop = y === 0;
                   const isBottom = y === BOARD_SIZE - 1;
                   
                   // Determine visibility
                   const isHidden = isDarknessActive && visibleSet ? !visibleSet.has(`${x},${y}`) : false;

                   return (
                    <div 
                      key={`${x}-${y}`} 
                      className="relative flex items-center justify-center cursor-pointer group select-none"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      onMouseEnter={() => {
                         if(!isLocked && cell === CellState.Empty) playSfx('hover');
                      }}
                      onClick={() => {
                         if(!isLocked && cell === CellState.Empty) playSfx('place');
                         else if (isLocked || cell !== CellState.Empty) playSfx('cancel');
                         !isLocked && onCellClick({ x, y });
                      }}
                    >
                      {/* Grid Lines - In Darkness, make lines subtle but visible */}
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className={`absolute top-1/2 left-0 right-0 h-[1px] bg-slate-900/10 md:bg-slate-900/20 transform -translate-y-1/2 ${isLeft ? 'left-1/2' : ''} ${isRight ? 'right-1/2' : ''} ${isDarknessActive ? 'bg-white/20' : ''}`} />
                        <div className={`absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-900/10 md:bg-slate-900/20 transform -translate-x-1/2 ${isTop ? 'top-1/2' : ''} ${isBottom ? 'bottom-1/2' : ''} ${isDarknessActive ? 'bg-white/20' : ''}`} />
                        
                        {/* Star Points */}
                        {((x === 3 || x === 11 || x === 7) && (y === 3 || y === 11 || y === 7)) && (
                           <div className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${isDarknessActive ? 'bg-white/40' : 'bg-slate-400/50'}`} />
                        )}
                      </div>

                      {/* Hover Highlight (Cursor) */}
                      {/* Use relative z-30 to ensure it appears above the absolute fog layer (z-10) */}
                      {cell === CellState.Empty && !isLocked && (
                        <div className={`relative z-30 hidden md:block w-4 h-4 rounded-full group-hover:scale-150 transition-transform duration-200 ${isDarknessActive ? 'bg-white/60 shadow-[0_0_10px_white]' : 'bg-slate-900/10'}`} />
                      )}

                      {/* The Piece or Fog */}
                      <Cell 
                        state={cell} 
                        isLastMove={lastMove?.x === x && lastMove?.y === y}
                        isWin={winningLine?.some(p => p.x === x && p.y === y)}
                        p1Char={p1Char}
                        p2Char={p2Char}
                        p1Theme={p1Theme}
                        p2Theme={p2Theme}
                        isHidden={isHidden}
                      />
                    </div>
                  );
                })
              ))}
            </div>
          </div>
       </div>
    </div>
  );
});
