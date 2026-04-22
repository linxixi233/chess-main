
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

// Updated BGM Playlist - Merged and Deduplicated
export const BGM_PLAYLIST = [
  { id: 1, title: "Unwelcome School", url: "http://music.163.com/song/media/outer/url?id=2729007223.mp3" },
  { id: 2, title: "Hifumi Daisuki", url: "http://music.163.com/song/media/outer/url?id=2633158740.mp3" },
  { id: 3, title: "Constant Moderato", url: "http://music.163.com/song/media/outer/url?id=2668415417.mp3" },
  { id: 4, title: "Pixel Time", url: "http://music.163.com/song/media/outer/url?id=2098473565.mp3" },
  { id: 5, title: "Neon City", url: "http://music.163.com/song/media/outer/url?id=2600877270.mp3" },
  { id: 6, title: "Target for Love", url: "http://music.163.com/song/media/outer/url?id=2614868437.mp3" },
  { id: 7, title: "Blue Archive Theme", url: "http://music.163.com/song/media/outer/url?id=2099308172.mp3" },
  // Additional Tracks
  { id: 8, title: "Theme 1", url: "https://music.163.com/song/media/outer/url?id=2098477531.mp3" },
  { id: 9, title: "Theme 2", url: "https://music.163.com/song/media/outer/url?id=2729007707.mp3" },
  { id: 10, title: "Theme 3", url: "https://music.163.com/song/media/outer/url?id=2618807382.mp3" },
  { id: 11, title: "Theme 4", url: "https://music.163.com/song/media/outer/url?id=2691031168.mp3" },
  { id: 12, title: "Theme 5", url: "https://music.163.com/song/media/outer/url?id=2752825229.mp3" },
  { id: 13, title: "Theme 6", url: "https://music.163.com/song/media/outer/url?id=2683145710.mp3" },
  { id: 14, title: "Theme 7", url: "https://music.163.com/song/media/outer/url?id=2682699900.mp3" },
  { id: 15, title: "Theme 8", url: "https://music.163.com/song/media/outer/url?id=2618806608.mp3" },
];

interface BGMPlayerProps {
  muted: boolean;
  volume: number; // 0.0 to 1.0
  onTrackChange?: (trackIndex: number) => void;
}

export interface BGMHandle {
  nextTrack: () => void;
  prevTrack: () => void;
  playTrack: (index: number) => void;
  getCurrentTrackIndex: () => number;
}

export const BGMPlayer = forwardRef<BGMHandle, BGMPlayerProps>(({ muted, volume, onTrackChange }, ref) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Random start index on mount
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => Math.floor(Math.random() * BGM_PLAYLIST.length));

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    nextTrack: () => {
      const next = (currentTrackIndex + 1) % BGM_PLAYLIST.length;
      setCurrentTrackIndex(next);
    },
    prevTrack: () => {
      const prev = (currentTrackIndex - 1 + BGM_PLAYLIST.length) % BGM_PLAYLIST.length;
      setCurrentTrackIndex(prev);
    },
    playTrack: (index: number) => {
      if (index >= 0 && index < BGM_PLAYLIST.length) {
        setCurrentTrackIndex(index);
      }
    },
    getCurrentTrackIndex: () => currentTrackIndex
  }));

  // Handle Track Changes
  useEffect(() => {
    if (onTrackChange) onTrackChange(currentTrackIndex);

    const track = BGM_PLAYLIST[currentTrackIndex];
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    const audio = new Audio(track.url);
    audio.loop = false; 
    audio.volume = muted ? 0 : volume; // Initial volume
    audioRef.current = audio;

    const handleEnded = () => {
      setCurrentTrackIndex(prev => (prev + 1) % BGM_PLAYLIST.length);
    };
    audio.addEventListener('ended', handleEnded);

    const playAudio = () => {
      if (audioRef.current && !muted) {
        audioRef.current.play().catch(() => {
           // Auto-play might be blocked
        });
      }
    };

    playAudio();

    // Interaction fallback
    const handleInteraction = () => {
      playAudio();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [currentTrackIndex]);

  // Handle Volume & Mute Updates
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
      if (muted) {
        audioRef.current.pause();
      } else if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [muted, volume]);

  return null; 
});

BGMPlayer.displayName = "BGMPlayer";
