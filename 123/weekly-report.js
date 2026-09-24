/* ======================================================================
   PIRAMID — weekly-report.js
   کارنامه‌ی هفتگی خودکار + تحلیل هوشمند + خروجی PNG
   ====================================================================== */
'use strict';

window.addEventListener('load', () => {
  console.log('📊 Weekly Report: شروع...');

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');
  const pad2 = n => String(n).padStart(2, '0');

  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };

  const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

  const FA_WEEK = ['شنبه','یک‌شنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه'];

  let weekOffset = 0;

  /* ==================== ابزار هفته ==================== */
  function getWeekStart(offset = 0){
    const today = new Date();
    const dow = today.getDay();
    const satOffset = dow === 6 ? 0 : (dow + 1);
    const sat = new Date(today);
    sat.setDate(today.getDate() - satOffset + offset * 7);
    sat.setHours(0, 0, 0, 0);
    return sat;
  }

  function getWeekDays(offset){
    const start = getWeekStart(offset);
    const arr = [];
    for(let i = 0; i < 7; i++){
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }
    return arr;
  }

  function faRange(start, end){
    return `${start.toLocaleDateString('fa-IR', { month:'long', day:'numeric' })} تا ${end.toLocaleDateString('fa-IR', { month:'long', day:'numeric' })}`;
  }

  /* ==================== جمع آوری داده ==================== */
  function collectWeek(offset){
    const days = getWeekDays(offset);
    const sessions = getLS('piramid_sessions', {}) || {};

    return days.map((d, i) => {
      const k = dateKey(d);
      const data = sessions[k] || { minutes:0, sessions:0 };
      return {
        date: d,
        key: k,
        label: FA_WEEK[i],
        dayIdx: i,
        minutes: data.minutes || 0,
        sessions: data.sessions || 0,
        isToday: k === dateKey()
      };
    });
  }

  /* ==================== رندر هدر ==================== */
  function renderCover(days, prevDays){
    const start = days[0].date;
    const end = days[6].date;
    const period = $('#wrPeriod');
    if(period){
      if(weekOffset === 0) period.textContent = '📅 این هفته';
      else if(weekOffset === -1) period.textContent = '📅 هفته‌ی گذشته';
      else if(weekOffset === 1) period.textContent = '📅 هفته‌ی آینده';
      else if(weekOffset < 0) period.textContent = `📅 ${toFa(Math.abs(weekOffset))} هفته پیش`;
      else period.textContent = `📅 ${toFa(weekOffset)} هفته بعد`;

      period.textContent += ' • ' + faRange(start, end);
    }

    const title = $('#wrTitle');
    if(title){
      if(weekOffset === 0) title.textContent = 'کارنامه‌ی این هفته 📊';
      else if(weekOffset === -1) title.textContent = 'کارنامه‌ی هفته‌ی گذشته 📊';
      else title.textContent = 'کارنامه‌ی هفتگی 📊';
    }

    // مجموع‌ها
    const total = days.reduce((s, d) => s + d.minutes, 0);
    const totalSessions = days.reduce((s, d) => s + d.sessions, 0);
    const activeDays = days.filter(d => d.minutes > 0).length;
    const avg = Math.round(total / 7);

    const sub = $('#wrSubtitle');
    if(sub){
      if(total === 0){
        sub.textContent = 'این هفته مطالعه‌ای ثبت نشده. اشکال نداره، از این هفته شروع کن!';
      } else if(total < 300){
        sub.textContent = `جمعاً ${toFa(total)} دقیقه مطالعه — ادامه بده، بهتر می‌شی 💪`;
      } else if(total < 1200){
        sub.textContent = `جمعاً ${toFa(total)} دقیقه مطالعه — عملکرد خوبی داشتی ✨`;
      } else {
        sub.textContent = `جمعاً ${toFa(total)} دقیقه — فوق‌العاده بودی! 🎉`;
      }
    }

    // Hero Stats
    const stats = $('#wrHeroStats');
    if(stats){
      stats.innerHTML = `
        <div class="wr-hs"><b>${toFa(total)}</b><span>دقیقه‌ی کل</span></div>
        <div class="wr-hs"><b>${toFa(avg)}</b><span>میانگین روزانه</span></div>
        <div class="wr-hs"><b>${toFa(activeDays)}/۷</b><span>روز فعال</span></div>
        <div class="wr-hs"><b>${toFa(totalSessions)}</b><span>جلسه</span></div>
      `;
    }
  }

  /* ==================== نمودار ==================== */
  let chartView = 'bars';

  function renderChart(days){
    const barsBox = $('#wrChartBars');
    const canvas = $('#wrChartLine');
    if(!barsBox || !canvas) return;

    const max = Math.max(...days.map(d => d.minutes), 30);
    const bestIdx = days.reduce((bi, d, i) => d.minutes > days[bi].minutes ? i : bi, 0);

    if(chartView === 'bars'){
      barsBox.style.display = 'flex';
      canvas.style.display = 'none';
      barsBox.innerHTML = '';

      days.forEach((d, i) => {
        const el = document.createElement('div');
        el.className = 'wr-bar' + (d.isToday ? ' today' : '');
        const h = Math.max(6, (d.minutes / max) * 100);
        const isBest = i === bestIdx && d.minutes > 0;
        el.innerHTML = `
          <div class="wr-bar-fill ${isBest ? 'best' : ''}"
               style="height:${h}%"
               data-v="${toFa(d.minutes)} دقیقه"
               title="${d.label}: ${toFa(d.minutes)} دقیقه"></div>
          <div class="wr-bar-label">${d.label}</div>
        `;
        barsBox.appendChild(el);
      });
    } else {
      barsBox.style.display = 'none';
      canvas.style.display = 'block';
      drawLineChart(canvas, days, max);
    }
  }

  function drawLineChart(canvas, days, max){
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width || 600;
    const H = 260;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const isDark = document.body.classList.contains('dark');
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#e85d9e';
    const muted = isDark ? '#b09aa8' : '#806b78';
    const border = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';

    const padX = 40, padY = 30;
    const chartW = W - padX * 2;
    const chartH = H - padY * 2;

    // خطوط افقی
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    for(let i = 0; i <= 4; i++){
      const y = padY + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(W - padX, y);
      ctx.stroke();
    }

    // نقاط
    const points = days.map((d, i) => {
      const x = padX + (chartW / 6) * i;
      const y = padY + chartH - (d.minutes / max) * chartH;
      return { x, y, d };
    });

    // پرکردن زیر
    const grad = ctx.createLinearGradient(0, padY, 0, H - padY);
    grad.addColorStop(0, primary + '44');
    grad.addColorStop(1, primary + '00');
    ctx.beginPath();
    ctx.moveTo(points[0].x, H - padY);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, H - padY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // خط
    ctx.beginPath();
    points.forEach((p, i) => {
      if(i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = primary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // نقاط
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = primary;
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // برچسب‌ها
    ctx.fillStyle = muted;
    ctx.font = '600 12px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    days.forEach((d, i) => {
      const x = padX + (chartW / 6) * i;
      ctx.fillText(d.label, x, H - 8);
    });

    // اعداد سمت راست
    ctx.textAlign = 'left';
    for(let i = 0; i <= 4; i++){
      const v = Math.round(max * (1 - i / 4));
      const y = padY + (chartH / 4) * i;
      ctx.fillText(toFa(v), 6, y + 4);
    }
  }

  // تغییر نمای نمودار
  $$('.wr-tab-mini').forEach(b => {
    b.addEventListener('click', () => {
      $$('.wr-tab-mini').forEach(x => x.classList.toggle('active', x === b));
      chartView = b.dataset.view;
      const days = collectWeek(weekOffset);
      renderChart(days);
    });
  });

  /* ==================== کارت‌ها ==================== */
  function renderCards(days){
    const bestIdx = days.reduce((bi, d, i) => d.minutes > days[bi].minutes ? i : bi, 0);
    const best = days[bestIdx];

    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };

    set('wrBestDay', best.minutes > 0 ? best.label : '—');
    set('wrBestDayMin', best.minutes > 0 ? toFa(best.minutes) + ' دقیقه' : 'هیچ فعالیتی');

    // روند
    const firstHalf = days.slice(0, 3).reduce((s, d) => s + d.minutes, 0);
    const secondHalf = days.slice(4, 7).reduce((s, d) => s + d.minutes, 0);

    let trendText = '—';
    let trendSub = '—';
    if(firstHalf === 0 && secondHalf === 0){
      trendText = 'بی‌حرکت';
      trendSub = 'چیزی ثبت نشده';
    } else if(secondHalf > firstHalf * 1.2){
      trendText = '📈 صعودی';
      trendSub = 'داری بهتر می‌شی';
    } else if(secondHalf < firstHalf * 0.8){
      trendText = '📉 نزولی';
      trendSub = 'دقت کن، افت نکن';
    } else {
      trendText = '➡️ یکنواخت';
      trendSub = 'ثابت موندی';
    }
    set('wrTrend', trendText);
    set('wrTrendSub', trendSub);

    const totalSessions = days.reduce((s, d) => s + d.sessions, 0);
    set('wrFocusCount', toFa(totalSessions));

    const activeDays = days.filter(d => d.minutes > 0).length;
    set('wrActiveDays', toFa(activeDays));
  }

  /* ==================== تحلیل هوشمند ==================== */
  function renderAnalysis(days, prevDays){
    const box = $('#wrAnalysisList');
    if(!box) return;

    const items = [];
    const total = days.reduce((s, d) => s + d.minutes, 0);
    const activeDays = days.filter(d => d.minutes > 0).length;
    const avg = Math.round(total / 7);
    const best = days.reduce((b, d) => d.minutes > b.minutes ? d : b, days[0]);
    const zeroDays = days.filter(d => d.minutes === 0);

    // تحلیل کلی
    if(total === 0){
      items.push({
        icon:'🌱', type:'info',
        text: `<b>هفته‌ی خالی</b> — ولی اشکال نداره! هفته‌ی بعد با یه پومودورو شروع کن.`
      });
    } else if(total >= 1200){
      items.push({
        icon:'🏆', type:'good',
        text: `<b>هفته‌ی طلایی!</b> ${toFa(total)} دقیقه مطالعه یعنی روزی ${toFa(avg)} دقیقه. این روند رو حفظ کن.`
      });
    } else if(total >= 600){
      items.push({
        icon:'✨', type:'good',
        text: `<b>عملکرد خوب</b> — ${toFa(total)} دقیقه در هفته. برای بهتر شدن، روزی ۳۰ دقیقه اضافه کن.`
      });
    } else {
      items.push({
        icon:'💪', type:'warn',
        text: `<b>جای پیشرفت هست</b> — ${toFa(total)} دقیقه کمه. هدف این هفته: ${toFa(Math.min(600, total + 200))} دقیقه.`
      });
    }

    // استمرار
    if(activeDays >= 6){
      items.push({
        icon:'🔥', type:'good',
        text: `<b>${toFa(activeDays)} روز از ۷ روز فعال بودی!</b> استمرار عالیه.`
      });
    } else if(activeDays >= 4){
      items.push({
        icon:'📅', type:'info',
        text: `<b>${toFa(activeDays)} روز فعال</b> — سعی کن به ۶ روز برسونی.`
      });
    } else if(activeDays > 0){
      items.push({
        icon:'⚠️', type:'warn',
        text: `<b>فقط ${toFa(activeDays)} روز</b> — روزهای خالی بیشتر از فعال بودن. یکنواخت‌تر بخون.`
      });
    }

    // بهترین روز
    if(best.minutes > 0){
      items.push({
        icon:'🏆', type:'info',
        text: `<b>بهترین روزت:</b> ${best.label} با ${toFa(best.minutes)} دقیقه. الگوی اون روز رو تکرار کن.`
      });
    }

    // روزهای صفر
    if(zeroDays.length > 0 && zeroDays.length < 7){
      items.push({
        icon:'💤', type:'warn',
        text: `<b>${toFa(zeroDays.length)} روز صفر</b> (${zeroDays.map(d => d.label).join('، ')}) — این روزها رو با یه فعالیت کوچیک پر کن.`
      });
    }

    // مقایسه با هفته قبل
    if(prevDays){
      const prevTotal = prevDays.reduce((s, d) => s + d.minutes, 0);
      if(prevTotal > 0){
        const diff = total - prevTotal;
        const pct = Math.round((diff / prevTotal) * 100);
        if(diff > 0){
          items.push({
            icon:'📈', type:'good',
            text: `<b>${toFa(pct)}٪ بهتر از هفته‌ی قبل</b> — عالیه، ادامه بده!`
          });
        } else if(diff < 0){
          items.push({
            icon:'📉', type:'warn',
            text: `<b>${toFa(Math.abs(pct))}٪ کمتر از هفته‌ی قبل</b> — سعی کن هفته‌ی بعد جبران کنی.`
          });
        }
      }
    }

    box.innerHTML = items.map((it, i) => `
      <div class="wr-analysis-item ${it.type}" style="animation-delay:${i * 0.08}s">
        <div class="wr-analysis-icon">${it.icon}</div>
        <div class="wr-analysis-text">${it.text}</div>
      </div>
    `).join('');
  }

  /* ==================== مقایسه ==================== */
  function renderCompare(days, prevDays){
    const box = $('#wrCompareWrap');
    const card = $('#wrCompareCard');
    if(!box) return;

    if(!prevDays){
      if(card) card.style.display = 'none';
      return;
    }
    if(card) card.style.display = 'block';

    const total = days.reduce((s, d) => s + d.minutes, 0);
    const prevTotal = prevDays.reduce((s, d) => s + d.minutes, 0);
    const activeDays = days.filter(d => d.minutes > 0).length;
    const prevActive = prevDays.filter(d => d.minutes > 0).length;
    const sessions = days.reduce((s, d) => s + d.sessions, 0);
    const prevSessions = prevDays.reduce((s, d) => s + d.sessions, 0);
    const bestMin = Math.max(...days.map(d => d.minutes));
    const prevBest = Math.max(...prevDays.map(d => d.minutes));

    const rows = [
      { label:'📚 مجموع دقیقه', now: total, prev: prevTotal, suffix: ' دقیقه' },
      { label:'📅 روزهای فعال', now: activeDays, prev: prevActive, suffix: ' روز' },
      { label:'🎯 جلسات', now: sessions, prev: prevSessions, suffix: '' },
      { label:'🏆 بهترین روز', now: bestMin, prev: prevBest, suffix: ' دقیقه' }
    ];

    box.innerHTML = rows.map(r => {
      const diff = r.now - r.prev;
      let cls = 'same';
      let sym = '=';
      if(diff > 0){ cls = 'up'; sym = '↑ +' + toFa(diff); }
      else if(diff < 0){ cls = 'down'; sym = '↓ ' + toFa(diff); }

      return `
        <div class="wr-cmp-row">
          <div class="wr-cmp-label">${r.label}</div>
          <div class="wr-cmp-value">${toFa(r.now)}${r.suffix}</div>
          <div class="wr-cmp-diff ${cls}">${sym}</div>
        </div>
      `;
    }).join('');
  }

  /* ==================== Export PNG ==================== */
  function exportPNG(){
    const canvas = $('#wrCanvas');
    if(!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // گرفتن داده‌ها
    const days = collectWeek(weekOffset);
    const total = days.reduce((s, d) => s + d.minutes, 0);
    const avg = Math.round(total / 7);
    const activeDays = days.filter(d => d.minutes > 0).length;
    const sessions = days.reduce((s, d) => s + d.sessions, 0);
    const best = days.reduce((b, d) => d.minutes > b.minutes ? d : b, days[0]);

    // پس‌زمینه
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#fff5fa');
    bg.addColorStop(1, '#f0e8ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // دایره‌های تزئینی
    ctx.fillStyle = 'rgba(232,93,158,.08)';
    ctx.beginPath();
    ctx.arc(W - 100, 100, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(199,138,232,.08)';
    ctx.beginPath();
    ctx.arc(100, H - 200, 250, 0, Math.PI * 2);
    ctx.fill();

    // هدر پیرامید
    ctx.fillStyle = '#e85d9e';
    ctx.font = 'bold 42px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('پیرامید', W - 80, 110);

    ctx.font = '600 22px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#806b78';
    ctx.fillText('کارنامه‌ی هفتگی', W - 80, 150);

    // تاریخ
    const start = days[0].date, end = days[6].date;
    ctx.font = '500 20px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(faRange(start, end), W - 80, 190);

    // عنوان بزرگ
    ctx.fillStyle = '#3d2635';
    ctx.font = 'bold 60px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(weekOffset === 0 ? 'این هفته' : weekOffset === -1 ? 'هفته‌ی گذشته' : 'هفته', W - 80, 320);

    // کارت‌های آمار
    const stats = [
      { label:'دقیقه‌ی کل', value: toFa(total) },
      { label:'میانگین روزانه', value: toFa(avg) },
      { label:'روزهای فعال', value: toFa(activeDays) + '/۷' },
      { label:'جلسات', value: toFa(sessions) }
    ];

    const cardW = (W - 200) / 2 - 15;
    const cardH = 180;
    stats.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 80 + col * (cardW + 30);
      const y = 380 + row * (cardH + 20);

      // کارت
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      roundRect(ctx, x, y, cardW, cardH, 28);
      ctx.fill();

      // عدد
      ctx.fillStyle = '#c83f7f';
      ctx.font = 'bold 68px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.value, x + cardW/2, y + 95);

      // برچسب
      ctx.fillStyle = '#806b78';
      ctx.font = '600 22px Vazirmatn, Tahoma, sans-serif';
      ctx.fillText(s.label, x + cardW/2, y + 140);
    });

    // نمودار ستونی
    const chartY = 850;
    const chartH = 300;
    const chartX = 80;
    const chartW = W - 160;

    ctx.fillStyle = '#3d2635';
    ctx.font = 'bold 32px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('نمودار هفته', W - 80, chartY - 30);

    const max = Math.max(...days.map(d => d.minutes), 30);
    const barGap = 20;
    const barW = (chartW - barGap * 6) / 7;

    days.forEach((d, i) => {
      const x = chartX + i * (barW + barGap);
      const h = Math.max(10, (d.minutes / max) * (chartH - 60));
      const y = chartY + chartH - h - 40;

      // میله
      const grad = ctx.createLinearGradient(0, y, 0, chartY + chartH);
      grad.addColorStop(0, '#c78ae8');
      grad.addColorStop(1, '#e85d9e');
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, barW, h, 14);
      ctx.fill();

      // مقدار
      ctx.fillStyle = '#c83f7f';
      ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(toFa(d.minutes), x + barW/2, y - 12);

      // برچسب
      ctx.fillStyle = '#806b78';
      ctx.font = '600 20px Vazirmatn, Tahoma, sans-serif';
      ctx.fillText(d.label, x + barW/2, chartY + chartH + 10);
    });

    // بهترین روز
    ctx.textAlign = 'right';
    ctx.fillStyle = '#3d2635';
    ctx.font = 'bold 32px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('🏆 بهترین روز', W - 80, 1330);

    ctx.fillStyle = 'rgba(255,255,255,.8)';
    roundRect(ctx, 80, 1360, W - 160, 140, 24);
    ctx.fill();

    ctx.fillStyle = '#c83f7f';
    ctx.font = 'bold 48px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(best.minutes > 0 ? best.label : '—', W - 120, 1430);

    ctx.fillStyle = '#806b78';
    ctx.font = '600 26px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(best.minutes > 0 ? toFa(best.minutes) + ' دقیقه مطالعه' : 'هیچ فعالیتی', W - 120, 1475);

    // Footer
    ctx.fillStyle = '#ad9da8';
    ctx.font = '500 22px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ساخته‌شده با پیرامید 💜', W/2, H - 80);
    ctx.font = '500 18px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(new Date().toLocaleDateString('fa-IR'), W/2, H - 45);

    // دانلود
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const d = new Date();
      a.download = `piramid-weekly-${dateKey(d)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      if(window.showToast) window.showToast('📸 کارنامه دانلود شد', 'success');
    }, 'image/png');
  }

  function roundRect(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ==================== رندر کل ==================== */
  function renderAll(){
    const days = collectWeek(weekOffset);
    const prevDays = weekOffset <= 0 ? collectWeek(weekOffset - 1) : null;

    renderCover(days, prevDays);
    renderChart(days);
    renderCards(days);
    renderAnalysis(days, prevDays);
    renderCompare(days, prevDays);
  }

  /* ==================== Bind ==================== */
  $('#wrShareBtn')?.addEventListener('click', exportPNG);
  $('#wrPrevWeekBtn')?.addEventListener('click', () => {
    weekOffset--;
    renderAll();
  });

  /* ==================== شروع ==================== */
  renderAll();

  console.log('%c📊 Weekly Report ready', 'color:#e85d9e;font-weight:700;');
});