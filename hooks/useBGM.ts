
import { useState, useRef } from 'react';
import { BGMHandle } from '../components/BGMPlayer';

export const useBGM = () => {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.25); 
  const [trackIndex, setTrackIndex] = useState(0);
  const ref = useRef<BGMHandle>(null);

  const toggleMute = () => setMuted(prev => !prev);
  const nextTrack = () => ref.current?.nextTrack();
  const playTrack = (i: number) => ref.current?.playTrack(i);

  return {
    muted,
    volume,
    trackIndex,
    setVolume,
    setTrackIndex,
    toggleMute,
    nextTrack,
    playTrack,
    ref
  };
};
