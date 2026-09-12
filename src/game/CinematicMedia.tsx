import {useEffect,useRef,useState} from "react";
export default function CinematicMedia({chapter,shot=0,time=0,playing,reduced,ambient=false}:{chapter:number;shot?:number;time?:number;playing:boolean;reduced:boolean;ambient?:boolean}){
 const scene=ambient?chapter:chapter===0?(shot===0?5:0):chapter===1&&shot>=2&&shot<=4?0:chapter;
 const video=useRef<HTMLVideoElement>(null),[failed,setFailed]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{setFailed(false);setReady((video.current?.readyState??0)>=2);},[scene,reduced]);
 useEffect(()=>{const v=video.current;if(!v||!ready)return;let cancelled=false;if(playing&&!reduced){void v.play().catch(e=>{if(!cancelled&&e.name!=="AbortError")setFailed(true);});}else v.pause();return()=>{cancelled=true;};},[playing,reduced,scene,ready]);
 useEffect(()=>{const v=video.current;if(!v||!ready||ambient||!Number.isFinite(v.duration))return;const desired=time%v.duration;if(Math.abs(v.currentTime-desired)>(playing?1.5:.08))v.currentTime=desired;},[time,playing,ready,ambient,scene]);
 return <div className="cinematic-media" data-cinematic-scene={scene}>
 <img src={"./assets/cinema/scene-"+scene+".webp"} alt={["빛에 둘러싸인 하나님과 어두운 망토의 고발자가 대화하는 상상 장면","폐허에서 슬퍼하는 욥과 전령","뜰에 둘러앉아 논쟁하는 욥과 세 친구","하늘을 향해 손을 드는 욥","폭풍과 바다 앞에 선 욥","위로를 나누는 욥과 방문객"][scene]}/>
 {!reduced&&!failed&&<video key={scene} ref={video} muted playsInline loop preload="auto" poster={"./assets/cinema/scene-"+scene+".webp"} src={"./assets/cinema/scene-"+scene+".mp4"} onLoadedData={()=>setReady(true)} onError={()=>setFailed(true)} aria-hidden="true"/>}
 {failed&&!ambient&&<small className="cinema-video-fallback">영상 연결이 원활하지 않아 장면 이미지로 표시합니다.</small>}
 </div>;
}
