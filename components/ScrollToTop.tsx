'use client';
import React,{useState,useEffect} from 'react';
import {ChevronUp} from 'lucide-react';
export const ScrollToTop=()=>{
  const [show,setShow]=useState(false);
  useEffect(()=>{
    const f=()=>setShow(window.scrollY>350);
    window.addEventListener('scroll',f,{passive:true});
    return()=>window.removeEventListener('scroll',f);
  },[]);
  if(!show)return null;
  return(
    <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
      className="fixed bottom-24 right-4 z-40 w-11 h-11 rounded-2xl flex items-center justify-center active:scale-90 transition-all asi neon-red ripple-wrap"
      style={{background:'linear-gradient(145deg,var(--red),#7a001e)',border:'1px solid rgba(255,255,255,.12)'}}>
      <ChevronUp size={20} color="white" strokeWidth={2.5}/>
    </button>
  );
};
