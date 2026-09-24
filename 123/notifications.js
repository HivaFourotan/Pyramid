/* ======================================================================
   PIRAMID — notifications.js
   نوتیفیکیشن‌های هوشمند (با Notification API)
   ====================================================================== */
'use strict';

(function(){
  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const setLS = (k, v) => {
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  };

  const pad2 = n => String(n).padStart(2, '0');
  const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

  const Notif = {
    /* ============ وضعیت ============ */
    getSettings(){
      return getLS('piramid_notif_settings', {
        enabled: false,
        reminders: true,      // یادآوری مطالعه
        streak: true,          // هشدار streak
        missions: true,        // مأموریت روزانه
        pomodoro: true,        // اتمام پومودورو
        quiet: true,           // شب‌ها آروم
        interval: 120          // دقیقه بین یادآوری‌ها
      });
    },
    saveSettings(s){
      setLS('piramid_notif_settings', s);
    },

    /* ============ درخواست مجوز ============ */
    async requestPermission(){
      if(!('Notification' in window)){
        return false;
      }
      if(Notification.permission === 'granted') return true;
      if(Notification.permission === 'denied') return false;

      try{
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }catch(e){
        return false;
      }
    },

    isGranted(){
      return ('Notification' in window) && Notification.permission === 'granted';
    },

    /* ============ نمایش ============ */
    show(title, body, options = {}){
      if(!this.isGranted()) return;
      const settings = this.getSettings();
      if(!settings.enabled) return;

      // حالت آروم
      if(settings.quiet){
        const h = new Date().getHours();
        if(h >= 23 || h < 7) return;
      }

      try{
        const notif = new Notification(title, {
          body,
          icon: './icons/icon.svg',
          badge: './icons/icon.svg',
          dir: 'rtl',
          lang: 'fa',
          tag: options.tag || 'piramid',
          renotify: options.renotify !== false,
          vibrate: options.vibrate || [100, 50, 100],
          requireInteraction: options.sticky || false,
          ...options
        });

        notif.onclick = () => {
          window.focus();
          if(options.url) window.location.href = options.url;
          notif.close();
        };

        return notif;
      }catch(e){
        console.warn('Notification error:', e);
      }
    },

    /* ============ یادآوری مطالعه ============ */
    checkReminder(){
      const settings = this.getSettings();
      if(!settings.enabled || !settings.reminders) return;

      const last = getLS('piramid_notif_lastSent', {});
      const now = Date.now();
      const intervalMs = (settings.interval || 120) * 60 * 1000;

      if(last.reminder && (now - last.reminder) < intervalMs) return;

      // چک کن امروز چیزی مطالعه شده
      const sessions = getLS('piramid_sessions', {});
      const today = sessions[dateKey()] || { minutes:0 };
      if(today.minutes >= 120) return; // اگه ۲ ساعت خونده، دیگه یادآوری نکن

      // اگه کاربر الان توی سایت نیست
      if(document.visibilityState === 'visible'){
        last.reminder = now;
        setLS('piramid_notif_lastSent', last);
        return;
      }

      this.show(
        '📚 وقت مطالعه‌ست!',
        today.minutes > 0
          ? `امروز ${today.minutes} دقیقه خوندی، یه کم دیگه ادامه بده؟`
          : 'هنوز امروز شروع نکردی. یه پومودورو بزن؟',
        { tag:'reminder', url:'./dashboard.html' }
      );

      last.reminder = now;
      setLS('piramid_notif_lastSent', last);
    },

    /* ============ هشدار Streak ============ */
    checkStreak(){
      const settings = this.getSettings();
      if(!settings.enabled || !settings.streak) return;

      const last = getLS('piramid_notif_lastSent', {});
      const today = dateKey();
      if(last.streak === today) return;

      const sessions = getLS('piramid_sessions', {});
      const todayData = sessions[today] || { minutes:0 };
      if(todayData.minutes > 0) return; // امروز فعال بوده

      const streak = getLS('piramid_streak', { count:0 });
      if((streak.count || 0) === 0) return;

      const h = new Date().getHours();
      if(h < 18) return; // فقط بعد از ۶ عصر هشدار بده

      this.show(
        '🔥 Streak تو در خطره!',
        `${streak.count} روز پیوسته رو از دست نده. یه پومودورو بزن!`,
        { tag:'streak', url:'./focus-room.html', sticky:true }
      );

      last.streak = today;
      setLS('piramid_notif_lastSent', last);
    },

    /* ============ مأموریت روزانه ============ */
    checkMissions(){
      const settings = this.getSettings();
      if(!settings.enabled || !settings.missions) return;

      const last = getLS('piramid_notif_lastSent', {});
      const today = dateKey();
      if(last.mission === today) return;

      const h = new Date().getHours();
      if(h < 9 || h > 20) return;

      const missions = getLS('piramid_missions', null);
      if(!missions || missions.date !== today) return;
      const doneCount = missions.list.filter(m => m.done).length;
      if(doneCount >= missions.list.length) return;

      this.show(
        '🎯 مأموریت‌های امروز',
        `${doneCount} از ${missions.list.length} مأموریت کامل شده. برو تمومش کن!`,
        { tag:'missions', url:'./journey.html' }
      );

      last.mission = today;
      setLS('piramid_notif_lastSent', last);
    },

    /* ============ پومودورو ============ */
    notifyPomodoroDone(minutes){
      const settings = this.getSettings();
      if(!settings.enabled || !settings.pomodoro) return;

      this.show(
        '🍅 پومودورو تموم شد!',
        `${minutes} دقیقه تمرکز عالی بود. یه استراحت کوتاه بکن.`,
        { tag:'pomodoro', url:'./focus-room.html' }
      );
    },

    /* ============ پیام تست ============ */
    test(){
      if(!this.isGranted()){
        if(window.showToast) window.showToast('اول مجوز بده', 'error');
        return;
      }
      this.show(
        '👋 سلام از پیرامید!',
        'این یه نوتیفیکیشن تستیه. همه‌چیز درسته!',
        { tag:'test' }
      );
    }
  };

  /* ============ لوپ بررسی ============ */
  function startCheckLoop(){
    // هر دقیقه چک کن
    setInterval(() => {
      try{
        Notif.checkReminder();
        Notif.checkStreak();
        Notif.checkMissions();
      }catch(e){}
    }, 60 * 1000);

    // اولین چک بعد از ۳۰ ثانیه
    setTimeout(() => {
      try{
        Notif.checkReminder();
        Notif.checkStreak();
        Notif.checkMissions();
      }catch(e){}
    }, 30 * 1000);
  }

  // وقتی تب دوباره فعال شد
  document.addEventListener('visibilitychange', () => {
    if(!document.hidden){
      try{
        Notif.checkReminder();
        Notif.checkStreak();
        Notif.checkMissions();
      }catch(e){}
    }
  });

  /* ============ API عمومی ============ */
  window.PiramidNotif = Notif;

  // شروع
  if(Notif.getSettings().enabled && Notif.isGranted()){
    startCheckLoop();
    console.log('%c🔔 Notifications active','color:#e85d9e;font-weight:700;');
  } else {
    console.log('%c🔔 Notifications idle (نیاز به فعال‌سازی)','color:#ad9da8;font-weight:600;');
  }

  /* ============ UI: پنل تنظیمات ============ */
  document.addEventListener('DOMContentLoaded', () => {
    // دکمه‌ی شناور برای نوتیفیکیشن
    const btn = document.createElement('button');
    btn.id = 'piramidNotifBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'نوتیفیکیشن');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    `;
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '230px',
      left: '22px',
      zIndex: '999',
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid var(--glass-border)',
      color: 'var(--primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
      transition: 'background .3s, color .3s, transform .3s'
    });
    btn.querySelector('svg').style.width = '22px';
    btn.querySelector('svg').style.height = '22px';

    if(window.innerWidth <= 560){
      btn.style.left = '14px';
      btn.style.bottom = '200px';
      btn.style.width = '46px';
      btn.style.height = '46px';
    }

    // رنگ متفاوت اگه فعاله
    function updateBtnStyle(){
      const s = Notif.getSettings();
      if(s.enabled && Notif.isGranted()){
        btn.style.background = 'linear-gradient(135deg, #e85d9e, #c78ae8)';
        btn.style.color = '#fff';
        btn.style.border = 'none';
      } else {
        btn.style.background = 'var(--glass-bg)';
        btn.style.color = 'var(--primary)';
        btn.style.border = '1px solid var(--glass-border)';
      }
    }
    updateBtnStyle();

    // پنل تنظیمات
    const panel = document.createElement('div');
    panel.id = 'piramidNotifPanel';
    Object.assign(panel.style, {
      position: 'fixed',
      left: '22px',
      bottom: '290px',
      zIndex: '1001',
      width: '320px',
      maxWidth: 'calc(100vw - 44px)',
      padding: '22px',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid var(--glass-border)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,.25)',
      opacity: '0',
      visibility: 'hidden',
      transform: 'translateY(20px) scale(.94)',
      transition: '.4s cubic-bezier(.34,1.4,.5,1)',
      fontFamily: 'inherit',
      color: 'var(--text)'
    });

    if(window.innerWidth <= 560){
      panel.style.left = '14px';
      panel.style.width = 'calc(100vw - 28px)';
      panel.style.bottom = '260px';
    }

    const s = Notif.getSettings();

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:14px;border-bottom:1px dashed var(--border);">
        <b style="font-size:1em;color:var(--text);">🔔 نوتیفیکیشن‌ها</b>
        <button id="piramidNotifClose" type="button" aria-label="بستن" style="width:28px;height:28px;border-radius:50%;background:var(--soft);border:none;color:var(--muted);cursor:pointer;font-family:inherit;">✕</button>
      </div>

      <div id="piramidNotifDenied" style="display:none;padding:12px;border-radius:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);font-size:.82em;line-height:1.8;color:var(--text);margin-bottom:12px;">
        ⚠️ نوتیفیکیشن در مرورگر مسدود شده. برای فعال‌سازی، روی آیکن قفل کنار آدرس بزن و اجازه بده.
      </div>

      <div id="piramidNotifMain" style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:.85em;font-weight:600;">
          <span>فعال باشد</span>
          <button class="pn-toggle ${s.enabled ? 'on' : ''}" id="pnEnabled" type="button" style="position:relative;width:44px;height:24px;border-radius:999px;background:${s.enabled ? 'var(--primary)' : 'var(--border)'};border:none;cursor:pointer;transition:.3s;"></button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;font-size:.85em;font-weight:600;">
          <span>📚 یادآوری مطالعه</span>
          <button class="pn-toggle ${s.reminders ? 'on' : ''}" id="pnReminders" type="button" style="position:relative;width:44px;height:24px;border-radius:999px;background:${s.reminders ? 'var(--primary)' : 'var(--border)'};border:none;cursor:pointer;transition:.3s;"></button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;font-size:.85em;font-weight:600;">
          <span>🔥 هشدار Streak</span>
          <button class="pn-toggle ${s.streak ? 'on' : ''}" id="pnStreak" type="button" style="position:relative;width:44px;height:24px;border-radius:999px;background:${s.streak ? 'var(--primary)' : 'var(--border)'};border:none;cursor:pointer;transition:.3s;"></button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;font-size:.85em;font-weight:600;">
          <span>🎯 مأموریت روزانه</span>
          <button class="pn-toggle ${s.missions ? 'on' : ''}" id="pnMissions" type="button" style="position:relative;width:44px;height:24px;border-radius:999px;background:${s.missions ? 'var(--primary)' : 'var(--border)'};border:none;cursor:pointer;transition:.3s;"></button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;font-size:.85em;font-weight:600;">
          <span>🍅 پومودورو</span>
          <button class="pn-toggle ${s.pomodoro ? 'on' : ''}" id="pnPomodoro" type="button" style="position:relative;width:44px;height:24px;border-radius:999px;background:${s.pomodoro ? 'var(--primary)' : 'var(--border)'};border:none;cursor:pointer;transition:.3s;"></button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;font-size:.85em;font-weight:600;">
          <span>🌙 شب‌ها آروم</span>
          <button class="pn-toggle ${s.quiet ? 'on' : ''}" id="pnQuiet" type="button" style="position:relative;width:44px;height:24px;border-radius:999px;background:${s.quiet ? 'var(--primary)' : 'var(--border)'};border:none;cursor:pointer;transition:.3s;"></button>
        </div>

        <button id="pnTest" type="button" style="padding:10px;border-radius:12px;background:linear-gradient(135deg, #e85d9e, #c78ae8);color:#fff;border:none;font-family:inherit;font-size:.82em;font-weight:700;cursor:pointer;margin-top:6px;">🔔 ارسال نوتیفیکیشن تست</button>
      </div>
    `;

    // استایل toggle
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      #piramidNotifPanel .pn-toggle::after{
        content:"";
        position:absolute;
        top:3px;
        right:3px;
        width:18px;
        height:18px;
        border-radius:50%;
        background:#fff;
        box-shadow:0 2px 6px rgba(0,0,0,.2);
        transition:.3s cubic-bezier(.34,1.4,.5,1);
      }
      #piramidNotifPanel .pn-toggle.on::after{
        transform:translateX(-20px);
      }
    `;
    document.head.appendChild(styleEl);

    document.body.appendChild(panel);
    document.body.appendChild(btn);

    // اگه مجوز رد شده
    if(('Notification' in window) && Notification.permission === 'denied'){
      const denied = panel.querySelector('#piramidNotifDenied');
      if(denied) denied.style.display = 'block';
    }

    // باز/بسته
    let panelOpen = false;
    function openPanel(){
      panel.style.opacity = '1';
      panel.style.visibility = 'visible';
      panel.style.transform = 'translateY(0) scale(1)';
      panelOpen = true;
    }
    function closePanel(){
      panel.style.opacity = '0';
      panel.style.visibility = 'hidden';
      panel.style.transform = 'translateY(20px) scale(.94)';
      panelOpen = false;
    }
    function togglePanel(){
      panelOpen ? closePanel() : openPanel();
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      togglePanel();
    });

    panel.querySelector('#piramidNotifClose')?.addEventListener('click', closePanel);

    document.addEventListener('click', e => {
      if(panelOpen && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)){
        closePanel();
      }
    });

    // toggle buttons
    function bindToggle(id, key){
      const b = panel.querySelector('#' + id);
      if(!b) return;
      b.addEventListener('click', async () => {
        const settings = Notif.getSettings();

        // اگه کلید enabled رو می‌خواد روشن کنه، مجوز بگیر
        if(key === 'enabled' && !settings.enabled){
          const ok = await Notif.requestPermission();
          if(!ok){
            const denied = panel.querySelector('#piramidNotifDenied');
            if(denied) denied.style.display = 'block';
            if(window.showToast) window.showToast('❌ مجوز نوتیفیکیشن رد شد', 'error');
            return;
          }
        }

        settings[key] = !settings[key];
        Notif.saveSettings(settings);

        b.classList.toggle('on', settings[key]);
        b.style.background = settings[key] ? 'var(--primary)' : 'var(--border)';

        updateBtnStyle();

        // اگه روشن شد، لوپ شروع بشه
        if(key === 'enabled' && settings[key]){
          startCheckLoop();
          if(window.showToast) window.showToast('🔔 نوتیفیکیشن فعال شد', 'success');
        }
      });
    }

    bindToggle('pnEnabled', 'enabled');
    bindToggle('pnReminders', 'reminders');
    bindToggle('pnStreak', 'streak');
    bindToggle('pnMissions', 'missions');
    bindToggle('pnPomodoro', 'pomodoro');
    bindToggle('pnQuiet', 'quiet');

    panel.querySelector('#pnTest')?.addEventListener('click', () => {
      Notif.test();
    });
  });

})();