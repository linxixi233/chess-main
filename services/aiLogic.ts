
import { CellState, Player, Position, CharacterType, GameStateData } from '../types';
import { BOARD_SIZE } from '../constants';
import { CharacterSystem } from './characterRules'; // Updated Import

// --- EVALUATION CONSTANTS ---
const SCORE = {
  WIN: 1000000,
  LIVE_4: 100000, // .XXXX.
  DEAD_4: 10000,  // OXXXX.
  LIVE_3: 8000,   // .XXX.
  DEAD_3: 1000,   // OXXX.
  LIVE_2: 500,    // .XX.
  DEAD_2: 100,
  SINGLE: 10
};

const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

const evaluatePosition = (board: CellState[][], x: number, y: number, playerColor: CellState): number => {
  let totalScore = 0;
  for (const [dx, dy] of DIRS) {
    let count = 1; 
    let blockStart = 0;
    let blockEnd = 0;
    
    // Check Forward
    let i = 1;
    while (true) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) { blockEnd = 1; break; }
      const cell = board[ny][nx];
      if (cell === playerColor) count++;
      else if (cell === CellState.Empty) break;
      else { blockEnd = 1; break; }
      i++;
    }

    // Check Backward
    i = 1;
    while (true) {
      const nx = x - dx * i;
      const ny = y - dy * i;
      if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) { blockStart = 1; break; }
      const cell = board[ny][nx];
      if (cell === playerColor) count++;
      else if (cell === CellState.Empty) break;
      else { blockStart = 1; break; }
      i++;
    }

    if (count >= 5) totalScore += SCORE.WIN;
    else if (count === 4) { if (blockStart + blockEnd === 0) totalScore += SCORE.LIVE_4; else if (blockStart + blockEnd === 1) totalScore += SCORE.DEAD_4; }
    else if (count === 3) { if (blockStart + blockEnd === 0) totalScore += SCORE.LIVE_3; else if (blockStart + blockEnd === 1) totalScore += SCORE.DEAD_3; }
    else if (count === 2) { if (blockStart + blockEnd === 0) totalScore += SCORE.LIVE_2; else if (blockStart + blockEnd === 1) totalScore += SCORE.DEAD_2; }
    else if (count === 1) { totalScore += SCORE.SINGLE; }
  }
  return totalScore;
};

export const getBestMove = (game: GameStateData, aiPlayer: Player): { pos: Position, score: number } => {
  const { board, forbiddenSpot } = game;
  const aiColor = aiPlayer === Player.P1 ? CellState.Black : CellState.White;
  const humanColor = aiPlayer === Player.P1 ? CellState.White : CellState.Black;

  let bestScore = -Infinity;
  let bestMoves: Position[] = [];
  
  if (game.turnCount <= 1 && board[7][7] === CellState.Empty) return { pos: { x: 7, y: 7 }, score: 0 };

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== CellState.Empty) continue;
      if (board[y][x] === CellState.Bomb) continue;
      if (forbiddenSpot && forbiddenSpot.x === x && forbiddenSpot.y === y) continue;
      if (!hasNeighbor(board, x, y)) continue;

      const attackScore = evaluatePosition(board, x, y, aiColor);
      const defenseScore = evaluatePosition(board, x, y, humanColor);
      
      let currentScore = attackScore + (defenseScore * 0.9);
      currentScore += Math.random() * 10;

      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestMoves = [{ x, y }];
      } else if (Math.abs(currentScore - bestScore) < 1) {
        bestMoves.push({ x, y });
      }
    }
  }

  if (bestMoves.length > 0) return { pos: bestMoves[Math.floor(Math.random() * bestMoves.length)], score: bestScore };
  return { pos: { x: 7, y: 7 }, score: 0 }; 
};

const hasNeighbor = (board: CellState[][], x: number, y: number): boolean => {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        if (board[ny][nx] !== CellState.Empty) return true;
      }
    }
  }
  return false;
};

const EMOJIS = {
  GREETING: ["👀", "😎", "✨", "👋"],
  THINKING: ["🤔", "💦", "🧠", "😮"],
  CONFIDENT: ["😎", "👍", "🔥", "⚡"],
  PANIC: ["😭", "💢", "💊", "🏳️"],
  WIN: ["🤡", "👻", "❤️", "💪"],
  SKILL: ["⚡", "🔥", "🧊", "😎"]
};

export const getAiEmoji = (situation: 'start' | 'thinking' | 'move' | 'damage' | 'skill' | 'win', isWinning: boolean): string | null => {
  // REDUCED FREQUENCY: Only 15% chance to show an emoji per trigger event
  if (Math.random() > 0.15) return null; 
  
  let pool: string[] = [];
  switch (situation) {
    case 'start': pool = EMOJIS.GREETING; break;
    case 'thinking': pool = EMOJIS.THINKING; break;
    case 'move': pool = isWinning ? EMOJIS.CONFIDENT : EMOJIS.THINKING; break;
    case 'damage': pool = EMOJIS.PANIC; break;
    case 'skill': pool = EMOJIS.SKILL; break;
    case 'win': pool = EMOJIS.WIN; break;
  }
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};
