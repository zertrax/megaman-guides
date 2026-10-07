const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const locales = Object.freeze(['en', 'es-MX', 'pt-BR', 'ja', 'zh-Hans', 'fr', 'de', 'ru']);
const names = Object.freeze({en:'English', 'es-MX':'Español (Latinoamérica)', 'pt-BR':'Português (Brasil)', ja:'日本語', 'zh-Hans':'简体中文', fr:'Français', de:'Deutsch', ru:'Русский'});
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const rawTags = new Set(['script','style','textarea']);
const skipTags = new Set(['script','style','pre','code','kbd','samp','noscript','svg']);
const inlineTags = new Set(['a','abbr','b','bdi','bdo','br','cite','code','del','em','i','img','kbd','mark','q','s','small','span','strong','sub','sup','time','u','wbr']);
const targetTags = new Set(['p','li','dt','dd','td','th','h1','h2','h3','h4','h5','h6','summary','button','title','label','figcaption','legend','option']);
const attrNames = new Set(['alt','title','aria-label','aria-description','data-title']);
const hash = source => createHash('sha256').update(source).digest('hex').slice(0, 16);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt);|&#(?:\d+|x[\da-f]+);/gi, entity => {
  const named = {'&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>'};
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const number = entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3,-1),16) : parseInt(entity.slice(2,-1),10);
  return number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff) ? String.fromCodePoint(number) : entity;
});
const meaningful = source => /\p{L}/u.test(decode(source.replace(/<[^>]*>/g,'')));

// A deliberately small parser for our generated, explicitly closed HTML. It retains
// byte offsets, so whole sentences can be replaced without serializing the DOM.
function parse(html) {
  const root = {tag:'#root', children:[], start:0, openEnd:0, closeStart:html.length, end:html.length};
  const stack = [root];
  let cursor = 0;
  const addText = end => {
    if (end > cursor) stack.at(-1).children.push({tag:'#text', start:cursor, end, parent:stack.at(-1)});
    cursor = end;
  };
  while (cursor < html.length) {
    const parent = stack.at(-1);
    if (rawTags.has(parent.tag)) {
      const expression = new RegExp('</' + parent.tag + '\\s*>', 'ig');
      expression.lastIndex = cursor;
      const close = expression.exec(html);
      if (!close) throw Error('Unclosed raw HTML element: ' + parent.tag);
      addText(close.index);
    }
    const start = html.indexOf('<', cursor);
    if (start < 0) { addText(html.length); break; }
    addText(start);
    if (html.startsWith('<!--', cursor)) {
      const end = html.indexOf('-->', cursor + 4);
      if (end < 0) throw Error('Unclosed HTML comment');
      cursor = end + 3; continue;
    }
    let end = cursor + 1, quote = '';
    for (; end < html.length; end++) {
      const c = html[end];
      if (quote) { if (c === quote) quote = ''; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
    }
    if (end === html.length) throw Error('Unclosed HTML tag');
    const token = html.slice(cursor, end + 1), close = /^<\/\s*([\w:-]+)\s*>$/.exec(token);
    if (close) {
      const node = stack.pop();
      if (!node || node.tag !== close[1].toLowerCase() || node === root) throw Error('Unbalanced HTML close: ' + token);
      node.closeStart = cursor; node.end = end + 1; cursor = end + 1; continue;
    }
    if (/^<![^>]*>$/.test(token)) { cursor = end + 1; continue; }
    const open = /^<\s*([\w:-]+)/.exec(token);
    if (!open) throw Error('Invalid HTML token: ' + token);
    const tag = open[1].toLowerCase(), attributes = [];
    let position = open[0].length;
    while (position < token.length - 1) {
      if (/\s/.test(token[position])) { position++; continue; }
      if (token[position] === '/' && position === token.length - 2) { position++; continue; }
      const name = /^[^\s=/>]+/.exec(token.slice(position));
      if (!name) throw Error('Invalid HTML attribute: ' + token);
      const attribute = {name:name[0].toLowerCase(), start:cursor + position, value:null};
      position += name[0].length;
      while (/\s/.test(token[position] || '') && position < token.length - 1) position++;
      if (token[position] === '=') {
        position++; while (/\s/.test(token[position] || '') && position < token.length - 1) position++;
        const delimiter = token[position];
        if (delimiter === '"' || delimiter === "'") {
          position++; attribute.quote = delimiter; attribute.valueStart = cursor + position;
          const stop = token.indexOf(delimiter, position);
          if (stop < 0) throw Error('Unclosed HTML attribute');
          attribute.value = token.slice(position, stop); position = stop;
          attribute.valueEnd = cursor + position; position++;
        } else {
          const value = /^[^\s>]+/.exec(token.slice(position));
          if (!value) throw Error('Missing HTML attribute value');
          attribute.quote = ''; attribute.valueStart = cursor + position;
          attribute.value = value[0]; position += value[0].length; attribute.valueEnd = cursor + position;
        }
      }
      attribute.end = cursor + position; attributes.push(attribute);
    }
    const node = {tag, attributes, children:[], start:cursor, openEnd:end + 1, parent:stack.at(-1)};
    node.parent.children.push(node);
    if (voidTags.has(tag) || /\/\s*>$/.test(token)) { node.closeStart = end + 1; node.end = end + 1; }
    else stack.push(node);
    cursor = end + 1;
  }
  if (stack.length !== 1) throw Error('Unclosed HTML element: ' + stack.at(-1).tag);
  return root;
}
function attr(node, name) { return node.attributes?.find(a => a.name === name)?.value; }
function inline(node) { return node.tag === '#text' || inlineTags.has(node.tag) && node.children.every(inline); }
function skipped(node, html) {
  if (skipTags.has(node.tag) || attr(node,'id') === 'sources') return true;
  if (/\b(?:library-credits|source-credit|credits|attribution|language-switch|translation-note|translation-credit)\b/.test(attr(node,'class') || '')) return true;
  if (node.tag === 'p' && /(?:©|\b(?:Screenshot:|Boss sprite source:|Banner artwork:|Original imagery|archived by|tagged Official|Cover artwork))/.test(decode(html.slice(node.openEnd,node.closeStart)))) return true;
  return false;
}
function occurrences(html) {
  const found = [], root = parse(html);
  function add(start, end, kind, context, quote) {
    const raw = html.slice(start,end), leading = raw.match(/^\s*/)[0].length, trailing = raw.match(/\s*$/)[0].length;
    start += leading; end -= trailing;
    if (start >= end || !meaningful(html.slice(start,end))) return;
    const source = html.slice(start,end);
    found.push({key:hash(source), source, kind, context, start, end, ...(quote ? {quote} : {})});
  }
  function walk(node, insideUnit = false) {
    if (node.tag === '#text') { if (!insideUnit) add(node.start,node.end,'html','text'); return; }
    if (skipped(node,html)) return;
    for (const attribute of node.attributes || []) {
      const description = node.tag === 'meta' && attr(node,'name') === 'description' && attribute.name === 'content';
      if (!insideUnit && (attrNames.has(attribute.name) || description) && attribute.value !== null) {
        add(attribute.valueStart,attribute.valueEnd,'attribute',node.tag + '@' + attribute.name,attribute.quote);
      }
    }
    const usable = node.children.length && node.children.every(inline) && meaningful(html.slice(node.openEnd,node.closeStart));
    // Navigation and pickup inventories are separate choices, not sentences.
    // Keep their links separate while paragraphs/cells retain inline context.
    const choices=node.tag==='nav'||node.tag==='div'&&/\b(?:boss-pickups|stage-inventory|jump-links)\b/.test(attr(node,'class')||'');
    if (usable && !choices && (targetTags.has(node.tag) || ['a','span','small','strong','b','em','div','nav','header','footer'].includes(node.tag))) {
      add(node.openEnd,node.closeStart,'html',node.tag + (attr(node,'class') ? '.' + attr(node,'class').split(/\s+/)[0] : ''));
      return;
    }
    for (const child of node.children) walk(child,insideUnit);
  }
  walk(root);
  found.sort((a,b) => a.start - b.start || a.end - b.end);
  for (let i=1;i<found.length;i++) if (found[i].start < found[i-1].end) throw Error('Overlapping translation units');
  return found;
}
function attributeOccurrences(html) {
  const found = [];
  function walk(node) {
    if (node.tag === '#text' || skipped(node,html)) return;
    for (const attribute of node.attributes || []) {
      const description = node.tag === 'meta' && attr(node,'name') === 'description' && attribute.name === 'content';
      if (!(attrNames.has(attribute.name) || description) || attribute.value === null || !meaningful(attribute.value)) continue;
      const leading = attribute.value.match(/^\s*/)[0].length, trailing = attribute.value.match(/\s*$/)[0].length;
      const source = attribute.value.slice(leading,attribute.value.length-trailing);
      found.push({key:hash(source),source,kind:'attribute',context:node.tag+'@'+attribute.name,start:attribute.valueStart+leading,end:attribute.valueEnd-trailing,quote:attribute.quote});
    }
    for (const child of node.children) walk(child);
  }
  walk(parse(html));
  found.sort((a,b)=>a.start-b.start);
  for (let i=1;i<found.length;i++) if(found[i].start<found[i-1].end)throw Error('Overlapping translated attributes');
  return found;
}
function units(html) {
  const unique = new Map();
  for (const item of [...occurrences(html),...attributeOccurrences(html)]) {
    if (unique.has(item.key) && unique.get(item.key).source !== item.source) throw Error('Translation hash collision: ' + item.key);
    if (!unique.has(item.key)) {
      const {key,source,kind,context} = item; unique.set(key,{key,source,kind,context});
    }
  }
  return [...unique.values()];
}
function markupSignature(fragment) {
  const root = parse(fragment), tokens = [], fixed = [];
  function walk(node) {
    if (node.tag === '#text') return;
    if (node.tag !== '#root') {
      tokens.push(fragment.slice(node.start,node.openEnd));
      if (skipTags.has(node.tag) || attr(node,'aria-hidden') === 'true') fixed.push(fragment.slice(node.start,node.end));
    }
    for (const child of node.children) walk(child);
    if (node.tag !== '#root' && !voidTags.has(node.tag) && node.end !== node.openEnd) tokens.push(fragment.slice(node.closeStart,node.end));
  }
  walk(root); return {tokens,fixed};
}
const canonicalPatterns = new WeakMap();
function protectCanonical(item,value,terms=[]) {
  if (!Array.isArray(terms)) throw Error('Canonical terms must be an array');
  let pattern=canonicalPatterns.get(terms);
  if (!pattern) {
    const aliases=new Set();
    for (const entry of terms) {
      const forms=typeof entry==='string'?[entry]:[entry?.term,...(entry?.aliases||[])];
      for (const term of forms) if (typeof term==='string' && term.trim()) {
        aliases.add(term);
        if (/\b(?:Tank|Part|Chip|Disk|Bolt|Module|Fragment|Program)$/.test(term)) aliases.add(term+'s');
      }
    }
    const ordered=[...aliases].sort((a,b)=>b.length-a.length||a.localeCompare(b));
    pattern=ordered.length?new RegExp('(?<![A-Za-z0-9_])(?:'+ordered.map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![A-Za-z0-9_])','g'):null;
    canonicalPatterns.set(terms,pattern);
  }
  if (!pattern) return value;
  const plain=text=>decode(item.kind==='html'?text.replace(/<[^>]*>/g,' '):text).replace(/\s+/g,' ');
  const exemptions=new Set(require('./locales/canonical-exceptions.json').units[item.key]?.terms||[]);
  const count=text=>{
    const found=new Map();pattern.lastIndex=0;
    for(const match of plain(text).matchAll(pattern))if(!exemptions.has(match[0]))found.set(match[0],(found.get(match[0])||0)+1);
    return [...found].sort(([a],[b])=>a.localeCompare(b));
  };
  if(JSON.stringify(count(item.source))!==JSON.stringify(count(value)))throw Error('Changed canonical names: '+item.key);
  return value;
}
function validateValue(item, value, terms) {
  if (typeof value !== 'string' || !value.trim() || value.includes('\u0000')) throw Error('Invalid translation value: ' + item.key);
  if (/▁|ZXQ/i.test(decode(value))) throw Error('Unresolved translation tokenizer/placeholder: ' + item.key);
  if (item.kind === 'attribute') {
    if (/[<>]/.test(value) || /[\r\n]/.test(value)) throw Error('Unsafe translated attribute: ' + item.key);
  } else {
    if (/<!/.test(value) && !/<!/.test(item.source)) throw Error('Added translation declaration/comment: ' + item.key);
    const original = markupSignature(item.source), translated = markupSignature(value);
    if (JSON.stringify(original) !== JSON.stringify(translated)) throw Error('Changed translation markup/attributes: ' + item.key);
  }
  const plain = text => decode(text.replace(/<[^>]*>/g,' '));
  const glyphText=text=>plain(text).replace(/&(?:larr|rarr|uarr|darr|harr|crarr|lArr|rArr|uArr|dArr|hArr|hearts|diams|clubs|spades|times|divide|plusmn|check|cross);/g,entity=>({'&larr;':'←','&rarr;':'→','&uarr;':'↑','&darr;':'↓','&harr;':'↔','&crarr;':'↵','&lArr;':'⇐','&rArr;':'⇒','&uArr;':'⇑','&dArr;':'⇓','&hArr;':'⇔','&hearts;':'♥','&diams;':'♦','&clubs;':'♣','&spades;':'♠','&times;':'×','&divide;':'÷','&plusmn;':'±','&check;':'✓','&cross;':'✗'}[entity]));
  // Fixed UI icons and mathematical separators are not translated punctuation.
  // Ordinary sentence punctuation can follow the language's writing conventions.
  const glyphs=text=>glyphText(text).match(/[\u2039\u203A\u2190-\u22FF\u25A0-\u27BF\uFE0E\uFE0F\u{1F300}-\u{1FAFF}+%=<>×÷±‰]/gu)||[];
  if(JSON.stringify(glyphs(item.source))!==JSON.stringify(glyphs(value)))throw Error('Changed translation glyphs: '+item.key);
  // English integer grouping is localized without changing its value. Only
  // sources containing grouped integers enable target grouping equivalence;
  // an English decimal such as 3.000 must never become the integer 3000.
  const englishGroup=/(?<![\p{N}.,])\d{1,3}(?:,\d{3})+(?!\p{N}|[,.]\p{N})/gu;
  const hasGroupedInteger=englishGroup.test(plain(item.source));
  const localGroup=/(?<![\p{N}.,])\d{1,3}([,.\u00A0\u202F ])\d{3}(?:\1\d{3})*(?!\p{N}|[,.]\p{N})/gu;
  const numbers=(text,isSource)=>{
    let numeric=plain(text);
    if(isSource)numeric=numeric.replace(englishGroup,match=>match.replaceAll(',',''));
    else if(hasGroupedInteger)numeric=numeric.replace(localGroup,match=>match.replace(/[,.\u00A0\u202F ]/g,''));
    return numeric.replace(/(\p{N})\s*([+\-−])\s*(?=\p{N})/gu,'$1$2').match(/(?<!\p{N})[\-−]?\p{N}+(?:[.,]\p{N}+)?/gu)||[];
  };
  if (JSON.stringify(numbers(item.source,true)) !== JSON.stringify(numbers(value,false))) throw Error('Changed translation numbers: ' + item.key);
  if (terms) protectCanonical(item,value,terms);
  if(item.kind!=='attribute'||value===item.source)return value;
  const safe=escape(decode(value));
  return item.quote===''?safe.replace(/\s/g,c=>'&#'+c.charCodeAt(0)+';'):safe;
}
function translate(html, locale, dictionary, terms) {
  if (!locales.includes(locale)) throw Error('Unsupported locale: ' + locale);
  const entries = dictionary?.entries || dictionary?.translations || dictionary;
  const valueFor = item => {
    const entry = entries?.[item.key];
    if (entry === undefined) throw Error('Missing translation ' + locale + ': ' + item.key + ' (' + item.context + ')');
    if (entry && typeof entry === 'object' && entry.source !== item.source) throw Error('Stale translation source: ' + item.key);
    const value = typeof entry === 'string' ? entry : entry?.translation ?? entry?.value ?? entry?.text;
    return {...item,value:validateValue(item,value,terms)};
  };
  // Validate every source before changing anything. Nested accessible labels are
  // separate units, then receive their own pass after sentence markup is safe.
  for (const item of [...occurrences(html),...attributeOccurrences(html)]) valueFor(item);
  const changes = occurrences(html).filter(item=>item.kind==='html').map(valueFor);
  let result = html;
  for (const item of changes.reverse()) result = result.slice(0,item.start) + item.value + result.slice(item.end);
  for (const item of attributeOccurrences(result).map(valueFor).reverse()) result = result.slice(0,item.start) + item.value + result.slice(item.end);
  if (!/<html\b[^>]*\blang=(["'])en\1/i.test(result)) throw Error('Expected English source document language');
  return result.replace(/(<html\b[^>]*\blang=)(["'])en\2/i, '$1"' + locale + '"');
}

function pagePath(locale, route) {
  if (!locales.includes(locale) || typeof route !== 'string' || route.startsWith('/') || /(?:^|\/)\.\.?\//.test(route) || /[?#\\]/.test(route)) throw Error('Invalid locale route');
  return (locale === 'en' ? '' : locale + '/') + (route.endsWith('/') ? route + 'index.html' : route || 'index.html');
}
function relativeUrl(locale, route, target) {
  const from = path.posix.dirname(pagePath(locale,route)), trailing = target.endsWith('/');
  let url = path.posix.relative(from,target) || './';
  if (trailing && !url.endsWith('/')) url += '/';
  return url;
}
function rewriteUrls(html, locale, route) {
  pagePath(locale,route);
  const changes = [], originalBase = new URL(route || './','https://guides.invalid/');
  function walk(node) {
    for (const attribute of node.attributes || []) {
      if (!['href','src','poster'].includes(attribute.name) || !attribute.value || /^(?:#|\?|[a-z][\w+.-]*:|\/\/)/i.test(attribute.value)) continue;
      const resolved = new URL(decode(attribute.value),originalBase), original = resolved.pathname.slice(1);
      const resource = attribute.name !== 'href' || /^(?:assets|previous)(?:\/|$)/.test(original) || /\.(?:css|js|ico|png|jpe?g|gif|webp|svg|woff2?|mp4|webm|mp3|json|txt|pdf)$/i.test(original);
      const destination = (!resource && locale !== 'en' ? locale + '/' : '') + original;
      changes.push({start:attribute.valueStart,end:attribute.valueEnd,value:escape(relativeUrl(locale,route,destination) + resolved.search + resolved.hash)});
    }
    for (const child of node.children) if (child.tag !== '#text') walk(child);
  }
  walk(parse(html));
  let result = html;
  for (const change of changes.sort((a,b) => b.start-a.start)) result=result.slice(0,change.start)+change.value+result.slice(change.end);
  return result;
}
function uiCatalog(ui) {
  const catalog = ui?.locales || ui;
  if (!catalog || typeof catalog !== 'object') throw Error('Missing UI catalog');
  const keys = Object.keys(catalog.en || {});
  if (!keys.length) throw Error('Missing English UI messages');
  for (const locale of locales) {
    for (const key of keys) {
      if (typeof catalog[locale]?.[key] !== 'string' || !catalog[locale][key].trim()) throw Error('Missing UI message: ' + locale + '/' + key);
      const parameters = text => [...text.matchAll(/\{([\w]+)\}/g)].map(m=>m[1]).sort();
      if (JSON.stringify(parameters(catalog.en[key])) !== JSON.stringify(parameters(catalog[locale][key]))) throw Error('Changed UI parameters: ' + locale + '/' + key);
    }
  }
  return catalog;
}
function decorate(html, {locale='en',route=''}) {
  pagePath(locale,route);
  if (/data-guide-locale=/.test(html)) throw Error('Page already has locale decoration');
  if (!new RegExp('<html\\b[^>]*\\blang=(["\\\'])' + locale + '\\1','i').test(html)) throw Error('Document language does not match decorated locale');
  const ui = uiCatalog(JSON.parse(fs.readFileSync(path.join(__dirname,'locales/ui.json'),'utf8')))[locale];
  let result = rewriteUrls(html,locale,route);
  result = result.replace(/<body\b/, '<body data-guide-locale="' + escape(locale) + '" data-guide-route="' + escape(route) + '"');
  const css = relativeUrl(locale,route,'localization.css'), js = relativeUrl(locale,route,'localization.js');
  // Messages must exist before other deferred scripts. Locale styles come last
  // so their spacing and CJK wrapping are not reset by the base theme.
  result = result.replace(/(<head\b[^>]*>)/i, '$1<script src="' + js + '" data-locale-runtime defer></script>');
  result = result.replace('</head>','<link rel="stylesheet" href="' + css + '"></head>');
  const selector = '<div class="language-switch"><label for="guide-language">' + escape(ui.language) + '</label><select id="guide-language" aria-label="' + escape(ui.language) + '">' + locales.map(id => '<option value="' + id + '" lang="' + id + '"' + (locale===id?' selected':'') + '>' + escape(names[id]) + '</option>').join('') + '</select></div>';
  if (/<div class="top-tools">/.test(result)) result = result.replace('<div class="top-tools">','<div class="top-tools">'+selector);
  else if (/<header class="hero library-hero">/.test(result)) result = result.replace('<header class="hero library-hero">','<header class="hero library-hero">'+selector);
  else throw Error('Missing language selector destination');
  if (locale !== 'en') {
    const english = relativeUrl(locale,route,route || './') + '?lang=en';
    const note = '<aside class="translation-note" role="note"><span>' + escape(ui.translationNote) + '</span> <a href="' + english + '" data-english-source>' + escape(ui.englishSource) + '</a></aside>';
    const footerEnd=result.lastIndexOf('</footer>');
    const credit='<p class="translation-credit">'+escape(ui.translationCredit)+'</p>';
    if(footerEnd>=0)result=result.slice(0,footerEnd)+note+credit+result.slice(footerEnd);
    else if(result.includes('</main>'))result=result.replace('</main>',note+credit+'</main>');
    else throw Error('Missing translation credit destination');
  }
  return result;
}
function compileRuntime(ui) {
  const catalog = uiCatalog(ui), serialized = JSON.stringify(catalog).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return 'window.__GUIDE_UI__=' + serialized + ';\n' + fs.readFileSync(path.join(__dirname,'localization.js'),'utf8').replaceAll('\r\n','\n');
}
module.exports = {locales,names,units,translate,decorate,rewriteUrls,compileRuntime,validateValue,protectCanonical};
