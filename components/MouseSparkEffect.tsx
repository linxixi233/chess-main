import { useEffect, useRef, memo } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rs: number;
  s: number;
  a: number;
  f: number;
}

interface Wave {
  x: number;
  y: number;
  life: number;
  max: number;
  r: number;
  ring: {
    ang: number;
    segs: { off: number; len: number }[];
    life: number;
    maxLife: number;
    rs: number;
  };
}

interface Trail {
  x: number;
  y: number;
  life: number;
}

interface MouseSparkEffectProps {
  color?: string;
  scale?: number;
  opacity?: number;
  speed?: number;
  maxTrail?: number;
  enabled?: boolean;
}

export const MouseSparkEffect: React.FC<MouseSparkEffectProps> = memo(({
  color = '45, 175, 255', 
  scale = 1.5,
  opacity = 1.0,
  speed = 1.0,
  maxTrail = 16,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    sparks: [] as Particle[],
    waves: [] as Wave[],
    trail: [] as Trail[],
    isDown: false,
    lastPos: null as { x: number; y: number } | null,
    baseFrameMs: 1000 / 60,
    maxDeltaMs: 100,
    lastFrameTime: 0,
    sparkPool: [] as Particle[],
    wavePool: [] as Wave[],
  });

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const alpha = (value: number) => Math.max(0, Math.min(1, value * opacity));

    const getPos = (e: MouseEvent) => ({ x: e.clientX, y: e.clientY });
    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    const boom = (x: number, y: number) => {
      const state = stateRef.current;
      let wave: Wave;

      if (state.wavePool.length > 0) {
        wave = state.wavePool.pop()!;
        wave.x = x;
        wave.y = y;
        wave.life = 0;
        wave.max = 18;
        wave.r = 0;
        wave.ring.ang = Math.random() * Math.PI * 2;
        wave.ring.life = 0;
      } else {
        wave = {
          x,
          y,
          life: 0,
          max: 18,
          r: 0,
          ring: {
            ang: Math.random() * Math.PI * 2,
            segs: [
              { off: -0.25 * Math.PI, len: 1.15 * Math.PI },
              { off: 0.0 * Math.PI, len: 1.15 * Math.PI },
              { off: 0.25 * Math.PI, len: 1.15 * Math.PI },
            ],
            life: 0,
            maxLife: 30,
            rs: 0.08,
          },
        };
      }
      state.waves.push(wave);

      // Create particles
      const particleCount = 4;
      const speedAdjust = scale / 1.5;
      for (let i = 0; i < particleCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const particleSpeed = (4.8 + Math.random() * 2) * speedAdjust;

        let spark: Particle;
        if (state.sparkPool.length > 0) {
          spark = state.sparkPool.pop()!;
          spark.x = x;
          spark.y = y;
          spark.vx = Math.cos(a) * particleSpeed;
          spark.vy = Math.sin(a) * particleSpeed;
          spark.rot = Math.random() * Math.PI * 2;
          spark.rs = (Math.random() - 0.5) * 0.28;
          spark.s = (4 + Math.random() * 3) * scale;
          spark.a = 1;
          spark.f = 0.9;
        } else {
          spark = {
            x,
            y,
            vx: Math.cos(a) * particleSpeed,
            vy: Math.sin(a) * particleSpeed,
            rot: Math.random() * Math.PI * 2,
            rs: (Math.random() - 0.5) * 0.28,
            s: (4 + Math.random() * 3) * scale,
            a: 1,
            f: 0.9,
          };
        }
        state.sparks.push(spark);
      }
    };

    const loop = (now: number) => {
      const state = stateRef.current;
      const deltaMs = Math.min(now - state.lastFrameTime, state.maxDeltaMs);
      state.lastFrameTime = now;
      const frameScale = (deltaMs / state.baseFrameMs) * speed;

      if (state.waves.length > 0 || state.sparks.length > 0 || state.trail.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';

        // Update trail
        for (let i = state.trail.length - 1; i >= 0; i--) {
          const t = state.trail[i];
          t.life -= (state.isDown ? 0.085 : 0.18) * frameScale;
          if (t.life <= 0) state.trail.splice(i, 1);
        }

        // Draw trail
        if (state.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(state.trail[0].x, state.trail[0].y);
          for (let i = 1; i < state.trail.length; i++) {
            ctx.lineTo(state.trail[i].x, state.trail[i].y);
          }
          ctx.lineWidth = 5.0;

          const meteorHead = state.trail[state.trail.length - 1];
          const meteorTail = state.trail[0];
          const gradient = ctx.createLinearGradient(
            meteorHead.x,
            meteorHead.y,
            meteorTail.x,
            meteorTail.y
          );
          gradient.addColorStop(0, `rgba(${color}, 1)`);
          gradient.addColorStop(1, `rgba(${color}, 0)`);

          ctx.shadowColor = `rgba(${color}, 0.6)`;
          ctx.shadowBlur = 3;
          ctx.strokeStyle = gradient;
          ctx.stroke();
          ctx.shadowColor = 'transparent';
        }

        // Update waves
        for (let i = state.waves.length - 1; i >= 0; i--) {
          const w = state.waves[i];
          w.life += frameScale;
          const progress = w.life / w.max;
          const ease = 1 - Math.pow(1 - Math.min(progress, 1), 3);
          w.r = 26 * scale * ease;
          const waveAlpha = Math.max(0, 1 - progress);

          if (waveAlpha > 0) {
            ctx.beginPath();
            ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color},${alpha(waveAlpha)})`;
            ctx.fill();
          }

          const r = w.ring;
          r.life += frameScale;
          const rProg = Math.min(r.life / r.maxLife, 1);
          r.ang -= r.rs * frameScale;
          r.segs.forEach((seg) => {
            const shrink = Math.max(0, 1 - rProg);
            const len = seg.len * shrink;
            const start = r.ang + seg.off;
            ctx.beginPath();
            ctx.arc(w.x, w.y, w.r + 3 * scale, start, start + len);
            ctx.lineWidth = 3.7;
            ctx.strokeStyle = `rgba(245,248,252,${alpha(1 - rProg)})`;
            ctx.stroke();
          });

          if (progress >= 1 && rProg >= 1) {
            state.wavePool.push(state.waves[i]);
            state.waves.splice(i, 1);
          }
        }

        // Update sparks (diamond shape)
        for (let i = state.sparks.length - 1; i >= 0; i--) {
          const s = state.sparks[i];
          s.x += s.vx * frameScale;
          s.y += s.vy * frameScale;
          s.vx *= Math.pow(s.f, frameScale);
          s.vy *= Math.pow(s.f, frameScale);
          s.rot += s.rs * frameScale;
          s.a -= 0.032 * frameScale;

          if (s.a <= 0) {
            state.sparkPool.push(state.sparks[i]);
            state.sparks.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);
          ctx.beginPath();
          ctx.moveTo(0, -s.s);
          ctx.lineTo(s.s * 0.6, s.s * 0.6);
          ctx.lineTo(-s.s * 0.6, s.s * 0.6);
          ctx.fillStyle = `rgba(255,255,255,${alpha(s.a)})`;
          ctx.fill();
          ctx.restore();
        }

        ctx.globalCompositeOperation = 'source-over';
      }

      requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseDown = (e: MouseEvent) => {
      stateRef.current.isDown = true;
      stateRef.current.lastPos = getPos(e);
      boom(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isDown) return;
      const p = getPos(e);
      if (!stateRef.current.lastPos) stateRef.current.lastPos = p;

      if (stateRef.current.lastPos && dist(p, stateRef.current.lastPos) > 2) {
        stateRef.current.trail.push({ x: p.x, y: p.y, life: 1 });
        stateRef.current.lastPos = p;
        if (stateRef.current.trail.length > maxTrail) stateRef.current.trail.shift();

        if (Math.random() < 0.3) {
          const a = Math.random() * Math.PI * 2;
          const speedAdjust = scale / 1.5;
          stateRef.current.sparks.push({
            x: p.x + Math.cos(a) * 10 * scale,
            y: p.y + Math.sin(a) * 10 * scale,
            vx: Math.cos(a) * 1.3 * speedAdjust,
            vy: Math.sin(a) * 1.3 * speedAdjust,
            rot: Math.random() * Math.PI * 2,
            rs: 0.16,
            s: 9 * scale,
            a: 0.7,
            f: 0.95,
          });
        }
      }
    };

    const handleMouseUp = () => {
      stateRef.current.isDown = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    stateRef.current.lastFrameTime = performance.now();
    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, color, scale, opacity, speed, maxTrail]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
});

MouseSparkEffect.displayName = 'MouseSparkEffect';
