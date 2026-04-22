
export enum CharacterType {
  Aris = 'Aris',
  Yuuka = 'Yuuka',
  Yuzu = 'Yuzu',
  Sensei = 'Sensei',
  Midori = 'Midori',
  Momoi = 'Momoi',
  ShirokoTerror = 'ShirokoTerror',
  Hoshino = 'Hoshino'
}

export enum Player {
  None = 0,
  P1 = 1, // Black
  P2 = 2  // White
}

export enum CellState {
  Empty = 0,
  Black = 1,
  White = 2,
  Bomb = 3
}

export enum GameScene {
  Menu,
  OnlineLobby,
  RuleScene,
  CharacterSelect,
  PieceSelect,
  Playing,
  MomoiMiniGame,
  Victory
}

export enum GameMode {
  Local = 'Local',
  OnlineHost = 'OnlineHost',
  OnlineJoin = 'OnlineJoin',
  AI = 'AI'
}

export interface NetworkState {
  peerId: string | null;
  conn: any | null; // PeerJS connection
  isConnected: boolean;
  statusMessage: string;
  lastOpponentId: string | null; // For rematch
}

export interface Position {
  x: number;
  y: number;
}

export interface PieceTheme {
  id: string;
  name: string;
  gradient: string; // Tailwind gradient classes (e.g. "from-gray-900 to-black")
  border: string;   // Halo ring / Border color class (e.g. "border-gray-500")
  shadow: string;   // Shadow color for glow (e.g. "shadow-cyan-500/50")
  isDefault?: boolean; // If true, uses character specific colors
}

export interface CharacterConfig {
  type: CharacterType;
  name: string;
  description: string;
  color: string;
  skillName: string;
  skillCost: number; 
  skillDescription: string;
  winCondition: string;
  winThreshold: number;
  
  // Visual Assets
  icon: string;            // Small square face for UI
  iconAwakened?: string;   // Alternate icon
  standee: string;         // Full body portrait for gameplay sides
  standeeAwakened?: string;// Alternate full body
  
  pieceGradientP1: string;
  pieceGradientP2: string;
  haloColor: string;
}

// --- NEW ARCHITECTURE TYPES ---

export type VictoryReason = 'standard' | 'points' | 'timeout' | 'skill' | null;

export interface BombInfo {
  x: number;
  y: number;
  turnsLeft: number;
}

export type SkillPendingEffect = 'START_RPS_MINIGAME' | null;

// New type to distinguish between Midori (Global) and Hoshino (Shotgun/Adjacent)
export type ExtraMoveType = 'none' | 'global_random' | 'adjacent_random';

export interface GameStateData {
  // Core Board State
  board: CellState[][];
  
  // Logic: Tracks which pieces have already contributed to a point (3 or 4 streak).
  markedPieces: boolean[][]; 

  currentPlayer: Player;
  turnCount: number;
  lastMove: Position | null;
  winner: Player;
  winningLine: Position[] | null;
  victoryReason: VictoryReason;

  // Points / Economy
  p1Points: number;
  p2Points: number;

  // Time (Seconds)
  p1Time: number;
  p2Time: number;

  // Character Specific Persistent State
  p1ArisAwakened: boolean;
  p2ArisAwakened: boolean;
  yuzuSkillCost: number;
  momoiLastSkillTurn: number;
  
  // Hoshino Stances (Split for mirror match support)
  p1HoshinoStance: 'defense' | 'attack';
  p2HoshinoStance: 'defense' | 'attack';
  
  // Yuzu: Active bombs tracking
  activeBombs: BombInfo[];
  
  // Yuuka: Forbidden spot for immediate turn
  forbiddenSpot: Position | null;
  
  // Shiroko Terror: Darkness Logic
  darknessTurns: number;
  darknessUser: Player;

  // Temporary Turn State
  extraMoveType: ExtraMoveType; // Replaces isDoubleMove
  isBombMode: boolean;   // Used for Yuzu
  skillUsedInCurrentTurn: boolean; 
  pendingExtraTurn: boolean; // Used for Yuuka or manual extra turns
  
  // Logic -> UI Communication (New)
  pendingEffect: SkillPendingEffect;

  // UI Triggers (Transient)
  lastPointGain: number; // How many points gained in last move (for animation)
  pointGainPlayer: Player; // Which player gained the points (for positioning animation)
}

export type GameHistory = GameStateData[];
