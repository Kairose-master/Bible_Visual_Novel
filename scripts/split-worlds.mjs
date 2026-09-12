import {NodeIO} from "@gltf-transform/core";
import {ALL_EXTENSIONS} from "@gltf-transform/extensions";
import {prune} from "@gltf-transform/functions";
import {mkdir,stat} from "node:fs/promises";
const base=new URL("../public/assets",import.meta.url).pathname;
await mkdir(base+"/worlds",{recursive:true});
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
for(let i=0;i<6;i++){
 const doc=await io.read(base+"/job-worlds.glb");
 const chapter=doc.getRoot().listNodes().find(n=>n.getName()==="CHAPTER_"+i);
 if(!chapter)throw Error("Missing chapter "+i);
 const scene=doc.getRoot().listScenes()[0];
 for(const node of scene.listChildren())scene.removeChild(node);
 const keep=new Set();chapter.traverse(n=>keep.add(n));for(const n of doc.getRoot().listNodes())if(!keep.has(n))n.dispose();
 scene.addChild(chapter);chapter.setTranslation([0,0,0]);
 await doc.transform(prune());
 const out=base+"/worlds/chapter-"+i+".glb";await io.write(out,doc);
 console.log(JSON.stringify({chapter:i,bytes:(await stat(out)).size,meshes:doc.getRoot().listMeshes().length,textures:doc.getRoot().listTextures().length}));
}