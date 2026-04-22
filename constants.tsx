
import { CharacterType, CharacterConfig, PieceTheme } from './types';

export const BOARD_SIZE = 15; 
export const WIN_STREAK = 5;

// Unified Win Condition Text
const COMMON_WIN_DESC = "积攒 5 点 SP (技能点) 或 五子连珠";

export const PIECE_THEMES: PieceTheme[] = [
  {
    id: 'default',
    name: '专属配色 (Default)', // Display name handled dynamically in UI
    gradient: '', // Dynamic
    border: '',   // Dynamic
    shadow: '',
    isDefault: true
  },
  {
    id: 'classic_black',
    name: '黑曜石 (Obsidian)',
    gradient: 'from-gray-800 to-black',
    border: 'border-gray-600',
    shadow: 'shadow-black/50'
  },
  {
    id: 'classic_white',
    name: '珍珠白 (Pearl)',
    gradient: 'from-white to-slate-200',
    border: 'border-white',
    shadow: 'shadow-white/50'
  },
  {
    id: 'gold',
    name: '黄金律 (Gold)',
    gradient: 'from-yellow-300 to-amber-500',
    border: 'border-yellow-100',
    shadow: 'shadow-amber-400/60'
  },
  {
    id: 'crimson',
    name: '深红 (Crimson)',
    gradient: 'from-red-700 to-red-950',
    border: 'border-red-500',
    shadow: 'shadow-red-600/60'
  },
  {
    id: 'emerald',
    name: '翡翠 (Emerald)',
    gradient: 'from-emerald-500 to-teal-700',
    border: 'border-emerald-300',
    shadow: 'shadow-emerald-500/60'
  }
];

export const CHARACTERS: Record<CharacterType, CharacterConfig> = {
  [CharacterType.Aris]: {
    type: CharacterType.Aris,
    name: '天童爱丽丝',
    description: '光之勇者。觉醒后解放真正的力量。',
    color: 'text-blue-500',
    skillName: '光之剑 / Key',
    skillCost: 1, 
    skillDescription: '觉醒 (1 SP): 判定点数的条件降低为2连或3连 (原为3/4)。',
    winCondition: COMMON_WIN_DESC,
    winThreshold: 5,
    // ARIS - Local resources
    icon: '/icons/爱丽丝（觉醒前）.webp',
    iconAwakened: '/icons/爱丽丝（觉醒）.webp',
    standee: '/standees/爱丽丝未觉醒.webp',
    standeeAwakened: '/standees/爱丽丝觉醒.webp',
    pieceGradientP1: 'from-cyan-300 to-blue-500',
    pieceGradientP2: 'from-slate-600 to-indigo-900',
    haloColor: 'border-cyan-400'
  },
  [CharacterType.Yuuka]: {
    type: CharacterType.Yuuka,
    name: '早濑优香 (Gym)',
    description: '会计(体操服)。精于计算，否定对手的行动。',
    color: 'text-indigo-600',
    skillName: '逻辑阻断',
    skillCost: 3, 
    skillDescription: '阻断 (3 SP): 移除对手上一步的棋子并获得额外回合。本回合不能下在移除的位置。',
    winCondition: COMMON_WIN_DESC,
    winThreshold: 5,
    // GYM YUUKA (Local resources)
    icon: '/icons/优香.webp',
    standee: '/standees/优香.webp',
    pieceGradientP1: 'from-indigo-400 to-violet-700',
    pieceGradientP2: 'from-fuchsia-600 to-purple-800', 
    haloColor: 'border-indigo-400'
  },
  [CharacterType.Yuzu]: {
    type: CharacterType.Yuzu,
    name: '花冈柚子',
    description: '游戏开发部部长。利用Bug封锁棋盘。',
    color: 'text-orange-500',
    skillName: 'Glitch Bomb',
    skillCost: 2, 
    skillDescription: '故障格 (2 SP): 封锁一个格子(4回合)并立即再下的一子。',
    winCondition: COMMON_WIN_DESC,
    winThreshold: 5,
    // YUZU (Local resources)
    icon: '/icons/柚子.webp',
    standee: '/standees/柚子.webp',
    pieceGradientP1: 'from-orange-300 to-amber-500',
    pieceGradientP2: 'from-yellow-400 to-amber-700',
    haloColor: 'border-orange-400'
  },
  [CharacterType.Midori]: {
    type: CharacterType.Midori,
    name: '才羽绿',
    description: '双胞胎画师。双倍的效率。',
    color: 'text-green-500',
    skillName: '双重作画',
    skillCost: 2,
    skillDescription: '连击 (2 SP): 本回合手写一子后，系统会自动随机落下一子。',
    winCondition: COMMON_WIN_DESC,
    winThreshold: 5,
    // MIDORI (Local resources)
    icon: '/icons/绿.webp',
    standee: '/standees/小绿.webp',
    pieceGradientP1: 'from-emerald-300 to-green-500',
    pieceGradientP2: 'from-teal-300 to-lime-500',
    haloColor: 'border-green-400'
  },
  [CharacterType.Momoi]: {
    type: CharacterType.Momoi,
    name: '才羽桃井',
    description: '双胞胎剧本。游戏玩家的力量。',
    color: 'text-pink-500',
    skillName: '灵感爆发',
    skillCost: 1,
    skillDescription: '玩小游戏 (1 SP): 胜利后随机落下两子。',
    winCondition: COMMON_WIN_DESC,
    winThreshold: 5,
    // MOMOI (Local resources)
    icon: '/icons/桃.webp',
    standee: '/standees/桃.png',
    // Adjusted Momoi colors to be lighter/more distinct pink
    pieceGradientP1: 'from-pink-200 to-rose-400',
    pieceGradientP2: 'from-rose-300 to-pink-500',
    haloColor: 'border-pink-300'
  },
  [CharacterType.Hoshino]: {
    type: CharacterType.Hoshino,
    name: '小鸟游星野',
    description: '阿拜多斯学生会会长。能在攻防之间自由切换。',
    color: 'text-pink-600',
    skillName: '战术镇压',
    skillCost: 2,
    skillDescription: '防御姿态 (2 SP): 移除对手上一子，并切换至攻击姿态。 攻击姿态 (3 SP): 下一回合落子时触发【散弹溅射】，在落子点周围 3x3 范围内随机追加一子。随后切换回防御姿态。',
    winCondition: COMMON_WIN_DESC,
    winThreshold: 5,
    // Hoshino (Local resources)
    icon: '/icons/星野.webp',
    iconAwakened: '/icons/星野.webp', // 使用同一张图标
    standee: '/standees/星野未觉醒.webp',
    standeeAwakened: '/standees/星野觉醒.webp', // 星野觉醒立绘
    pieceGradientP1: 'from-pink-400 to-rose-600',
    pieceGradientP2: 'from-rose-300 to-red-500',
    haloColor: 'border-pink-500'
  },
  [CharacterType.ShirokoTerror]: {
    type: CharacterType.ShirokoTerror,
    name: '砂狼白子 (Terror)',
    description: '她反转进入了恐怖的领域……变成了把所有生灵引入冥界的阿努比斯',
    color: 'text-slate-500',
    skillName: '色彩/维度干涉',
    skillCost: 3, 
    skillDescription: '黑障 (3 SP): 剥夺全场视野 4 回合。视野基于上一手棋：我方看5x5(两格)，敌方看十字。', // BUFFED Vision Range to 5x5
    winCondition: COMMON_WIN_DESC,
    winThreshold: 5,
    // ShirokoTerror (Local resources)
    icon: '/icons/白子（恐怖）.webp',
    standee: '/standees/恐怖白子.webp',
    pieceGradientP1: 'from-slate-700 to-slate-900',
    pieceGradientP2: 'from-zinc-600 to-zinc-900',
    haloColor: 'border-slate-500'
  },
  [CharacterType.Sensei]: {
    type: CharacterType.Sensei,
    name: '老师 (Sensei)',
    description: '大人的卡片。创造奇迹。',
    color: 'text-slate-700',
    skillName: '大人的卡片',
    skillCost: 0,
    skillDescription: '氪金 (0 SP): 概率直接获得胜利。回合数越高概率越高。',
    winCondition: '概率触发 或 5 SP',
    winThreshold: 5,
    // SENSEI - Local resources
    icon: '/icons/老师.webp',
    standee: '/standees/sensei.webp',
    pieceGradientP1: 'from-sky-200 to-blue-400',
    pieceGradientP2: 'from-slate-700 to-black',
    haloColor: 'border-sky-400'
  }
};
