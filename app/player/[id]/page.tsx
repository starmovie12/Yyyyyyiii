'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Movie } from '../../../types';
import { fetchMovieById, fetchAllMovies } from '../../../services/firebaseService';
import {
  ArrowLeft, Settings, Maximize, Minimize, Play, Pause, Download, Plus, Check,
  ThumbsUp, Share2, Flag, X, PlayCircle, Layers, Star, Clock, Globe, Film,
  Volume2, VolumeX, RotateCcw, ChevronDown, ChevronUp, Info, Heart, Sparkles
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useWatchlist } from '../../../context/WatchlistContext';
import { useWatchHistory } from '../../../hooks/useWatchHistory';
import { BottomNav } from '../../../components/BottomNav';
import { PlayerPageSkeleton } from '../../../components/SkeletonLoader';

const FALLBACK = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

/* ─────────────────────────────────────────────
   NORMALIZER
───────────────────────────────────────────── */
function normalizeMovie(data: any) {
  const isSeries = data.content_type === 'series' || data.type === 'series' || (data.seasons?.length > 0);
  const title = data.title || data.original_title || 'Untitled';
  const quality = data.quality_name || data.quality || 'HD';
  const year = String(data.year || data.release_year || '2024');
  const genre = Array.isArray(data.genre) ? data.genre.join(', ') : (data.genre || 'Drama');
  const description = data.short_description || data.description || data.overview || 'No synopsis available.';
  const rating = data.rating ? parseFloat(String(data.rating)).toFixed(1) : '0.0';
  const poster = data.poster || data.original_poster_url || 'https://picsum.photos/seed/movie/500/750';
  const backdrop = data.original_backdrop_url || poster;

  // Parse download links (Firebase format: { link, name })
  let links: { url: string; label: string; info: string }[] = [];
  if (!isSeries) {
    let raw = data.download_links || data.qualities;
    if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = []; } }
    if (raw) {
      const arr = Array.isArray(raw) ? raw : Object.values(raw);
      (arr as any[]).forEach((item: any) => {
        const url = item.link || item.url || item.movie_link;
        if (url && typeof url === 'string' && url.startsWith('http')) {
          const nameRaw = item.name || item.quality || item.label || 'HD';
          const sizeMatch = nameRaw.match(/\[([^\]]+)\]/);
          const cleanLabel = nameRaw.replace(/\s*\[[^\]]+\]/, '').trim();
          links.push({ url, label: cleanLabel || 'HD', info: sizeMatch ? sizeMatch[1] : (item.size || '') });
        }
      });
    }
  }

  // Parse cast
  let castList: any[] = [];
  if (data.cast_crew_data) {
    try {
      const parsed = typeof data.cast_crew_data === 'string' ? JSON.parse(data.cast_crew_data) : data.cast_crew_data;
      castList = (parsed.cast || []).slice(0, 8);
    } catch {}
  }

  return { ...data, isSeries, title, quality, year, genre, description, rating, poster, backdrop, links, castList, seasons: data.seasons || [] };
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { saveProgress } = useWatchHistory();

  const [movie, setMovie] = useState<any>(null);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUrl, setActiveUrl] = useState('');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showPlay, setShowPlay] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchMovieById(id as string), fetchAllMovies()]).then(([data, all]) => {
      if (data) {
        const norm = normalizeMovie(data);
        setMovie(norm);
        setActiveUrl(norm.video_url || FALLBACK);
      }
      setRelated(all.filter(m => m.movie_id !== id).slice(0, 12));
      setLoading(false);
    });
  }, [id]);

  const play = useCallback((url: string) => {
    setActiveUrl(url || FALLBACK);
    setShowPlay(false);
    setShowDownload(false);
    setTimeout(() => {
      videoRef.current?.load();
      videoRef.current?.play().catch(() => {});
    }, 100);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !movie) return;
    if (progressTimer.current) clearTimeout(progressTimer.current);
    progressTimer.current = window.setTimeout(() => {
      saveProgress(movie, videoRef.current?.currentTime || 0, videoRef.current?.duration || 0);
    }, 5000);
  }, [movie, saveProgress]);

  const handleShare = () => {
    try { navigator.share({ title: movie?.title, url: window.location.href }); }
    catch { navigator.clipboard?.writeText(window.location.href); toast('Link copied!', 'success'); }
  };

  if (loading) return <PlayerPageSkeleton />;
  if (!movie) return null;

  const inList = isInWatchlist(movie.movie_id);
  const qualityLabel = (movie.quality || '').includes('4K') ? '4K UHD' : (movie.quality || '').includes('1080') ? 'Full HD' : 'HD';

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: 'var(--void)', color: '#fff', fontFamily: 'var(--f-body)' }}>

      {/* ═══════════════════════════════════════
          VIDEO PLAYER
      ═══════════════════════════════════════ */}
      <div className="relative w-full flex-shrink-0" style={{ background: '#000', aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={activeUrl}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onError={() => { if (videoRef.current) videoRef.current.src = FALLBACK; }}
        />

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)' }}>
          <button onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto active:scale-90 transition-transform"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2 pointer-events-auto">
            {/* Quality */}
            <div className="relative">
              <button onClick={() => { setShowQuality(p => !p); setShowDownload(false); setShowPlay(false); }}
                className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Settings size={18} />
              </button>
              {showQuality && (
                <div className="absolute top-12 right-0 rounded-2xl overflow-hidden z-50 asd"
                  style={{ background: 'rgba(8,13,24,0.97)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 160, backdropFilter: 'blur(20px)', boxShadow: '0 16px 48px rgba(0,0,0,0.8)' }}>
                  <div className="px-4 py-2 text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Quality</div>
                  {['Auto', '4K Ultra HD', '1080p FHD', '720p HD', '480p SD'].map(q => (
                    <button key={q} onClick={() => setShowQuality(false)}
                      className="w-full px-4 py-3 text-left text-sm font-semibold transition-colors"
                      style={{ color: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Fullscreen toggle */}
            <button onClick={() => { const v = videoRef.current; if (v) { if (document.fullscreenElement) document.exitFullscreen(); else v.requestFullscreen?.(); } }}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SCROLLABLE CONTENT
      ═══════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <div className="px-4 py-5 space-y-5">

          {/* ── TITLE SECTION ── */}
          <div>
            {/* Quality + New badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bdg bdg-q">{qualityLabel}</span>
              {movie.year && Number(movie.year) >= 2025 && <span className="bdg bdg-n">New 2025</span>}
              {movie.certification_status && (
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                  {movie.certification_status}
                </span>
              )}
            </div>

            <h1 className="lc2 mb-1" style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.6rem,7vw,2.8rem)', lineHeight: 1, letterSpacing: '0.02em', color: '#fff' }}>
              {movie.title}
            </h1>

            {movie.original_title && movie.original_title !== movie.title && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontStyle: 'italic' }}>{movie.original_title}</p>
            )}
            {movie.tagline && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, fontStyle: 'italic' }}>"{movie.tagline}"</p>
            )}
          </div>

          {/* ── META PILLS ── */}
          <div className="flex flex-wrap gap-2">
            {[
              movie.rating !== '0.0' && { icon: <Star size={10} fill="var(--gold)" style={{ color: 'var(--gold)' }} />, val: movie.rating, extra: 'bdg-r' },
              movie.year && { icon: null, val: movie.year, extra: '' },
              movie.runtime && movie.runtime !== 'N/A' && { icon: <Clock size={10} />, val: movie.runtime, extra: '' },
              movie.language && { icon: <Globe size={10} />, val: movie.language, extra: '' },
            ].filter(Boolean).map((m: any, i) => (
              <span key={i} className={`bdg ${m.extra}`}
                style={!m.extra ? { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' } : {}}>
                {m.icon}{m.val}
              </span>
            ))}
          </div>

          {/* ── GENRE TAGS ── */}
          {movie.genre && (
            <div className="flex flex-wrap gap-1.5">
              {movie.genre.split(',').map((g: string) => (
                <span key={g} className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
                  {g.trim()}
                </span>
              ))}
            </div>
          )}

          {/* ── DIVIDER ── */}
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }} />

          {/* ── PRIMARY ACTIONS ── */}
          {!movie.isSeries ? (
            <div className="space-y-2.5">
              {/* Play row */}
              <div className="relative">
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      if (movie.links.length > 1) setShowPlay(p => !p);
                      else play(movie.links[0]?.url || movie.video_url || FALLBACK);
                    }}
                    className="btn-r flex-1 h-13 rounded-2xl ripple-wrap"
                    style={{ height: 52, fontSize: 14 }}>
                    <Play size={18} fill="white" />
                    {movie.links.length > 1 ? 'Select Quality' : 'Play Movie'}
                  </button>
                  {/* Download */}
                  <div className="relative">
                    <button onClick={() => { setShowDownload(p => !p); setShowPlay(false); setShowQuality(false); }}
                      className="btn-g w-[52px] h-[52px] rounded-2xl">
                      <Download size={19} />
                    </button>
                    {showDownload && (
                      <div className="absolute top-14 right-0 rounded-2xl overflow-hidden z-50 asd"
                        style={{ background: 'rgba(8,13,24,0.97)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 190, backdropFilter: 'blur(20px)', boxShadow: '0 16px 48px rgba(0,0,0,0.8)' }}>
                        <div className="px-4 py-2 text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Download</div>
                        {movie.links.length > 0 ? movie.links.map((lk: any, i: number) => (
                          <button key={i} onClick={() => { window.open(lk.url, '_blank'); setShowDownload(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <Download size={13} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{lk.label}</p>
                              {lk.info && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{lk.info}</p>}
                            </div>
                          </button>
                        )) : (
                          <div className="px-4 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No links available</div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Trailer */}
                  {movie.trailer_url && (
                    <button onClick={() => window.open(movie.trailer_url, '_blank')}
                      className="btn-g w-[52px] h-[52px] rounded-2xl">
                      <Film size={18} />
                    </button>
                  )}
                </div>
                {/* Play quality picker dropdown */}
                {showPlay && movie.links.length > 0 && (
                  <div className="mt-2 rounded-2xl overflow-hidden asd"
                    style={{ background: 'rgba(8,13,24,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                    <div className="px-4 py-2 text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      Select Quality to Play
                    </div>
                    {movie.links.map((lk: any, i: number) => (
                      <button key={i} onClick={() => play(lk.url)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ripple-wrap"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,10,60,0.15)', border: '1px solid rgba(255,10,60,0.3)' }}>
                          <Play size={13} fill="var(--red)" style={{ color: 'var(--red)' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{lk.label}</p>
                          {lk.info && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{lk.info}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Watchlist button */}
              <button onClick={() => { toggleWatchlist(movie); toast(inList ? 'Removed from My List' : '✓ Added to My List', inList ? 'info' : 'success'); }}
                className="w-full h-[48px] rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm ripple-wrap transition-all"
                style={{
                  background: inList ? 'rgba(255,10,60,0.12)' : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${inList ? 'rgba(255,10,60,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: inList ? 'var(--red)' : 'rgba(255,255,255,0.7)',
                  fontSize: 13,
                }}>
                {inList
                  ? <><Check size={17} strokeWidth={2.5} /> Remove from My List</>
                  : <><Plus size={17} /> Add to My List</>}
              </button>
            </div>
          ) : (
            /* Series: Episode button */
            <button onClick={() => setShowEpisodes(true)}
              className="w-full h-[52px] rounded-2xl flex items-center justify-center gap-2 font-bold text-sm ripple-wrap"
              style={{ background: 'linear-gradient(135deg, var(--aurora2), var(--cyan))', fontSize: 14 }}>
              <Layers size={18} /> View All Episodes
            </button>
          )}

          {/* ── SOCIAL ROW ── */}
          <div className="flex justify-around py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { icon: liked ? <Heart size={22} fill="var(--pink)" style={{ color: 'var(--pink)' }} /> : <ThumbsUp size={22} />, label: liked ? 'Liked' : 'Like', fn: () => { setLiked(p => !p); if (!liked) toast('Liked!', 'success'); } },
              { icon: <Share2 size={22} />, label: 'Share', fn: handleShare },
              { icon: <Download size={22} />, label: 'Download', fn: () => setShowDownload(p => !p) },
              { icon: <Flag size={22} />, label: 'Report', fn: () => toast('Report submitted', 'info') },
            ].map(({ icon, label, fn }) => (
              <button key={label} onClick={fn}
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform px-3 py-2"
                style={{ color: label === 'Liked' ? 'var(--pink)' : 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {icon}{label}
              </button>
            ))}
          </div>

          {/* ── DESCRIPTION ── */}
          <div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}
              className={descExpanded ? '' : 'lc3'}>
              {movie.description}
            </p>
            {movie.description && movie.description.length > 120 && (
              <button onClick={() => setDescExpanded(p => !p)}
                className="flex items-center gap-1 mt-2 font-bold text-xs"
                style={{ color: 'var(--red)' }}>
                {descExpanded ? <><ChevronUp size={14} />Show Less</> : <><ChevronDown size={14} />Read More</>}
              </button>
            )}
          </div>

          {/* ── MOVIE DETAILS TABLE ── */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Movie Details</p>
            {[
              { k: 'Director', v: movie.director },
              { k: 'Cast', v: movie.cast },
              { k: 'Writer', v: movie.writer },
              { k: 'Producer', v: movie.producer },
              { k: 'Genre', v: movie.genre },
              { k: 'Industry', v: movie.industry },
              { k: 'Language', v: movie.language },
              { k: 'Country', v: movie.country },
              { k: 'Platform', v: movie.platform },
              { k: 'Status', v: movie.status },
              { k: 'IMDB', v: movie.imdb_id },
              { k: 'Collection', v: movie.collection_name },
            ].filter(r => r.v && r.v !== 'N/A').map(({ k, v }) => (
              <div key={k} className="flex gap-3">
                <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', width: 72, flexShrink: 0, paddingTop: 1 }}>{k}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', flex: 1, lineHeight: 1.5, fontWeight: 400 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* ── CAST CARDS ── */}
          {movie.castList && movie.castList.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-[3px] h-5 rounded-full" style={{ background: 'var(--red)', boxShadow: '0 0 8px var(--gr)' }} />
                <h3 style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cast</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {movie.castList.map((person: any) => (
                  <div key={person.id} className="flex-shrink-0 w-16 flex flex-col items-center gap-1.5 text-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.1)' }}>
                      {person.profile_path
                        ? <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>{person.name?.[0]}</div>}
                    </div>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }} className="lc2">{person.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MORE LIKE THIS ── */}
          {related.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-[3px] h-5 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--gg)' }} />
                <h3 style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>More Like This</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {related.map((m, i) => (
                  <div key={m.movie_id}
                    onClick={() => router.push(`/player/${m.movie_id}`)}
                    className="cursor-pointer active:scale-95 transition-transform afu"
                    style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'both' }}>
                    <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: '150%', background: 'var(--card)' }}>
                      <img src={m.poster} alt={m.title} className="absolute inset-0 w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/rel/300/450'; }} />
                      <div className="absolute inset-0 g-card" />
                      <div className="absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg"
                        style={{ background: 'rgba(0,0,0,0.75)', fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.7)' }}>
                        {(m.quality_name || '').includes('4K') ? '4K' : (m.quality_name || '').includes('1080') ? 'FHD' : 'HD'}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white font-bold lc2" style={{ fontSize: 9 }}>{m.title}</p>
                        <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{m.year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div style={{ height: 16 }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════
          EPISODES OVERLAY
      ═══════════════════════════════════════ */}
      {showEpisodes && (
        <div className="fixed inset-0 z-[200] flex flex-col afi"
          style={{ background: 'rgba(1,2,6,0.98)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 22, letterSpacing: '0.04em' }}>Episodes</h3>
            <button onClick={() => setShowEpisodes(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
            {movie.seasons.length === 0
              ? <p className="text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>No episodes found.</p>
              : movie.seasons.map((season: any, si: number) => (
                <div key={si}>
                  <h4 className="mb-3" style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {season.name || `Season ${si + 1}`}
                  </h4>
                  <div className="space-y-2">
                    {season.episodes?.map((ep: any, ei: number) => (
                      <button key={ei}
                        onClick={() => { play(ep.url || ep.link); setShowEpisodes(false); }}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[.98] ripple-wrap"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,10,60,0.15)', border: '1px solid rgba(255,10,60,0.3)' }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--red)' }}>{ei + 1}</span>
                        </div>
                        <span className="flex-1 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {ep.title || `Episode ${ei + 1}`}
                        </span>
                        <PlayCircle size={20} style={{ color: 'var(--red)', flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <BottomNav onSearchOpen={() => setSearchOpen(true)} />
    </div>
  );
}
