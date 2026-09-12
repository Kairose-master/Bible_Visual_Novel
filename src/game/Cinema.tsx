import {useEffect,useRef,useState} from "react";
import {films,duration,locate} from "./films";
import "./cinema.css";
type Props={chapter:number;reduced:boolean;onClose:()=>void;continueLabel:string};
const stamp=(t:number)=>Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");
export default function Cinema({chapter,reduced,onClose,continueLabel}:Props){
 const [episode,setEpisode]=useState(chapter),[time,setTime]=useState(0),[playing,setPlaying]=useState(!reduced),[status,setStatus]=useState("loading"),[error,setError]=useState(""),[voice,setVoice]=useState(false),[voiceSupported,setVoiceSupported]=useState(false),[voiceError,setVoiceError]=useState("");
 const dialog=useRef<HTMLDialogElement>(null),host=useRef<HTMLDivElement>(null),clock=useRef(0),player=useRef<{update:(t:number,r:boolean)=>void;dispose:()=>void}|null>(null);
 const film=films[episode],total=duration(film),at=locate(film,time),shot=film.shots[at.index],finished=time>=total;
 const speaking=useRef(false),speechTicket=useRef(0);
 const playback=useRef({playing,reduced,status,total,boundary:at.start+shot.seconds});playback.current={playing,reduced,status,total,boundary:at.start+shot.seconds};
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;dialog.current?.showModal();setVoiceSupported("speechSynthesis" in window);const overflow=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=overflow;previous?.focus();};},[]);
 useEffect(()=>{
  const controller=new AbortController();setStatus("loading");setError("");clock.current=0;setTime(0);
  import("./filmScene").then(m=>m.createFilmScene(host.current!,episode,controller.signal)).then(p=>{if(controller.signal.aborted){p.dispose();return;}player.current=p;setStatus("ready");}).catch(e=>{if(!controller.signal.aborted){setStatus("error");setError("3D 애니메이션을 불러오지 못했습니다. 아래 자막과 전체 대본으로 내용을 볼 수 있습니다.");console.warn("Cinema unavailable:",e);}});
  return()=>{controller.abort();player.current=null;};
 },[episode]);
 useEffect(()=>{
  let raf=0,last=performance.now(),lastUI=0;
  const draw=(now:number)=>{raf=requestAnimationFrame(draw);const cfg=playback.current,dt=Math.min(.1,(now-last)/1000);last=now;
   if(!document.hidden&&cfg.playing&&cfg.status!=="loading"){clock.current=Math.min(speaking.current?cfg.boundary-.001:cfg.total,clock.current+dt);if(clock.current>=cfg.total)setPlaying(false);}
   if(!document.hidden){player.current?.update(clock.current,cfg.reduced);if(now-lastUI>100){setTime(clock.current);lastUI=now;}}
  };raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
 },[]);
 useEffect(()=>{const hide=()=>{if(document.hidden){setPlaying(false);if("speechSynthesis" in window)window.speechSynthesis.cancel();}};document.addEventListener("visibilitychange",hide);return()=>document.removeEventListener("visibilitychange",hide);},[]);
 useEffect(()=>{
  if(!voice||!playing||status==="loading"||finished||!voiceSupported)return;
  const speech=window.speechSynthesis;const utterance=new SpeechSynthesisUtterance(shot.speaker+". "+shot.text);utterance.lang="ko-KR";utterance.rate=.93;
  const voices=speech.getVoices().filter(v=>v.lang.toLowerCase().startsWith("ko"));if(voices.length)utterance.voice=voices[0];
  utterance.pitch=shot.speaker==="하나님"?.78:shot.speaker.startsWith("사탄")?.9:1;
  const ticket=++speechTicket.current;speaking.current=true;const release=()=>{if(speechTicket.current===ticket)speaking.current=false;};utterance.onend=release;
  utterance.onerror=e=>{release();if(e.error!=="interrupted"&&e.error!=="canceled")setVoiceError("기기 음성을 사용할 수 없습니다. 자막으로 계속 볼 수 있습니다.");};speech.cancel();speech.speak(utterance);return()=>{speechTicket.current++;speaking.current=false;speech.cancel();};
 },[episode,at.index,voice,playing,status,voiceSupported,finished,shot]);
 function seek(next:number){clock.current=Math.max(0,Math.min(total,next));setTime(clock.current);player.current?.update(clock.current,reduced);}
 function select(index:number){setEpisode(index);clock.current=0;setTime(0);setPlaying(!reduced);setVoiceError("");}
 const starts=film.shots.map((_,i)=>film.shots.slice(0,i).reduce((n,s)=>n+s.seconds,0));
 return <dialog ref={dialog} className="cinema" aria-labelledby="cinema-title" onCancel={e=>{e.preventDefault();onClose();}}>
 <div className="cinema-shell">
 <header className="cinema-header"><div><span>욥기를 처음 만나는 사람에게 · 설명 애니메이션</span><h2 id="cinema-title">{film.title}</h2></div><button className="cinema-exit" aria-label={continueLabel} onClick={onClose}>{continueLabel} ↗</button></header>
 <nav className="cinema-chapters" aria-label="설명 애니메이션 선택">{films.map((f,i)=><button key={f.title} onClick={()=>select(i)} aria-current={episode===i?"step":undefined}><b>0{i+1}</b><span>{f.title}</span></button>)}</nav>
 <div className="cinema-screen">
 <div ref={host} className="cinema-canvas"/>
 <div className="cinema-scene-label"><span>{film.subtitle}</span><small>대사: 성경 내용의 한국어 요약 · 외모와 몸짓: 상상 연출</small></div>
 {status==="loading"&&<div className="cinema-loading" role="status">장면과 등장인물을 준비하고 있습니다…</div>}
 {error&&<div className="cinema-loading" role="alert">{error}</div>}
 <div className={"cinema-captions "+(shot.speaker==="하나님"?"divine":shot.speaker.startsWith("사탄")?"accuser":"")} aria-live={playing?"off":"polite"}><span className="cinema-speaker">{shot.speaker}</span><p>{shot.text}</p><a href={"https://www.biblegateway.com/passage/?search="+encodeURIComponent("Job "+shot.ref.split(" · ")[0].replace("장",""))+"&version=KRV"} target="_blank" rel="noreferrer">욥기 {shot.ref} ↗</a></div>
 </div>
 <section className="cinema-controls" aria-label="애니메이션 재생 제어">
 <div className="cinema-transport"><button disabled={status==="loading"} aria-label={playing?"일시정지":"재생"} onClick={()=>{if(finished)seek(0);setPlaying(p=>!p);}}>{playing?"Ⅱ 일시정지":"▶ 재생"}</button><button aria-label="이전 컷" disabled={at.index===0} onClick={()=>seek(starts[Math.max(0,at.index-1)])}>‹ 이전 컷</button><button aria-label="다음 컷" disabled={at.index===film.shots.length-1} onClick={()=>seek(starts[Math.min(film.shots.length-1,at.index+1)])}>다음 컷 ›</button><button onClick={()=>{seek(0);setPlaying(!reduced);}}>처음부터</button><span className="cinema-time">{stamp(time)} / {stamp(total)}</span></div>
 <input type="range" min={0} max={total} step={.1} value={time} aria-label="애니메이션 재생 위치" aria-valuetext={stamp(time)+" / "+stamp(total)} onChange={e=>{setPlaying(false);seek(Number(e.target.value));}}/>
 <div className="cinema-footnote"><span>{at.index+1} / {film.shots.length} 컷 · {reduced?"동작 줄이기 적용: 정지 구도와 자막":"실시간 3D · 자막 항상 표시"}</span><button disabled={!voiceSupported} aria-pressed={voice} onClick={()=>{setVoice(v=>!v);setVoiceError("");}}>기기 음성 {voice?"켜짐":"꺼짐"}</button></div>
 {voice&&<p className="cinema-device-note">브라우저의 한국어 읽기 기능을 사용합니다. 기기에 따라 음색·지원 여부가 다르며 녹음된 성우 음성은 아닙니다.</p>}
 {voiceError&&<p role="status">{voiceError}</p>}
 {finished&&<div className="cinema-complete" role="status"><p>{film.summary}</p>{episode<5&&<button onClick={()=>select(episode+1)}>다음 설명 보기 →</button>}<button onClick={onClose}>{continueLabel}</button></div>}
 </section>
 <details className="cinema-transcript"><summary>전체 대본 · 본문과 연출 구분</summary><p>결말까지의 내용을 포함합니다. 화면의 하나님은 빛과 옷자락으로, 사탄은 고발자의 형상으로 표현했습니다. 성경이 외모를 묘사한 것이 아닙니다. 대사는 직접 인용이 아닌 요약입니다.</p><ol>{film.shots.map((s,i)=><li key={i}><button onClick={()=>{seek(starts[i]);setPlaying(false);}}> {stamp(starts[i])} · {s.speaker}</button><p>{s.text}</p><small>욥기 {s.ref}</small>{s.note&&<aside>{s.note}</aside>}</li>)}</ol><a href="https://www.bible.com/bible/3523/JOB.1.NRSVUE" target="_blank" rel="noreferrer">하늘 법정의 고발자 · 번역 주석 참고 ↗</a></details>
 </div></dialog>;
}
