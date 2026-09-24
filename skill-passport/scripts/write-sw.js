import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root = path.resolve(process.argv[2] || 'dist');
async function files(dir) { const entries = await readdir(dir, { withFileTypes:true }); return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : path.join(dir,entry.name)))).flat(); }
const assets = (await files(root)).filter(file => !file.endsWith('sw.js') && path.basename(file) !== '.nojekyll');
const urls = assets.map(file => './' + path.relative(root,file).split(path.sep).join('/'));
const hash = createHash('sha256'); for (const file of assets) hash.update(await readFile(file));
const version = `alt-passport-${hash.digest('hex').slice(0,12)}`;
await writeFile(path.join(root, 'sw.js'), `
const CACHE = ${JSON.stringify(version)};
const ASSETS = ${JSON.stringify(urls)};
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('activate', event => { event.waitUntil((async () => { for (const key of await caches.keys()) if (key.startsWith('alt-passport-') && key !== CACHE) await caches.delete(key); await self.clients.claim(); })()); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') { event.respondWith(caches.open(CACHE).then(cache => cache.match(new URL('index.html', self.registration.scope).href)).then(cached => cached || fetch(event.request))); return; }
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request, { ignoreVary: true })) || fetch(event.request)));
});
`);
console.log(`Offline app shell generated: ${version} (${urls.length} files)`);
