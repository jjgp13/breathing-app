import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// No independent animation loop: the session clock seeks the Blender-authored clip.
window.Breathe3D = {
    async create(host, onFailure) {
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.replaceChildren(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
        camera.position.set(0, 2.6, 5.8);
        camera.lookAt(0, 0.1, 0);
        scene.add(new THREE.HemisphereLight(0xd3fff0, 0x163542, 2.3));
        const key = new THREE.DirectionalLight(0xfff1d5, 3.5);
        key.position.set(2, 4, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x8ce3ff, 2.7);
        rim.position.set(-3, 1, -2);
        scene.add(rim);
        let model, mixer, clip, lastVolume = null, disposed = false;
        const resize = () => {
            const width = host.clientWidth || 320;
            const height = host.clientHeight || 300;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            if (model && !disposed) renderer.render(scene, camera);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        const destroy = () => {
            if (disposed) return;
            disposed = true;
            observer.disconnect();
            mixer?.stopAllAction();
            if (model) {
                mixer?.uncacheRoot(model);
                model.traverse(child => {
                    child.geometry?.dispose();
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.filter(Boolean).forEach(material => material.dispose());
                });
            }
            renderer.dispose();
            renderer.domElement.remove();
        };
        renderer.domElement.addEventListener('webglcontextlost', event => {
            event.preventDefault();
            destroy();
            onFailure();
        }, { once: true });
        try {
            const gltf = await new GLTFLoader().loadAsync(new URL('assets/models/breathing-bloom.glb', document.baseURI).href);
            model = gltf.scene;
            if (disposed) {
                model.traverse(child => {
                    child.geometry?.dispose();
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.filter(Boolean).forEach(material => material.dispose());
                });
                throw new Error('The guide was closed while loading.');
            }
            scene.add(model);
            clip = gltf.animations[0];
            if (!clip) throw new Error('The breathing model needs its Blender animation.');
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(clip).play();
            resize();
        } catch (error) {
            destroy();
            throw error;
        }
        let lastRender = -Infinity;
        return {
            update(volume, timestamp = performance.now(), force = false) {
                if (disposed || document.hidden) return;
                if (!force && volume === lastVolume) return;
                if (!force && timestamp - lastRender < 32) return;
                lastRender = timestamp;
                lastVolume = volume;
                mixer.setTime(Math.min(1, Math.max(0, lastVolume)) * clip.duration / 2);
                renderer.render(scene, camera);
            },
            destroy
        };
    }
};
