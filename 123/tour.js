/* ======================================================================
   PIRAMID — tour.js
   تور معرفی کاربر جدید — پرگامنت و راهنما
   ====================================================================== */
'use strict';

(function(){
  const $ = (s, c = document) => c.querySelector(s);

  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const setLS = (k, v) => {
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  };

  /* ==================== استپ‌ها ==================== */
  const STEPS = [
    {
      target: null,
      title: '👋 به پیرامید خوش اومدی!',
      text: 'یه دقیقه وقت بذار تا با هم یه تور کوتاه بریم و ببینی همه‌ی امکانات کجاست. حالا شروع کنیم؟',
      position: 'center'
    },
    {
      target: '.brand',
      title: '🏔 پیرامید — خونه‌ی تو',
      text: 'هر وقت خواستی به صفحه‌ی اصلی برگردی، روی لوگو کلیک کن.',
      position: 'bottom'
    },
    {
      target: '.main-nav',
      title: '🧭 منوی اصلی',
      text: 'اینجا همه‌ی بخش‌های مهم مثل «کنکور» و «ابزارها» قرار داره. موس رو روش ببر تا زیرمنو باز بشه.',
      position: 'bottom'
    },
    {
      target: '#accountPill',
      title: '👤 حساب کاربری',
      text: 'اینجا پروفایلت رو می‌بینی: عکس، نام، سن، ایمیل و گرادیان آواتار.',
      position: 'bottom'
    },
    {
      target: '#quickThemeToggle',
      title: '🌗 تغییر سریع تم',
      text: 'با یه کلیک بین حالت روشن و تیره سوییچ کن. برای شخصی‌سازی بیشتر، از پنل تم سمت چپ استفاده کن.',
      position: 'bottom'
    },
    {
      target: '#themeDrawerBtn',
      title: '🎨 پنل تم',
      text: 'اینجا ۱۴ رنگ، افکت‌های بصری (شفق، کریستال، ماه، رعد) و تنظیمات فونت رو داری.',
      position: 'right'
    },
    {
      target: '#calcBtn',
      title: '🧮 ماشین‌حساب',
      text: 'یه ماشین‌حساب ساده و سریع، همیشه دم دست.',
      position: 'right'
    },
    {
      target: '#classBtn',
      title: '🎥 کلاس آنلاین',
      text: 'برای ورود به کلاس آنلاین، این‌جا کد کلاس و نامت رو وارد کن.',
      position: 'right'
    },
    {
      target: '#chatToggle',
      title: '💬 چت پشتیبانی',
      text: 'هر وقت سؤالی داشتی، دستیار هوشمند پیرامید این‌جاست تا کمکت کنه.',
      position: 'left'
    }
  ];

  // استپ‌های مخصوص صفحه‌های دیگر
  const PAGE_TOURS = {
    'dashboard': [
      { target:'.pomo-card', title:'⏱ پومودورو', text:'تایمر تمرکز با سه حالت: ۲۵ دقیقه تمرکز، ۵ و ۱۵ دقیقه استراحت.', position:'bottom' },
      { target:'.today-card', title:'📈 آمار امروز', text:'دقیقه‌ها و جلسات امروزت رو این‌جا ببین. هدف روزانه رو هم می‌تونی تغییر بدی.', position:'bottom' },
      { target:'.week-card', title:'📊 نمودار هفتگی', text:'روند مطالعه‌ی هفت روز گذشته‌ت به‌صورت بصری.', position:'top' },
      { target:'.ach-card', title:'🏆 دستاوردها', text:'با هر فعالیت، بج‌های جدیدی آنلاک می‌شن!', position:'top' }
    ],
    'flashcards': [
      { target:'.fc-stats', title:'📊 آمار کارت‌ها', text:'اینجا می‌بینی چند کارت داری و چندتاشون آماده‌ی مروره.', position:'bottom' },
      { target:'.fc-decks', title:'📚 دسته‌ها', text:'هر دسته مجموعه‌ای از کارت‌هاست. با الگوریتم SM-2 هوشمند مرور می‌شن.', position:'top' }
    ]
  };

  /* ==================== وضعیت ==================== */
  let currentStep = 0;
  let steps = [];
  let overlay, spotlight, tooltip;
  let isActive = false;

  /* ==================== ساخت UI ==================== */
  function buildUI(){
    if($('#tour-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = 'tour-overlay';
    overlay.innerHTML = `
      <div class="tour-spotlight" id="tour-spotlight"></div>
      <div class="tour-tooltip" id="tour-tooltip">
        <div class="tour-tooltip-arrow"></div>
        <span class="tour-step-count" id="tour-count">۱ از ۹</span>
        <h3 class="tour-title" id="tour-title">عنوان</h3>
        <p class="tour-text" id="tour-text">توضیحات</p>
        <div class="tour-actions">
          <div class="tour-dots" id="tour-dots"></div>
          <div class="tour-btns">
            <button class="tour-btn ghost" id="tour-skip-btn" type="button">رد کردن</button>
            <button class="tour-btn primary" id="tour-next" type="button">بعدی →</button>
          </div>
        </div>
      </div>
      <button class="tour-skip" id="tour-close" type="button">✕ بستن تور</button>
    `;
    document.body.appendChild(overlay);

    spotlight = $('#tour-spotlight');
    tooltip = $('#tour-tooltip');

    $('#tour-next')?.addEventListener('click', next);
    $('#tour-skip-btn')?.addEventListener('click', finish);
    $('#tour-close')?.addEventListener('click', finish);

    document.addEventListener('keydown', e => {
      if(!isActive) return;
      if(e.key === 'Escape') finish();
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
    });
  }

  /* ==================== محاسبه موقعیت ==================== */
  function getPageTour(){
    const path = window.location.pathname.split('/').pop().replace('.html', '');
    return PAGE_TOURS[path] || null;
  }

  function showStep(){
    if(currentStep >= steps.length){
      finish();
      return;
    }

    const step = steps[currentStep];
    const targetEl = step.target ? document.querySelector(step.target) : null;

    // اگه target نداره یا پیدا نشد، وسط صفحه
    if(!targetEl){
      spotlight.style.opacity = '0';
      spotlight.style.width = '0';
      spotlight.style.height = '0';
      centerTooltip(step);
    } else {
      spotlight.style.opacity = '1';
      positionSpotlight(targetEl);
      positionTooltip(step, targetEl);
    }

    // محتوا
    $('#tour-count').textContent = toFa(currentStep + 1) + ' از ' + toFa(steps.length);
    $('#tour-title').textContent = step.title;
    $('#tour-text').textContent = step.text;

    // دکمه‌ی بعدی
    const nextBtn = $('#tour-next');
    if(nextBtn){
      nextBtn.textContent = currentStep === steps.length - 1 ? '🎉 تمام!' : 'بعدی →';
    }

    // نقطه‌ها
    const dotsBox = $('#tour-dots');
    if(dotsBox){
      dotsBox.innerHTML = '';
      steps.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'tour-dot' + (i === currentStep ? ' active' : '');
        dotsBox.appendChild(dot);
      });
    }

    // انیمیشن
    setTimeout(() => tooltip.classList.add('show'), 50);
  }

  function toFa(s){
    return String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');
  }

  function positionSpotlight(el){
    const r = el.getBoundingClientRect();
    const pad = 8;
    spotlight.style.left   = (r.left - pad) + 'px';
    spotlight.style.top    = (r.top - pad) + 'px';
    spotlight.style.width  = (r.width + pad * 2) + 'px';
    spotlight.style.height = (r.height + pad * 2) + 'px';
  }

  function positionTooltip(step, el){
    const r = el.getBoundingClientRect();
    const tipW = 340;
    const tipH = 200;
    const gap = 20;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let pos = step.position || 'bottom';
    let top, left, arrow;

    // اگه فضا کمه، جایگزین کن
    if(pos === 'bottom' && r.bottom + tipH + gap > vh) pos = 'top';
    if(pos === 'top' && r.top - tipH - gap < 0) pos = 'bottom';
    if(pos === 'right' && r.right + tipW + gap > vw) pos = 'left';
    if(pos === 'left' && r.left - tipW - gap < 0) pos = 'right';

    switch(pos){
      case 'bottom':
        top = r.bottom + gap;
        left = Math.max(12, Math.min(vw - tipW - 12, r.left + r.width/2 - tipW/2));
        arrow = 'top';
        break;
      case 'top':
        top = r.top - tipH - gap;
        left = Math.max(12, Math.min(vw - tipW - 12, r.left + r.width/2 - tipW/2));
        arrow = 'bottom';
        break;
      case 'right':
        top = Math.max(12, Math.min(vh - tipH - 12, r.top + r.height/2 - tipH/2));
        left = r.right + gap;
        arrow = 'left';
        break;
      case 'left':
        top = Math.max(12, Math.min(vh - tipH - 12, r.top + r.height/2 - tipH/2));
        left = r.left - tipW - gap;
        arrow = 'right';
        break;
    }

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    tooltip.dataset.arrow = arrow;
  }

  function centerTooltip(step){
    const tipW = 380;
    const tipH = 220;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    tooltip.style.top = Math.max(20, (vh - tipH) / 2) + 'px';
    tooltip.style.left = Math.max(20, (vw - tipW) / 2) + 'px';
    tooltip.dataset.arrow = 'none';
  }

  /* ==================== ناوبری ==================== */
  function next(){
    tooltip.classList.remove('show');
    setTimeout(() => {
      currentStep++;
      if(currentStep >= steps.length){
        finish();
        return;
      }
      showStep();
    }, 200);
  }

  function prev(){
    tooltip.classList.remove('show');
    setTimeout(() => {
      currentStep = Math.max(0, currentStep - 1);
      showStep();
    }, 200);
  }

  function finish(){
    if(!isActive) return;
    isActive = false;
    overlay?.classList.remove('open');
    document.body.style.overflow = '';

    // علامت زدن که دیده شده
    setLS('piramid_tour_seen', true);

    if(window.showToast){
      window.showToast('🎉 تور تموم شد! هر وقت خواستی از پنل میان‌برها (? کلید) دوباره بازش کن.', 'success', 5000);
    }
  }

  /* ==================== شروع ==================== */
  function start(force){
    // اگه قبلاً دیده و force نیست، اجرا نکن
    if(!force && getLS('piramid_tour_seen', false)) return;

    buildUI();

    // اگه استپ‌های مخصوص این صفحه وجود داره، اول اجرا کن
    const pageTour = getPageTour();

    // ترتیب: تور صفحه → تور عمومی
    if(pageTour && pageTour.length > 0){
      // فیلتر استپ‌های عمومی به فقط موارد موجود
      const generalFiltered = STEPS.filter(s => !s.target || document.querySelector(s.target));
      steps = [...pageTour, { target:null, title:'✨ ادامه', text:'حالا یه نگاه کلی به بخش‌های اصلی سایت بندازیم.', position:'center' }, ...generalFiltered];
    } else {
      steps = STEPS.filter(s => !s.target || document.querySelector(s.target));
    }

    if(steps.length === 0){
      if(window.showToast) window.showToast('این صفحه تور نداره', 'info');
      return;
    }

    currentStep = 0;
    isActive = true;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    setTimeout(() => showStep(), 300);
  }

  /* ==================== API ==================== */
  window.PiramidTour = {
    start: () => start(true),
    reset: () => { setLS('piramid_tour_seen', false); if(window.showToast) window.showToast('تور ریست شد', 'info'); }
  };

  /* ==================== خودکار ==================== */
  // اگه کاربر لاگین کرد و تور ندیده، ۲ ثانیه بعد شروع کن
  window.addEventListener('load', () => {
    setTimeout(() => {
      const user = getLS('piramid_user', null);
      const seen = getLS('piramid_tour_seen', false);
      // فقط در صفحه‌ی اصلی اگه کاربر لاگین کرده
      if(user && !seen && !window.location.pathname.includes('index') === false){
        start(false);
      }
    }, 2500);
  });

  console.log('%c🎓 Onboarding Tour ready', 'color:#e85d9e;font-weight:700;');
})();