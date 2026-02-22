'use client';
import React, { useState } from 'react';
import { Movie } from '../types';
import { Star, Plus, Check, Play } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';

interface P {
  movie: Movie;
  onClick: (m: Movie) => void;
  variant?: 'portrait' | 'landscape';
  progress?: number;
  timeLeft?: string;
}
const FB = 'https://picsum.photos/seed/mfxfb/300/450';

export const MovieCard: React.FC<P> = ({ movie, onClick, variant = 'portrait', progress, timeLeft }) => {
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();
  const [imgErr, setImgErr] = useState(false);
  const inList = isInWatchlist(movie.movie_id);

  const poster = imgErr ? FB : (movie.poster || movie.original_poster_url || FB);
  const rating = movie.rating ? parseFloat(String(movie.rating)).toFixed(1) : '—';
  const qRaw = movie.quality_name || movie.quality || 'HD';
  const qL = qRaw.includes('4K') ? '4K' : qRaw.includes('1080') ? 'FHD' : qRaw.includes('720') ? 'HD' : 'SD';
  const lang = ((movie.languages || movie.audio_type || movie.original_language || 'HI').toString().split(/[\s,]/)[0].slice(0, 3)).toUpperCase();
  const isNew = movie.year && Number(movie.year) >= 2025;

  const handleWL = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(movie);
    toast(inList ? 'Removed from My List' : '✓ Added to My List', inList ? 'info' : 'success');
  };

  if (variant === 'landscape') {
    return (
      <article className="card-lift flex-shrink-0 w-full" onClick={() => onClick(movie)}>
        <div className="relative rounded-2xl overflow-hidden glass-card" style={{ aspectRatio: '16/9' }}>
          <img src={poster} alt={movie.title} className="w-full h-full object-cover" loading="lazy"
            onError={() => setImgErr(true)} style={{ filter: 'brightness(.75) saturate(1.1)' }} />
          <div className="absolute inset-0 g-card" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,10,60,.88)', boxShadow: '0 0 28px rgba(255,10,60,.55)' }}>
              <Play size={18} fill="white" className="ml-0.5" />
            </div>
          </div>
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 pt" style={{ borderRadius: 0 }}>
              <div className="pf" style={{ width: `${progress}%` }} />
            </div>
          )}
          <div className="absolute top-2 right-2"><span className="bdg bdg-nova">{qL}</span></div>
        </div>
        <div className="mt-2 px-0.5">
          <p className="text-sm font-bold lc1" style={{ color: '#fff' }}>{movie.title}</p>
          <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,.3)' }}>{timeLeft || movie.year}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="card-lift group relative w-full" onClick={() => onClick(movie)}>
      <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: '150%' }}>
        <img
          src={poster} alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          loading="lazy" onError={() => setImgErr(true)}
          style={{ transition: 'transform .5s cubic-bezier(.22,1,.36,1)' }}
        />
        <div className="absolute inset-0 g-card opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Lang badge */}
        <div className="absolute top-0 left-0 px-1.5 py-0.5 rounded-br-lg"
          style={{ background: 'var(--nova)', fontSize: 8, fontWeight: 900, letterSpacing: '.04em', color: 'white' }}>
          {lang}
        </div>

        {/* Quality badge */}
        <div className="absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg"
          style={{ background: 'rgba(0,0,0,.78)', fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,.75)' }}>
          {qL}
        </div>

        {/* NEW badge */}
        {isNew && (
          <div className="absolute top-5 left-0 px-1.5 py-0.5 rounded-r-md"
            style={{ background: 'linear-gradient(135deg,var(--aurora),#006644)', fontSize: 7, fontWeight: 900, color: 'white', letterSpacing: '.04em' }}>
            NEW
          </div>
        )}

        {/* Play on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,10,60,.92)', boxShadow: '0 0 28px rgba(255,10,60,.6)' }}>
            <Play size={16} fill="white" className="ml-0.5" />
          </div>
        </div>

        {/* Watchlist btn */}
        <button onClick={handleWL}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90"
          style={{
            background: inList ? 'var(--nova)' : 'rgba(0,0,0,.72)',
            border: `1px solid ${inList ? 'var(--nova)' : 'rgba(255,255,255,.25)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: inList ? '0 0 14px rgba(255,10,60,.55)' : 'none',
          }}>
          {inList ? <Check size={11} strokeWidth={3} color="white" /> : <Plus size={11} strokeWidth={2.5} color="white" />}
        </button>
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5 space-y-1">
        <p className="text-xs font-bold lc1" style={{ color: '#fff' }}>{movie.title}</p>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', fontWeight: 600 }}>{movie.year}</span>
          <div className="bdg bdg-solar flex items-center gap-0.5" style={{ padding: '1px 5px', fontSize: 9 }}>
            <Star size={8} fill="var(--solar)" style={{ color: 'var(--solar)' }} />
            {rating}
          </div>
        </div>
      </div>
    </article>
  );
};
