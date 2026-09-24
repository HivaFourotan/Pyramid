/* ======================================================================
   PIRAMID — journey.js
   سیستم گیمیفیکیشن: XP، Level، Rank، Missions، Heatmap، Countdown
   ====================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* =================== ابزارها =================== */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');
  const pad2 = n => String(n).padStart(2, '0');

  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const setLS = (k, v) => {
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  };

  const dateKey = (d = new Date()) => {
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  };

  /* =================== تاریخ کنکور =================== */
  // تاریخ کنکور ۱۴۰۵ — حدوداً (می‌تونی بعداً تغییر بدی)
  const KONKUR_DATE = new Date('2026-07-03T08:00:00'); // ۱۲ تیر ۱۴۰۵

  /* =================== تعریف رتبه‌ها =================== */
  const RANKS = [
    { id:'novice',   min:0,    max:500,   icon:'🥚', name:'نوآموز',     color:'#ad9da8' },
    { id:'striver',  min:500,  max:1500,  icon:'🌱', name:'کوشا',       color:'#3bb89a' },
    { id:'student',  min:1500, max:3500,  icon:'⚔️', name:'کنکوری',    color:'#4a90d9' },
    { id:'achiever', min:3500, max:7000,  icon:'🏆', name:'رتبه‌ساز',  color:'#e8874a' },
    { id:'legend',   min:7000, max:Infinity, icon:'👑', name:'افسانه',  color:'#e5b548' }
  ];

  function getRankByXP(xp){
    for(const r of RANKS) if(xp >= r.min && xp < r.max) return r;
    return RANKS[RANKS.length - 1];
  }

  /* =================== ذخیره‌سازی =================== */
  const STORE = {
    xp:        'piramid_xp',
    level:     'piramid_level',
    missions:  'piramid_missions',
    lastLogin: 'piramid_last_login',
    xpLog:     'piramid_xp_log',  // { 'YYYY-MM-DD': xpEarnedToday }
    newRank:   'piramid_rank_seen'
  };

  let xp        = getLS(STORE.xp, 0) || 0;
  let level     = getLS(STORE.level, 1) || 1;
  let missions  = getLS(STORE.missions, null);
  let lastLogin = getLS(STORE.lastLogin, null);
  let xpLog     = getLS(STORE.xpLog, {}) || {};

  function saveXP(){ setLS(STORE.xp, xp); }
  function saveLevel(){ setLS(STORE.level, level); }
  function saveMissions(){ setLS(STORE.missions, missions); }
  function saveLogin(){ setLS(STORE.lastLogin, lastLogin); }
  function saveXpLog(){ setLS(STORE.xpLog, xpLog); }

  /* =================== فرمول Level =================== */
  // سطح n نیاز به 100 * n XP اضافه داره
  // سطح ۱ → 0
  // سطح ۲ → 100
  // سطح ۳ → 300
  // سطح ۴ → 600
  // سطح ۵ → 1000
  // ... (n*(n+1)/2 * 100)
  function xpForLevel(lv){
    return (lv * (lv - 1) / 2) * 100;
  }
  function levelFromXP(xp){
    let lv = 1;
    while(xpForLevel(lv + 1) <= xp) lv++;
    return lv;
  }

  /* =================== XP Pop Animation =================== */
  function showXPPop(amount, sourceEl){
    const pop = document.createElement('div');
    pop.className = 'jn-xp-pop';
    pop.textContent = '+' + toFa(amount) + ' XP';

    let x = window.innerWidth / 2;
    let y = 200;
    if(sourceEl){
      const r = sourceEl.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top;
    }
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1400);
  }

  /* =================== Level Up =================== */
  function triggerLevelUp(newLevel, newRank){
    const overlay = $('#jnLevelUp');
    if(!overlay) return;

    $('#jnLuLevel').textContent = toFa(newLevel);
    $('#jnLuRank').textContent = newRank.icon + ' ' + newRank.name;
    $('#jnLuIcon').textContent = newRank.icon;

    const messages = [
      'آفرین! داری پیشرفت می‌کنی 💪',
      'عالی بود! یه قدم دیگه به رویات نزدیک‌تر شدی ✨',
      'همینطور ادامه بده، داری می‌درخشی! 🌟',
      'قهرمان! این روند رو حفظ کن 🚀',
      'داری مثل یه حرفه‌ای پیش می‌ری 🔥'
    ];
    $('#jnLuMsg').textContent = messages[Math.floor(Math.random() * messages.length)];

    overlay.classList.add('show');

    // صدای Level Up
    playLevelUpSound();

    // کانفتی
    if(window.fireConfetti){
      setTimeout(() => {
        window.fireConfetti(window.innerWidth / 2, window.innerHeight / 2 - 100);
      }, 200);
    }

    setTimeout(() => {
      overlay.classList.remove('show');
    }, 4200);
  }

  function playLevelUpSound(){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      const ctx = new AC();
      // آرپژ صعودی
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        const t = ctx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.start(t);
        o.stop(t + 0.45);
      });
      setTimeout(() => { try{ ctx.close(); }catch(e){} }, 2000);
    }catch(e){}
  }
  /* =================== اتصال به موتور XP =================== */
  function addXP(amount, sourceEl){
    if(!amount) return;
    if(window.PiramidXP && window.PiramidXP.add){
      window.PiramidXP.add(amount, sourceEl);
      setTimeout(() => {
        xp = window.PiramidXP.get();
        level = window.PiramidXP.getLevel();
        refreshHero();
      }, 150);
    }
  }
  /* =================== MISSION SYSTEM =================== */
  // قالب مأموریت‌ها
  const MISSION_TEMPLATES = [
    { id:'m_focus_25', icon:'🍅', title:'یه پومودورو کامل بزن', desc:'۲۵ دقیقه تمرکز بی‌وقفه', reward:50, target:1, type:'sessions' },
    { id:'m_study_30', icon:'⏱', title:'۳۰ دقیقه مطالعه', desc:'هر مطالعه‌ای حساب می‌شه', reward:50, target:30, type:'minutes' },
    { id:'m_study_60', icon:'💪', title:'یک ساعت مطالعه', desc:'امروز یه ساعت بخون', reward:80, target:60, type:'minutes' },
    { id:'m_study_90', icon:'🔥', title:'۹۰ دقیقه تمرکز', desc:'سخت‌کوشی امروز', reward:100, target:90, type:'minutes' },
    { id:'m_cards_10', icon:'🃏', title:'۱۰ فلش‌کارت مرور کن', desc:'از فلش‌کارت‌ها استفاده کن', reward:50, target:10, type:'cards' },
    { id:'m_cards_25', icon:'📚', title:'۲۵ فلش‌کارت', desc:'حافظه‌ت رو قوی کن', reward:80, target:25, type:'cards' },
    { id:'m_estimate', icon:'🧮', title:'یه تخمین جدید بزن', desc:'تراز و رتبه‌ت رو بسنج', reward:50, target:1, type:'estimates' },
    { id:'m_2_sessions', icon:'🎯', title:'۲ جلسه تمرکز', desc:'دو تا پومودورو', reward:80, target:2, type:'sessions' },
    { id:'m_3_sessions', icon:'⚡', title:'۳ جلسه تمرکز', desc:'یه روز پربار', reward:120, target:3, type:'sessions' },
    { id:'m_no_skip', icon:'🌟', title:'امروز رو از دست نده', desc:'یه فعالیتی انجام بده', reward:40, target:1, type:'any' }
  ];

  function generateDailyMissions(){
    // هر روز ساعت ۶ صبح ریست می‌شه
    const now = new Date();
    const todayKey = dateKey(now);

    if(missions && missions.date === todayKey) return; // امروز قبلاً تولید شده

    // شافل و انتخاب ۳ تا
    const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 3);

    missions = {
      date: todayKey,
      list: picked.map(m => ({
        ...m,
        progress: 0,
        done: false,
        claimed: false
      }))
    };
    saveMissions();
  }

  function updateMissionProgress(type, amount){
    if(window.PiramidMissions && window.PiramidMissions.update){
      window.PiramidMissions.update(type, amount);
      window.PiramidMissions.claim();
    }
    missions = window.PiramidMissions ? window.PiramidMissions.get() : missions;
    refreshMissions();
  }

  // شنونده‌ی رویدادهای سیستم
  window.addEventListener('piramid:study', e => {
    const d = e.detail || {};
    if(d.minutes) updateMissionProgress('minutes', d.minutes);
    if(d.sessions) updateMissionProgress('sessions', d.sessions);
  });
  window.addEventListener('piramid:cards', e => {
    const d = e.detail || {};
    if(d.count) updateMissionProgress('cards', d.count);
  });
  window.addEventListener('piramid:estimate', () => {
    updateMissionProgress('estimates', 1);
  });

  /* =================== رندر مأموریت‌ها =================== */
  function refreshMissions(){
    generateDailyMissions();

    const box = $('#jnMissionList');
    const meta = $('#jnMissionMeta');
    if(!box || !missions) return;

    box.innerHTML = '';
    let doneCount = 0;

    missions.list.forEach(m => {
      if(m.done) doneCount++;

      const el = document.createElement('div');
      el.className = 'jn-mission' + (m.done ? ' done' : '');
      const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
      el.innerHTML = `
        <div class="jn-mission-check">${m.icon}</div>
        <div class="jn-mission-info">
          <b>${m.title}</b>
          <span>${m.desc} • ${toFa(m.progress)}/${toFa(m.target)}</span>
        </div>
        <div class="jn-mission-reward">+${toFa(m.reward)} XP</div>
        <div class="jn-mission-progress" style="width:${pct}%"></div>
      `;
      box.appendChild(el);
    });

    if(meta) meta.textContent = `${toFa(doneCount)} از ${toFa(missions.list.length)} کامل شده`;

    // auto-claim رو به موتور ماموریت بسپار
    if(window.PiramidMissions && window.PiramidMissions.claim){
      window.PiramidMissions.claim();
    }
    // اطلاعات رو دوباره از موتور بخون
    missions = window.PiramidMissions ? window.PiramidMissions.get() : missions;
  }

  /* =================== شمارش معکوس =================== */
  function tickCountdown(){
    const now = new Date();
    let diff = Math.floor((KONKUR_DATE - now) / 1000);
    if(diff < 0) diff = 0;

    const days  = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins  = Math.floor((diff % 3600) / 60);
    const secs  = diff % 60;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if(el) el.textContent = toFa(pad2(val));
    };
    set('cdDays', days);
    set('cdHours', hours);
    set('cdMins', mins);
    set('cdSecs', secs);

    // Hint پویا
    const hint = $('#jnCdHint');
    if(hint){
      if(days > 200) hint.textContent = 'هنوز وقت زیادیه، با آرامش پیش برو 🌱';
      else if(days > 100) hint.textContent = 'داری جلو می‌ری، همینطور ادامه بده 💪';
      else if(days > 30) hint.textContent = 'داریم نزدیک می‌شیم، تمرکزت رو بالا ببر 🔥';
      else if(days > 7) hint.textContent = 'وقت طلاییه، از هر دقیقه استفاده کن ⚡';
      else hint.textContent = 'هفته‌ی آخر! تو می‌تونی قهرمان 🏆';
    }
  }

  /* =================== Heatmap =================== */
  function refreshHeatmap(){
    const grid = $('#jnHeatGrid');
    if(!grid) return;
    grid.innerHTML = '';

    const sessions = getLS('piramid_sessions', {}) || {};

    // ۹۰ روز اخیر
    const today = new Date();
    const days = [];
    let totalMin = 0;
    let activeDays = 0;
    let best = 0;

    for(let i = 89; i >= 0; i--){
      const d = new Date();
      d.setDate(today.getDate() - i);
      const k = dateKey(d);
      const data = sessions[k] || { minutes:0, sessions:0 };
      days.push({
        date: d,
        key: k,
        minutes: data.minutes || 0,
        isToday: i === 0
      });
      totalMin += data.minutes || 0;
      if(data.minutes > 0) activeDays++;
      if((data.minutes || 0) > best) best = data.minutes;
    }

    // تعیین سطح
    function levelOf(min){
      if(min === 0) return 0;
      if(min < 30) return 1;
      if(min < 60) return 2;
      if(min < 120) return 3;
      return 4;
    }

    days.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'jn-heat-cell' + (day.isToday ? ' today' : '');
      const lvl = levelOf(day.minutes);
      cell.dataset.lvl = lvl;
      const dateStr = day.date.toLocaleDateString('fa-IR');
      cell.title = `${dateStr} — ${toFa(day.minutes)} دقیقه`;
      grid.appendChild(cell);
    });

    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = toFa(v); };
    set('jnHeatTotal', totalMin);
    set('jnHeatActive', activeDays);
    set('jnHeatBest', best);
  }

  /* =================== Hero =================== */
  function refreshHero(){
    const rank = getRankByXP(xp);
    const currentLevelStart = xpForLevel(level);
    const nextLevelStart = xpForLevel(level + 1);
    const xpInLevel = xp - currentLevelStart;
    const xpNeeded = nextLevelStart - currentLevelStart;
    const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

    const setText = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
    setText('jnLevel', toFa(level));
    setText('jnXP', toFa(xp));
    setText('jnRankIcon', rank.icon);
    setText('jnRankName', rank.name);
    setText('jnXpHint', `${toFa(xpNeeded - xpInLevel)} XP تا سطح بعدی`);

    const fill = $('#jnXpFill');
    if(fill) fill.style.width = pct + '%';

    // Greeting
    const g = $('#jnGreeting');
    if(g){
      const h = new Date().getHours();
      let greet = 'سلام';
      if(h < 5) greet = 'شب‌زنده‌داری';
      else if(h < 12) greet = 'صبح بخیر';
      else if(h < 17) greet = 'ظهر بخیر';
      else if(h < 20) greet = 'عصر بخیر';
      else greet = 'شب بخیر';

      let name = '';
      try{
        const u = JSON.parse(localStorage.getItem('piramid_user') || 'null');
        if(u && (u.displayName || u.username)) name = '، ' + (u.displayName || u.username);
      }catch(e){}
      g.textContent = `${greet}${name}! 👋`;
    }

    // Streak از داشبورد
    const streakData = getLS('piramid_streak', { count:0 }) || { count:0 };
    setText('jnStreakDays', toFa(streakData.count || 0));

    // رنگ‌بندی بر اساس رنک
    const iconEl = $('#jnRankIcon');
    if(iconEl) iconEl.style.filter = `drop-shadow(0 4px 16px ${rank.color}88)`;
  }

  /* =================== ورود روزانه =================== */
  function checkDailyLogin(){
    const today = dateKey();
    if(lastLogin === today) return;

    lastLogin = today;
    saveLogin();

    // پاداش ورود
    setTimeout(() => {
      addXP(5);
      if(window.showToast){
        window.showToast('📅 +۵ XP بابت ورود امروز', 'success', 3000);
      }
    }, 800);
  }

  /* =================== شروع =================== */
  generateDailyMissions();
  refreshHero();
  refreshMissions();
  refreshHeatmap();
  tickCountdown();
  setInterval(tickCountdown, 1000);
  checkDailyLogin();

  // تشخیص فعالیت از سایر صفحات (اگر data در localStorage آپدیت شد)
  // در صورت لزوم هر ۳۰ ثانیه refresh می‌کنیم
  setInterval(() => {
    refreshHeatmap();
    refreshHero();
  }, 30000);

  console.log('%c🌟 Piramid Journey ready','color:#e85d9e;font-weight:700;font-size:13px;');
});