import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { prepareModel, poseModel, requiredParts } from './guide-poses.mjs';
import modelVersions from './model-versions.generated.json';

window.Breathe3D = {
    async create(host,onFailure,id='resonance') {
        if(!requiredParts[id])throw new Error('Unknown breathing guide');
        const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
        renderer.outputColorSpace=THREE.SRGBColorSpace;
        renderer.toneMapping=THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure=1.1;
        renderer.domElement.setAttribute('aria-hidden','true');
        renderer.domElement.dataset.guideKind=id;
        host.replaceChildren(renderer.domElement);
        const scene=new THREE.Scene();
        const camera=new THREE.PerspectiveCamera(35,1,.1,30);
        camera.position.set(1.15,.65,7.2);camera.lookAt(0,0,0);
        scene.add(new THREE.HemisphereLight(0xd3fff0,0x163542,2.1));
        const key=new THREE.DirectionalLight(0xfff1d5,3);key.position.set(2,4,5);scene.add(key);
        const rim=new THREE.DirectionalLight(0x8ce3ff,2.4);rim.position.set(-3,1,-2);scene.add(rim);
        let model,disposed=false;
        const disposeModel=()=>{
            model?.traverse(child=>{
                child.geometry?.dispose();
                const materials=Array.isArray(child.material)?child.material:[child.material];
                materials.filter(Boolean).forEach(material=>material.dispose());
            });
        };
        const resize=()=>{
            if(disposed)return;
            const width=host.clientWidth||320,height=host.clientHeight||240;
            renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
            if(model)renderer.render(scene,camera);
        };
        const observer=new ResizeObserver(resize);observer.observe(host);
        const destroy=()=>{
            if(disposed)return;
            disposed=true;observer.disconnect();disposeModel();renderer.dispose();
            renderer.forceContextLoss();renderer.domElement.remove();
        };
        renderer.domElement.addEventListener('webglcontextlost',event=>{
            if(disposed)return;
            event.preventDefault();destroy();onFailure();
        },{once:true});
        try{
            const url=new URL(`assets/models/techniques/${id}.glb?v=${modelVersions[id]}`,document.baseURI).href;
            const gltf=await new GLTFLoader().loadAsync(url);
            model=gltf.scene;
            if(disposed){disposeModel();throw new Error('Guide closed while loading');}
            prepareModel(model,id);scene.add(model);resize();
        }catch(error){destroy();throw error;}
        let lastRender=-Infinity,lastPose=null;
        return {
            update(frame,timestamp=performance.now(),force=false){
                if(disposed||document.hidden||frame.id!==id)return;
                const signature=JSON.stringify(frame);
                if(!force&&(signature===lastPose||timestamp-lastRender<32))return;
                lastRender=timestamp;lastPose=signature;
                poseModel(model,frame);renderer.render(scene,camera);
            },
            destroy
        };
    }
};
