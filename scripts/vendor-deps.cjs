const fs=require('node:fs');
const copies={
 'node_modules/swiper/swiper-bundle.min.js':'js/vendor/swiper.js',
 'node_modules/swiper/swiper-bundle.min.css':'css/vendor/swiper.css',
 'node_modules/swiper/LICENSE':'assets/SWIPER-LICENSE.txt',
 'node_modules/gsap/dist/gsap.min.js':'js/vendor/gsap.js',
};
for(const [source,dest] of Object.entries(copies)){fs.mkdirSync(require('node:path').dirname(dest),{recursive:true});fs.copyFileSync(source,dest);}
const gsap=require('../node_modules/gsap/package.json');
fs.writeFileSync('assets/GSAP-LICENSE.txt',`GSAP ${gsap.version}\nCopyright 2026, GreenSock. All rights reserved.\n${gsap.license}\n\nThe original copyright and license banner is preserved in js/vendor/gsap.js.\nThe applicable terms are published by the copyright holder at https://gsap.com/standard-license/.\n`);
