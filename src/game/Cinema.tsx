import {useEffect,useRef,useState} from "react";
import {films,duration,locate} from "./films";
import {cinemaAssets} from "./cinemaAssets";
import CinematicMedia from "./CinematicMedia";
import "./cinema.css";
type Props={chapter:number;reduced:boolean;onClose:()=>void;continueLabel:string};
const stamp=(t:number)=>Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");
export default function Cinema({chapter,reduced,onClose,continueLabel}:Props){
 const [episode,setEpisode]=useState(chapter),[time,setTime]=useState(0),[playing,setPlaying]=useState(!reduced),[voice,setVoice]=useState(true),[status,setStatus]=useState("loading"),[error,setError]=useState("");
 const dialog=useRef<HTMLDialogElement>(null),audio=useRef<HTMLAudioElement|null>(null),clock=useRef(0);
 const film=films[episode],total=duration(film),at=locate(film,time),shot=film.shots[at.index],finished=time>=total-.05;
 const state=useRef({playing,status,total});state.current={playing,status,total};
 const attempt=useRef(0);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;dialog.current?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=overflow;previous?.focus();};},[]);
 useEffect(()=>{
  const a=new Audio(cinemaAssets[episode].audio);audio.current=a;a.preload="auto";setStatus("loading");setError("");clock.current=0;setTime(0);const ticket=++attempt.current;
  const ready=()=>{if(ticket!==attempt.current)return;if(clock.current>0)a.currentTime=Math.min(clock.current,a.duration);setStatus("ready");};
  const failed=()=>{if(ticket!==attempt.current)return;setStatus("error");setError("음성 파일을 불러오지 못했습니다. 자막과 전체 대본으로 계속 볼 수 있습니다.");};
  const ended=()=>{clock.current=duration(films[episode]);setTime(clock.current);setPlaying(false);};
  a.addEventListener("canplay",ready);a.addEventListener("error",failed);a.addEventListener("ended",ended);a.load();
  return()=>{attempt.current++;a.pause();a.removeEventListener("canplay",ready);a.removeEventListener("error",failed);a.removeEventListener("ended",ended);a.removeAttribute("src");a.load();if(audio.current===a)audio.current=null;};
 },[episode]);
 useEffect(()=>{const a=audio.current;if(a)a.muted=!voice;},[voice,episode]);
 useEffect(()=>{
  const a=audio.current;if(!a||status!=="ready")return;
  if(playing){const ticket=attempt.current;void a.play().catch(()=>{if(attempt.current===ticket){setPlaying(false);setError("재생 버튼을 누르면 음성과 함께 시작합니다.");}});}else a.pause();
 },[playing,status,episode]);
 useEffect(()=>{
  let raf=0,last=performance.now(),ui=0;
  const draw=(now:number)=>{raf=requestAnimationFrame(draw);const cfg=state.current,dt=Math.min(.1,(now-last)/1000);last=now;
   if(!document.hidden&&cfg.playing){if(cfg.status==="ready"&&audio.current)clock.current=Math.min(cfg.total,audio.current.currentTime);else if(cfg.status==="error")clock.current=Math.min(cfg.total,clock.current+dt);
    if(clock.current>=cfg.total)setPlaying(false);}
   if(now-ui>80){setTime(clock.current);ui=now;}
  };raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
 },[]);
 useEffect(()=>{const hide=()=>{if(document.hidden){audio.current?.pause();setPlaying(false);}};document.addEventListener("visibilitychange",hide);return()=>document.removeEventListener("visibilitychange",hide);},[]);
 function seek(next:number){const value=Math.max(0,Math.min(total,next));clock.current=value;setTime(value);if(audio.current&&Number.isFinite(audio.current.duration))audio.current.currentTime=Math.min(value,audio.current.duration);}
 function select(index:number){if(index===episode){seek(0);}else{audio.current?.pause();setEpisode(index);clock.current=0;setTime(0);}setPlaying(!reduced);setError("");}
 const starts=film.shots.map((_,i)=>film.shots.slice(0,i).reduce((n,s)=>n+s.seconds,0));
 return <dialog ref={dialog} className="cinema" aria-labelledby="cinema-title" onCancel={e=>{e.preventDefault();onClose();}}>
 <div className="cinema-shell">
 <header className="cinema-header"><div><span>욥기를 처음 만나는 사람에게 · 음성으로 듣는 이야기</span><h2 id="cinema-title">{film.title}</h2></div><button className="cinema-exit" aria-label={continueLabel} onClick={onClose}>{continueLabel} ↗</button></header>
 <nav className="cinema-chapters" aria-label="설명 애니메이션 선택">{films.map((f,i)=><button key={f.title} onClick={()=>select(i)} aria-current={episode===i?"step":undefined}><b>0{i+1}</b><span>{f.title}</span></button>)}</nav>
 <div className="cinema-screen" data-film-frame={JSON.stringify({chapter:episode,shot:at.index,time:Math.round(time*10)/10,status,heavenly:(episode===0&&at.index>0)||(episode===1&&at.index>=2&&at.index<=4)})}>
 <CinematicMedia chapter={episode} shot={at.index} time={time} playing={playing&&status!=="loading"} reduced={reduced}/>
 <div className="cinema-scene-label"><span>{film.subtitle}</span><small>대사: 성경 내용의 한국어 요약 · 인물과 영상: 상상 연출</small></div>
 <div className={"cinema-captions "+(shot.speaker==="하나님"?"divine":shot.speaker.startsWith("사탄")?"accuser":"")} aria-live={playing?"off":"polite"}><span className="cinema-speaker">{shot.speaker}</span><p>{shot.text}</p><a href={"https://www.biblegateway.com/passage/?search="+encodeURIComponent("Job "+shot.ref.split(" · ")[0].replace("장",""))+"&version=KRV"} target="_blank" rel="noreferrer">욥기 {shot.ref} ↗</a></div>
 </div>
 <section className="cinema-controls" aria-label="애니메이션 재생 제어">
 <div className="cinema-transport"><button disabled={status==="loading"} aria-label={playing?"일시정지":"재생"} onClick={()=>{if(finished)seek(0);setError("");setPlaying(p=>!p);}}>{playing?"Ⅱ 일시정지":"▶ 재생"}</button><button aria-label="이전 컷" disabled={at.index===0} onClick={()=>seek(starts[Math.max(0,at.index-1)])}>‹ 이전 컷</button><button aria-label="다음 컷" disabled={at.index===film.shots.length-1} onClick={()=>seek(starts[Math.min(film.shots.length-1,at.index+1)] + .001)}>다음 컷 ›</button><button onClick={()=>{seek(0);setPlaying(!reduced);}}>처음부터</button><span className="cinema-time">{stamp(time)} / {stamp(total)}</span></div>
 <input type="range" min={0} max={total} step={.01} value={time} aria-label="애니메이션 재생 위치" aria-valuetext={stamp(time)+" / "+stamp(total)} onChange={e=>{setPlaying(false);seek(Number(e.target.value));}}/>
 <div className="cinema-footnote"><span>{at.index+1} / {film.shots.length} 컷 · {reduced?"동작 줄이기 · 정지 이미지":"시네마틱 영상 · 한국어 음성"}</span><button aria-pressed={voice} onClick={()=>setVoice(v=>!v)}>음성 {voice?"켜짐":"꺼짐"}</button></div>
 {status==="loading"&&<p role="status" className="cinema-device-note">한국어 음성을 불러오는 중…</p>}
 {error&&<p role="status" className="cinema-device-note">{error}</p>}
 {finished&&<div className="cinema-complete" role="status"><p>{film.summary}</p>{episode<5&&<button onClick={()=>select(episode+1)}>다음 설명 보기 →</button>}<button onClick={onClose}>{continueLabel}</button></div>}
 </section>
 <details className="cinema-transcript"><summary>전체 대본 · 본문과 연출 구분</summary><p>결말까지의 내용을 포함합니다. 하나님과 사탄의 외모·몸짓은 문학적 상상이며, 성경이 외모를 묘사한 것이 아닙니다. 대사는 직접 인용이 아닌 요약입니다. Arthur 합성 음성으로 해설과 대사를 읽습니다. 짧은 생성 영상들을 반복·재구성하여 사용하며, 입 모양이 한국어 음성과 정확히 일치하는 방식은 아닙니다.</p><ol>{film.shots.map((s,i)=><li key={i}><button onClick={()=>{seek(starts[i]+.001);setPlaying(false);}}>{stamp(starts[i])} · {s.speaker}</button><p>{s.text}</p><small>욥기 {s.ref}</small>{s.note&&<aside>{s.note}</aside>}</li>)}</ol><a href="https://www.bible.com/bible/3523/JOB.1.NRSVUE" target="_blank" rel="noreferrer">하늘 법정의 고발자 · 번역 주석 참고 ↗</a></details>
 </div></dialog>;
}
