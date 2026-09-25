import { build } from 'esbuild';
import { mkdir, copyFile, cp } from 'node:fs/promises';
await build({ entryPoints: ['components/mount.jsx'], bundle: true, minify: true, outfile: 'result-ui.js', define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.BASE_URL': '"./skill-passport/public/"' } });
await mkdir('dist/components', { recursive: true });
for (const file of ['index.html','styles.css','app.js','result-ui.js','result-ui.css','alt-brand-reference.png','alt-passport-reference.png']) await copyFile(file, `dist/${file}`);
await copyFile('components/result.css', 'dist/components/result.css');
await cp('skill-passport/public', 'dist/skill-passport/public', { recursive: true });
console.log('Built React bundle and complete three-screen deployment in dist/');
