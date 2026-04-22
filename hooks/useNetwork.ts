
import { useState, useEffect, useRef, useCallback } from 'react';
import { NetworkState, GameMode, GameScene } from '../types';

const Peer = (window as any).Peer;
const ROOM_PREFIX = "SCHALE-"; 

interface UseNetworkProps {
  gameMode: GameMode;
  scene: GameScene;
  playerName: string;
  onDataReceived: (data: any) => void;
  onDisconnect: () => void;
  onChangeScene: (scene: GameScene, type?: any) => void;
  setP1Char: (c: any) => void;
  setP2Char: (c: any) => void;
  p1Char: any;
  p2Char: any;
}

export const useNetwork = ({
  gameMode,
  scene,
  playerName,
  onDataReceived,
  onDisconnect,
  onChangeScene,
  setP1Char,
  setP2Char,
  p1Char,
  p2Char
}: UseNetworkProps) => {
  const [network, setNetwork] = useState<NetworkState>({
    peerId: null,
    conn: null,
    isConnected: false,
    statusMessage: "正在连接服务器...",
    lastOpponentId: localStorage.getItem('kivotos_last_opponent') || null
  });
  
  const peerRef = useRef<any>(null);
  const onDataRef = useRef(onDataReceived);
  const onDisconnectRef = useRef(onDisconnect);

  // Keep refs fresh
  useEffect(() => { onDataRef.current = onDataReceived; }, [onDataReceived]);
  useEffect(() => { onDisconnectRef.current = onDisconnect; }, [onDisconnect]);

  const cleanupNetwork = useCallback((fullReset = true) => {
    if (network.conn) network.conn.close();
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
    setNetwork(prev => ({
      ...prev,
      peerId: null,
      conn: null,
      isConnected: false,
      statusMessage: "已断开连接",
      lastOpponentId: fullReset ? null : prev.lastOpponentId
    }));
  }, [network.conn]);

  const handleConnection = useCallback((conn: any) => {
    conn.on('open', () => {
      setNetwork(prev => ({ ...prev, conn, isConnected: true, statusMessage: "已连接!" }));
      if (conn.peerConnection) {
          conn.peerConnection.oniceconnectionstatechange = () => {
              const state = conn.peerConnection.iceConnectionState;
              if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                onDisconnectRef.current();
              }
          };
      }
      conn.send({ type: 'HANDSHAKE', name: playerName });
      localStorage.setItem('kivotos_last_opponent', conn.peer);
      
      // Auto navigation for Host/Join
      if (gameMode === GameMode.OnlineHost) {
        conn.send({ type: 'CONFIG', p1: p1Char, p2: p2Char });
        onChangeScene(GameScene.CharacterSelect, 'none');
      } else {
        onChangeScene(GameScene.CharacterSelect, 'none');
      }
    });
    
    conn.on('data', (data: any) => {
      onDataRef.current(data);
    });
    
    conn.on('close', () => onDisconnectRef.current());
    conn.on('error', (err: any) => { 
        console.error("Conn Error:", err); 
        onDisconnectRef.current(); 
    });
  }, [gameMode, playerName, p1Char, p2Char, onChangeScene]);

  const generateRoomCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  const initPeer = useCallback((customId?: string) => {
    if (peerRef.current) peerRef.current.destroy();
    if (!Peer) return;
    
    let idOption = undefined;
    if (gameMode === GameMode.OnlineHost) {
        const code = customId || generateRoomCode();
        idOption = `${ROOM_PREFIX}${code}`; 
    }
    
    const peer = idOption ? new Peer(idOption) : new Peer();
    
    peer.on('open', (id: string) => {
        setNetwork(prev => ({ ...prev, peerId: id, statusMessage: "在线 / ONLINE", isConnected: true }));
    });

    peer.on('connection', (conn: any) => handleConnection(conn));
    
    peer.on('error', (err: any) => {
        if (err.type === 'unavailable-id' && gameMode === GameMode.OnlineHost) {
            setTimeout(() => initPeer(), 500); 
        } else {
            setNetwork(prev => ({ ...prev, statusMessage: "Connection Error" }));
        }
    });
    
    peerRef.current = peer;
  }, [gameMode, handleConnection]);

  // Trigger init when entering Lobby
  useEffect(() => { 
      if (scene === GameScene.OnlineLobby) initPeer(); 
      // Cleanup on unmount/leave
      return () => {
          if (scene !== GameScene.OnlineLobby && !network.isConnected && peerRef.current) {
              // Optional: Destroy peer if leaving lobby without connecting? 
              // For now, we keep it unless explicitly cleaned up or connected.
          }
      };
  }, [scene, gameMode, initPeer]);

  // Handle unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (network.conn && network.isConnected) { 
          network.conn.send({ type: 'DISCONNECT' }); 
          network.conn.close(); 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [network.conn, network.isConnected]);

  // Actions
  const connectToHost = (inputCode: string) => { 
      if (!peerRef.current) return; 
      const cleanCode = inputCode.trim().toUpperCase(); 
      const hostId = cleanCode.startsWith(ROOM_PREFIX) ? cleanCode : `${ROOM_PREFIX}${cleanCode}`; 
      setNetwork(prev => ({ ...prev, statusMessage: "Connecting..." })); 
      const conn = peerRef.current.connect(hostId); 
      handleConnection(conn); 
  };

  const send = useCallback((data: any) => {
      if (network.conn) network.conn.send(data);
  }, [network.conn]);

  return {
      network,
      setNetwork,
      connectToHost,
      cleanupNetwork,
      send
  };
};
