import bpy, math, random
import numpy as np
from mathutils import Vector, Matrix
random.seed(129)
roots=[bpy.data.objects['CHAPTER_'+str(i)] for i in range(6)]
# Replace the display plinths and repeated boundary props with continuous environments.
remove=['Ash terrain','Stratified earth base','Boundary stone','Scattered ash rubble','Distant mountain','Unanswered horizon ring','Witness stone','Storm ridge','Broken horizon','River pool','Deep sea pool','Living branch']
for o in list(bpy.data.objects):
 if any(o.name.startswith(s) for s in remove):bpy.data.objects.remove(o,do_unlink=True)
for i,r in enumerate(roots):r.location.x=i*140
def material(name,c,rough=.88):
 m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=rough
 return m
stone=material('Ash limestone',(.33,.245,.16));edge=material('Broken edges',(.49,.38,.25))
sand=material('Ash dust',(.29,.22,.145));earth=material('Midnight earth',(.12,.10,.075))
wood=material('Charred cedar',(.115,.071,.036));pot=material('Weathered clay',(.40,.19,.10))
plaster=material('Sun worn lime plaster',(.57,.43,.27));dark=material('Door recess',(.025,.029,.026))
foliage=material('Olive silver green',(.17,.22,.105));reed=material('Dry straw',(.35,.28,.12))
cloth=material('Job pale linen',(.66,.58,.40));blue=material('Eliphaz indigo wool',(.10,.14,.19))
material('Bildad slate wool',(.30,.25,.18));material('Zophar weathered wool',(.33,.15,.085))
material('Sun worn skin',(.37,.205,.115));material('River life',(.12,.155,.095))
# Portable, packed granular PBR colour maps: no procedural shader dependency in GLB.
rng=np.random.default_rng(54);N=128
xx,yy=np.meshgrid(np.linspace(0,12,N),np.linspace(0,12,N))
for m in [stone,edge,sand,earth,wood,pot,plaster,cloth,blue,foliage]:
 p=m.node_tree.nodes.get('Principled BSDF');base=np.array(p.inputs['Base Color'].default_value[:3])
 grit=rng.random((N,N))*.19
 broad=np.sin(xx*.7+np.sin(yy*.8))*.085+np.cos(yy*2.1+xx*.7)*.04
 if m in [cloth,blue]:grit+=.09*(np.sin(xx*45)*np.sin(yy*45))
 if m==wood:broad+=.12*np.sin(xx*8+np.sin(yy*.9))
 colour=np.clip(base[None,None,:]*(.83+grit+broad)[:,:,None],0,1)
 rgba=np.concatenate([colour,np.ones((N,N,1))],axis=2).astype(np.float32)
 im=bpy.data.images.new(m.name+' granular albedo',width=N,height=N);im.pixels.foreach_set(rgba.ravel());im.pack()
 tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;tex.interpolation='Linear'
 m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
def uvmesh(o):
 if o.type!='MESH':return
 if not o.data.uv_layers:
  uv=o.data.uv_layers.new(name='UVMap')
  for poly in o.data.polygons:
   axes=sorted(range(3),key=lambda k:abs(poly.normal[k]))[:2]
   for li in poly.loop_indices:
    co=o.data.vertices[o.data.loops[li].vertex_index].co
    uv.data[li].uv=(co[axes[0]]*.35,co[axes[1]]*.35)
def mesh(name,v,f,m,r):
 data=bpy.data.meshes.new(name);data.from_pydata(v,[],f);data.update()
 o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.parent=r;data.materials.append(m);uvmesh(o);return o
# Shared bevelled stone meshes keep detailed architecture inexpensive.
bpy.ops.mesh.primitive_cube_add(size=1);proto=bpy.context.object
mod=proto.modifiers.new('Soft eroded corners','BEVEL');mod.width=.035;mod.segments=2
bpy.ops.object.modifier_apply(modifier=mod.name);unit=proto.data.copy();bpy.data.objects.remove(proto,do_unlink=True)
blocks={}
def box(name,loc,scale,m,r,angle=0):
 if m.name not in blocks:
  d=unit.copy();d.materials.clear();d.materials.append(m);blocks[m.name]=d
 o=bpy.data.objects.new(name,blocks[m.name]);bpy.context.collection.objects.link(o);o.parent=r;o.location=loc;o.scale=scale;o.rotation_euler.z=angle;return o
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2);proto=bpy.context.object;rockdata=proto.data.copy();bpy.data.objects.remove(proto,do_unlink=True)
rocks={}
def rock(name,loc,scale,m,r):
 if m.name not in rocks:
  d=rockdata.copy();d.materials.clear();d.materials.append(m);rocks[m.name]=d
 o=bpy.data.objects.new(name,rocks[m.name]);bpy.context.collection.objects.link(o);o.parent=r;o.location=loc;o.scale=scale;o.rotation_euler=(random.random()*.3,random.random()*.4,random.random()*6);return o
def tube(name,pts,radii,m,r,n=9):
 vs=[];fs=[]
 for i,p in enumerate(pts):
  p=Vector(p);t=Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(0,i-1)]);t.normalize()
  u=t.cross(Vector((0,0,1)))
  if u.length<.01:u=t.cross(Vector((0,1,0)))
  u.normalize();v=t.cross(u)
  for j in range(n):vs.append(tuple(p+radii[i]*(u*math.cos(j*math.tau/n)+v*math.sin(j*math.tau/n))))
 for i in range(len(pts)-1):
  for j in range(n):
   a=i*n+j;b=i*n+(j+1)%n;fs.append((a,b,b+n,a+n))
 return mesh(name,vs,fs,m,r)
def wall(name,x,y,length,height,r,axis='x',ruined=False):
 for row in range(int(height/.48)):
  for j in range(int(length/1.03)):
   if ruined and row>1 and random.random()<.2+row*.045:continue
   t=j*1.03-length/2+(row%2)*.38
   loc=(x+t,y,row*.48+.24) if axis=='x' else (x,y+t,row*.48+.24)
   size=(.98,.56,.45) if axis=='x' else (.56,.98,.45)
   box(name,loc,size,random.choice([stone,stone,edge]),r,random.uniform(-.012,.012))
def arch(name,x,y,width,height,r):
 # Explicit jambs and radial voussoirs, open all the way through.
 spring=height-width/2
 for side in [-1,1]:
  for j in range(max(1,int(spring/.5))):box(name+' jamb',(x+side*(width/2+.22),y,j*.5+.25),(.52,.75,.48),edge,r)
 for j in range(13):
  a=(j+.5)*math.pi/13;rad=width/2+.23
  o=box(name+' arch stone',(x+rad*math.cos(a),y,spring+rad*math.sin(a)),(.52,.8,.52),edge,r)
  o.rotation_euler.y=a-math.pi/2
def house(name,x,y,w,d,h,r,ruined=False):
 wall(name+' frontage',x,y,w,h,r,ruined=ruined)
 wall(name+' side',x-w/2,y+d/2,d,h,r,'y',ruined)
 wall(name+' side',x+w/2,y+d/2,d,h,r,'y',ruined)
 if not ruined:
  box(name+' plaster frieze',(x,y-.06,h+.15),(w+.1,.64,.4),plaster,r)
  box(name+' deep doorway',(x,y-.31,1.1),(1.15,.055,2.2),dark,r)
  for side in [-1,1]:
   box(name+' upper window',(x+side*w*.27,y-.32,h*.65),(.55,.06,.8),dark,r)
  for j in range(5):box(name+' exposed roof joist',(x-w/2+j*w/4,y-.4,h+.45),(.14,.85,.14),wood,r)
def tree(name,x,y,h,r,leaf=True):
 tube(name+' twisted trunk',[(x,y,0),(x+.15,y+.1,h*.4),(x-.12,y,h*.72),(x+.2,y,h)],[.25,.20,.12,.04],wood,r)
 for j in range(7):
  a=j*2.399;z=h*(.56+(j%3)*.10);end=(x+math.cos(a)*h*.48,y+math.sin(a)*h*.4,z+h*.2)
  tube(name+' branch',[(x,y,z),((x+end[0])/2,(y+end[1])/2,z+.5),end],[.12,.06,.015],wood,r)
  if leaf:
   for k in range(3):rock(name+' leaf canopy',(end[0]+random.uniform(-.6,.6),end[1]+random.uniform(-.6,.6),end[2]+random.random()*.2),(.9,.7,.30),foliage,r)
def terrain(ch,r):
 vs=[];fs=[];n=65
 for i in range(n):
  for j in range(n):
   x=-48+i*1.5;y=-35+j*1.65
   dist=math.hypot(x,y);outer=max(0,min(1,(dist-8)/22))
   z=-.09+outer*(.7*math.sin(x*.18+y*.11)+.4*math.sin(y*.34))+.035*math.sin(x*2+y*1.4)
   if ch==4:z-=max(0,min(1,(x+1)/5))*.9
   vs.append((x,y,z))
 for i in range(n-1):
  for j in range(n-1):
   a=i*n+j;fs.append((a,a+n,a+n+1,a+1))
 o=mesh('Continuous weathered terrain '+str(ch),vs,fs,sand if ch!=4 else earth,r)
 for p in o.data.polygons:p.use_smooth=True
 # Three staggered ridge bands give an atmospheric horizon, not a ring of cones.
 for band in range(3):
  v=[];f=[];count=25
  for j in range(count):
   x=-64+j*5.5;y=26+band*16+math.sin(j*1.7)*5
   z=4+band*3+random.random()*5+3*math.sin(j*.73)
   v.extend([(x,y,-1),(x,y,z),(x,y+12,z*.7)])
  for j in range(count-1):
   a=j*3;f.extend([(a,a+3,a+4,a+1),(a+1,a+4,a+5,a+2)])
  mesh('Layered mountain horizon '+str(band),v,f,stone if band==0 else earth,r)
 for j in range(70):
  x=random.uniform(-22,22);y=random.uniform(-12,22)
  if abs(x)<4 and abs(y)<4:continue
  s=random.uniform(.08,.38);rock('Ground fragments',(x,y,.04),(s,s*.65,s*.3),random.choice([stone,edge,earth]),r)
for ch,r in enumerate(roots):
 terrain(ch,r)
 if ch==0:
  # An unoccupied monumental threshold: no personification of God.
  for j in range(11):
   box('Vast threshold stair',(0,5+j*.8,j*.20),(22,.85,.25),edge,r)
  for x in [-9,9]:
   wall('Threshold retaining wall',x,8,13,3,r,'y')
   for z in range(10):box('Weathered threshold pier',(x,12,z*.85+.4),(2.1,2.0,.8),stone,r)
  arch('Unoccupied eastern opening',0,14,11,14,r)
  for k in range(4):
   rock('Canyon foreground',(-11-k*1.8,-4+k*2,.5+k*.25),(2.2,3.4,1.5+k*.4),stone,r)
 elif ch==1:
  # The ruined home belongs to a whole street. Broken roof and household detail lead to Job.
  house('West abandoned dwelling',-10,6,6,6,4.8,r,True)
  house('Eastern dwelling',9,8,6,7,5.6,r)
  house('Distant street house',-2,17,7,5,6,r)
  house('Distant street house',8,20,6,6,4.8,r)
  wall('Broken alley wall',-7,-1,8,2.8,r,'y',True)
  arch('Damaged courtyard gateway',0,8,3.1,4.8,r)
  wall('Courtyard rear wall',-4.3,8,4,3.2,r,ruined=True)
  wall('Courtyard rear wall',4.3,8,4,3.2,r,ruined=True)
  for j in range(35):
   x=random.uniform(-5,5);y=random.choice([-3.4,3.1])+random.uniform(-.5,.8)
   o=box('Fallen masonry pile',(x,y,random.uniform(.12,.5)),(random.uniform(.25,.8),.45,.35),random.choice([stone,edge]),r,random.random()*3)
   o.rotation_euler.x=random.uniform(-.4,.4)
  for j in range(9):
   o=box('Collapsed roof slat',(-2+j*.46,1,.9+random.random()*.2),(.14,4,.10),wood,r,.32)
   o.rotation_euler.x=.17
  for j in range(8):
   box('Household threshold paving',(-1.3+(j%2)*.85,-4-j//2*.6,.04),(.8,.53,.09),edge,r,.04)
  tree('Scorched courtyard tree',-6,3,4.8,r,False)
  box('Foreground fallen lintel',(-5,-5,.2),(3,.65,.55),stone,r,.6)
 elif ch==2:
  # Shared courtyard; colonnade and woven shade enclose a conversation, not a court victory.
  for row in range(13):
   for col in range(14):
    x=(col-6.5)*.85;y=(row-6)*.85
    box('Worn courtyard paving',(x,y,-.04),(.81,.81,.07),stone if random.random()<.7 else edge,r)
  wall('Courtyard enclosure west',-7,3,15,4.2,r,'y')
  wall('Courtyard enclosure rear',0,9,16,4.2,r)
  house('Courtyard adjoining room',10,5,5,7,5,r)
  for x in [-5,0,5]:
   arch('Courtyard colonnade',x,6,3.7,4.5,r)
  # A woven awning hangs behind, leaving faces and foreground open.
  v=[];f=[]
  for i in range(21):
   for j in range(13):v.append((-6+i*.6,3+j*.45,5.5-.6*math.sin(i*math.pi/20)+.04*math.sin(i*4+j)))
  for i in range(20):
   for j in range(12):
    a=i*13+j;f.append((a,a+1,a+14,a+13))
  mesh('Sagging woven shade',v,f,cloth,r)
  for x in [-6,6]:tube('Awning support',[(x,3,0),(x,3,5.8)],[.11,.09],wood,r)
  tree('Olive at courtyard edge',-8,6,6,r)
  for x in [-4.9,4.9]:box('Low courtyard bench',(x,-1,.35),(.6,3,.7),plaster,r)
 elif ch==3:
  # A lone figure before an empty city threshold, with a long diagonal path.
  arch('City gate',0,10,5.0,7.5,r)
  wall('Gate west rampart',-9,10,11,6,r,ruined=True)
  wall('Gate east rampart',9,10,11,6,r,ruined=True)
  for x in [-4,4]:
   for j in range(12):box('Gate square tower',(x,11,j*.6+.3),(1.5,2,.55),stone,r)
  for j in range(18):
   for k in [-1,0,1]:box('Road toward unanswered gate',(k*.9+math.sin(j*.18)*.3,-9+j*.9,.015),(.84,.83,.08),edge,r)
  for x,y in [(-9,0),(12,5),(-14,15)]:tree('Wind stripped thorn',x,y,4.0,r,False)
 elif ch==4:
  # A connected shore and sea replace two circular animal display pools.
  sea=material('Deep water',(.035,.12,.145),.22)
  v=[];f=[];n=65
  for i in range(n):
   for j in range(n):v.append((-1+i*1.25,-28+j*1.5,.035))
  for i in range(n-1):
   for j in range(n-1):
    a=i*n+j;f.append((a,a+n,a+n+1,a+1))
  mesh('Open restless sea',v,f,sea,r)
  for j in range(13):
   x=-9-random.random()*5;y=1+j*1.3
   rock('Stratified shore cliff',(x,y,2+j*.12),(3.7,3.0,3.0+random.random()*2),stone,r)
   box('Cliff sediment ledge',(x+.4,y,1.3),(5,3.7,.35),edge,r,.1)
  for j in range(95):
   x=random.uniform(-8,-2);y=random.uniform(-2,8)
   if -6<x<-3 and -2<y<2:continue
   h=random.uniform(.4,1.2)
   tube('Reed bank',[(x,y,-.02),(x+.12,y,h*.65),(x+.35,y,h)],[.025,.016,.002],reed,r,5)
  for prefix,center,scale,shift in [('Behemoth',(-2.7,0,0),1.45,(-1.8,-.7,0)),('Leviathan',(2.7,1.4,0),2.15,(2.2,1.7,.03))]:
   transform=Matrix.Translation(Vector(center)+Vector(shift))@Matrix.Scale(scale,4)@Matrix.Translation(-Vector(center))
   for o in list(r.children):
    if o.name.startswith(prefix):o.matrix_local=transform@o.matrix_local
  for j in range(8):rock('Far ocean stack',(12+j*3,17+random.random()*7,random.uniform(.6,1.8)),(1.3,1.5,3+random.random()*4),earth,r)
 else:
  # Return to a human place: broken stone remains, a tree and table make room for company.
  wall('Remembered house wall',-6,2,10,1.8,r,'y',True)
  wall('Remembered house rear',0,7,12,2.4,r,ruined=True)
  arch('Open garden doorway',2,7,2.8,3.8,r)
  tree('Old olive new growth',5,3,5.5,r)
  tree('Distant garden olive',-11,12,6.5,r)
  for j in range(8):
   box('Garden path',(-1+(j%2)*.8,-5+j//2*.9,.015),(.72,.8,.09),edge,r)
  for x in [-1.2,1.2]:box('Shared table leg',(x,0,.28),(.2,.6,.56),wood,r)
  box('Low shared table',(0,0,.62),(3.1,1.3,.15),wood,r)
  vessel=bpy.data.objects.get('Shared table vessel')
  if vessel:vessel.location.z+=.68
  # Simple bread and cups keep the shared table material and ordinary.
  for x in [-.9,.6]:rock('Unbroken bread',(x,-.05,.78),(.3,.21,.075),pot,r)
  for j in range(12):rock('Garden low plant',(random.choice([-4,6])+random.random(),random.uniform(-2,6),.11),(.35,.3,.18),foliage,r)
# Add a loose shawl around each existing figure, preserving the face and pose.
for rig in [o for o in bpy.data.objects if o.type=='EMPTY' and o.name in ['Job','Job.001','Job standing','Eliphaz','Bildad','Zophar']]:
 seated='standing' not in rig.name;z=1.02 if seated else 1.43;v=[];f=[]
 for i in range(19):
  a=-.15+math.pi*1.3*i/18
  for j in range(5):
   v.append((math.cos(a)*(.40+j*.025),math.sin(a)*(.28+j*.02),z-j*.09+.028*math.sin(i*.9+j)))
 for i in range(18):
  for j in range(4):
   a=i*5+j;f.append((a,a+5,a+6,a+1))
 mesh('Woven shoulder mantle',v,f,cloth if 'Job' not in rig.name else blue,rig)
for o in bpy.data.objects:
 if o.type=='MESH':uvmesh(o)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE'
for o in list(bpy.data.objects):
 if o.type=='LIGHT':bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.object.light_add(type='SUN');sun=bpy.context.object;sun.name='Low warm evening sun';sun.data.energy=3.0;sun.data.color=(1,.77,.49);sun.rotation_euler=(.6,-.55,-.6);sun.data.angle=.10
bpy.ops.object.light_add(type='SUN');fill=bpy.context.object;fill.name='Open sky fill';fill.data.energy=.7;fill.data.color=(.54,.68,.84);fill.rotation_euler=(.15,.6,2.6)
scene.world.color=(.17,.19,.23)
camera=bpy.data.objects.get('Delivery camera');camera.location=(148,-13,6);target=Vector((140,2,1.5));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=36;scene.camera=camera
scene.render.resolution_x=1120;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.render.image_settings.media_type='IMAGE';scene.render.image_settings.file_format='PNG'
out=artifacts.file(name='job-composed-environment.png',media_type='image/png');scene.render.filepath=out.path;bpy.ops.render.render(write_still=True);out.publish()
result={'roots':6,'meshes':sum(o.type=='MESH' for o in bpy.data.objects),'materials':len(bpy.data.materials),'camera':list(camera.location),'design':'continuous terrain, ancient built context, PBR maps, connected shore'}
