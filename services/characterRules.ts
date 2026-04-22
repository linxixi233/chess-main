
import { GameStateData, Player, CharacterType, CharacterConfig, CellState, SkillPendingEffect } from '../types';
import { CHARACTERS, BOARD_SIZE } from '../constants';

// --- Helper Functions ---
const getOpponent = (p: Player) => (p === Player.P1 ? Player.P2 : Player.P1);

// Evaluate board threat (Simplified version of AI logic for Yuuka condition)
const hasHighThreat = (board: CellState[][], playerToCheck: Player): boolean => {
  const target = playerToCheck === Player.P1 ? CellState.Black : CellState.White;
  return false; 
};

// --- Interface Definition ---
export interface CharacterLogic {
  // Returns the cost of the skill at the current moment
  getCost: (game: GameStateData, player: Player) => number;
  
  // Returns the display name of the skill (can change based on stance)
  getSkillName: (game: GameStateData, player: Player) => string;
  
  // Returns the description (can change based on stance)
  getSkillDescription: (game: GameStateData, player: Player) => string;
  
  // Returns whether the skill button should be disabled and why
  canUseSkill: (game: GameStateData, player: Player) => { allowed: boolean; reason?: string };
  
  // Executes the skill and returns the NEW game state
  executeSkill: (game: GameStateData, player: Player) => GameStateData;
  
  // AI Decision Logic
  shouldAiUseSkill: (game: GameStateData, player: Player, aiScoreContext?: number) => boolean;

  // Helper to get visual config overrides (e.g. Hoshino Awakened Icon)
  getConfigOverride: (game: GameStateData, player: Player) => Partial<CharacterConfig>;
}

// --- Character Implementations ---

const ArisLogic: CharacterLogic = {
  getCost: () => CHARACTERS[CharacterType.Aris].skillCost,
  getSkillName: () => CHARACTERS[CharacterType.Aris].skillName,
  getSkillDescription: () => CHARACTERS[CharacterType.Aris].skillDescription,
  canUseSkill: (game, player) => {
    const isAwakened = player === Player.P1 ? game.p1ArisAwakened : game.p2ArisAwakened;
    if (isAwakened) return { allowed: false, reason: "已觉醒" };
    return { allowed: true };
  },
  executeSkill: (game, player) => {
    const newState = { ...game };
    if (player === Player.P1) newState.p1ArisAwakened = true;
    else newState.p2ArisAwakened = true;
    return newState;
  },
  shouldAiUseSkill: (game, player) => {
    const isAwakened = player === Player.P1 ? game.p1ArisAwakened : game.p2ArisAwakened;
    const points = player === Player.P1 ? game.p1Points : game.p2Points;
    const cost = CHARACTERS[CharacterType.Aris].skillCost;
    return !isAwakened && points >= cost;
  },
  getConfigOverride: (game, player) => {
    const isAwakened = player === Player.P1 ? game.p1ArisAwakened : game.p2ArisAwakened;
    if (isAwakened) {
        const base = CHARACTERS[CharacterType.Aris];
        return {
            icon: base.iconAwakened,
            standee: base.standeeAwakened
        };
    }
    return {};
  }
};

const YuukaLogic: CharacterLogic = {
  getCost: () => CHARACTERS[CharacterType.Yuuka].skillCost,
  getSkillName: () => CHARACTERS[CharacterType.Yuuka].skillName,
  getSkillDescription: () => CHARACTERS[CharacterType.Yuuka].skillDescription,
  canUseSkill: (game, player) => {
    if (!game.lastMove) return { allowed: false, reason: "无目标" };
    
    // CRITICAL FIX: Check if the last move belongs to the opponent.
    // If lastMove is occupied by ME (the player using skill), I cannot remove it.
    const targetCell = game.board[game.lastMove.y][game.lastMove.x];
    const myPiece = player === Player.P1 ? CellState.Black : CellState.White;
    
    if (targetCell === myPiece) {
        return { allowed: false, reason: "不可撤回己方" };
    }

    return { allowed: true };
  },
  executeSkill: (game, player) => {
    const newState = { ...game };
    if (newState.lastMove) {
      const b = newState.board.map(r => [...r]);
      b[newState.lastMove.y][newState.lastMove.x] = CellState.Empty;
      newState.board = b;
      newState.forbiddenSpot = { ...newState.lastMove };
      newState.lastMove = null; 
    }
    newState.pendingExtraTurn = true; // Grant extra turn
    return newState;
  },
  shouldAiUseSkill: (game, player, bestMoveScore) => {
    const points = player === Player.P1 ? game.p1Points : game.p2Points;
    const cost = CHARACTERS[CharacterType.Yuuka].skillCost;
    if (points < cost) return false;

    // AI FIX:
    // 1. If I am about to win (Score > 100,000), DO NOT use skill. Just win.
    // 2. Only use skill if I am threatened but not winning.
    const score = bestMoveScore || 0;
    if (score > 80000) return false; // I have a Live 4 or Win

    // Use skill if the score suggests a high threat (Defensive score) 
    // or if the opponent just made a good move (heuristic)
    // Since 'bestMoveScore' aggregates attack/defense, a moderate high score (e.g. 5000-20000) 
    // often means we are forced to block (Live 3). 
    // Using skill to delete that threat is better than blocking.
    return score > 4000 && score < 80000;
  },
  getConfigOverride: () => ({})
};

const YuzuLogic: CharacterLogic = {
  getCost: (game) => game.yuzuSkillCost, // Dynamic Cost
  getSkillName: () => CHARACTERS[CharacterType.Yuzu].skillName,
  getSkillDescription: () => CHARACTERS[CharacterType.Yuzu].skillDescription,
  canUseSkill: (game) => {
    if (game.turnCount < 5) return { allowed: false, reason: "T5 解锁" };
    return { allowed: true };
  },
  executeSkill: (game, player) => {
    return { ...game, isBombMode: true };
  },
  shouldAiUseSkill: (game, player) => {
    const points = player === Player.P1 ? game.p1Points : game.p2Points;
    const cost = game.yuzuSkillCost;
    if (points < cost) return false;

    return game.turnCount > 5 && Math.random() < 0.3;
  },
  getConfigOverride: () => ({})
};

const MidoriLogic: CharacterLogic = {
  getCost: () => CHARACTERS[CharacterType.Midori].skillCost,
  getSkillName: () => CHARACTERS[CharacterType.Midori].skillName,
  getSkillDescription: () => CHARACTERS[CharacterType.Midori].skillDescription,
  canUseSkill: () => ({ allowed: true }),
  executeSkill: (game, player) => {
    // Midori uses GLOBAL random
    return { ...game, extraMoveType: 'global_random' };
  },
  shouldAiUseSkill: (game, player) => {
    const points = player === Player.P1 ? game.p1Points : game.p2Points;
    const cost = CHARACTERS[CharacterType.Midori].skillCost;
    if (points < cost) return false;

    return Math.random() < 0.4;
  },
  getConfigOverride: () => ({})
};

const MomoiLogic: CharacterLogic = {
  getCost: () => CHARACTERS[CharacterType.Momoi].skillCost,
  getSkillName: () => CHARACTERS[CharacterType.Momoi].skillName,
  getSkillDescription: () => CHARACTERS[CharacterType.Momoi].skillDescription,
  canUseSkill: (game) => {
    if ((game.turnCount - game.momoiLastSkillTurn) < 2) return { allowed: false, reason: "冷却中" };
    return { allowed: true };
  },
  executeSkill: (game, player) => {
    return { 
      ...game, 
      momoiLastSkillTurn: game.turnCount,
      pendingEffect: 'START_RPS_MINIGAME' // Signal UI to open minigame
    };
  },
  shouldAiUseSkill: (game, player) => {
    const points = player === Player.P1 ? game.p1Points : game.p2Points;
    const cost = CHARACTERS[CharacterType.Momoi].skillCost;
    if (points < cost) return false;

    return (game.turnCount - game.momoiLastSkillTurn >= 2) && Math.random() < 0.3;
  },
  getConfigOverride: () => ({})
};

const HoshinoLogic: CharacterLogic = {
  getCost: (game, player) => {
    const stance = player === Player.P1 ? game.p1HoshinoStance : game.p2HoshinoStance;
    return stance === 'defense' ? 2 : 3;
  },
  getSkillName: (game, player) => {
    const stance = player === Player.P1 ? game.p1HoshinoStance : game.p2HoshinoStance;
    return stance === 'defense' ? "战术镇压" : "铁之霍鲁斯";
  },
  getSkillDescription: (game, player) => {
    const stance = player === Player.P1 ? game.p1HoshinoStance : game.p2HoshinoStance;
    return stance === 'defense' 
      ? "防御 (2 SP): 移除对手上一子，并切换至攻击姿态。" 
      : "攻击 (3 SP): 下一回合落子时触发【散弹溅射】，在落子点周围 3x3 范围内随机追加一子。随后切换回防御姿态。";
  },
  canUseSkill: () => ({ allowed: true }),
  executeSkill: (game, player) => {
    const newState = { ...game };
    const stance = player === Player.P1 ? newState.p1HoshinoStance : newState.p2HoshinoStance;

    if (stance === 'defense') {
        // Defense Effect: Remove Piece
        if (newState.lastMove) {
            const b = newState.board.map(r => [...r]);
            b[newState.lastMove.y][newState.lastMove.x] = CellState.Empty;
            newState.board = b;
            newState.lastMove = null;
        }
        // Switch to Attack
        if (player === Player.P1) newState.p1HoshinoStance = 'attack';
        else newState.p2HoshinoStance = 'attack';
    } else {
        // Attack Effect: Shotgun Splash (Adjacent Random)
        newState.extraMoveType = 'adjacent_random';
        // Switch back to Defense
        if (player === Player.P1) newState.p1HoshinoStance = 'defense';
        else newState.p2HoshinoStance = 'defense';
    }
    return newState;
  },
  shouldAiUseSkill: (game, player, threatScore) => {
    const points = player === Player.P1 ? game.p1Points : game.p2Points;
    const stance = player === Player.P1 ? game.p1HoshinoStance : game.p2HoshinoStance;
    const cost = stance === 'defense' ? 2 : 3;
    
    if (points < cost) return false;

    if (stance === 'defense') {
       // Use defense if threat is high
       return (threatScore || 0) > 5000;
    } else {
       // Use attack aggressively if points allow
       return Math.random() < 0.6; 
    }
  },
  getConfigOverride: (game, player) => {
    const stance = player === Player.P1 ? game.p1HoshinoStance : game.p2HoshinoStance;
    if (stance === 'attack') {
        const base = CHARACTERS[CharacterType.Hoshino];
        return {
            name: "星野 (晓之赫)",
            icon: base.iconAwakened,
            standee: base.standeeAwakened
        };
    }
    return {};
  }
};

const SenseiLogic: CharacterLogic = {
  getCost: () => CHARACTERS[CharacterType.Sensei].skillCost,
  getSkillName: () => CHARACTERS[CharacterType.Sensei].skillName,
  getSkillDescription: () => CHARACTERS[CharacterType.Sensei].skillDescription,
  canUseSkill: () => ({ allowed: true }),
  executeSkill: (game, player) => {
    // Pure logic cannot determine probability win cleanly without side effects or random seed passing.
    // Ideally random logic is in the service.
    const newState = { ...game };
    const prob = 0.01 + (newState.turnCount * 0.005); 
    if (Math.random() < prob) {
       newState.winner = player;
       newState.victoryReason = 'skill';
    }
    return newState;
  },
  shouldAiUseSkill: (game, player) => {
    // Sensei skill cost is 0, so no cost check needed strictly, but good for pattern
    const myPoints = player === Player.P1 ? game.p1Points : game.p2Points;
    const oppPoints = player === Player.P1 ? game.p2Points : game.p1Points;
    return myPoints >= 5 || oppPoints >= 4;
  },
  getConfigOverride: () => ({})
};

const ShirokoTerrorLogic: CharacterLogic = {
  getCost: () => CHARACTERS[CharacterType.ShirokoTerror].skillCost,
  getSkillName: () => CHARACTERS[CharacterType.ShirokoTerror].skillName,
  getSkillDescription: () => CHARACTERS[CharacterType.ShirokoTerror].skillDescription,
  canUseSkill: () => ({ allowed: true }),
  executeSkill: (game, player) => {
    return { ...game, darknessTurns: 4, darknessUser: player };
  },
  shouldAiUseSkill: (game, player) => {
    const points = player === Player.P1 ? game.p1Points : game.p2Points;
    const cost = CHARACTERS[CharacterType.ShirokoTerror].skillCost;
    if (points < cost) return false;

    return points >= 3;
  },
  getConfigOverride: () => ({})
};

// --- REGISTRY ---
const REGISTRY: Record<CharacterType, CharacterLogic> = {
  [CharacterType.Aris]: ArisLogic,
  [CharacterType.Yuuka]: YuukaLogic,
  [CharacterType.Yuzu]: YuzuLogic,
  [CharacterType.Midori]: MidoriLogic,
  [CharacterType.Momoi]: MomoiLogic,
  [CharacterType.Hoshino]: HoshinoLogic,
  [CharacterType.Sensei]: SenseiLogic,
  [CharacterType.ShirokoTerror]: ShirokoTerrorLogic,
};

export const CharacterSystem = {
  getLogic: (type: CharacterType): CharacterLogic => {
    return REGISTRY[type] || ArisLogic;
  },

  // Returns fully merged config for UI
  getDynamicConfig: (type: CharacterType, game: GameStateData, player: Player): CharacterConfig => {
    const logic = REGISTRY[type];
    const base = CHARACTERS[type];
    if (!logic) return base;

    const override = logic.getConfigOverride(game, player);
    const dynamicName = logic.getSkillName(game, player);
    const dynamicDesc = logic.getSkillDescription(game, player);
    const dynamicCost = logic.getCost(game, player);

    return {
      ...base,
      ...override,
      skillName: dynamicName,
      skillDescription: dynamicDesc,
      skillCost: dynamicCost
    };
  }
};
