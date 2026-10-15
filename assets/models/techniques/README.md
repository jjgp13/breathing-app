# Nine breathing guides

Original procedural models authored in Blender 5.2 for Breathe. Regenerate with `scripts/create-technique-models.py`, then `npm run build` to refresh the version manifest and browser bundle.

`technique-guides.blend` arranges the nine designs in a 3×3 source scene. Each `.glb` contains a single guide with named parts and an example animation. The browser uses the named parts and a shared phase-derived pose instead of running the preview clip. See `js/guide-poses.mjs` for the runtime mapping and `docs/visual-guides.md` for the design rationale.

No downloaded meshes, fonts, images, textures, or animations are used. These are pacing metaphors and a simplified diaphragm/belly schematic; they are not measurements or clinical anatomy assets.
