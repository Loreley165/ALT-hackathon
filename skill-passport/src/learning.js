export const curriculum = {
  guest: [
    { id: 'welcome', title: 'Welcome & connect', duration: '3 min', instruction: 'Practise greeting a guest, making eye contact and asking how you can help. Adapt your approach to their needs.', evidence: 'Role-play a warm welcome with a teammate.' },
    { id: 'listen', title: 'Listen & confirm', duration: '4 min', instruction: 'Listen without interrupting, ask a clear follow-up question and repeat the request back before acting.', evidence: 'Confirm a guest request accurately in a role-play.' },
    { id: 'resolve', title: 'Respond with care', duration: '5 min', instruction: 'Acknowledge a concern calmly. Explain the next step and involve your supervisor when you cannot resolve it yourself.', evidence: 'Practise handling a concern with your supervisor.' },
  ],
  menu: [
    { id: 'explore', title: 'Explore the menu', duration: '5 min', instruction: 'Read the current venue menu. Find the main categories, prices and options, and note any questions for the team.', evidence: 'Locate three dishes and describe them clearly.' },
    { id: 'recommend', title: 'Make a recommendation', duration: '4 min', instruction: 'Ask about a guest’s preferences, then practise describing a suitable option using the venue’s current information.', evidence: 'Give a teammate two thoughtful menu suggestions.' },
    { id: 'changes', title: 'Check today’s changes', duration: '3 min', instruction: 'Check specials, unavailable items and menu updates with the shift lead before making recommendations.', evidence: 'Explain today’s changes back to the shift lead.' },
  ],
  pos: [
    { id: 'order', title: 'Build an accurate order', duration: '5 min', instruction: 'In the venue’s training mode, enter a practice order, add modifiers and check the table or order number. Confirm the order before sending.', evidence: 'Complete a practice order with no missing items.' },
    { id: 'payment', title: 'Practise a payment', duration: '5 min', instruction: 'Use a training transaction to practise selecting the payment method and checking the total. Follow your venue’s payment procedures.', evidence: 'Walk through a practice payment with a teammate.' },
    { id: 'handover', title: 'Finish & hand over', duration: '4 min', instruction: 'Check the receipt and explain the handover. Ask your supervisor how to handle corrections, voids or refunds at your venue.', evidence: 'Demonstrate the full workflow in training mode.' },
  ],
  dietary: [
    { id: 'ask', title: 'Ask & record carefully', duration: '4 min', instruction: 'Practise asking a guest about their dietary request and recording their exact words using your venue’s process.', evidence: 'Role-play recording and repeating back a dietary request.' },
    { id: 'check', title: 'Check with the right person', duration: '5 min', instruction: 'Locate your venue’s current allergen information and identify the supervisor or kitchen contact responsible for confirming a request. Never guess or promise a dish is safe.', evidence: 'Show where to find current information and who to ask.' },
    { id: 'communicate', title: 'Communicate & confirm', duration: '5 min', instruction: 'Practise passing the recorded request to the responsible team member and communicating their confirmed response to the guest. Follow venue policy when a request cannot be accommodated.', evidence: 'Complete a supervised role-play from request to handover.' },
  ],
};

export const recordKey = (skillId, taskId) => `${skillId}/${taskId}`;
export function nextReviewDate(iso) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date;
}
export function taskState(record, now = new Date()) {
  if (!record?.completedAt) return 'pending';
  const review = nextReviewDate(record.reviewedAt || record.completedAt);
  if (!review) return 'pending';
  return now >= review ? 'review' : 'complete';
}
export function moduleState(skillId, records, now = new Date()) {
  const states = (curriculum[skillId] || []).map(task => taskState(records[recordKey(skillId, task.id)], now));
  return states.includes('review') ? 'review' : states.length && states.every(state => state === 'complete') ? 'complete' : 'pending';
}
export const sameLocalDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
export const todayActivities = (activities, now = new Date()) => activities.filter(activity => sameLocalDay(activity.at, now));
export function seedRecords(version, now = new Date()) {
  const past = new Date(now); past.setDate(past.getDate() - 2);
  const records = {};
  Object.entries(curriculum).forEach(([skillId, tasks]) => tasks.forEach((task, index) => {
    if (skillId === 'guest' || skillId === 'menu' || (skillId === 'pos' && (version === 'updated' || index === 0)) || (skillId === 'dietary' && version === 'updated' && index === 0)) {
      records[recordKey(skillId, task.id)] = { completedAt: past.toISOString() };
    }
  }));
  return records;
}
export function completeTask(records, skillId, taskId, now = new Date()) {
  const key = recordKey(skillId, taskId);
  const previous = records[key];
  if (taskState(previous, now) === 'complete') return records;
  return { ...records, [key]: previous?.completedAt ? { ...previous, reviewedAt: now.toISOString() } : { completedAt: now.toISOString() } };
}
export function levelFor(verified) { return verified >= 4 ? 'Level 3 · Service Achiever' : verified >= 2 ? 'Level 2 · Service Explorer' : 'Level 1 · Service Starter'; }
export function createStore() {
  return { schema: 1, profile: { name: 'Alex Morgan', avatar: '' }, version: 'updated', scenarios: { current: { records: seedRecords('current'), activities: [], requested: [] }, updated: { records: seedRecords('updated'), activities: [], requested: [] } } };
}
export const STORAGE_KEY = 'alt-learning-passport-v1';
export function readStore() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (value?.schema === 1 && typeof value.profile?.name === 'string' && value.profile.name.trim() && ['updated', 'current'].includes(value.version)
      && ['current', 'updated'].every(key => value.scenarios?.[key]?.records && Array.isArray(value.scenarios[key].activities) && value.scenarios[key].activities.every(a => typeof a.title === 'string' && typeof a.skillName === 'string' && Number.isFinite(Date.parse(a.at))) && Array.isArray(value.scenarios[key].requested))) {
      return { ...value, profile: { name: value.profile.name.slice(0, 48), avatar: typeof value.profile.avatar === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(value.profile.avatar) ? value.profile.avatar : '' } };
    }
  } catch { /* Start with a safe demo when storage is unavailable or corrupt. */ }
  return createStore();
}
