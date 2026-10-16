"""Original schematic for comparing diaphragm movement from the front and side.
Blender X/Z is the front plane; glTF converts Z-up to Y-up. Not an anatomical scan.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

out = Path(__file__).resolve().parents[1] / 'assets/models/techniques'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = .5
    return m

jade = material('Abdominal movement', (.18, .67, .55))
gold = material('Diaphragm muscle', (.92, .66, .28))
frame = material('Torso outline', (.17, .34, .40))
rib = material('Chest reference', (.62, .74, .72))
root = bpy.data.objects.new('diaphragmatic', None)
bpy.context.collection.objects.link(root)

def finish(obj, name, mat):
    obj.name = name
    obj.parent = root
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

def line(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for p, co in zip(spline.points, points):
        p.co = (*co, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return finish(obj, name, mat)

line('torso', [(-.35, 0, 1.6), (-.5, 0, 1.32), (-.95, 0, 1.15), (-1, 0, .6), (-.87, 0, 0), (-.73, 0, -1.42), (.73, 0, -1.42), (.87, 0, 0), (1, 0, .6), (.95, 0, 1.15), (.5, 0, 1.32), (.35, 0, 1.6)], .035, frame)
line('side_reference', [(0, .4, 1.3), (0, .48, .7), (0, .42, 0), (0, .34, -1.35)], .03, frame)
for j in range(3):
    points = [(.86 * math.cos(t), .40 * math.sin(t), .85 - j * .24 + .08 * math.cos(2*t)) for t in [i / 64 * math.tau for i in range(65)]]
    line('chest_reference_' + str(j), points, .025, rib)

bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, location=(0, 0, -.88))
belly = finish(bpy.context.object, 'belly', jade)
belly.scale = (.62, .28, .5)

# An actual domed surface lets the side view explain depth and flattening.
vertices = [(0, 0, .30)]
faces = []
segments, rings = 48, 12
for j in range(1, rings + 1):
    r = j / rings
    for i in range(segments):
        angle = i / segments * math.tau
        vertices.append((.76*r*math.cos(angle), .43*r*math.sin(angle), -.08 + .38*(1-r*r)))
for i in range(segments):
    faces.append((0, 1+i, 1+(i+1)%segments))
for j in range(rings - 1):
    a, b = 1+j*segments, 1+(j+1)*segments
    for i in range(segments):
        n = (i+1)%segments
        faces.append((a+i, b+i, b+n, a+n))
mesh = bpy.data.meshes.new('Diaphragm dome')
mesh.from_pydata(vertices, [], faces)
mesh.update()
diaphragm = bpy.data.objects.new('diaphragm', mesh)
bpy.context.collection.objects.link(diaphragm)
finish(diaphragm, 'diaphragm', gold)
solidify = diaphragm.modifiers.new('Muscle surface', 'SOLIDIFY')
solidify.thickness = .025
bpy.context.view_layer.objects.active = diaphragm
bpy.ops.object.modifier_apply(modifier=solidify.name)

bpy.ops.object.select_all(action='DESELECT')
root.select_set(True)
for obj in root.children_recursive:
    obj.select_set(True)
bpy.context.view_layer.objects.active = root
bpy.ops.export_scene.gltf(filepath=str(out/'diaphragmatic.glb'), export_format='GLB', use_selection=True, export_animations=False)

# Save a clean editable scene in the resting position.
scene = bpy.context.scene
bpy.ops.object.camera_add(location=(3.8, -6, 1.5))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, .1))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.camera = camera
bpy.ops.object.light_add(type='AREA', location=(2, -4, 4))
bpy.context.object.data.energy = 800
bpy.context.object.data.size = 5
bpy.ops.wm.save_as_mainfile(filepath=str(out/'diaphragm-lesson.blend'))
print('DIAPHRAGM_LESSON_READY')
