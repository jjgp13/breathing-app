/** Nine distinct SVG guides, driven exclusively by GuidePatterns frames. */
const Guide2D = {
    serial:0,
    arc(cx,cy,r,start,end) {
        const p=a=>[cx+r*Math.sin(a),cy-r*Math.cos(a)];
        const a=p(start),b=p(end);
        return `M${a} A${r},${r} 0 ${end-start>Math.PI?1:0} 1 ${b}`;
    },
    artwork(id,prefix) {
        const circle=(part,cx,cy,r,extra='')=>`<circle data-part="${part}" cx="${cx}" cy="${cy}" r="${r}" ${extra}/>`;
        switch(id){
            case 'natural':return circle('rest',160,130,80,'class="visual-faint"')+circle('center',160,130,44,'class="visual-fill"');
            case 'box':return `<rect class="visual-faint" x="70" y="35" width="180" height="180" rx="8"/>`+
                ['M70 35H250','M250 35V215','M250 215H70','M70 215V35'].map((d,i)=>`<path data-part="rail${i}" class="visual-line tone${i}" d="${d}"/>`).join('')+
                `<rect data-part="window" x="122" y="87" width="76" height="76" rx="15" class="visual-fill"/>`+circle('marker',70,35,8,'class="visual-pearl"')+
                `<text x="160" y="22">1</text><text x="271" y="131">2</text><text x="160" y="240">3</text><text x="49" y="131">4</text>`;
            case 'fourSevenEight': {
                const steps=[0,4/19,11/19,1];
                return steps.slice(0,3).map((start,i)=>`<path data-part="arc${i}" class="visual-line tone${i}" d="${this.arc(160,130,84,start*Math.PI*2+.025,steps[i+1]*Math.PI*2-.025)}"/>`+
                    `<text x="${160+108*Math.sin((start+steps[i+1])*Math.PI)}" y="${135-108*Math.cos((start+steps[i+1])*Math.PI)}">${[4,7,8][i]}</text>`).join('')+
                    `<path data-part="lantern" class="visual-fill tone2" d="M160 82Q205 130 160 178Q115 130 160 82Z"/>`+circle('marker',160,46,7,'class="visual-pearl"');
            }
            case 'diaphragmatic':return `<path class="visual-outline" d="M140 22L130 44Q103 49 102 79L112 132L117 229H203L208 132L218 79Q217 49 190 44L180 22"/>`+
                [0,1,2].map(i=>`<path class="visual-rib" d="M150 ${62+i*16}Q124 ${66+i*16} 118 ${77+i*16}M170 ${62+i*16}Q196 ${66+i*16} 202 ${77+i*16}"/>`).join('')+
                `<ellipse data-part="belly" cx="160" cy="181" rx="39" ry="34" class="visual-fill"/><path data-part="diaphragm" class="visual-line tone1" d="M115 130Q160 102 205 130"/>`;
            case 'resonance':return `<path class="visual-outline" d="M55 212H265"/><g data-part="tide">`+
                [0,1,2].map(i=>`<path class="visual-line tone${i===0?3:0}" opacity="${1-i*.3}" d="M45 ${130+i*16}Q102 ${98+i*16} 160 ${130+i*16}T275 ${130+i*16}"/>`).join('')+circle('buoy',160,122,12,'class="visual-pearl"')+`</g>`;
            case 'wimHof':return Array.from({length:30},(_,i)=>circle('bead'+i,160+85*Math.sin(i/30*Math.PI*2),127-85*Math.cos(i/30*Math.PI*2),3.8,'class="visual-gold"')).join('')+
                circle('core',160,127,32,'class="visual-fill"')+`<text data-part="breathCount" x="160" y="135" class="visual-count"></text>`;
            case 'buteyko':return `<path class="visual-outline" d="M122 227H198"/><g data-part="feather"><path class="visual-quill" d="M145 213Q150 122 176 40"/>`+
                Array.from({length:12},(_,i)=>{const y=70+i*11,x=169-i*1.8,w=35*Math.sin((i/12*.8+.1)*Math.PI);return `<path class="visual-barb" d="M${x-w} ${y-12}L${x} ${y+16}L${x+w} ${y-12}"/>`;}).join('')+`</g>`;
            case 'cyclicSighing':return `<defs><clipPath id="${prefix}main"><rect x="116" y="120" width="88" height="92" rx="30"/></clipPath><clipPath id="${prefix}top"><rect x="139" y="38" width="42" height="52" rx="18"/></clipPath></defs>`+
                `<path class="visual-quill" d="M160 90V120"/><rect class="visual-faint" x="116" y="120" width="88" height="92" rx="30"/><rect class="visual-faint" x="139" y="38" width="42" height="52" rx="18"/>`+
                `<rect data-part="main" clip-path="url(#${prefix}main)" x="116" y="212" width="88" height="0" class="visual-fill"/><rect data-part="top" clip-path="url(#${prefix}top)" x="139" y="90" width="42" height="0" class="visual-gold"/>`+
                `<text x="224" y="176">1</text><text x="203" y="69">2</text>`;
            case 'extendedExhale':return `<defs><clipPath id="${prefix}upper"><path d="M107 48H213L168 125H152Z"/></clipPath><clipPath id="${prefix}lower"><path d="M152 135H168L213 212H107Z"/></clipPath></defs>`+
                `<path class="visual-outline" d="M103 43H217Q207 87 171 124V136Q207 173 217 217H103Q113 173 149 136V124Q113 87 103 43Z"/>`+
                `<rect data-part="upper" x="105" y="125" width="110" height="0" clip-path="url(#${prefix}upper)" class="visual-fill"/><rect data-part="lower" x="105" y="212" width="110" height="0" clip-path="url(#${prefix}lower)" class="visual-blue"/>`+
                `<path class="visual-quill" d="M160 123V149"/><path class="visual-gold-line" d="M99 38H221M99 222H221"/><text x="80" y="73">4</text><text x="240" y="198">6</text>`;
            case 'humming':return `<ellipse class="visual-faint" cx="160" cy="169" rx="60" ry="12"/><path class="visual-gold-line" d="M100 168Q160 252 220 168"/><path class="visual-outline" d="M145 220H175"/>`+
                [0,1,2].map(i=>`<path data-part="ring${i}" class="visual-ripple" d="M${128-i*15} ${107-i*18}Q160 ${81-i*24} ${192+i*15} ${107-i*18}"/>`).join('')+
                circle('pearl',160,150,10,'class="visual-pearl"')+`<text data-part="humLabel" x="160" y="137">mmm</text>`;
            default:throw new Error('Unknown 2D guide: '+id);
        }
    },

    create(host,id,technique=null) {
        const prefix='guide'+(++this.serial)+'-';
        host.innerHTML=`<svg class="technique-svg" data-guide-kind="${id}" viewBox="0 0 320 260" aria-hidden="true">${this.artwork(id,prefix)}</svg>`;
        const svg=host.querySelector('svg');
        if(technique){
            if(id==='fourSevenEight')Array.from(svg.querySelectorAll('text')).slice(0,3).forEach((el,i)=>{el.textContent=technique.phases[i].duration;});
            if(id==='extendedExhale')Array.from(svg.querySelectorAll('text')).slice(0,2).forEach((el,i)=>{el.textContent=technique.phases[i].duration;});
        }
        const parts=new Map(Array.from(svg.querySelectorAll('[data-part]')).map(el=>[el.dataset.part,el]));
        const attr=(name,key,value)=>parts.get(name).setAttribute(key,String(value));
        const opacity=(name,value)=>attr(name,'opacity',value);
        return {
            update(frame) {
                const v=frame.volume;
                switch(id){
                    case 'box': {
                        const p=GuidePatterns.square(frame.boxStep,90);
                        attr('marker','cx',160+p[0]);attr('marker','cy',125-p[1]);
                        attr('window','transform',`translate(160 125) scale(${.65+.35*v}) translate(-160 -125)`);
                        for(let i=0;i<4;i++)opacity('rail'+i,frame.index===i&&!frame.preparing?1:.3);
                        break;
                    }
                    case 'fourSevenEight': {
                        const a=frame.cycle*Math.PI*2;attr('marker','cx',160+84*Math.sin(a));attr('marker','cy',130-84*Math.cos(a));
                        attr('lantern','transform',`translate(160 130) scale(${.5+.5*v}) translate(-160 -130)`);
                        for(let i=0;i<3;i++)opacity('arc'+i,frame.index===i&&!frame.preparing?1:.3);
                        break;
                    }
                    case 'diaphragmatic':
                        attr('belly','rx',39+14*v);attr('belly','ry',34+5*v);
                        attr('diaphragm','d',`M115 ${130+12*v}Q160 ${102+36*v} 205 ${130+12*v}`);break;
                    case 'resonance':attr('tide','transform',`translate(0 ${38-76*v})`);break;
                    case 'wimHof':
                        attr('core','r',22+17*v);parts.get('breathCount').textContent=frame.breath||'';
                        for(let i=0;i<30;i++){opacity('bead'+i,frame.breath===i+1?1:frame.breath>i+1?.6:.22);attr('bead'+i,'r',frame.breath===i+1?6:3.8);}break;
                    case 'buteyko':attr('feather','transform',`translate(0 ${-5*frame.feather}) rotate(${-6*frame.feather} 150 210)`);break;
                    case 'cyclicSighing':attr('main','y',212-92*frame.main);attr('main','height',92*frame.main);attr('top','y',90-52*frame.top);attr('top','height',52*frame.top);break;
                    case 'extendedExhale':attr('upper','y',125-77*v);attr('upper','height',77*v);attr('lower','y',212-77*(1-v));attr('lower','height',77*(1-v));break;
                    case 'humming':
                        attr('pearl','r',8+7*v);opacity('humLabel',frame.phase==='hum'&&!frame.preparing?1:0);
                        for(let i=0;i<3;i++){
                            const ripple=frame.hum===null?0:(1-Math.cos(frame.hum*Math.PI*6-i*.8))/2;
                            opacity('ring'+i,frame.hum===null?0:.35+.4*ripple);
                            attr('ring'+i,'transform',`translate(160 170) scale(${.95+.12*ripple}) translate(-160 -170)`);
                        }break;
                }
            },
            destroy(){host.replaceChildren();}
        };
    }
};
if(typeof module!=='undefined')module.exports=Guide2D;
