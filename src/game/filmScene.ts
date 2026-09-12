import * as T from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
import {atmosphere,themes} from "./sceneArt";
import {films,locate,type Shot} from "./films";

function actor(color:number,divine=false){
 const root=new T.Group(),body=new T.Group();root.add(body);
 const cloth=new T.MeshStandardMaterial({color,roughness:.93,emissive:divine?0xffe7b1:0x000000,emissiveIntensity:divine?.7:0});
 const skin=new T.MeshStandardMaterial({color:divine?0xffe9bf:0xa97957,roughness:.85,emissive:divine?0xffdca0:0x000000,emissiveIntensity:divine?.65:0});
 const hair=new T.MeshStandardMaterial({color:0x252324,roughness:1});
 function mesh(g:T.BufferGeometry,m:T.Material,p:T.Object3D,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
 const skirt=mesh(new T.CylinderGeometry(.34,.62,1.42,24,5),cloth,body,0,.75);
 // Folds are actual radial geometry, shared by the cloth silhouette.
 const pos=skirt.geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),r=1+Math.cos(Math.atan2(z,x)*12)*.065;pos.setXYZ(i,x*r,pos.getY(i),z*r);}skirt.geometry.computeVertexNormals();
 mesh(new T.CapsuleGeometry(.34,.34,5,12),cloth,body,0,1.64);
 const belt=mesh(new T.TorusGeometry(.36,.047,5,24),new T.MeshStandardMaterial({color:divine?0xdeb66b:0x6e5238,roughness:.8}),body,0,1.4);belt.rotation.x=Math.PI/2;
 const head=new T.Group();head.position.y=2.15;body.add(head);
 const face=mesh(new T.SphereGeometry(.235,20,16),skin,head);face.scale.set(.88,1.18,.88);
 let mouth:T.Mesh|null=null;
 if(!divine){
 mesh(new T.SphereGeometry(.246,16,12),hair,head,0,.10,-.055).scale.set(1,.82,1);
 mesh(new T.ConeGeometry(.17,.28,12),hair,head,0,-.16,.075).rotation.z=Math.PI;
 mesh(new T.SphereGeometry(.055,8,8),skin,head,0,0,.205).scale.set(.6,1,1);
 for(const x of [-.076,.076])mesh(new T.SphereGeometry(.015,8,6),hair,head,x,.046,.201);
 mouth=mesh(new T.SphereGeometry(.032,8,6),hair,head,0,-.074,.218);mouth.scale.y=.3;mouth.userData.animated=true;
 }else{
 const veil=mesh(new T.SphereGeometry(.285,20,16),cloth,head,0,.025,-.08);veil.scale.set(1,1.18,.9);
 }
 const arms=[-1,1].map(side=>{const upper=new T.Group();upper.position.set(side*.36,1.88,0);body.add(upper);
 mesh(new T.CapsuleGeometry(.14,.34,4,10),cloth,upper,side*.07,-.24);
 const fore=new T.Group();fore.position.set(side*.08,-.49,0);upper.add(fore);
 mesh(new T.CapsuleGeometry(.105,.27,4,10),cloth,fore,0,-.15);
 const palm=mesh(new T.SphereGeometry(.095,10,8),skin,fore,0,-.38);palm.scale.set(.8,1.3,.6);
 for(let i=0;i<4;i++)mesh(new T.CapsuleGeometry(.012,.095,2,5),skin,fore,-.047+i*.028,-.49,0);
 return {upper,fore,side};});
 for(const x of [-.21,.21])mesh(new T.SphereGeometry(.18,12,8),new T.MeshStandardMaterial({color:0x48372c,roughness:1}),root,x,.1,.16).scale.set(.72,.55,1.4);

 function batchJoint(parent:T.Object3D){
 for(const child of [...parent.children])if(child instanceof T.Group)batchJoint(child);
 const batches=new Map<T.Material,T.Mesh[]>();
 for(const child of [...parent.children])if(child instanceof T.Mesh&&!child.userData.animated){const mat=child.material as T.Material;if(!batches.has(mat))batches.set(mat,[]);batches.get(mat)!.push(child);}
 for(const [mat,meshes] of batches){if(meshes.length<2)continue;const gs=meshes.map(m=>{m.updateMatrix();const g=m.geometry.clone().applyMatrix4(m.matrix);if(!g.index)return g;const n=g.toNonIndexed();g.dispose();return n;});const combined=mergeGeometries(gs,false);gs.forEach(g=>g.dispose());if(combined){meshes.forEach(m=>{m.removeFromParent();m.geometry.dispose();});const m=new T.Mesh(combined,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);}}
 }
 batchJoint(root);
 return {root,pose(t:number,action:Shot["action"],speaking:boolean){
 const pulse=speaking?Math.sin(t*2.2):0;body.rotation.x=action==="grieve"?.18:0;head.rotation.x=action==="grieve"?.42:Math.sin(t*.8)*.025;head.rotation.y=speaking?Math.sin(t*.9)*.07:0;
 body.position.y=Math.sin(t*1.6)*.012;
 arms.forEach(({upper,fore,side})=>{upper.rotation.set(0,0,side*.11);fore.rotation.x=-.12;
 if(action==="speak"||action==="challenge"){upper.rotation.x=-.32-pulse*.12;upper.rotation.z=side*(.25+pulse*.06);fore.rotation.x=-.65;}
 if(action==="reach"){upper.rotation.x=-.66;upper.rotation.z=side*.38;fore.rotation.x=-.5;}
 if(action==="grieve"){upper.rotation.x=-.6;fore.rotation.x=-1.35;upper.rotation.z=-side*.15;}
 if(action==="walk")upper.rotation.x=Math.sin(t*3)*.18*side;});
 if(mouth)mouth.scale.y=speaking?.3+Math.abs(Math.sin(t*9))*.9:.3;
 }};
}
export async function createFilmScene(host:HTMLDivElement,chapter:number,signal:AbortSignal){
 if(signal.aborted)throw new Error("cancelled");
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;host.appendChild(renderer.domElement);renderer.domElement.setAttribute("role","img");renderer.domElement.setAttribute("aria-label","등장인물의 몸짓과 카메라가 움직이는 욥기 설명 애니메이션");
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(43,1,.1,240),worlds=new Map<number,T.Group>();
 const hemi=new T.HemisphereLight(0xdcecff,0x776554,2.0);scene.add(hemi);
 const key=new T.DirectionalLight(0xffe0af,3.1);key.position.set(-5,12,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-12,right:12,top:12,bottom:-12,far:55});key.shadow.normalBias=.04;scene.add(key);
 const fill=new T.DirectionalLight(0x99baff,1.2);fill.position.set(8,5,-3);scene.add(fill);
 const skies=[...new Set([chapter,...chapter===1?[0]:[],...chapter===0?[5]:[]])].map(c=>({chapter:c,...atmosphere(T,c)}));skies.forEach(s=>scene.add(s.sky));
 const floor=new T.Mesh(new T.PlaneGeometry(90,90),new T.MeshStandardMaterial({color:0x9a876b,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;floor.visible=false;scene.add(floor);
 const god=actor(0xf0dbac,true),accuser=actor(0x303242),job=actor(0x92705b),friends=[actor(0x8d7350),actor(0x526f72),actor(0x816159)];
 const all=[god,accuser,job,...friends];all.forEach(a=>scene.add(a.root));
 god.root.position.set(-3,0,0);god.root.scale.setScalar(1.55);god.root.rotation.y=.65;
 accuser.root.position.set(3,0,1);accuser.root.rotation.y=-.7;
 job.root.position.set(-1,0,2);job.root.rotation.y=.2;
 friends.forEach((f,i)=>{f.root.position.set(2+i*1.4,0,i%2?-1:.2);f.root.rotation.y=-.55-i*.1;});
 const glow=new T.PointLight(0xffdda1,13,14,2);glow.position.set(-3,3,0);scene.add(glow);
 const halo=new T.Group();halo.position.set(-3,3.6,-.6);scene.add(halo);
 for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(1.15+i*.23,.009,6,100),new T.MeshBasicMaterial({color:0xffdf9e,transparent:true,opacity:.5-i*.1}));ring.rotation.y=i*.3;halo.add(ring);}
 const particleG=new T.BufferGeometry();const p=new Float32Array(240*3);for(let i=0;i<240;i++){p[i*3]=Math.sin(i*2.4)*16;p[i*3+1]=(i%41)*.24;p[i*3+2]=Math.cos(i*2.4)*13;}particleG.setAttribute("position",new T.BufferAttribute(p,3));const dust=new T.Points(particleG,new T.PointsMaterial({color:0xdceafa,size:.027,transparent:true,opacity:.48}));scene.add(dust);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 let disposed=false;
 function release(root:T.Object3D){root.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Points){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{Object.values(m).forEach(v=>{if(v instanceof T.Texture)v.dispose();});m.dispose();});}});}
 const dispose=()=>{if(disposed)return;disposed=true;observer.disconnect();release(scene);renderer.dispose();renderer.domElement.remove();};
 signal.addEventListener("abort",dispose,{once:true});
 try{
 for(const c of [...new Set([chapter,...chapter===1?[0]:[],...chapter===0?[5]:[]])]){
 const gltf=await new GLTFLoader().loadAsync("./assets/worlds/chapter-"+c+".glb");if(signal.aborted){release(gltf.scene);dispose();throw new Error("cancelled");}
 const root=gltf.scene.getObjectByName("CHAPTER_"+c);if(!root)throw new Error("배경 장면을 찾지 못했습니다.");root.position.set(0,0,-9);root.updateMatrixWorld(true);
 const batches=new Map<T.Material,T.BufferGeometry[]>();
 root.traverse(o=>{if(!(o instanceof T.Mesh)||/^(Job|Eliphaz|Bildad|Zophar)([ .]|$)/.test(o.name))return;const m=Array.isArray(o.material)?o.material[0]:o.material;
 let g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(g.index){const prev=g;g=g.toNonIndexed();prev.dispose();}for(const a of Object.keys(g.attributes))if(!["position","normal","uv"].includes(a))g.deleteAttribute(a);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute("uv",new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(!batches.has(m))batches.set(m,[]);batches.get(m)!.push(g);});
 const group=new T.Group();batches.forEach((gs,m)=>{const geom=mergeGeometries(gs,false);if(geom){const mesh=new T.Mesh(geom,m);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}gs.forEach(g=>g.dispose());});
 // Materials and packed textures are now owned by the merged scene.
 gltf.scene.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});worlds.set(c,group);scene.add(group);
 }
 }catch(e){dispose();throw e;}
 let lastFrame="";
 const v=new T.Vector3(),look=new T.Vector3();
 function update(time:number,reduced:boolean){
 if(disposed)return;
 const frame=[time,reduced,host.clientWidth,host.clientHeight].join(":");if(frame===lastFrame)return;lastFrame=frame;
 const at=locate(films[chapter],time),shot=films[chapter].shots[at.index],local=reduced?0:time-at.start,t=reduced?0:time;
 const heavenly=(chapter===0&&at.index>0)||(chapter===1&&at.index>=2&&at.index<=4),world=heavenly?0:chapter===0?5:chapter;
 skies.forEach(s=>{s.sky.visible=s.chapter===world;s.update(t*.35);});worlds.forEach((g,c)=>g.visible=c===world);
 scene.fog=new T.FogExp2(themes[world].fog,.018);scene.background=new T.Color(themes[world].fog);(floor.material as T.MeshStandardMaterial).color.set(heavenly?0x91856e:themes[world].ground);
 god.root.visible=heavenly;accuser.root.visible=heavenly;halo.visible=heavenly;glow.visible=heavenly;job.root.visible=!heavenly;
 friends.forEach(f=>f.root.visible=!heavenly&&(chapter===2||chapter===3||chapter===5));
 if(heavenly)accuser.root.position.x=shot.action==="walk"?5-Math.min(1,local/4)*2:3;
 const who=shot.speaker;
 god.pose(t,who==="하나님"?shot.action:"listen",who==="하나님");accuser.pose(t,who.startsWith("사탄")?shot.action:"listen",who.startsWith("사탄"));job.pose(t,who==="욥"?shot.action:chapter===1?"grieve":"listen",who==="욥");
 friends.forEach((f,i)=>f.pose(t,["엘리바스","빌닷","소발"][i]===who||who==="엘리후"?shot.action:"listen",["엘리바스","빌닷","소발"][i]===who||who==="엘리후"));
 const target=shot.view;
 if(heavenly&&target==="god"){v.set(-.4,3.3,7);look.set(-3,2.5,0);}
 else if(heavenly&&target==="accuser"){v.set(.6,2.5,7);look.set(3,1.8,1);}
 else if(heavenly){v.set(0,4.2,13);look.set(0,2,0);}
 else if(target==="job"){v.set(1.5,2.5,7.6);look.set(-1,1.6,2);}
 else if(target==="friends"){v.set(1.1,2.9,8.8);look.set(3.2,1.5,0);}
 else if(target==="sky"){v.set(-3,4,13);look.set(0,7,-12);}
 else{v.set(-.8,3.7,13.5);look.set(.5,1.5,-1);}
 const mobile=camera.aspect<1;if(mobile){v.z+=5;look.y+=.25;}
 if(!reduced){v.x+=Math.sin(local*.12)*.32;v.z-=Math.min(local,14)*.025;}
 camera.position.copy(v);camera.lookAt(look);halo.rotation.z=t*.05;dust.rotation.y=t*(chapter===4?.035:.007);
 renderer.render(scene,camera);host.dataset.filmFrame=JSON.stringify({chapter,shot:at.index,time:Math.round(time*10)/10,heavenly,calls:renderer.info.render.calls});
 }
 update(0,true);
 return {update,dispose};
}
