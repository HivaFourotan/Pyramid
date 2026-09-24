/* ======================================================================
   PIRAMID — shortcuts.js
   پنل میان‌برها + مدیریت کلیدهای سراسری
   ====================================================================== */
'use strict';

(function(){
  const $ = (s, c = document) => c.querySelector(s);

  const SHORTCUTS = [
    {
      title:'عمومی',
      items:[
        { label:'پالت فرمان (جستجو)', keys:['Ctrl','K'] },
        { label:'جستجوی سریع',        keys:['/'] },
        { label:'پنل میان‌برها',      keys:['?'] },
        { label:'خروج از تمرکز',      keys:['ESC'] }
      ]
    },
    {
      title:'داشبورد',
      items:[
        { label:'شروع / توقف پومودورو', keys:['Space'] },
        { label:'ریست پومودورو',         keys:['R'] },
        { label:'حالت تمرکز',            keys:['F'] }
      ]
    },
    {
      title:'فلش‌کارت',
      items:[
        { label:'نمایش جواب',    keys:['Space'] },
        { label:'دوباره',        keys:['1'] },
        { label:'سخت',           keys:['2'] },
        { label:'خوب',           keys:['3'] },
        { label:'آسون',          keys:['4'] }
      ]
    },
    {
      title:'یادداشت',
      items:[
        { label:'ذخیره',      keys:['Ctrl','S'] },
        { label:'بستن',       keys:['ESC'] }
      ]
    },
    {
      title:'اتاق تمرکز',
      items:[
        { label:'شروع / توقف',    keys:['Space'] },
        { label:'تمام صفحه',      keys:['F'] }
      ]
    }
  ];

  /* ==================== ساخت UI ==================== */
  let overlay;

  function buildUI(){
    if($('#sc-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = 'sc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const html = SHORTCUTS.map(sec => `
      <div class="sc-section">
        <div class="sc-section-title">${sec.title}</div>
        ${sec.items.map(it => `
          <div class="sc-row">
            <span>${it.label}</span>
            <div class="sc-keys">
              ${it.keys.map((k, i) => `<span class="sc-key ${i === 0 && it.keys.length === 1 ? 'primary' : ''}">${k}</span>`).join('<span style="color:var(--faint);font-size:.8em;align-self:center;">+</span>')}
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="sc-modal">
        <div class="sc-head">
          <h3>⌨️ میان‌برهای صفحه‌کلید</h3>
          <button class="sc-close" type="button" aria-label="بستن">✕</button>
        </div>
        <div class="sc-body">
          ${html}
          <div style="text-align:center;padding:14px 0 0;font-size:.78em;color:var(--muted);">
            💡 برای باز کردن این پنل، کلید <b style="color:var(--primary-dark);">?</b> رو بزن
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => {
      if(e.target === overlay) close();
    });
    $('.sc-close', overlay)?.addEventListener('click', close);
  }

  /* ==================== باز/بسته ==================== */
  let isOpen = false;

  function open(){
    buildUI();
    if(isOpen) return;
    isOpen = true;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close(){
    if(!overlay || !isOpen) return;
    isOpen = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggle(){ isOpen ? close() : open(); }

  /* ==================== Global ==================== */
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    const isEditable = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

    // ? برای باز کردن پنل میان‌برها
    if(e.key === '?' && !isEditable){
      e.preventDefault();
      toggle();
      return;
    }

    // ESC برای بستن
    if(e.key === 'Escape' && isOpen){
      e.preventDefault();
      close();
    }
  });

  /* ==================== API ==================== */
  window.PiramidShortcuts = { open, close, toggle };

  console.log('%c⌨️ Shortcuts panel ready (?)', 'color:#e85d9e;font-weight:700;');
})();