'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Movie } from '../types';
import { Play, Plus, Info, Star, Clock, Check, Flame } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'next/navigation';

interface P { movies: Movie[]; onMovieClick: (m: Movie) => void; }

export const HeroBanner: React.FC<P> = ({ movies, onMovieClick }) => {
  const [cur, setCur] = useState(0);
  const [aKey, setAKey] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();
  const router = useRouter();
  const feat = movies.slice(0, 7);

  const goTo = useCallback((i: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCur(i);
      setAKey(k => k + 1);
      setTransitioning(false);
    }, 200);
  }, [transitioning]);

  useEffect(() => {
    if (feat.length <= 1) return;
    const t = setInterval(() => goTo((cur + 1) % feat.length), 7000);
    return () => clearInterval(t);
  }, [cur, feat.length, goTo]);

  if (!feat.length) return null;
  const m = feat[cur];
  const bg = m.original_backdrop_url || m.poster;
  const rating = m.rating ? parseFloat(String(m.rating)).toFixed(1) : '—';
  const inList = isInWatchlist(m.movie_id);
  const genres = (m.genre || '').split(',').slice(0, 3).map(g => g.trim()).filter(Boolean);
  const qRaw = m.quality_name || m.quality || 'HD';
  const q4k = qRaw.includes('4K');
  const qLabel = q4k ? '4K UHD' : qRaw.includes('1080') ? 'Full HD' : 'HD';
  const isNew = m.year && Number(m.year) >= 2025;
  const isTrending = m.is_trending_now === 'Yes';

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'min(84vw, 540px)' }}>
      {/* BG with Ken Burns */}
      <div
        key={`bg-${cur}`}
        className={`absolute inset-0 transition-opacity duration-400 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
      >
        <img
          src={bg} alt=""
          className="w-full h-full object-cover object-top"
          style={{ filter: 'brightness(.58) saturate(1.3)', animation: 'kenburns 9s ease-out forwards' }}
        />
      </div>

      {/* Gradient layers */}
      <div className="absolute inset-0 g-hero" />
      <div className="absolute inset-0 g-side" />

      {/* CRT scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.09) 3px,rgba(0,0,0,.09) 4px)' }} />

      {/* Content */}
      <div
        key={`c-${aKey}`}
        className={`absolute bottom-0 left-0 right-0 px-5 pb-8 transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Top badges row */}
        <div className="flex items-center gap-2 mb-3 afu">
          {isTrending && (
            <span className="bdg bdg-nova flex items-center gap-1"><Flame size={8} />Trending</span>
          )}
          {isNew && <span className="bdg bdg-aurora">New 2025</span>}
          {q4k && <span className="bdg bdg-plasma">4K Ultra HD</span>}
          {m.audio_type && <span className="bdg bdg-lang">{m.audio_type.split(' ').slice(0, 2).join(' ')}</span>}
        </div>

        {/* Genre row */}
        <div className="flex items-center gap-2 mb-2 afu d1">
          {genres.map((g, i) => (
            <React.Fragment key={g}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>{g}</span>
              {i < genres.length - 1 && <span style={{ color: 'rgba(255,255,255,.18)', fontSize: 5 }}>●</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Title */}
        <h1
          className="afu d2 lc2 mb-2"
          style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(2.1rem,10vw,4.2rem)',
            lineHeight: .95,
            letterSpacing: '.01em',
            textShadow: '0 2px 30px rgba(0,0,0,.9)',
            color: '#fff',
          }}
        >
          {m.title}
        </h1>

        {/* Description */}
        {m.short_description && (
          <p className="afu d3 lc2 mb-3" style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.55, fontWeight: 400 }}>
            {m.short_description}
          </p>
        )}

        {/* Meta pills */}
        <div className="flex items-center gap-2.5 mb-5 afu d4">
          <div className="bdg bdg-solar flex items-center gap-1">
            <Star size={9} fill="var(--solar)" style={{ color: 'var(--solar)' }} />
            {rating}
          </div>
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 10, fontWeight: 600 }}>{m.year}</span>
          {m.runtime && (
            <span className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,.3)', fontSize: 10, fontWeight: 600 }}>
              <Clock size={10} />{m.runtime}
            </span>
          )}
          <span className="bdg bdg-nova">{qLabel}</span>
        </div>

        {/* CTAs */}
        <div className="flex gap-2.5 afu d5">
          <button className="btn-nova flex-1 h-12 rounded-2xl ripple" onClick={() => onMovieClick(m)}>
            <Play size={17} fill="white" />PLAY NOW
          </button>
          <button
            onClick={() => { toggleWatchlist(m); toast(inList ? 'Removed from list' : '✓ Added to My List', inList ? 'info' : 'success'); }}
            className="btn-glass w-12 h-12 rounded-2xl"
            style={inList ? { background: 'rgba(255,10,60,.18)', borderColor: 'rgba(255,10,60,.45)' } : {}}
          >
            {inList ? <Check size={18} style={{ color: 'var(--nova)' }} /> : <Plus size={18} />}
          </button>
          <button className="btn-glass w-12 h-12 rounded-2xl" onClick={() => router.push(`/player/${m.movie_id}`)}>
            <Info size={17} />
          </button>
        </div>
      </div>

      {/* Vertical dot nav */}
      {feat.length > 1 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
          {feat.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="rounded-full transition-all duration-350"
              style={{
                width: 3,
                height: i === cur ? 22 : 6,
                background: i === cur ? 'var(--nova)' : 'rgba(255,255,255,.2)',
                boxShadow: i === cur ? '0 0 10px var(--gn)' : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* Mini poster strip at bottom right */}
      {feat.length > 1 && (
        <div className="absolute bottom-0 right-16 flex items-end gap-1.5 pb-8">
          {feat.slice(0, 5).map((mv, i) => {
            const isC = i === cur;
            return (
              <button key={mv.movie_id} onClick={() => goTo(i)}
                className="overflow-hidden rounded-xl transition-all duration-300 flex-shrink-0"
                style={{
                  width: isC ? 46 : 30,
                  height: isC ? 64 : 42,
                  border: `1.5px solid ${isC ? 'var(--nova)' : 'rgba(255,255,255,.1)'}`,
                  boxShadow: isC ? '0 0 14px var(--gn)' : 'none',
                  opacity: isC ? 1 : 0.5,
                  transition: 'all .3s cubic-bezier(.22,1,.36,1)',
                }}
              >
                <img src={mv.poster} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
