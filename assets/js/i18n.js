/* S1GK internationalization engine.
 * - Translates [data-i18n] text, [data-i18n-ph] placeholders and [data-i18n-aria] labels.
 * - Auto-translates the shared header nav, mobile drawer and footer site-wide via href maps,
 *   so unmodified pages still localize their chrome.
 * - Injects a language switcher into every page's nav actions.
 * - Persists the choice, honours ?lang=, sets <html lang/dir>, and exposes a small public API
 *   on window.S1GK_I18N for the commerce layer (currency + number formatting).
 *
 * Adding a language: add an entry to LOCALES and ship data/i18n/<code>.json. Nothing else.
 * Adding a string: give the element a data-i18n="some.key" and add the key to every locale file
 * (en.json is the source of truth and is used as the fallback for any missing key).
 */
(function () {
  'use strict';

  var LOCALES = {
    'en': { label: 'English', dir: 'ltr', intl: 'en' },
    'nl': { label: 'Nederlands', dir: 'ltr', intl: 'nl' },
    'fr': { label: 'Français', dir: 'ltr', intl: 'fr' },
    'de': { label: 'Deutsch', dir: 'ltr', intl: 'de' },
    'es': { label: 'Español', dir: 'ltr', intl: 'es' },
    'it': { label: 'Italiano', dir: 'ltr', intl: 'it' },
    'pt': { label: 'Português', dir: 'ltr', intl: 'pt' },
    'el': { label: 'Ελληνικά', dir: 'ltr', intl: 'el' },
    'sv': { label: 'Svenska', dir: 'ltr', intl: 'sv' },
    'da': { label: 'Dansk', dir: 'ltr', intl: 'da' },
    'no': { label: 'Norsk', dir: 'ltr', intl: 'nb' },
    'fi': { label: 'Suomi', dir: 'ltr', intl: 'fi' },
    'id': { label: 'Bahasa Indonesia', dir: 'ltr', intl: 'id' },
    'zh-Hant': { label: '繁體中文', dir: 'ltr', intl: 'zh-Hant' },
    'zh-Hans': { label: '简体中文', dir: 'ltr', intl: 'zh-Hans' }
  };

  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 's1gk-lang';
  var BASE_CURRENCY = 'EUR';

  // og:locale codes (xx_XX) for social/SEO, keyed by our language codes.
  var OG_LOCALE = {
    en: 'en_US', nl: 'nl_NL', fr: 'fr_FR', de: 'de_DE', es: 'es_ES', it: 'it_IT',
    pt: 'pt_PT', el: 'el_GR', sv: 'sv_SE', da: 'da_DK', no: 'nb_NO', fi: 'fi_FI',
    id: 'id_ID', 'zh-Hant': 'zh_TW', 'zh-Hans': 'zh_CN'
  };

  /* Shared chrome: translate links by their href so every page localizes without per-page markup. */
  var NAV_KEYS = {
    '/': 'nav.home',
    '/gloves/': 'nav.gloves',
    '/matchwear/': 'nav.matchwear',
    '/training/': 'nav.training',
    '/accessories/': 'nav.accessories',
    '/junior/': 'nav.junior',
    '/guides/': 'nav.guides',
    '/about/': 'nav.about',
    '/contact/': 'nav.contact',
    '/products/': 'nav.shopAll'
  };
  var FOOTER_HEADING_KEYS = {
    'Stay locked in': 'footer.stayLockedIn',
    'Shop': 'footer.shop',
    'Learn': 'footer.learn',
    'Brand': 'footer.brand'
  };

  var dict = {};        // active language dictionary (flattened)
  var baseDict = {};    // English fallback dictionary (flattened)
  var current = DEFAULT_LANG;
  var listeners = [];

  function flatten(obj, prefix, out) {
    out = out || {};
    prefix = prefix || '';
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var key = prefix ? prefix + '.' + k : k;
      var val = obj[k];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        flatten(val, key, out);
      } else {
        out[key] = val;
      }
    }
    return out;
  }

  // Strict lookup: returns the translated string, or null when the key is not
  // yet loaded / missing. Apply functions use this so an early call (before the
  // dictionary has loaded) never overwrites markup with raw keys.
  function lookup(key) {
    if (dict[key] != null) return dict[key];
    if (baseDict[key] != null) return baseDict[key];
    return null;
  }

  // Public helper: returns the translation, the provided fallback, or the key.
  function t(key, fallback) {
    var v = lookup(key);
    if (v != null) return v;
    return fallback !== undefined ? fallback : key;
  }

  function detectLang() {
    try {
      var qs = new URLSearchParams(window.location.search).get('lang');
      if (qs && LOCALES[qs]) return qs;
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LOCALES[stored]) return stored;
    } catch (e) { /* ignore */ }
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    if (nav) {
      if (/^zh\b/i.test(nav)) {
        return /hant|tw|hk|mo/i.test(nav) ? 'zh-Hant' : 'zh-Hans';
      }
      var short = nav.slice(0, 2).toLowerCase();
      if (LOCALES[short]) return short;
    }
    return DEFAULT_LANG;
  }

  function fetchDict(lang) {
    return fetch('/data/i18n/' + lang + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('locale ' + lang); return r.json(); })
      .catch(function () { return {}; });
  }

  function applyTranslations() {
    // Explicitly tagged elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = lookup(el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = lookup(el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var v = lookup(el.getAttribute('data-i18n-ph'));
      if (v != null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var v = lookup(el.getAttribute('data-i18n-aria'));
      if (v != null) el.setAttribute('aria-label', v);
    });

    applyChrome();
    applyMeta();
    document.documentElement.setAttribute('lang', current);
    document.documentElement.setAttribute('dir', LOCALES[current].dir);
  }

  function setMeta(selector, attr, value) {
    var el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      var parts = selector.match(/\[(name|property)="([^"]+)"\]/);
      if (parts) el.setAttribute(parts[1], parts[2]);
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  }

  // Localized <title>, meta description and og:locale. Pages opt in to localized
  // title/description by declaring <meta name="i18n-title"> / <meta name="i18n-desc">
  // with a translation key; og:locale always reflects the rendered language.
  function applyMeta() {
    var titleMeta = document.querySelector('meta[name="i18n-title"]');
    if (titleMeta) { var tv = lookup(titleMeta.getAttribute('content')); if (tv != null) document.title = tv; }
    var descMeta = document.querySelector('meta[name="i18n-desc"]');
    if (descMeta) {
      var dv = lookup(descMeta.getAttribute('content'));
      if (dv != null) {
        setMeta('meta[name="description"]', 'content', dv);
        setMeta('meta[property="og:description"]', 'content', dv);
      }
    }
    setMeta('meta[property="og:locale"]', 'content', OG_LOCALE[current] || 'en_US');
    if (titleMeta) {
      var tv2 = lookup(titleMeta.getAttribute('content'));
      if (tv2 != null) setMeta('meta[property="og:title"]', 'content', tv2);
    }
  }

  function applyChrome() {
    // Header, drawer and footer column links, matched by href (skip explicitly tagged ones).
    document.querySelectorAll('.nav-links a, .drawer-links a, .footer-grid nav a').forEach(function (a) {
      if (a.hasAttribute('data-i18n')) return;
      var key = NAV_KEYS[a.getAttribute('href')];
      if (key) { var v = lookup(key); if (v != null) a.textContent = v; }
    });
    // Footer column headings, matched by their English label.
    document.querySelectorAll('.footer-grid h3').forEach(function (h) {
      if (h.hasAttribute('data-i18n')) return;
      var key = FOOTER_HEADING_KEYS[h.textContent.trim()];
      if (key) { var v = lookup(key); if (v != null) h.textContent = v; }
    });
    // "Add to kit" buttons appear across product, listing and home pages.
    document.querySelectorAll('.add-kit').forEach(function (b) {
      if (b.hasAttribute('data-i18n')) return;
      var v = lookup('common.addToKit');
      if (v != null) b.textContent = v;
    });
  }

  function buildSwitcher() {
    var actions = document.querySelector('.nav-actions');
    if (!actions || document.getElementById('langSwitcher')) return;
    var wrap = document.createElement('div');
    wrap.className = 'lang-switch';
    var select = document.createElement('select');
    select.id = 'langSwitcher';
    select.setAttribute('aria-label', t('a11y.language', 'Choose language'));
    Object.keys(LOCALES).forEach(function (code) {
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = LOCALES[code].label;
      if (code === current) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', function () { setLang(select.value); });
    wrap.appendChild(select);
    // Place before the hamburger so it reads logically on every breakpoint.
    var menuBtn = actions.querySelector('.menu-btn');
    if (menuBtn) actions.insertBefore(wrap, menuBtn);
    else actions.appendChild(wrap);
  }

  function setLang(lang) {
    if (!LOCALES[lang]) lang = DEFAULT_LANG;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    return fetchDict(lang).then(function (data) {
      dict = flatten(data);
      applyTranslations();
      var sw = document.getElementById('langSwitcher');
      if (sw && sw.value !== lang) sw.value = lang;
      listeners.forEach(function (fn) { try { fn(lang); } catch (e) { /* ignore */ } });
    });
  }

  function formatCurrency(amount, currency) {
    var n = Number(amount) || 0;
    try {
      return new Intl.NumberFormat(LOCALES[current].intl, {
        style: 'currency', currency: currency || BASE_CURRENCY
      }).format(n);
    } catch (e) {
      return '€' + n.toFixed(2);
    }
  }

  function init() {
    current = detectLang();
    // Set lang/dir immediately to reduce flash before the dictionary loads.
    document.documentElement.setAttribute('lang', current);
    document.documentElement.setAttribute('dir', LOCALES[current].dir);

    var ready = function () {
      buildSwitcher();
      // Load English first as the fallback base, then the active language.
      var p = current === DEFAULT_LANG
        ? fetchDict(DEFAULT_LANG).then(function (d) { baseDict = flatten(d); })
        : Promise.all([
            fetchDict(DEFAULT_LANG).then(function (d) { baseDict = flatten(d); }),
            Promise.resolve()
          ]);
      p.then(function () { return setLang(current); });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ready);
    } else {
      ready();
    }
  }

  window.S1GK_I18N = {
    t: t,
    setLang: setLang,
    get lang() { return current; },
    locales: LOCALES,
    formatCurrency: formatCurrency,
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    refresh: applyTranslations
  };

  init();
})();
