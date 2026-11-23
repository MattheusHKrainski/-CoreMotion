'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCoreMotiom } from '@/lib/store';
import { positionKey, savedPosition } from '@/lib/page-position';

/** Store coordinates only in this tab. Wait for asynchronous content before restoring. */
export default function PagePosition() {
 const pathname=usePathname();
 const {activeView}=useCoreMotiom();
 const attempted=useRef(false);
 useEffect(()=>{
  if(!pathname || pathname.startsWith('/auth') || pathname==='/entrar')return;
  // The provider restores the requested view after mount; don't record the interim home.
  const desiredView=new URLSearchParams(window.location.search).get('view')||'home';
  if(pathname==='/'&&activeView!==desiredView)return;
  const key=positionKey(pathname,activeView);
  let restoring=false, frame=0, timer:ReturnType<typeof setTimeout>|undefined;
  let observer:ResizeObserver|undefined;
  const write=()=>{if(restoring)return;try{sessionStorage.setItem(key,JSON.stringify({y:window.scrollY,at:Date.now()}));}catch{/* Browsers may disallow storage. */}};
  const stop=()=>{restoring=false;observer?.disconnect();if(timer)clearTimeout(timer);};
  const interrupt=()=>{stop();write();};
  const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(write);};
  const previous=window.history.scrollRestoration;
  window.history.scrollRestoration='manual';
  if(!attempted.current){
   attempted.current=true;
   const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
   if(navigation?.type==='reload'){
    let target:number|null=null;
    try{target=savedPosition(sessionStorage.getItem(key));}catch{/* Start normally without storage. */}
    if(target!==null){
     restoring=true;
     const restore=()=>{
      if(!restoring||target===null)return;
      const available=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
      window.scrollTo({top:Math.min(target,available),behavior:'instant'});
      if(available>=target){stop();write();}
     };
     // Images, remote posts and product grids can change height after initial render.
     observer=new ResizeObserver(restore);observer.observe(document.body);
     timer=setTimeout(()=>{restore();stop();write();},10000);
     frame=requestAnimationFrame(restore);
    }
   }
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('pagehide',write);
  window.addEventListener('wheel',interrupt,{passive:true});
  window.addEventListener('touchstart',interrupt,{passive:true});
  const keydown=(event:KeyboardEvent)=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))interrupt();};
  window.addEventListener('keydown',keydown);
  return()=>{write();if(restoring)attempted.current=false;stop();cancelAnimationFrame(frame);window.history.scrollRestoration=previous;window.removeEventListener('scroll',onScroll);window.removeEventListener('pagehide',write);window.removeEventListener('wheel',interrupt);window.removeEventListener('touchstart',interrupt);window.removeEventListener('keydown',keydown);};
 },[pathname,activeView]);
 return null;
}
