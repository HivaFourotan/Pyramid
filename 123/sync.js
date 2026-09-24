/* ======================================================================
   PIRAMID — sync.js
   همگام‌سازی زنده بین تب‌ها + پنجره‌های باز
   ====================================================================== */
'use strict';

(function(){
  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };

  /* ==================== BroadcastChannel ==================== */
  const CHANNEL_NAME = 'piramid_sync';
  let channel = null;

  if('BroadcastChannel' in window){
    try{
      channel = new BroadcastChannel(CHANNEL_NAME);
    }catch(e){}
  }

  /* ==================== همگام‌سازی کلیدها ==================== */
  const SYNC_KEYS = [
    'piramid_user',
    'piramid_role',
    'piramid_xp',
    'piramid_level',
    'piramid_streak',
    'piramid_sessions',
    'piramid_estimates',
    'piramid_theme',
    'piramid_themeMode',
    'piramid_fontSize',
    'piramid_announcements',
    'piramid_missions',
    'piramid_flashcards',
    'piramid_notes',
    'piramid_planner',
    'piramid_capsules'
  ];

  /* ==================== ارسال ==================== */
  function broadcast(type, payload = {}){
    if(channel){
      try{
        channel.postMessage({ type, payload, from: tabId, time: Date.now() });
      }catch(e){}
    }
  }

  /* ==================== دریافت ==================== */
  const tabId = 'tab_' + Math.random().toString(36).slice(2, 9);
  const listeners = {};

  function on(type, cb){
    if(!listeners[type]) listeners[type] = [];
    listeners[type].push(cb);
  }

  function emit(type, data){
    (listeners[type] || []).forEach(cb => {
      try{ cb(data); }catch(e){ console.warn('sync listener error:', e); }
    });
  }

  if(channel){
    channel.addEventListener('message', e => {
      const msg = e.data || {};
      if(msg.from === tabId) return; // خودم فرستادم
      // console.log('📡 دریافت از تب دیگر:', msg.type);
      emit(msg.type, msg.payload);
      emit('*', msg);
    });
  }

  /* ==================== Storage Events (backup) ==================== */
  window.addEventListener('storage', e => {
    if(!e.key) return;
    if(!SYNC_KEYS.includes(e.key)) return;

    let newVal = null;
    try{ newVal = e.newValue ? JSON.parse(e.newValue) : null; }catch(err){}
    const key = e.key.replace('piramid_', '');
    emit('storage', { key: e.key, shortKey: key, value: newVal });
    emit('*', { type: 'storage', payload: { key: e.key, value: newVal } });

    // رویداد خاص برای هر کلید
    emit('storage:' + e.key, newVal);
  });

  /* ==================== XP Change ==================== */
  // Hook روی PiramidXP
  function hookXP(){
    if(!window.PiramidXP) return false;
    if(window.PiramidXP._hooked) return true;
    const originalAdd = window.PiramidXP.add;
    window.PiramidXP.add = function(amount, sourceEl){
      const result = originalAdd.call(this, amount, sourceEl);
      broadcast('xp:change', {
        amount,
        total: window.PiramidXP.get(),
        level: getLS('piramid_level', 1)
      });
      return result;
    };
    window.PiramidXP._hooked = true;
    return true;
  }

  // تلاش برای hook
  if(!hookXP()){
    let tries = 0;
    const iv = setInterval(() => {
      if(hookXP() || ++tries > 30) clearInterval(iv);
    }, 300);
  }

  /* ==================== همگام‌سازی User ==================== */
  function watchUserChange(){
    on('storage:piramid_user', (val) => {
      // اگه تب دیگه‌ای کاربر رو تغییر داد، توی هدر آپدیت کن
      if(window.PiramidAccount && typeof window.PiramidAccount.refresh === 'function'){
        window.PiramidAccount.refresh();
      }
      // Avatar و name آپدیت
      updateHeaderFromStorage();
      emit('user:change', val);
    });
  }

  function updateHeaderFromStorage(){
    const u = getLS('piramid_user', null);
    const av = document.getElementById('headerAvatar');
    const nm = document.getElementById('headerName');
    const rl = document.getElementById('headerRole');

    if(!av || !nm) return;

    if(u && u.username){
      if(u.avatar){
        av.style.backgroundImage = `url(${u.avatar})`;
        av.textContent = '';
      } else {
        av.style.backgroundImage = '';
        av.textContent = (u.displayName || u.username).charAt(0).toUpperCase();
      }
      nm.textContent = u.displayName || u.username;
      if(rl) rl.textContent = u.role === 'owner' ? 'مدیر سیستم' : 'دانش‌آموز';
    } else {
      av.style.backgroundImage = '';
      av.textContent = '؟';
      nm.textContent = 'مهمان';
      if(rl) rl.textContent = 'وارد نشده';
    }
  }

  /* ==================== همگام‌سازی تم ==================== */
  on('storage:piramid_theme', (idx) => {
    if(typeof window.applyTheme === 'function'){
      try{ window.applyTheme(idx); }catch(e){}
    }
  });
  on('storage:piramid_themeMode', (mode) => {
    if(typeof window.applyMode === 'function'){
      try{ window.applyMode(mode); }catch(e){}
    }
  });

  /* ==================== همگام‌سازی آمار ==================== */
  on('storage:piramid_sessions', () => {
    emit('sessions:change');
  });
  on('storage:piramid_estimates', () => {
    emit('estimates:change');
  });
  on('storage:piramid_missions', () => {
    emit('missions:change');
  });

  /* ==================== اطلاع به تب‌های دیگه ==================== */
  function notifyXPChanged(){ broadcast('xp:change', { total: getLS('piramid_xp', 0) }); }
  function notifySessionsChanged(){ broadcast('sessions:change'); }
  function notifyEstimateAdded(data){ broadcast('estimate:added', data); }

  /* ==================== Toast Notification بین تب‌ها ==================== */
  on('toast:broadcast', (data) => {
    if(window.showToast && data){
      window.showToast(data.msg, data.type || 'info', data.duration || 3000);
    }
  });

  function broadcastToast(msg, type, duration){
    broadcast('toast:broadcast', { msg, type, duration });
  }

  /* ==================== API ==================== */
  window.PiramidSync = {
    on,
    emit,
    broadcast,
    broadcastToast,
    notifyXPChanged,
    notifySessionsChanged,
    notifyEstimateAdded,
    get tabId(){ return tabId; }
  };

  /* ==================== شروع ==================== */
  watchUserChange();

  // اولین broadcast: من اومدم
  setTimeout(() => broadcast('tab:hello', { tabId }), 500);

  // روی unload: من رفتم
  window.addEventListener('beforeunload', () => {
    broadcast('tab:bye', { tabId });
  });

  // شمارش تب‌های فعال
  let activeTabs = new Set([tabId]);

  on('tab:hello', (data) => {
    if(data?.tabId) activeTabs.add(data.tabId);
    // منم جواب بدم
    broadcast('tab:hello-back', { tabId });
  });
  on('tab:hello-back', (data) => {
    if(data?.tabId) activeTabs.add(data.tabId);
  });
  on('tab:bye', (data) => {
    if(data?.tabId) activeTabs.delete(data.tabId);
  });

  console.log('%c🔄 Multi-tab sync ready', 'color:#e85d9e;font-weight:700;');
})();