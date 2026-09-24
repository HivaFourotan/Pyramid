/* ======================================================================
   PIRAMID — search.js
   جستجوی سراسری با Ctrl+K — پالت فرمان
   ====================================================================== */
'use strict';

(function(){
  const $ = (s, c = document) => c.querySelector(s);

  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };

  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');

  /* ==================== صفحات ==================== */
  const PAGES = [
    { icon:'🏠', title:'خانه',          sub:'صفحه اصلی پیرامید',      url:'index.html',           keys:['خانه','home','ایندکس','main'] },
    { icon:'🎯', title:'داشبورد مطالعه',sub:'تایمر و آمار',            url:'dashboard.html',       keys:['داشبورد','dashboard','آمار','پومودورو'] },
    { icon:'🧮', title:'تخمین کنکور',   sub:'محاسبه تراز و رتبه',      url:'estimate.html',        keys:['تخمین','کنکور','تراز','رتبه','محاسبه'] },
    { icon:'🃏', title:'فلش‌کارت',      sub:'مرور با SM-2',            url:'flashcards.html',      keys:['فلش','کارت','فلش‌کارت','مرور','flashcard'] },
    { icon:'🎓', title:'ماشین‌حساب معدل',sub:'معدل و سوابق',           url:'gpa.html',             keys:['معدل','سوابق','gpa','کارنامه','تراز'] },
    { icon:'📓', title:'دفترچه یادداشت',sub:'نکته‌ها و فرمول‌ها',       url:'notes.html',           keys:['یادداشت','نوت','notes','فرمول'] },
    { icon:'📅', title:'برنامه‌ریز هفتگی',sub:'برنامه بریز',            url:'planner.html',         keys:['برنامه','planner','هفتگی','تقویم'] },
    { icon:'📊', title:'کارنامه هفتگی', sub:'گزارش خودکار',            url:'weekly-report.html',   keys:['کارنامه','گزارش','weekly','report'] },
    { icon:'🎬', title:'خاطرات',        sub:'سفر و کپسول زمان',        url:'memories.html',        keys:['خاطره','memories','کپسول','زمان'] },
    { icon:'🌟', title:'سفر پیرامید',   sub:'XP و مأموریت‌ها',          url:'journey.html',         keys:['سفر','journey','xp','مأموریت','سطح'] },
    { icon:'👥', title:'حریف مجازی',   sub:'رقابت و دوئل',            url:'rival.html',           keys:['حریف','رقیب','rival','دوئل'] },
    { icon:'🌧', title:'اتاق تمرکز',    sub:'منظره و صداهای محیطی',    url:'focus-room.html',      keys:['تمرکز','focus','باران','اتاق','تنفس'] },
    { icon:'💾', title:'پشتیبان‌گیری',  sub:'ذخیره و بازیابی',         url:'backup.html',          keys:['پشتیبان','backup','بازیابی'] },
    { icon:'👤', title:'پروفایل من',    sub:'اطلاعات کاربری',          url:'account.html',         keys:['پروفایل','اکانت','حساب','user'] }
  ];

  /* ==================== میان‌برها ==================== */
  const ACTIONS = [
    { icon:'🎨', title:'تغییر تم (کشو)',      sub:'رنگ، حالت، افکت‌ها',    keys:['تم','theme','رنگ','دارک','کشو'], run:() => $('#themeDrawerBtn')?.click() },
    { icon:'🌗', title:'تغییر سریع روشن/تیره', sub:'دارک/لایت',             keys:['دارک','تیره','روشن','مود','dark'], run:() => $('#quickThemeToggle')?.click() },
    { icon:'🧮', title:'ماشین‌حساب',           sub:'محاسبه‌گر سریع',        keys:['ماشین','calc','حساب'], run:() => $('#calcBtn')?.click() },
    { icon:'🎥', title:'کلاس آنلاین',          sub:'ورود به جلسه',          keys:['کلاس','class','آنلاین'], run:() => $('#classBtn')?.click() },
    { icon:'💬', title:'چت پشتیبانی',          sub:'گفتگو با دستیار',       keys:['چت','chat','پشتیبانی'], run:() => $('#chatToggle')?.click() },
    { icon:'⬆️', title:'برگشت به بالا',        sub:'ابتدای صفحه',           keys:['بالا','top','scroll'], run:() => window.scrollTo({ top:0, behavior:'smooth' }) },
    { icon:'⌨️', title:'پنل میان‌برها',        sub:'لیست همه‌ی کلیدها',     keys:['میان‌بر','shortcut','کلید','keyboard'], run:() => window.PiramidShortcuts?.open() },
    { icon:'❓', title:'تور معرفی',             sub:'آموزش سریع',            keys:['تور','tour','راهنما','آموزش'], run:() => window.PiramidTour?.start() }
  ];

  /* ==================== عناصر ==================== */
  let overlay, input, listBox, allItems = [], filtered = [], activeIdx = 0;

  function buildUI(){
    if($('#ps-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = 'ps-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="ps-modal">
        <div class="ps-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4-4"/>
          </svg>
          <input type="text" id="ps-input" placeholder="جستجو در صفحات و ابزارها..." autocomplete="off" spellcheck="false">
          <span class="ps-kbd">ESC</span>
        </div>
        <div class="ps-hint">
          <span>↑↓ حرکت</span>
          <span>↵ باز کن</span>
          <span>Ctrl+K باز کردن</span>
        </div>
        <div class="ps-list" id="ps-list"></div>
        <div class="ps-foot">
          <span>💜 پیرامید — پالت فرمان</span>
          <span class="ps-foot-count" id="ps-count"></span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    input = $('#ps-input');
    listBox = $('#ps-list');

    // بایند
    input.addEventListener('input', () => filter(input.value));
    input.addEventListener('keydown', onKeyDown);
    overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
    listBox.addEventListener('click', e => {
      const item = e.target.closest('.ps-item');
      if(!item) return;
      const idx = parseInt(item.dataset.idx, 10);
      if(filtered[idx]) run(filtered[idx]);
    });
    listBox.addEventListener('mousemove', e => {
      const item = e.target.closest('.ps-item');
      if(!item) return;
      const idx = parseInt(item.dataset.idx, 10);
      if(idx !== activeIdx){
        activeIdx = idx;
        updateActive();
      }
    });
  }

  /* ==================== جستجو ==================== */
  function normalize(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[ًٌٍَُِّْ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function findScore(q, item){
    const n = normalize(q);
    if(!n) return 1;

    const title = normalize(item.title);
    const sub = normalize(item.sub);
    const keys = (item.keys || []).map(normalize);

    if(title === n) return 1000;
    if(title.startsWith(n)) return 800;
    if(title.includes(n)) return 600;
    if(keys.some(k => k === n)) return 700;
    if(keys.some(k => k.startsWith(n))) return 500;
    if(sub.includes(n)) return 300;
    if(keys.some(k => k.includes(n))) return 200;

    // fuzzy: هر کاراکتر به ترتیب
    let ti = 0;
    for(const ch of n){
      ti = title.indexOf(ch, ti);
      if(ti === -1) return 0;
      ti++;
    }
    return 50;
  }

  function filter(q){
    const nq = normalize(q);

    const pagesScored = PAGES.map(p => ({ ...p, _score: findScore(q, p), _type:'page' }))
                             .filter(p => p._score > 0);
    const actionsScored = ACTIONS.map(a => ({ ...a, _score: findScore(q, a), _type:'action' }))
                                 .filter(a => a._score > 0);

    pagesScored.sort((a, b) => b._score - a._score);
    actionsScored.sort((a, b) => b._score - a._score);

    filtered = [...pagesScored, ...actionsScored].slice(0, 12);
    activeIdx = 0;
    render();
  }

  /* ==================== رندر ==================== */
  function render(){
    if(filtered.length === 0){
      listBox.innerHTML = `
        <div class="ps-empty">
          <div class="ps-empty-icon">🔍</div>
          <b>چیزی پیدا نشد</b>
          <span>یه کلمه‌ی دیگه امتحان کن</span>
        </div>
      `;
      updateCount();
      return;
    }

    let currentType = '';
    let html = '';
    let realIdx = 0;

    filtered.forEach((item, i) => {
      if(item._type !== currentType){
        currentType = item._type;
        html += `<div class="ps-group">${item._type === 'page' ? '📄 صفحات' : '⚡ ابزارها'}</div>`;
      }
      html += `
        <div class="ps-item ${i === activeIdx ? 'active' : ''}" data-idx="${i}">
          <span class="ps-item-icon">${item.icon}</span>
          <div class="ps-item-text">
            <b>${escapeHtml(item.title)}</b>
            <small>${escapeHtml(item.sub)}</small>
          </div>
          <span class="ps-item-go">↵</span>
        </div>
      `;
    });

    listBox.innerHTML = html;
    updateCount();
  }

  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function updateActive(){
    $$('.ps-item', listBox).forEach(el => {
      const i = parseInt(el.dataset.idx, 10);
      el.classList.toggle('active', i === activeIdx);
    });
    const active = listBox.querySelector('.ps-item.active');
    if(active) active.scrollIntoView({ block:'nearest', behavior:'smooth' });
  }

  function updateCount(){
    const c = $('#ps-count');
    if(c) c.textContent = toFa(filtered.length) + ' نتیجه';
  }

  /* ==================== کلیدها ==================== */
  function onKeyDown(e){
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, filtered.length - 1);
      updateActive();
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      updateActive();
    } else if(e.key === 'Enter'){
      e.preventDefault();
      if(filtered[activeIdx]) run(filtered[activeIdx]);
    } else if(e.key === 'Escape'){
      e.preventDefault();
      close();
    } else if(e.key === 'Tab'){
      e.preventDefault();
      activeIdx = e.shiftKey ? Math.max(0, activeIdx - 1) : Math.min(filtered.length - 1, activeIdx + 1);
      updateActive();
    }
  }

  /* ==================== اجرا ==================== */
  function run(item){
    close();
    setTimeout(() => {
      if(item._type === 'page' && item.url){
        window.location.href = item.url;
      } else if(typeof item.run === 'function'){
        item.run();
      }
    }, 120);
  }

  /* ==================== باز/بسته ==================== */
  let isOpen = false;

  function open(){
    buildUI();
    if(isOpen) return;
    isOpen = true;

    // پیش‌فرض: همه‌ی صفحات
    filter('');
    input.value = '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    setTimeout(() => input.focus(), 80);
  }

  function close(){
    if(!overlay) return;
    isOpen = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggle(){ isOpen ? close() : open(); }

  /* ==================== Global Shortcut ==================== */
  document.addEventListener('keydown', e => {
    // Ctrl+K یا Cmd+K
    if((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')){
      e.preventDefault();
      toggle();
      return;
    }
    // / برای باز کردن (اگه فوکوس روی input نیست)
    if(e.key === '/' && !isOpen){
      const tag = (e.target.tagName || '').toLowerCase();
      const isEditable = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      if(!isEditable){
        e.preventDefault();
        open();
      }
    }
  });

  /* ==================== API عمومی ==================== */
  window.PiramidSearch = { open, close, toggle };

  console.log('%c🔍 Global Search ready (Ctrl+K)', 'color:#e85d9e;font-weight:700;');
})();