import React, { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './SkillPassport';
import { curriculum, moduleState, nextReviewDate, recordKey, taskState } from './learning';
import './learning.css';
import './badges.css';

const label = { pending: 'Keep learning', complete: 'Learning complete', review: 'Monthly review due' };
export default function SkillModule({ skill, index, records, onCompleteTask, now = new Date() }) {
  const badgeId = useId();
  const [open, setOpen] = useState(false);
  const tasks = curriculum[skill.id] || [];
  const state = moduleState(skill.id, records, now);
  const complete = tasks.filter(task => taskState(records[recordKey(skill.id, task.id)], now) === 'complete').length;
  const percentage = tasks.length ? Math.round(complete / tasks.length * 100) : 0;
  return <li className={`alt-module alt-module--${state}`}>
    <button type="button" className="alt-badge-button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${skill.name}, ${complete} of ${tasks.length} steps complete. ${label[state]}. Open tasks`}>
      <span className="alt-badge" style={{ '--badge-fill': `${percentage}%` }} aria-hidden="true"><svg className="alt-shield-art" viewBox="0 0 100 112" fill="none"><defs><clipPath id={`${badgeId}-clip`}><path d="M50 4C64 12 80 15 93 16V49C93 75 76 95 50 108C24 95 7 75 7 49V16C20 15 36 12 50 4Z"/></clipPath><linearGradient id={`${badgeId}-olive`} x1="0" y1="0" x2="0" y2="112" gradientUnits="userSpaceOnUse"><stop stopColor="#c8d5ac"/><stop offset="1" stopColor="#7e9554"/></linearGradient></defs><path d="M50 4C64 12 80 15 93 16V49C93 75 76 95 50 108C24 95 7 75 7 49V16C20 15 36 12 50 4Z" fill={state === 'review' ? '#f2d0c8' : '#faedda'}/><g clipPath={`url(#${badgeId}-clip)`}><rect x="0" y={112 * (1 - percentage / 100)} width="100" height={112 * percentage / 100} fill={state === 'review' ? '#cb8f80' : `url(#${badgeId}-olive)`}/></g><path d="M50 4C64 12 80 15 93 16V49C93 75 76 95 50 108C24 95 7 75 7 49V16C20 15 36 12 50 4Z" stroke={state === 'review' ? '#bb8177' : '#9ba878'} strokeWidth="1.5"/><path d="M50 12C62 18 73 21 85 23V49C85 70 72 88 50 100C28 88 15 70 15 49V23C27 21 38 18 50 12Z" stroke="#ffffff99" strokeWidth="1"/></svg><Icon name={skill.icon}/><span className="alt-badge__count">{complete}/{tasks.length}</span>{skill.status === 'Verified' && <span className="alt-badge__verified"><Icon name="check"/></span>}</span>
      <span className="alt-module__name">{skill.name}</span>
      <span className="alt-module__status">{state === 'review' ? 'Review due' : skill.status}</span>
      <span className="alt-badge__hint">{state === 'review' ? 'Refresh your knowledge' : percentage === 100 ? 'All steps complete' : `${percentage}% complete`}</span>
    </button>
    {open && <TaskDialog skill={skill} index={index} records={records} onCompleteTask={onCompleteTask} now={now} onClose={() => setOpen(false)}/>}
  </li>;
}

function TaskDialog({ skill, index, records, onCompleteTask, now, onClose }) {
  const ref = useRef(null);
  const id = useId();
  const tasks = curriculum[skill.id] || [];
  const state = moduleState(skill.id, records, now);
  const complete = tasks.filter(task => taskState(records[recordKey(skill.id, task.id)], now) === 'complete').length;
  useEffect(() => { const previous = document.activeElement; ref.current.showModal(); return () => previous?.focus?.(); }, []);
  const currentTask = tasks.find(task => taskState(records[recordKey(skill.id, task.id)], now) === 'review') || tasks.find(task => taskState(records[recordKey(skill.id, task.id)], now) === 'pending');
  const nextReview = tasks.map(task => { const record = records[recordKey(skill.id, task.id)]; return nextReviewDate(record?.reviewedAt || record?.completedAt); }).filter(Boolean).sort((a, b) => a - b)[0];
  function finish(skillId, taskId) {
    // Close the task sheet before the parent opens the achievement poster.
    if (complete === tasks.length - 1) onClose();
    onCompleteTask(skillId, taskId);
  }
  return <dialog ref={ref} className={`alt-task-dialog alt-task-dialog--compact alt-module--${state}`} aria-labelledby={id} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) onClose(); }}>
    <header className="alt-task-dialog__header"><div><span>SKILL {String(index+1).padStart(2,'0')} · {complete}/{tasks.length} STEPS</span><h2 id={id}>{skill.name}</h2></div><button type="button" className="app-icon-button" aria-label="Close skill tasks" onClick={onClose}>×</button></header>
      <div className="alt-module__content"><p className="alt-module__intro">{skill.detail}</p><div className="alt-task-overview"><span>YOUR LEARNING PATH</span><strong>{complete}/{tasks.length} complete</strong><div aria-label={`${complete} of ${tasks.length} steps complete`}>{tasks.map(task => <span key={task.id} className={`alt-task-segment alt-task-segment--${taskState(records[recordKey(skill.id, task.id)], now)}`} aria-label={`${task.title}: ${taskState(records[recordKey(skill.id, task.id)], now)}`}/>)}</div></div>
      <ol className="alt-tasks">{(currentTask ? [currentTask] : []).map(task => {
        const taskIndex = tasks.indexOf(task);
        const record = records[recordKey(skill.id, task.id)];
        const stepState = taskState(record, now);
        const due = nextReviewDate(record?.reviewedAt || record?.completedAt);
        return <li className={`alt-task alt-task--${stepState}`} key={task.id}><p className="alt-task-current-label">{stepState === 'review' ? 'CURRENT REVIEW' : 'CURRENT TASK'} · {taskIndex + 1} OF {tasks.length}</p><div className="alt-task__heading"><span className="alt-task__number">{stepState === 'complete' ? <Icon name="check"/> : String(taskIndex + 1).padStart(2, '0')}</span><h4 id={`${id}-${task.id}`}>{task.title}</h4><span>{task.duration}</span></div><p>{task.instruction}</p><div className="alt-task__evidence"><Icon name="spark"/><span>{task.evidence}</span></div><div className="alt-task__bottom"><span>{stepState === 'review' ? 'Monthly review due' : stepState === 'complete' ? `Review ${due.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` : 'To complete'}</span><button type="button" aria-describedby={`${id}-${task.id}`} disabled={stepState === 'complete' || !onCompleteTask} onClick={() => finish(skill.id, task.id)}>{stepState === 'complete' ? <><Icon name="check"/> Completed</> : stepState === 'review' ? 'Mark reviewed' : 'Mark complete'}</button></div></li>;
      })}</ol>{!currentTask && <div className="alt-task-finished"><Icon name="check"/><h3>All steps complete.</h3><p>{nextReview ? `Your next review is ${nextReview.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}.` : 'Your learning is up to date.'}</p><button type="button" className="app-secondary" onClick={onClose}>Back to passport</button></div>}<p className="alt-module__footnote">{currentTask ? 'Finish this step to continue your learning path.' : 'Learning completion is separate from supervisor verification.'}</p></div>

  </dialog>;
}
