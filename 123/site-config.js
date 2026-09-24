/* ======================================================================
   PIRAMID — site-config.js
   تنظیمات سایت که از پنل مدیر خوانده می‌شه
   ====================================================================== */
'use strict';

(function(){

  const DEFAULTS = {
    siteName: 'پیرامید',
    tagline: 'مسیر کنکورت، دقیق‌تر و زیباتر',
    supportEmail: 'support@piramid.app',
    konkurDate: '2026-07-03', // ISO
    konkurYear: '1405',
    maintenance: false,
    maintenanceMsg: 'پیرامید در حال به‌روزرسانیه. چند دقیقه دیگه برگرد.',
    defaultTheme: 'light',
    defaultPrimary: 0,
    telegram: '',
    instagram: '',
    whatsapp: '',
    announcement: ''
  };

  function getConfig(){
    try{
      const raw = localStorage.getItem('piramid_site_config');
      if(raw){
        return { ...DEFAULTS, ...JSON.parse(raw) };
      }
    }catch(e){}
    return { ...DEFAULTS };
  }

  function saveConfig(partial){
    const current = getConfig();
    const merged = { ...current, ...partial };
    try{ localStorage.setItem('piramid_site_config', JSON.stringify(merged)); }catch(e){}
    applyConfig(merged);
    window.dispatchEvent(new CustomEvent('piramid:config', { detail: merged }));
    return merged;
  }

  /* ==================== اعمال روی صفحه ==================== */
  function applyConfig(cfg){
    cfg = cfg || getConfig();

    // تایتل
    document.title = document.title.replace(/پیرامید/g, cfg.siteName);

    // اسم برند (لوگو)
    document.querySelectorAll('.brand').forEach(b => {
      const span = b.querySelector('span');
      if(span && (span.textContent.trim() === 'پیرامید' || span.textContent.trim() === cfg.siteName)){
        span.textContent = cfg.siteName;
      }
    });

    // لینک‌های شبکه‌های اجتماعی در فوتر
    document.querySelectorAll('.footer-social a').forEach(a => {
      const label = (a.getAttribute('aria-label') || '').toLowerCase();
      if(label.includes('telegram') && cfg.telegram) a.href = cfg.telegram;
      else if(label.includes('instagram') && cfg.instagram) a.href = cfg.instagram;
      else if(label.includes('whatsapp') && cfg.whatsapp) a.href = cfg.whatsapp;
    });

    // ایمیل پشتیبانی در فرم‌ها
    if(cfg.supportEmail){
      document.querySelectorAll('[data-support-email]').forEach(el => {
        el.textContent = cfg.supportEmail;
        if(el.tagName === 'A') el.href = 'mailto:' + cfg.supportEmail;
      });
    }

    // اعلان سراسری
    if(cfg.announcement){
      showAnnouncementBar(cfg.announcement);
    }

    // Maintenance mode
    if(cfg.maintenance){
      const isAdminPage = /auth|admin/.test(location.pathname);
      const isOwner = window.PiramidAuth?.isOwner?.();
      if(!isAdminPage && !isOwner){
        showMaintenance(cfg.maintenanceMsg);
      }
    }
  }

  function showAnnouncementBar(msg){
    if(document.getElementById('piramidGlobalAnnouncement')) return;
    const bar = document.createElement('div');
    bar.id = 'piramidGlobalAnnouncement';
    bar.style.cssText = `
      position:fixed; top:0; left:0; right:0; z-index:9999;
      padding:10px 20px; text-align:center;
      background:linear-gradient(135deg, #e85d9e, #c78ae8);
      color:#fff; font-size:.85em; font-weight:700;
      box-shadow:0 4px 16px rgba(0,0,0,.15);
      display:flex; align-items:center; justify-content:center; gap:12px;
    `;
    bar.innerHTML = `<span>📢 ${msg}</span>`;
    const close = document.createElement('button');
    close.textContent = '✕';
    close.style.cssText = 'background:rgba(255,255,255,.2); border:none; color:#fff; width:24px; height:24px; border-radius:50%; cursor:pointer;';
    close.onclick = () => bar.remove();
    bar.appendChild(close);
    document.body.appendChild(bar);
    document.body.style.paddingTop = '44px';
  }

  function showMaintenance(msg){
    document.documentElement.innerHTML = `
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>به‌زودی برمی‌گردیم | ${getConfig().siteName}</title>
        <style>
          body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
            font-family:Vazirmatn,Tahoma,sans-serif;background:linear-gradient(135deg,#e85d9e,#c78ae8);
            color:#fff;text-align:center;padding:20px;direction:rtl;}
          .box{max-width:480px;}
          .icon{font-size:5em;margin-bottom:20px;animation:float 3s ease-in-out infinite;}
          @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
          h1{font-size:1.8em;margin-bottom:14px;}
          p{font-size:1em;line-height:1.9;opacity:.9;}
        </style>
      </head>
      <body>
        <div class="box">
          <div class="icon">🛠️</div>
          <h1>به‌زودی برمی‌گردیم</h1>
          <p>${msg || getConfig().maintenanceMsg}</p>
        </div>
      </body>
    `;
  }

  /* ==================== تاریخ کنکور ==================== */
  function getKonkurDate(){
    const cfg = getConfig();
    return new Date(cfg.konkurDate + 'T08:00:00');
  }

  /* ==================== API ==================== */
  window.PiramidConfig = {
    get: getConfig,
    save: saveConfig,
    apply: applyConfig,
    getKonkurDate
  };

  /* ==================== اجرا ==================== */
  function init(){
    applyConfig();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('%c⚙️ Site config ready', 'color:#e85d9e;font-weight:700;');
})();