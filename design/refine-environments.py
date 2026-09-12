import bpy,math
from mathutils import Vector
# Make each arch physically continuous at its actual span.
specs={'Unoccupied eastern opening':(0,11,14),'Damaged courtyard gateway':(0,3.1,4.8),'City gate':(0,5,7.5),'Open garden doorway':(2,2.8,3.8)}
for root in [o for o in bpy.data.objects if o.name.startswith('CHAPTER_')]:
 arches=[o for o in root.children if 'arch stone' in o.name]
 for o in arches:
  if o.name.startswith('Courtyard colonnade'):
   center=min([-5,0,5],key=lambda c:abs(o.location.x-c));width=3.7;height=4.5
   # Recover each group by sequential suffix: 13 stones per bay.
   ordered=sorted([x for x in arches if x.name.startswith('Courtyard colonnade')],key=lambda a:int(a.name.rsplit('.',1)[1]) if '.' in a.name else 0)
   group=ordered.index(o)//13;center=[-5,0,5][group]
  else:
   prefix=next((p for p in specs if o.name.startswith(p)),None)
   if not prefix:continue
   center,width,height=specs[prefix]
  spring=height-width/2;rad=width/2+.23;a=math.atan2(o.location.z-spring,o.location.x-center)
  o.scale.x=math.pi*rad/13*1.09;o.scale.z=.56;o.rotation_euler.y=math.pi/2-a
 for o in root.children:
  if 'jamb' not in o.name:continue
  # Extend the highest jambs to meet the spring without introducing hovering blocks.
  if o.name.startswith('Open garden doorway') and o.location.z>1.7:o.scale.z=.72;o.location.z=1.85
  if o.name.startswith('Damaged courtyard gateway') and o.location.z>2.7:o.scale.z=.76;o.location.z=2.9
# Broad, eroded ridges; eight depth samples remove the folded-cardboard silhouettes.
for o in list(bpy.data.objects):
 if o.name.startswith('Layered mountain horizon'):bpy.data.objects.remove(o,do_unlink=True)
for root in [o for o in bpy.data.objects if o.name.startswith('CHAPTER_')]:
 for band in range(3):
  v=[];f=[];nx=97;ny=9
  for i in range(nx):
   x=-90+i*1.9
   crest=5+band*3+2.8*math.sin(x*.083+band)+1.2*math.sin(x*.23+band*2)+.45*math.sin(x*.57)
   for j in range(ny):
    u=j/(ny-1);y=22+band*21+u*24
    z=-1+max(0,math.sin(u*math.pi))*(crest+.35*math.sin(x*.6+u*5))
    v.append((x,y,z))
  for i in range(nx-1):
   for j in range(ny-1):
    a=i*ny+j;f.append((a,a+ny,a+ny+1,a+1))
  m=bpy.data.meshes.new('Eroded ridge');m.from_pydata(v,[],f);m.update()
  o=bpy.data.objects.new('Eroded ridge band '+str(band),m);bpy.context.collection.objects.link(o);o.parent=root
  m.materials.append(bpy.data.materials['Ash limestone' if band==0 else 'Midnight earth'])
  uv=m.uv_layers.new(name='UVMap')
  for poly in m.polygons:
   poly.use_smooth=True
   for li in poly.loop_indices:
    co=m.vertices[m.loops[li].vertex_index].co;uv.data[li].uv=(co.x*.12,co.y*.12)
# Set the delivery camera and fill to show real material colours.
fill=bpy.data.objects['Open sky fill'];fill.data.energy=1.6;fill.rotation_euler=(.9,-.3,2.5)
sun=bpy.data.objects['Low warm evening sun'];sun.data.energy=3.4;sun.data.color=(1,.88,.7)
scene=bpy.context.scene;scene.render.resolution_x=1120;scene.render.resolution_y=700;scene.render.image_settings.media_type='IMAGE'
t=artifacts.file(name='job-environment-refined.png',media_type='image/png');scene.render.filepath=t.path;bpy.ops.render.render(write_still=True);t.publish()
result={'arches':sum('arch stone' in o.name for o in bpy.data.objects),'ridge_bands':18,'meshes':sum(o.type=='MESH' for o in bpy.data.objects)}
