'use client';
import React from 'react';
const Sk=({style={},className=''}:{style?:React.CSSProperties,className?:string})=>(
  <div className={`sk ${className}`} style={style}/>
);
export const HomePageSkeleton=()=>(
  <div style={{background:'var(--void)'}} className="min-h-screen pt-16">
    <div className="px-4 pb-6">
      <Sk style={{width:'100%',height:'min(82vw,520px)',borderRadius:20}}/>
    </div>
    {[1,2,3,4].map(i=>(
      <div key={i} className="mb-8 px-4">
        <div className="flex items-center gap-3 mb-4">
          <Sk style={{width:3,height:20,borderRadius:99}}/>
          <Sk style={{width:140,height:16,borderRadius:8}}/>
        </div>
        <div className="flex gap-2.5 overflow-hidden">
          {[1,2,3,4,5].map(j=>(
            <div key={j} className="flex-shrink-0 w-[110px]">
              <Sk style={{width:'100%',paddingBottom:'150%',borderRadius:12}}/>
              <Sk style={{width:'100%',height:12,marginTop:8,borderRadius:6}}/>
              <Sk style={{width:'60%',height:10,marginTop:6,borderRadius:6}}/>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
export const PlayerPageSkeleton=()=>(
  <div style={{background:'var(--base)'}} className="min-h-screen flex flex-col">
    <Sk style={{width:'100%',aspectRatio:'16/9',borderRadius:0}}/>
    <div className="p-5 space-y-4 flex-1">
      <Sk style={{width:'75%',height:32,borderRadius:12}}/>
      <Sk style={{width:'50%',height:18,borderRadius:8}}/>
      <div className="flex gap-2">
        {[1,2,3,4].map(i=><Sk key={i} style={{width:64,height:30,borderRadius:10}}/>)}
      </div>
      <Sk style={{width:'100%',height:52,borderRadius:16}}/>
      <Sk style={{width:'100%',height:52,borderRadius:16}}/>
      <Sk style={{width:'100%',height:110,borderRadius:16}}/>
    </div>
  </div>
);
