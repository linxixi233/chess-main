
// Simple synthesizer to avoid external asset dependencies
const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx?.state === 'suspended') {
    audioCtx.resume();
  }
};

type SoundType = 'click' | 'hover' | 'place' | 'skill' | 'win' | 'start' | 'cancel';

export const playSfx = (type: SoundType) => {
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
      case 'hover':
        // Very short, high, subtle tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, now);
        gainNode.gain.setValueAtTime(0.02, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'click':
        // Snappy crisp confirm - digital button feel
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.06);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);

        // Add harmonic for brightness
        const oscClick2 = audioCtx.createOscillator();
        const gainClick2 = audioCtx.createGain();
        oscClick2.connect(gainClick2);
        gainClick2.connect(audioCtx.destination);
        oscClick2.type = 'triangle';
        oscClick2.frequency.setValueAtTime(3000, now);
        gainClick2.gain.setValueAtTime(0.04, now);
        gainClick2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        oscClick2.start(now);
        oscClick2.stop(now + 0.04);
        break;
      
      case 'cancel':
        // Quick crisp snap - snappy negative feedback
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);

        // Add subtle click layer for crispness
        const oscCancel2 = audioCtx.createOscillator();
        const gainCancel2 = audioCtx.createGain();
        oscCancel2.connect(gainCancel2);
        gainCancel2.connect(audioCtx.destination);
        oscCancel2.type = 'triangle';
        oscCancel2.frequency.setValueAtTime(2400, now);
        gainCancel2.gain.setValueAtTime(0.05, now);
        gainCancel2.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        oscCancel2.start(now);
        oscCancel2.stop(now + 0.03);
        break;

      case 'place':
        // Clean glass-like tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'skill':
        // Brisk magical chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        
        // Add a second harmonic for richness
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1200, now);
        osc2.frequency.linearRampToValueAtTime(2400, now + 0.2);
        gain2.gain.setValueAtTime(0.05, now);
        gain2.gain.linearRampToValueAtTime(0, now + 0.3);
        osc2.start(now);
        osc2.stop(now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'start':
        // Crisp digital swipe - quick bright zap for scene transitions
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);

        // Add crisp harmonic layer
        const oscStart2 = audioCtx.createOscillator();
        const gainStart2 = audioCtx.createGain();
        oscStart2.connect(gainStart2);
        gainStart2.connect(audioCtx.destination);
        oscStart2.type = 'triangle';
        oscStart2.frequency.setValueAtTime(800, now);
        oscStart2.frequency.exponentialRampToValueAtTime(3200, now + 0.06);
        gainStart2.gain.setValueAtTime(0.08, now);
        gainStart2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        oscStart2.start(now);
        oscStart2.stop(now + 0.15);
        break;

      case 'win':
        // Major chord arpeggio - fast
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((f, i) => {
          const o = audioCtx!.createOscillator();
          const g = audioCtx!.createGain();
          o.connect(g);
          g.connect(audioCtx!.destination);
          o.type = 'triangle';
          o.frequency.value = f;
          const startTime = now + i * 0.05; // Faster arpeggio
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
          o.start(startTime);
          o.stop(startTime + 0.6);
        });
        break;
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
