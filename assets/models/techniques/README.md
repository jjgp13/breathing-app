# Movement lesson and archived breathing guides

The active 3D teaching aid is `diaphragmatic.glb`, authored in Blender 5.2 with `scripts/create-diaphragm-lesson.py`. Its editable source is `diaphragm-lesson.blend`. The dome is a surface so the optional side view can explain its flattening and downward movement; the green shape is an abdominal movement cue. Run `npm run build` after regenerating to refresh asset versions.

`technique-guides.blend` and the other eight GLBs are archived artwork from the earlier nine-model gallery. They are not loaded or offered during practice. `scripts/create-technique-models.py` recreates that older gallery, including its older diaphragm, so run the active lesson generator afterward. The current app uses the lesson's named parts and manual position controls, without autoplay. See `docs/visual-guides.md` for the rationale and limits.

No downloaded meshes, fonts, images, textures, or animations are used. These are pacing metaphors and a simplified diaphragm/belly schematic; they are not measurements or clinical anatomy assets.
