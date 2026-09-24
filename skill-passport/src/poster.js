// Pure browser canvas export: no external fonts, services, or screenshot dependency.
export async function renderPoster({ profile, level, activities, now = new Date() }) {
  const canvas = document.createElement('canvas'); canvas.width = 1080;
  canvas.height = Math.max(1350, 610 + activities.length * 122 + 200);
  const ctx = canvas.getContext('2d'); const width = canvas.width; const height = canvas.height;
  ctx.fillStyle = '#f5f3e9'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#192f3b'; ctx.fillRect(0, 0, width, 395);
  ctx.strokeStyle = '#ffffff12'; ctx.lineWidth = 2;
  [170, 245, 320].forEach(radius => { ctx.beginPath(); ctx.arc(950, 80, radius, 0, Math.PI * 2); ctx.stroke(); });
  function text(value, x, y, size, color, weight = '400', family = 'Arial') { ctx.font = `${weight} ${size}px ${family}`; ctx.fillStyle = color; ctx.fillText(value, x, y); }
  function wrap(value, x, y, maxWidth, size, color, weight = '400') {
    ctx.font = `${weight} ${size}px Arial`; ctx.fillStyle = color;
    let line = ''; let offset = 0;
    for (const word of value.split(' ')) { const next = line ? `${line} ${word}` : word; if (ctx.measureText(next).width > maxWidth && line) { ctx.fillText(line, x, y + offset); line = word; offset += size * 1.3; } else line = next; }
    ctx.fillText(line, x, y + offset); return offset;
  }
  const brand = new Image(); brand.src = `${import.meta.env.BASE_URL}brand/alt-brand-board.png`; await brand.decode();
  ctx.drawImage(brand, 77, 633, 261, 101, 70, 40, 181, 70);
  text('MY DAILY SKILL PASSPORT', 70, 160, 19, '#c4cfcf');
  text('One shift. More possibility.', 70, 249, 52, '#fff', '400', 'Georgia');
  text(now.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), 70, 324, 21, '#efc476');
  ctx.fillStyle = '#dfe3cf'; ctx.beginPath(); ctx.arc(119, 476, 49, 0, Math.PI * 2); ctx.fill();
  if (profile.avatar) {
    const img = new Image(); img.src = profile.avatar;
    await img.decode(); ctx.save(); ctx.beginPath(); ctx.arc(119, 476, 49, 0, Math.PI * 2); ctx.clip();
    const side = Math.min(img.width, img.height); ctx.drawImage(img, (img.width-side)/2, (img.height-side)/2, side, side, 70, 427, 98, 98); ctx.restore();
  } else { text(profile.name.split(' ').filter(Boolean).slice(0,2).map(part => part[0]).join(''), 87, 490, 34, '#5e6b42', '600'); }
  let nameSize = 35; while (nameSize > 18 && (ctx.font = `600 ${nameSize}px Arial`, ctx.measureText(profile.name).width > 790)) nameSize--;
  text(profile.name, 193, 466, nameSize, '#20343d', '600'); text(level, 193, 509, 23, '#6c7850');
  text(`${activities.length} STEPS FORWARD TODAY`, 70, 600, 20, '#75805e', '600');
  activities.forEach((activity, index) => {
    const top = 635 + index * 122; ctx.fillStyle = '#e8eddb'; ctx.beginPath(); ctx.roundRect(70, top, 940, 105, 14); ctx.fill();
    text('✓', 94, top + 60, 31, '#697849', '600');
    text(`${activity.skillName} · ${activity.kind === 'review' ? 'Reviewed' : 'Completed'}`, 149, top + 32, 17, '#74805f');
    wrap(activity.title, 149, top + 69, 810, 26, '#293e35', '600');
  });
  ctx.strokeStyle = '#d5dacb'; ctx.beginPath(); ctx.moveTo(70,height-137); ctx.lineTo(1010,height-137); ctx.stroke();
  text('LEARN. PRACTISE. GROW.', 70, height-84, 21, '#77865b', '600');
  text('Self-recorded learning · Supervisor verification is separate.', 70, height-43, 17, '#7d8680');
  return new Promise((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image export failed')), 'image/png'));
}
