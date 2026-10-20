import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createLeaderboard} from './server/leaderboard.js';
const db=new DatabaseSync(process.env.ALT_LEADERBOARD_DB||'/tmp/alt-showcase-leaderboard.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS scores (id TEXT PRIMARY KEY, mode TEXT, data TEXT)');
const store={local:true,async add(mode,row){db.prepare('INSERT OR IGNORE INTO scores VALUES (?,?,?)').run(row.id,mode,JSON.stringify(row));},async list(mode){return db.prepare('SELECT data FROM scores WHERE mode=?').all(mode).map(x=>JSON.parse(x.data));}};
const handle=createLeaderboard(store,'local-preview-secret');
const root=resolve('.');
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/leaderboard'){
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192){res.writeHead(413).end();return;}}
 const data=await handle(req.method,raw?JSON.parse(raw):{},Object.fromEntries(url.searchParams));res.writeHead(data.status||200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(data));return;
 }const path=resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));if(!path.startsWith(root+'/')||url.pathname.split('/').some(x=>x.startsWith('.'))||/\/(server|api|tests)\//.test(url.pathname)){res.writeHead(403).end();return;}const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};const content=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'}).end(content);}catch{res.writeHead(404).end('Not found');}}).listen(Number(process.env.PORT||5174),'0.0.0.0',()=>console.log('ALT preview: http://127.0.0.1:'+(process.env.PORT||5174)));
