"""Create nine original, named-part breathing guides in Blender 5.2.
Each GLB includes a preview animation. The web app poses its parts from the session clock.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

OUT=Path(__file__).resolve().parents[1]/'assets'/'models'/'techniques'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, alpha=1, metal=.15):
    m=bpy.data.materials.new(name); m.use_nodes=True
    s=m.node_tree.nodes.get('Principled BSDF')
    s.inputs['Base Color'].default_value=(*color,alpha)
    s.inputs['Metallic'].default_value=metal
    s.inputs['Roughness'].default_value=.34
    s.inputs['Alpha'].default_value=alpha
    m.diffuse_color=(*color,alpha)
    m.use_backface_culling=False
    return m

JADE=material('Jade',(.18,.67,.55))
GOLD=material('Warm gold',(.92,.66,.28),metal=.35)
BLUE=material('Tide blue',(.18,.52,.84))
LILAC=material('Soft lilac',(.57,.43,.83))
FRAME=material('Deep sea frame',(.12,.30,.36))
GLASS=material('Sea glass',(.43,.76,.77),.20)
PEARL=material('Pearl',(.90,.95,.84))

def empty(name,parent=None):
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;return o

def finish(o,name,mat,parent):
    o.name=name;o.parent=parent;o.data.materials.append(mat)
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o

def sphere(name,loc,scale,mat,parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=loc)
    o=finish(bpy.context.object,name,mat,parent);o.scale=scale;return o

def cube(name,loc,scale,mat,parent):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=finish(bpy.context.object,name,mat,parent);o.scale=scale
    bevel=o.modifiers.new('Soft edges','BEVEL');bevel.width=.12;bevel.segments=3
    bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=bevel.name)
    return o

def curve(name,points,radius,mat,parent):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=radius;c.bevel_resolution=3
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.parent=parent;o.data.materials.append(mat)
    bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
    return o

def arc(name,r,start,end,mat,parent,depth=.065):
    return curve(name,[(r*math.sin(t),0,r*math.cos(t)) for t in [start+(end-start)*i/64 for i in range(65)]],depth,mat,parent)

def animate(o,prop,values):
    initial=getattr(o,prop).copy()
    for frame,value in values:
        setattr(o,prop,value);o.keyframe_insert(data_path=prop,frame=frame)
    setattr(o,prop,initial)

roots=[]
# Blender uses X/Z as the front plane. glTF converts Z-up to Y-up.
r=empty('box');roots.append(r)
for i,(loc,scale) in enumerate([((0,0,1.3),(2.6,.15,.13)),((1.3,0,0),(.13,.15,2.6)),((0,0,-1.3),(2.6,.15,.13)),((-1.3,0,0),(.13,.15,2.6))]):
    cube('rail_'+str(i),loc,scale,[JADE,GOLD,BLUE,LILAC][i],r)
bead=sphere('marker',(-1.3,-.12,1.3),(.16,.16,.16),PEARL,r)
animate(bead,'location',[(1,(-1.3,-.12,1.3)),(31,(1.3,-.12,1.3)),(61,(1.3,-.12,-1.3)),(91,(-1.3,-.12,-1.3)),(121,(-1.3,-.12,1.3))])

r=empty('fourSevenEight');roots.append(r)
for i,(a,b,m) in enumerate([(0,4/19,JADE),(4/19,11/19,GOLD),(11/19,1,LILAC)]):arc('arc_'+str(i),1.38,a*math.tau+.035,b*math.tau-.035,m,r)
lantern=sphere('lantern',(0,0,0),(.62,.38,.62),LILAC,r)
animate(lantern,'scale',[(1,(.3,.3,.3)),(31,(.7,.4,.7)),(75,(.7,.4,.7)),(121,(.3,.3,.3))])
sphere('cadence_marker',(0,-.12,1.38),(.12,.12,.12),PEARL,r)

r=empty('diaphragmatic');roots.append(r)
curve('torso',[(-.35,0,1.6),(-.5,0,1.32),(-.95,0,1.15),(-1,0,.6),(-.87,0,0),(-.73,0,-1.3),(.73,0,-1.3),(.87,0,0),(1,0,.6),(.95,0,1.15),(.5,0,1.32),(.35,0,1.6)],.055,FRAME,r)
for side in [-1,1]:
    for j in range(3):curve('rib_'+str(side)+'_'+str(j),[(side*.12,-.05,.95-j*.22),(side*.58,-.04,.88-j*.22),(side*.78,0,.68-j*.22)],.035,PEARL,r)
belly=sphere('belly',(0,0,-.72),(.66,.32,.56),JADE,r)
diaphragm=curve('diaphragm',[(-.72,-.14,-.12),(-.4,-.14,.05),(0,-.14,.13),(.4,-.14,.05),(.72,-.14,-.12)],.065,GOLD,r)
animate(belly,'scale',[(1,(.62,.28,.5)),(61,(.8,.43,.56)),(121,(.62,.28,.5))])
animate(diaphragm,'location',[(1,(0,0,0)),(61,(0,0,-.25)),(121,(0,0,0))])

r=empty('resonance');roots.append(r)
wave=empty('tide',r)
for j in range(3):
    curve('wave_'+str(j),[(-1.6+3.2*i/64,j*.22,.13*math.sin(i/64*math.tau)-j*.18) for i in range(65)],.065 if j==0 else .035,[BLUE,JADE,FRAME][j],wave)
sphere('buoy',(0,-.1,.13),(.22,.22,.22),PEARL,wave)
animate(wave,'location',[(1,(0,0,-.55)),(61,(0,0,.55)),(121,(0,0,-.55))])
curve('still_water',[(-1.7,.2,-1.05),(1.7,.2,-1.05)],.025,FRAME,r)

r=empty('wimHof');roots.append(r)
arc('bead_thread',1.4,0,math.tau,FRAME,r,.02)
for i in range(30):
    a=i/30*math.tau;sphere('bead_'+str(i),(1.4*math.sin(a),0,1.4*math.cos(a)),(.073,.073,.073),GOLD,r)
core=sphere('breath_core',(0,0,0),(.48,.34,.48),JADE,r)
animate(core,'scale',[(1,(.3,.25,.3)),(31,(.65,.4,.65)),(61,(.3,.25,.3)),(91,(.65,.4,.65)),(121,(.3,.25,.3))])

r=empty('buteyko');roots.append(r)
cube('rest', (0,0,-1.1),(1.2,.55,.12),FRAME,r)
feather=empty('feather',r)
curve('quill',[(0,0,-.85),(.04,0,-.2),(.12,0,.5),(.27,0,1.25)],.035,PEARL,feather)
for i in range(11):
    t=i/10;z=-.55+t*1.5;w=.43*math.sin((t*.85+.08)*math.pi)
    for side in [-1,1]:curve('barb_'+str(i)+'_'+str(side),[(.04+t*.1,0,z),(.04+t*.1+side*w,-.01,z+.35)],.025,JADE,feather)
animate(feather,'rotation_euler',[(1,(0,0,0)),(61,(0,-.12,0)),(121,(0,0,0))])

r=empty('cyclicSighing');roots.append(r)
for name,loc,scale in [('main',(0,0,-.58),(.82,.6,.70)),('top',(0,0,.92),(.44,.36,.38))]:
    sphere(name+'_shell',loc,scale,GLASS,r)
    inner=sphere(name+'_fill',loc,tuple(v*.84 for v in scale),JADE if name=='main' else GOLD,r)
    animate(inner,'scale',[(1,tuple(v*.18 for v in scale)),(61,tuple(v*.84 for v in scale)),(121,tuple(v*.18 for v in scale))])
curve('connection',[(0,0,.05),(0,0,.58)],.075,PEARL,r)

r=empty('extendedExhale');roots.append(r)
for z in [-1.25,1.25]:
    rim=arc('rim_'+str(z),.9,0,math.tau,FRAME,r,.055)
    rim.location.z=z;rim.scale.z=.10
# Rings lie in the front plane for an unmistakable hourglass silhouette.
for side in [-1,1]:curve('glass_'+str(side),[(side*.9,0,1.25),(side*.72,0,.85),(side*.18,0,.15),(side*.13,0,0),(side*.18,0,-.15),(side*.72,0,-.85),(side*.9,0,-1.25)],.055,PEARL,r)
cube('cap_top',(0,0,1.35),(1.9,.4,.12),GOLD,r);cube('cap_bottom',(0,0,-1.35),(1.9,.4,.12),GOLD,r)
for name,z in [('upper',.8),('lower',-.8)]:
    o=sphere(name+'_fill',(0,0,z),(.58,.24,.34),JADE if name=='upper' else BLUE,r)
    animate(o,'scale',[(1,(.25,.2,.15)),(61,(.68,.28,.42)),(121,(.25,.2,.15))])
curve('flow',[(0,-.02,-.55),(0,-.02,.55)],.025,GOLD,r)

r=empty('humming');roots.append(r)
# A shallow resonating bowl, with three separate rings used only during humming.
points=[]
for i in range(65):
    a=math.pi*i/64;points.append((math.cos(a),0,-.05-.58*math.sin(a)))
curve('bowl',points,.12,GOLD,r)
cube('bowl_foot',(0,0,-.76),(.5,.5,.1),FRAME,r)
for i in range(3):
    o=arc('sound_ring_'+str(i),.52+i*.22,-1.1,1.1,JADE,r,.035)
    o.location.z=.2+i*.18
    animate(o,'scale',[(1,(.8,.8,.8)),(61,(1.2,1.2,1.2)),(121,(.8,.8,.8))])
sphere('breath_pearl',(0,0,.2),(.22,.22,.22),PEARL,r)

scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=121;scene.render.fps=30;scene.frame_set(1)
for root in roots:
    bpy.ops.object.select_all(action='DESELECT')
    root.select_set(True)
    for o in root.children_recursive:o.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=str(OUT/(root.name+'.glb')),export_format='GLB',use_selection=True,export_animations=True,export_cameras=False,export_lights=False)
    print('GUIDE_EXPORTED',root.name)
# Arrange the editable source as a contact sheet, without affecting the web exports.
for i,root in enumerate(roots):root.location=(i%3*4.5,0,-(i//3)*4.5)
bpy.ops.object.camera_add(location=(4.5,-22,-3.5));camera=bpy.context.object
camera.rotation_euler=(Vector((4.5,0,-4.5))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=14.5;scene.camera=camera
for location,energy in [((0,-8,4),1800),((10,-5,-3),1500)]:
    bpy.ops.object.light_add(type='AREA',location=location);bpy.context.object.data.energy=energy;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=8
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=1200;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.world.color=(.08,.08,.08)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'technique-guides.blend'))
print('NINE_BREATHING_GUIDES_READY')
