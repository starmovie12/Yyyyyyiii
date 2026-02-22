'use client';
import React,{useState,useEffect,useMemo} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {fetchAllMovies} from '../../../services/firebaseService';
import {Movie} from '../../../types';
import {ArrowLeft,SlidersHorizontal} from 'lucide-react';
import {MovieCard} from '../../../components/MovieCard';
import {BottomNav} from '../../../components/BottomNav';
import {SearchOverlay} from '../../../components/SearchOverlay';

const GENRES=[
  {id:'all',label:'All',emoji:'🎬',a:'var(--red)',b:'#7a001e'},
  {id:'trending',label:'Trending',emoji:'🔥',a:'#ff6d00',b:'#b71c1c'},
  {id:'latest',label:'Latest 2025',emoji:'⚡',a:'var(--cyan)',b:'#005fa3'},
  {id:'bollywood',label:'Bollywood',emoji:'🎬',a:'var(--gold)',b:'#e65100'},
  {id:'hindi',label:'Hindi',emoji:'🇮🇳',a:'var(--orange)',b:'#7a3800'},
  {id:'action',label:'Action',emoji:'💥',a:'var(--red)',b:'#7a001e'},
  {id:'comedy',label:'Comedy',emoji:'😂',a:'var(--gold)',b:'#f57f17'},
  {id:'romance',label:'Romance',emoji:'💕',a:'var(--pink)',b:'#880e4f'},
  {id:'horror',label:'Horror',emoji:'👻',a:'var(--purple)',b:'#1a0033'},
  {id:'thriller',label:'Thriller',emoji:'🔪',a:'#546e7a',b:'#102027'},
  {id:'drama',label:'Drama',emoji:'🎭',a:'#00bcd4',b:'#006064'},
  {id:'4k',label:'4K Ultra',emoji:'🎥',a:'var(--cyan)',b:'#006064'},
  {id:'hollywood',label:'Hollywood',emoji:'🌍',a:'var(--purple)',b:'#1a0077'},
];

const SORT=['Newest','Oldest','Top Rated','A–Z'];

export default function CategoryPage(){
  const {genre}=useParams();
  const router=useRouter();
  const [movies,setMovies]=useState<Movie[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(false);
  const [active,setActive]=useState((genre as string)||'all');
  const [sort,setSort]=useState('Newest');
  const [showSort,setShowSort]=useState(false);

  useEffect(()=>{fetchAllMovies().then(d=>{setMovies(d);setLoading(false);});},[]);
  useEffect(()=>{setActive((genre as string)||'all');},[genre]);

  const base=useMemo(()=>{
    switch(active){
      case'all':return movies;
      case'trending':return movies.filter(m=>m.is_trending_now==='Yes');
      case'bollywood':return movies.filter(m=>m.industry?.toLowerCase().includes('bollywood'));
      case'hollywood':return movies.filter(m=>m.industry?.toLowerCase().includes('hollywood'));
      case'hindi':return movies.filter(m=>(m.languages||m.audio_type||'').toLowerCase().includes('hindi'));
      case'4k':return movies.filter(m=>m.quality_name?.includes('4K')||m.quality?.includes('4K'));
      case'latest':return movies.filter(m=>Number(m.year||0)>=2024);
      default:return movies.filter(m=>m.genre?.toLowerCase().includes(active));
    }
  },[movies,active]);

  const filtered=useMemo(()=>{
    const a=[...base];
    switch(sort){
      case'Newest':return a.sort((x,y)=>Number(y.year||0)-Number(x.year||0));
      case'Oldest':return a.sort((x,y)=>Number(x.year||0)-Number(y.year||0));
      case'Top Rated':return a.sort((x,y)=>Number(y.rating||0)-Number(x.rating||0));
      case'A–Z':return a.sort((x,y)=>(x.title||'').localeCompare(y.title||''));
      default:return a;
    }
  },[base,sort]);

  const cur=GENRES.find(g=>g.id===active)||GENRES[0];

  return(
    <>
      {search&&<SearchOverlay movies={movies} onClose={()=>setSearch(false)}/>}
      <div className="aurora-layer"/>
      <div className="relative min-h-screen pb-28" style={{background:'var(--void)',zIndex:1}}>
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 header-blur px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>router.back()}
              className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
              style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.09)'}}>
              <ArrowLeft size={18} color="#fff"/>
            </button>
            <div>
              <h1 style={{fontFamily:'var(--f-display)',fontSize:22,letterSpacing:'.04em',color:'#fff'}}>{cur.emoji} {cur.label}</h1>
              <p style={{fontSize:11,color:'rgba(255,255,255,.3)',fontWeight:600}}>{filtered.length} titles</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={()=>setShowSort(p=>!p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl active:scale-95 transition-transform"
              style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.09)',fontSize:11,fontWeight:700,color:'rgba(255,255,255,.7)'}}>
              <SlidersHorizontal size={13}/>{sort}
            </button>
            {showSort&&(
              <div className="absolute top-11 right-0 rounded-2xl overflow-hidden z-50 asd"
                style={{background:'var(--card2)',border:'1px solid rgba(255,255,255,.09)',minWidth:140,boxShadow:'0 8px 32px rgba(0,0,0,.6)'}}>
                {SORT.map(s=>(
                  <button key={s} onClick={()=>{setSort(s);setShowSort(false);}}
                    className="w-full px-4 py-3 text-left text-sm font-bold transition-colors"
                    style={{background:sort===s?'rgba(255,10,60,.15)':'transparent',color:sort===s?'var(--red)':'rgba(255,255,255,.65)',borderBottom:'1px solid rgba(255,255,255,.05)',fontSize:12}}>
                    {sort===s?'✓ ':''}{s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Genre tabs */}
        <div className="pt-20 pb-3 px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {GENRES.map(g=>{
              const on=active===g.id;
              return(
                <button key={g.id}
                  onClick={()=>{setActive(g.id);router.replace(`/category/${g.id}`);}}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-bold active:scale-95 transition-all ripple-wrap"
                  style={{
                    background:on?`linear-gradient(135deg,${g.a},${g.b})`:'rgba(255,255,255,.05)',
                    border:`1.5px solid ${on?g.a:'rgba(255,255,255,.07)'}`,
                    color:on?'white':'rgba(255,255,255,.45)',
                    fontSize:11,fontWeight:800,letterSpacing:'.02em',
                    boxShadow:on?`0 4px 16px ${g.a}44`:'none',
                  }}>
                  <span style={{fontSize:13}}>{g.emoji}</span>{g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {loading?(
          <div className="grid grid-cols-3 gap-3 px-4 pt-2">
            {Array.from({length:15}).map((_,i)=>(
              <div key={i} className="sk rounded-xl" style={{paddingBottom:'150%'}}/>
            ))}
          </div>
        ):filtered.length===0?(
          <div className="flex flex-col items-center py-28 gap-4">
            <div className="text-6xl aflt">{cur.emoji}</div>
            <p className="font-bold text-lg" style={{color:'rgba(255,255,255,.3)'}}>No {cur.label} movies</p>
            <button onClick={()=>router.push('/category/all')}
              className="px-5 py-2.5 rounded-2xl font-bold ripple-wrap"
              style={{background:'var(--red)',color:'white',border:'none',fontSize:12}}>
              Browse All
            </button>
          </div>
        ):(
          <div className="grid grid-cols-3 gap-3 px-4 pt-1 pb-4">
            {filtered.map((mv,i)=>(
              <div key={mv.movie_id} className="afu" style={{animationDelay:`${Math.min(i*30,500)}ms`,animationFillMode:'both'}}>
                <MovieCard movie={mv} onClick={()=>router.push(`/player/${mv.movie_id}`)}/>
              </div>
            ))}
          </div>
        )}
        <BottomNav onSearchOpen={()=>setSearch(true)}/>
      </div>
    </>
  );
}
