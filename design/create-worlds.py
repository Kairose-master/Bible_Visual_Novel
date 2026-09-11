import bpy, math, random
from mathutils import Vector
random.seed(71)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,rough=.85,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True
 b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal
 return m
stone=mat('Ash limestone',(.26,.32,.37));stoneLight=mat('Broken edges',(.41,.47,.50))
earth=mat('Midnight earth',(.11,.16,.20));sand=mat('Ash dust',(.25,.28,.29))
wood=mat('Charred cedar',(.10,.075,.06));pot=mat('Weathered clay',(.32,.24,.19))
cloth=mat('Job pale linen',(.63,.66,.62));darkcloth=mat('Eliphaz indigo wool',(.12,.18,.24))
grey=mat('Bildad slate wool',(.29,.34,.37));brown=mat('Zophar weathered wool',(.31,.27,.22))
skin=mat('Sun worn skin',(.38,.27,.20));hair=mat('Grey beard',(.27,.29,.28))
water=mat('Deep water',(.045,.13,.18),.23,.22);beast=mat('River life',(.22,.29,.28),.7);eye=mat('Dark eyes',(.02,.025,.02),.35)
roots=[]
def group(n):
 o=bpy.data.objects.new('CHAPTER_'+str(n),None);bpy.context.collection.objects.link(o);o.location=(n*30,0,0);roots.append(o);return o
def attach(o,name,material,parent):
 o.name=name;o.data.materials.append(material);o.parent=parent;return o
def mesh(name,verts,faces,material,parent):
 m=bpy.data.meshes.new(name);m.from_pydata(verts,[],faces);m.update()
 o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);o.data.materials.append(material);o.parent=parent;return o
def box(name,loc,scale,material,parent,rotation=(0,0,0)):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;o.rotation_euler=rotation
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=o.modifiers.new('Worn corners','BEVEL');mod.width=.07;mod.segments=2
 bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 return attach(o,name,material,parent)
def sphere(name,loc,scale,material,parent,sub=2):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc);o=bpy.context.object;o.scale=scale;attach(o,name,material,parent)
 for p in o.data.polygons:p.use_smooth=True
 return o
def cylinder(name,loc,radius,depth,material,parent,vertices=20):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
 return attach(bpy.context.object,name,material,parent)
def tube(name,points,radii,material,parent,sides=12):
 verts=[];faces=[]
 for i,p in enumerate(points):
  p=Vector(p);t=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])
  t.normalize();u=t.cross(Vector((0,0,1)))
  if u.length<.01:u=t.cross(Vector((0,1,0)))
  u.normalize();v=t.cross(u).normalized()
  for j in range(sides):
   a=j*math.tau/sides;verts.append(tuple(p+radii[i]*(math.cos(a)*u+math.sin(a)*v)))
 for i in range(len(points)-1):
  for j in range(sides):
   a=i*sides+j;b=i*sides+(j+1)%sides;faces.append((a,b,b+sides,a+sides))
 faces.extend([tuple(range(sides-1,-1,-1)),tuple((len(points)-1)*sides+j for j in range(sides))])
 o=mesh(name,verts,faces,material,parent)
 for p in o.data.polygons:p.use_smooth=True
 return o
def vessel(name,loc,parent):
 profile=[(.16,0),(.24,.08),(.38,.25),(.42,.5),(.33,.72),(.20,.85),(.21,.94),(.16,.96),(.15,.85),(.27,.67),(.33,.48),(.29,.25),(.13,.12)]
 verts=[];faces=[];n=28
 for r,z in profile:
  for j in range(n):
   a=j*math.tau/n;verts.append((loc[0]+r*math.cos(a),loc[1]+r*math.sin(a),loc[2]+z))
 for i in range(len(profile)-1):
  for j in range(n):faces.append((i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j))
 return mesh(name,verts,faces,pot,parent)
def terrain(parent):
 rings=9;n=64;verts=[(0,0,.015)]
 for k in range(1,rings+1):
  r=k*9/rings
  for j in range(n):
   a=j*math.tau/n;z=.04*math.sin(a*5+r)+.045*random.random()
   if k==rings:z=-.05
   verts.append((r*math.cos(a),r*math.sin(a),z))
 faces=[]
 for j in range(n):faces.append((0,1+j,1+(j+1)%n))
 for k in range(rings-1):
  for j in range(n):
   a=1+k*n+j;b=1+k*n+(j+1)%n;faces.append((a,b,b+n,a+n))
 floor=mesh('Ash terrain',verts,faces,sand,parent)
 cylinder('Stratified earth base',(0,0,-.25),9,.48,earth,parent,64)
 for j in range(20):
  a=j*math.tau/20;r=7.9+random.random()*.7
  sphere('Boundary stone '+str(j),(r*math.cos(a),r*math.sin(a),.1+random.random()*.25),(.5+random.random()*.5,.3+random.random()*.4,.25+random.random()*.4),stone,parent,1)
 for j in range(15):
  x=random.uniform(-6,6);y=random.uniform(-6,6)
  sphere('Scattered ash rubble '+str(j),(x,y,.08),(.12+random.random()*.2,.15,.1),stoneLight,parent,1)
def person(name,pos,parent,robe=cloth,seated=False,angle=0):
 rig=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(rig);rig.parent=parent;rig.location=pos;rig.rotation_euler.z=angle
 # A tailored continuous folded robe mesh, not stacked blocks.
 levels=[(0,.5,.38),(.2,.47,.36),(.6,.38,.29),(1.05,.31,.25),(1.4,.4,.24),(1.6,.23,.20)] if not seated else [(0,.65,.60),(.2,.65,.6),(.45,.54,.50),(.75,.35,.3),(1.0,.4,.25),(1.2,.23,.2)]
 v=[];f=[];n=32
 for k,(z,rx,ry) in enumerate(levels):
  for j in range(n):
   a=j*math.tau/n;fold=1+.08*math.sin(a*10+k*.2)
   v.append((rx*math.cos(a)*fold,ry*math.sin(a)*fold,z))
 for k in range(len(levels)-1):
  for j in range(n):f.append((k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j))
 mesh(name+' folded robe',v,f,robe,rig)
 z=1.41 if seated else 1.82
 sphere(name+' head',(0,-.025,z),(.23,.21,.29),skin,rig,3)
 sphere(name+' hair',(0,.055,z+.07),(.235,.18,.26),hair,rig,2)
 sphere(name+' beard',(0,-.145,z-.13),(.18,.11,.21),hair,rig,2)
 sphere(name+' nose',(0,-.231,z+.015),(.055,.07,.08),skin,rig,2)
 for x in [-.086,.086]:sphere(name+' eye',(x,-.214,z+.085),(.018,.018,.014),eye,rig,1)
 if seated:
  left=[(-.3,0,1.04),(-.47,-.21,.76),(-.3,-.52,.55)]
  right=[(.3,0,1.04),(.47,-.21,.76),(.3,-.52,.55)]
 else:
  left=[(-.31,0,1.4),(-.43,-.09,1),(-.37,-.19,.78)]
  right=[(.31,0,1.4),(.44,-.12,1.1),(.3,-.3,1)]
 for i,pts in enumerate([left,right]):
  tube(name+' sleeve '+str(i),pts,[.16,.14,.09],robe,rig)
  sphere(name+' hand '+str(i),pts[-1],(.10,.075,.09),skin,rig,2)
 for x in [-.2,.2]:sphere(name+' foot',(x,-.37,.07),(.14,.24,.09),skin,rig,2)
 return rig
for ch in range(6):
 g=group(ch);terrain(g)
 if ch==0:
  for k in range(3):
   radius=3.0+k*1.2
   points=[(radius*math.cos(i*math.tau/96),radius*math.sin(i*math.tau/96),.16+k*.19) for i in range(97)]
   tube('Unanswered horizon ring '+str(k),points,[.07]*len(points),stoneLight,g,8)
  for j in range(9):
   a=j*math.tau/9;sphere('Distant mountain '+str(j),(7*math.cos(a),7*math.sin(a),1),(.9,.9,1.8+random.random()*1.8),stone,g,1)
 elif ch==1:
  for side in [-1,1]:
   for j in range(7):
    h=random.choice([.5,1.0,1.5,2.0])
    for k in range(int(h/.5)):box('Collapsed house masonry',(-3.5+j,side*2.7,.25+k*.47),( .91,.6,.44),stone if j%2 else stoneLight,g)
  for side in [-1,1]:
   for j in range(4):box('End wall',(side*3.6,-1.9+j*.95,.4),(.6,.85,.7),stone,g)
  box('Fallen cedar beam',(-.3,-1.1,.45),(6.7,.24,.27),wood,g,(0,.09,.48))
  box('Broken roof beam',(1.7,1.3,.55),(3.7,.22,.25),wood,g,(0,.13,-.55))
  for j in range(4):vessel('Empty household vessel '+str(j),(-2+j*.72,1.7,.1),g)
  sphere('Ash seat',(1.8,-.4,.15),(.95,.8,.25),earth,g)
  person('Job',(1.8,-.4,.33),g,cloth,True,.3)
  mesh('Potsherd',[(-.35,-1.8,.1),(.05,-1.95,.13),(.23,-1.62,.15),(-.16,-1.55,.12)],[(0,1,2,3)],pot,g)
 elif ch==2:
  for j in range(12):
   a=j*math.tau/12;box('Circle paving '+str(j),(4.3*math.cos(a),4.3*math.sin(a),.12),(.8,.7,.19),stone,g,(0,0,a))
  person('Job',(0,0,.05),g,cloth,True,0)
  for j,(name,robe) in enumerate([('Eliphaz',darkcloth),('Bildad',grey),('Zophar',brown)]):
   a=.25+j*math.tau/3;x=3.1*math.cos(a);y=3.1*math.sin(a)
   sphere(name+' seat',(x,y,.15),(.68,.62,.25),stone,g,1)
   person(name,(x,y,.28),g,robe,True,a-math.pi/2)
  for j in range(5):box('Witness stone',(j*1.5-3,6.1,1.1),(.65,.7,2.2+random.random()),stone,g,(0,.1,0))
 elif ch==3:
  for j in range(7):
   box('Terrace step '+str(j),(0,2.0+j*.52,j*.12), (6.5,.55,.2),stone,g)
  person('Job standing',(-.5,-.1,.1),g,cloth,False,-.35)
  vessel('Unanswered vessel',(2.2,1.3,.1),g)
  for j in range(6):
   x=-5+j*2;sphere('Broken horizon',(x,5,.9),(.8,.6,1.1),stone,g,1)
 elif ch==4:
  # Heavy river animal: organic volumes and continuous limbs.
  cylinder('River pool',(-2.7,0,.10),2.7,.08,water,g,64)
  body=sphere('Behemoth body',(-2.7,.1,.95),(1.55,.7,.75),beast,g,3)
  sphere('Behemoth neck',(-3.8,.08,.97),(.55,.53,.53),beast,g,3)
  sphere('Behemoth muzzle',(-4.18,-.02,.86),(.52,.40,.30),beast,g,3)
  for x in [-3.5,-1.8]:
   for y in [-.38,.48]:
    tube('Behemoth leg',[(x,y,.92),(x+.07,y,.5),(x-.06,y,.18)],[.23,.20,.17],beast,g,12)
  for y in [-.33,.4]:sphere('Behemoth ear',(-3.75,y,1.35),(.12,.12,.16),beast,g,2)
  for y in [-.42,.44]:sphere('Behemoth eye',(-4,y,1.08),(.04,.028,.035),eye,g,1)
  tube('Behemoth cedar tail',[(-1.3,.12,1.1),(-.7,.2,1),(-.3,.45,1.35),(-.08,.7,1.55)],[.15,.12,.08,.025],beast,g)
  cylinder('Deep sea pool',(2.7,1.4,.11),2.4,.09,water,g,64)
  points=[]
  for j in range(45):
   t=j/44*math.tau*1.4;r=1.35-j/44*.35
   points.append((2.7+r*math.cos(t),1.4+r*math.sin(t),.32+.28*math.sin(t*1.5)))
  radii=[.25*(1-j/50)+.03 for j in range(45)]
  tube('Leviathan coiled body',points,radii,beast,g,16)
  head=points[0];sphere('Leviathan head',(head[0]+.2,head[1],head[2]+.12),(.48,.25,.22),beast,g,3)
  for j in range(0,38,3):
   x,y,z=points[j];sphere('Leviathan dorsal ridge '+str(j),(x,y,z+radii[j]),(.11,.11,.2),stoneLight,g,1)
  for j in range(13):
   a=j*math.pi/12;sphere('Storm ridge '+str(j),(7.6*math.cos(a),7.6*math.sin(a),1.8),(.65,.75,2+random.random()*2),stone,g,1)
  for j in range(18):
   x=-5+random.random()*3;y=2+random.random()
   tube('River reed '+str(j),[(x,y,.1),(x+.1,y,.6),(x+.23,y,1.05)],[.025,.023,.008],grey,g,6)
 else:
  for j in range(7):
   a=j*math.tau/7;sphere('Empty seat '+str(j),(3.3*math.cos(a),3.3*math.sin(a),.15),(.58,.6,.30),stone,g,2)
  vessel('Shared table vessel',(0,0,.1),g)
  # Folded fabric remaining in the empty place.
  verts=[];faces=[]
  for i in range(14):
   for j in range(10):verts.append((-1+i*.16,-1.8+j*.15,.12+.07*math.sin(i*.9+j*.2)))
  for i in range(13):
   for j in range(9):
    a=i*10+j;faces.append((a,a+1,a+11,a+10))
  mesh('Linen memory',verts,faces,cloth,g)
  tube('Living branch',[(5,3,0),(5.1,3,1.5),(4.9,3,2.6),(5.2,3,3.3)],[.15,.11,.07,.02],wood,g)
  tube('Living branch fork',[(5.05,3,1.6),(5.7,3,2.1),(6.1,3,2.8)],[.08,.05,.01],wood,g)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=960;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Midnight atmosphere');scene.world.color=(.09,.12,.17)
bpy.ops.object.light_add(type='SUN',location=(25,-6,12));sun=bpy.context.object;sun.name='Silver dusk key';sun.data.energy=2.2;sun.rotation_euler=(.5,-.45,-.3);sun.data.angle=.15
bpy.ops.object.light_add(type='AREA',location=(33,-4,9));fill=bpy.context.object;fill.name='Soft cinematic fill';fill.data.energy=650;fill.data.shape='DISK';fill.data.size=8;fill.rotation_euler=(.2,0,0)
bpy.ops.object.camera_add(location=(42,-15,13));camera=bpy.context.object;camera.name='Delivery camera';direction=Vector((30,0,1))-camera.location;camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();camera.data.type='PERSP';camera.data.lens=43;scene.camera=camera
scene.render.image_settings.file_format='PNG'
target=artifacts.file(name='job-ruined-house-preview.png',media_type='image/png');scene.render.filepath=target.path;bpy.ops.render.render(write_still=True);target.publish()
result={'chapters':len(roots),'objects':len(bpy.data.objects),'meshes':len([o for o in bpy.data.objects if o.type=='MESH']),'triangles':sum(len(o.data.polygons) for o in bpy.data.objects if o.type=='MESH'),'roots':[o.name for o in roots],'camera':camera.name}
