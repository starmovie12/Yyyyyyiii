'use client';
import React,{createContext,useContext,useState,useCallback} from 'react';
type T='success'|'error'|'info'|'warning';
interface Toast{id:string;msg:string;type:T}
interface Ctx{toast:(msg:string,t?:T)=>void}
const C=createContext<Ctx>({toast:()=>{}});
export const useToast=()=>useContext(C);

export const ToastProvider:React.FC<{children:React.ReactNode}>=({children})=>{
  const [toasts,setToasts]=useState<Toast[]>([]);
  const toast=useCallback((msg:string,type:T='success')=>{
    const id=Date.now().toString();
    setToasts(p=>[...p.slice(-2),{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3200);
  },[]);
  const S:Record<T,{bg:string,dot:string}> = {
    success:{bg:'rgba(0,255,136,.09)',dot:'#00ff88'},
    error:  {bg:'rgba(255,10,60,.11)',dot:'#ff0a3c'},
    info:   {bg:'rgba(0,217,255,.09)',dot:'#00d9ff'},
    warning:{bg:'rgba(255,214,10,.09)',dot:'#ffd60a'},
  };
  return (
    <C.Provider value={{toast}}>
      {children}
      <div className="fixed top-16 left-0 right-0 z-[999] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t,i)=>(
          <div key={t.id} className="asd w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{background:S[t.type].bg,border:`1px solid ${S[t.type].dot}33`,backdropFilter:'blur(20px)',boxShadow:'0 8px 32px rgba(0,0,0,.5)',animationDelay:`${i*40}ms`}}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:S[t.type].dot,boxShadow:`0 0 8px ${S[t.type].dot}`}}/>
            <span style={{fontSize:13,fontWeight:700,color:'#fff'}}>{t.msg}</span>
          </div>
        ))}
      </div>
    </C.Provider>
  );
};
