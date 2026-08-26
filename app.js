const state = {
  theme: 'bb-ocean',
  style: 'bb-solid',
  size: 'bb-lg',
  shape: 'bb-pill',
  animation: 'bb-anim-shine',
  shadow: false,
  loading: false,
  block: false,
  motionReduced: false,
  label: 'Make it better'
};

const defaults = { ...state };
const themeNames = {
  'bb-amber': 'Amber',
  'bb-bronze': 'Bronze',
  'bb-coral': 'Coral',
  'bb-crimson': 'Crimson',
  'bb-cyan': 'Cyan',
  'bb-emerald': 'Emerald',
  'bb-fuchsia': 'Fuchsia',
  'bb-gold': 'Gold',
  'bb-indigo': 'Indigo',
  'bb-lavender': 'Lavender',
  'bb-lime': 'Lime',
  'bb-midnight': 'Midnight',
  'bb-monochrome': 'Monochrome',
  'bb-neon': 'Neon',
  'bb-ocean': 'Ocean',
  'bb-rose': 'Rose',
  'bb-slate': 'Slate',
  'bb-sunset': 'Sunset',
  'bb-teal': 'Teal',
  'bb-violet': 'Violet'
};

const arrowIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4"></path></svg>';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      })[character]
  );
}

function currentClasses() {
  const classes = ['bb-btn', state.theme, state.style, state.size, state.shape, state.animation];
  if (state.shape === 'bb-circle') classes.push('bb-icon-only');
  if (state.shadow) classes.push('bb-shadow');
  if (state.loading) classes.push('bb-loading');
  if (state.block && state.shape !== 'bb-circle') classes.push('bb-block');
  return classes;
}

function buttonMarkup() {
  const label = escapeHtml(state.label.trim() || 'Button');
  const attributes = ['type="button"', `class="${currentClasses().join(' ')}"`];
  if (state.shape === 'bb-circle') attributes.push(`aria-label="${label}"`);
  if (state.loading) attributes.push('aria-busy="true"', 'disabled');
  const content =
    state.shape === 'bb-circle'
      ? `<span class="bb-btn-icon" aria-hidden="true">${arrowIcon}</span>`
      : `${label} <span class="bb-btn-icon" aria-hidden="true">${arrowIcon}</span>`;
  return `<button ${attributes.join(' ')}>\n  ${content}\n</button>`;
}

function updateBuilder() {
  const preview = $('#builder-preview-button');
  const code = $('#code-output');
  if (!preview || !code) return;

  preview.className = currentClasses().join(' ');
  preview.setAttribute('aria-label', state.label.trim() || 'Button');
  preview.disabled = state.loading;
  if (state.loading) preview.setAttribute('aria-busy', 'true');
  else preview.removeAttribute('aria-busy');
  if (state.shape === 'bb-circle') {
    preview.innerHTML = `<span class="bb-btn-icon" aria-hidden="true">${arrowIcon}</span>`;
  } else {
    preview.innerHTML = `<span class="preview-label"></span><span class="bb-btn-icon" aria-hidden="true">${arrowIcon}</span>`;
    $('.preview-label', preview).textContent = state.label.trim() || 'Button';
  }
  code.textContent = buttonMarkup();
  $('#theme-value').textContent = themeNames[state.theme] || 'Custom';
  document.documentElement.dataset.reducedMotion = String(state.motionReduced);
  updateControlStates();
}

function updateControlStates() {
  $$('[data-control]').forEach((control) => {
    const key = control.dataset.control;
    if (control.type === 'checkbox') {
      control.checked = Boolean(state[key]);
      return;
    }
    if (control.tagName === 'SELECT') {
      control.value = state[key];
      return;
    }
    const selected = state[key] === control.dataset.value;
    control.classList.toggle('is-selected', selected);
    control.setAttribute('aria-pressed', String(selected));
  });
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

async function copyText(text, message = 'Copied to clipboard') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    showToast(message);
    return true;
  } catch {
    showToast('Copy failed — select the code manually');
    return false;
  }
}

function setTheme(theme) {
  document.documentElement.classList.toggle('theme-light', theme === 'light');
  $('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f5f7fa' : '#0b0e13');
  const toggle = $('#theme-toggle');
  if (toggle) {
    const next = theme === 'light' ? 'dark' : 'light';
    toggle.setAttribute('aria-label', `Switch to ${next} theme`);
    toggle.title = `Switch to ${next} theme`;
  }
  try {
    localStorage.setItem('betterbuttons-theme', theme);
  } catch {
    /* Storage can be disabled. */
  }
}

function initTheme() {
  let theme = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  try {
    theme = localStorage.getItem('betterbuttons-theme') || theme;
  } catch {
    /* Use dark theme. */
  }
  setTheme(theme === 'light' ? 'light' : 'dark');
  $('#theme-toggle')?.addEventListener('click', () => {
    setTheme(document.documentElement.classList.contains('theme-light') ? 'dark' : 'light');
  });
}

function initMenu() {
  const toggle = $('#menu-toggle');
  const nav = $('#primary-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  $$('a', nav).forEach((link) =>
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });
}

function initBuilder() {
  $$('[data-control]').forEach((control) => {
    const eventName = control.type === 'checkbox' || control.tagName === 'SELECT' ? 'change' : 'click';
    control.addEventListener(eventName, () => {
      const key = control.dataset.control;
      if (control.type === 'checkbox') {
        state[key] = control.checked;
      } else {
        state[key] = control.tagName === 'SELECT' ? control.value : control.dataset.value;
      }
      updateBuilder();
    });
  });

  $('#button-label')?.addEventListener('input', (event) => {
    state.label = event.target.value;
    updateBuilder();
  });

  $('#copy-code')?.addEventListener('click', async (event) => {
    const copied = await copyText(buttonMarkup(), 'HTML copied to clipboard');
    if (copied) {
      event.currentTarget.firstChild.textContent = 'Copied ';
      window.setTimeout(() => {
        event.currentTarget.firstChild.textContent = 'Copy HTML ';
      }, 1800);
      $('#copy-status').textContent = 'Ready to paste into your project.';
    }
  });

  $('#reset-builder')?.addEventListener('click', () => {
    Object.assign(state, defaults);
    $('#button-label').value = state.label;
    updateBuilder();
    showToast('Builder reset');
  });

  updateBuilder();
}

function initGallery() {
  const cards = $$('[data-style-card]');
  const empty = $('#gallery-empty');
  const search = $('#button-search');
  let activeFilter = 'all';

  function filterCards() {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesQuery = !query || card.dataset.search.includes(query);
      const shouldShow = matchesFilter && matchesQuery;
      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  }

  search?.addEventListener('input', filterCards);
  $$('[data-filter]').forEach((button) =>
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      $$('[data-filter]').forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      filterCards();
    })
  );

  $$('.card-copy').forEach((button) =>
    button.addEventListener('click', async () => {
      const copied = await copyText(button.dataset.copyClass, 'Button classes copied');
      if (copied) {
        const original = button.textContent;
        button.textContent = 'Copied';
        window.setTimeout(() => {
          button.textContent = original;
        }, 1800);
      }
    })
  );

  $$('.card-use').forEach((button) =>
    button.addEventListener('click', () => {
      state.style = button.dataset.style;
      updateBuilder();
      const reduceMotion =
        state.motionReduced || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      $('#builder')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      showToast(`${button.dataset.style.replace('bb-', '').replaceAll('-', ' ')} style loaded`);
    })
  );
}

function initNavHighlight() {
  const links = $$('a[href^="#"]', $('#primary-nav'));
  const sections = ['gallery', 'builder', 'recipes'].map((id) => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) =>
          link.classList.toggle('is-current', link.getAttribute('href') === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: '-30% 0px -58% 0px', threshold: 0 }
  );
  sections.forEach((section) => observer.observe(section));
}

initTheme();
initMenu();
initBuilder();
initGallery();
initNavHighlight();
