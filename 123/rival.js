/* ======================================================================
   PIRAMID — rival.js
   حریف مجازی: شخصیت‌ها، رشد خودکار، چت، دوئل، رقابت هفتگی
   ====================================================================== */
'use strict';

window.addEventListener('load', () => {
  console.log('👥 Rival: شروع...');

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

  /* ==================== شخصیت‌ها ==================== */
  const PERSONAS = {
    strict: {
      id: 'strict',
      name: 'آرش',
      avatar: '🔥',
      tone: 'strict',
      dailyBase: 420,   // ۷ ساعت میانگین
      variance: 120,
      wakeHour: 5,
      sleepHour: 23,
      messages: {
        cheer: [
          'آفرین! امروز خوب کار کردی. ولی کافی نیست.',
          'داری بهتر می‌شی. من هنوز ازت جلوترم.',
          'خوب بود. ولی فردا باید بیشتر بخونی.'
        ],
        tease: [
          'امروز چی کار کردی؟ من ۷ ساعت خوندم.',
          'اینقدر که تو وقت تلف می‌کنی، من ۲ فصل جلو زدم.',
          'فردا جبران کن، وگرنه عقب می‌مونی!'
        ],
        neutral: [
          'من ۸ ساعت می‌خونم. تو چقدر؟',
          'آدمای جدی، هر روز تمرین می‌کنن.',
          'رتبه‌های برتر، پشتکار دارن نه استعداد.'
        ],
        milestone: [
          'امروز ازت جلو زدم! 🏃',
          'رکورد من امروز شکسته شد — سعی کن بهم برسی.'
        ]
      }
    },
    friendly: {
      id: 'friendly',
      name: 'نیلوفر',
      avatar: '🌸',
      tone: 'friendly',
      dailyBase: 240,   // ۴ ساعت
      variance: 90,
      wakeHour: 7,
      sleepHour: 22,
      messages: {
        cheer: [
          'آفرین عزیزم! امروز فوق‌العاده بودی 💜',
          'وای چقدر خوب پیش می‌ری! افتخار می‌کنم 🌸',
          'مطالعه‌ت رو دیدم، خیلی قشنگ بود! ادامه بده ✨'
        ],
        tease: [
          'امروز یه‌کم کم‌کار بودی، ولی اشکال نداره. فردا بهتر 🌱',
          'دلم برات تنگ شده بود! امروز کمتر دیدمت 🌸',
          'نگران نباش، هر روز یه فرصت جدیده 💜'
        ],
        neutral: [
          'چطوری؟ من دارم ریاضی می‌خونم 🌸',
          'هوا خوبه، ولی درس مهم‌تره! 💜',
          'یه چای خوردم و برگشتم سر درس ☕'
        ],
        milestone: [
          'وای امروز خیلی خوندی! بهت افتخار می‌کنم 🎉',
          'رکورد زدی! یه شکلات به خودت بدهکار شدی 🍫'
        ]
      }
    },
    rival: {
      id: 'rival',
      name: 'سام',
      avatar: '⚔️',
      tone: 'rival',
      dailyBase: 330,
      variance: 130,
      wakeHour: 6,
      sleepHour: 23,
      messages: {
        cheer: [
          'هوم، خوب بود. ولی من فردا جبران می‌کنم.',
          'تازه داری بهم می‌رسی. ادامه بده... اگه می‌تونی.',
          'این بار بردی. دفعه‌ی بعد نه.'
        ],
        tease: [
          'هاهاها، امروز من بردم! 🏆',
          'داری عقب می‌مونی، دوست من.',
          'امروز من ۶ ساعت خوندم، تو چی؟'
        ],
        neutral: [
          'رقابت هفته‌ی بعد شروع می‌شه، آماده‌ای؟',
          'من دارم فیزیک می‌خونم. تو چی؟',
          'رتبه‌ی من بهتر از توئه. هنوز.'
        ],
        milestone: [
          'امروز رکورد زدم! از من جلو بزن اگه می‌تونی 🏆',
          'رقابت داغ شده... ادامه بده!'
        ]
      }
    }
  };

  /* ==================== ذخیره‌سازی ==================== */
  const STORE = {
    persona: 'piramid_rival_persona',
    data:    'piramid_rival_data',      // { xp, level, streak, days: { 'YYYY-MM-DD': minutes } }
    feed:    'piramid_rival_feed',      // [ { text, tone, time } ]
    duel:    'piramid_rival_duel',      // { active, startTime, youSec, rivalSec }
    lastTick:'piramid_rival_last_tick'  // برای شبیه‌سازی گذر زمان
  };

  let personaId = getLS(STORE.persona, null);
  let rivalData = getLS(STORE.data, null);
  let feed      = getLS(STORE.feed, []) || [];
  let duel      = getLS(STORE.duel, null);
  let lastTick  = getLS(STORE.lastTick, null);

  function savePersona(){ setLS(STORE.persona, personaId); }
  function saveData(){ setLS(STORE.data, rivalData); }
  function saveFeed(){ setLS(STORE.feed, feed.slice(-40)); }
  function saveDuel(){ setLS(STORE.duel, duel); }
  function saveTick(){ setLS(STORE.lastTick, lastTick); }

  /* ==================== مقدارگذاری اولیه ==================== */
  function initRivalData(){
    if(!rivalData){
      rivalData = {
        xp: 100,
        level: 1,
        streak: 1,
        days: {},
        lastActive: dateKey()
      };
    }
    if(!rivalData.days) rivalData.days = {};
    saveData();
  }

  /* ==================== شبیه‌سازی گذر زمان ==================== */
  function simulateTimePassed(){
    const now = Date.now();
    const last = lastTick || now;
    const elapsed = now - last;
    const minutesElapsed = Math.floor(elapsed / 60000); // دقیقه

    if(minutesElapsed < 1) return;

    // تعیین فعالیت بر اساس ساعت
    const h = new Date().getHours();
    const persona = PERSONAS[personaId];
    if(!persona) return;

    let minutesToAdd = 0;
    let xpToAdd = 0;
    let statusChanged = false;

    const isAwake = h >= persona.wakeHour && h < persona.sleepHour;
    const isStudying = isAwake && Math.random() > 0.25; // ۷۵٪ مواقع

    if(isStudying){
      // میانگین سرعت مطالعه
      const perMin = persona.dailyBase / (persona.sleepHour - persona.wakeHour) / 60;
      minutesToAdd = Math.round(minutesElapsed * perMin * (0.6 + Math.random() * 0.8));
      xpToAdd = Math.round(minutesToAdd * 2);
    }

    if(minutesToAdd > 0){
      const k = dateKey();
      if(!rivalData.days[k]) rivalData.days[k] = 0;
      rivalData.days[k] += minutesToAdd;

      rivalData.xp += xpToAdd;
      rivalData.level = calcLevel(rivalData.xp);

      // streak
      const today = dateKey();
      if(rivalData.lastActive !== today){
        const y = new Date(); y.setDate(y.getDate() - 1);
        const yK = dateKey(y);
        if(rivalData.lastActive === yK) rivalData.streak++;
        else rivalData.streak = 1;
        rivalData.lastActive = today;
      }
      saveData();
      statusChanged = true;
    }

    lastTick = now;
    saveTick();
    return statusChanged;
  }

  function calcLevel(xp){
    // سطح n نیاز به 100 * n(n-1)/2
    let lv = 1;
    while((lv * (lv - 1) / 2) * 100 <= xp) lv++;
    return lv - 1 || 1;
  }

  /* ==================== وضعیت لحظه‌ای ==================== */
  function getRivalStatus(){
    const h = new Date().getHours();
    const persona = PERSONAS[personaId];
    if(!persona) return { label:'آفلاین', dot:'sleeping' };

    if(h < persona.wakeHour) return { label:'😴 خوابه', dot:'sleeping' };
    if(h >= persona.sleepHour) return { label:'😴 خوابه', dot:'sleeping' };

    const m = new Date().getMinutes();
    // شبیه‌سازی الگوی مطالعه
    if(m < 15 || (m >= 30 && m < 45)) return { label:'📚 داره درس می‌خونه', dot:'studying' };
    return { label:'☕ استراحت می‌کنه', dot:'resting' };
  }

  /* ==================== محاسبه‌ی مود ==================== */
  function calcMood(){
    // مود حریف بر اساس نسبت عملکرد تو به اون
    const youMinToday = getMyToday();
    const rivalMinToday = rivalData.days[dateKey()] || 0;

    if(rivalMinToday === 0 && youMinToday === 0) return 50;
    if(rivalMinToday === 0) return 80;
    const ratio = youMinToday / rivalMinToday;
    if(ratio > 1.5) return 30;   // تو داری می‌بری → ناراحت
    if(ratio > 1) return 45;
    if(ratio > 0.5) return 65;
    return 90; // تو داری می‌بازی → خوشحال
  }

  function moodEmoji(mood){
    if(mood >= 80) return '😄';
    if(mood >= 60) return '😊';
    if(mood >= 40) return '😐';
    if(mood >= 25) return '😕';
    return '😠';
  }

  /* ==================== پیام‌ها ==================== */
  function generateMessage(){
    const persona = PERSONAS[personaId];
    if(!persona) return null;

    const youMin = getMyToday();
    const rvMin = rivalData.days[dateKey()] || 0;

    let category = 'neutral';
    if(youMin > rvMin * 1.3) category = 'tease'; // چون حریف داره می‌بازه
    else if(youMin * 1.3 < rvMin) category = 'cheer';
    else if(Math.random() > 0.85) category = 'milestone';

    const list = persona.messages[category] || persona.messages.neutral;
    const text = list[Math.floor(Math.random() * list.length)];
    return { text, tone: persona.tone, category };
  }

  function addFeedMessage(){
    const msg = generateMessage();
    if(!msg) return;
    const t = new Date();
    feed.push({
      ...msg,
      time: `${pad2(t.getHours())}:${pad2(t.getMinutes())}`
    });
    saveFeed();
    renderFeed();
  }

  function renderFeed(){
    const list = $('#rvFeedList');
    if(!list) return;
    if(feed.length === 0){
      list.innerHTML = '<div class="rv-feed-empty">هنوز پیامی نیومده. صبر کن تا حریفت پیام بفرسته 💬</div>';
      return;
    }
    list.innerHTML = '';
    feed.slice().reverse().forEach(m => {
      const el = document.createElement('div');
      el.className = 'rv-msg ' + (m.tone || '') + ' ' + (m.category === 'cheer' ? 'cheer' : m.category === 'tease' ? 'tease' : '');
      el.innerHTML = `${m.text}<span class="rv-msg-time">${toFa(m.time)}</span>`;
      list.appendChild(el);
    });
  }

  /* ==================== آمار من (کاربر) ==================== */
  function getMyToday(){
    const sessions = getLS('piramid_sessions', {}) || {};
    return (sessions[dateKey()] || {}).minutes || 0;
  }

  function getMyWeek(){
    const sessions = getLS('piramid_sessions', {}) || {};
    let total = 0;
    for(let i = 0; i < 7; i++){
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dateKey(d);
      total += (sessions[k] || {}).minutes || 0;
    }
    return total;
  }

  function getMyXP(){
    return getLS('piramid_xp', 0) || 0;
  }

  function getMyLevel(){
    return getLS('piramid_level', 1) || 1;
  }

  function getMyStreak(){
    return (getLS('piramid_streak', { count:0 }) || {}).count || 0;
  }

  /* ==================== رندر اصلی ==================== */
  function renderHero(){
    const persona = PERSONAS[personaId];
    if(!persona) return;

    const status = getRivalStatus();
    const mood = calcMood();

    const nameEl = $('#rvName');
    const avatarEl = $('#rvAvatar');
    const statusEl = $('#rvStatus');
    const dotEl = $('#rvStatusDot');
    const moodFill = $('#rvMoodFill');
    const moodEmoji = $('#rvMoodEmoji');
    const lvlEl = $('#rvLevel');
    const xpEl = $('#rvXP');
    const streakEl = $('#rvStreak');

    if(nameEl) nameEl.textContent = persona.name;
    if(avatarEl) avatarEl.textContent = persona.avatar;
    if(statusEl) statusEl.textContent = status.label;
    if(dotEl){
      dotEl.className = 'rv-status-dot ' + status.dot;
    }
    if(moodFill){
      moodFill.style.width = mood + '%';
    }
    if(moodEmoji) moodEmoji.textContent = moodEmoji_(mood);

    if(lvlEl) lvlEl.textContent = toFa(rivalData.level);
    if(xpEl) xpEl.textContent = toFa(rivalData.xp);
    if(streakEl) streakEl.textContent = toFa(rivalData.streak);

    // نام حریف در جاهای دیگه
    const legName = $('#rvLegName');
    const rivLabel = $('#rvDuelRivalLabel');
    const cmpName = $('#rvCompareRivalName');
    if(legName) legName.textContent = persona.name;
    if(rivLabel) rivLabel.textContent = persona.name;
    if(cmpName) cmpName.textContent = persona.name;
  }

  function moodEmoji_(m){
    if(m >= 80) return '😄';
    if(m >= 60) return '😊';
    if(m >= 40) return '😐';
    if(m >= 25) return '😕';
    return '😠';
  }

  function renderRace(){
    const box = $('#rvRaceBars');
    if(!box) return;
    box.innerHTML = '';

    const sessions = getLS('piramid_sessions', {}) || {};
    const FA_WEEK = ['شنبه','یک‌شنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه'];

    const days = [];
    let max = 30; // حداقل
    for(let i = 6; i >= 0; i--){
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dateKey(d);
      const you = (sessions[k] || {}).minutes || 0;
      const rv = rivalData.days[k] || 0;
      days.push({
        label: FA_WEEK[d.getDay()],
        you, rv,
        isToday: i === 0
      });
      max = Math.max(max, you, rv);
    }

    let myTotal = 0, rvTotal = 0;
    days.forEach(day => {
      myTotal += day.you;
      rvTotal += day.rv;

      const dayEl = document.createElement('div');
      dayEl.className = 'rv-race-day' + (day.isToday ? ' today' : '');

      const youPct = Math.max(2, (day.you / max) * 100);
      const rvPct  = Math.max(2, (day.rv  / max) * 100);

      dayEl.innerHTML = `
        <div class="rv-race-day-bars">
          <div class="rv-bar rv-bar-you ${day.isToday ? 'today-you' : ''}"
               style="height:${youPct}%"
               title="تو: ${toFa(day.you)} دقیقه"></div>
          <div class="rv-bar rv-bar-rival ${day.isToday ? 'today-rival' : ''}"
               style="height:${rvPct}%"
               title="${PERSONAS[personaId]?.name || 'حریف'}: ${toFa(day.rv)} دقیقه"></div>
        </div>
        <div class="rv-race-label">${day.label}</div>
      `;
      box.appendChild(dayEl);
    });

    const sum = $('#rvRaceSummary');
    if(sum){
      if(myTotal > rvTotal) sum.textContent = `🏆 تو ${toFa(myTotal - rvTotal)} دقیقه جلوتری`;
      else if(rvTotal > myTotal) sum.textContent = `📉 ${toFa(rvTotal - myTotal)} دقیقه عقب‌تری`;
      else sum.textContent = '🤝 مساوی';
    }
  }

  function renderCompare(){
    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = toFa(v); };
    set('cmpYouLevel', getMyLevel());
    set('cmpYouXP', getMyXP());
    set('cmpYouToday', getMyToday());
    set('cmpYouWeek', getMyWeek());
    set('cmpYouStreak', getMyStreak());

    set('cmpRvLevel', rivalData.level);
    set('cmpRvXP', rivalData.xp);
    set('cmpRvToday', rivalData.days[dateKey()] || 0);
    set('cmpRvWeek', (() => {
      let total = 0;
      for(let i = 0; i < 7; i++){
        const d = new Date();
        d.setDate(d.getDate() - i);
        total += rivalData.days[dateKey(d)] || 0;
      }
      return total;
    })());
    set('cmpRvStreak', rivalData.streak);
  }

  function renderAll(){
    renderHero();
    renderRace();
    renderCompare();
    renderFeed();
  }

  /* ==================== دوئل ==================== */
  let duelTimer = null;

  function startDuel(){
    if(duel && duel.active) return;

    duel = {
      active: true,
      startTime: Date.now(),
      youSec: 0,
      rivalSec: 0
    };
    saveDuel();

    const timerBox = $('#rvDuelTimer');
    const btn = $('#rvDuelBtn');
    if(timerBox) timerBox.style.display = 'block';
    if(btn){
      btn.textContent = 'لغو دوئل';
      btn.style.background = 'linear-gradient(135deg, #df6680, #c83f7f)';
    }

    addFeedMessage(); // پیام شروع
    tickDuel();
  }

  function tickDuel(){
    if(!duel || !duel.active) return;

    // هر ثانیه چک می‌کنیم
    duelTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - duel.startTime) / 1000);
      const remaining = Math.max(0, 3600 - elapsed);
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      const timeEl = $('#rvDuelTime');
      if(timeEl) timeEl.textContent = toFa(pad2(min) + ':' + pad2(sec));

      // شبیه‌سازی پیشرفت هر طرف
      // کاربر: بر اساس اینکه واقعاً چقدر توی این مدت پیشرفت کرده
      const sessions = getLS('piramid_sessions', {}) || {};
      const userToday = (sessions[dateKey()] || {}).minutes || 0;

      const startUserMin = duel._startUserMin ?? userToday;
      if(duel._startUserMin === undefined) duel._startUserMin = userToday;

      const userProgress = Math.max(0, userToday - startUserMin);
      const userRatio = Math.min(100, (userProgress / 60) * 100);

      // حریف: سرعت ثابت با کمی تصادفی
      const rvMin = (elapsed / 60) * (0.7 + Math.random() * 0.35);
      const rvRatio = Math.min(100, (rvMin / 60) * 100);

      const youFill = $('#rvDuelYouFill');
      const rvFill = $('#rvDuelRivalFill');
      if(youFill) youFill.style.width = userRatio + '%';
      if(rvFill) rvFill.style.width = rvRatio + '%';

      duel.youSec = Math.round(userProgress * 60);
      duel.rivalSec = Math.round(rvMin * 60);
      saveDuel();

      if(elapsed >= 3600){
        finishDuel();
      }
    }, 1000);
  }

  function cancelDuel(){
    if(duelTimer) clearInterval(duelTimer);
    duelTimer = null;
    if(duel) duel.active = false;
    saveDuel();

    const timerBox = $('#rvDuelTimer');
    const btn = $('#rvDuelBtn');
    if(timerBox) timerBox.style.display = 'none';
    if(btn){
      btn.textContent = 'شروع دوئل';
      btn.style.background = '';
    }
  }

  function finishDuel(){
    if(duelTimer) clearInterval(duelTimer);
    duelTimer = null;

    const youMin = duel.youSec / 60;
    const rvMin = duel.rivalSec / 60;

    const result = $('#rvDuelResult');
    const icon = $('#rvResultIcon');
    const title = $('#rvResultTitle');
    const text = $('#rvResultText');

    if(youMin > rvMin){
      if(icon) icon.textContent = '🏆';
      if(title) title.textContent = 'بردی!';
      if(text) text.textContent = `تو ${toFa(Math.round(youMin))} دقیقه خوندی، حریفت ${toFa(Math.round(rvMin))} دقیقه. +۵۰ XP پاداش!`;
      if(window.PiramidXP) window.PiramidXP.add(50);
      if(window.fireConfetti) window.fireConfetti(window.innerWidth/2, window.innerHeight/2);
      addFeedMessage();
    } else if(youMin < rvMin){
      if(icon) icon.textContent = '💔';
      if(title) title.textContent = 'باختی!';
      if(text) text.textContent = `تو ${toFa(Math.round(youMin))} دقیقه، حریفت ${toFa(Math.round(rvMin))} دقیقه. دفعه‌ی بعد جبران کن!`;
      addFeedMessage();
    } else {
      if(icon) icon.textContent = '🤝';
      if(title) title.textContent = 'مساوی!';
      if(text) text.textContent = 'هر دو برابر خوندید.';
    }

    if(result) result.classList.add('open');

    duel.active = false;
    duel._startUserMin = undefined;
    saveDuel();

    const timerBox = $('#rvDuelTimer');
    const btn = $('#rvDuelBtn');
    if(timerBox) timerBox.style.display = 'none';
    if(btn){
      btn.textContent = 'شروع دوئل';
      btn.style.background = '';
    }
  }

  /* ==================== شخصیت ==================== */
  function selectPersona(id){
    personaId = id;
    savePersona();

    const pick = $('#rvPick');
    const main = $('#rvMain');
    if(pick) pick.style.display = 'none';
    if(main) main.style.display = 'block';

    initRivalData();
    simulateTimePassed();
    renderAll();
    addFeedMessage();

    if(window.showToast) window.showToast(`👥 ${PERSONAS[id].name} الان کنارته!`, 'success');
  }

  function openPersonaPicker(){
    const pick = $('#rvPick');
    const main = $('#rvMain');
    if(pick) pick.style.display = 'flex';
    if(main) main.style.display = 'none';
  }

  /* ==================== بایندها ==================== */
  $$('.rv-pick-card').forEach(card => {
    card.addEventListener('click', () => {
      selectPersona(card.dataset.persona);
    });
  });

  const changeP = $('#rvChangePersona');
  if(changeP){
    changeP.addEventListener('click', openPersonaPicker);
  }

  const duelBtn = $('#rvDuelBtn');
  if(duelBtn){
    duelBtn.addEventListener('click', () => {
      if(duel && duel.active) cancelDuel();
      else startDuel();
    });
  }

  const resultBtn = $('#rvResultBtn');
  if(resultBtn){
    resultBtn.addEventListener('click', () => {
      const r = $('#rvDuelResult');
      if(r) r.classList.remove('open');
    });
  }

  const clearBtn = $('#rvClearFeed');
  if(clearBtn){
    clearBtn.addEventListener('click', () => {
      feed = [];
      saveFeed();
      renderFeed();
    });
  }

  /* ==================== چرخه‌ی پیام‌های خودکار ==================== */
  setInterval(() => {
    if(!personaId) return;
    // شانس پیام
    if(Math.random() > 0.7) addFeedMessage();
  }, 3 * 60 * 1000); // هر ۳ دقیقه ۳۰٪ شانس

  // پیام سریع اول (۱۰ ثانیه بعد از لود)
  if(personaId){
    setTimeout(() => {
      if(Math.random() > 0.5) addFeedMessage();
    }, 12000);
  }

  /* ==================== چرخه‌ی رشد خودکار ==================== */
  setInterval(() => {
    if(!personaId) return;
    simulateTimePassed();
    renderHero();
    renderCompare();
    renderRace();
  }, 60 * 1000); // هر دقیقه

  // وقتی صفحه دوباره فعال شد
  document.addEventListener('visibilitychange', () => {
    if(!document.hidden && personaId){
      simulateTimePassed();
      renderAll();
    }
  });

  /* ==================== شروع ==================== */
  if(personaId && PERSONAS[personaId]){
    console.log('👥 حریف قبلی:', PERSONAS[personaId].name);
    const pick = $('#rvPick');
    const main = $('#rvMain');
    if(pick) pick.style.display = 'none';
    if(main) main.style.display = 'block';

    initRivalData();
    simulateTimePassed();

    // اگر دوئل فعال بود ادامه بده
    if(duel && duel.active){
      const elapsed = Math.floor((Date.now() - duel.startTime) / 1000);
      if(elapsed < 3600){
        const timerBox = $('#rvDuelTimer');
        const btn = $('#rvDuelBtn');
        if(timerBox) timerBox.style.display = 'block';
        if(btn){
          btn.textContent = 'لغو دوئل';
          btn.style.background = 'linear-gradient(135deg, #df6680, #c83f7f)';
        }
        tickDuel();
      } else {
        duel.active = false;
        saveDuel();
      }
    }

    renderAll();

    // اگر خیلی وقته پیام نداده، یکی بفرست
    if(feed.length === 0){
      setTimeout(addFeedMessage, 5000);
    }
  } else {
    console.log('👥 اولین بار — انتخاب شخصیت');
  }

  console.log('%c👥 Piramid Rival ready','color:#e85d9e;font-weight:700;');
});