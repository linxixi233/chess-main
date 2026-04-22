
import { CellState, Player, Position } from '../types';
import { BOARD_SIZE, WIN_STREAK } from '../constants';

export const createEmptyBoard = (): CellState[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CellState.Empty));
};

export const createEmptyBooleanGrid = (): boolean[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
};

export const checkWin = (
  board: CellState[][],
  player: Player
): Position[] | null => {
  const target = player === Player.P1 ? CellState.Black : CellState.White;
  
  const directions = [
    { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== target) continue;

      for (const dir of directions) {
        const winningLine: Position[] = [{ x, y }];
        let count = 1;
        for (let k = 1; k < WIN_STREAK; k++) {
          const ny = y + dir.y * k;
          const nx = x + dir.x * k;
          if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === target) {
            count++;
            winningLine.push({ x: nx, y: ny });
          } else { break; }
        }
        if (count >= WIN_STREAK) return winningLine;
      }
    }
  }
  return null;
};

export const getRandomEmptyPosition = (board: CellState[][]): Position | null => {
  const emptySpots: Position[] = [];
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === CellState.Empty) emptySpots.push({ x, y });
    });
  });
  if (emptySpots.length === 0) return null;
  return emptySpots[Math.floor(Math.random() * emptySpots.length)];
};

/**
 * Gets a random empty position within the immediate 3x3 area of the center position.
 * Used for Hoshino's Shotgun Splash.
 */
export const getRandomEmptyNeighbor = (board: CellState[][], center: Position): Position | null => {
  const neighbors: Position[] = [];
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue; // Skip center
      const ny = center.y + dy;
      const nx = center.x + dx;
      
      // Check bounds
      if (ny >= 0 && ny < BOARD_SIZE && nx >= 0 && nx < BOARD_SIZE) {
        if (board[ny][nx] === CellState.Empty) {
          neighbors.push({ x: nx, y: ny });
        }
      }
    }
  }

  if (neighbors.length === 0) return null;
  return neighbors[Math.floor(Math.random() * neighbors.length)];
};

/**
 * Checks for point generation based on the new rules:
 * - 3 or 4 in a row = 1 Skill Point.
 * - Each piece can only be counted once.
 * 
 * Returns the number of points gained and the UPDATED marked grid.
 */
export const checkPointsAndMark = (
  board: CellState[][],
  markedPieces: boolean[][],
  player: Player,
  lastMove: Position,
  isArisAwakened: boolean = false
): { pointsGained: number; newMarkedGrid: boolean[][] } => {
  const target = player === Player.P1 ? CellState.Black : CellState.White;
  const newMarked = markedPieces.map(row => [...row]);
  let points = 0;

  // Aris Advantage: Counts 2 or 3 instead of 3 or 4 when awakened
  const minStreak = isArisAwakened ? 2 : 3;
  const maxStreak = isArisAwakened ? 3 : 4;

  const directions = [
    { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }
  ];

  // We check lines passing through the last move. 
  
  for (const dir of directions) {
    // Construct the full line through this point in this direction
    const line: Position[] = [];
    
    // Go backwards
    for (let k = 1; k < 5; k++) {
      const nx = lastMove.x - dir.x * k;
      const ny = lastMove.y - dir.y * k;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === target) {
        line.unshift({ x: nx, y: ny });
      } else break;
    }
    
    // Add current
    line.push(lastMove);
    
    // Go forwards
    for (let k = 1; k < 5; k++) {
      const nx = lastMove.x + dir.x * k;
      const ny = lastMove.y + dir.y * k;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === target) {
        line.push({ x: nx, y: ny });
      } else break;
    }

    // Now we have a continuous line of stones.
    // Check if it meets criteria (length 3 or 4) AND all are unmarked.
    const len = line.length;
    
    if (len >= minStreak && len <= maxStreak) {
       // Check if ALL pieces in this streak are unmarked
       const allUnmarked = line.every(p => !newMarked[p.y][p.x]);
       
       if (allUnmarked) {
         points++;
         // Mark them as used
         line.forEach(p => {
           newMarked[p.y][p.x] = true;
         });
       }
    }
  }

  return { pointsGained: points, newMarkedGrid: newMarked };
};
