(() => {
  const guideId = document.body.dataset.guideId;
  if (!guideId) return;
  const t = (key, vars) => window.guideI18n.t(key, vars);
  const kind = guideId.startsWith('bn') ? 'chapter' : /^(zero|zx)/.test(guideId) ? 'mission' : 'stage';
  const prefix = 'field-guide:', suffix = ':completion:v1', memory = new Map();
  const stageButtons = [...document.querySelectorAll('[data-stage-complete]')];
  const gameButtons = [...document.querySelectorAll('[data-game-complete]')];
  const displayName = button => button.dataset.stageComplete
    ? document.getElementById(button.dataset.stageComplete)?.querySelector('h2')?.textContent.trim() || button.dataset.completionName
    : button.dataset.completionName;
  const stageNames = new Map(stageButtons.map(b => [b.dataset.stageComplete, displayName(b)]));
  const stageLinks = [...document.querySelectorAll('.sidebar a, .compact-menu nav a')]
    .filter(a => stageNames.has(a.getAttribute('href')?.slice(1)))
    .map(link => ({link, label: link.getAttribute('aria-label'), name: stageNames.get(link.getAttribute('href').slice(1))}));
  const key = id => prefix + id + suffix;
  const normalize = value => ({ completed: value?.completed === true,
    stages: [...new Set(Array.isArray(value?.stages) ? value.stages.filter(id => typeof id === 'string').slice(0, 200) : [])] });
  const read = id => {
    if (memory.has(id)) return memory.get(id);
    try { return normalize(JSON.parse(localStorage.getItem(key(id)))); }
    catch { return normalize(null); }
  };
  const save = (id, value) => {
    try {
      localStorage.setItem(key(id), JSON.stringify(value));
      memory.delete(id);
      if (!memory.size) document.querySelector('.progress-save-error').hidden = true;
    }
    catch {
      memory.set(id, value);
      const error = document.querySelector('.progress-save-error');
      error.hidden = false;
      error.textContent = t('saveError');
    }
  };
  function updateButton(button, complete) {
    button.setAttribute('aria-pressed', String(complete));
    const label = t('completedName', {name: displayName(button)});
    button.setAttribute('aria-label', label);
    button.title = label;
    const text = button.querySelector('[data-completion-label]');
    if (text) text.textContent = t('completed');
    button.hidden = false;
  }
  function sync() {
    const records = new Map(gameButtons.map(b => [b.dataset.gameComplete, read(b.dataset.gameComplete)]));
    for (const button of gameButtons) {
      const complete = records.get(button.dataset.gameComplete).completed;
      updateButton(button, complete);
      const card = button.closest('.game-entry');
      if (card) card.classList.toggle('is-complete', complete);
      const cover = button.closest('.game-cover');
      if (cover) cover.classList.toggle('is-complete', complete);
      const portrait = card?.querySelector('.game-card') || cover?.querySelector('.cover-link');
      if (portrait) {
        let stamp = portrait.querySelector('.game-clear-stamp');
        if (!stamp) {
          stamp = document.createElement('span');
          stamp.className = 'game-clear-stamp';
          stamp.setAttribute('aria-hidden', 'true');
          portrait.append(stamp);
        }
        stamp.textContent = '✓ ' + t('completed');
        stamp.hidden = !complete;
      }
    }
    if (stageButtons.length) {
      const state = records.get(guideId) || read(guideId);
      for (const button of stageButtons) updateButton(button, state.stages.includes(button.dataset.stageComplete));
      for (const {link, label, name} of stageLinks) {
        const complete = state.stages.includes(link.getAttribute('href').slice(1));
        link.classList.toggle('stage-cleared', complete);
        if (complete) link.setAttribute('aria-label', t('clearedName', {name:label || name}));
        else if (label !== null) link.setAttribute('aria-label', label);
        else link.removeAttribute('aria-label');
      }
      for (const element of document.querySelectorAll('[data-stage-id]')) {
        const complete = state.stages.includes(element.dataset.stageId);
        element.classList.toggle('is-complete', complete);
        const stamp = element.querySelector('.completion-stamp');
        if (stamp) stamp.hidden = !complete;
      }
      const cleared = stageButtons.filter(b => state.stages.includes(b.dataset.stageComplete)).length;
      const tally = document.querySelector('[data-stage-tally]');
      if (tally) {
        tally.textContent = t(kind + 'Tally', {count:cleared,total:stageButtons.length});
        const hint = tally.parentElement.querySelector('small');
        if (hint) hint.textContent = t(kind === 'stage' ? 'guideProgressInstructions' : kind + 'ProgressInstructions');
      }
    }
    for (const element of document.querySelectorAll('[data-game-tally]')) {
      const entries = [...element.closest('[data-progress-group]')?.querySelectorAll('.game-entry') || document.querySelectorAll('.game-entry')];
      const cleared = entries.filter(e => records.get(e.dataset.gameId)?.completed).length;
      element.textContent = t('gameTally', {count:cleared,total:entries.length});
    }
    for (const element of document.querySelectorAll('.guide-progress, .library-progress, .flow-progress')) element.hidden = false;
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-game-complete], [data-stage-complete]');
    if (!button) return;
    const id = button.dataset.gameComplete || guideId;
    const state = read(id), stage = button.dataset.stageComplete;
    let complete;
    if (stage) {
      complete = !state.stages.includes(stage);
      state.stages = complete ? [...state.stages, stage] : state.stages.filter(s => s !== stage);
    } else { complete = state.completed = !state.completed; }
    save(id, state); sync();
    document.querySelector('.progress-announcement').textContent = t(complete ? 'markedComplete' : 'markedIncomplete', {name:displayName(button)});
  });
  window.addEventListener('storage', event => { if (event.key === null || event.key.startsWith(prefix) && event.key.endsWith(suffix)) sync(); });
  window.addEventListener('pageshow', sync);
  sync();
})();
