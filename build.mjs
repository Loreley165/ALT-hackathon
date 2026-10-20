import {mkdir, copyFile, cp} from 'node:fs/promises';
await mkdir('dist', {recursive:true});
for(const file of ['index.html','showcase.css','showcase.js','experience-model.js','prototype.html','reel.html','prototype-original.html','styles.css','app.js','result-ui.js','result-ui.css','alt-logo.svg','alt-brand-reference.png','alt-passport-reference.png']) await copyFile(file,`dist/${file}`);
await cp('vendor','dist/vendor',{recursive:true});
await cp('assets','dist/assets',{recursive:true});
await mkdir('dist/components',{recursive:true});
await copyFile('components/result.css','dist/components/result.css');
await cp('skill-passport/public','dist/skill-passport/public',{recursive:true});
console.log('Built the English ALT showcase and preserved original prototype in dist/');
