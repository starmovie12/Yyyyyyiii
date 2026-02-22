'use client';
import React,{useState,useEffect} from 'react';
import {WifiOff,Wifi} from 'lucide-react';
export const NetworkStatus=()=>{
  const [on,setOn]=useState(true);
  const [showOk,setShowOk]=useState(false);
  useEffect(()=>{
    const f=()=>{setOn(true);setShowOk(true);setTimeout(()=>setShowOk(false),3000);};
    const g=()=>{setOn(false);setShowOk(false);};
    window.addEventListener('online',f);window.addEventListener('offline',g);
    return()=>{window.removeEventListener('online',f);window.removeEventListener('offline',g);};
  },[]);
  if(on&&!showOk)return null;
  return(
    <div className="fixed top-0 left-0 right-0 z-[600] flex items-center justify-center gap-2 py-2.5 text-xs font-bold tracking-widest uppercase asd"
      style={{background:!on?'var(--red)':'var(--green)',color:'white',boxShadow:`0 2px 20px ${!on?'rgba(255,10,60,.5)':'rgba(0,255,136,.4)'}`}}>
      {!on?<WifiOff size={13}/>:<Wifi size={13}/>}
      {!on?'You are offline — reconnecting...':'Connection restored ✓'}
    </div>
  );
};
