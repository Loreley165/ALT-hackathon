import {createLeaderboard,redisStore} from '../server/leaderboard.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 const secret=process.env.LEADERBOARD_SECRET||token;
 if(!url||!token||!secret)return res.status(503).json({error:'The shared leaderboard is not connected yet. You can still continue to the ALT demo.'});
 try{
  if(req.method==='POST'&&req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Invalid origin.'});
  if(Number(req.headers['content-length']||0)>8192)return res.status(413).json({error:'Request too large.'});
  const data=await createLeaderboard(redisStore(url,token),secret)(req.method,req.body,req.query);
  res.status(data.status||200).json(data);
 }catch{res.status(503).json({error:'Leaderboard unavailable. Please retry in a moment.'});}
}
