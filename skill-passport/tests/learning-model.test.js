import test from 'node:test';
import assert from 'node:assert/strict';
import { nextReviewDate, taskState, completeTask, todayActivities, seedRecords, moduleState } from '../src/learning.js';

test('calendar-month review clamps month-end and supports leap years', () => {
  const jan = new Date(2026, 0, 31, 12, 15);
  const due = nextReviewDate(jan.toISOString());
  assert.equal(due.getMonth(), 1); assert.equal(due.getDate(), 28); assert.equal(due.getHours(), 12);
  assert.equal(nextReviewDate(new Date(2028, 0, 31, 9).toISOString()).getDate(), 29);
  assert.equal(nextReviewDate(new Date(2026, 11, 31, 9).toISOString()).getFullYear(), 2027);
});
test('pending -> complete -> review due -> refreshed with new monthly cycle', () => {
  const start = new Date(2026, 0, 31, 12);
  let records = completeTask({}, 'pos', 'order', start);
  const record = records['pos/order'];
  assert.equal(taskState(undefined, start), 'pending');
  assert.equal(taskState(record, new Date(2026, 1, 28, 11, 59)), 'complete');
  assert.equal(taskState(record, new Date(2026, 1, 28, 12)), 'review');
  records = completeTask(records, 'pos', 'order', new Date(2026, 1, 28, 12));
  assert.equal(records['pos/order'].completedAt, start.toISOString());
  assert.equal(taskState(records['pos/order'], new Date(2026, 2, 27)), 'complete');
  assert.equal(taskState(records['pos/order'], new Date(2026, 2, 28, 12)), 'review');
  assert.equal(completeTask(records, 'pos', 'order', new Date(2026, 2, 1)), records);
});
test('today means local day, not all past achievements', () => {
  const now = new Date(2026, 8, 24, 14);
  const rows = [{ title:'old', at:new Date(2026,8,23,23,59).toISOString() }, { title:'today', at:new Date(2026,8,24,0,1).toISOString() }];
  assert.deepEqual(todayActivities(rows, now).map(row => row.title), ['today']);
});
test('module review takes priority over incomplete work; original scenarios preserved', () => {
  const now = new Date(2026, 8, 24, 14);
  assert.equal(moduleState('pos', seedRecords('updated',now),now), 'complete');
  assert.equal(moduleState('pos', seedRecords('current',now),now), 'pending');
  assert.equal(moduleState('dietary', { 'dietary/ask':{ completedAt:new Date(2026,5,1).toISOString() } }, now), 'review');
  assert.equal(taskState({ completedAt:'bad-date' }, now), 'pending');
});
