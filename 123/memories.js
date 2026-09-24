/* ======================================================================
   PIRAMID — memories.js
   خاطرات، خط زمان، کپسول زمان، پیش‌بینی آینده
   ====================================================================== */
'use strict';

window.addEventListener('load', () => {
  console.log('🎬 Memories: شروع...');

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
  const faDate = d => d.toLocaleDateString('fa-IR', { year:'numeric', month:'long', day:'numeric' });

  /* ==================== ساخت خط زمان ==================== */
  function buildTimeline(){
    const events = [];

    // ۱) تخمین‌ها
    const estimates = getLS('piramid_estimates', []) || [];
    estimates.forEach(e => {
      const majorMap = { tajrobi:'تجربی', riazi:'ریاضی', ensani:'انسانی', honar:'هنر', savabegh:'سوابق' };
      events.push({
        type:'estimate',
        icon:'🧮',
        title:'تخمین کنکور ' + (majorMap[e.major] || 'نامعلوم'),
        desc:`تراز ${toFa(e.taraz || 0)} — رتبه ${toFa(e.rank || 0)}`,
        date: new Date(e.date || Date.now()),
        big: false
      });
    });

    // ۲) روزهای مطالعه
    const sessions = getLS('piramid_sessions', {}) || {};
    Object.entries(sessions).forEach(([k, v]) => {
      const [y, m, d] = k.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if(v.minutes >= 180){
        events.push({
          type:'study',
          icon:'🔥',
          title:`روز پرکار — ${toFa(v.minutes)} دقیقه`,
          desc:`${toFa(v.sessions)} جلسه‌ی تمرکز در این روز`,
          date,
          big: v.minutes >= 300
        });
      }
    });

    // ۳) قهرمانی‌های دوئل
    const duelResults = getLS('piramid_duel_wins', []) || [];
    duelResults.forEach(d => {
      events.push({
        type:'duel',
        icon:'⚔️',
        title:'پیروزی در دوئل',
        desc:'حریف رو شکست دادی!',
        date: new Date(d.date || Date.now()),
        big: true
      });
    });

    // ۴) سطح‌های مهم XP
    const xp = getLS('piramid_xp', 0) || 0;
    const level = getLS('piramid_level', 1) || 1;
    if(level >= 5){
      events.push({
        type:'milestone',
        icon:'🎖',
        title:`رسیدن به سطح ${toFa(level)}`,
        desc:`${toFa(xp)} XP جمع کردی!`,
        date: new Date(),
        big: level >= 10
      });
    }

    // ۵) اولین ورود
    const user = getLS('piramid_user', null);
    if(user){
      events.push({
        type:'welcome',
        icon:'👋',
        title:`خوش آمدی ${user.displayName || user.username}`,
        desc:'اولین روز سفرت با پیرامید',
        date: new Date(Date.now() - 30 * 86400000), // ۳۰ روز پیش تخمینی
        big: false
      });
    }

    // مرتب‌سازی نزولی (جدیدترین اول)
    events.sort((a, b) => b.date - a.date);

    return events;
  }

  function renderTimeline(){
    const box = $('#mmTimeline');
    const empty = $('#mmTlEmpty');
    if(!box) return;

    const events = buildTimeline();

    if(events.length === 0){
      box.innerHTML = '';
      if(empty) empty.style.display = 'block';
      return;
    }
    if(empty) empty.style.display = 'none';

    box.innerHTML = '';
    events.slice(0, 40).forEach((ev, i) => {
      const el = document.createElement('div');
      el.className = 'mm-event';
      el.style.animationDelay = (i * 0.06) + 's';
      el.innerHTML = `
        <div class="mm-event-dot ${ev.big ? 'big' : ''}"></div>
        <div class="mm-event-card ${ev.big ? 'gold' : ''}">
          <div class="mm-event-head">
            <div class="mm-event-icon">${ev.icon}</div>
            <div>
              <div class="mm-event-title">${ev.title}</div>
              <div class="mm-event-date">${faDate(ev.date)}</div>
            </div>
          </div>
          <div class="mm-event-desc">${ev.desc}</div>
        </div>
      `;
      el.addEventListener('click', () => openCinema(ev));
      box.appendChild(el);
    });
  }

  /* ==================== Cinema Mode ==================== */
  function openCinema(ev){
    const cinema = $('#mmCinema');
    const icon = $('#mmCinemaIcon');
    const title = $('#mmCinemaTitle');
    const desc = $('#mmCinemaDesc');
    const date = $('#mmCinemaDate');

    if(icon) icon.textContent = ev.icon;
    if(title) title.textContent = ev.title;
    if(desc) desc.textContent = ev.desc;
    if(date) date.textContent = '📅 ' + faDate(ev.date);

    if(cinema) cinema.classList.add('open');

    // صدای سینمایی
    playCinemaSound();
  }

  function playCinemaSound(){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      const ctx = new AC();
      // صدای ووش نرم
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * .8, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for(let i = 0; i < data.length; i++){
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
      }
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.value = .15;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      setTimeout(() => { try{ ctx.close(); }catch(e){} }, 1500);
    }catch(e){}
  }

  $('#mmCinemaClose')?.addEventListener('click', () => {
    $('#mmCinema')?.classList.remove('open');
  });

  /* ==================== Capsules ==================== */
  function getCapsules(){
    return getLS('piramid_capsules', []) || [];
  }
  function saveCapsules(list){
    setLS('piramid_capsules', list);
  }

  function renderCapsules(){
    const box = $('#mmCapsules');
    const empty = $('#mmCapsuleEmpty');
    if(!box) return;

    const list = getCapsules();
    if(list.length === 0){
      box.innerHTML = '';
      if(empty) empty.style.display = 'block';
      return;
    }
    if(empty) empty.style.display = 'none';

    box.innerHTML = '';
    list.slice().reverse().forEach(cap => {
      const now = Date.now();
      const openAt = new Date(cap.openAt);
      const isReady = now >= openAt.getTime();

      const daysLeft = Math.ceil((openAt - now) / 86400000);

      const el = document.createElement('div');
      el.className = 'mm-capsule ' + (isReady ? 'ready' : 'locked');
      el.dataset.color = cap.color || 'pink';

      const icon = isReady ? '🎁' : '🔒';
      const badge = isReady
        ? '<span class="mm-cap-badge ready">آماده‌ی باز کردن</span>'
        : `<span class="mm-cap-badge">${toFa(daysLeft)} روز مونده</span>`;

      const lockInfo = isReady
        ? `باز شود در: ${faDate(openAt)} ✨`
        : `مهر و موم شده تا: ${faDate(openAt)}`;

      el.innerHTML = `
        ${badge}
        <div class="mm-cap-icon">${icon}</div>
        <div class="mm-cap-title">${escapeHtml(cap.title)}</div>
        <div class="mm-cap-lock-info">${lockInfo}</div>
        <div class="mm-cap-actions">
          ${isReady
            ? '<button class="mm-cap-btn" data-act="open">🎁 باز کن</button>'
            : '<button class="mm-cap-btn" data-act="preview">👁 پیش‌نمایش</button>'}
          <button class="mm-cap-btn danger" data-act="delete">🗑</button>
        </div>
      `;

      el.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if(btn){
          e.stopPropagation();
          const act = btn.dataset.act;
          if(act === 'open') openCapsule(cap);
          else if(act === 'preview') previewCapsule(cap);
          else if(act === 'delete'){
            if(confirm('این کپسول حذف بشه؟')){
              const newList = getCapsules().filter(c => c.id !== cap.id);
              saveCapsules(newList);
              renderCapsules();
              if(window.showToast) window.showToast('🗑 حذف شد', 'info');
            }
          }
          return;
        }
        // کلیک روی خود کارت
        if(isReady) openCapsule(cap);
        else previewCapsule(cap);
      });

      box.appendChild(el);
    });
  }

  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function openCapsule(cap){
    const overlay = $('#mmOpenCapsule');
    const box = $('#mmGiftBox');
    const card = $('#mmOpenCard');
    const title = $('#mmOpenTitle');
    const text = $('#mmOpenText');
    const date = $('#mmOpenDate');

    if(!overlay) return;

    overlay.classList.add('open');
    overlay.classList.remove('opened');

    if(card) card.style.display = 'none';
    if(box) box.style.display = 'inline-block';

    // کاربر باید روی جعبه بزنه
    if(box){
      box.onclick = () => {
        overlay.classList.add('opened');
        playGiftSound();
        if(window.fireConfetti){
          window.fireConfetti(window.innerWidth/2, window.innerHeight/2 - 100);
        }
        setTimeout(() => {
          if(box) box.style.display = 'none';
          if(card) card.style.display = 'block';
          if(title) title.textContent = cap.title;
          if(text) text.textContent = cap.text;
          if(date){
            const d = new Date(cap.createdAt || Date.now());
            date.textContent = '📅 ' + faDate(d);
          }
        }, 1000);
      };
    }
  }

  function previewCapsule(cap){
    const overlay = $('#mmOpenCapsule');
    const box = $('#mmGiftBox');
    const card = $('#mmOpenCard');
    const title = $('#mmOpenTitle');
    const text = $('#mmOpenText');
    const date = $('#mmOpenDate');

    if(!overlay) return;

    overlay.classList.add('open');
    overlay.classList.remove('opened');

    if(box){
      box.style.display = 'inline-block';
      box.style.filter = 'grayscale(1)';
      box.onclick = null;
    }
    if(card) card.style.display = 'none';

    setTimeout(() => {
      if(box) box.style.display = 'none';
      if(card) card.style.display = 'block';
      if(title) title.textContent = '🔒 ' + cap.title;
      if(text) text.textContent = 'این کپسول هنوز آماده نیست. در تاریخ ' + faDate(new Date(cap.openAt)) + ' باز خواهد شد.';
      if(date) date.textContent = '⏳ صبر کن...';
    }, 300);
  }

  function playGiftSound(){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      const ctx = new AC();
      // آرپژ جشن
      const notes = [523, 659, 784, 1047, 1319, 1568];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        o.connect(g);
        g.connect(ctx.destination);
        const t = ctx.currentTime + i * .07;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(.12, t + .02);
        g.gain.exponentialRampToValueAtTime(.001, t + .35);
        o.start(t);
        o.stop(t + .4);
      });
      setTimeout(() => { try{ ctx.close(); }catch(e){} }, 1800);
    }catch(e){}
  }

  $('#mmOpenClose')?.addEventListener('click', () => {
    $('#mmOpenCapsule')?.classList.remove('open');
  });

  /* ==================== ساخت کپسول جدید ==================== */
  let pickedDays = 180;
  let pickedColor = 'pink';

  function openCapsuleModal(){
    const modal = $('#mmCapsuleModal');
    if(!modal) return;
    modal.classList.add('open');
    const t = $('#mmCapTitle');
    const x = $('#mmCapText');
    if(t) t.value = '';
    if(x) x.value = '';
    pickedDays = 180;
    pickedColor = 'pink';
    // ریست chip active
    $$('.mm-chip').forEach(c => c.classList.toggle('active', +c.dataset.days === 180));
    $$('.mm-color').forEach(c => c.classList.toggle('active', c.dataset.color === 'pink'));
  }

  $$('.mm-chip').forEach(b => {
    b.addEventListener('click', () => {
      $$('.mm-chip').forEach(x => x.classList.toggle('active', x === b));
      pickedDays = parseInt(b.dataset.days, 10);
    });
  });

  $$('.mm-color').forEach(b => {
    b.addEventListener('click', () => {
      $$('.mm-color').forEach(x => x.classList.toggle('active', x === b));
      pickedColor = b.dataset.color;
    });
  });

  $('#mmSaveCapsule')?.addEventListener('click', () => {
    const title = ($('#mmCapTitle')?.value || '').trim();
    const text = ($('#mmCapText')?.value || '').trim();
    if(!title || !text){
      if(window.showToast) window.showToast('عنوان و پیام رو پر کن', 'error');
      return;
    }

    const openAt = Date.now() + pickedDays * 86400000;
    const list = getCapsules();
    list.push({
      id: 'cap_' + Date.now(),
      title,
      text,
      color: pickedColor,
      openAt,
      createdAt: Date.now()
    });
    saveCapsules(list);

    $('#mmCapsuleModal')?.classList.remove('open');
    renderCapsules();

    if(window.showToast){
      window.showToast(`📮 کپسول مهر و موم شد — ${toFa(pickedDays)} روز دیگه بازش کن!`, 'success', 4000);
    }
  });

  $('#mmNewCapsule')?.addEventListener('click', openCapsuleModal);
  $('#mmNewCapsule2')?.addEventListener('click', openCapsuleModal);

  /* ==================== Tabs ==================== */
  $$('.mm-tab').forEach(b => {
    b.addEventListener('click', () => {
      const tab = b.dataset.tab;
      $$('.mm-tab').forEach(x => x.classList.toggle('active', x === b));
      $$('.mm-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));

      if(tab === 'future') renderFuture();
    });
  });

  /* ==================== Future / Prediction ==================== */
  function renderFuture(){
    const sessions = getLS('piramid_sessions', {}) || {};
    const xp = getLS('piramid_xp', 0) || 0;
    const level = getLS('piramid_level', 1) || 1;

    // میانگین ۱۴ روز اخیر
    let totalLast14 = 0, days14 = 0;
    for(let i = 0; i < 14; i++){
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dateKey(d);
      const m = (sessions[k] || {}).minutes || 0;
      totalLast14 += m;
      if(m > 0) days14++;
    }
    const avgPerDay = Math.round(totalLast14 / 14);

    // پیش‌بینی XP ۳۰ روز بعد
    const predicted30dXP = xp + (avgPerDay * 2 * 30) + (days14 * 15 * 30 / 14);
    const predictedLevel = calcLevel(predicted30dXP);

    // پیش‌بینی دقیقه کل
    const totalSoFar = Object.values(sessions).reduce((s, d) => s + (d.minutes || 0), 0);
    const predictedTotal = totalSoFar + avgPerDay * 30;

    // تعیین اینکه کدوم سمت بهتره
    const grades = [
      { icon:'⏱', label:'میانگین روزانه', value: toFa(avgPerDay) + ' دقیقه' },
      { icon:'📈', label:'دقیقه‌ی کل تا الان', value: toFa(totalSoFar) },
      { icon:'🎯', label:'پیش‌بینی ۳۰ روز بعد', value: toFa(predictedTotal) + ' دقیقه' },
      { icon:'⚡', label:'XP فعلی', value: toFa(xp) },
      { icon:'🚀', label:'XP پیش‌بینی', value: toFa(Math.round(predicted30dXP)) },
      { icon:'🎖', label:'سطح پیش‌بینی', value: toFa(predictedLevel) }
    ];

    const pGrid = $('#mmPredictGrid');
    if(pGrid){
      pGrid.innerHTML = '';
      grades.forEach(g => {
        const el = document.createElement('div');
        el.className = 'mm-predict';
        el.innerHTML = `
          <div class="mm-predict-icon">${g.icon}</div>
          <b>${g.value}</b>
          <span>${g.label}</span>
        `;
        pGrid.appendChild(el);
      });
    }

    // نمودار ۳۰ روز آینده
    const chart = $('#mmFutureChart');
    if(chart){
      chart.innerHTML = '';
      const bars = [];
      // ۱۵ روز گذشته
      for(let i = 14; i >= 0; i--){
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = dateKey(d);
        const m = (sessions[k] || {}).minutes || 0;
        bars.push({ value: m, future: false });
      }
      // ۱۵ روز آینده پیش‌بینی
      for(let i = 1; i <= 15; i++){
        const predicted = avgPerDay * (0.8 + Math.random() * 0.4);
        bars.push({ value: Math.round(predicted), future: true });
      }

      const max = Math.max(...bars.map(b => b.value), 30);
      bars.forEach(b => {
        const el = document.createElement('div');
        el.className = 'mm-chart-bar' + (b.future ? ' future' : '');
        el.style.height = Math.max(4, (b.value / max) * 100) + '%';
        el.dataset.v = toFa(b.value) + ' د';
        chart.appendChild(el);
      });
    }

    // نامه‌ی از آینده
    const letterText = $('#mmLetterText');
    if(letterText){
      const lines = [];
      if(avgPerDay >= 120){
        lines.push(`اگه همینطور ادامه بدی، تا ۳۰ روز دیگه حدود ${toFa(predictedTotal)} دقیقه مطالعه خواهی داشت. داری عالی پیش می‌ری!`);
      } else if(avgPerDay >= 60){
        lines.push(`الان داری روزی حدود ${toFa(avgPerDay)} دقیقه می‌خونی. اگه فقط روزی ۳۰ دقیقه اضافه کنی، تا ۳۰ روز دیگه به جایگاه خیلی بهتری می‌رسی.`);
      } else if(avgPerDay > 0){
        lines.push(`شروع کردی، که عالیه. ولی من می‌دونم تو توانایی بیشتری داری. روزی یه ساعت بیشتر بخون و ببین چه اتفاقی می‌افته.`);
      } else {
        lines.push(`هنوز شروع نکردی، ولی من می‌دونم که تو می‌تونی. فقط امروز رو شروع کن.`);
      }
      lines.push(`من در ${toFa(30)} روز آینده هستم، و بهت می‌گم: ارزشش رو داره. هر دقیقه‌ای که امروز می‌ذاری، فردا جواب می‌ده.`);
      if(xp >= 500){
        lines.push(`XP تو الان ${toFa(xp)} هست. اگه همینطور ادامه بدی، به سطح ${toFa(predictedLevel)} می‌رسی. من بهت افتخار می‌کنم 💜`);
      } else {
        lines.push(`هر XP که امروز می‌گیری، تو رو قوی‌تر می‌کنه. پس ادامه بده! 🚀`);
      }
      letterText.textContent = lines.join('\n\n');
    }

    // آمار Hero (یه بار همون بالا هم آپدیت کنیم)
    renderHeroStats();
  }

  function calcLevel(xp){
    let lv = 1;
    while((lv * (lv - 1) / 2) * 100 <= xp) lv++;
    return lv - 1 || 1;
  }

  /* ==================== Hero Stats ==================== */
  function renderHeroStats(){
    const box = $('#mmHeroStats');
    if(!box) return;

    const sessions = getLS('piramid_sessions', {}) || {};
    const total = Object.values(sessions).reduce((s, d) => s + (d.minutes || 0), 0);
    const activeDays = Object.keys(sessions).filter(k => (sessions[k].minutes || 0) > 0).length;
    const estimates = (getLS('piramid_estimates', []) || []).length;
    const streak = (getLS('piramid_streak', { count:0 }) || {}).count || 0;

    box.innerHTML = `
      <div class="mm-hs"><b>${toFa(total)}</b><span>دقیقه‌ی کل</span></div>
      <div class="mm-hs"><b>${toFa(activeDays)}</b><span>روز فعال</span></div>
      <div class="mm-hs"><b>${toFa(estimates)}</b><span>تخمین</span></div>
      <div class="mm-hs"><b>${toFa(streak)}</b><span>روز پیوسته</span></div>
    `;
  }

  /* ==================== Hero پیام ==================== */
  function renderHeroMessage(){
    const title = $('#mmHeroTitle');
    const sub = $('#mmHeroSubtitle');
    if(!title || !sub) return;

    const sessions = getLS('piramid_sessions', {}) || {};
    const activeDays = Object.keys(sessions).filter(k => (sessions[k].minutes || 0) > 0).length;

    const user = getLS('piramid_user', null);
    const name = (user && (user.displayName || user.username)) || 'دوست من';

    if(activeDays === 0){
      title.textContent = `سلام ${name} 👋`;
      sub.textContent = 'سفرت تازه شروع شده. بیا خاطرات زیبایی بسازیم!';
    } else if(activeDays < 7){
      title.textContent = `داری گرم می‌شی، ${name} 💪`;
      sub.textContent = `${toFa(activeDays)} روز فعال داشتی. اولین خاطره‌هات اینجاست.`;
    } else if(activeDays < 30){
      title.textContent = `عالیه ${name}! 🌟`;
      sub.textContent = `${toFa(activeDays)} روز از سفرت گذشته. وقتشه به عقب نگاه کنی.`;
    } else {
      title.textContent = `قهرمان من ${name} 🏆`;
      sub.textContent = `${toFa(activeDays)} روز تلاش! این سفر واقعاً الهام‌بخشه.`;
    }
  }

  /* ==================== Modal بستن ==================== */
  $$('[data-close]').forEach(b => {
    b.addEventListener('click', () => {
      const m = document.getElementById(b.dataset.close);
      if(m) m.classList.remove('open');
    });
  });
  $$('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => {
      if(e.target === ov) ov.classList.remove('open');
    });
  });

  /* ==================== شروع ==================== */
  renderHeroMessage();
  renderHeroStats();
  renderTimeline();
  renderCapsules();

  // بررسی کپسول‌های آماده
  setTimeout(() => {
    const list = getCapsules();
    const readyOnes = list.filter(c => Date.now() >= c.openAt);
    if(readyOnes.length > 0 && window.showToast){
      window.showToast(`🎁 ${toFa(readyOnes.length)} کپسول زمان آماده‌ی بازکردنه!`, 'success', 4000);
    }
  }, 1500);

  console.log('%c🎬 Piramid Memories ready','color:#e85d9e;font-weight:700;');
});