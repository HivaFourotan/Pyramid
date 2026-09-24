/* ===== Estimate Page ===== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const MAJORS = {
    tajrobi: {
      title:'علوم تجربی', icon:'🧬',
      lessons:[
        { key:'zist', name:'زیست‌شناسی', coef:12 },
        { key:'riazi', name:'ریاضی', coef:4 },
        { key:'fizik', name:'فیزیک', coef:7 },
        { key:'shimi', name:'شیمی', coef:7 },
        { key:'adabiat', name:'ادبیات', coef:4 },
        { key:'arabi', name:'عربی', coef:2 },
        { key:'dini', name:'دین و زندگی', coef:3 },
        { key:'zaban', name:'زبان', coef:2 }
      ]
    },
    riazi: {
      title:'ریاضی و فیزیک', icon:'📐',
      lessons:[
        { key:'riazi', name:'ریاضیات', coef:12 },
        { key:'fizik', name:'فیزیک', coef:9 },
        { key:'shimi', name:'شیمی', coef:7 },
        { key:'adabiat', name:'ادبیات', coef:4 },
        { key:'arabi', name:'عربی', coef:2 },
        { key:'dini', name:'دین و زندگی', coef:3 },
        { key:'zaban', name:'زبان', coef:2 }
      ]
    },
    ensani: {
      title:'علوم انسانی', icon:'📚',
      lessons:[
        { key:'riazi', name:'ریاضی', coef:4 },
        { key:'eqtesad', name:'اقتصاد', coef:2 },
        { key:'adabiat', name:'ادبیات', coef:8 },
        { key:'arabi', name:'عربی', coef:5 },
        { key:'tarikh', name:'تاریخ و جغرافیا', coef:5 },
        { key:'ejtemaei', name:'علوم اجتماعی', coef:5 },
        { key:'falsafe', name:'فلسفه و منطق', coef:5 },
        { key:'dini', name:'دین و زندگی', coef:3 },
        { key:'zaban', name:'زبان', coef:2 }
      ]
    },
    honar: {
      title:'هنر', icon:'🎨',
      lessons:[
        { key:'dars', name:'درک عمومی هنر', coef:6 },
        { key:'khalaghi', name:'خلاقیت تصویری', coef:4 },
        { key:'tarikh', name:'تاریخ هنر ایران', coef:2 },
        { key:'jahan', name:'تاریخ هنر جهان', coef:2 },
        { key:'adabiat', name:'ادبیات', coef:2 },
        { key:'dini', name:'دین و زندگی', coef:2 },
        { key:'zaban', name:'زبان', coef:2 }
      ]
    }
  };

  // رشته‌های سفارشی مالک را هم اضافه کن
  try{
    const custom = JSON.parse(localStorage.getItem('piramid_customMajors') || '[]');
    custom.forEach(m => {
      if(!MAJORS[m.key]){
        MAJORS[m.key] = { title:m.title, icon:'📘', lessons:[
          { key:'general', name:'درصد کلی', coef:1 }
        ]};
      }
    });
  }catch(e){}

  const majorGrid = document.getElementById('majorGrid');
  const fieldsGrid = document.getElementById('fieldsGrid');
  const resultBox = document.getElementById('resultBox');
  const resTaraz = document.getElementById('resTaraz');
  const resRank = document.getElementById('resRank');
  const resChart = document.getElementById('resChart');

  let selectedMajor = null;

  function renderMajors(){
    majorGrid.innerHTML = '';
    Object.entries(MAJORS).forEach(([key, m]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'major-btn';
      btn.dataset.key = key;
      btn.innerHTML = `<div class="major-icon">${m.icon}</div>${m.title}`;
      btn.addEventListener('click', () => {
        selectedMajor = key;
        document.querySelectorAll('.major-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderFields();
        resultBox.style.display = 'none';
      });
      majorGrid.appendChild(btn);
    });

    // پشتیبانی از ?m= در URL
    const params = new URLSearchParams(window.location.search);
    const m = params.get('m');
    if(m && MAJORS[m]){
      const btn = majorGrid.querySelector(`[data-key="${m}"]`);
      btn?.click();
    }
  }

  function renderFields(){
    if(!selectedMajor){ fieldsGrid.innerHTML = ''; return; }
    fieldsGrid.innerHTML = '';
    MAJORS[selectedMajor].lessons.forEach(l => {
      const div = document.createElement('div');
      div.className = 'field-box';
      div.innerHTML = `
        <label for="f_${l.key}">${l.name} (ضریب ${l.coef})</label>
        <input type="number" id="f_${l.key}" data-key="${l.key}" min="-33" max="100" placeholder="۰">
      `;
      fieldsGrid.appendChild(div);
    });
  }

  document.getElementById('calcBtn2')?.addEventListener('click', () => {
    if(!selectedMajor){ window.showToast && window.showToast('اول گروه آزمایشی رو انتخاب کن','error'); return; }
    const lessons = MAJORS[selectedMajor].lessons;
    let sumW = 0, sumC = 0;
    const percents = {};
    lessons.forEach(l => {
      const v = parseFloat(document.getElementById('f_'+l.key)?.value || '0') || 0;
      const clamped = Math.max(-33, Math.min(100, v));
      percents[l.key] = clamped;
      sumW += clamped * l.coef;
      sumC += l.coef;
    });
    const avg = sumC > 0 ? sumW / sumC : 0;
    let taraz = Math.round(5000 + avg * 35);
    taraz = Math.max(2000, Math.min(12000, taraz));

    let rank;
    if(taraz >= 11000) rank = Math.max(1, Math.round((12000 - taraz) * 1.5));
    else if(taraz >= 9000) rank = Math.round((12000 - taraz) * 8);
    else if(taraz >= 7000) rank = Math.round((12000 - taraz) * 30);
    else if(taraz >= 5000) rank = Math.round((12000 - taraz) * 100);
    else rank = Math.round((12000 - taraz) * 400);
    rank = Math.max(1, rank);

    // نمایش
    resultBox.style.display = 'block';
    animateNumber(resTaraz, 0, taraz, 1200);
    resRank.textContent = 'رتبه تخمینی: ' + toFa(formatNum(rank));

    // نمودار
    resChart.innerHTML = '';
    lessons.forEach((l, i) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      const p = Math.max(0, percents[l.key]);
      bar.dataset.v = toFa(Math.round(p)) + '٪';
      resChart.appendChild(bar);
      setTimeout(() => { bar.style.height = Math.min(100, p) + '%'; }, i * 70);
    });

    // ذخیره در localStorage
    try{
      const list = JSON.parse(localStorage.getItem('piramid_estimates') || '[]');
      list.push({ major:selectedMajor, taraz, rank, percents, date:new Date().toISOString() });
      if(list.length > 50) list.splice(0, list.length - 50);
      localStorage.setItem('piramid_estimates', JSON.stringify(list));
    }catch(e){}
    
    // XP برای تخمین جدید
    if(window.PiramidXP){
      window.PiramidXP.add(25);
      window.dispatchEvent(new CustomEvent('piramid:estimate'));
    }
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('.field-box input').forEach(i => i.value = '');
    resultBox.style.display = 'none';
  });

  function animateNumber(el, from, to, dur){
    const t0 = performance.now();
    function tick(now){
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (to - from) * eased);
      el.textContent = toFa(formatNum(v));
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  renderMajors();
});