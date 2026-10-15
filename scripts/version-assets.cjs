// Content versions prevent a browser from combining old controllers with new UI.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,16);
const check=process.argv.includes('--check');
const models=Object.fromEntries(fs.readdirSync(path.join(root,'assets/models/techniques')).filter(file=>file.endsWith('.glb')).sort().map(file=>[
    file.slice(0,-4),hash(fs.readFileSync(path.join(root,'assets/models/techniques',file)))
]));
const manifest=JSON.stringify(models,null,2)+'\n';
const generated='js/model-versions.generated.json';
if(process.argv.includes('--models')){
    fs.writeFileSync(path.join(root,generated),manifest);
}else{
    if(read(generated)!==manifest)throw new Error('Model versions are stale. Run npm run build.');
    const guideFile='js/breath-guide.js',currentGuide=read(guideFile);
    const guide=currentGuide.replace(/js\/vendor\/guide3d\.bundle\.js\?v=[^']+/,`js/vendor/guide3d.bundle.js?v=${hash(read('js/vendor/guide3d.bundle.js'))}`);
    const currentHtml=read('index.html');
    const html=currentHtml.replace(/((?:src|href)=")((?:js|css)\/[^"?]+)(?:\?[^"\s]*)?"/g,(_,attribute,file)=>{
        const content=file===guideFile?guide:read(file);
        return `${attribute}${file}?v=${hash(content)}"`;
    });
    if(check){
        if(guide!==currentGuide||html!==currentHtml)throw new Error('Browser asset versions are stale. Run npm run build.');
        console.log('Browser and model asset versions are current.');
    }else{
        fs.writeFileSync(path.join(root,guideFile),guide);
        fs.writeFileSync(path.join(root,'index.html'),html);
        console.log('Updated browser and model asset versions.');
    }
}
