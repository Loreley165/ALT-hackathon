export const GAME_VERSION='rush-v2';
const choices=(group,items)=>items.map(([id,label])=>({id,label,group}));
export const rounds = [
 {name:'The first table',hint:'Four details. One correction.',pickSeconds:14,correct:['beef','onion','water','takeaway'],choices:[...choices('Main',[['beef','Beef burger'],['chicken','Chicken burger'],['wrap','Veggie wrap']]),...choices('Request',[['onion','No onion'],['cheese','No cheese'],['sauce','Sauce on the side']]),...choices('Drink',[['water','Sparkling water'],['cola','Cola'],['still','Still water']]),...choices('Service',[['takeaway','Takeaway'],['here','Eat in'],['later','Collect later']])],phrases:[{text:'A chicken burger to eat in, please.',ms:1900},{text:'Actually, beef. No onion.',ms:1500},{text:'Sparkling water. Make it takeaway.',ms:1800}]},
 {name:'A change of mind',hint:'Five details. Keep the final version.',pickSeconds:17,correct:['small','oat','iced','decaf','one'],choices:[...choices('Size',[['small','Small'],['medium','Medium'],['large','Large']]),...choices('Milk',[['oat','Oat milk'],['dairy','Dairy milk'],['almond','Almond milk']]),...choices('Temperature',[['iced','Iced'],['hot','Hot'],['warm','Warm']]),...choices('Coffee',[['decaf','Decaf'],['regular','Regular'],['extra','Extra shot']]),...choices('Sugar',[['none','No sugar'],['one','One sugar'],['two','Two sugars']])],phrases:[{text:'Large hot flat white, almond milk.',ms:1800},{text:'Decaf, with two sugars.',ms:1400},{text:'No—small and iced. Oat milk instead.',ms:1900},{text:'Just one sugar. Keep it decaf.',ms:1600}]},
 {name:'The lunch rush',hint:'Six details. Two guests. A late swap.',pickSeconds:20,correct:['wrap','chips','tomato','sparkling','chicken','side'],choices:[...choices('Your main',[['wrap','Veggie wrap'],['burger','Veggie burger'],['beef','Beef burger']]),...choices('Your side',[['chips','Chips'],['salad','Salad'],['none','No side']]),...choices('Request',[['tomato','No tomato'],['onion','No onion'],['cheese','No cheese']]),...choices('Your drink',[['sparkling','Sparkling water'],['cola','Cola'],['still','Still water']]),...choices('Friend’s main',[['chicken','Chicken burger'],['wrap2','Veggie wrap'],['beef2','Beef burger']]),...choices('Friend’s sauce',[['side','On the side'],['inside','In the burger'],['no','No sauce']])],phrases:[{text:'Veggie wrap, chips, no tomato. A cola.',ms:2000},{text:'My friend: beef burger, sauce on the side.',ms:2000},{text:'Change mine to sparkling water.',ms:1500},{text:'And theirs to chicken. Keep that sauce separate.',ms:2100}]}
];
export const order=rounds[0];
export function assessOrder(selected, currentOrder=order) {
 const ids=[...new Set(selected)].filter(id=>currentOrder.choices.some(c=>c.id===id));
 const groups=[...new Set(currentOrder.choices.map(c=>c.group))];
 const details=groups.map(group=>{const expected=currentOrder.choices.find(c=>c.group===group&&currentOrder.correct.includes(c.id));const picked=currentOrder.choices.filter(c=>c.group===group&&ids.includes(c.id));return {group,expected:expected.label,correct:picked.length===1&&picked[0].id===expected.id,picked:picked.map(c=>c.label)};});
 const score=details.filter(d=>d.correct).length,total=details.length;
 const missed=details.filter(d=>!d.correct);
 const reflection=score===total?'In a simulated order-taking task, I correctly remembered all order details.':`In a simulated order-taking task, I correctly recalled ${score} of ${total} order details. I need more practice with ${missed.map(d=>d.group==='Request'?'special requests':d.group.toLowerCase()).join(' and ')}.`;
 const mission=score===total?'Practise confirming a two-person order with a supervisor.':missed.some(d=>d.group==='Request')?'Practise repeating a guest’s special request before confirming the order.':'Practise repeating the full order before sending it to the kitchen.';
 return {score,total,details,reflection,mission,focus:score===total?'Build on a clear start':missed.some(d=>d.group==='Request')?'Confirm special requests':'Confirm the complete order'};
}
export function assessSession(results){
 const details=results.flatMap((r,i)=>r.details.map(d=>({...d,round:i+1})));
 const score=details.filter(d=>d.correct).length,total=details.length;
 const missed=details.filter(d=>!d.correct);
 const requestMiss=missed.some(d=>d.group==='Request');
 const revisionMiss=details.some(d=>d.round>1&&!d.correct);
 const perfect=total>0&&score===total;
 const focus=perfect?'Ready for a new challenge':requestMiss?'Keep special requests in focus':revisionMiss?'Catch the final change':'Confirm the complete order';
 const mission=perfect?'Practise confirming a two-person order with a supervisor.':requestMiss?'Repeat each special request back before confirming an order.':revisionMiss?'Practise confirming the final order after a guest changes their mind.':'Repeat the complete order back before sending it to the kitchen.';
 const reflection=`I completed ${results.length} simulated restaurant order challenges and recalled ${score} of ${total} details correctly. ${perfect?'I kept track of special requests and last-minute changes.':requestMiss?'I need to practise confirming special requests.':revisionMiss?'I need to practise keeping track of last-minute changes.':'I need to practise confirming all parts of an order.'}`;
 return {score,total,details,rounds:results,reflection,mission,focus,requestCorrect:!requestMiss,perfect};
}
export function phraseAt(elapsed,currentOrder,speed=1){let boundary=0;for(let i=0;i<currentOrder.phrases.length;i++){boundary+=currentOrder.phrases[i].ms*speed;if(elapsed<boundary)return i;}return -1;}
