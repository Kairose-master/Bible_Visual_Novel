import { beats } from "./content";
export type State = { inspected: string[]; panel: number; selected: number | null; phase: "cover" | "reading" | "reflection" | "ending"; explanationPressure: number; lamentTruthfulness: number; solidarityCapacity: number; history: { panel: number; choice: number }[] };
export type Action = { type: "inspect"; id: string } | { type: "start" } | { type: "choose"; panel: number; choice: number } | { type: "next"; panel: number } | { type: "resume" } | { type: "restart" };
export const initialState = (): State => ({inspected:[],panel:0, selected:null, phase:"cover", explanationPressure:0, lamentTruthfulness:0, solidarityCapacity:0, history:[]});
export function reducer(state: State, action: Action): State {
 if(action.type==="restart") return initialState();
 if(action.type==="start") return state.phase==="cover" ? {...state,phase:"reading"} : state;
 if(action.type==="resume") return state.phase==="reflection" ? {...state,phase:"reading",panel:state.panel+1,selected:null} : state;
 if(state.phase!=="reading") return state;
 if(action.type==="inspect") {
  const expected=beats[state.panel].chapter+"-"+(state.panel%4);
  return action.id===expected&&!state.inspected.includes(action.id)?{...state,inspected:[...state.inspected,action.id]}:state;
 }
 if(action.type==="choose") {
  if(!state.inspected.includes(beats[state.panel].chapter+"-"+(state.panel%4))) return state;
  if(action.panel!==state.panel || state.selected!==null || !Number.isInteger(action.choice)) return state;
  const choice=beats[state.panel]?.choices[action.choice]; if(!choice) return state;
  const [e,l,s]=choice.delta;
  return {...state,selected:action.choice,explanationPressure:state.explanationPressure+e,lamentTruthfulness:state.lamentTruthfulness+l,solidarityCapacity:state.solidarityCapacity+s,history:[...state.history,{panel:state.panel,choice:action.choice}]};
 }
 if(action.type==="next" && action.panel===state.panel && state.selected!==null) {
  if(state.panel===beats.length-1) return {...state,phase:"ending"};
  if(beats[state.panel+1].chapter!==beats[state.panel].chapter) return {...state,phase:"reflection"};
  return {...state,panel:state.panel+1,selected:null};
 }
 return state;
}
export function summarize(state: State): {text:string;focus:number[]} {
 const values=[state.explanationPressure,state.lamentTruthfulness,state.solidarityCapacity];
 const max=Math.max(...values); const leaders=values.map((v,i)=>v===max?i:-1).filter(i=>i>=0);
 const text=leaders.length>1 ? "당신은 설명, 탄식, 동행 사이를 오갔습니다." : [
 "이번 이야기에서 당신은 원인을 찾으려는 마음에 자주 머물렀습니다.",
 "이번 이야기에서 당신은 설명보다 탄식의 목소리에 오래 머물렀습니다.",
 "이번 이야기에서 당신은 욥의 질문에 답하기보다 곁에 있으려 했습니다."
 ][leaders[0]];
 return {text,focus:leaders.includes(0)?[0,2,1,3]:leaders.includes(1)?[1,0,3,2]:[3,2,1,0]};
}
