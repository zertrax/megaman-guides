(() => {
  const guideId = document.body.dataset.guideId;
  if (!guideId) return;
  const prefix = 'field-guide:', suffix = ':completion:v1', memory = new Map();
  const stageButtons = [...document.querySelectorAll('[data-stage-complete]')];
  const gameButtons = [...document.querySelectorAll('[data-game-complete]')];
  const key = id => prefix + id + suffix;
  const normalize = value => ({ completed: value?.completed === true,
    stages: [...new Set(Array.isArray(value?.stages) ? value.stages.filter(id => typeof id === 'string').slice(0, 200) : [])] });
  const read = id => {
    if (memory.has(id)) return memory.get(id);
    try { return normalize(JSON.parse(localStorage.getItem(key(id)))); }
    catch { return normalize(null); }
  };
  const save = (id, value) => {
    try { localStorage.setItem(key(id), JSON.stringify(value)); memory.delete(id); }
    catch {
      memory.set(id, value);
      const error = document.querySelector('.progress-save-error');
      error.hidden = false;
      error.textContent = 'This browser could not save your completion marks. They will reset when this page closes.';
    }
  };
  function updateButton(button, complete) {
    button.setAttribute('aria-pressed', String(complete));
    const label = `Mark ${button.dataset.completionName} ${complete ? 'incomplete' : 'complete'}`;
    button.setAttribute('aria-label', label);
    button.title = label;
    const text = button.querySelector('[data-completion-label]');
    if (text) text.textContent = complete ? 'Game completed' : 'Mark game complete';
    button.hidden = false;
  }
  function sync() {
    const records = new Map(gameButtons.map(b => [b.dataset.gameComplete, read(b.dataset.gameComplete)]));
    for (const button of gameButtons) {
      const complete = records.get(button.dataset.gameComplete).completed;
      updateButton(button, complete);
      const card = button.closest('.game-entry');
      if (card) { card.classList.toggle('is-complete', complete); card.querySelector('.completion-stamp').hidden = !complete; }
    }
    if (stageButtons.length) {
      const state = records.get(guideId) || read(guideId);
      for (const button of stageButtons) updateButton(button, state.stages.includes(button.dataset.stageComplete));
      for (const element of document.querySelectorAll('[data-stage-id]')) {
        const complete = state.stages.includes(element.dataset.stageId);
        element.classList.toggle('is-complete', complete);
        const stamp = element.querySelector('.completion-stamp');
        if (stamp) stamp.hidden = !complete;
      }
      const cleared = stageButtons.filter(b => state.stages.includes(b.dataset.stageComplete)).length;
      const tally = document.querySelector('[data-stage-tally]');
      if (tally) tally.textContent = tally.textContent.replace(/^\d+/, String(cleared));
    }
    for (const element of document.querySelectorAll('[data-game-tally]')) {
      const entries = [...element.closest('[data-progress-group]')?.querySelectorAll('.game-entry') || document.querySelectorAll('.game-entry')];
      const cleared = entries.filter(e => records.get(e.dataset.gameId)?.completed).length;
      element.textContent = `${cleared} / ${entries.length} completed`;
    }
    for (const element of document.querySelectorAll('.guide-progress, .library-progress')) element.hidden = false;
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
    document.querySelector('.progress-announcement').textContent = `${button.dataset.completionName} marked ${complete ? 'complete' : 'incomplete'}.`;
  });
  window.addEventListener('storage', event => { if (event.key === null || event.key.startsWith(prefix) && event.key.endsWith(suffix)) sync(); });
  window.addEventListener('pageshow', sync);
  sync();
})();
