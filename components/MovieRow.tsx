'use client';
import React from 'react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface P {
  title: string; emoji?: string; movies: Movie[];
  onMovieClick: (m: Movie) => void;
  variant?: 'portrait' | 'landscape';
  showProgress?: boolean; onRemove?: (id: string) => void;
  accent?: string; genre?: string;
}

export const MovieRow: React.FC<P> = ({ title, emoji, movies, onMovieClick, variant = 'portrait', showProgress, onRemove, accent = 'var(--nova)', genre }) => {
  const router = useRouter();
  if (!movies.length) return null;

  return (
    <section className="mb-2 mt-2">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-[3px] h-5 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}88` }} />
          <h2 style={{ fontFamily: 'var(--body)', fontSize: 13, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: '#fff' }}>
            {emoji && <span className="mr-1.5">{emoji}</span>}{title}
          </h2>
          <div className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.28)' }}>{movies.length}</span>
          </div>
        </div>
        {genre && (
          <button onClick={() => router.push(`/category/${genre}`)}
            className="flex items-center gap-0.5 active:scale-95 transition-transform"
            style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.28)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            All<ChevronRight size={11} />
          </button>
        )}
      </div>

      <div className={`flex overflow-x-auto no-scrollbar pb-3 pl-4 pr-2 ${variant === 'portrait' ? 'gap-2.5' : 'gap-3'}`}>
        {movies.map(mv => (
          <div key={mv.movie_id} className={`flex-shrink-0 relative ${variant === 'landscape' ? 'w-[185px]' : 'w-[110px]'}`}>
            {onRemove && (
              <button
                onClick={e => { e.stopPropagation(); onRemove(mv.movie_id); }}
                className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,.9)', border: '1px solid rgba(255,255,255,.15)' }}>
                <X size={9} color="rgba(255,255,255,.7)" />
              </button>
            )}
            <MovieCard movie={mv} onClick={onMovieClick} variant={variant}
              progress={showProgress ? Math.floor((mv.movie_id.charCodeAt(0) % 70) + 15) : undefined}
              timeLeft={showProgress ? 'Resume' : ''} />
          </div>
        ))}
        <div className="flex-shrink-0 w-3" />
      </div>
    </section>
  );
};
