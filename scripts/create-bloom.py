"""Rebuild the original Breathe model and morph animation with Blender in background mode."""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'models'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metallic=0.15):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = 0.3
    mat.diffuse_color = (*color, 1)
    mat.use_backface_culling = False
    return mat

materials = [material('Sea glass', (0.13, 0.55, 0.50)),
             material('Soft jade', (0.30, 0.69, 0.56)),
             material('Pearl heart', (0.94, 0.80, 0.53), 0.28)]
vertices, opened, faces, face_materials = [], [], [], []

# Six curved, double-sided petals. One morph target unfolds them around the heart.
rows, columns = 24, 8
for petal in range(6):
    offset = len(vertices)
    angle = petal * math.tau / 6
    for row in range(rows + 1):
        t = row / rows
        for column in range(columns + 1):
            side = (column / columns - 0.5) * 2
            width = math.sin(math.pi * t) ** 0.7 * 0.53 * side
            for positions, is_open in [(vertices, False), (opened, True)]:
                radial = (0.23 + 1.55 * t) if is_open else (0.25 + 0.60 * math.sin(math.pi * t))
                z = (-0.60 + 0.50 * math.sin(math.pi * t) - 0.15 * t) if is_open else (-0.65 + 1.65 * t)
                z += 0.13 * side * side * math.sin(math.pi * t)
                positions.append((radial * math.cos(angle) - width * math.sin(angle),
                                  radial * math.sin(angle) + width * math.cos(angle), z))
    for row in range(rows):
        for column in range(columns):
            start = offset + row * (columns + 1) + column
            faces.append((start, start + 1, start + columns + 2, start + columns + 1))
            face_materials.append(petal % 2)

# Pearl center expands slightly with the petals. No anatomy or physiological measurement is implied.
offset = len(vertices)
segments, rings = 40, 24
for ring in range(rings + 1):
    phi = math.pi * ring / rings
    for segment in range(segments):
        theta = math.tau * segment / segments
        for positions, radius in [(vertices, 0.43), (opened, 0.68)]:
            positions.append((radius * math.sin(phi) * math.cos(theta),
                              radius * math.sin(phi) * math.sin(theta),
                              radius * math.cos(phi) + 0.13))
for ring in range(rings):
    for segment in range(segments):
        a = offset + ring * segments + segment
        b = offset + ring * segments + (segment + 1) % segments
        faces.append((a, b, b + segments, a + segments))
        face_materials.append(2)

mesh = bpy.data.meshes.new('Breathing bloom mesh')
mesh.from_pydata(vertices, [], faces)
mesh.update()
obj = bpy.data.objects.new('Breathing Bloom', mesh)
bpy.context.collection.objects.link(obj)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
for mat in materials:
    mesh.materials.append(mat)
for polygon, material_index in zip(mesh.polygons, face_materials):
    polygon.material_index = material_index
    polygon.use_smooth = True
obj.shape_key_add(name='Rest')
breath = obj.shape_key_add(name='Breath')
for vertex, position in zip(breath.data, opened):
    vertex.co = position
for frame, value in [(1, 0), (61, 1), (121, 0)]:
    breath.value = value
    breath.keyframe_insert(data_path='value', frame=frame)
obj.data.shape_keys.animation_data.action.name = 'Breath — open and close'

scene = bpy.context.scene
scene.frame_start, scene.frame_end = 1, 121
scene.render.fps = 30
scene.frame_set(1)
scene.world.color = (0.12, 0.12, 0.12)

# A composed source scene makes the saved .blend useful for future art direction.
bpy.ops.object.camera_add(location=(3.4, -6.0, 3.1))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 0)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 4.8
scene.camera = camera
for location, energy, size in [((2, -3, 5), 600, 4), ((-4, -1, 2), 400, 3), ((0, 4, 3), 700, 3)]:
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.object
    light.data.energy, light.data.shape, light.data.size = energy, 'DISK', size
    light.rotation_euler = (Vector((0, 0, 0)) - light.location).to_track_quat('-Z', 'Y').to_euler()

scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.render.resolution_x, scene.render.resolution_y = 900, 700
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'breathing-bloom.blend'))
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.export_scene.gltf(filepath=str(OUT / 'breathing-bloom.glb'), export_format='GLB',
                          use_selection=True, export_animations=True, export_morph=True,
                          export_morph_normal=True, export_cameras=False, export_lights=False)
print('BREATHE_MODEL_READY', OUT / 'breathing-bloom.glb')
