import type * as Three from "three";
type V=[number,number,number];
type Theme={top:number;horizon:number;fog:number;ground:number;sun:number;ambient:number;camera:V;look:V;key:V;exposure:number;density:number;title:string;subtitle:string};
export const themes:Theme[]=[
 {top:0x26384d,horizon:0xbda58b,fog:0x8b8a84,ground:0x28252b,sun:0xffdab0,ambient:0xa3b6cf,camera:[7,4.5,15],look:[0,3,-8],key:[-18,16,-8],exposure:1.12,density:.008,title:"보이는 것과 알 수 없는 것",subtitle:"멀리 열린 경계 · 하늘의 회의"},
 {top:0x525a63,horizon:0xd5ad7a,fog:0x9e8770,ground:0x38281e,sun:0xffce8a,ambient:0xb0becb,camera:[8,4.8,13],look:[0,1.3,-1],key:[-12,15,-6],exposure:1.28,density:.011,title:"한때 삶이 있었던 자리",subtitle:"무너진 집 · 잿빛 골목"},
 {top:0x3d5368,horizon:0xd4bc99,fog:0x998d7b,ground:0x302c27,sun:0xffdfac,ambient:0xb5c8d8,camera:[7,3.8,10.5],look:[0,1,-.6],key:[-9,15,5],exposure:1.2,density:.009,title:"위로가 심문이 되는 동안",subtitle:"그늘진 중정 · 세 친구의 말"},
 {top:0x142439,horizon:0x8c99a7,fog:0x626e7b,ground:0x232933,sun:0xb9d5fa,ambient:0x7a94b5,camera:[7,4,13],look:[0,2,-3],key:[-15,18,-3],exposure:1.0,density:.012,title:"나의 말을 들어 달라",subtitle:"빈 성문 · 욥의 항변"},
 {top:0x182b38,horizon:0x829a9e,fog:0x667f82,ground:0x172e30,sun:0xd5e4dc,ambient:0x829eaa,camera:[10,4.8,14],look:[0,1,-3],key:[-16,17,-12],exposure:1.1,density:.012,title:"사람의 바깥에서 살아가는 세계",subtitle:"폭풍의 해안 · 통제할 수 없는 생명"},
 {top:0x5c7680,horizon:0xe6c7a0,fog:0xa4a58f,ground:0x343124,sun:0xffe2a8,ambient:0xb6c7cc,camera:[7,3.8,11],look:[0,1,-1.7],key:[-13,13,-4],exposure:1.18,density:.01,title:"대답 없이도, 함께",subtitle:"오래된 정원 · 다시 열린 자리"},
];
export function atmosphere(T:typeof Three,chapter:number){
 const t=themes[chapter];
 const uniforms={uTime:{value:0},uTop:{value:new T.Color(t.top)},uHorizon:{value:new T.Color(t.horizon)},uStorm:{value:chapter===4?1:0}};
 const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms,
 vertexShader:"varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
 fragmentShader:`varying vec3 vDirection;uniform vec3 uTop;uniform vec3 uHorizon;uniform float uTime;uniform float uStorm;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){vec3 d=normalize(vDirection);float elevation=max(d.y,0.0);vec3 c=mix(uHorizon,uTop,smoothstep(-.04,.78,d.y));
 vec2 p=d.xz/(.35+elevation)*2.5+vec2(uTime*.015,0.0);float n=noise(p)*.57+noise(p*2.1)*.28+noise(p*4.2)*.15;
 float cloud=smoothstep(.47-.13*uStorm,.76,n)*smoothstep(-.04,.18,d.y);c=mix(c,mix(uHorizon*.92,uTop*.65,uStorm),cloud*.78);
 vec3 sunDir=normalize(vec3(-.6,.19,-.7));float glow=pow(max(dot(d,sunDir),0.0),35.0);c+=vec3(.17,.105,.035)*glow*(1.0-uStorm);
 gl_FragColor=vec4(c,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const sky=new T.Mesh(new T.SphereGeometry(160,32,16),material);sky.renderOrder=-2;
 return {sky,update:(seconds:number)=>{uniforms.uTime.value=seconds;}};
}
