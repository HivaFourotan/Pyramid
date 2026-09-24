/* ======================================================================
   PIRAMID — gpa.js
   ماشین‌حساب معدل + تراز سوابق تحصیلی + تأثیر کنکور
   ====================================================================== */
'use strict';

window.addEventListener('load', () => {
  console.log('🎓 GPA: شروع...');

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');

  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const setLS = (k, v) => {
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  };

  /* ==================== داده‌ی دروس ==================== */
  // دروس عمومی مشترک همه‌ی رشته‌ها
  const GENERAL = [
    { id:'farsi',   name:'فارسی',        icon:'📖', type:'general' },
    { id:'arabi',   name:'عربی',         icon:'🌙', type:'general' },
    { id:'dini',    name:'دین و زندگی',  icon:'🕌', type:'general' },
    { id:'zaban',   name:'زبان انگلیسی', icon:'🔤', type:'general' }
  ];

  // دروس تخصصی هر رشته
  const MAJOR_SUBJECTS = {
    tajrobi: [
      { id:'zist',  name:'زیست‌شناسی',  icon:'🧬', type:'special' },
      { id:'riazi', name:'ریاضی',      icon:'📐', type:'special' },
      { id:'fizik', name:'فیزیک',      icon:'⚛️', type:'special' },
      { id:'shimi', name:'شیمی',       icon:'🧪', type:'special' }
    ],
    riazi: [
      { id:'hesab', name:'حسابان',      icon:'📊', type:'special' },
      { id:'hindse',name:'هندسه',       icon:'📐', type:'special' },
      { id:'riazi', name:'ریاضیات',     icon:'🔢', type:'special' },
      { id:'fizik', name:'فیزیک',       icon:'⚛️', type:'special' },
      { id:'shimi', name:'شیمی',        icon:'🧪', type:'special' }
    ],
    ensani: [
      { id:'adabiat', name:'ادبیات اختصاصی', icon:'📚', type:'special' },
      { id:'arabi',   name:'عربی اختصاصی',   icon:'🌙', type:'special' },
      { id:'tarikh',  name:'تاریخ',          icon:'📜', type:'special' },
      { id:'joghrafi',name:'جغرافیا',        icon:'🗺️', type:'special' },
      { id:'ejtemaei',name:'علوم اجتماعی',   icon:'👥', type:'special' },
      { id:'falsafe', name:'فلسفه و منطق',   icon:'💭', type:'special' },
      { id:'eqtesad', name:'اقتصاد',         icon:'💰', type:'special' }
    ],
    honar: [
      { id:'dars',    name:'درک عمومی هنر',  icon:'🎨', type:'special' },
      { id:'khalaghi',name:'خلاقیت تصویری',  icon:'🖌️', type:'special' },
      { id:'tarikh-h',name:'تاریخ هنر ایران',icon:'🏛️', type:'special' },
      { id:'jahan',   name:'تاریخ هنر جهان', icon:'🌍', type:'special' }
    ]
  };

  const MAJORS = [
    { id:'tajrobi', name:'تجربی',       icon:'🧬' },
    { id:'riazi',   name:'ریاضی فیزیک', icon:'📐' },
    { id:'ensani',  name:'انسانی',      icon:'📚' },
    { id:'honar',   name:'هنر',         icon:'🎨' }
  ];

  /* ==================== ذخیره‌سازی ==================== */
  const LS_KEY = 'piramid_gpa_data';
  let data = getLS(LS_KEY, {
    major: 'tajrobi',
    years: { 10:{}, 11:{}, 12:{} }
  });

  function save(){ setLS(LS_KEY, data); }

  let currentYear = 10;

  /* ==================== ابزار ==================== */
  function getSubjectsFor(major, year){
    const special = MAJOR_SUBJECTS[major] || [];
    // یازدهم و دهم تخصصی کمتری دارن، ولی برای ساده‌سازی همون‌ها رو نشون می‌دیم
    return [...GENERAL, ...special];
  }

  function getSubjectName(id){
    const all = [...GENERAL, ...Object.values(MAJOR_SUBJECTS).flat()];
    const s = all.find(x => x.id === id);
    return s || { name:id, icon:'📘', type:'general' };
  }

  /* ==================== رندر گروه‌ها ==================== */
  function renderMajorGrid(){
    const box = $('#gpaMajorGrid');
    if(!box) return;

    box.innerHTML = '';
    MAJORS.forEach(m => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gpa-major' + (data.major === m.id ? ' active' : '');
      b.innerHTML = `<span class="gpa-major-icon">${m.icon}</span>${m.name}`;
      b.addEventListener('click', () => {
        data.major = m.id;
        save();
        renderMajorGrid();
        renderYearContent();
      });
      box.appendChild(b);
    });
  }

  /* ==================== رندر تب‌ها ==================== */
  function renderYearTabs(){
    $$('.gpa-year-tab').forEach(b => {
      b.classList.toggle('active', +b.dataset.year === currentYear);
    });
  }

  /* ==================== رندر دروس ==================== */
  function renderYearContent(){
    const box = $('#gpaYearContent');
    if(!box) return;

    const subjects = getSubjectsFor(data.major, currentYear);
    const yearData = data.years[currentYear] || {};

    box.innerHTML = '';
    subjects.forEach(s => {
      const val = yearData[s.id] || '';
      const row = document.createElement('div');
      row.className = 'gpa-subject-row' + (val ? ' filled' : '');
      row.innerHTML = `
        <div class="gpa-subject-icon">${s.icon}</div>
        <div class="gpa-subject-info">
          <div class="gpa-subject-name">${s.name}</div>
          <div class="gpa-subject-type">${s.type === 'general' ? 'عمومی' : 'تخصصی'}</div>
        </div>
        <input type="number"
               class="gpa-subject-input"
               data-subject="${s.id}"
               min="0"
               max="20"
               step="0.25"
               value="${val}"
               placeholder="۰">
      `;

      const inp = row.querySelector('input');
      inp.addEventListener('input', () => {
        let v = parseFloat(inp.value);
        if(isNaN(v)) v = null;
        else v = Math.max(0, Math.min(20, v));

        if(v !== null){
          data.years[currentYear][s.id] = v;
          row.classList.add('filled');
        } else {
          delete data.years[currentYear][s.id];
          row.classList.remove('filled');
        }
        save();
      });

      box.appendChild(row);
    });
  }

  /* ==================== محاسبه ==================== */
  function calcAvg(subjects){
    const yearData = data.years;
    let sum = 0, count = 0;

    subjects.forEach(s => {
      for(let y = 10; y <= 12; y++){
        const v = yearData[y]?.[s.id];
        if(typeof v === 'number'){
          sum += v;
          count++;
        }
      }
    });

    return count > 0 ? sum / count : 0;
  }

  function calcYearAvg(year, subjects){
    let sum = 0, count = 0;
    subjects.forEach(s => {
      const v = data.years[year]?.[s.id];
      if(typeof v === 'number'){
        sum += v;
        count++;
      }
    });
    return count > 0 ? sum / count : 0;
  }

  function calculate(){
    const special = MAJOR_SUBJECTS[data.major] || [];
    const allSubjects = [...GENERAL, ...special];

    // معدل کل = میانگین همه‌ی نمرات موجود
    let totalSum = 0, totalCount = 0;
    const yearAvgs = {};

    [10, 11, 12].forEach(y => {
      let sum = 0, count = 0;
      allSubjects.forEach(s => {
        const v = data.years[y]?.[s.id];
        if(typeof v === 'number'){
          sum += v;
          count++;
          totalSum += v;
          totalCount++;
        }
      });
      yearAvgs[y] = count > 0 ? sum / count : 0;
    });

    const totalAvg = totalCount > 0 ? totalSum / totalCount : 0;

    // معدل کتبی = میانگین دروس تخصصی + عمومی سال دوازدهم
    const year12 = data.years[12] || {};
    let wSum = 0, wCount = 0;
    [...GENERAL, ...special].forEach(s => {
      const v = year12[s.id];
      if(typeof v === 'number'){
        wSum += v;
        wCount++;
      }
    });
    const writtenAvg = wCount > 0 ? wSum / wCount : totalAvg;

    // تراز سوابق — فرمول تقریبی
    // میانگین کشوری ~۱۴ → تراز ۵۰۰۰
    // معدل ۲۰ → تراز ~۱۰۰۰۰
    let taraz = Math.round(5000 + (totalAvg - 14) * 830);
    taraz = Math.max(2000, Math.min(10500, taraz));

    // سطح
    let level = 'متوسط';
    if(totalAvg >= 19) level = 'عالی';
    else if(totalAvg >= 17.5) level = 'خوب';
    else if(totalAvg >= 15) level = 'متوسط';
    else if(totalAvg >= 12) level = 'قابل بهبود';
    else level = 'نیاز به تلاش';

    // تأثیر روی کنکور
    const impactPct = 40;
    const sEffect = (taraz / 12000) * impactPct; // از ۴۰
    const konkurEffect = impactPct - sEffect;

    return {
      totalAvg, writtenAvg, taraz, level,
      yearAvgs,
      sEffect: Math.round(sEffect * 10) / 10,
      konkurEffect: Math.round(konkurEffect * 10) / 10
    };
  }

  /* ==================== نمایش نتایج ==================== */
  function renderResults(){
    const special = MAJOR_SUBJECTS[data.major] || [];
    const allSubjects = [...GENERAL, ...special];

    // چک کن حداقل یه نمره وارد شده
    let hasAny = false;
    for(let y = 10; y <= 12; y++){
      if(Object.keys(data.years[y] || {}).length > 0){ hasAny = true; break; }
    }
    if(!hasAny){
      if(window.showToast) window.showToast('اول حداقل یه نمره وارد کن', 'error');
      return;
    }

    const r = calculate();

    const results = $('#gpaResults');
    if(results) results.style.display = 'flex';

    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
    set('gpaTotalAvg', toFa(r.totalAvg.toFixed(2)));
    set('gpaWrittenAvg', toFa(r.writtenAvg.toFixed(2)));
    set('gpaTaraz', toFa(r.taraz));
    set('gpaLevel', r.level);

    // نوار تأثیر
    const fill1 = $('#gpaImpactFill');
    const fill2 = $('#gpaKonkurFill');
    setTimeout(() => {
      if(fill1) fill1.style.width = (r.sEffect / 40 * 100) + '%';
      if(fill2) fill2.style.width = (r.konkurEffect / 40 * 100) + '%';
    }, 100);

    set('gpaImpactValue', toFa(r.sEffect.toFixed(1)) + ' از ۴۰');
    set('gpaKonkurValue', toFa(r.konkurEffect.toFixed(1)) + ' از ۴۰');

    renderAnalysis(r);
    renderTables(r, allSubjects);

    // اسکرول به نتایج
    setTimeout(() => {
      results?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 200);
  }

  /* ==================== تحلیل ==================== */
  function renderAnalysis(r){
    const box = $('#gpaAnalysis');
    if(!box) return;

    const items = [];

    // تحلیل کلی
    if(r.totalAvg >= 19){
      items.push({
        icon:'🏆', type:'good',
        text: `<b>معدل عالی!</b> با معدل ${toFa(r.totalAvg.toFixed(2))} در جایگاه بسیار خوبی هستی. فقط کنکور رو جدی بگیر.`
      });
    } else if(r.totalAvg >= 17){
      items.push({
        icon:'✨', type:'good',
        text: `<b>معدل خوب</b> — ${toFa(r.totalAvg.toFixed(2))}. اگه کنکورت هم قوی باشه، رتبه‌ی خیلی خوبی می‌گیری.`
      });
    } else if(r.totalAvg >= 14){
      items.push({
        icon:'📈', type:'info',
        text: `<b>معدل متوسط</b> — ${toFa(r.totalAvg.toFixed(2))}. تمرکز روی کنکور می‌تونه جبران‌کننده باشه.`
      });
    } else {
      items.push({
        icon:'⚠️', type:'warn',
        text: `<b>معدل پایین</b> — سوابق ${toFa(r.sEffect.toFixed(1))} از ۴۰ نمره رو می‌گیره. باید توی کنکور بدرخشی.`
      });
    }

    // مقایسه معدل کل با کتبی
    const diff = r.writtenAvg - r.totalAvg;
    if(Math.abs(diff) > 0.5){
      if(diff > 0){
        items.push({
          icon:'📖', type:'info',
          text: `<b>معدل کتبی بالاتر</b> — یعنی نمرات سال دوازدهم و نهایی‌هات بهتر از میانگین کلی‌ست. خوبه!`
        });
      } else {
        items.push({
          icon:'📚', type:'warn',
          text: `<b>معدل کتبی پایین‌تر از کل</b> — سعی کن روی سال دوازدهم و نهایی‌ها بیشتر تمرکز کنی.`
        });
      }
    }

    // کدوم سال ضعیف‌تره
    const ys = [r.yearAvgs[10], r.yearAvgs[11], r.yearAvgs[12]].filter(v => v > 0);
    if(ys.length > 1){
      const minY = Math.min(...ys);
      let weakYear = 'دهم';
      if(r.yearAvgs[11] === minY && r.yearAvgs[11] > 0) weakYear = 'یازدهم';
      if(r.yearAvgs[12] === minY && r.yearAvgs[12] > 0) weakYear = 'دوازدهم';
      items.push({
        icon:'🎯', type:'info',
        text: `<b>ضعیف‌ترین سالت:</b> ${weakYear} با معدل ${toFa(minY.toFixed(2))}. اگه می‌تونی ترمیم معدل بزن، اینو هدف بذار.`
      });
    }

    // توصیه
    if(r.sEffect < 25){
      items.push({
        icon:'💡', type:'info',
        text: `<b>استراتژی:</b> تمرکز اصلی رو بذار روی کنکور (${toFa(r.konkurEffect.toFixed(1))} از ۴۰). با رتبه‌ی خوب، سوابق پایین جبران می‌شه.`
      });
    } else {
      items.push({
        icon:'💪', type:'good',
        text: `<b>سوابق قوی</b> — ${toFa(r.sEffect.toFixed(1))} از ۴۰ نمره رو گرفتی. حالا کنکور رو هم بترکون!`
      });
    }

    box.innerHTML = items.map((it, i) => `
      <div class="gpa-ana-item ${it.type}" style="animation:gpaResultIn .4s ${i * 0.08}s both">
        <div class="gpa-ana-icon">${it.icon}</div>
        <div>${it.text}</div>
      </div>
    `).join('');
  }

  /* ==================== جدول‌ها ==================== */
  function renderTables(r, subjects){
    const box = $('#gpaTables');
    if(!box) return;

    box.innerHTML = '';

    [10, 11, 12].forEach(y => {
      const yearData = data.years[y] || {};
      const filled = subjects.filter(s => typeof yearData[s.id] === 'number');
      if(filled.length === 0) return;

      const avg = r.yearAvgs[y];
      const label = y === 10 ? 'دهم' : y === 11 ? 'یازدهم' : 'دوازدهم';

      const wrap = document.createElement('div');
      wrap.className = 'gpa-table-wrap';

      const rows = filled.map(s => {
        const name = getSubjectName(s.id);
        return `<tr><td>${name.icon} ${name.name}</td><td>${toFa(yearData[s.id].toFixed(2))}</td></tr>`;
      }).join('');

      wrap.innerHTML = `
        <div class="gpa-table-head">📅 سال ${label}</div>
        <table class="gpa-table">
          ${rows}
          <tr class="avg"><td>میانگین سال</td><td>${toFa(avg.toFixed(2))}</td></tr>
        </table>
      `;

      box.appendChild(wrap);
    });
  }

  /* ==================== Reset ==================== */
  function resetAll(){
    if(!confirm('همه‌ی نمرات پاک بشه؟')) return;
    data.years = { 10:{}, 11:{}, 12:{} };
    save();
    renderYearContent();
    $('#gpaResults').style.display = 'none';
    if(window.showToast) window.showToast('🗑 پاک شد', 'info');
  }

  /* ==================== Bind ==================== */
  $$('.gpa-year-tab').forEach(b => {
    b.addEventListener('click', () => {
      currentYear = parseInt(b.dataset.year, 10);
      renderYearTabs();
      renderYearContent();
    });
  });

  $('#gpaCalcBtn')?.addEventListener('click', renderResults);
  $('#gpaResetBtn')?.addEventListener('click', resetAll);

  /* ==================== شروع ==================== */
  renderMajorGrid();
  renderYearTabs();
  renderYearContent();

  console.log('%c🎓 GPA ready', 'color:#e85d9e;font-weight:700;');
});