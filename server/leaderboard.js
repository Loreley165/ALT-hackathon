import {createHmac,randomUUID,timingSafeEqual,randomInt} from 'node:crypto';
import {rounds,assessOrder,GAME_VERSION,normalizeNickname,drawQuestionIds,questionsForIds} from '../experience-model.js';
export function createLeaderboard(store,secret){
 const sign=s=>createHmac('sha256',secret).update(s).digest('base64url');
 return async function handle(method,body={},query={}){
  const mode=body.mode||query.mode||'rush';
  if(!['rush','service'].includes(mode))return {status:400,error:'Unknown difficulty.'};
  if(method==='POST'&&body.action==='start'){
   const questionIds=drawQuestionIds(()=>randomInt(1000000)/1000000);
   const payload=Buffer.from(JSON.stringify({id:randomUUID(),at:Date.now(),mode,version:GAME_VERSION,questionIds})).toString('base64url');
   return {token:payload+'.'+sign(payload),questionIds};
  }
  let mine=null;
  if(method==='POST'){
   const [payload,sig]=String(body.token||'').split('.');
   const expected=sign(payload||'');
   if(!sig||sig.length!==expected.length||!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return {status:400,error:'Please start a new shift.'};
   let session;try{session=JSON.parse(Buffer.from(payload,'base64url'));}catch{return {status:400,error:'Invalid shift.'};}
   const elapsed=Date.now()-session.at;
   if(session.version!==GAME_VERSION||session.mode!==mode||elapsed<15000||elapsed>1800000)return {status:400,error:'This shift has expired. Please play again.'};
   if(!Array.isArray(body.answers)||body.answers.length!==rounds.length||body.answers.some(a=>!Array.isArray(a)||a.length>20))return {status:400,error:'Incomplete shift.'};
   let assigned;try{assigned=questionsForIds(session.questionIds);}catch{return {status:400,error:'Please start a new shift.'};}
   const name=normalizeNickname(body.name);
   mine={id:session.id,name,score:assigned.reduce((n,r,i)=>n+assessOrder(body.answers[i],r).score,0),total:15,ms:elapsed,mode};
   await store.add(mode,mine);
  }else if(method!=='GET')return {status:405,error:'Method not allowed.'};
  const entries=await store.list(mode);
  entries.sort((a,b)=>b.score-a.score||a.ms-b.ms||a.id.localeCompare(b.id));
  if(mine)mine=entries.find(e=>e.id===mine.id)||mine;
  const rank=mine?entries.findIndex(e=>e.id===mine.id)+1:null;
  return {entries:entries.slice(0,5),mine:mine?{...mine,rank}:null,total:entries.length,mode,local:!!store.local};
 };
}
export function redisStore(url,token){
 const command=async args=>{const r=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('Database unavailable');const d=await r.json();if(d.error)throw Error('Database unavailable');return d.result;};
 const key=mode=>`alt:showcase-15:${mode}`;
 // Copy compatible historical scores without replacing or deleting any records.
 const mergeScript=`for i=2,#KEYS do local rows=redis.call('HGETALL',KEYS[i]); for j=1,#rows,2 do redis.call('HSETNX',KEYS[1],rows[j],rows[j+1]); end; end; return redis.call('HVALS',KEYS[1]);`;
 return {async add(mode,row){await command(['HSETNX',key(mode),row.id,JSON.stringify(row)]);},async list(mode){return (await command(['EVAL',mergeScript,3,key(mode),`alt:rush-v2:${mode}`,`alt:rush-v3:${mode}`])||[]).map(x=>JSON.parse(x));}};
}
