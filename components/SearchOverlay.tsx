'use client';
import React,{useState,useEffect,useRef} from 'react';
import {X,Search,Clock,Sparkles,TrendingUp,Mic} from 'lucide-react';
import {Movie} from '../types';
import {useRouter} from 'next/navigation';
import {useToast} from '../context/ToastContext';

interface P{movies:Movie[];onClose:()=>void}
export const SearchOverlay:React.FC<P>=({movies,onClose})=>{
  const [q,setQ]=useState('');
  const [recent,setRecent]=useState<string[]>([]);
  const [aiMode,setAiMode]=useState(false);
  const [aiQuery,setAiQuery]=useState('');
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResults,setAiResults]=useState<Movie[]>([]);
  const [aiMsg,setAiMsg]=useState('');
  const ref=useRef<HTMLInputElement>(null);
  const router=useRouter();
  const {toast}=useToast();

  useEffect(()=>{
    ref.current?.focus();
    try{const s=localStorage.getItem('mflix_searches');if(s)setRecent(JSON.parse(s));}catch{}
  },[]);

  const results=q.trim().length>1
    ?movies.filter(m=>[m.title,m.genre,m.cast,m.director,m.industry].some(f=>f?.toLowerCase().includes(q.toLowerCase()))).slice(0,18)
    :[];

  const select=(mv:Movie)=>{
    const u=[mv.title,...recent.filter(s=>s!==mv.title)].slice(0,8);
    setRecent(u);
    try{localStorage.setItem('mflix_searches',JSON.stringify(u));}catch{}
    onClose();router.push(`/player/${mv.movie_id}`);
  };

  const aiSearch=async()=>{
    if(!aiQuery.trim())return;
    setAiLoading(true);setAiResults([]);setAiMsg('');
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:200,
          messages:[{role:'user',content:`User searched: "${aiQuery}". Give me 5-8 keywords (genre, mood, type) to search movies. Reply ONLY as JSON array of strings. Example: ["action","thriller","hindi"]`}],
        }),
      });
      const data=await res.json();
      let keywords:string[]=[];
      try{
        const txt=data.content?.[0]?.text||'[]';
        keywords=JSON.parse(txt.match(/\[.*\]/s)?.[0]||'[]');
      }catch{keywords=[aiQuery];}
      const found=movies.filter(m=>{
        const hay=`${m.genre||''} ${m.title||''} ${m.industry||''} ${m.short_description||''} ${m.cast||''}`.toLowerCase();
        return keywords.some((k:string)=>hay.includes(k.toLowerCase()));
      }).slice(0,12);
      setAiResults(found);
      setAiMsg(found.length>0?`Found ${found.length} movies for "${aiQuery}"!`:`No exact matches — showing related movies!`);
    }catch{
      const kw=aiQuery.toLowerCase().split(' ');
      const found=movies.filter(m=>{
        const hay=`${m.genre||''} ${m.title||''} ${m.industry||''}`.toLowerCase();
        return kw.some(k=>hay.includes(k));
      }).slice(0,12);
      setAiResults(found);
      setAiMsg(found.length>0?`Found ${found.length} movies!`:'Try different keywords.');
    }
    setAiLoading(false);
  };

  const trending=['Action','Comedy','Bollywood','Horror','4K','Drama','Romance','Thriller','2025','Hindi'];

  return(
    <div className="fixed inset-0 z-[300] flex flex-col afi" style={{background:'rgba(1,2,6,.97)',backdropFilter:'blur(24px)'}}>
      {/* Search bar */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4" style={{borderBottom:'1px solid rgba(255,255,255,.06)'}}>
        <div className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-3 glass-card">
          {aiMode
            ?<Sparkles size={17} style={{color:'var(--cyan)',flexShrink:0}}/>
            :<Search size={17} style={{color:'rgba(255,255,255,.3)',flexShrink:0}}/>
          }
          <input ref={ref} value={aiMode?aiQuery:q}
            onChange={e=>aiMode?setAiQuery(e.target.value):setQ(e.target.value)}
            onKeyDown={e=>aiMode&&e.key==='Enter'&&aiSearch()}
            placeholder={aiMode?'Ask AI: "a sad romantic movie..."':'Movies, actors, genres...'}
            className="flex-1 bg-transparent outline-none"
            style={{color:'#fff',fontSize:15,fontWeight:500}}/>
          {(q||aiQuery)&&(
            <button onClick={()=>{setQ('');setAiQuery('');setAiResults([]);setAiMsg('');}}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,.12)'}}>
                <X size={11} color="rgba(255,255,255,.6)"/>
              </div>
            </button>
          )}
        </div>
        <button onClick={onClose} style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.5)',padding:'0 4px'}}>Cancel</button>
      </div>

      {/* AI / Normal toggle */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <button onClick={()=>{setAiMode(false);setAiResults([]);setAiMsg('');}}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all"
          style={{background:!aiMode?'var(--red)':'rgba(255,255,255,.06)',color:!aiMode?'white':'rgba(255,255,255,.4)',fontSize:11,border:'none'}}>
          <Search size={12}/>Normal
        </button>
        <button onClick={()=>{setAiMode(true);setQ('');}}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all"
          style={{background:aiMode?'linear-gradient(135deg,var(--purple),var(--cyan))':'rgba(255,255,255,.06)',color:aiMode?'white':'rgba(255,255,255,.4)',fontSize:11,border:'none'}}>
          <Sparkles size={12}/>AI Search
        </button>
        {aiMode&&(
          <button onClick={aiSearch}
            className="ml-auto px-3 py-1.5 rounded-xl font-bold ripple-wrap"
            style={{background:'linear-gradient(135deg,var(--purple),var(--cyan))',color:'white',fontSize:11,border:'none'}}>
            {aiLoading?'Searching...':'Search →'}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar">
        {/* AI Results */}
        {aiMode&&(
          <>
            {aiMsg&&<div className="px-4 py-3 rounded-2xl asu" style={{background:'rgba(139,47,255,.08)',border:'1px solid rgba(139,47,255,.2)'}}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={12} style={{color:'var(--cyan)'}}/>
                <span style={{fontSize:11,fontWeight:700,color:'var(--cyan)'}}>AI Result</span>
              </div>
              <p style={{fontSize:12,color:'rgba(255,255,255,.7)'}}>{aiMsg}</p>
            </div>}
            {aiLoading&&(
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i=><div key={i} className="sk rounded-xl" style={{paddingBottom:'150%'}}/>)}
              </div>
            )}
            {!aiLoading&&aiResults.length>0&&(
              <div className="grid grid-cols-3 gap-3">
                {aiResults.map((mv,i)=>(
                  <div key={mv.movie_id} className="afu" style={{animationDelay:`${i*40}ms`}}>
                    <div className="cursor-pointer active:scale-95 transition-transform" onClick={()=>select(mv)}>
                      <div className="relative rounded-xl overflow-hidden" style={{paddingBottom:'150%'}}>
                        <img src={mv.poster} alt={mv.title} className="absolute inset-0 w-full h-full object-cover"
                          onError={e=>{(e.target as HTMLImageElement).src='https://picsum.photos/seed/s/300/450';}}/>
                        <div className="absolute inset-0 g-card"/>
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="font-bold lc2 text-white" style={{fontSize:10}}>{mv.title}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!aiLoading&&!aiMsg&&(
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="ai-ring w-16 h-16 rounded-full p-[2px] aflt">
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{background:'var(--deep)'}}>
                    <Sparkles size={24} style={{color:'var(--cyan)'}}/>
                  </div>
                </div>
                <p style={{fontSize:13,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
                  Describe what you want to watch<br/>AI will find it for you!
                </p>
              </div>
            )}
          </>
        )}

        {/* Normal search results */}
        {!aiMode&&q.trim().length>1&&(
          results.length>0?(
            <div className="grid grid-cols-3 gap-3">
              {results.map((mv,i)=>(
                <div key={mv.movie_id} className="afu cursor-pointer active:scale-95 transition-transform" style={{animationDelay:`${i*35}ms`}} onClick={()=>select(mv)}>
                  <div className="relative rounded-xl overflow-hidden" style={{paddingBottom:'150%'}}>
                    <img src={mv.poster} alt={mv.title} className="absolute inset-0 w-full h-full object-cover"
                      onError={e=>{(e.target as HTMLImageElement).src='https://picsum.photos/seed/s/300/450';}}/>
                    <div className="absolute inset-0 g-card"/>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="font-bold lc2 text-white" style={{fontSize:10}}>{mv.title}</p>
                      <p style={{fontSize:9,color:'rgba(255,255,255,.4)',marginTop:2}}>{mv.year}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ):(
            <div className="flex flex-col items-center py-20 gap-4">
              <Search size={40} style={{color:'rgba(255,255,255,.1)'}}/>
              <p style={{color:'rgba(255,255,255,.35)',fontWeight:700}}>No results for "{q}"</p>
              <button onClick={()=>setAiMode(true)}
                className="px-4 py-2 rounded-xl font-bold text-sm ripple-wrap"
                style={{background:'linear-gradient(135deg,var(--purple),var(--cyan))',color:'white',border:'none',fontSize:12}}>
                Try AI Search instead
              </button>
            </div>
          )
        )}

        {/* Default state */}
        {!aiMode&&q.trim().length<=1&&(
          <>
            {recent.length>0&&(
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={13} style={{color:'rgba(255,255,255,.3)'}}/>
                    <span style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,.3)',letterSpacing:'.1em',textTransform:'uppercase'}}>Recent</span>
                  </div>
                  <button onClick={()=>{setRecent([]);try{localStorage.removeItem('mflix_searches');}catch{}}}
                    style={{fontSize:11,fontWeight:700,color:'var(--red)'}}>Clear</button>
                </div>
                {recent.map(term=>(
                  <button key={term} onClick={()=>setQ(term)}
                    className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl active:bg-white/5 transition-colors text-left">
                    <Clock size={13} style={{color:'rgba(255,255,255,.2)',flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.6)'}}>{term}</span>
                  </button>
                ))}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} style={{color:'var(--red)'}}/>
                <span style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,.3)',letterSpacing:'.1em',textTransform:'uppercase'}}>Trending</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map(tag=>(
                  <button key={tag} onClick={()=>setQ(tag)}
                    className="px-4 py-2 rounded-full font-bold active:scale-95 transition-all"
                    style={{background:'var(--card)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',fontSize:13}}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
