'use client';
import React, { useState, useCallback } from 'react';
import { Movie } from '../types';
import { Sparkles, RefreshCw } from 'lucide-react';
import { MovieCard } from './MovieCard';

interface P { movies: Movie[]; onMovieClick: (m: Movie) => void; }

const MOODS = [
  { label: 'Thrill Me', emoji: '⚡', kw: 'action thriller suspense', color: 'var(--nova)', bg: 'rgba(255,10,60,.' },
  { label: 'Laugh Now', emoji: '😂', kw: 'comedy fun light', color: 'var(--solar)', bg: 'rgba(255,179,0,.' },
  { label: 'Love Story', emoji: '💕', kw: 'romance love drama', color: 'var(--pulsar)', bg: 'rgba(255,45,158,.' },
  { label: 'Scare Me', emoji: '👻', kw: 'horror mystery dark', color: 'var(--ether)', bg: 'rgba(155,45,255,.' },
  { label: 'Dhamaka', emoji: '🎬', kw: 'bollywood hindi masala', color: 'var(--comet)', bg: 'rgba(255,107,53,.' },
  { label: 'Feel Good', emoji: '✨', kw: 'family feel-good uplifting', color: 'var(--aurora)', bg: 'rgba(0,255,148,.' },
];

const FALLBACK_MSGS: Record<string, string> = {
  'Thrill Me':   '🔥 Heart-pounding picks — prepare for an adrenaline overload!',
  'Laugh Now':   '😂 Comedy gold guaranteed — laughter is the best medicine!',
  'Love Story':  '💕 Timeless love stories that will melt your heart!',
  'Scare Me':    '👻 These will haunt you — watch at your own risk!',
  'Dhamaka':     '🎬 Full-on Bollywood masala — songs, drama, and tamasha!',
  'Feel Good':   '✨ Pure positivity — these movies will brighten your whole day!',
};

export const AiRecommendations: React.FC<P> = ({ movies, onMovieClick }) => {
  const [active, setActive] = useState<typeof MOODS[0] | null>(null);
  const [recs, setRecs] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState('');

  const getRecommendations = useCallback(async (mood: typeof MOODS[0]) => {
    setActive(mood);
    setLoading(true);
    setRecs([]);
    setAiMsg('');

    // Local filter
    const kw = mood.kw.toLowerCase().split(' ');
    let filtered = movies.filter(m => {
      const hay = `${m.genre || ''} ${m.industry || ''} ${m.title || ''} ${m.short_description || ''}`.toLowerCase();
      return kw.some(k => hay.includes(k));
    }).slice(0, 8);

    if (filtered.length < 4) {
      filtered = [...filtered, ...movies.filter(m => !filtered.find(f => f.movie_id === m.movie_id)).slice(0, 8 - filtered.length)];
    }

    // Claude AI message
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: `You're MFLIX AI movie curator. User mood: "${mood.label}". Write ONE exciting, punchy sentence (max 15 words) to introduce their picks. Sound enthusiastic like a cool movie host. No quotes.`
          }],
        }),
      });
      const data = await res.json();
      setAiMsg(data.content?.[0]?.text || FALLBACK_MSGS[mood.label]);
    } catch {
      setAiMsg(FALLBACK_MSGS[mood.label]);
    }

    setRecs(filtered);
    setLoading(false);
  }, [movies]);

  return (
    <div className="px-4 mb-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="ai-ring rounded-full flex-shrink-0" style={{ width: 22, height: 22, padding: 2 }}>
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'var(--deep)' }}>
              <Sparkles size={10} style={{ color: 'var(--plasma)' }} />
            </div>
          </div>
          <h2 style={{ fontFamily: 'var(--body)', fontSize: 13, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: '#fff' }}>
            AI Mood Picks
          </h2>
          <span className="bdg bdg-ai">Claude AI</span>
        </div>
        {active && !loading && (
          <button onClick={() => getRecommendations(active)} className="flex items-center gap-1.5 active:scale-90 transition-transform"
            style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)' }}>
            <RefreshCw size={11} />Refresh
          </button>
        )}
      </div>

      {/* Mood chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
        {MOODS.map(mood => {
          const on = active?.label === mood.label;
          return (
            <button key={mood.label}
              onClick={() => getRecommendations(mood)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold active:scale-95 transition-all ripple"
              style={{
                background: on ? `${mood.bg}18)` : 'rgba(255,255,255,.04)',
                border: `1.5px solid ${on ? mood.color : 'rgba(255,255,255,.07)'}`,
                color: on ? mood.color : 'rgba(255,255,255,.45)',
                fontSize: 12, fontWeight: 700,
                boxShadow: on ? `0 4px 20px ${mood.bg}35)` : 'none',
              }}>
              <span style={{ fontSize: 15 }}>{mood.emoji}</span>
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* AI message */}
      {aiMsg && !loading && (
        <div className="mb-4 px-4 py-3 rounded-2xl flex items-start gap-3 asu"
          style={{ background: 'rgba(155,45,255,.08)', border: '1px solid rgba(155,45,255,.2)', boxShadow: '0 4px 24px rgba(155,45,255,.1)' }}>
          <div className="ai-ring rounded-full flex-shrink-0 mt-0.5" style={{ width: 22, height: 22, padding: 2 }}>
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'var(--deep)' }}>
              <Sparkles size={9} style={{ color: 'var(--plasma)' }} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', lineHeight: 1.5, fontWeight: 500 }}>{aiMsg}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex gap-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-[110px]">
              <div className="sk rounded-xl" style={{ paddingBottom: '150%' }} />
              <div className="sk h-3 mt-2 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && recs.length > 0 && (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {recs.map((mv, i) => (
            <div key={mv.movie_id} className="flex-shrink-0 w-[110px] afu" style={{ animationDelay: `${i * 55}ms` }}>
              <MovieCard movie={mv} onClick={onMovieClick} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !active && (
        <div className="py-8 flex flex-col items-center gap-3">
          <div className="ai-ring rounded-full aflt" style={{ width: 56, height: 56, padding: 3 }}>
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'var(--deep)' }}>
              <Sparkles size={22} style={{ color: 'var(--plasma)' }} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', textAlign: 'center', lineHeight: 1.6 }}>
            Choose a mood &amp; let AI find<br />your perfect movie tonight!
          </p>
        </div>
      )}
    </div>
  );
};
