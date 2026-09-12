import { useEffect, useReducer, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { beats, chapters, layerLabels, reflectionQuestions } from "./content";
import { initialState, reducer, summarize } from "./engine";
import Stage3D from "./Stage3D";
import Cinema from "./Cinema";
import CinematicMedia from "./CinematicMedia";
import {landmarks} from "./landmarks";
const assetBase = "./assets/";
const images: Record<string,{src:string;alt:string}> = {
 sky:{src:assetBase+"cinema/scene-0.webp",alt:"하나님과 고발자의 하늘 법정 대화를 상상한 장면"},
 ruins:{src:assetBase+"cinema/scene-1.webp",alt:"무너진 집과 재 가운데 앉아 있는 욥"},
 friends:{src:assetBase+"cinema/scene-2.webp",alt:"욥을 둘러앉은 세 친구의 반복되는 원형 구도"},
 storm:{src:assetBase+"cinema/scene-4.webp",alt:"작은 사람 너머로 수직으로 솟은 거대한 폭풍"},
 creatures:{src:assetBase+"cinema/scene-4.webp",alt:"인간에게 길들여지지 않은 물가와 바다의 거대한 생명"},
 silence:{src:assetBase+"cinema/scene-5.webp",alt:"폭풍이 지나간 뒤, 비어 있는 돌과 조용한 새벽"}
};
function Icon({kind}:{kind:"sound"|"settings"|"book"|"arrow"}) {
 return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{kind==="sound"?<><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 8q6 4 0 8"/></>:kind==="settings"?<><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="17" r="3" fill="currentColor"/></>:kind==="book"?<><path d="M12 5v15M3 4q5-2 9 1 4-3 9-1v14q-5-2-9 2-4-4-9-2z"/></>:<path d="M4 12h15m-5-5 5 5-5 5"/>}</svg>
}
function Modal({title,children,close}:{title:string;children:ReactNode;close:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null; ref.current?.showModal(); return ()=>previous?.focus();},[]);
 return <dialog ref={ref} className="modal" aria-labelledby="modal-title" onCancel={close} onClick={e=>{if(e.target===e.currentTarget) close();}}><div className="modal-inner"><header><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="닫기" onClick={close}>×</button></header>{children}</div></dialog>;
}
export default function Game(){
 const [state,dispatch]=useReducer(reducer,undefined,initialState);
 const [modal,setModal]=useState<"settings"|"notes"|"about"|"restart"|null>(null);
 const [font,setFont]=useState(1);
 const [film,setFilm]=useState<{chapter:number;after:"start"|"resume"|null}|null>(null);
 const [wide,setWide]=useState(false);
 const [reduced,setReduced]=useState(false);
 const [sound,setSound]=useState(false);
 const [audioError,setAudioError]=useState("");
 const [pauseSeconds,setPauseSeconds]=useState<number|null>(null);
 const audio=useRef<AudioContext|null>(null); const gain=useRef<GainNode|null>(null);
 const panelRef=useRef<HTMLHeadingElement>(null);
 const beat=beats[state.panel];const chapter=chapters[beat.chapter];
 const isCover=state.phase==="cover";const isEnd=state.phase==="ending";
 const art=images[isCover?"storm":isEnd?"silence":beat.image||chapter.image];
 useEffect(()=>{const mq=window.matchMedia("(prefers-reduced-motion: reduce)");setReduced(mq.matches);const change=()=>setReduced(mq.matches);mq.addEventListener("change",change);return()=>mq.removeEventListener("change",change);},[]);
 useEffect(()=>{if(!isCover){panelRef.current?.focus();window.scrollTo({top:0,behavior:"instant"});}setPauseSeconds(null);},[state.panel,state.phase]);
 useEffect(()=>{if(pauseSeconds===null||pauseSeconds<=0)return;const timer=window.setTimeout(()=>setPauseSeconds(n=>n===null?null:n-1),1000);return()=>clearTimeout(timer);},[pauseSeconds]);
 useEffect(()=>{const hide=()=>{if(document.hidden){void audio.current?.suspend();}else if(sound){void audio.current?.resume();}};document.addEventListener("visibilitychange",hide);return()=>document.removeEventListener("visibilitychange",hide);},[sound]);
 useEffect(()=>()=>{void audio.current?.close();},[]);
 useEffect(()=>{
  const key=(event:KeyboardEvent)=>{
   if(event.repeat||event.altKey||event.metaKey||event.ctrlKey||modal||film)return;
   const target=event.target as HTMLElement;
   if(target.closest("button,a,input,select,textarea"))return;
   if(state.phase==="reading"&&state.selected===null&&/^Digit[1-4]$/.test(event.code)){event.preventDefault();dispatch({type:"choose",panel:state.panel,choice:Number(event.code.slice(-1))-1});}
  };window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
 },[state,modal,film]);
 async function toggleSound(){
  if(sound){if(gain.current&&audio.current)gain.current.gain.setTargetAtTime(0,audio.current.currentTime,.1);setSound(false);return;}
  try{
   if(!audio.current){
    const context=new AudioContext();audio.current=context;const g=context.createGain();g.gain.value=0;g.connect(context.destination);gain.current=g;
    const buffer=context.createBuffer(1,context.sampleRate*4,context.sampleRate);const data=buffer.getChannelData(0);
    let seed=741,last=0;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;last=(last+(.035*(seed/2147483647*2-1)))/1.025;data[i]=last;}
    const source=context.createBufferSource();source.buffer=buffer;source.loop=true;
    const filter=context.createBiquadFilter();filter.type="lowpass";filter.frequency.value=350;source.connect(filter);filter.connect(g);source.start();
   }
   await audio.current.resume();gain.current?.gain.setTargetAtTime(.3,audio.current.currentTime,.3);setSound(true);setAudioError("");
  }catch{setAudioError("이 브라우저에서는 음향을 재생할 수 없습니다. 소리 없이 계속 플레이할 수 있습니다.");}
 }
 function choose(index:number){dispatch({type:"choose",panel:state.panel,choice:index});}

 const result=summarize(state);
 const sourceHref="https://www.biblegateway.com/passage/?search="+encodeURIComponent("Job "+(isCover?"1":beat.ref))+"&version=KRV";
 const notes= <><p className="note-intro">{chapter.ref} · 대사는 짧은 요약과 문학적 재구성입니다.</p>{layerLabels.map((label,i)=><section className="note-section" key={label}><span className="note-number">0{i+1}</span><div><h3>{label}</h3><p>{chapter.layers[i]}</p></div></section>)}<section className="discussion"><span>함께 나눌 질문</span><p>{chapter.question}</p></section><a className="text-link" href={sourceHref} target="_blank" rel="noreferrer">현재 패널의 성경 본문 읽기 ↗</a></>;
 return <div className={"novel "+(reduced?"reduced":"")} style={{"--reader-scale":font} as CSSProperties}>
 <a className="skip-link" href="#main">본문으로 건너뛰기</a>
 <header className="topbar"><button className="brand" onClick={()=>{if(!isCover)setModal("restart");}} aria-label="작품 처음 화면"><span className="brand-mark">J</span><span>THE BOOK OF JOB<small>대답 없는 법정</small></span></button><div className="tools"><button className="icon-button" aria-label={sound?"음향 끄기":"음향 켜기"} aria-pressed={sound} onClick={toggleSound}><Icon kind="sound"/><span className="tool-label">{sound?"ON":"OFF"}</span></button><button className="icon-button" onClick={()=>setModal("settings")} aria-label="읽기 설정"><Icon kind="settings"/></button></div></header>
 <main id="main">
 {isCover?<section className="cover">
 <div className="cover-art">{!film&&<CinematicMedia chapter={1} playing={!reduced} reduced={reduced} ambient/>}</div>
 <div className="cover-copy"><div className="eyebrow"><span/>AN INTERACTIVE 3D STORY · EPISODE 01</div><p className="cover-kicker">욥기</p><h1>대답 없는<br/><em>법정</em></h1><p className="english-title">When God Does Not Explain</p><p className="cover-description">고난의 이유를 찾는 대신,<br/>설명할 수 없는 사람 곁에 머무는 이야기.</p><button className="start-button" onClick={()=>setFilm({chapter:0,after:"start"})}>이야기 시작하기 <Icon kind="arrow"/></button><button className="text-link cinema-entry" onClick={()=>setFilm({chapter:0,after:null})}>▶ 욥기 설명 애니메이션 · 6편 모두 보기</button><div className="cover-facts"><span>6개의 장</span><span>설명·성찰 포함 약 20–27분</span><span>3D 탐색 · 24개의 시선</span></div></div>
 <div className="cover-bottom"><span>“설명하지 못하는 고통 곁에 머무를 수 있는가?”</span><button className="text-link" onClick={()=>setModal("about")}>작품과 읽기 안내 <span>↗</span></button></div>
 </section>:isEnd?<section className="ending">
 <div className="ending-visual"><img src={art.src} alt={art.alt}/><span>EPILOGUE / 당신에게 남은 질문</span></div>
 <div className="ending-body"><p className="eyebrow">THE COURT REMAINS OPEN</p><h1 ref={panelRef} tabIndex={-1}>정답 대신,<br/>당신에게 남은 것</h1><p className="result-summary">{result.text}</p><p className="muted">이번 선택의 거울입니다. 성격 검사, 신앙의 등급, 옳고 그름의 판정이 아닙니다.</p>
 <div className="reflection-cards">{result.focus.map((i,n)=><article key={i}><span>0{n+1} / 성찰</span><h2>{reflectionQuestions[i]}</h2><p>{["이유를 찾던 순간, 그 사람의 이야기는 충분히 들었나요?","고쳐 주고 싶었던 말 속에 어떤 아픔이 있었나요?","옳은 말을 지키려는 마음이 누구의 목소리를 덮었나요?","답을 주지 않고도 함께할 수 있는 작은 행동은 무엇인가요?"][i]}</p></article>)}</div>
 <details className="trace"><summary>내가 골랐던 말 돌아보기 · {state.history.length}개의 순간</summary><ol>{state.history.map(h=><li key={h.panel}><span>{chapters[beats[h.panel].chapter].title} / {beats[h.panel].title}</span><p>{beats[h.panel].choices[h.choice].label}</p></li>)}</ol></details>
 <blockquote className="closing">“욥기는 고난의 원인을 알려주는 이야기가 아니다.<br/>고난 앞에서 인간이 얼마나 쉽게 설명을 만들어내는지를 폭로하는 이야기다.”<cite>이 작품이 택한 해석적 선언 · 욥기 전체의 유일한 해석은 아닙니다.</cite></blockquote>
 <section className="final-discussion"><h2>이야기 밖에서, 함께</h2><p>{chapter.question}</p><p className="muted">각자 한 문장으로 나누고, 서로의 답을 고치기 전에 끝까지 들어 보세요.</p></section>
 <div className="end-actions"><button className="start-button" onClick={()=>setModal("notes")}>본문과 해설 읽기 <Icon kind="book"/></button><button className="outline-button" onClick={()=>setModal("restart")}>처음부터 다시 읽기</button><button className="text-link" onClick={()=>setModal("about")}>출처 · 작품 안내</button></div></div>
 </section>:state.phase==="reflection"?<section className="interlude">
 <div className="interlude-image"><img src={images[chapter.image].src} alt={images[chapter.image].alt}/></div>
 <div className="interlude-content"><p className="eyebrow">CHAPTER 0{beat.chapter+1} / 잠시 머무르기</p><h1 ref={panelRef} tabIndex={-1}>{chapter.question}</h1><p>답을 입력하거나 남길 필요는 없습니다.<br/>떠오르는 사람과 문장에 잠시 머물러 보세요.</p><div className="pause-clock" aria-live="polite">{pauseSeconds===null?"서두르지 않아도 괜찮습니다.":pauseSeconds>0?pauseSeconds+"초 · 잠시 머무는 중":"원할 때 다음 장으로 가세요."}</div><button className="outline-button" onClick={()=>setPauseSeconds(30)}>30초 동안 머무르기</button><button className="text-link" onClick={()=>setModal("notes")}>본문 · 해설 · 성찰 열기</button><button className="start-button" onClick={()=>setFilm({chapter:beat.chapter+1,after:"resume"})}>다음 장으로 <Icon kind="arrow"/></button><small>기다림은 선택입니다. 언제든 이어 갈 수 있습니다.</small></div>
 </section>:<section className={"reading chapter-"+beat.chapter+(wide?" immersive":"")}>
 <div className="chapter-heading"><div><span className="eyebrow">CHAPTER 0{beat.chapter+1}</span><h1>{chapter.title}</h1></div><span className="chapter-subtitle">{chapter.subtitle}</span><button className="scene-expand" aria-pressed={wide} onClick={()=>setWide(v=>!v)}>{wide?"대화 함께 보기":"장면 크게 보기"} ⛶</button><button className="chapter-film" onClick={()=>setFilm({chapter:beat.chapter,after:null})}>▶ 이 장의 설명 애니메이션</button><span className="panel-counter">{String(state.panel+1).padStart(2,"0")} <span>/ 24</span></span></div>
 <div className="reader-grid">{!film&&<Stage3D wide={wide} chapter={beat.chapter} activePoint={state.panel%4} reduced={reduced} inspected={state.inspected} onInspect={id=>dispatch({type:"inspect",id})}/>}<article className="narrative" key={state.panel}><div className="narrative-meta"><span>{beat.speaker}</span><button className="info-button" onClick={()=>setModal("notes")} aria-label="본문과 해설 열기"><Icon kind="book"/> 본문 · 해설</button></div><h2 ref={panelRef} tabIndex={-1}>{beat.title}</h2><div className="prose">{beat.text.map(p=><p key={p}>{p}</p>)}</div><a className="verse-link" href={sourceHref} target="_blank" rel="noreferrer">욥기 {beat.ref} ↗</a>
 <div className="choice-area">{!state.inspected.includes(beat.chapter+"-"+state.panel%4)&&<p className="explore-prompt"><span>먼저 공간을 살펴보세요</span>3D 장면에서 ‘{landmarks[beat.chapter][state.panel%4].label}’을 선택하고 머무르면 응답이 열립니다.</p>}<p className="choice-prompt">당신은 어떻게 응답하겠습니까?<span>정답은 없습니다.</span></p><div className="choices">{beat.choices.map((c,i)=><button key={c.label} className={"choice "+(state.selected===i?"selected":"")} disabled={state.selected!==null||!state.inspected.includes(beat.chapter+"-"+state.panel%4)} aria-pressed={state.selected===i} onClick={()=>choose(i)}><span className="choice-index">0{i+1}</span><span>{c.label}</span><span className="choice-arrow">{state.selected===i?"✓":"↗"}</span></button>)}</div></div>
 {state.selected!==null&&<div className="choice-response" role="status"><span>당신의 말이 남긴 것</span><p>{beat.choices[state.selected].echo}</p><button className="next-button" onClick={()=>dispatch({type:"next",panel:state.panel})}>{state.panel===23?"나의 성찰 보기":(state.panel+1)%4===0?"이 장에 머무르기":"다음 패널"} <Icon kind="arrow"/></button></div>}
 </article></div>
 <footer className="reading-footer"><nav aria-label="장면 진행">{chapters.map((c,i)=><span key={c.title} className={i===beat.chapter?"current":i<beat.chapter?"passed":""} aria-current={i===beat.chapter?"step":undefined}><b>{String(i+1).padStart(2,"0")}</b><span>{c.title}</span></span>)}</nav><span className="keyboard-hint">Tab으로 이동 · Enter로 선택 · 숫자 1–4</span></footer>
 </section>}
 </main>
 {film&&<Cinema chapter={film.chapter} reduced={reduced} continueLabel={film.after?"탐색으로 이어가기":"설명 닫기"} onClose={()=>{if(film.after)dispatch({type:film.after});setFilm(null);}}/>}
 {audioError&&<p role="status" className="audio-error">{audioError}</p>}
 {modal==="settings"&&<Modal title="읽기 설정" close={()=>setModal(null)}><div className="setting-row"><label htmlFor="font-size">글자 크기</label><select id="font-size" value={font} onChange={e=>setFont(Number(e.target.value))}><option value={1}>기본</option><option value={1.125}>크게</option><option value={1.25}>더 크게</option></select></div><label className="setting-row">애니메이션 줄이기<input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/></label><label className="setting-row">음향 켜기<input type="checkbox" checked={sound} onChange={toggleSound}/></label><p className="muted">터치하거나 Tab으로 버튼을 선택한 뒤 Enter / Space를 누르세요. 본문에 초점이 있을 때 숫자 1–4로 응답할 수 있습니다.</p><p className="muted">설정과 선택은 이 탭의 메모리에서만 사용합니다. 새로고침하면 처음부터 시작합니다.</p></Modal>}
 {modal==="notes"&&<Modal title={chapter.title+" · 읽기 노트"} close={()=>setModal(null)}>{notes}</Modal>}
 {modal==="about"&&<Modal title="작품과 읽기 안내" close={()=>setModal(null)}><p>욥기: 대답 없는 법정<br/><em>The Book of Job: When God Does Not Explain</em></p><p>이 작품은 욥기를 바탕으로 한 3D 탐색형 인터랙티브 노벨입니다. Blender로 제작한 여섯 장의 실제 GLB 장면을 회전하고 확대하며 24개의 장소와 사물을 관찰합니다. 관찰 뒤에 대화 선택이 열립니다. 장면은 고대 세계를 상상한 양식화된 조형이며, 고고학적 복원이나 인물의 실제 외모를 주장하지 않습니다.</p><p>가족의 죽음, 질병, 깊은 탄식이 등장합니다. 필요할 때 멈추거나 창을 닫아도 됩니다. 고통스러운 장면을 잔혹하게 묘사하지 않습니다.</p><p>6편·37컷의 설명 애니메이션은 한국어 합성 음성과 시네마틱 영상을 함께 제공합니다. 6장·24패널과 질문·해설까지 함께 읽으면 약 20–27분을 예상합니다. 읽는 속도에 따라 달라지며 기다리도록 강제하지 않습니다.</p><p>성경 문장의 장문 복제를 피하고 한국어로 새로 요약했습니다. 욥기 28장의 지혜 시와 엘리후의 연설(32–37장) 등은 에피소드 길이상 압축했습니다. 등장인물의 외모와 ‘법정’의 시각적 구도는 문학적 상상입니다.</p><p>로그인·DB·분석 도구가 없으며 선택이나 개인 정보를 전송·저장하지 않습니다. 호스팅 제공자의 일반적인 접속 처리는 별개입니다.</p><h3>본문 및 편집 참고</h3><ul><li><a href="https://www.biblegateway.com/passage/?search=Job+1-21&version=KJV" target="_blank" rel="noreferrer">욥기 1–21장 · 성경 본문</a></li><li><a href="https://www.biblegateway.com/passage/?search=Job+22-42&version=KJV" target="_blank" rel="noreferrer">욥기 22–42장 · 성경 본문</a></li><li><a href="https://enterthebible.org/courses/job/lessons/summary-of-job/" target="_blank" rel="noreferrer">Luther Seminary · 욥기 개관</a></li></ul><p className="muted">3D: 직접 제작한 Blender로 구성한 연속 지형·건축·인물과 표면 질감, 장면 6개. Three.js 실시간 조명과 그림자. 장면 원본과 생성 코드는 저장소에 포함합니다. 이미지·영상: Higgsfield 생성 시네마틱 장면 6종. 한국어 음성: Arthur 합성 음성, 대본 확인 및 편집. 배경 음향: 브라우저에서 합성한 낮은 바람. 본문·해설은 전문 목회자나 성서학자의 최종 감수를 받지 않았습니다.</p></Modal>}
 {modal==="restart"&&<Modal title="처음부터 다시 읽을까요?" close={()=>setModal(null)}><p>이번 선택과 성찰은 지워지고 표지로 돌아갑니다.</p><div className="end-actions"><button className="outline-button" onClick={()=>setModal(null)}>계속 읽기</button><button className="start-button" onClick={()=>{dispatch({type:"restart"});setModal(null);}}>처음으로 돌아가기</button></div></Modal>}
 </div>;
}
