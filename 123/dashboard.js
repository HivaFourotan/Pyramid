/* ======================================================================
   PIRAMID — dashboard.js
   تایمر پومودورو + آمار + streak + دستاوردها + تاریخچه تخمین
   ====================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* =================== ابزارها =================== */
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const $  = (s, c = document) => c.querySelector(s);

  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');
  const pad2 = n => String(n).padStart(2, '0');

  const getLS = (k, d = null) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const setLS = (k, v) => {
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  };

  const dateKey = (d = new Date()) => {
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  };

  /* =================== ذخیره‌سازی =================== */
  const STORE = {
    sessions: 'piramid_sessions',   // { 'YYYY-MM-DD': { minutes, sessions } }
    goal:     'piramid_daily_goal', // number (minutes)
    streak:   'piramid_streak',     // { count, lastDate }
    badges:   'piramid_ach'         // array of badge ids
  };

  let sessionsData = getLS(STORE.sessions, {}) || {};
  let dailyGoal    = getLS(STORE.goal, 120) || 120;
  let streakData   = getLS(STORE.streak, { count:0, lastDate:null }) || { count:0, lastDate:null };
  let unlocked     = getLS(STORE.badges, []) || [];

  function saveSessions(){ setLS(STORE.sessions, sessionsData); }
  function saveGoal(){ setLS(STORE.goal, dailyGoal); }
  function saveStreak(){ setLS(STORE.streak, streakData); }
  function saveBadges(){ setLS(STORE.badges, unlocked); }

  /* =================== تاریخ و greeting =================== */
  function setupHeader(){
    const d = new Date();
    const dateStr = d.toLocaleDateString('fa-IR', {
      weekday:'long', year:'numeric', month:'long', day:'numeric'
    });
    const dateEl = $('#dashDate');
    if(dateEl) dateEl.textContent = dateStr;

    const h = d.getHours();
    let greet = 'سلام';
    if(h < 5) greet = 'شب‌زنده‌داری';
    else if(h < 12) greet = 'صبح بخیر';
    else if(h < 17) greet = 'ظهر بخیر';
    else if(h < 20) greet = 'عصر بخیر';
    else greet = 'شب بخیر';

    let name = 'دوست من';
    try{
      const u = JSON.parse(localStorage.getItem('piramid_user') || 'null');
      if(u && (u.displayName || u.username)) name = u.displayName || u.username;
    }catch(e){}

    const gEl = $('#dashGreeting');
    if(gEl) gEl.textContent = `${greet}، ${name}! 👋`;

    const sEl = $('#dashSubtitle');
    if(sEl){
      const today = sessionsData[dateKey()] || { minutes:0, sessions:0 };
      if(today.minutes === 0) sEl.textContent = 'امروز چه خبره؟ آماده‌ای یه رکورد بزنی؟';
      else if(today.minutes < dailyGoal) sEl.textContent = `تا الان ${toFa(today.minutes)} دقیقه مطالعه کردی، ادامه بده! 💪`;
      else sEl.textContent = `واو! امروز ${toFa(today.minutes)} دقیقه خوندی، عالیه! 🎉`;
    }
  }

  /* =================== تایمر پومودورو =================== */
  const POMO = {
    focus: 25 * 60,
    short: 5 * 60,
    long:  15 * 60
  };
  let mode = 'focus';
  let totalSeconds = POMO.focus;
  let remaining = totalSeconds;
  let timerId = null;
  let running = false;

  const CIRCUMFERENCE = 2 * Math.PI * 100; // r=100

  function fmtTime(sec){
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return toFa(pad2(m) + ':' + pad2(s));
  }

  function updateRing(){
    const fg = $('#pomoFg');
    if(!fg) return;
    const ratio = remaining / totalSeconds;
    fg.style.strokeDasharray = CIRCUMFERENCE;
    fg.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);
  }

  function updateTime(){
    const el = $('#pomoTime');
    if(el) el.textContent = fmtTime(remaining);
    updateRing();
  }

  function setLabel(txt){
    const l = $('#pomoLabel');
    if(l) l.textContent = txt;
  }

  function setHint(txt){
    const h = $('#pomoHint');
    if(h) h.textContent = txt;
  }

  function playBeep(){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      const ctx = new AC();
      const play = (freq, start, dur) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0, ctx.currentTime + start);
        g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };
      play(880, 0, 0.18);
      play(1100, 0.22, 0.18);
      play(1320, 0.44, 0.32);
      setTimeout(() => { try{ ctx.close(); }catch(e){} }, 1500);
    }catch(e){}
  }

  function completeSession(){
    const minutes = Math.round(totalSeconds / 60);

    if(mode === 'focus'){
      // ثبت جلسه فقط برای تمرکز
      const k = dateKey();
      if(!sessionsData[k]) sessionsData[k] = { minutes:0, sessions:0 };
      sessionsData[k].minutes += minutes;
      sessionsData[k].sessions += 1;
      saveSessions();

      // به‌روزرسانی streak
      const today = k;
      if(streakData.lastDate !== today){
        const y = new Date(); y.setDate(y.getDate() - 1);
        const yKey = dateKey(y);
        if(streakData.lastDate === yKey) streakData.count += 1;
        else streakData.count = 1;
        streakData.lastDate = today;
        saveStreak();
      }

      playBeep();
      window.showToast && window.showToast(`🎉 ${toFa(minutes)} دقیقه تمرکز کامل شد!`, 'success', 4000);
      refreshAll();
      checkBadges();
      // XP برای سشن کامل
      if(window.PiramidXP){
        window.PiramidXP.add(15);
        window.dispatchEvent(new CustomEvent('piramid:study', {
          detail:{ sessions:1, minutes }
        }));
      }
      // پیشنهاد استراحت
      setHint('وقت استراحته! ۵ دقیقه نفس بکش ☕');
    } else {
      playBeep();
      window.showToast && window.showToast('☕ استراحت تموم شد، برگرد به تمرکز!', 'info');
      setHint('بریم برای یه جلسه‌ی تمرکز جدید؟');
    }

    running = false;
    clearInterval(timerId);
    timerId = null;
    remaining = totalSeconds;
    updateTime();
    updateStartBtn();
  }

  function tick(){
    remaining--;
    if(remaining <= 0){
      remaining = 0;
      updateTime();
      completeSession();
      return;
    }
    updateTime();
  }

  function startTimer(){
    if(running) return;
    running = true;
    setLabel('در حال اجرا');
    updateStartBtn();
    tick(); // برای اینکه فوراً شروع کنه
    timerId = setInterval(tick, 1000);
  }

  function pauseTimer(){
    if(!running) return;
    running = false;
    clearInterval(timerId);
    timerId = null;
    setLabel('متوقف');
    updateStartBtn();
  }

  function resetTimer(){
    running = false;
    clearInterval(timerId);
    timerId = null;
    remaining = totalSeconds;
    updateTime();
    setLabel('آماده');
    updateStartBtn();
  }

  function updateStartBtn(){
    const b = $('#pomoStart');
    const card = $('.pomo-card');
    if(!b) return;
    if(running){
      b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg> توقف';
      if(card) card.classList.add('running');
    } else {
      b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> شروع';
      if(card) card.classList.remove('running');
    }
  }

  function setMode(m){
    mode = m;
    totalSeconds = POMO[m];
    remaining = totalSeconds;
    $$('.pomo-mode').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
    updateTime();
    setLabel('آماده');
    resetTimer();
    if(m === 'focus') setHint('۲۵ دقیقه تمرکز عمیق. گوشی رو بذار کنار 📵');
    else if(m === 'short') setHint('۵ دقیقه استراحت. بلند شو، آب بخور 💧');
    else setHint('۱۵ دقیقه استراحت طولانی. یه چرت کوتاه بزن 😴');
  }

  function bindPomodoro(){
    const startBtn = $('#pomoStart');
    const resetBtn = $('#pomoReset');
    if(startBtn){
      startBtn.addEventListener('click', () => {
        running ? pauseTimer() : startTimer();
      });
    }
    if(resetBtn) resetBtn.addEventListener('click', resetTimer);

    $$('.pomo-mode').forEach(b => {
      b.addEventListener('click', () => setMode(b.dataset.mode));
    });

    // مقدار اولیه
    remaining = totalSeconds;
    updateTime();
    setLabel('آماده');
    updateStartBtn();
  }

  /* =================== آمار و نمودار =================== */
  const WEEKDAYS = ['یک','دو','سه','چهار','پنج','جمعه','شنبه'];
  const FA_WEEK = ['شنبه','یک‌شنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه'];

  function refreshToday(){
    const t = sessionsData[dateKey()] || { minutes:0, sessions:0 };
    const m = $('#todayMinutes'); if(m) m.textContent = toFa(t.minutes);
    const s = $('#todaySessions'); if(s) s.textContent = toFa(t.sessions);

    const percent = Math.min(100, Math.round((t.minutes / dailyGoal) * 100));
    const fill = $('#goalFill'); if(fill) fill.style.width = percent + '%';
    const pEl = $('#goalPercent'); if(pEl) pEl.textContent = toFa(percent) + '٪';
    const gV = $('#goalValue'); if(gV) gV.textContent = toFa(dailyGoal) + ' دقیقه';
  }

  function refreshWeek(){
    const chart = $('#weekChart');
    if(!chart) return;
    chart.innerHTML = '';

    const today = new Date();
    const days = [];
    let total = 0;

    for(let i = 6; i >= 0; i--){
      const d = new Date();
      d.setDate(today.getDate() - i);
      const k = dateKey(d);
      const data = sessionsData[k] || { minutes:0, sessions:0 };
      days.push({
        date: d,
        key: k,
        minutes: data.minutes,
        label: FA_WEEK[d.getDay()],
        isToday: i === 0
      });
      total += data.minutes;
    }

    const max = Math.max(...days.map(d => d.minutes), dailyGoal, 30);

    days.forEach(day => {
      const bar = document.createElement('div');
      bar.className = 'week-bar' + (day.isToday ? ' today' : '');
      const heightPct = Math.max(2, (day.minutes / max) * 100);
      bar.innerHTML = `
        <div class="week-bar-fill ${day.isToday ? 'today' : ''}"
             style="height:${heightPct}%"
             data-v="${toFa(day.minutes)} دقیقه"></div>
        <div class="week-bar-label">${day.label}</div>
      `;
      chart.appendChild(bar);
    });

    const wT = $('#weekTotal'); if(wT) wT.textContent = toFa(total);
  }

  function refreshStreak(){
    // اگه امروز هم فعال بوده، یا دیروز، streak معتبره
    const today = dateKey();
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yKey = dateKey(y);

    if(streakData.lastDate && streakData.lastDate !== today && streakData.lastDate !== yKey){
      // streak شکسته شده
      streakData.count = 0;
      saveStreak();
    }

    const el = $('#dashStreak');
    if(el) el.textContent = toFa(streakData.count);
  }

  /* =================== دستاوردها =================== */
  const BADGES = [
    { id:'first_session', icon:'🌱', title:'اولین قدم',  desc:'اولین جلسه‌ی مطالعه',
      check:() => totalSessions() >= 1 },
    { id:'hour',          icon:'⏰', title:'یک ساعت',     desc:'۶۰ دقیقه مطالعه',
      check:() => totalMinutes() >= 60 },
    { id:'five_hours',    icon:'💪', title:'۵ ساعت',       desc:'۳۰۰ دقیقه مطالعه',
      check:() => totalMinutes() >= 300 },
    { id:'ten_hours',     icon:'🎯', title:'۱۰ ساعت',      desc:'۶۰۰ دقیقه مطالعه',
      check:() => totalMinutes() >= 600 },
    { id:'streak3',       icon:'🔥', title:'۳ روز',        desc:'۳ روز متوالی',
      check:() => streakData.count >= 3 },
    { id:'streak7',       icon:'⚡', title:'یه هفته',      desc:'۷ روز متوالی',
      check:() => streakData.count >= 7 },
    { id:'goal_hit',      icon:'🎯', title:'هدف‌زن',       desc:'رسیدن به هدف روزانه',
      check:() => {
        const t = sessionsData[dateKey()];
        return t && t.minutes >= dailyGoal;
      } },
    { id:'estimate',      icon:'🧮', title:'تخمین‌زن',    desc:'اولین تخمین',
      check:() => (getLS('piramid_estimates', []) || []).length >= 1 }
  ];

  function totalMinutes(){
    return Object.values(sessionsData).reduce((s, d) => s + (d.minutes || 0), 0);
  }
  function totalSessions(){
    return Object.values(sessionsData).reduce((s, d) => s + (d.sessions || 0), 0);
  }

  function renderBadges(){
    const grid = $('#achGrid');
    if(!grid) return;
    grid.innerHTML = '';

    BADGES.forEach(b => {
      const el = document.createElement('div');
      const isOn = unlocked.includes(b.id);
      el.className = 'ach-item' + (isOn ? ' unlocked' : '');
      el.innerHTML = `
        <div class="ach-icon">${b.icon}</div>
        <b>${b.title}</b>
        <span>${b.desc}</span>
      `;
      grid.appendChild(el);
    });
  }

  function checkBadges(){
    let changed = false;
    BADGES.forEach(b => {
      if(!unlocked.includes(b.id) && b.check()){
        unlocked.push(b.id);
        changed = true;
        window.showToast && window.showToast(`🏆 دستاورد جدید: ${b.title}`, 'success', 4000);
      }
    });
    if(changed){
      saveBadges();
      renderBadges();
    }
  }

  /* =================== تاریخچه تخمین =================== */
  const MAJOR_ICONS = {
    tajrobi:'🧬', riazi:'📐', ensani:'📚', honar:'🎨', savabegh:'📊'
  };

  function renderHistory(){
    const list = $('#histList');
    if(!list) return;
    const est = getLS('piramid_estimates', []) || [];

    if(est.length === 0){
      list.innerHTML = '<p class="empty-msg">هنوز تخمینی ثبت نکردی. برو یه تخمین بزن! 🚀</p>';
      return;
    }

    list.innerHTML = '';
    est.slice().reverse().slice(0, 8).forEach(item => {
      const icon = MAJOR_ICONS[item.major] || '📘';
      const d = new Date(item.date || Date.now());
      const dateStr = d.toLocaleDateString('fa-IR');
      const timeStr = toFa(pad2(d.getHours()) + ':' + pad2(d.getMinutes()));

      const el = document.createElement('div');
      el.className = 'hist-item';
      el.innerHTML = `
        <div class="hist-icon">${icon}</div>
        <div class="hist-info">
          <b>تخمین کنکور ${majorName(item.major)}</b>
          <small>${dateStr} • ساعت ${timeStr}</small>
        </div>
        <div class="hist-taraz">
          ${toFa(item.taraz || 0)}
          <span>تراز</span>
        </div>
      `;
      list.appendChild(el);
    });
  }

  function majorName(key){
    const map = {
      tajrobi:'تجربی', riazi:'ریاضی', ensani:'انسانی',
      honar:'هنر', savabegh:'سوابق'
    };
    return map[key] || key || '';
  }

  /* =================== مودال هدف =================== */
  function bindGoal(){
    const modal = $('#goalModal');
    const edit = $('#goalEdit');
    const save = $('#goalSave');
    const inp = $('#goalInput');

    edit?.addEventListener('click', () => {
      if(inp) inp.value = dailyGoal;
      modal?.classList.add('open');
    });
    save?.addEventListener('click', () => {
      const v = parseInt(inp?.value || '120', 10);
      if(!isNaN(v) && v >= 15){
        dailyGoal = v;
        saveGoal();
        refreshToday();
        checkBadges();
        window.showToast && window.showToast('✅ هدف روزانه به‌روز شد', 'success');
      }
      modal?.classList.remove('open');
    });
    $$('[data-close]').forEach(b => {
      b.addEventListener('click', () => {
        const m = document.getElementById(b.dataset.close);
        if(m) m.classList.remove('open');
      });
    });
    modal?.addEventListener('click', e => {
      if(e.target === modal) modal.classList.remove('open');
    });
  }

  /* =================== Refresh all =================== */
  function refreshAll(){
    refreshToday();
    refreshWeek();
    refreshStreak();
  }

  /* =================== شروع =================== */
  setupHeader();
  bindPomodoro();
  bindGoal();
  renderBadges();
  renderHistory();
  refreshAll();
  checkBadges();

  // اگر کاربر لاگین نکرده بود، بذاریم آزاد استفاده کنه ولی تشویقش کنیم
  console.log('%c🎯 Piramid Dashboard ready','color:#e85d9e;font-weight:700;');
});