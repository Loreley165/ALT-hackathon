(() => {
  const frame = document.querySelector('#story-frame');
  if (!frame) return;

  const scenes = {
    'zh-TW': [
      ['01 · 第二天上班', 'Mira 的第二天，尖峰時段開始。', 'Ryan 請她操作 POS，卻忘了她才剛加入團隊。', 'RYAN · 經理', '「Mira，這桌請你幫忙點餐。」', 'Mira · 到職第 2 天'],
      ['02 · 漏掉的細節', '顧客提到堅果過敏。', 'Mira 還不知道如何在 POS 出餐單加上飲食禁忌備註。', 'GUEST · 顧客', '「我對堅果過敏。」', '出餐單尚未加入飲食備註'],
      ['03 · 看見帶教需要', '這是一個可以練習的時刻。', 'ALT 將飲食備註列為待練習項目，讓 Ryan 看見 Mira 接下來需要的協助。', 'ALT · SKILL PASSPORT', 'POS 飲食備註', '需要主管陪同練習'],
      ['04 · 經理的手機', 'Ryan 看見 Mira 的學習進度。', '主管概念畫面整理已完成項目，以及仍需要觀察與帶教的技能。', 'ALT · MANAGER VIEW', 'Mira 的學習進度', '概念畫面 · 主管檢視'],
      ['05 · 新員工的手機', 'Mira 清楚知道下一班要練什麼。', '員工概念畫面列出待完成任務：新增飲食備註，並請主管確認出餐單。', 'ALT · MY NEXT SHIFT', '加入 POS 飲食備註', '概念畫面 · 尚待練習'],
      ['06 · 一起看見下一步', '一次遺漏，成為下一次練習。', 'ALT 讓員工知道如何準備，也讓主管知道如何帶教；正式技能確認仍由主管負責。', 'ALIGN · LEARN · THRIVE', '讓每一班，都成為進步的一步。', '員工與主管，一起前進']
    ],
    'zh-CN': [
      ['01 · 第二天上班', 'Mira 的第二天，忙碌时段开始。', 'Ryan 请她操作 POS，却忘了她才刚加入团队。', 'RYAN · 经理', '「Mira，这桌请你帮忙点餐。」', 'Mira · 入职第 2 天'],
      ['02 · 漏掉的细节', '顾客提到坚果过敏。', 'Mira 还不知道如何在 POS 出餐单加上饮食禁忌备注。', 'GUEST · 顾客', '「我对坚果过敏。」', '出餐单尚未加入饮食备注'],
      ['03 · 看见带教需要', '这是一个可以练习的时刻。', 'ALT 将饮食备注列为待练习项目，让 Ryan 看见 Mira 接下来需要的协助。', 'ALT · SKILL PASSPORT', 'POS 饮食备注', '需要主管陪同练习'],
      ['04 · 经理的手机', 'Ryan 看见 Mira 的学习进度。', '主管概念画面整理已完成项目，以及仍需要观察与带教的技能。', 'ALT · MANAGER VIEW', 'Mira 的学习进度', '概念画面 · 主管查看'],
      ['05 · 新员工的手机', 'Mira 清楚知道下一班要练什么。', '员工概念画面列出待完成任务：添加饮食备注，并请主管确认出餐单。', 'ALT · MY NEXT SHIFT', '添加 POS 饮食备注', '概念画面 · 尚待练习'],
      ['06 · 一起看见下一步', '一次遗漏，成为下一次练习。', 'ALT 让员工知道如何准备，也让主管知道如何带教；正式技能确认仍由主管负责。', 'ALIGN · LEARN · THRIVE', '让每一班，都成为进步的一步。', '员工与主管，一起前进']
    ],
    en: [
      ['01 · DAY TWO', 'Mira is on her second shift.', 'Ryan asks her to take an order, forgetting she is still new to the team.', 'RYAN · MANAGER', '“Mira, can you take this table?”', 'Mira · New hire · Day 2'],
      ['02 · A MISSED DETAIL', 'A guest mentions a nut allergy.', 'Mira does not yet know how to add dietary notes to the POS ticket.', 'GUEST', '“I have a nut allergy.”', 'Dietary note not added to the ticket'],
      ['03 · A COACHING MOMENT', 'A missed detail becomes a chance to learn.', 'ALT surfaces dietary notes as a practice area, so Ryan can see what support Mira needs next.', 'ALT · SKILL PASSPORT', 'POS dietary notes', 'Practise with a supervisor'],
      ['04 · THE MANAGER VIEW', 'Ryan sees Mira’s learning progress.', 'A concept view brings completed steps and skills needing coaching into focus.', 'ALT · MANAGER VIEW', 'Mira’s learning progress', 'Concept screen · supervisor view'],
      ['05 · THE EMPLOYEE VIEW', 'Mira knows what to practise next shift.', 'Her concept view lists the open steps: add a dietary note and ask Ryan to check the ticket.', 'ALT · MY NEXT SHIFT', 'Add a dietary note in POS', 'Concept screen · still to practise'],
      ['06 · THE NEXT STEP, TOGETHER', 'One missed detail becomes the next practice.', 'ALT helps Mira prepare and Ryan coach. The supervisor still verifies the skill.', 'ALIGN · LEARN · THRIVE', 'Make every shift a step forward.', 'Employee and supervisor, moving together']
    ]
  };

  const lengths = [5000, 5000, 5000, 5000, 5000, 5000];
  const duration = lengths.reduce((sum, value) => sum + value, 0);
  const playButton = document.querySelector('#intro-play');
  const playLabel = playButton.querySelector('span');
  const progress = document.querySelector('#intro-progress');
  const time = document.querySelector('#intro-time');
  const focus = document.querySelector('#story-focus');
  const devices = document.querySelector('#story-devices');
  const endmark = document.querySelector('#story-endmark');
  const languagePicker = document.querySelector('#language-select');
  const caption = document.querySelector('#story-caption');
  const title = document.querySelector('#story-title');
  const step = document.querySelector('#story-step');
  const stageLabel = document.querySelector('#story-scene-label');
  const focusLabel = focus.querySelector('small');
  const focusText = focus.querySelector('strong');
  const focusAlert = focus.querySelector('.focus-alert');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let locale = languagePicker?.value || 'zh-TW';
  let elapsed = 0;
  let startedAt = 0;
  let playing = false;
  let raf = 0;
  let lastScene = -1;

  function copy() { return scenes[locale] || scenes['zh-TW']; }
  function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    return `0:${String(seconds).padStart(2, '0')}`;
  }
  function controlText() {
    const words = locale === 'en'
      ? (playing ? ['Pause intro', 'Pause the introduction video'] : [elapsed >= duration ? 'Replay 30-second intro' : 'Play 30-second intro', elapsed >= duration ? 'Replay the introduction video' : 'Play the introduction video'])
      : locale === 'zh-CN'
        ? (playing ? ['暂停介绍', '暂停介绍短片'] : [elapsed >= duration ? '重新播放 30 秒介绍' : '播放 30 秒介绍', elapsed >= duration ? '重新播放介绍短片' : '播放介绍短片'])
        : (playing ? ['暫停介紹', '暫停介紹短片'] : [elapsed >= duration ? '重新播放 30 秒介紹' : '播放 30 秒介紹', elapsed >= duration ? '重新播放介紹短片' : '播放介紹短片']);
    playLabel.textContent = words[0];
    playButton.setAttribute('aria-label', words[1]);
    playButton.firstChild.textContent = playing ? 'Ⅱ ' : '▶ ';
  }
  function render(nextElapsed) {
    elapsed = Math.max(0, Math.min(duration, nextElapsed));
    const data = copy();
    let accumulated = 0;
    let sceneIndex = lengths.length - 1;
    for (let i = 0; i < lengths.length; i++) {
      if (elapsed < accumulated + lengths[i] || (elapsed === duration && i === lengths.length - 1)) { sceneIndex = i; break; }
      accumulated += lengths[i];
    }
    if (sceneIndex !== lastScene) {
      lastScene = sceneIndex;
      const scene = data[sceneIndex];
      frame.dataset.scene = String(sceneIndex);
      stageLabel.textContent = scene[0];
      step.textContent = scene[0];
      title.textContent = scene[1];
      caption.textContent = scene[2];
      focusLabel.textContent = scene[3];
      focusText.textContent = scene[4];
      focusAlert.textContent = scene[5];
      endmark.querySelector('b').textContent = scene[4];
      endmark.querySelector('small').textContent = scene[5];
      focus.hidden = sceneIndex >= 3;
      devices.hidden = sceneIndex < 3 || sceneIndex > 4;
      endmark.hidden = sceneIndex !== 5;
      const managerPhone = devices.querySelector('.manager-phone');
      const employeePhone = devices.querySelector('.employee-phone');
      managerPhone.hidden = sceneIndex === 4;
      employeePhone.hidden = sceneIndex === 3;
    }
    progress.style.width = `${(elapsed / duration) * 100}%`;
    time.textContent = `${formatTime(elapsed)} / 0:30`;
    controlText();
  }
  function stopAtEnd() {
    playing = false;
    cancelAnimationFrame(raf);
    render(duration);
  }
  function tick(now) {
    if (!playing) return;
    render(now - startedAt);
    if (elapsed >= duration) return stopAtEnd();
    raf = requestAnimationFrame(tick);
  }
  playButton.addEventListener('click', () => {
    if (playing) {
      playing = false;
      elapsed = performance.now() - startedAt;
      cancelAnimationFrame(raf);
      render(elapsed);
      return;
    }
    if (elapsed >= duration) elapsed = 0;
    playing = true;
    startedAt = performance.now() - elapsed;
    if (!reducedMotion.matches) frame.classList.add('is-playing');
    raf = requestAnimationFrame(tick);
    controlText();
  });
  languagePicker?.addEventListener('change', () => {
    locale = languagePicker.value;
    lastScene = -1;
    render(elapsed);
  });
  render(0);
})();
