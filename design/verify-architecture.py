import bpy,math,re
from collections import defaultdict
removed=[]
# In ruined walls, a missing lower block must not leave a later course suspended.
for root in [o for o in bpy.data.objects if o.name.startswith('CHAPTER_')]:
 groups=defaultdict(list)
 for o in root.children:
  if o.type!='MESH':continue
  if any(w in o.name.lower() for w in ['frontage','side','wall','rampart']) and .40<o.scale.z<.50:
   groups[re.sub(r'\.\d+$','',o.name)].append(o)
 for name,objects in groups.items():
  supported=[]
  for o in sorted(objects,key=lambda q:q.location.z):
   good=o.location.z<.9 or any(abs((b.location.z+b.scale.z/2)-(o.location.z-o.scale.z/2))<.15 and abs(b.location.x-o.location.x)<(b.scale.x+o.scale.x)/2-.08 and abs(b.location.y-o.location.y)<(b.scale.y+o.scale.y)/2-.08 for b in supported)
   if good:supported.append(o)
   else:removed.append(o.name);bpy.data.objects.remove(o,do_unlink=True)
scene=bpy.context.scene;scene.render.resolution_x=800;scene.render.resolution_y=500;scene.render.resolution_percentage=100
# Blender 5.2 RNA supports taa_render_samples on the Eevee settings in this worker.
if hasattr(scene,'eevee') and hasattr(scene.eevee,'taa_render_samples'):scene.eevee.taa_render_samples=16
scene.render.image_settings.media_type='IMAGE';scene.render.image_settings.file_format='PNG'
t=artifacts.file(name='job-final-architecture.png',media_type='image/png');scene.render.filepath=t.path;bpy.ops.render.render(write_still=True);t.publish()
result={'removed_unsupported_blocks':len(removed),'examples':removed[:8],'meshes':sum(o.type=='MESH' for o in bpy.data.objects)}
