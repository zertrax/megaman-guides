(() => {
  const locales = ['en','es-MX','pt-BR','ja','zh-Hans','fr','de','ru'];
  const locale = document.body.dataset.guideLocale || 'en';
  const route = document.body.dataset.guideRoute || '';
  const catalog = window.__GUIDE_UI__ || {};
  const messages = catalog[locale] || catalog.en || {};
  const t = (key, vars = {}) => String(messages[key] ?? catalog.en?.[key] ?? key)
    .replace(/\{([\w]+)\}/g, (match, name) => Object.hasOwn(vars,name) ? String(vars[name]) : match);
  window.guideI18n = Object.freeze({locale, t});
  const script = document.querySelector('script[data-locale-runtime]');
  const select = document.getElementById('guide-language');
  if (!script || !select || !locales.includes(locale)) return;
  // Shared scripts live at the site root, including when Pages adds a repository
  // prefix or the current document lives below a language/campaign directory.
  const root = new URL('./', script.src);
  const preferenceKey = 'field-guide:language:v1';
  function destination(next) {
    const url = new URL((next === 'en' ? '' : next + '/') + route,root);
    url.search = location.search;
    if (next === 'en') url.searchParams.set('lang','en');
    else url.searchParams.delete('lang');
    url.hash = location.hash;
    return url;
  }
  // Explicit localized links always win. ?lang=en is also used for original
  // English screenshots and deliberately does not change a saved preference.
  if (locale === 'en' && new URL(location.href).searchParams.get('lang') !== 'en') {
    let preferred;
    try { preferred = localStorage.getItem(preferenceKey); } catch {}
    if (preferred && preferred !== 'en' && locales.includes(preferred)) {
      location.replace(destination(preferred).href);
      return;
    }
  }
  select.addEventListener('change', () => {
    const next = select.value;
    if (!locales.includes(next)) return;
    try { localStorage.setItem(preferenceKey,next); } catch { /* A language can still be opened without storage. */ }
    if (next !== locale) {
      // The reading-position module saves its unchanged key on pagehide; this
      // hash is unchanged too, so the new static page resumes the same section.
      location.assign(destination(next).href);
    }
  });
  const english = document.querySelector('[data-english-source]');
  if (english) {
    const updateEnglish = () => { english.href = destination('en').href; };
    updateEnglish();
    english.addEventListener('click',updateEnglish);
  }
})();
