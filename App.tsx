
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterType, Player, GameScene, CellState, Position, GameStateData, GameMode, PieceTheme, BombInfo, CharacterConfig } from './types';
import { CHARACTERS, PIECE_THEMES } from './constants';
import { createEmptyBoard, createEmptyBooleanGrid, checkWin, getRandomEmptyPosition, checkPointsAndMark, getRandomEmptyNeighbor } from './services/gameLogic';
import { getAiEmoji } from './services/aiLogic'; 
import { CharacterSystem } from './services/characterRules'; 
import { playSfx } from './services/sound';
import { Board } from './components/Board';
import { Button } from './components/Button';
import { SkillCutIn } from './components/SkillCutIn';
import { MomoiMinigame, RPSChoice } from './components/MomoiMinigame';
import { GeometricBackground } from './components/GeometricBackground';
import { GameBackground } from './components/GameBackground'; 
import { TransitionOverlay, TransitionType } from './components/TransitionOverlay';
import { BGMPlayer, BGM_PLAYLIST } from './components/BGMPlayer';
import { GameMenu } from './components/GameMenu';
import { LoadingScreen } from './components/LoadingScreen';
import { CharacterSelectScene } from './components/CharacterSelectScene';
import { PieceSelectScene } from './components/PieceSelectScene';
import { VictoryScene } from './components/VictoryScene';
import { TurnDecisionOverlay } from './components/TurnDecisionOverlay';
import { PlayerSidebar } from './components/PlayerSidebar'; 
import { CharacterStandee } from './components/CharacterStandee';
import { RuleScene } from './components/RuleScene'; 
import { Info, Globe, Copy, Wifi, Swords, Smile, Settings, Volume2, VolumeX, ListMusic, Disc, ArrowLeft, Cpu, User } from 'lucide-react';

// Hooks
import { useNetwork } from './hooks/useNetwork';
import { useAI } from './hooks/useAI';
import { useBGM } from './hooks/useBGM';
import { MouseSparkEffect } from './components/MouseSparkEffect';

const INITIAL_TIME_SECONDS = 240; 
const TIME_INCREMENT = 10; 
const ROOM_PREFIX = "SCHALE-"; 

const EMOJIS = ["😀", "😂", "😎", "🤔", "😭", "😡", "👍", "👎", "🔥", "✨", "👻", "❤️", "💔", "👀", "🤝", "🏳️"];

const getInitialGameState = (): GameStateData => ({
  board: createEmptyBoard(),
  markedPieces: createEmptyBooleanGrid(),
  currentPlayer: Player.P1, 
  turnCount: 1,
  lastMove: null,
  winner: Player.None,
  winningLine: null,
  victoryReason: null,
  p1Points: 0,
  p2Points: 0,
  p1Time: INITIAL_TIME_SECONDS,
  p2Time: INITIAL_TIME_SECONDS,
  p1ArisAwakened: false,
  p2ArisAwakened: false,
  yuzuSkillCost: 2, 
  momoiLastSkillTurn: -99,
  p1HoshinoStance: 'defense', // Independent Stance P1
  p2HoshinoStance: 'defense', // Independent Stance P2
  activeBombs: [],
  forbiddenSpot: null,
  darknessTurns: 0,
  darknessUser: Player.None,
  extraMoveType: 'none',
  pendingExtraTurn: false,
  isBombMode: false,
  skillUsedInCurrentTurn: false,
  pendingEffect: null, 
  lastPointGain: 0,
  pointGainPlayer: Player.None,
});

// ... (EmojiBubble, MusicWidget components kept inline for now) ...
const EmojiBubble = memo(({ emoji, isLeft, isTop }: { emoji: string | null, isLeft: boolean, isTop?: boolean }) => {
  return (
    <AnimatePresence>
      {emoji && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className={`absolute z-40 flex ${isTop ? 'top-28 left-1/2 -translate-x-1/2 justify-center' : 'bottom-36 left-1/2 -translate-x-1/2 justify-center'} xl:transform-none xl:top-auto xl:bottom-auto xl:left-auto xl:right-auto ${isLeft ? 'xl:top-1/3 xl:left-10 xl:justify-start' : 'xl:top-1/3 xl:right-10 xl:justify-end'}`}
        >
          <div className={`bg-white text-4xl p-4 shadow-2xl border-4 relative rounded-2xl ${isLeft ? (isTop ? 'border-cyan-200 xl:rounded-tl-none' : 'border-cyan-200 xl:rounded-bl-none') : (isTop ? 'border-pink-200 xl:rounded-bl-none' : 'border-pink-200 xl:rounded-bl-none')}`}>
            {emoji}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

const MusicWidget = memo(({ currentTrackIndex, isMuted, volume, onToggleMute, onVolumeChange, onNext, onSelectTrack }: any) => {
  const track = BGM_PLAYLIST[currentTrackIndex];
  const [showVolume, setShowVolume] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setShowPlaylist(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <motion.div ref={containerRef} className="absolute top-4 right-4 md:top-24 md:right-8 z-30 flex flex-col items-end gap-2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
      <div className="bg-white/80 backdrop-blur-md p-2 md:p-3 rounded-2xl border border-white/50 shadow-lg flex items-center gap-2 md:gap-3 w-auto overflow-visible relative" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
        <motion.div className={`hidden md:flex w-10 h-10 shrink-0 rounded-full bg-slate-800 items-center justify-center border-2 border-slate-200`} animate={!isMuted ? { rotate: 360 } : {}} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
            <div className="w-3 h-3 bg-white/20 rounded-full border border-white/30" />
        </motion.div>
        <div className="hidden md:block flex-1 overflow-hidden min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-slate-300' : 'bg-green-400 animate-pulse'}`} />
              Now Playing
            </div>
            <div className="text-xs font-black text-slate-700 truncate w-32">{track.title}</div>
            <AnimatePresence>
              {showVolume && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="absolute top-full left-0 right-0 pt-2 z-40">
                    <div className="bg-white/90 backdrop-blur rounded-lg p-2 shadow-xl border border-white/50 flex items-center gap-2">
                      <Volume2 size={12} className="text-slate-400" />
                      <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
        <div className="flex gap-1 shrink-0">
            <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 rounded-full transition-colors ${showPlaylist ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-200 text-slate-600'}`}><ListMusic size={16} /></button>
            <button onClick={onToggleMute} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
        </div>
      </div>
      <AnimatePresence>
        {showPlaylist && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl p-2 w-64 max-h-80 overflow-y-auto custom-scrollbar">
             {BGM_PLAYLIST.map((t, i) => (
                  <button key={t.id} onClick={() => { playSfx('click'); onSelectTrack(i); setShowPlaylist(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all mb-1 flex items-center gap-2 ${i === currentTrackIndex ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                     {i === currentTrackIndex ? <Disc size={12} className="animate-spin" /> : <div className="w-3" />}
                     <span className="truncate">{t.title}</span>
                  </button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const App = () => {
  // --- Loading State (首次加载资源) ---
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // --- UI State ---
  const [scene, setScene] = useState<GameScene>(GameScene.Menu);
  const [menuPhase, setMenuPhase] = useState<'splash' | 'main'>('splash');
  const [lobbyPhase, setLobbyPhase] = useState<'name' | 'actions'>('name'); 
  const [transitioning, setTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('heavy');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  
  // --- Game Settings ---
  const [p1Char, setP1Char] = useState<CharacterType>(CharacterType.Aris);
  const [p2Char, setP2Char] = useState<CharacterType>(CharacterType.Yuuka);
  const [p1Theme, setP1Theme] = useState<PieceTheme>(PIECE_THEMES[0]);
  const [p2Theme, setP2Theme] = useState<PieceTheme>(PIECE_THEMES[0]);
  const [isP1Ready, setIsP1Ready] = useState(false);
  const [isP2Ready, setIsP2Ready] = useState(false);
  const [rematchState, setRematchState] = useState({ p1: false, p2: false });
  const [playerName, setPlayerName] = useState("Sensei");
  const [opponentName, setOpponentName] = useState("Opponent");
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.Local);
  const [joinIdInput, setJoinIdInput] = useState("");

  // --- Game Data ---
  const [game, setGame] = useState<GameStateData>(getInitialGameState());
  const [history, setHistory] = useState<GameStateData[]>([]); 
  const gameRef = useRef(game);
  useEffect(() => { gameRef.current = game; }, [game]);

  const [p1Emoji, setP1Emoji] = useState<string | null>(null);
  const [p2Emoji, setP2Emoji] = useState<string | null>(null);
  const [showSkillCutIn, setShowSkillCutIn] = useState(false);
  const [skillUser, setSkillUser] = useState<Player>(Player.None);
  const [activeSkillConfig, setActiveSkillConfig] = useState<CharacterConfig | null>(null); // NEW: Snapshot for CutIn
  const [showTurnDecision, setShowTurnDecision] = useState(false);
  const [startDecisionPlayer, setStartDecisionPlayer] = useState<Player>(Player.P1);
  const [showStartTip, setShowStartTip] = useState(false);
  const [rpsChoice, setRpsChoice] = useState<RPSChoice | null>(null);
  const [opponentRpsChoice, setOpponentRpsChoice] = useState<RPSChoice | null>(null);

  // --- Hooks ---
  const bgm = useBGM();
  const isOnline = gameMode !== GameMode.Local && gameMode !== GameMode.AI;
  const isGameScene = scene === GameScene.Playing || scene === GameScene.MomoiMiniGame || scene === GameScene.Victory;

  // Optimized Scene Change Logic
  const changeScene = useCallback((newScene: GameScene, type: TransitionType | 'none' = 'light') => {
    if (type === 'none') { setScene(newScene); return; }
    setTransitionType(type);
    setTransitioning(true);
    playSfx('start'); 
    const duration = type === 'heavy' ? 600 : 400; 
    setTimeout(() => {
        setScene(newScene);
        setTimeout(() => { setTransitioning(false); }, 100); 
    }, duration); 
  }, []);

  // --- Helper Methods ---
  const saveHistory = () => { setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameRef.current))]); };
  const getCurrentChar = useCallback((player: Player) => player === Player.P1 ? p1Char : p2Char, [p1Char, p2Char]);
  
  const getIconForPlayer = useCallback((player: Player) => {
    const char = getCurrentChar(player);
    const config = CharacterSystem.getDynamicConfig(char, game, player);
    return config.icon;
  }, [game, getCurrentChar]);

  const getViewPlayer = useCallback((): Player => {
    if (gameMode === GameMode.OnlineHost) return Player.P1;
    if (gameMode === GameMode.OnlineJoin) return Player.P2;
    if (gameMode === GameMode.AI) return Player.P1;
    if (gameMode === GameMode.Local) return game.currentPlayer;
    return Player.None;
  }, [gameMode, game.currentPlayer]);

  // --- Core Game Logic ---
  const checkPointWin = (state: GameStateData): GameStateData => {
    const p1Config = CHARACTERS[p1Char];
    const p2Config = CHARACTERS[p2Char];
    if (p1Config.type !== CharacterType.Sensei && state.p1Points >= p1Config.winThreshold) return { ...state, winner: Player.P1, victoryReason: 'points' };
    if (p2Config.type !== CharacterType.Sensei && state.p2Points >= p2Config.winThreshold) return { ...state, winner: Player.P2, victoryReason: 'points' };
    return state;
  };

  const finalizeTurn = (currentState: GameStateData): GameStateData => {
    let state = { ...currentState };
    if (state.activeBombs.length > 0) {
        let newBombs: BombInfo[] = [];
        let bombRemoved = false;
        let newBoard = state.board.map(r => [...r]);
        state.activeBombs.forEach(bomb => {
            if (bomb.turnsLeft > 1) { newBombs.push({ ...bomb, turnsLeft: bomb.turnsLeft - 1 }); } 
            else if (newBoard[bomb.y][bomb.x] === CellState.Bomb) { newBoard[bomb.y][bomb.x] = CellState.Empty; bombRemoved = true; }
        });
        if (bombRemoved) state.board = newBoard;
        state.activeBombs = newBombs;
    }
    if (state.darknessTurns > 0) {
        state.darknessTurns -= 1;
        if (state.darknessTurns === 0) state.darknessUser = Player.None;
    }
    if (state.pendingExtraTurn) {
        state.pendingExtraTurn = false; 
        state.turnCount += 1;
        state.skillUsedInCurrentTurn = false; 
        state.currentPlayer === Player.P1 ? state.p1Time += 5 : state.p2Time += 5;
        return state;
    }
    state.currentPlayer === Player.P1 ? state.p1Time += TIME_INCREMENT : state.p2Time += TIME_INCREMENT;
    state.forbiddenSpot = null; 
    state.currentPlayer = state.currentPlayer === Player.P1 ? Player.P2 : Player.P1;
    state.turnCount += 1;
    state.skillUsedInCurrentTurn = false;
    return state;
  };

  const performRestart = useCallback((startPlayer: Player) => {
      const newState = getInitialGameState();
      newState.currentPlayer = startPlayer;
      setGame(newState);
      setHistory([]);
      setRematchState({ p1: false, p2: false });
      setStartDecisionPlayer(startPlayer);
      setShowTurnDecision(true);
      changeScene(GameScene.Playing, 'heavy');
      playSfx('start');
  }, [changeScene]);

  // --- Network Logic (Extracted) ---
  // We define handleNetworkData first as it's passed to the hook
  const handleNetworkData = useCallback((data: any) => {
    if (data.type === 'DISCONNECT') handleRemoteDisconnect();
    else if (data.type === 'HANDSHAKE') {
       setOpponentName(data.name);
       if (network.network.conn?.peer) {
          localStorage.setItem('kivotos_last_opponent', network.network.conn.peer);
          network.setNetwork(prev => ({ ...prev, lastOpponentId: network.network.conn.peer }));
       }
    }
    else if (data.type === 'CONFIG') { setP1Char(data.p1); setP2Char(data.p2); if(scene !== GameScene.CharacterSelect && scene !== GameScene.PieceSelect && scene !== GameScene.Playing) changeScene(GameScene.CharacterSelect, 'none'); } 
    else if (data.type === 'READY') { const isReadyState = data.state !== undefined ? data.state : true; if (data.player === 'p1') setIsP1Ready(isReadyState); else setIsP2Ready(isReadyState); playSfx('click'); }
    else if (data.type === 'START_GAME') { performRestart(data.startPlayer || Player.P1); } 
    else if (data.type === 'UPDATE_CHARS') { if (data.target === 'p1') setP1Char(data.char); if (data.target === 'p2') setP2Char(data.char); } 
    else if (data.type === 'UPDATE_THEME') { const theme = PIECE_THEMES.find(t => t.id === data.themeId) || PIECE_THEMES[0]; if (data.target === 'p1') setP1Theme(theme); if (data.target === 'p2') setP2Theme(theme); } 
    else if (data.type === 'MOVE') handleCellClick(data.pos, true);
    else if (data.type === 'SKILL') triggerSkill(data.player, true);
    else if (data.type === 'SYNC_STATE') setGame(prev => ({ ...prev, ...data.state }));
    else if (data.type === 'REMATCH_REQUEST') {
       setRematchState(prev => {
          const newState = { ...prev, [gameMode === GameMode.OnlineHost ? 'p2' : 'p1']: true };
          if (gameMode === GameMode.OnlineHost && newState.p1 && newState.p2) {
              const startPlayer = Math.random() < 0.5 ? Player.P1 : Player.P2;
              network.send({ type: 'RESTART', startPlayer });
              setTimeout(() => { network.send({ type: 'START_GAME', startPlayer }); performRestart(startPlayer); }, 100);
          }
          return newState;
       });
    }
    else if (data.type === 'RESTART') performRestart(data.startPlayer || Player.P1);
    else if (data.type === 'EMOJI') { playSfx('hover'); if (gameMode === GameMode.OnlineHost) { setP2Emoji(data.emoji); setTimeout(() => setP2Emoji(null), 2500); } else { setP1Emoji(data.emoji); setTimeout(() => setP1Emoji(null), 2500); } } 
    else if (data.type === 'SCENE_CHANGE') { if (data.scene === 'PieceSelect') changeScene(GameScene.PieceSelect, 'none'); } 
    else if (data.type === 'RPS_START') { setRpsChoice(null); setOpponentRpsChoice(null); changeScene(GameScene.MomoiMiniGame, 'light'); } 
    else if (data.type === 'RPS_CHOICE') { setOpponentRpsChoice(data.choice); }
  }, [scene, gameMode, /* handleCellClick, triggerSkill */]); // Circular deps handled below via ref/hoisting

  const handleRemoteDisconnect = useCallback(() => {
      if (scene === GameScene.OnlineLobby || scene === GameScene.Menu) return;
      alert("对方已断开连接 / Opponent Disconnected");
      network.cleanupNetwork(false); 
      setGame(getInitialGameState());
      setScene(GameScene.OnlineLobby);
  }, [scene]);

  const network = useNetwork({
    gameMode, scene, playerName,
    onDataReceived: handleNetworkData,
    onDisconnect: handleRemoteDisconnect,
    onChangeScene: changeScene,
    setP1Char, setP2Char, p1Char, p2Char
  });

  // --- Strict Disconnect for Manual Navigation ---
  const handleExitOnline = useCallback(() => {
    if (isOnline) {
      network.send({ type: 'DISCONNECT' });
      network.cleanupNetwork(true);
      setGame(getInitialGameState());
      setGameMode(GameMode.Local); // Reset mode
      changeScene(GameScene.Menu, 'heavy');
    } else {
      changeScene(GameScene.Menu, 'heavy');
    }
  }, [isOnline, network, changeScene]);

  // --- Skill & Move Logic ---
  const applySkillEffect = useCallback((user: Player, isRemote: boolean = false) => {
    saveHistory(); 
    const charType = getCurrentChar(user);
    const logic = CharacterSystem.getLogic(charType);
    const cost = logic.getCost(gameRef.current, user);

    setGame(prev => {
      const costPaidState = { ...prev };
      if (user === Player.P1) costPaidState.p1Points = Math.max(0, costPaidState.p1Points - cost);
      else costPaidState.p2Points = Math.max(0, costPaidState.p2Points - cost);
      costPaidState.skillUsedInCurrentTurn = true;
      let finalState = logic.executeSkill(costPaidState, user);

      if (finalState.pendingEffect === 'START_RPS_MINIGAME') {
          finalState.pendingEffect = null;
          const isMySkill = gameMode === GameMode.Local || (gameMode === GameMode.OnlineHost && user === Player.P1) || (gameMode === GameMode.OnlineJoin && user === Player.P2) || (gameMode === GameMode.AI && user === Player.P1);
          setRpsChoice(null);
          setOpponentRpsChoice(null);
          if (gameMode === GameMode.AI && user === Player.P2) {
              setScene(GameScene.MomoiMiniGame);
              setTimeout(() => { setOpponentRpsChoice(['rock','paper','scissors'][Math.floor(Math.random()*3)] as RPSChoice); }, 1000);
          } else if (gameMode !== GameMode.Local) {
              setScene(GameScene.MomoiMiniGame);
              if (!isRemote) network.send({ type: 'RPS_START' }); 
          } else {
              if (isMySkill) setScene(GameScene.MomoiMiniGame);
          }
      }
      if (!isRemote && isOnline) network.send({ type: 'SYNC_STATE', state: finalState });
      return finalState;
    });
  }, [getCurrentChar, gameMode, network.send, isOnline]); 

  const triggerSkill = useCallback((player: Player, isRemote: boolean = false) => {
    if (showSkillCutIn || gameRef.current.winner !== Player.None) return;
    const char = getCurrentChar(player);
    const logic = CharacterSystem.getLogic(char);
    const canUse = logic.canUseSkill(gameRef.current, player);
    const cost = logic.getCost(gameRef.current, player);
    const points = player === Player.P1 ? gameRef.current.p1Points : gameRef.current.p2Points;
    
    // Check if skill is allowed AND funds are sufficient
    if (gameRef.current.skillUsedInCurrentTurn || !canUse.allowed || points < cost) { 
        if(!isRemote) playSfx('cancel'); 
        return; 
    }
    
    if (isOnline && !isRemote) network.send({ type: 'SKILL', player });
    
    // SNAPSHOT the configuration BEFORE applying effects (which might change state/stance)
    const configSnapshot = CharacterSystem.getDynamicConfig(char, gameRef.current, player);
    setActiveSkillConfig(configSnapshot);

    setSkillUser(player);
    setShowSkillCutIn(true);
    playSfx('skill');
    applySkillEffect(player, isRemote);
  }, [gameMode, showSkillCutIn, applySkillEffect, isOnline, getCurrentChar, network.send]);

  const handleCellClick = useCallback((pos: Position, isRemote: boolean = false) => {
    const currentState = gameRef.current;
    if (currentState.winner !== Player.None) return;
    if (isOnline && !isRemote) {
        if (gameMode === GameMode.OnlineHost && currentState.currentPlayer !== Player.P1) return;
        if (gameMode === GameMode.OnlineJoin && currentState.currentPlayer !== Player.P2) return;
    }
    if (gameMode === GameMode.AI && currentState.currentPlayer === Player.P2 && !isRemote) return;
    if (currentState.board[pos.y][pos.x] !== CellState.Empty) { if(!isRemote) playSfx('cancel'); return; }
    if (currentState.forbiddenSpot && currentState.forbiddenSpot.x === pos.x && currentState.forbiddenSpot.y === pos.y) { if(!isRemote) playSfx('cancel'); return; }

    if (isOnline && !isRemote) network.send({ type: 'MOVE', pos });
    playSfx('place');
    saveHistory();

    let nextState = JSON.parse(JSON.stringify(currentState));
    nextState.lastPointGain = 0;
    nextState.pointGainPlayer = Player.None; 
    
    if (nextState.isBombMode) {
      const newBoard = nextState.board.map((r: any) => [...r]);
      newBoard[pos.y][pos.x] = CellState.Bomb;
      nextState.board = newBoard;
      nextState.isBombMode = false;
      nextState.activeBombs.push({ x: pos.x, y: pos.y, turnsLeft: 4 }); 
      setGame(nextState);
      if (isOnline && !isRemote) network.send({ type: 'SYNC_STATE', state: nextState });
      return;
    }

    const piece = currentState.currentPlayer === Player.P1 ? CellState.Black : CellState.White;
    let newBoard = nextState.board.map((r: any) => [...r]);
    newBoard[pos.y][pos.x] = piece;
    nextState.board = newBoard;
    nextState.lastMove = pos;

    let winLine = checkWin(newBoard, currentState.currentPlayer);
    if (winLine) {
      nextState.winningLine = winLine;
      nextState.winner = currentState.currentPlayer;
      nextState.victoryReason = 'standard';
      playSfx('win');
      setGame(nextState);
      if (isOnline && !isRemote) network.send({ type: 'SYNC_STATE', state: nextState });
      return;
    }

    const isAris = (currentState.currentPlayer === Player.P1 ? p1Char : p2Char) === CharacterType.Aris;
    const isCurrentArisAwakened = currentState.currentPlayer === Player.P1 ? nextState.p1ArisAwakened : nextState.p2ArisAwakened;
    let result = checkPointsAndMark(newBoard, nextState.markedPieces, currentState.currentPlayer, pos, isAris && isCurrentArisAwakened);

    if (result.pointsGained > 0) {
       nextState.markedPieces = result.newMarkedGrid;
       nextState.lastPointGain = result.pointsGained;
       nextState.pointGainPlayer = currentState.currentPlayer;
       currentState.currentPlayer === Player.P1 ? nextState.p1Points += result.pointsGained : nextState.p2Points += result.pointsGained;
       playSfx('skill'); 
       nextState = checkPointWin(nextState);
       if (nextState.winner !== Player.None) {
          playSfx('win');
          setGame(nextState);
          if (isOnline && !isRemote) network.send({ type: 'SYNC_STATE', state: nextState });
          return;
       }
    }

    // Handle Extra Moves (Midori or Hoshino)
    if (nextState.extraMoveType !== 'none') {
      let secondaryPos: Position | null = null;
      
      // Midori Logic: Global Random
      if (nextState.extraMoveType === 'global_random') {
          secondaryPos = getRandomEmptyPosition(newBoard);
      } 
      // Hoshino Logic: Adjacent Random (Shotgun Splash)
      else if (nextState.extraMoveType === 'adjacent_random') {
          secondaryPos = getRandomEmptyNeighbor(newBoard, pos);
      }

      // Reset move type
      nextState.extraMoveType = 'none';

      if (secondaryPos && (!nextState.forbiddenSpot || (secondaryPos.x !== nextState.forbiddenSpot.x || secondaryPos.y !== nextState.forbiddenSpot.y))) {
          newBoard[secondaryPos.y][secondaryPos.x] = piece;
          nextState.board = newBoard;
          const winLine2 = checkWin(newBoard, currentState.currentPlayer);
          if (winLine2) {
             nextState.winningLine = winLine2;
             nextState.winner = currentState.currentPlayer;
             nextState.victoryReason = 'skill'; 
             playSfx('win');
             setGame(nextState);
             if (isOnline && !isRemote) network.send({ type: 'SYNC_STATE', state: nextState });
             return;
          }
      }
      // Sync state if secondary move happened or not (state cleared)
      if (isOnline && !isRemote) network.send({ type: 'SYNC_STATE', state: nextState });
    }
    
    nextState = finalizeTurn(nextState);
    setGame(nextState);
    if (isOnline && !isRemote) network.send({ type: 'SYNC_STATE', state: nextState });
  }, [gameMode, p1Char, p2Char, isOnline, network.send]); 

  const handleUndo = () => {
    if (game.winner !== Player.None) return;
    if (gameMode === GameMode.AI) {
        if (history.length < 2) return;
        playSfx('cancel');
        setGame(history[history.length - 2]);
        setHistory(prev => prev.slice(0, -2));
        return;
    }
    if (gameMode !== GameMode.Local || history.length === 0) return;
    playSfx('cancel');
    setGame(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  };

  // --- Effects & Timers ---
  useAI({ gameMode, scene, game, p2Char, showTurnDecision, showSkillCutIn, setP2Emoji, triggerSkill, handleCellClick });

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (scene === GameScene.Playing && game.winner === Player.None && !showTurnDecision) {
      timer = setInterval(() => {
        setGame(prev => {
           if (prev.winner !== Player.None) return prev;
           const isP1Turn = prev.currentPlayer === Player.P1;
           const newTime = isP1Turn ? prev.p1Time - 1 : prev.p2Time - 1;
           if (newTime <= 0) {
              playSfx('win');
              return { ...prev, winner: isP1Turn ? Player.P2 : Player.P1, victoryReason: 'timeout', [isP1Turn ? 'p1Time' : 'p2Time']: 0 };
           }
           return { ...prev, [isP1Turn ? 'p1Time' : 'p2Time']: newTime };
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [scene, game.winner, game.currentPlayer, showTurnDecision]);

  useEffect(() => {
     if (game.winner !== Player.None && scene === GameScene.Playing) {
        const t = setTimeout(() => {
           if (gameMode === GameMode.AI && game.winner === Player.P2) {
               const winEmoji = getAiEmoji('win', true);
               if(winEmoji) { setP2Emoji(winEmoji); setTimeout(() => setP2Emoji(null), 2500); }
           }
           changeScene(GameScene.Victory, 'none');
        }, 1500);
        return () => clearTimeout(t);
     }
  }, [game.winner, scene, gameMode, changeScene]);

  // --- Action Handlers ---
  const startLocalGame = () => { setGameMode(GameMode.Local); changeScene(GameScene.CharacterSelect, 'heavy'); };
  const startAiGame = () => { setGameMode(GameMode.AI); changeScene(GameScene.CharacterSelect, 'heavy'); };
  const startOnlineLobby = () => { setGameMode(GameMode.OnlineJoin); changeScene(GameScene.OnlineLobby, 'none'); };
  const gotoPieceSelect = () => { if (isOnline) network.send({ type: 'SCENE_CHANGE', scene: 'PieceSelect' }); changeScene(GameScene.PieceSelect, 'none'); };
  
  const handleReady = () => { 
      const isP1 = gameMode === GameMode.OnlineHost; 
      if (isP1) { setIsP1Ready(!isP1Ready); network.send({ type: 'READY', player: 'p1', state: !isP1Ready }); } 
      else { setIsP2Ready(!isP2Ready); network.send({ type: 'READY', player: 'p2', state: !isP2Ready }); } 
  };
  
  const launchBattle = () => { 
      const startPlayer = Math.random() < 0.5 ? Player.P1 : Player.P2; 
      if (isOnline && gameMode === GameMode.OnlineHost) { 
          network.send({ type: 'START_GAME', startPlayer }); 
          performRestart(startPlayer); 
      } else { performRestart(startPlayer); } 
  };

  const handleRestartRequest = () => { 
      if (!isOnline) { performRestart(Math.random() < 0.5 ? Player.P1 : Player.P2); } 
      else { 
          const isHost = gameMode === GameMode.OnlineHost; 
          if (isHost && scene === GameScene.Playing) { 
              const startPlayer = Math.random() < 0.5 ? Player.P1 : Player.P2; 
              network.send({ type: 'START_GAME', startPlayer }); performRestart(startPlayer); return; 
          } 
          network.send({ type: 'REMATCH_REQUEST' }); 
          setRematchState(prev => { 
              const newState = { ...prev, [isHost ? 'p1' : 'p2']: true }; 
              if (isHost && newState.p1 && newState.p2) { 
                  const startPlayer = Math.random() < 0.5 ? Player.P1 : Player.P2; 
                  setTimeout(() => { network.send({ type: 'START_GAME', startPlayer }); performRestart(startPlayer); }, 100); 
              } return newState; 
          }); 
      } 
  };

  const sendEmoji = (emoji: string) => {
    playSfx('click');
    setShowEmojiPicker(false);
    let isP1Side = true;
    if (gameMode === GameMode.Local || gameMode === GameMode.AI) isP1Side = game.currentPlayer === Player.P1;
    else if (gameMode === GameMode.OnlineHost) isP1Side = true;
    else if (gameMode === GameMode.OnlineJoin) isP1Side = false;
    
    if (gameMode === GameMode.AI) {
        setP1Emoji(emoji); setTimeout(() => setP1Emoji(null), 2500);
        if (Math.random() < 0.5) setTimeout(() => { const reaction = getAiEmoji('start', false); if (reaction) { setP2Emoji(reaction); setTimeout(() => setP2Emoji(null), 2500); } }, 1000);
        return;
    }
    isP1Side ? setP1Emoji(emoji) : setP2Emoji(emoji);
    setTimeout(() => isP1Side ? setP1Emoji(null) : setP2Emoji(null), 2500);
    if (isOnline) network.send({ type: 'EMOJI', emoji });
  }

  const handleMomoiResult = (win: boolean) => {
    changeScene(GameScene.Playing, 'light');
    let shouldDrop = false;
    let dropPlayer = Player.None;
    const isHumanInitiator = (gameMode === GameMode.Local) || (gameMode === GameMode.OnlineHost && skillUser === Player.P1) || (gameMode === GameMode.OnlineJoin && skillUser === Player.P2) || (gameMode === GameMode.AI && skillUser === Player.P1);
    if (isOnline && !isHumanInitiator) return;
    const isAiInitiator = gameMode === GameMode.AI && skillUser === Player.P2;
    if (isHumanInitiator) { if (win) { shouldDrop = true; dropPlayer = skillUser; } } else if (isAiInitiator) { if (!win) { shouldDrop = true; dropPlayer = Player.P2; } }
    if (shouldDrop) { const currentState = gameRef.current; let newState = JSON.parse(JSON.stringify(currentState)); const myPiece = dropPlayer === Player.P1 ? CellState.Black : CellState.White; const newBoard = newState.board; let dropped = 0; for(let i=0; i<2; i++) { const pos = getRandomEmptyPosition(newBoard); if(pos) { newBoard[pos.y][pos.x] = myPiece; dropped++; } } if(dropped > 0) playSfx('place'); const winLine = checkWin(newBoard, dropPlayer); if (winLine) { newState.winningLine = winLine; newState.winner = dropPlayer; newState.victoryReason = 'skill'; } newState = finalizeTurn(newState); setGame(newState); if (isOnline) network.send({ type: 'SYNC_STATE', state: newState }); } else { const currentState = gameRef.current; let newState = finalizeTurn(JSON.parse(JSON.stringify(currentState))); setGame(newState); if (isOnline) network.send({ type: 'SYNC_STATE', state: newState }); }
  };

  const isMyTurn = () => { if (gameMode === GameMode.AI) return game.currentPlayer === Player.P1; if (!isOnline) return true; return gameMode === GameMode.OnlineHost ? game.currentPlayer === Player.P1 : game.currentPlayer === Player.P2; };
  const getTurnStatusText = () => { if (gameMode === GameMode.AI) return game.currentPlayer === Player.P1 ? "YOUR TURN" : "AI TURN"; if (!isOnline) return game.currentPlayer === Player.P1 ? "P1 TURN" : "P2 TURN"; return isMyTurn() ? "YOUR TURN" : "OPPONENT TURN"; };
  const isLocalWinner = isOnline ? (game.winner === (gameMode === GameMode.OnlineHost ? Player.P1 : Player.P2)) : true;
  const getWinnerName = () => { if (gameMode === GameMode.AI) return game.winner === Player.P1 ? playerName : "AI (" + CHARACTERS[p2Char].name.split(' ')[0] + ")"; if (!isOnline) return game.winner === Player.P1 ? "PLAYER 1" : "PLAYER 2"; if (game.winner === Player.P1) return gameMode === GameMode.OnlineHost ? playerName : opponentName; return gameMode === GameMode.OnlineHost ? opponentName : playerName; };

  // --- Render ---
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 relative select-none">
      {/* 首次加载资源时的加载界面 */}
      <AnimatePresence>
        {!assetsLoaded && (
          <LoadingScreen onComplete={() => setAssetsLoaded(true)} />
        )}
      </AnimatePresence>
      <MouseSparkEffect
        color="45, 175, 255"
        scale={1.2}
        opacity={0.9}
        speed={1.0}
        maxTrail={12}
        enabled={true}
      />
      <div className="fixed inset-0 z-0"><GeometricBackground /></div>
      <AnimatePresence> {isGameScene && ( <motion.div key="bg-game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="fixed inset-0 z-0"> <GameBackground /> </motion.div> )} </AnimatePresence>
      <TransitionOverlay isVisible={transitioning} type={transitionType} />
      <BGMPlayer ref={bgm.ref} muted={bgm.muted} volume={bgm.volume} onTrackChange={bgm.setTrackIndex} />
      <AnimatePresence> {showTurnDecision && ( <TurnDecisionOverlay p1Char={p1Char} p2Char={p2Char} startingPlayer={startDecisionPlayer} onComplete={() => { setShowTurnDecision(false); setShowStartTip(true); setTimeout(() => setShowStartTip(false), 4000); }} /> )} </AnimatePresence>
      <AnimatePresence> {scene === GameScene.Playing && showStartTip && ( <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} transition={{ type: "spring", stiffness: 100 }} className="fixed top-16 left-0 right-0 z-[60] flex justify-center pointer-events-none"> <div className="bg-slate-900/80 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl border-2 border-yellow-400 flex items-center gap-3"> <div className="bg-yellow-400 text-black rounded-full p-1 animate-pulse"> <Info size={16} strokeWidth={3} /> </div> <div className="flex flex-col"> <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Tactical Tip</span> <span className="font-bold text-sm md:text-base">三连珠 = 获得 SP (Connect 3 to Charge)</span> </div> </div> </motion.div> )} </AnimatePresence>

      <AnimatePresence mode="wait">
        {scene === GameScene.Menu && (
          <div className="relative w-full h-full overflow-hidden">
             {menuPhase === 'splash' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer" onClick={() => setMenuPhase('main')}>
                   <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 flex flex-col items-center mb-16">
                      <div className="relative"><div className="text-[12vw] md:text-[8rem] font-black italic tracking-tighter text-cyan-500 drop-shadow-[0_4px_0_rgba(255,255,255,1)]" style={{ WebkitTextStroke: "2px white" }}>KIVOTOS</div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[2px] border-cyan-300 rounded-[100%] rotate-[-5deg] opacity-50 pointer-events-none" /></div>
                      <div className="bg-slate-800 text-white px-4 py-1 text-xl md:text-3xl font-black italic tracking-[0.2em] transform -skew-x-12 -mt-4 shadow-lg border-2 border-white">GOBANG<span className="text-cyan-400 ml-2 text-sm font-normal not-italic tracking-normal">TACTICAL SIM</span></div>
                      <div className="mt-2 text-cyan-600/50 font-mono text-xs font-bold tracking-widest">VER 1.0</div>
                   </motion.div>
                   <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-cyan-600 font-bold tracking-[0.3em] text-lg md:text-2xl">TOUCH TO START</motion.div>
                </div>
             )}
             {menuPhase === 'main' && (
                <div className="absolute inset-0 z-20 flex flex-col md:flex-row">
                   <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 p-8 pt-40 md:p-16 flex flex-col justify-start md:justify-center items-start">
                       <div className="relative">
                         <div className="text-5xl md:text-7xl font-black italic tracking-tighter text-cyan-500 drop-shadow-md" style={{ WebkitTextStroke: "1px white" }}>KIVOTOS</div>
                         <div className="text-3xl md:text-5xl font-black italic text-slate-700 -mt-2 ml-1 flex items-baseline gap-2">GOBANG<span className="text-sm text-slate-400 font-mono tracking-widest font-bold opacity-60">VER 1.0</span></div>
                         <div className="h-1 w-24 bg-cyan-400 mt-4 mb-2" />
                         <p className="text-slate-500 font-bold max-w-xs text-sm md:text-base">欢迎来到战术模拟沙盘。请选择您的作战模式。</p>
                       </div>
                   </motion.div>
                   <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex-1 flex flex-col justify-center items-end p-8 md:p-16 gap-4">
                      <div className="flex flex-col gap-4 w-full md:w-80">
                         <Button variant="schale" onClick={startAiGame} icon={<Cpu size={20} className="text-purple-500"/>}>人机对战 (PvE)</Button>
                         <Button variant="schale" onClick={startLocalGame} icon={<Swords size={20} />}>本地对战 (Local)</Button>
                         <Button variant="schale" onClick={startOnlineLobby} icon={<Globe size={20} />}>联机大厅 (Online)</Button>
                         <Button variant="schale" onClick={() => changeScene(GameScene.RuleScene, 'none')} icon={<Info size={20} />}>战术指南 (Rules)</Button>
                      </div>
                   </motion.div>
                   <MusicWidget currentTrackIndex={bgm.trackIndex} isMuted={bgm.muted} volume={bgm.volume} onToggleMute={bgm.toggleMute} onVolumeChange={bgm.setVolume} onNext={bgm.nextTrack} onSelectTrack={bgm.playTrack} />
                </div>
             )}
          </div>
        )}

        {scene === GameScene.OnlineLobby && (
           <motion.div key="lobby" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-md z-0" />
              <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 md:p-8 shrink-0"><h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3"><Globe className="fill-current" /> 联机大厅</h2><p className="text-cyan-100 text-sm font-bold opacity-80 mt-1">Global Tactical Network</p></div>
                 <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col gap-6">
                    {lobbyPhase === 'name' ? (
                      <div className="flex flex-col gap-6 justify-center flex-1">
                          <div><label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">您的昵称 / CALLSIGN</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={24} /><input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="ENTER NAME..." className="w-full pl-14 pr-6 py-4 rounded-2xl border-4 border-slate-100 bg-slate-50 text-slate-800 focus:border-cyan-400 focus:bg-white outline-none font-black text-2xl tracking-tight transition-all placeholder:text-slate-300"/></div><div className="text-xs text-slate-400 mt-2 text-right font-mono">{playerName.length}/8</div></div>
                          <div className="mt-auto"><Button variant="primary" disabled={!playerName} onClick={() => setLobbyPhase('actions')} className="w-full py-4 text-xl shadow-xl">进入大厅 / CONNECT</Button></div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6 flex-1">
                         <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100"><div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator</div><div className="text-xl font-black text-slate-700">{playerName}</div></div><div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" /></div>
                         <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => setGameMode(GameMode.OnlineHost)} className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 group text-left flex flex-col gap-2 min-h-[140px] ${gameMode === GameMode.OnlineHost ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105 z-10' : 'bg-white border-slate-200 text-slate-500 hover:border-cyan-200 hover:bg-cyan-50'}`}><div><div className="font-black uppercase tracking-wider text-sm">Create</div><div className={`text-[10px] font-bold opacity-70 ${gameMode === GameMode.OnlineHost ? 'text-cyan-100' : 'text-slate-400'}`}>Host a new room</div></div><div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wifi size={100} /></div><div className={`p-2 w-fit rounded-lg ${gameMode === GameMode.OnlineHost ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'} transition-colors mb-auto`}><Wifi size={24} className={gameMode === GameMode.OnlineHost ? 'text-white' : 'text-slate-600'} /></div></button>
                             <button onClick={() => setGameMode(GameMode.OnlineJoin)} className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 group text-left flex flex-col gap-2 min-h-[140px] ${gameMode === GameMode.OnlineJoin ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-105 z-10' : 'bg-white border-slate-200 text-slate-500 hover:border-pink-200 hover:bg-pink-50'}`}><div><div className="font-black uppercase tracking-wider text-sm">Join</div><div className={`text-[10px] font-bold opacity-70 ${gameMode === GameMode.OnlineJoin ? 'text-pink-100' : 'text-slate-400'}`}>Enter room code</div></div><div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity"><Globe size={100} /></div><div className={`p-2 w-fit rounded-lg ${gameMode === GameMode.OnlineJoin ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'} transition-colors mb-auto`}><Globe size={24} className={gameMode === GameMode.OnlineJoin ? 'text-white' : 'text-slate-600'} /></div></button>
                         </div>
                         <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 flex-1 flex flex-col justify-center items-center min-h-[180px]">
                             {gameMode === GameMode.OnlineHost ? (
                               <div className="w-full flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room Code</div>
                                   {network.network.peerId ? (
                                     <button onClick={() => { navigator.clipboard.writeText(network.network.peerId?.replace(ROOM_PREFIX, "") || ""); alert("Copied Code!"); }} className="w-full bg-white px-4 py-4 rounded-xl border-2 border-dashed border-cyan-400 font-mono text-4xl font-black text-cyan-600 hover:bg-cyan-50 transition-colors flex items-center justify-center gap-3 group"><span className="truncate">{network.network.peerId.replace(ROOM_PREFIX, "")}</span> <Copy size={24} className="text-cyan-300 group-hover:text-cyan-500" /></button>
                                   ) : (<div className="animate-pulse text-slate-300 font-black text-xl">GENERATING...</div>)}
                                   <div className="text-[10px] text-slate-400">Share this code with your opponent</div>
                               </div>
                             ) : (
                               <div className="w-full flex flex-col gap-3 animate-in fade-in zoom-in duration-300">
                                   <input type="text" value={joinIdInput} onChange={(e) => setJoinIdInput(e.target.value)} placeholder="Enter 4-Digit Code" maxLength={4} className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-pink-500 outline-none font-mono text-center font-bold text-3xl tracking-widest placeholder:text-slate-300 placeholder:text-lg placeholder:tracking-normal placeholder:font-sans transition-all focus:ring-4 focus:ring-pink-100" />
                                   <div className="flex gap-2"><Button variant="danger" className="flex-1 py-3 text-lg" disabled={joinIdInput.length < 4} onClick={() => network.connectToHost(joinIdInput)}>CONNECT</Button></div>
                               </div>
                             )}
                         </div>
                      </div>
                    )}
                 </div>
                 <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <Button variant="ghost" onClick={() => changeScene(GameScene.Menu, 'none')} className="text-xs"><ArrowLeft size={14} /> BACK</Button>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{network.network.statusMessage}</div>
                 </div>
              </div>
           </motion.div>
        )}

        {scene === GameScene.CharacterSelect && (
          <CharacterSelectScene 
            p1Char={p1Char} p2Char={p2Char} setP1Char={(c) => { setP1Char(c); if(isOnline) network.send({ type: 'UPDATE_CHARS', target: 'p1', char: c }); }} setP2Char={(c) => { setP2Char(c); if(isOnline) network.send({ type: 'UPDATE_CHARS', target: 'p2', char: c }); }}
            gameMode={gameMode} onStart={gotoPieceSelect} onBack={() => isOnline ? handleExitOnline() : changeScene(GameScene.Menu, 'none')} isHost={gameMode === GameMode.Local || gameMode === GameMode.OnlineHost || gameMode === GameMode.AI} isP1Ready={isP1Ready} isP2Ready={isP2Ready} onReady={handleReady}
          />
        )}

        {scene === GameScene.PieceSelect && (
          <PieceSelectScene 
            p1Char={p1Char} p2Char={p2Char} p1Theme={p1Theme} p2Theme={p2Theme} setP1Theme={(t) => { setP1Theme(t); if(isOnline) network.send({ type: 'UPDATE_THEME', target: 'p1', themeId: t.id }); }} setP2Theme={(t) => { setP2Theme(t); if(isOnline) network.send({ type: 'UPDATE_THEME', target: 'p2', themeId: t.id }); }}
            gameMode={gameMode} onStart={launchBattle} onBack={() => isOnline ? handleExitOnline() : changeScene(GameScene.CharacterSelect, 'none')} isHost={gameMode === GameMode.Local || gameMode === GameMode.OnlineHost || gameMode === GameMode.AI}
          />
        )}

        {scene === GameScene.Playing && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex h-full w-full relative z-10 overflow-hidden flex-col md:flex-row`}>
             <CharacterStandee char={p1Char} player={Player.P1} isAwakened={CharacterSystem.getDynamicConfig(p1Char, game, Player.P1).icon !== CHARACTERS[p1Char].icon} isTurn={game.currentPlayer === Player.P1 && game.winner === Player.None} />
             <CharacterStandee char={p2Char} player={Player.P2} isAwakened={CharacterSystem.getDynamicConfig(p2Char, game, Player.P2).icon !== CHARACTERS[p2Char].icon} isTurn={game.currentPlayer === Player.P2 && game.winner === Player.None} />
             <EmojiBubble emoji={p1Emoji} isLeft={true} isTop={false} />
             <EmojiBubble emoji={p2Emoji} isLeft={false} isTop={true} />
             <div className={`flex w-full h-full items-center justify-center transition-transform duration-300 origin-center flex-col xl:flex-row gap-0 xl:gap-8 px-2 md:px-8 py-4 md:py-0`}>
                 <div className={`order-1 md:order-1 flex justify-center w-full xl:w-auto`}>
                    <PlayerSidebar player={Player.P2} orientation="horizontal" isLeft={false} char={p2Char} theme={p2Theme} points={game.p2Points} timeLeft={game.p2Time} displayName={isOnline ? (gameMode === GameMode.OnlineHost ? opponentName : playerName) : (gameMode === GameMode.AI ? "AI - " + CHARACTERS[p2Char].name.split(' ')[0] : CHARACTERS[p2Char].name.split(' ')[0])} currentPlayer={game.currentPlayer} winner={game.winner} arisAwakened={game.p2ArisAwakened} skillUsedInCurrentTurn={game.skillUsedInCurrentTurn} turnCount={game.turnCount} yuzuSkillCost={game.yuzuSkillCost} momoiLastSkillTurn={game.momoiLastSkillTurn} lastPointGain={game.lastPointGain} pointGainPlayer={game.pointGainPlayer} triggerSkill={triggerSkill} isMySkill={gameMode === GameMode.Local || (gameMode === GameMode.OnlineJoin)} iconUrl={getIconForPlayer(Player.P2)} className="xl:hidden" />
                    <div className="hidden xl:flex"><PlayerSidebar player={Player.P1} orientation="vertical" isLeft={true} char={p1Char} theme={p1Theme} points={game.p1Points} timeLeft={game.p1Time} displayName={isOnline ? (gameMode === GameMode.OnlineHost ? opponentName : playerName) : CHARACTERS[p1Char].name.split(' ')[0]} currentPlayer={game.currentPlayer} winner={game.winner} arisAwakened={game.p1ArisAwakened} skillUsedInCurrentTurn={game.skillUsedInCurrentTurn} turnCount={game.turnCount} yuzuSkillCost={game.yuzuSkillCost} momoiLastSkillTurn={game.momoiLastSkillTurn} lastPointGain={game.lastPointGain} pointGainPlayer={game.pointGainPlayer} triggerSkill={triggerSkill} isMySkill={gameMode === GameMode.Local || (gameMode === GameMode.OnlineHost) || (gameMode === GameMode.AI)} iconUrl={getIconForPlayer(Player.P1)} /></div>
                 </div>
                 <div className={`order-2 md:order-2 relative z-20 shrink-0 flex flex-col items-center justify-center gap-4 flex-1`}>
                    <div className="relative">
                       <Board board={game.board} onCellClick={handleCellClick} lastMove={game.lastMove} winningLine={game.winningLine} isLocked={showSkillCutIn || game.winner !== Player.None || !isMyTurn()} p1Char={p1Char} p2Char={p2Char} p1Theme={p1Theme} p2Theme={p2Theme} darknessTurns={game.darknessTurns} darknessUser={game.darknessUser} currentPlayer={game.currentPlayer} viewPlayer={getViewPlayer()} />
                       {game.winner === Player.None && (<div className="absolute -top-8 md:-top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] md:text-xs px-3 py-1 rounded-full font-mono shadow-md whitespace-nowrap opacity-90 flex gap-2 z-30"><span>回合 {game.turnCount}</span><span className="opacity-50">|</span><span className={isMyTurn() ? "text-cyan-400 font-bold" : "text-pink-400 font-bold"}>{getTurnStatusText()}</span></div>)}
                    </div>
                    <div className={`hidden xl:flex items-center gap-4 bg-white/40 backdrop-blur-md p-2 rounded-full border border-white/40 shadow-lg pointer-events-auto`}>
                        <div className="relative"><Button variant="secondary" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-full w-10 h-10 flex items-center justify-center border-slate-200 shadow-sm hover:shadow-md hover:scale-105 bg-white"><Smile size={20} /></Button>{showEmojiPicker && (<div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-slate-200 grid grid-cols-4 gap-2 w-72 h-64 overflow-y-auto z-50">{EMOJIS.map(e => (<button key={e} onClick={() => sendEmoji(e)} className="text-2xl p-2 hover:bg-slate-100 rounded-lg transition">{e}</button>))}</div>)}</div><div className="w-px h-6 bg-slate-400/30" /><Button variant="secondary" onClick={() => { playSfx('click'); setShowGameMenu(true); }} className="p-2 rounded-full w-10 h-10 flex items-center justify-center border-slate-200 shadow-sm hover:shadow-md hover:scale-105 bg-white"><Settings size={20} /></Button>
                    </div>
                 </div>
                 <div className={`order-3 md:order-3 flex justify-center w-full xl:w-auto pb-safe`}>
                    <div className={`xl:hidden w-full max-w-md flex flex-col gap-2`}><PlayerSidebar player={Player.P1} orientation="horizontal" isLeft={true} char={p1Char} theme={p1Theme} points={game.p1Points} timeLeft={game.p1Time} displayName={isOnline ? (gameMode === GameMode.OnlineHost ? playerName : opponentName) : CHARACTERS[p1Char].name.split(' ')[0]} currentPlayer={game.currentPlayer} winner={game.winner} arisAwakened={game.p1ArisAwakened} skillUsedInCurrentTurn={game.skillUsedInCurrentTurn} turnCount={game.turnCount} yuzuSkillCost={game.yuzuSkillCost} momoiLastSkillTurn={game.momoiLastSkillTurn} lastPointGain={game.lastPointGain} pointGainPlayer={game.pointGainPlayer} triggerSkill={triggerSkill} isMySkill={gameMode === GameMode.Local || (gameMode === GameMode.OnlineHost) || (gameMode === GameMode.AI)} iconUrl={getIconForPlayer(Player.P1)} /><div className="flex gap-2 justify-center pointer-events-auto"><Button variant="secondary" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex-1 py-3 bg-white/90 backdrop-blur"><Smile size={20} /></Button><Button variant="secondary" onClick={() => { playSfx('click'); setShowGameMenu(true); }} className="flex-1 py-3 bg-white/90 backdrop-blur"><Settings size={20} /></Button></div>{showEmojiPicker && (<div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-slate-200 grid grid-cols-6 gap-1 w-[90%] h-48 overflow-y-auto z-50">{EMOJIS.map(e => (<button key={e} onClick={() => sendEmoji(e)} className="text-xl p-2 hover:bg-slate-100 rounded-lg transition">{e}</button>))}</div>)}</div>
                    <div className="hidden xl:flex"><PlayerSidebar player={Player.P2} orientation="vertical" isLeft={false} char={p2Char} theme={p2Theme} points={game.p2Points} timeLeft={game.p2Time} displayName={isOnline ? (gameMode === GameMode.OnlineHost ? opponentName : playerName) : (gameMode === GameMode.AI ? "AI - " + CHARACTERS[p2Char].name.split(' ')[0] : CHARACTERS[p2Char].name.split(' ')[0])} currentPlayer={game.currentPlayer} winner={game.winner} arisAwakened={game.p2ArisAwakened} skillUsedInCurrentTurn={game.skillUsedInCurrentTurn} turnCount={game.turnCount} yuzuSkillCost={game.yuzuSkillCost} momoiLastSkillTurn={game.momoiLastSkillTurn} lastPointGain={game.lastPointGain} pointGainPlayer={game.pointGainPlayer} triggerSkill={triggerSkill} isMySkill={gameMode === GameMode.Local || (gameMode === GameMode.OnlineJoin)} iconUrl={getIconForPlayer(Player.P2)} /></div>
                 </div>
             </div>
             <SkillCutIn 
               character={activeSkillConfig || CharacterSystem.getDynamicConfig(skillUser === Player.P1 ? p1Char : p2Char, game, skillUser)} 
               isActive={showSkillCutIn} 
               onComplete={() => setShowSkillCutIn(false)} 
               side={skillUser === Player.P1 ? 'left' : 'right'} 
             />
             <GameMenu isOpen={showGameMenu} onClose={() => setShowGameMenu(false)} onRestart={handleRestartRequest} onHome={() => isOnline ? handleExitOnline() : changeScene(GameScene.Menu, 'none')} onUndo={handleUndo} gameMode={gameMode} isMyTurn={isMyTurn()} canUndo={history.length > 0} bgmMuted={bgm.muted} toggleBgm={bgm.toggleMute} bgmVolume={bgm.volume} onVolumeChange={bgm.setVolume} onNextTrack={bgm.nextTrack} currentTrackIndex={bgm.trackIndex} onSelectTrack={bgm.playTrack} />
          </motion.div>
        )}
        {scene === GameScene.MomoiMiniGame && (
          <MomoiMinigame onWin={() => handleMomoiResult(true)} onFail={() => handleMomoiResult(false)} isOnline={gameMode !== GameMode.Local && gameMode !== GameMode.AI} onChoice={(c) => { if (isOnline) network.send({ type: 'RPS_CHOICE', choice: c }); }} opponentChoice={opponentRpsChoice} isInitiator={(gameMode === GameMode.OnlineHost && skillUser === Player.P1) || (gameMode === GameMode.OnlineJoin && skillUser === Player.P2) || gameMode === GameMode.Local || (gameMode === GameMode.AI && skillUser === Player.P1)} />
        )}
        {scene === GameScene.Victory && (
           <VictoryScene winner={game.winner} character={CHARACTERS[game.winner === Player.P1 ? p1Char : p2Char]} onRestart={handleRestartRequest} onHome={() => isOnline ? handleExitOnline() : changeScene(GameScene.Menu, 'none')} gameMode={gameMode} isLocalWinner={isLocalWinner} winnerName={getWinnerName()} reason={game.victoryReason} rematchState={rematchState} />
        )}
        {scene === GameScene.RuleScene && (
          <RuleScene onBack={() => changeScene(GameScene.Menu, 'none')} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
