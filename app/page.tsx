'use client';
import React,{useState,useEffect,useMemo,useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {Movie} from '../types';
import {fetchAllMovies} from '../services/firebaseService';
import {HeroBanner}          from '../components/HeroBanner';
import {MovieRow}             from '../components/MovieRow';
import {BottomNav}            from '../components/BottomNav';
import {SearchOverlay}        from '../components/SearchOverlay';
import {SplashScreen}         from '../components/SplashScreen';
import {ScrollToTop}          from '../components/ScrollToTop';
import {HomePageSkeleton}     from '../components/SkeletonLoader';
import {AiRecommendations}    from '../components/AiRecommendations';
import {useWatchlist}         from '../context/WatchlistContext';
import {useWatchHistory}      from '../hooks/useWatchHistory';
import {Search,Bell,Sparkles,TrendingUp,Clock} from 'lucide-react';

export default function Home(){
  const [movies,setMovies]   = useState<Movie[]>([]);
  const [loading,setLoading] = useState(true);
  const [splash,setSplash]   = useState(false);
  const [search,setSearch]   = useState(false);
  const [showAi,setShowAi]   = useState(false);
  const router=useRouter();
  const {watchlist}=useWatchlist();
  const {history,removeFromHistory}=useWatchHistory();

  useEffect(()=>{
    if(!sessionStorage.getItem('mflix_v4')){setSplash(true);sessionStorage.setItem('mflix_v4','1');}
    fetchAllMovies().then(d=>{setMovies(d);setLoading(false);});
  },[]);

  const go=useCallback((m:Movie)=>router.push(`/player/${m.movie_id}`),[router]);

  const feat     =useMemo(()=>{const f=movies.filter(m=>m.is_featured==='Yes').slice(0,8);return f.length?f:movies.slice(0,8);},[movies]);
  const trending =useMemo(()=>movies.filter(m=>m.is_trending_now==='Yes').slice(0,15),[movies]);
  const latest   =useMemo(()=>[...movies].sort((a,b)=>Number(b.year||0)-Number(a.year||0)).slice(0,15),[movies]);
  const bollywood=useMemo(()=>movies.filter(m=>m.industry?.toLowerCase().includes('bollywood')).slice(0,15),[movies]);
  const action   =useMemo(()=>movies.filter(m=>m.genre?.toLowerCase().includes('action')).slice(0,15),[movies]);
  const comedy   =useMemo(()=>movies.filter(m=>m.genre?.toLowerCase().includes('comedy')).slice(0,15),[movies]);
  const horror   =useMemo(()=>movies.filter(m=>m.genre?.toLowerCase().includes('horror')||m.genre?.toLowerCase().includes('thriller')).slice(0,15),[movies]);
  const romance  =useMemo(()=>movies.filter(m=>m.genre?.toLowerCase().includes('romance')).slice(0,15),[movies]);
  const uhd      =useMemo(()=>movies.filter(m=>m.quality_name?.includes('4K')||m.quality?.includes('4K')).slice(0,15),[movies]);
  const hindi    =useMemo(()=>movies.filter(m=>(m.languages||m.audio_type||'').toLowerCase().includes('hindi')).slice(0,15),[movies]);
  const conW     =useMemo(()=>history.map(h=>h.movie),[history]);

  return(
    <>
      {splash&&<SplashScreen onDone={()=>setSplash(false)}/>}
      {search&&<SearchOverlay movies={movies} onClose={()=>setSearch(false)}/>}

      {/* Aurora BG */}
      <div className="aurora-layer"/>

      <div className="relative min-h-screen pb-28" style={{background:'var(--void)',zIndex:1}}>
        {/* ─── HEADER ─── */}
        <header className="fixed top-0 left-0 right-0 z-[60] px-4 py-3 flex items-center justify-between header-blur pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{background:'linear-gradient(145deg,var(--red),#7a001e)',boxShadow:'0 0 20px rgba(255,10,60,.45)'}}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
            </div>
            <span style={{fontFamily:'var(--f-display)',fontSize:26,letterSpacing:'0.03em',color:'#fff',textShadow:'0 0 24px rgba(255,10,60,.35)'}}>
              MFLIX
            </span>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button onClick={()=>setSearch(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)'}}>
              <Search size={17} style={{color:'rgba(255,255,255,.6)'}}/>
            </button>
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)'}}>
              <Bell size={17} style={{color:'rgba(255,255,255,.6)'}}/>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full apr" style={{background:'var(--red)'}}/>
            </button>
            <button onClick={()=>router.push('/profile')}
              className="w-9 h-9 rounded-full overflow-hidden active:scale-90 transition-transform"
              style={{border:'2px solid rgba(255,10,60,.5)',boxShadow:'0 0 12px rgba(255,10,60,.2)'}}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=mflix2025" className="w-full h-full object-cover" style={{background:'var(--card)'}} alt="P"/>
            </button>
          </div>
        </header>

        {/* ─── CONTENT ─── */}
        {loading?<HomePageSkeleton/>:(
          <main>
            <HeroBanner movies={feat} onMovieClick={go}/>

            {/* Divider */}
            <div className="h-px mx-4 my-3" style={{background:'linear-gradient(to right,transparent,rgba(255,255,255,.06),transparent)'}}/>

            {/* AI Section toggle */}
            <div className="px-4 mb-1">
              <button onClick={()=>setShowAi(p=>!p)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl ripple-wrap"
                style={{
                  background:showAi?'rgba(139,47,255,.12)':'rgba(255,255,255,.04)',
                  border:`1.5px solid ${showAi?'rgba(139,47,255,.35)':'rgba(255,255,255,.07)'}`,
                  transition:'all .3s ease',
                }}>
                <div className="ai-ring w-8 h-8 rounded-full p-[1.5px] flex-shrink-0">
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{background:'var(--deep)'}}>
                    <Sparkles size={14} style={{color:'var(--cyan)'}}/>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <p style={{fontSize:13,fontWeight:800,color:'#fff',letterSpacing:'.02em'}}>AI Movie Picks</p>
                  <p style={{fontSize:11,color:'rgba(255,255,255,.35)',fontWeight:400}}>Tell AI your mood — get perfect recommendations</p>
                </div>
                <span className="bdg bdg-ai">Claude AI</span>
              </button>
            </div>

            {showAi&&<AiRecommendations movies={movies} onMovieClick={go}/>}

            <div className="space-y-5 pt-2">
              {conW.length>0&&<MovieRow title="Continue Watching" emoji="▶" movies={conW} onMovieClick={go} variant="landscape" showProgress accent="var(--cyan)" onRemove={removeFromHistory}/>}
              {watchlist.length>0&&<MovieRow title="My List" emoji="❤" movies={watchlist} onMovieClick={go} accent="var(--purple)"/>}
              {trending.length>0&&<MovieRow title="Trending Now" emoji="🔥" movies={trending} onMovieClick={go} genre="trending" accent="var(--red)"/>}
              <MovieRow title="New Releases 2025" emoji="⚡" movies={latest} onMovieClick={go} genre="latest" accent="var(--cyan)"/>
              {bollywood.length>0&&<MovieRow title="Bollywood" emoji="🎬" movies={bollywood} onMovieClick={go} genre="bollywood" accent="var(--gold)"/>}
              {hindi.length>0&&<MovieRow title="Hindi Movies" emoji="🇮🇳" movies={hindi} onMovieClick={go} genre="hindi" accent="var(--orange)"/>}
              {action.length>0&&<MovieRow title="Action" emoji="💥" movies={action} onMovieClick={go} genre="action" accent="var(--red)"/>}
              {comedy.length>0&&<MovieRow title="Comedy" emoji="😂" movies={comedy} onMovieClick={go} genre="comedy" accent="var(--gold)"/>}
              {horror.length>0&&<MovieRow title="Horror & Thriller" emoji="👻" movies={horror} onMovieClick={go} genre="horror" accent="var(--purple)"/>}
              {romance.length>0&&<MovieRow title="Romance" emoji="💕" movies={romance} onMovieClick={go} genre="romance" accent="var(--pink)"/>}
              {uhd.length>0&&<MovieRow title="4K Ultra HD" emoji="🎥" movies={uhd} onMovieClick={go} genre="4k" accent="var(--cyan)"/>}
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center py-10 gap-1.5" style={{opacity:.2}}>
              <span style={{fontFamily:'var(--f-display)',fontSize:22,letterSpacing:'.04em',color:'#fff'}}>MFLIX</span>
              <p style={{fontSize:10,color:'rgba(255,255,255,.5)',letterSpacing:'.18em',textTransform:'uppercase'}}>Cinema · Redefined · v4.0</p>
            </div>
          </main>
        )}
        <ScrollToTop/>
        <BottomNav onSearchOpen={()=>setSearch(true)}/>
      </div>
    </>
  );
}
