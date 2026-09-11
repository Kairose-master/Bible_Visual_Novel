import { describe, it, expect } from "bun:test";
import { beats, chapters } from "../src/game/content";
import { reducer, initialState, summarize } from "../src/game/engine";
describe("narrative state machine",()=>{
 it("has 6 sourced chapters, 24 panels, and 63 real choices",()=>{
  expect(chapters.length).toBe(6);expect(beats.length).toBe(24);
  expect(beats.reduce((n,b)=>n+b.choices.length,0)).toBe(63);
  for(const c of chapters){expect(c.layers.length).toBe(4);expect(c.question.length).toBeGreaterThan(10);}
  for(const b of beats){expect(b.ref.length).toBeGreaterThan(2);expect(b.choices.length).toBeGreaterThanOrEqual(2);expect(b.choices.length).toBeLessThanOrEqual(4);}
 });
 it("every choice changes the exact intended state once, all panel edges reach the ending",()=>{
  for(let panel=0;panel<beats.length;panel++)for(let choice=0;choice<beats[panel].choices.length;choice++){
   const state={...initialState(),phase:"reading" as const,panel,inspected:[beats[panel].chapter+"-"+panel%4]};
   const next=reducer(state,{type:"choose",panel,choice});const delta=beats[panel].choices[choice].delta;
   expect([next.explanationPressure,next.lamentTruthfulness,next.solidarityCapacity]).toEqual(delta);
   expect(delta.some(v=>v!==0)).toBe(true);
   expect(reducer(next,{type:"choose",panel,choice})).toBe(next);
   let moved=reducer(next,{type:"next",panel});
   expect(moved.phase).toBe(panel===23?"ending":panel%4===3?"reflection":"reading");
   if(moved.phase==="reflection")moved=reducer(moved,{type:"resume"});
   if(panel<23)expect(moved.panel).toBe(panel+1);
  }
 });
 it("rejects malformed, stale and premature input",()=>{
  const s=reducer(initialState(),{type:"start"});
  for(const choice of [-1,4,NaN,1.5])expect(reducer(s,{type:"choose",panel:0,choice})).toBe(s);
  expect(reducer(s,{type:"next",panel:0})).toBe(s);
  expect(reducer(s,{type:"choose",panel:1,choice:0})).toBe(s);
  expect(reducer(s,{type:"resume"})).toBe(s);
 });
 it("plays a complete 24-choice episode with each dominant tendency",()=>{
  const results=new Set();
  for(const axis of [0,1,2]){
   let s=reducer(initialState(),{type:"start"});
   for(let panel=0;panel<24;panel++){
    s=reducer(s,{type:"inspect",id:beats[panel].chapter+"-"+panel%4});
    const best=beats[panel].choices.reduce((a,c,i)=>c.delta[axis]>beats[panel].choices[a].delta[axis]?i:a,0);
    s=reducer(s,{type:"choose",panel,choice:best});s=reducer(s,{type:"next",panel});
    if(s.phase==="reflection")s=reducer(s,{type:"resume"});
   }
   expect(s.phase).toBe("ending");expect(s.history.length).toBe(24);
   results.add(summarize(s).text);expect(new Set(summarize(s).focus).size).toBe(4);
   expect(reducer(s,{type:"restart"})).toEqual(initialState());
  }
  expect(results.size).toBe(3);
 });
 it("requires current observation and rejects future or duplicate investigation",()=>{
  const s=reducer(initialState(),{type:"start"});
  expect(reducer(s,{type:"choose",panel:0,choice:0})).toBe(s);
  expect(reducer(s,{type:"inspect",id:"0-1"})).toBe(s);
  const observed=reducer(s,{type:"inspect",id:"0-0"});
  expect(observed.inspected).toEqual(["0-0"]);
  expect(reducer(observed,{type:"inspect",id:"0-0"})).toBe(observed);
  expect(reducer(observed,{type:"choose",panel:0,choice:0}).selected).toBe(0);
 });
 it("returns mixed reflection on equal tendencies without ranking faith",()=>{
  const r=summarize({...initialState(),explanationPressure:8,lamentTruthfulness:8,solidarityCapacity:8});
  expect(r.text).toContain("오갔습니다");expect(r.text).not.toContain("점");
 });
});
