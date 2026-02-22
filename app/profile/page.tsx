'use client';
import React,{useState,useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowLeft,Heart,Clock,Film,Trash2,ChevronRight,Moon,Bell,Globe,Zap,Star,Settings,Download,Share2} from 'lucide-react';
import {useWatchlist} from '../../context/WatchlistContext';
import {useWatchHistory} from '../../hooks/useWatchHistory';
import {MovieCard} from '../../components/MovieCard';
import {BottomNav} from '../../components/BottomNav';
import {SearchOverlay} from '../../components/SearchOverlay';
import {useToast} from '../../context/ToastContext';
import {fetchAllMovies} from '../../services/firebaseService';

export default function ProfilePage(){
  const router=useRouter();
  const {watchlist,removeFromWatchlist}=useWatchlist();
  const {history,clearHistory}=useWatchHistory();
  const {toast}=useToast();
  const [search,setSearch]=useState(false);
  const [tab,setTab]=useState<'list'|'history'|'settings'>('list');
  const [movies,setMovies]=useState<any[]>([]);
  const [confirm,setConfirm]=useState(false);
  const [quality,setQuality]=useState('Auto');
  const [autoplay,setAutoplay]=useState(true);
  const [notifs,setNotifs]=useState(true);
  const [lang,setLang]=useState('Hindi');

  useEffect(()=>{fetchAllMovies().then(setMovies);},[]);

  const totalMin=history.reduce((acc,h)=>{
    const r=String(h.movie.runtime||'0');
    const match=r.match(/(\d+)h\s*(\d+)?m?/);
    if(match)return acc+(parseInt(match[1])*60)+(parseInt(match[2]||'0'));
    const m=parseInt(r);return acc+(isNaN(m)?0:m);
  },0);
  const hours=Math.floor(totalMin/60);

  const TABS=[{id:'list',label:'❤ My List'},{id:'history',label:'▶ History'},{id:'settings',label:'⚙ Settings'}];

  return(
    <>
      {search&&<SearchOverlay movies={movies} onClose={()=>setSearch(false)}/>}
      <div className="aurora-layer"/>
      <div className="relative min-h-screen pb-28" style={{background:'var(--void)',zIndex:1}}>

        {/* Header */}
        <div className="px-4 pt-14 pb-6"
          style={{background:'linear-gradient(to bottom,rgba(14,22,40,.95),rgba(7,12,24,.85),transparent)'}}>
          <button onClick={()=>router.back()} className="mb-4 flex items-center gap-2 active:scale-95 transition-transform" style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.35)'}}>
            <ArrowLeft size={15}/> Back
          </button>

          {/* Profile card */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="ai-ring w-22 h-22 rounded-full p-[2px]" style={{width:80,height:80}}>
                <div className="w-full h-full rounded-full overflow-hidden" style={{border:'2px solid var(--deep)'}}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=mflix-ultra" className="w-full h-full object-cover" style={{background:'var(--card)'}} alt="Avatar"/>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{background:'var(--gold)',boxShadow:'0 0 12px rgba(255,214,10,.5)'}}>
                <Star size={11} fill="white" color="white"/>
              </div>
            </div>
            <div>
              <h2 style={{fontFamily:'var(--f-display)',fontSize:26,letterSpacing:'.04em',color:'#fff'}}>GUEST USER</h2>
              <p style={{fontSize:12,color:'rgba(255,255,255,.35)',fontWeight:500,marginTop:2}}>Premium Member · Free Plan</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{background:'linear-gradient(135deg,rgba(255,10,60,.2),rgba(139,47,255,.2))',border:'1px solid rgba(255,10,60,.3)'}}>
                <span style={{fontSize:9,fontWeight:900,color:'var(--red)',letterSpacing:'.1em',textTransform:'uppercase'}}>MFLIX PRO</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {icon:<Film size={18} style={{color:'var(--red)'}}/>,val:history.length,label:'Watched'},
              {icon:<Heart size={18} style={{color:'var(--pink)'}}/>,val:watchlist.length,label:'Saved'},
              {icon:<Clock size={18} style={{color:'var(--cyan)'}}/>,val:`${hours}h`,label:'Hours'},
            ].map(s=>(
              <div key={s.label} className="glass-card flex flex-col items-center gap-1 py-4 rounded-2xl">
                {s.icon}
                <span style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:'var(--f-display)'}}>{s.val}</span>
                <span style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:'.1em',textTransform:'uppercase'}}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-4 mb-4 p-1 rounded-2xl" style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)}
              className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              style={{
                background:tab===t.id?'var(--red)':'transparent',
                color:tab===t.id?'white':'rgba(255,255,255,.35)',
                boxShadow:tab===t.id?'0 4px 16px rgba(255,10,60,.4)':'none',
                fontSize:10,letterSpacing:'.06em',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-4">
          {/* MY LIST */}
          {tab==='list'&&(
            watchlist.length===0?(
              <div className="flex flex-col items-center py-20 gap-4">
                <Heart size={52} style={{color:'rgba(255,255,255,.07)'}}/>
                <p style={{fontWeight:700,color:'rgba(255,255,255,.3)'}}>Your list is empty</p>
                <p style={{fontSize:12,color:'rgba(255,255,255,.2)',textAlign:'center'}}>Tap + on any movie to save it here</p>
                <button onClick={()=>router.push('/')} className="btn-r px-6 py-3 rounded-2xl ripple-wrap" style={{fontSize:12}}>Browse Movies</button>
              </div>
            ):(
              <div className="grid grid-cols-3 gap-3">
                {watchlist.map((mv,i)=>(
                  <div key={mv.movie_id} className="afu" style={{animationDelay:`${i*40}ms`,animationFillMode:'both'}}>
                    <MovieCard movie={mv} onClick={()=>router.push(`/player/${mv.movie_id}`)}/>
                  </div>
                ))}
              </div>
            )
          )}

          {/* HISTORY */}
          {tab==='history'&&(
            history.length===0?(
              <div className="flex flex-col items-center py-20 gap-4">
                <Clock size={52} style={{color:'rgba(255,255,255,.07)'}}/>
                <p style={{fontWeight:700,color:'rgba(255,255,255,.3)'}}>No watch history yet</p>
              </div>
            ):(
              <div className="space-y-2">
                <div className="flex justify-end mb-2">
                  <button onClick={()=>setConfirm(true)} className="flex items-center gap-1.5 text-xs font-bold" style={{color:'var(--red)'}}>
                    <Trash2 size={12}/>Clear All
                  </button>
                </div>
                {history.map((item,i)=>(
                  <div key={item.movie.movie_id}
                    onClick={()=>router.push(`/player/${item.movie.movie_id}`)}
                    className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer active:scale-[.98] transition-transform afu"
                    style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',animationDelay:`${i*40}ms`,animationFillMode:'both'}}>
                    <img src={item.movie.poster} alt={item.movie.title}
                      className="w-14 h-20 object-cover rounded-xl flex-shrink-0"
                      onError={e=>{(e.target as HTMLImageElement).src='https://picsum.photos/seed/h/60/80';}}/>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold lc1 text-sm text-white">{item.movie.title}</p>
                      <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,.35)'}}>{item.movie.year} · {item.movie.genre?.split(',')[0]}</p>
                      <div className="mt-2 pt" style={{width:'100%'}}>
                        <div className="pf" style={{width:`${Math.min(item.progress,100)}%`}}/>
                      </div>
                      <p style={{fontSize:10,color:'rgba(255,255,255,.25)',marginTop:4}}>{Math.round(item.progress)}% watched</p>
                    </div>
                    <ChevronRight size={15} style={{color:'rgba(255,255,255,.15)',flexShrink:0}}/>
                  </div>
                ))}
              </div>
            )
          )}

          {/* SETTINGS */}
          {tab==='settings'&&(
            <div className="space-y-2">
              {[
                {icon:<Zap size={17} style={{color:'var(--cyan)'}}/>,label:'Video Quality',val:quality,action:()=>{const o=['Auto','4K','1080p','720p','480p'];setQuality(o[(o.indexOf(quality)+1)%o.length]);},type:'cycle'},
                {icon:<Moon size={17} style={{color:'var(--purple)'}}/>,label:'Autoplay Next',val:autoplay,action:()=>setAutoplay(p=>!p),type:'toggle'},
                {icon:<Bell size={17} style={{color:'var(--gold)'}}/>,label:'Notifications',val:notifs,action:()=>setNotifs(p=>!p),type:'toggle'},
                {icon:<Globe size={17} style={{color:'var(--green)'}}/>,label:'Language',val:lang,action:()=>setLang(l=>l==='Hindi'?'English':'Hindi'),type:'cycle'},
                {icon:<Download size={17} style={{color:'var(--cyan)'}}/>,label:'Download Quality',val:'1080p',action:()=>toast('Download quality updated','success'),type:'cycle'},
                {icon:<Share2 size={17} style={{color:'var(--pink)'}}/>,label:'Share App',val:'',action:()=>{try{navigator.share({title:'MFLIX',url:window.location.origin});}catch{toast('Link copied! Share with friends','success');}},type:'action'},
              ].map(s=>(
                <button key={s.label} onClick={s.action}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl active:scale-[.98] transition-transform"
                  style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
                  {s.icon}
                  <span className="flex-1 text-left text-sm font-bold text-white">{s.label}</span>
                  {s.type==='toggle'?(
                    <div className="rounded-full flex items-center px-0.5 transition-all" style={{width:42,height:24,background:s.val?'var(--red)':'rgba(255,255,255,.1)',justifyContent:s.val?'flex-end':'flex-start'}}>
                      <div className="w-5 h-5 bg-white rounded-full shadow-md transition-all"/>
                    </div>
                  ):s.type==='cycle'?(
                    <span style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,.4)',background:'rgba(255,255,255,.07)',padding:'3px 10px',borderRadius:8}}>{String(s.val)}</span>
                  ):(
                    <ChevronRight size={15} style={{color:'rgba(255,255,255,.2)'}}/>
                  )}
                </button>
              ))}

              {/* Danger */}
              <div className="mt-4 space-y-2">
                <p style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,.15)',letterSpacing:'.12em',textTransform:'uppercase',padding:'0 2px'}}>Danger Zone</p>
                <button onClick={()=>setConfirm(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl active:scale-[.98] transition-transform"
                  style={{background:'rgba(255,10,60,.08)',border:'1px solid rgba(255,10,60,.2)'}}>
                  <Trash2 size={17} style={{color:'var(--red)'}}/>
                  <span className="flex-1 text-left text-sm font-bold" style={{color:'var(--red)'}}>Clear Watch History</span>
                  <ChevronRight size={15} style={{color:'rgba(255,10,60,.4)'}}/>
                </button>
              </div>

              {/* Version */}
              <div className="flex flex-col items-center py-8 gap-1" style={{opacity:.3}}>
                <span style={{fontFamily:'var(--f-display)',fontSize:18,color:'#fff',letterSpacing:'.04em'}}>MFLIX</span>
                <p style={{fontSize:10,color:'rgba(255,255,255,.5)',letterSpacing:'.15em',textTransform:'uppercase'}}>v4.0 · Future Streaming</p>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        {confirm&&(
          <div className="fixed inset-0 z-[300] flex items-end justify-center pb-10 px-4" style={{background:'rgba(0,0,0,.85)',backdropFilter:'blur(12px)'}}>
            <div className="w-full max-w-sm p-6 rounded-3xl asi" style={{background:'var(--card2)',border:'1px solid rgba(255,255,255,.1)',boxShadow:'0 24px 80px rgba(0,0,0,.8)'}}>
              <h3 className="text-lg font-bold text-white mb-2">Clear History?</h3>
              <p style={{fontSize:13,color:'rgba(255,255,255,.45)',lineHeight:1.5,marginBottom:20}}>This will remove all watch history permanently.</p>
              <div className="flex gap-3">
                <button onClick={()=>setConfirm(false)} className="flex-1 h-12 rounded-2xl font-bold text-sm" style={{background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.7)',border:'none'}}>Cancel</button>
                <button onClick={()=>{clearHistory();setConfirm(false);toast('History cleared','info');}} className="btn-r flex-1 h-12 rounded-2xl ripple-wrap">Clear</button>
              </div>
            </div>
          </div>
        )}

        <BottomNav onSearchOpen={()=>setSearch(true)}/>
      </div>
    </>
  );
}
