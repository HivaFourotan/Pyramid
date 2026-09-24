/* ======================================================================
   PIRAMID — mobile.js
   تجربه‌ی کامل موبایل و تبلت + حرکات لمسی + نوار ناوبری + FAB
   ====================================================================== */
'use strict';

(function(){
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ==================== تشخیص دستگاه ==================== */
  const UA = navigator.userAgent;

  const DEVICE = {
    isIOS: /iPad|iPhone|iPod/.test(UA) && !window.MSStream,
    isAndroid: /Android/.test(UA),
    isMobile: /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(UA),
    isTouch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  };

  // تبلت = عرض ۶۴۰-۱۰۲۴ + قابلیت لمس
  function checkTablet(){
    const w = window.innerWidth;
    return DEVICE.isTouch && w >= 640 && w <= 1024;
  }

  function checkMobile(){
    return window.innerWidth < 640;
  }

  function applyDeviceClasses(){
    const b = document.body;
    if(!b) return;

    b.classList.toggle('is-ios', DEVICE.isIOS);
    b.classList.toggle('is-android', DEVICE.isAndroid);
    b.classList.toggle('is-touch', DEVICE.isTouch);
    b.classList.toggle('is-mobile', checkMobile());
    b.classList.toggle('is-tablet', checkTablet());
    b.classList.toggle('is-standalone', DEVICE.isStandalone);

    // اگه تبلت با عرض کم و ارتفاع زیاد → پرتره
    const isPortrait = window.innerHeight > window.innerWidth;
    b.classList.toggle('is-portrait', isPortrait);
    b.classList.toggle('is-landscape', !isPortrait);

    // Small tablet (مثل iPad mini portrait)
    const w = window.innerWidth;
    b.classList.toggle('is-small-tablet', w >= 640 && w < 834);
    b.classList.toggle('is-large-tablet', w >= 834 && w <= 1366);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyDeviceClasses);
  } else {
    applyDeviceClasses();
  }

  window.addEventListener('resize', () => {
    clearTimeout(window._piramidResize);
    window._piramidResize = setTimeout(applyDeviceClasses, 150);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(applyDeviceClasses, 300);
  });

  /* ==================== Safe Area Insets ==================== */
  function applySafeArea(){
    const root = document.documentElement;
    // خواندن از CSS env
    const test = document.createElement('div');
    test.style.cssText = 'padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); position:fixed;';
    document.body.appendChild(test);
    const styles = getComputedStyle(test);
    const top = styles.paddingTop || '0px';
    const bottom = styles.paddingBottom || '0px';
    document.body.removeChild(test);

    root.style.setProperty('--safe-top', top);
    root.style.setProperty('--safe-bottom', bottom);
  }
  setTimeout(applySafeArea, 100);

  /* ==================== Bottom Nav Bar ==================== */
  const NAV_ITEMS = [
    { icon:'🏠', label:'خانه',    url:'index.html',           match:'index' },
    { icon:'🎯', label:'داشبورد', url:'dashboard.html',       match:'dashboard' },
    { icon:'🧮', label:'تخمین',   url:'estimate.html',        match:'estimate' },
    { icon:'📓', label:'یادداشت', url:'notes.html',           match:'notes' },
    { icon:'⋯',  label:'بیشتر',   action:'more' }
  ];

  function buildBottomNav(){
    if(!checkMobile() && !checkTablet()) return;
    if($('#pm-bottom-nav')) return;
    if(document.body.classList.contains('fr-body')) return; // اتاق تمرکز نه
    if(document.body.classList.contains('focus-mode')) return;

    const nav = document.createElement('nav');
    nav.id = 'pm-bottom-nav';
    nav.className = 'pm-bottom-nav';
    nav.setAttribute('aria-label', 'ناوبری اصلی');

    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    NAV_ITEMS.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pm-nav-btn';
      const isActive = item.match && currentPage.includes(item.match);
      if(isActive) btn.classList.add('active');

      btn.innerHTML = `
        <span class="pm-nav-icon">${item.icon}</span>
        <span class="pm-nav-label">${item.label}</span>
      `;

      if(item.url){
        btn.addEventListener('click', () => window.location.href = item.url);
      } else if(item.action === 'more'){
        btn.addEventListener('click', () => toggleMoreSheet());
      }

      nav.appendChild(btn);
    });

    document.body.appendChild(nav);
    document.body.classList.add('has-bottom-nav');
  }

  /* ==================== More Sheet (منوی بیشتر) ==================== */
  let moreSheet = null;

  const MORE_ITEMS = [
    { icon:'🃏', label:'فلش‌کارت',   url:'flashcards.html',   color:'#4a90d9' },
    { icon:'📅', label:'برنامه‌ریز', url:'planner.html',      color:'#e8874a' },
    { icon:'🎓', label:'ماشین‌حساب معدل', url:'gpa.html',    color:'#8b5cf6' },
    { icon:'📊', label:'کارنامه',    url:'weekly-report.html', color:'#3bb89a' },
    { icon:'🌟', label:'سفر',        url:'journey.html',      color:'#e5b548' },
    { icon:'👥', label:'حریف مجازی', url:'rival.html',        color:'#df6680' },
    { icon:'🌧', label:'اتاق تمرکز', url:'focus-room.html',   color:'#06b6d4' },
    { icon:'🎬', label:'خاطرات',    url:'memories.html',      color:'#c78ae8' },
    { icon:'💾', label:'پشتیبان',   url:'backup.html',        color:'#ad9da8' },
    { icon:'👤', label:'پروفایل',   url:'account.html',       color:'#e85d9e' }
  ];

  function buildMoreSheet(){
    if(moreSheet) return;

    moreSheet = document.createElement('div');
    moreSheet.id = 'pm-more-sheet';
    moreSheet.className = 'pm-sheet';
    moreSheet.innerHTML = `
      <div class="pm-sheet-backdrop"></div>
      <div class="pm-sheet-content">
        <div class="pm-sheet-handle"></div>
        <div class="pm-sheet-head">
          <h3>ابزارهای بیشتر</h3>
          <button class="pm-sheet-close" aria-label="بستن">✕</button>
        </div>

        <div class="pm-sheet-grid" id="pm-more-grid">
          ${MORE_ITEMS.map(item => `
            <button class="pm-more-item" data-url="${item.url}">
              <span class="pm-more-icon" style="background:${item.color}22;color:${item.color};">${item.icon}</span>
              <span class="pm-more-label">${item.label}</span>
            </button>
          `).join('')}
        </div>

        <div class="pm-sheet-section-title">ابزارهای سریع</div>
        <div class="pm-sheet-quick">
          <button class="pm-quick-btn" data-action="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4-4"/></svg>
            <span>جستجو</span>
          </button>
          <button class="pm-quick-btn" data-action="shortcuts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
            <span>میان‌برها</span>
          </button>
          <button class="pm-quick-btn" data-action="theme">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2"/></svg>
            <span>پنل تم</span>
          </button>
          <button class="pm-quick-btn" data-action="dark-toggle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            <span>روشن/تیره</span>
          </button>
          <button class="pm-quick-btn" data-action="calculator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01"/></svg>
            <span>ماشین‌حساب</span>
          </button>
          <button class="pm-quick-btn" data-action="class">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            <span>کلاس آنلاین</span>
          </button>
          <button class="pm-quick-btn" data-action="chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>پشتیبانی</span>
          </button>
          <button class="pm-quick-btn" data-action="tour">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <span>تور</span>
          </button>
        </div>

        <button class="pm-sheet-fullscreen" data-action="fullscreen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
          <span>تمام‌صفحه</span>
        </button>
      </div>
    `;

    document.body.appendChild(moreSheet);

    // رویدادها
    moreSheet.querySelector('.pm-sheet-backdrop').addEventListener('click', closeMoreSheet);
    moreSheet.querySelector('.pm-sheet-close').addEventListener('click', closeMoreSheet);
    moreSheet.querySelector('.pm-sheet-handle').addEventListener('click', closeMoreSheet);

    moreSheet.querySelectorAll('[data-url]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        closeMoreSheet();
        setTimeout(() => window.location.href = url, 250);
      });
    });

    moreSheet.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        closeMoreSheet();
        setTimeout(() => handleQuickAction(action), 250);
      });
    });

    // Swipe down to close
    setupSheetSwipe();
  }

  function setupSheetSwipe(){
    if(!moreSheet) return;
    const content = moreSheet.querySelector('.pm-sheet-content');
    if(!content) return;

    let startY = 0;
    let currentY = 0;
    let dragging = false;

    content.addEventListener('touchstart', e => {
      if(e.touches.length !== 1) return;
      // فقط از بالا
      const rect = content.getBoundingClientRect();
      const touch = e.touches[0];
      if(touch.clientY - rect.top > 60) return;
      startY = touch.clientY;
      dragging = true;
      content.style.transition = 'none';
    }, { passive:true });

    content.addEventListener('touchmove', e => {
      if(!dragging) return;
      currentY = e.touches[0].clientY;
      const diff = Math.max(0, currentY - startY);
      content.style.transform = `translateY(${diff}px)`;
    }, { passive:true });

    content.addEventListener('touchend', () => {
      if(!dragging) return;
      dragging = false;
      const diff = Math.max(0, currentY - startY);
      content.style.transition = '';
      content.style.transform = '';
      if(diff > 120) closeMoreSheet();
    });
  }

  function openMoreSheet(){
    buildMoreSheet();
    if(!moreSheet) return;
    moreSheet.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMoreSheet(){
    if(!moreSheet) return;
    moreSheet.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleMoreSheet(){
    if(moreSheet && moreSheet.classList.contains('open')) closeMoreSheet();
    else openMoreSheet();
  }

  /* ==================== Quick Actions ==================== */
  function handleQuickAction(action){
    switch(action){
      case 'search':
        if(window.PiramidSearch) window.PiramidSearch.open();
        else if(window.showToast) window.showToast('جستجو در دسترس نیست', 'error');
        break;
      case 'shortcuts':
        if(window.PiramidShortcuts) window.PiramidShortcuts.open();
        break;
      case 'theme':
        $('#themeDrawerBtn')?.click();
        break;
      case 'dark-toggle':
        $('#quickThemeToggle')?.click();
        break;
      case 'calculator':
        $('#calcBtn')?.click();
        break;
      case 'class':
        $('#classBtn')?.click();
        break;
      case 'chat':
        $('#chatToggle')?.click();
        break;
      case 'tour':
        if(window.PiramidTour) window.PiramidTour.start();
        break;
      case 'fullscreen':
        toggleFullscreen();
        break;
    }
  }

  function toggleFullscreen(){
    try{
      if(!document.fullscreenElement && !document.webkitFullscreenElement){
        const el = document.documentElement;
        if(el.requestFullscreen) el.requestFullscreen();
        else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } else {
        if(document.exitFullscreen) document.exitFullscreen();
        else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    }catch(e){}
  }

  /* ==================== Swipe Gestures ==================== */
  function setupSwipes(){
    if(!DEVICE.isTouch) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;

    const EDGE = 40;          // عرض ناحیه‌ی لبه
    const MIN_DISTANCE = 70;  // حداقل فاصله
    const MAX_TIME = 500;     // حداکثر زمان

    document.addEventListener('touchstart', e => {
      if(e.touches.length !== 1) return;
      // اگه توی input بودیم، نگیر
      const tag = e.target.tagName?.toLowerCase();
      if(tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      // اگه شیت بازه، نگیر
      if(moreSheet && moreSheet.classList.contains('open')) return;
      // اگه overlay بازه، نگیر
      if($('#ps-overlay.open') || $('#sc-overlay.open')) return;

      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startTime = Date.now();

      // فقط اگه از لبه شروع شده
      const vw = window.innerWidth;
      tracking = (startX < EDGE) || (startX > vw - EDGE);
    }, { passive:true });

    document.addEventListener('touchend', e => {
      if(!tracking) return;
      tracking = false;

      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = Date.now() - startTime;
      const vw = window.innerWidth;

      if(dt > MAX_TIME) return;
      if(Math.abs(dx) < MIN_DISTANCE) return;
      if(Math.abs(dy) > Math.abs(dx) * 0.7) return; // عمودی رو نگیر

      // از لبه‌ی راست → کشوی تم رو ببند (اگه بازه) یا چیزی باز نکن
      // از لبه‌ی چپ → چت باز بشه
      if(startX < EDGE && dx > MIN_DISTANCE){
        // swipe از چپ به راست → چت
        $('#chatToggle')?.click();
      } else if(startX > vw - EDGE && dx < -MIN_DISTANCE){
        // swipe از راست به چپ → کشوی تم
        $('#themeDrawerBtn')?.click();
      }
    }, { passive:true });
  }

  /* ==================== iOS Input Zoom Fix ==================== */
  function fixIOSZoom(){
    if(!DEVICE.isIOS) return;
    // همه‌ی input ها رو ۱۶px کن
    const style = document.createElement('style');
    style.textContent = `
      input, select, textarea {
        font-size: max(16px, 1em) !important;
      }
    `;
    document.head.appendChild(style);
  }
  fixIOSZoom();

  /* ==================== Double-tap Zoom Prevent ==================== */
  function preventDoubleTapZoom(){
    if(!DEVICE.isTouch) return;
    let lastTouch = 0;
    document.addEventListener('touchend', e => {
      const now = Date.now();
      if(now - lastTouch <= 300){
        const tag = e.target.tagName?.toLowerCase();
        if(tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable){
          e.preventDefault();
        }
      }
      lastTouch = now;
    }, { passive:false });
  }
  preventDoubleTapZoom();

  /* ==================== Viewport Height Fix ==================== */
  // برای حل مشکل 100vh در موبایل
  function setVH(){
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => setTimeout(setVH, 300));

  /* ==================== Page Transition Optimization ==================== */
  // در موبایل بعضی افکت‌ها باید کم‌رنگ‌تر باشن
  if(checkMobile()){
    // کاهش ذرات
    document.addEventListener('DOMContentLoaded', () => {
      // اگه particles روشنه، تعدادش رو کم کن
      const canvas = $('#constellation');
      if(canvas) canvas.style.opacity = '0.35';
    });
  }

  /* ==================== Pull-to-Refresh Blocker ==================== */
  // جلوگیری از pull-to-refresh مرورگر روی کل صفحه
  document.addEventListener('DOMContentLoaded', () => {
    let startY = 0;
    let pulled = false;

    document.addEventListener('touchstart', e => {
      if(window.scrollY === 0 && e.touches.length === 1){
        startY = e.touches[0].clientY;
      }
    }, { passive:true });

    document.addEventListener('touchmove', e => {
      if(window.scrollY === 0 && startY > 0){
        const y = e.touches[0].clientY;
        if(y - startY > 100 && !pulled){
          pulled = true;
          // فقط در صورتی که عنصر اسکرول‌شونده نباشه
        }
      }
    }, { passive:true });

    document.addEventListener('touchend', () => {
      startY = 0;
      pulled = false;
    }, { passive:true });
  });

  /* ==================== Auto Init ==================== */
  function init(){
    buildBottomNav();
    setupSwipes();

    // اگه از موبایل/تبلت هستیم، اطلاعاتی نشون بده (فقط یک بار)
    if((checkMobile() || checkTablet()) && DEVICE.isStandalone){
      console.log('%c📱 حالت اپلیکیشن فعال', 'color:#3bb89a;font-weight:700;');
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // در صورت تغییر اندازه، نوار پایین رو دوباره بساز
  window.addEventListener('resize', () => {
    clearTimeout(window._piramidNavResize);
    window._piramidNavResize = setTimeout(() => {
      const nav = $('#pm-bottom-nav');
      const shouldShow = checkMobile() || checkTablet();
      if(shouldShow && !nav) buildBottomNav();
      if(!shouldShow && nav){
        nav.remove();
        document.body.classList.remove('has-bottom-nav');
      }
    }, 250);
  });

  /* ==================== API عمومی ==================== */
  window.PiramidMobile = {
    device: DEVICE,
    openMore: openMoreSheet,
    closeMore: closeMoreSheet,
    isMobile: checkMobile,
    isTablet: checkTablet
  };

  console.log('%c📱 Mobile enhancements ready', 'color:#e85d9e;font-weight:700;');
})();