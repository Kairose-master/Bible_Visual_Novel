import {useEffect,useRef,useState} from "react";
import {landmarks} from "./landmarks";
import {themes,atmosphere} from "./sceneArt";
import type {Landmark} from "./landmarks";
type Props={chapter:number;activePoint:number;reduced:boolean;onInspect:(id:string)=>void;inspected:string[];cover?:boolean;wide?:boolean};
export default function Stage3D({chapter,activePoint,reduced,onInspect,inspected,cover=false,wide=false}:Props){
 const wideRef=useRef(wide);wideRef.current=wide;
 const host=useRef<HTMLDivElement>(null);const api=useRef<{focus:(i:number)=>void;reset:()=>void;rotate:(n:number)=>void;zoom:(n:number)=>void}|null>(null);
 const [status,setStatus]=useState("loading");const [error,setError]=useState("");const [selected,setSelected]=useState<number|null>(null);const [ready,setReady]=useState(false);
 const callback=useRef(onInspect);callback.current=onInspect;
 const active=useRef(activePoint);active.current=activePoint;
 const [quality,setQuality]=useState<"balanced"|"low">("balanced");
 useEffect(()=>setSelected(null),[activePoint]);
 useEffect(()=>{
  let cancelled=false,dispose=()=>{};setStatus("loading");setReady(false);setSelected(null);
  const node=host.current;if(!node)return;
  (async()=>{
   const [THREE,{OrbitControls},{GLTFLoader},{mergeGeometries}]=await Promise.all([import("three"),import("three/addons/controls/OrbitControls.js"),import("three/addons/loaders/GLTFLoader.js"),import("three/addons/utils/BufferGeometryUtils.js")]);
   if(cancelled)return;
   let renderer:import("three").WebGLRenderer;
   try{renderer=new THREE.WebGLRenderer({antialias:quality!=="low",alpha:false,powerPreference:"high-performance"});}catch{throw new Error("이 기기에서 WebGL 3D를 시작할 수 없습니다.");}
   renderer.setPixelRatio(Math.min(window.devicePixelRatio,quality==="low"?1:1.5));
   renderer.setSize(node.clientWidth,node.clientHeight);renderer.shadowMap.enabled=quality!=="low";renderer.shadowMap.type=THREE.PCFShadowMap;
   const theme=themes[chapter];
   renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=theme.exposure;
   node.appendChild(renderer.domElement);renderer.domElement.setAttribute("aria-label","드래그로 회전하고 휠 또는 두 손가락으로 확대하는 3D 장면");renderer.domElement.setAttribute("role","img");
   const scene=new THREE.Scene();scene.background=new THREE.Color(theme.fog);scene.fog=new THREE.FogExp2(theme.fog,theme.density*1.3);
   const sky=atmosphere(THREE,chapter);scene.add(sky.sky);
   const camera=new THREE.PerspectiveCamera(48,node.clientWidth/node.clientHeight,.1,240);
   const defaultCamera=new THREE.Vector3().fromArray(theme.camera),defaultLook=new THREE.Vector3().fromArray(theme.look);camera.position.copy(defaultCamera);
   const project=()=>{const w=node.clientWidth,h=node.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.setViewOffset(w,h,cover?-w*.18:!wideRef.current&&window.innerWidth>940?w*.16:0,0,w,h);camera.updateProjectionMatrix();renderer.setSize(w,h);};
   project();
   const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(defaultLook);controls.enableDamping=!reduced;controls.dampingFactor=.075;controls.minDistance=3.5;controls.maxDistance=29;controls.maxPolarAngle=Math.PI*.478;controls.minPolarAngle=.25;controls.enablePan=true;controls.panSpeed=.45;controls.autoRotate=false;
   scene.add(new THREE.HemisphereLight(theme.ambient,theme.ground,1.25));
   const light=new THREE.DirectionalLight(theme.sun,3.1);light.position.fromArray(theme.key);light.castShadow=true;
   light.shadow.mapSize.set(quality==="low"?512:2048,quality==="low"?512:2048);light.shadow.camera.left=-19;light.shadow.camera.right=19;light.shadow.camera.top=19;light.shadow.camera.bottom=-19;light.shadow.camera.far=65;light.shadow.normalBias=.035;light.shadow.bias=-.0001;scene.add(light);
   const rim=new THREE.DirectionalLight(theme.ambient,.6);rim.position.set(10,7,8);scene.add(rim);
   const points=landmarks[chapter];const markers:import("three").Mesh[]=[];
   const ringGeometry=new THREE.TorusGeometry(.18,.035,8,24);
   const hitGeometry=new THREE.SphereGeometry(.5,10,8);
   const invisible=new THREE.MeshBasicMaterial({visible:false});
   for(let i=0;i<points.length;i++){
    const marker=new THREE.Mesh(ringGeometry,new THREE.MeshBasicMaterial({color:0xdcefff,transparent:true,opacity:.9,depthTest:false}));marker.position.fromArray(points[i].position);marker.position.y+=.45;marker.visible=!cover;marker.renderOrder=9;marker.userData.index=i;scene.add(marker);markers.push(marker);
    const hit=new THREE.Mesh(hitGeometry,invisible);hit.position.copy(marker.position);hit.userData.index=i;scene.add(hit);
   }
   let targetPosition:import("three").Vector3|null=null,targetLook:import("three").Vector3|null=null;
   const focus=(i:number)=>{const p=points[i];if(!p)return;setSelected(i);const center=new THREE.Vector3().fromArray(p.position);targetLook=center;targetPosition=center.clone().add(new THREE.Vector3().fromArray(p.view??[chapter===4?7:5,chapter===0?4:2.7,chapter===4?10:7]));if(reduced){camera.position.copy(targetPosition);controls.target.copy(center);targetPosition=null;targetLook=null;}controls.autoRotate=false;};
   const reset=()=>{camera.position.copy(defaultCamera);controls.target.copy(defaultLook);targetPosition=null;targetLook=null;setSelected(null);};
   api.current={focus,reset,rotate:(n)=>{const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),n);camera.position.copy(controls.target).add(offset);},zoom:(n)=>{camera.position.sub(controls.target).multiplyScalar(n).add(controls.target);}};
   const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let downX=0,downY=0;
   const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY;targetPosition=null;targetLook=null;};
   const up=(e:PointerEvent)=>{if(cover)return;if(Math.hypot(e.clientX-downX,e.clientY-downY)>7)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(scene.children,false).filter(h=>typeof h.object.userData.index==="number");if(hits.length)focus(hits[0].object.userData.index);};
   renderer.domElement.addEventListener("pointerdown",down);renderer.domElement.addEventListener("pointerup",up);
   const key=(e:KeyboardEvent)=>{if(!node.parentElement?.contains(document.activeElement))return;if((e.target as HTMLElement).closest("button,select"))return;const map:Record<string,()=>void>={KeyA:()=>api.current?.rotate(.12),ArrowLeft:()=>api.current?.rotate(.12),KeyD:()=>api.current?.rotate(-.12),ArrowRight:()=>api.current?.rotate(-.12),KeyW:()=>api.current?.zoom(.93),ArrowUp:()=>api.current?.zoom(.93),KeyS:()=>api.current?.zoom(1.07),ArrowDown:()=>api.current?.zoom(1.07),KeyR:reset};if(map[e.code]){e.preventDefault();map[e.code]();}};
   window.addEventListener("keydown",key);
   const particleCount=quality==="low"?75:180;const positions=new Float32Array(particleCount*3);const seed=new Float32Array(particleCount*3);
   for(let i=0;i<particleCount;i++){const a=i*2.39996;const r=2+(i%67)/67*13;seed[i*3]=a;seed[i*3+1]=r;seed[i*3+2]=(i%41)/41*16;positions[i*3]=Math.cos(a)*r;positions[i*3+1]=seed[i*3+2];positions[i*3+2]=Math.sin(a)*r;}
   const particlesGeometry=new THREE.BufferGeometry();particlesGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
   const particles=new THREE.Points(particlesGeometry,new THREE.PointsMaterial({color:0xbacde0,size:chapter===4?.045:.025,transparent:true,opacity:chapter===4?.25:.16,depthWrite:false}));scene.add(particles);
   let model:import("three").Object3D|null=null;
   const disposable:import("three").BufferGeometry[]=[];
   let raf=0,lastTime=0;const started=performance.now();let frames=0,frameStart=performance.now();let fps=0;let lastWide=wideRef.current;const waveTime={value:0};const debug=new URLSearchParams(window.location.search).has("debug");
   const draw=(now:number)=>{
    if(cancelled)return;raf=requestAnimationFrame(draw);if(document.hidden)return;if(quality==="low"&&now-lastTime<32)return;lastTime=now;
    if(targetLook&&targetPosition){controls.target.lerp(targetLook,.09);camera.position.lerp(targetPosition,.09);if(camera.position.distanceTo(targetPosition)<.02){targetLook=null;targetPosition=null;}}
    if(lastWide!==wideRef.current){lastWide=wideRef.current;project();}
    controls.target.x=THREE.MathUtils.clamp(controls.target.x,-14,14);controls.target.z=THREE.MathUtils.clamp(controls.target.z,-20,12);
    controls.update();for(let i=0;i<markers.length;i++){markers[i].quaternion.copy(camera.quaternion);markers[i].scale.setScalar(i===active.current?1.4:1);}
    sky.update(reduced?0:(now-started)*.001);waveTime.value=reduced?0:(now-started)*.001;
    const t=reduced?0:(now-started)*.00012;
    if(!reduced){for(let i=0;i<particleCount;i++){const a=seed[i*3]+t*(chapter===4?3:.25);const r=seed[i*3+1];positions[i*3]=Math.cos(a)*r;positions[i*3+2]=Math.sin(a)*r;positions[i*3+1]=(seed[i*3+2]+t*(chapter===4?4:.2))%16;}particlesGeometry.attributes.position.needsUpdate=true;}
    renderer.render(scene,camera);frames++;if(now-frameStart>1000){fps=frames;frames=0;frameStart=now;}
    if(debug){node.dataset.renderStats=JSON.stringify({fps,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,model:!!model,chapter,textures:renderer.info.memory.textures,camera:camera.position.toArray()});}
   };
   const resize=new ResizeObserver(project);resize.observe(node);
   const contextLost=(e:Event)=>{e.preventDefault();setStatus("error");setError("3D 그래픽 연결이 끊겼습니다. 품질을 낮추거나 텍스트 모드로 이어갈 수 있습니다.");};renderer.domElement.addEventListener("webglcontextlost",contextLost);
   dispose=()=>{cancelAnimationFrame(raf);resize.disconnect();window.removeEventListener("keydown",key);renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointerup",up);renderer.domElement.removeEventListener("webglcontextlost",contextLost);controls.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{for(const v of Object.values(m))if(v instanceof THREE.Texture)v.dispose();m.dispose();});}});disposable.forEach(g=>g.dispose());renderer.dispose();renderer.domElement.remove();api.current=null;};
   raf=requestAnimationFrame(draw);
   const gltf=await new GLTFLoader().loadAsync("./assets/worlds/chapter-"+chapter+".glb");
   if(cancelled){gltf.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});return;}
   const loadedMaps=new Set<string>();gltf.scene.traverse(o=>{if(o instanceof THREE.Mesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m.map)loadedMaps.add(m.map.uuid);});
   const expectedMaps=new Set((gltf.parser.json.materials||[]).flatMap((m:{pbrMetallicRoughness?:{baseColorTexture?:{index:number}}})=>m.pbrMetallicRoughness?.baseColorTexture?[m.pbrMetallicRoughness.baseColorTexture.index]:[])).size;
   if(loadedMaps.size<expectedMaps)throw new Error("장면의 표면 질감을 불러오지 못했습니다. 다시 불러오기를 눌러 주세요.");
   const root=gltf.scene.getObjectByName("CHAPTER_"+chapter);if(!root)throw new Error("3D 장면을 찾지 못했습니다.");
   root.removeFromParent();root.position.set(0,0,0);root.updateMatrixWorld(true);
   const batches=new Map<string,{material:import("three").Material;geometries:import("three").BufferGeometry[]}>();
   root.traverse(o=>{if(!(o instanceof THREE.Mesh))return;const material=Array.isArray(o.material)?o.material[0]:o.material;let geo=o.geometry.clone().applyMatrix4(o.matrixWorld);if(geo.index){const indexed=geo;geo=geo.toNonIndexed();indexed.dispose();}for(const a of Object.keys(geo.attributes))if(a!=="position"&&a!=="normal"&&a!=="uv")geo.deleteAttribute(a);if(!geo.attributes.normal)geo.computeVertexNormals();if(!geo.attributes.uv)geo.setAttribute("uv",new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));const key=material.uuid;if(!batches.has(key))batches.set(key,{material,geometries:[]});batches.get(key)!.geometries.push(geo);});
   const mergedRoot=new THREE.Group();for(const batch of batches.values()){const geo=mergeGeometries(batch.geometries,false);if(geo){const mat=batch.material.clone() as import("three").MeshStandardMaterial;
    if(mat.map)mat.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    if(mat.name==="Deep water"){mat.roughness=.27;mat.metalness=.35;mat.onBeforeCompile=shader=>{shader.uniforms.uWaveTime=waveTime;shader.vertexShader="uniform float uWaveTime;\n"+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n transformed.y += sin(position.x*.8+uWaveTime*.85)*.045+cos(position.z*.6+uWaveTime*.6)*.035;");shader.fragmentShader="uniform float uWaveTime;\n"+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace("#include <normal_fragment_begin>","#include <normal_fragment_begin>\n normal = normalize(normal+vec3(sin(vViewPosition.x*2.0+uWaveTime)*.09,cos(vViewPosition.z*1.2+uWaveTime)*.09,0.0));");};}
    const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=mat.name!=="Deep water";mesh.receiveShadow=true;mergedRoot.add(mesh);}batch.geometries.forEach(g=>g.dispose());}
   for(const source of [root,gltf.scene])source.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});
   if(!mergedRoot.children.length)throw new Error("3D 메시를 구성하지 못했습니다.");
   model=mergedRoot;scene.add(model);setStatus("ready");setReady(true);
  })().catch(e=>{if(!cancelled){setStatus("error");setError(e instanceof Error?e.message:"3D 장면을 불러오지 못했습니다.");}});
  return()=>{cancelled=true;dispose();};
 },[chapter,reduced,quality,cover]);
 const points=landmarks[chapter];const current=selected===null?null:points[selected];
 function inspect(p:Landmark){callback.current(p.id);setSelected(null);}
 return <section className={"world-stage "+(cover?"world-cover":"")} aria-label="3D 장면 탐색">
 <div className="webgl-host" ref={host} tabIndex={0}/>
 <div className="world-topline"><span><i/> {themes[chapter].subtitle}</span><button onClick={()=>setQuality(q=>q==="low"?"balanced":"low")} className="world-tool">화질 {quality==="low"?"낮음":"균형"}</button></div>
 {status==="loading"&&<div className="world-loading" role="status"><span className="loading-orbit"/><p>공간을 불러오는 중</p><small>실제 3D 모델과 조명을 준비합니다.</small></div>}
 {status==="error"&&<div className="world-loading" role="alert"><p>{error}</p><button className="outline-button" onClick={()=>setQuality(q=>q==="low"?"balanced":"low")}>다시 불러오기</button>{!cover&&<button className="text-link" onClick={()=>inspect(points[activePoint])}>텍스트 모드로 이 장면 이어가기</button>}</div>}
 {ready&&<><div className="camera-tools"><button aria-label="왼쪽으로 회전" onClick={()=>api.current?.rotate(.3)}>↶</button><button aria-label="오른쪽으로 회전" onClick={()=>api.current?.rotate(-.3)}>↷</button><button aria-label="확대" onClick={()=>api.current?.zoom(.8)}>＋</button><button aria-label="축소" onClick={()=>api.current?.zoom(1.2)}>－</button><button aria-label="시점 초기화" onClick={()=>api.current?.reset()}>⌂</button></div>
 {!cover&&<div className="landmark-strip" aria-label="관찰할 장소">{points.map((p,i)=><button key={p.id} onClick={()=>api.current?.focus(i)} className={(i===activePoint?"needed ":"")+(selected===i?"focused ":"")+(inspected.includes(p.id)?"seen":"")} aria-pressed={selected===i}><span>{inspected.includes(p.id)?"✓":String(i+1).padStart(2,"0")}</span>{p.label}{i===activePoint&&<small>이번 시선</small>}</button>)}</div>}
 {!cover&&current&&<div className="observation-card"><button className="observation-close" aria-label="관찰 창 닫기" onClick={()=>setSelected(null)}>×</button><span>관찰 · {current.label}</span><p>{current.observation}</p><button className="observe-button" disabled={selected!==activePoint&&!inspected.includes(current.id)} onClick={()=>inspect(current)}>{inspected.includes(current.id)?"관찰한 장면":selected!==activePoint?"이번 시선의 장소부터 살펴보세요":"이 자리에 머무르기"} <span>→</span></button></div>}
 <div className="world-help">드래그 · 회전　 두 손가락 / 휠 · 확대　 WASD · 시점 이동</div></>}
 </section>;
}
