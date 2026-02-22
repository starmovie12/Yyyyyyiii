'use client';
import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf: number;

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);

    // Star particles
    interface Star { x:number; y:number; r:number; speed:number; opacity:number; color:string; twinkle:number; }
    const COLORS = ['rgba(0,229,255,', 'rgba(155,45,255,', 'rgba(255,10,60,', 'rgba(255,179,0,', 'rgba(255,255,255,'];
    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.18 + 0.04,
      opacity: Math.random() * 0.7 + 0.15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      twinkle: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    interface Shooter { x:number; y:number; vx:number; vy:number; len:number; life:number; maxLife:number; }
    const shooters: Shooter[] = [];
    let shootTimer = 0;

    const spawnShooter = () => {
      shooters.push({
        x: Math.random() * W * 0.7,
        y: Math.random() * H * 0.4,
        vx: 4 + Math.random() * 3,
        vy: 1.5 + Math.random() * 2,
        len: 80 + Math.random() * 60,
        life: 0,
        maxLife: 45 + Math.random() * 20,
      });
    };

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // Shooting stars
      shootTimer++;
      if (shootTimer > 180 + Math.random() * 120) { spawnShooter(); shootTimer = 0; }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx; s.y += s.vy; s.life++;
        if (s.life >= s.maxLife) { shooters.splice(i, 1); continue; }
        const progress = s.life / s.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const grad = ctx.createLinearGradient(s.x - s.vx * 12, s.y - s.vy * 12, s.x, s.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(1, `rgba(255,255,255,${alpha * 0.85})`);
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.moveTo(s.x - s.vx * 15, s.y - s.vy * 15);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        // Glow head
        ctx.beginPath();
        const headGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 4);
        headGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        headGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = headGrad;
        ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stars
      for (const st of stars) {
        st.y -= st.speed;
        if (st.y < -5) { st.y = H + 5; st.x = Math.random() * W; }
        st.twinkle += 0.02;
        const tw = 0.5 + 0.5 * Math.sin(st.twinkle);
        const op = st.opacity * (0.6 + 0.4 * tw);
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `${st.color}${op.toFixed(2)})`;
        ctx.fill();
        // Glow on bright stars
        if (op > 0.7 && st.r > 1) {
          const g = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, st.r * 4);
          g.addColorStop(0, `${st.color}${(op * 0.3).toFixed(2)})`);
          g.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.85 }}
    />
  );
};
