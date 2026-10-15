# Breathing bloom

Original procedural artwork and open/close shape-key animation created for Breathe using Blender 5.2. `breathing-bloom.blend` contains the editable mesh, materials, animation, camera, and lights. `breathing-bloom.glb` is the selected animated mesh for the web app; no external textures are required.

Regenerate with `scripts/create-bloom.py`, run through Blender's background Python command. The 4-second animation is a neutral open/close cycle. The app seeks the first half according to breathing phase volume, rather than playing the clip at a fixed speed. The second half is useful when previewing the animation in Blender.

The visual is a pacing metaphor. It does not measure breathing, HRV, lung volume, or treatment response.
