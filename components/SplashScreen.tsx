'use client';
import React, { useEffect, useState, useRef } from 'react';

export const SplashScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2300),
      setTimeout(onDone, 2900),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onDone]);

  // Particle burst on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;

    const particles = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 4 + 1,
      r: Math.random() * 2.5 + 0.5,
      life: 0,
      maxLife: Math.random() * 60 + 30,
      color: ['#ff0a3c','#00e5ff','#9b2dff','#ffb300','#00ff94'][Math.floor(Math.random() * 5)],
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.life++;
        if (p.life >= p.maxLife) continue;
        alive = true;
        const pr = p.life / p.maxLife;
        const alpha = pr < 0.2 ? pr / 0.2 : 1 - pr;
        const x = cx + Math.cos(p.angle) * p.speed * p.life;
        const y = cy + Math.sin(p.angle) * p.speed * p.life;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.round(alpha * 255).toString(16).padStart(2,'0')}`;
        ctx.fill();
      }
      if (alive) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const letters = 'MFLIX'.split('');

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-600 ${phase === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: 'var(--cosmos)' }}
    >
      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.02) 3px,rgba(255,255,255,.02) 4px)', zIndex: 1 }} />

      {/* Deep nebula glow */}
      <div className={`absolute rounded-full transition-all duration-1000 pointer-events-none ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(155,45,255,0.18) 0%, rgba(0,229,255,0.06) 40%, transparent 70%)', filter: 'blur(20px)' }} />

      {/* Particle burst canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }} />

      {/* Logo */}
      <div className="relative flex flex-col items-center gap-5 z-10">
        {/* Icon with orbiting ring */}
        <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
          {/* Orbit ring */}
          <div className={`absolute inset-0 rounded-full ai-ring transition-opacity duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{ padding: 2 }}>
            <div className="w-full h-full rounded-full" style={{ background: 'var(--cosmos)' }} />
          </div>
          {/* Inner icon */}
          <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            style={{ background: 'linear-gradient(145deg,var(--nova),#7a001e)', boxShadow: '0 0 60px rgba(255,10,60,.55), inset 0 1px 0 rgba(255,255,255,.15)' }}>
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
            </svg>
          </div>
        </div>

        {/* Wordmark with letter stagger */}
        <div className="flex items-end gap-0.5">
          {letters.map((ch, i) => (
            <span key={i} style={{
              fontFamily: 'var(--display)',
              fontSize: 60, lineHeight: 1,
              color: '#fff',
              letterSpacing: '0.03em',
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.7)',
              transition: `opacity .55s ease ${.1 + i * .07}s, transform .55s cubic-bezier(.22,1,.36,1) ${.1 + i * .07}s`,
              textShadow: '0 0 50px rgba(255,10,60,.4)',
            }}>{ch}</span>
          ))}
        </div>

        {/* Tagline typewriter */}
        <div className={`overflow-hidden transition-all duration-500 ${phase >= 2 ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}
          style={{ transitionDelay: '0.1s', whiteSpace: 'nowrap' }}>
          <p style={{ fontSize: 11, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>
            Cinema &nbsp;·&nbsp; Redefined &nbsp;·&nbsp; 2025
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-14 rounded-full overflow-hidden" style={{ width: 160, height: 2, background: 'rgba(255,255,255,.06)' }}>
        <div className="h-full rounded-full" style={{
          background: 'linear-gradient(to right, var(--nova), var(--plasma))',
          width: phase >= 1 ? '100%' : '0%',
          transition: 'width 2.4s cubic-bezier(.4,0,.2,1)',
          boxShadow: '0 0 12px rgba(255,10,60,.5)',
        }} />
      </div>

      {/* Version badge */}
      <div className={`absolute bottom-8 transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <span className="bdg bdg-ether">v5 · Cosmos Edition</span>
      </div>
    </div>
  );
};
