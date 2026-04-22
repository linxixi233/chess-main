
import { useEffect } from 'react';
import { GameMode, Player, GameScene, GameStateData, CharacterType } from '../types';
import { getBestMove, getAiEmoji } from '../services/aiLogic';
import { CharacterSystem } from '../services/characterRules';

interface UseAIProps {
  gameMode: GameMode;
  scene: GameScene;
  game: GameStateData;
  p2Char: CharacterType;
  showTurnDecision: boolean;
  showSkillCutIn: boolean;
  setP2Emoji: (emoji: string | null) => void;
  triggerSkill: (player: Player) => void;
  handleCellClick: (pos: {x: number, y: number}, isRemote?: boolean) => void;
}

export const useAI = ({
  gameMode,
  scene,
  game,
  p2Char,
  showTurnDecision,
  showSkillCutIn,
  setP2Emoji,
  triggerSkill,
  handleCellClick
}: UseAIProps) => {
  
  const isAiTurn = gameMode === GameMode.AI && 
                   game.currentPlayer === Player.P2 && 
                   game.winner === Player.None && 
                   !showTurnDecision && 
                   !showSkillCutIn &&
                   scene === GameScene.Playing;

  useEffect(() => {
    if (isAiTurn) {
        const thinkingTime = Math.random() * 1000 + 800;
        
        // 1. Thinking Reaction
        const emoji = getAiEmoji('thinking', false);
        if(emoji) {
            setTimeout(() => {
                 setP2Emoji(emoji); 
                 setTimeout(() => setP2Emoji(null), 2500); 
            }, 500);
        }

        const timer = setTimeout(() => {
             const aiChar = p2Char;
             const logic = CharacterSystem.getLogic(aiChar);
             
             // 2. Calculate Move
             const bestMoveResult = getBestMove(game, Player.P2); 
             
             // 3. Decide Skill
             if (logic.shouldAiUseSkill(game, Player.P2, bestMoveResult.score)) {
                 const skillEmoji = getAiEmoji('skill', false);
                 if (skillEmoji) { setP2Emoji(skillEmoji); setTimeout(() => setP2Emoji(null), 2500); }
                 triggerSkill(Player.P2);
                 return; // Wait for next effect cycle after skill state update
             }

             // 4. Execute Move
             handleCellClick(bestMoveResult.pos, true);
             
             // 5. Post-Move Reaction
             const isWinningPos = game.p2Points > game.p1Points; // Simple heuristic
             const moveEmoji = getAiEmoji('move', isWinningPos);
             if (moveEmoji) { 
                 setTimeout(() => { 
                     setP2Emoji(moveEmoji); 
                     setTimeout(() => setP2Emoji(null), 2500); 
                 }, 500); 
             }

        }, thinkingTime);

        return () => clearTimeout(timer);
    }
  }, [
      isAiTurn, 
      // Dependencies required for closure freshness
      game, p2Char, setP2Emoji, triggerSkill, handleCellClick 
  ]);
};
