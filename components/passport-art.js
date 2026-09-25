export const dimensions = [
  { label: 'Guest service', score: 82 }, { label: 'Menu knowledge', score: 78 },
  { label: 'POS operation', score: 72 }, { label: 'Allergen handling', score: 38 },
  { label: 'Communication', score: 76 }, { label: 'Teamwork', score: 84 },
];
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function passportArt(name = 'Alex Chen', posStatus = 'Practising', axes = dimensions) {
  const cx=450, cy=628, radius=194;
  const point=(i,r)=>[cx+Math.sin(i*Math.PI/3)*r,cy-Math.cos(i*Math.PI/3)*r];
  const ring=r=>axes.map((_,i)=>point(i,r).join(',')).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1280" viewBox="0 0 900 1280"><rect width="900" height="1280" rx="34" fill="#faf8f1"/><rect width="900" height="325" rx="34" fill="#192f3b"/><rect y="275" width="900" height="50" fill="#192f3b"/><g font-family="Arial,sans-serif"><text x="58" y="89" fill="#fff" font-family="Georgia,serif" font-size="65">ALT</text><path d="M59 98Q87 72 119 91" fill="none" stroke="#c8aa71" stroke-width="5"/><text x="233" y="76" font-size="14" letter-spacing="4" fill="#c4d0cf">LEARNING, MADE VISIBLE.</text><text x="60" y="170" font-size="15" letter-spacing="4" fill="#d4bd89">SKILL PASSPORT / DEMO</text><text x="56" y="246" font-size="62" fill="#fff">${escape(name)}</text><text x="60" y="292" font-size="19" fill="#bccbcc">Hospitality · Shift 4 · ALT–0042</text><text x="60" y="380" font-size="23" fill="#243d49">Your skills, at a glance.</text><text x="60" y="410" font-size="15" fill="#79867d">Illustrative capability profile · scores out of 100</text>${[.25,.5,.75,1].map(f=>`<polygon points="${ring(radius*f)}" fill="none" stroke="#d8dbce" stroke-width="2"/>`).join('')}${axes.map((_,i)=>`<path d="M${cx} ${cy}L${point(i,radius).join(' ')}" stroke="#d8dbce"/>`).join('')}<polygon points="${axes.map((d,i)=>point(i,radius*d.score/100).join(',')).join(' ')}" fill="#819365" fill-opacity=".25" stroke="#7a8e5e" stroke-width="4"/>${axes.map((d,i)=>{const [x,y]=point(i,245);const [px,py]=point(i,radius*d.score/100);return `<circle cx="${px}" cy="${py}" r="5" fill="#7a8e5e"/><text x="${x}" y="${y}" text-anchor="middle" fill="#344a4b" font-size="17">${d.label}</text><text x="${x}" y="${y+25}" text-anchor="middle" fill="#a28752" font-size="18">${d.score}</text>`}).join('')}<path d="M60 924H840" stroke="#dddccc"/><text x="60" y="970" font-size="14" letter-spacing="3" fill="#9a8356">SKILL STATUS · DEMO RECORDS</text>${[['Guest interaction','Verified (demo)'],['Menu knowledge','Verified (demo)'],['POS Independent',posStatus],['Dietary & allergens','Needs support']].map((v,i)=>`<text x="60" y="${1017+i*38}" font-size="19" fill="#263e49">${escape(v[0])}</text><text x="840" y="${1017+i*38}" text-anchor="end" font-size="16" fill="#6d805a">${escape(v[1])}</text>`).join('')}<text x="60" y="1210" font-size="14" fill="#8b8e80">DEMO DATA · Not a qualification or verified assessment.</text><text x="60" y="1240" font-size="12" fill="#8b8e80">Shared by the learner · ALT — Align. Learn. Thrive.</text></g></svg>`;
}
export function svgUrl(svg) { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; }
export async function passportPNG(svg, analysed) {
  if (Array.isArray(svg)) svg = passportSVG(svg, analysed);
  const img = new Image(); img.src = svgUrl(svg); await img.decode();
  const canvas = document.createElement('canvas'); canvas.width=900;canvas.height=1280;
  const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(img,0,0);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed')),'image/png'));
}

// Shared exports for the Passport capability view and Profile share card.
export const demoAxes = dimensions;
export function radarPoints(axes) { return axes.map((a,i)=>{const angle=(-90+i*60)*Math.PI/180;return `${160+Math.cos(angle)*87*a.score/100},${132+Math.sin(angle)*87*a.score/100}`;}).join(' '); }
export function passportSVG(axes=dimensions, analysed=false) { return passportArt('Alex Chen',analysed?'Ready for verification':'Practising', axes); }
export function downloadBlob(blob) { const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Alex-Chen-ALT-Skill-Passport.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000); }
