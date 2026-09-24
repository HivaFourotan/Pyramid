/* ======================================================================
   PIRAMID — mission-engine.js
   موتور ماموریت‌ها — روی همه‌ی صفحات لود می‌شه
   ====================================================================== */
'use strict';

(function(){
  if(window.PiramidMissions && window.PiramidMissions._engineReady) return;

  const $ = (s, c = document) => c.querySelector(s);
  const getLS = (k, d) => { try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } };
  const setLS = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };

  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');

  /* ==================== قالب‌های ماموریت ==================== */
  const TEMPLATES = [
    { id:'m_focus_25',    icon:'🍅', title:'یه پومودورو کامل بزن', desc:'۲۵ دقیقه تمرکز بی‌وقفه', reward:50,  target:1,  type:'sessions' },
    { id:'m_study_30',    icon:'⏱', title:'۳۰ دقیقه مطالعه',       desc:'هر مطالعه‌ای حساب می‌شه',  reward:50,  target:30, type:'minutes'  },
    { id:'m_study_60',    icon:'💪', title:'یک ساعت مطالعه',       desc:'امروز یه ساعت بخون',       reward:80,  target:60, type:'minutes'  },
    { id:'m_study_90',    icon:'🔥', title:'۹۰ دقیقه تمرکز',        desc:'سخت‌کوشی امروز',           reward:100, target:90, type:'minutes'  },
    { id:'m_cards_10',    icon:'🃏', title:'۱۰ فلش‌کارت مرور کن',  desc:'از فلش‌کارت‌ها استفاده کن', reward:50,  target:10, type:'cards'    },
    { id:'m_cards_25',    icon:'📚', title:'۲۵ فلش‌کارت',           desc:'حافظه‌ت رو قوی کن',        reward:80,  target:25, type:'cards'    },
    { id:'m_estimate',    icon:'🧮', title:'یه تخمین جدید بزن',    desc:'تراز و رتبه‌ت رو بسنج',     reward:50,  target:1,  type:'estimates'},
    { id:'m_2_sessions',  icon:'🎯', title:'۲ جلسه تمرکز',          desc:'دو تا پومودورو',           reward:80,  target:2,  type:'sessions' },
    { id:'m_3_sessions',  icon:'⚡', title:'۳ جلسه تمرکز',          desc:'یه روز پربار',             reward:120, target:3,  type:'sessions' },
    { id:'m_no_skip',     icon:'🌟', title:'امروز رو از دست نده',   desc:'یه فعالیتی انجام بده',    reward:40,  target:1,  type:'any'      }
  ];

  const dateKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  /* ==================== تولید ماموریت روزانه ==================== */
  function generateDaily(){
    const today = dateKey();
    let missions = getLS('piramid_missions', null);

    if(missions && missions.date === today && missions.list) return missions;

    // تولید ۳ ماموریت تصادفی
    const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 3);

    missions = {
      date: today,
      list: picked.map(m => ({
        ...m,
        progress: 0,
        done: false,
        claimed: false
      }))
    };
    setLS('piramid_missions', missions);
    return missions;
  }

  /* ==================== XP قابل پرداخت ==================== */
  function payXP(amount, sourceEl){
    // صبر کن تا XP engine لود بشه
    let tries = 0;
    const pay = () => {
      if(window.PiramidXP && window.PiramidXP.add){
        try{
          window.PiramidXP.add(amount, sourceEl);
        }catch(e){ console.warn('XP pay error:', e); }
        return;
      }
      if(++tries > 30) return; // بعد از ۳ ثانیه بی‌خیال
      setTimeout(pay, 100);
    };
    pay();
  }

  /* ==================== آپدیت پیشرفت ==================== */
  function updateProgress(type, amount){
    const missions = generateDaily();
    if(!missions || !missions.list) return;

    let changed = false;

    missions.list.forEach(m => {
      if(m.done) return;
      if(m.type === type || m.type === 'any'){
        const inc = type === 'any' ? 1 : amount;
        m.progress = Math.min(m.target, (m.progress || 0) + inc);
        if(m.progress >= m.target && !m.done){
          m.done = true;
          changed = true;
          // پیام ماموریت کامل
          setTimeout(() => {
            if(window.showToast){
              window.showToast('🎯 ماموریت کامل شد: ' + m.title, 'success', 3500);
            }
          }, 100);
        }
      }
    });

    if(changed) setLS('piramid_missions', missions);
    return missions;
  }

  /* ==================== Auto-claim ==================== */
  function claimCompleted(sourceEl){
    const missions = generateDaily();
    if(!missions || !missions.list) return;

    let claimed = false;
    missions.list.forEach(m => {
      if(m.done && !m.claimed){
        m.claimed = true;
        claimed = true;
        // XP رو بده
        setTimeout(() => payXP(m.reward, sourceEl), 500);
      }
    });

    if(claimed) setLS('piramid_missions', missions);
    return claimed;
  }

  /* ==================== صدا زدن از بیرون ==================== */
  function notify(type, amount, sourceEl){
    updateProgress(type, amount);
    claimCompleted(sourceEl);
  }

  /* ==================== گوش دادن به رویدادها ==================== */
  window.addEventListener('piramid:study', e => {
    const d = e.detail || {};
    if(d.sessions) notify('sessions', d.sessions);
    if(d.minutes) notify('minutes', d.minutes);
  });
  window.addEventListener('piramid:cards', e => {
    const d = e.detail || {};
    if(d.count) notify('cards', d.count);
  });
  window.addEventListener('piramid:estimate', () => {
    notify('estimates', 1);
  });

  /* ==================== API ==================== */
  window.PiramidMissions = {
    get: generateDaily,
    update: updateProgress,
    claim: claimCompleted,
    notify,
    _engineReady: true
  };

  // روی لود، ماموریت‌های امروز رو آماده کن
  generateDaily();

  console.log('%c🎯 Mission Engine ready', 'color:#e85d9e;font-weight:700;');
})();