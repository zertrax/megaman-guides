(() => {
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const setCompact = value => {
    document.body.classList.toggle('compact', value);
    sidebarToggle.setAttribute('aria-pressed', String(value));
    sidebarToggle.textContent = window.guideI18n.t(value ? 'showSidebar' : 'hideSidebar');
  };
  try { setCompact(localStorage.getItem('field-guide-compact') === 'true'); } catch {}
  sidebarToggle.addEventListener('click', () => {
    const value = !document.body.classList.contains('compact');
    setCompact(value);
    try { localStorage.setItem('field-guide-compact', String(value)); } catch {}
  });
  const menu = document.querySelector('.compact-menu');
  menu.addEventListener('click', event => { if (event.target.closest('a')) menu.open = false; });
  document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
  menu.addEventListener('keydown', event => { if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); } });
  const dialog = document.querySelector('#viewer');
  const close = document.querySelector('#close-viewer');
  // Both guide templates keep a visible close symbol and a plain spoken label.
  if (!close.querySelector('[aria-hidden="true"]')) {
    close.textContent = '';
    close.append(document.createTextNode(''));
    const symbol = document.createElement('span');
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = '×';
    close.append(symbol);
  }
  close.firstChild.textContent = window.guideI18n.t('close') + ' ';
  const header = document.querySelector('.top');
  const updateInset = () => document.documentElement.style.setProperty('--guide-header-offset', (header.getBoundingClientRect().height + 24) + 'px');
  updateInset();
  new ResizeObserver(updateInset).observe(header);
  let opener;
  document.addEventListener('click', event => {
    const shot = event.target.closest('[data-lightbox]');
    if (shot && typeof dialog.showModal === 'function' && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
      event.preventDefault();
      opener = shot;
      const image = document.querySelector('#viewer-image');
      image.src = shot.href;
      image.alt = shot.querySelector('img').alt;
      document.querySelector('#viewer-title').textContent = shot.dataset.title;
      dialog.showModal();
      document.body.classList.add('viewer-open');
      close.focus({preventScroll:true});
    }
    const video = event.target.closest('[data-video]');
    if (video) {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.dataset.video)}?start=${Number(video.dataset.start)||0}`;
      frame.title = video.dataset.title;
      frame.allow = 'encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      video.replaceWith(frame);
      frame.focus({preventScroll:true});
    }
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    close.focus();
  });
  let backdropPointer = false;
  dialog.addEventListener('pointerdown', event => { backdropPointer = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && backdropPointer) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    opener?.focus({preventScroll:true});
  });
  // Open a linked disclosure as well as any collapsed containers around it.
  const revealHash = (hash = location.hash) => {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let parent = target;
    while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
    requestAnimationFrame(() => target.scrollIntoView({block:'start', behavior:'instant'}));
  };
  window.addEventListener('hashchange', () => revealHash());
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) revealHash(link.hash);
  });
  revealHash();
})();
