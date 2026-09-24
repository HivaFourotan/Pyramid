/* ======================================================================
   PIRAMID — script.js v2
   لاگین + مالک + اعلانات + ماشین‌حساب + کلاس آنلاین + شیشه‌ای
   بدون رنگین‌کمانی — بدون افکت‌های متنی متناقض
   ====================================================================== */
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

function toFa(s){
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(s).split('').map(c => fa[+c] || c).join('');
}
function formatNum(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function escapeHtml(str){ const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function _oh(s){
  var a = 0xdeadbeef, b = 0x41c6ce57;
  for(var i = 0; i < s.length; i++){
    var c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 2654435761);
    b = Math.imul(b ^ c, 1597334677);
  }
  a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909);
  b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909);
  return (b >>> 0).toString(16).padStart(8, '0') + (a >>> 0).toString(16).padStart(8, '0');
}
/* ===================== 0) ثابت‌ها ===================== */
const OWNER_PASSWORD = 'پیرامید خیلی خوب است';
const LS = {
  user:      'piramid_user',
  role:      'piramid_role',
  theme:     'piramid_theme',
  themeMode: 'piramid_themeMode',
  fontSize:  'piramid_fontSize',
  blobs:     'piramid_blobs',
  particles: 'piramid_particles',
  aurora:    'piramid_fxAurora',
  crystal:   'piramid_fxCrystal',
  moon:      'piramid_moon',
  lightning: 'piramid_lightning',
  cookie:    'piramid_cookie',
  anns:      'piramid_announcements',
  majors:    'piramid_customMajors',
  profile:   'piramid_profile'
};

/* ===================== 1) Page Transition ===================== */
window.addEventListener('load', () => {
  setTimeout(() => {
    const pt = $('#pageTransition');
    if(pt){ pt.classList.add('enter'); setTimeout(() => pt.classList.remove('enter'), 750); }
  }, 200);
});

/* ===================== 2) تم‌ها ===================== */
const THEMES = [
  { p:'#e85d9e', d:'#c83f7f', s:'#fff0f7', g2:'#f28fbd', g3:'#c78ae8' },
  { p:'#4a90d9', d:'#2f6fb5', s:'#eef5fc', g2:'#7bb3e8', g3:'#8b7fe0' },
  { p:'#3bb89a', d:'#2a9179', s:'#eaf8f4', g2:'#6fd0b6', g3:'#8bd0a0' },
  { p:'#8b5cf6', d:'#6d3fd4', s:'#f3efff', g2:'#a98af8', g3:'#c78ae8' },
  { p:'#e8874a', d:'#c96a2f', s:'#fdf2ea', g2:'#f0a878', g3:'#e8b06b' },
  { p:'#39ff14', d:'#1ea30a', s:'#f0fff0', g2:'#6fff4f', g3:'#a0ff8a' },
  { p:'#1e3a8a', d:'#0f2352', s:'#eef2ff', g2:'#3b5ec7', g3:'#5a7be0' },
  { p:'#06b6d4', d:'#0891b2', s:'#ecfeff', g2:'#22d3ee', g3:'#67e8f9' },
  { p:'#4c1d95', d:'#2e1065', s:'#f5f3ff', g2:'#7c3aed', g3:'#a78bfa' },
  { p:'#10b981', d:'#059669', s:'#ecfdf5', g2:'#34d399', g3:'#6ee7b7' },
  { p:'#0c4a6e', d:'#082f49', s:'#f0f9ff', g2:'#0284c7', g3:'#38bdf8' },
  { p:'#f59e0b', d:'#d97706', s:'#fffbeb', g2:'#fbbf24', g3:'#fcd34d' },
  { p:'#ea580c', d:'#c2410c', s:'#fff7ed', g2:'#f97316', g3:'#fb923c' },
  { p:'#22c55e', d:'#16a34a', s:'#f0fdf4', g2:'#4ade80', g3:'#86efac' }
];
const root = document.documentElement;

function hexToRgb(h){ const n = parseInt(h.replace('#',''),16); return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 }; }
function lighten(hex, pct){
  const { r,g,b } = hexToRgb(hex);
  const f = c => Math.min(255, Math.round(c + (255-c)*(pct/100)));
  return '#' + [f(r),f(g),f(b)].map(x => x.toString(16).padStart(2,'0')).join('');
}
window.applyTheme = applyTheme;
function applyTheme(i){
  if(!THEMES[i]) i = 0;
  const t = THEMES[i];
  root.style.setProperty('--primary', t.p);
  root.style.setProperty('--primary-dark', t.d);
  root.style.setProperty('--primary-soft', t.s);
  root.style.setProperty('--primary-g2', t.g2);
  root.style.setProperty('--primary-g3', t.g3);
  root.style.setProperty('--border', lighten(t.p, 78));
  const rgb = hexToRgb(t.p);
  root.style.setProperty('--shadow',       `0 4px 12px rgba(${rgb.r},${rgb.g},${rgb.b},.08)`);
  root.style.setProperty('--shadow-lg',    `0 16px 40px rgba(${rgb.r},${rgb.g},${rgb.b},.16)`);
  root.style.setProperty('--shadow-brand', `0 12px 30px rgba(${rgb.r},${rgb.g},${rgb.b},.28)`);
  try{ localStorage.setItem(LS.theme, i); }catch(e){}
  $$('.color-swatch').forEach(el => el.classList.toggle('active', +el.dataset.theme === i));
}
window.applyMode = applyMode;
function applyMode(mode){
  let dark = false;
  if(mode === 'dark') dark = true;
  else if(mode === 'auto'){
    const h = new Date().getHours();
    dark = h >= 19 || h < 6;
  }
  document.body.classList.toggle('dark', dark);
  $$('.quick-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  try{ localStorage.setItem(LS.themeMode, mode); }catch(e){}
}

function applyFontSize(size){
  root.style.setProperty('--base-font', size + 'px');
  document.body.style.fontSize = size + 'px';
  try{ localStorage.setItem(LS.fontSize, size); }catch(e){}
  const v = $('#fontValue'); if(v) v.textContent = toFa(size) + ' پیکسل';
}

/* ===================== 3) لاگین / مالک ===================== */
function getUser(){ try{ return JSON.parse(localStorage.getItem(LS.user) || 'null'); }catch(e){ return null; } }
function setUser(u){ try{ localStorage.setItem(LS.user, JSON.stringify(u)); }catch(e){} }
function getRole(){ try{ return localStorage.getItem(LS.role) || 'guest'; }catch(e){ return 'guest'; } }
function setRole(r){ try{ localStorage.setItem(LS.role, r); }catch(e){} }
function updateHeaderAccount(){
  const u = getUser();
  const role = getRole();
  const av = $('#headerAvatar');
  const nm = $('#headerName');
  const rl = $('#headerRole');
  const badge = $('#ownerBadge');

  if(u && u.username){
    if(av){
      if(u.avatar){ av.style.backgroundImage = `url(${u.avatar})`; av.textContent = ''; }
      else { av.style.backgroundImage = ''; av.textContent = u.username.charAt(0).toUpperCase(); }
    }
    if(nm) nm.textContent = u.displayName || u.username;
    if(rl){
      if(role === 'owner') rl.textContent = 'مدیر سیستم';
      else rl.textContent = 'دانش‌آموز';
    }
    if(badge) badge.style.display = (role === 'owner') ? 'inline-flex' : 'none';
    if(badge) badge.onclick = () => { window.location.href = 'owner.html'; };
  } else {
    if(av){ av.textContent = '؟'; av.style.backgroundImage = ''; }
    if(nm) nm.textContent = 'مهمان';
    if(rl) rl.textContent = 'وارد نشده';
    if(badge) badge.style.display = 'none';
  }
}
function showLoginIfNeeded(){
  const u = getUser();
  if(u) return;
  buildLoginModal();
  const overlay = $('#loginOverlay');
  if(!overlay) return;
  overlay.dataset.locked = '1';
  requestAnimationFrame(function(){
    overlay.classList.add('open');
    setTimeout(function(){
      var el = document.getElementById('loginUser');
      if(el) el.focus();
    }, 200);
  });
}

function buildLoginModal(){
  if($('#loginOverlay')) return;
  var html =
    '<div class="modal-overlay login-overlay" id="loginOverlay" role="dialog" aria-modal="true">' +
      '<div class="modal-card login-card glass">' +
        '<div class="login-head">' +
          '<div class="login-logo">' +
            '<svg viewBox="0 0 48 48" fill="none"><path d="M24 4 L44 40 H4 Z" fill="currentColor" opacity=".85"/><path d="M24 4 L34 22 L14 22 Z" fill="currentColor"/></svg>' +
          '</div>' +
          '<h2>خوش اومدی 👋</h2>' +
          '<p>برای ورود، نام کاربری و رمزت رو وارد کن.</p>' +
        '</div>' +
        '<form id="loginForm" class="login-form">' +
          '<label><span>نام کاربری</span><input type="text" id="loginUser" required placeholder="مثلا: hiva" autocomplete="username"></label>' +
          '<label><span>رمز عبور</span><input type="password" id="loginPass" required placeholder="••••••••" autocomplete="current-password"></label>' +
          '<button type="submit" class="btn btn-solid login-submit">ورود</button>' +
          '<p class="login-hint">با هر نام کاربری و رمزی وارد شو</p>' +
        '</form>' +
      '</div>' +
    '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  bindLogin();
}function bindLogin(){
  const overlay = $('#loginOverlay');
  const form = $('#loginForm');
  if(!overlay || !form) return;
  if(form.dataset.bound === '1') return;
  form.dataset.bound = '1';

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const username = ($('#loginUser')?.value || '').trim();
    const pass = ($('#loginPass')?.value || '').trim();

    if(!username){ window.showToast && window.showToast('نام کاربری رو وارد کن','error'); return; }
    if(!pass){ window.showToast && window.showToast('رمز عبور رو وارد کن','error'); return; }
    if(pass.length < 3){ window.showToast && window.showToast('رمز حداقل ۳ کاراکتر','error'); return; }

    let role = 'student';
    if(pass === OWNER_PASSWORD) role = 'owner';

    const existing = getUser();
    let user;
    if(existing && existing.username === username){
      existing.role = role;
      user = existing;
    } else {
      user = {
        username: username,
        displayName: username,
        role: role,
        avatar: '',
        age: '',
        email: '',
        gradient: 'g1'
      };
    }

    setUser(user);
    setRole(role);

    overlay.classList.remove('open');
    overlay.dataset.locked = '';
    if($('#loginUser')) $('#loginUser').value = '';
    if($('#loginPass')) $('#loginPass').value = '';

    updateHeaderAccount();
    if(window.showToast){
      window.showToast(role === 'owner' ? '👑 خوش آمدی مالک' : '✨ خوش آمدی ' + username, 'success', 2500);
    }

    const addBtn = $('#ownerAddMajorBtn');
    if(addBtn) addBtn.style.display = (role === 'owner') ? 'flex' : 'none';

    const ret = sessionStorage.getItem('piramid_return');
    if(ret){
      sessionStorage.removeItem('piramid_return');
      setTimeout(function(){ window.location.href = ret; }, 400);
    }
  });
}
/* ===================== 3.5) Account Pill — چک لاگین قبل از ورود ===================== */
function bindAccountPill(){
  const pill = $('#accountPill');
  if(!pill) return;
  pill.addEventListener('click', function(e){
    const u = getUser();
    if(!u){
      e.preventDefault();
      try{ sessionStorage.setItem('piramid_return', 'account.html'); }catch(err){}
      buildLoginModal();
      const overlay = $('#loginOverlay');
      if(overlay){
        overlay.dataset.locked = '1';
        overlay.classList.add('open');
        setTimeout(function(){
          var el = document.getElementById('loginUser');
          if(el) el.focus();
        }, 200);
      }
      window.showToast && window.showToast('اول وارد شو','info', 2000);
    }
  });
}
/* ===================== 4) اعلانات ===================== */
function getAnnouncements(){
  try{ return JSON.parse(localStorage.getItem(LS.anns) || '[]'); }catch(e){ return []; }
}
function renderAnnouncements(){
  const list = getAnnouncements();
  const bar = $('#announcementsBar');
  const track = $('#annTrack');
  const grid = $('#annGrid');
  const empty = $('#annEmpty');

  if(list.length === 0){
    if(bar) bar.style.display = 'none';
    if(grid){
      grid.innerHTML = '';
      const p = document.createElement('p');
      p.className = 'empty-msg';
      p.textContent = 'هیچ اعلانی هنوز ثبت نشده است.';
      grid.appendChild(p);
    }
    return;
  }

  // نوار
  if(bar && track){
    bar.style.display = 'block';
    const latest = list[list.length - 1];
    track.innerHTML = `<b>${escapeHtml(latest.title)}</b> — ${escapeHtml(latest.text || '')}`;
  }

  // گرید
  if(grid){
    grid.innerHTML = '';
    list.slice().reverse().forEach(ann => {
      const card = document.createElement('article');
      card.className = 'ann-card glass';
      const img = ann.image
        ? `<img class="ann-img" src="${escapeHtml(ann.image)}" alt="${escapeHtml(ann.title)}">`
        : `<div class="ann-img" style="display:flex;align-items:center;justify-content:center;color:var(--primary);font-size:3em;">📢</div>`;
      card.innerHTML = `
        ${img}
        <div class="ann-body">
          <h4>${escapeHtml(ann.title)}</h4>
          <p>${escapeHtml(ann.text || '')}</p>
          <span class="ann-date">${escapeHtml(ann.date || '')}</span>
        </div>`;
      grid.appendChild(card);
    });
  }
}

/* ===================== 5) افزودن رشته توسط مالک ===================== */
function bindOwnerAddMajor(){
  const addBtn = $('#ownerAddMajorBtn');
  const overlay = $('#addMajorOverlay');
  const form = $('#addMajorForm');
  if(!addBtn || !overlay || !form) return;

  addBtn.addEventListener('click', e => {
    e.preventDefault();
    overlay.classList.add('open');
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = $('#newMajorTitle')?.value.trim();
    const key = $('#newMajorKey')?.value.trim().toLowerCase().replace(/\s+/g,'-');
    const order = parseInt($('#newMajorOrder')?.value || '10', 10);
    if(!title || !key){ window.showToast && window.showToast('عنوان و کلید لازمه','error'); return; }

    let custom = [];
    try{ custom = JSON.parse(localStorage.getItem(LS.majors) || '[]'); }catch(e){}
    custom.push({ title, key, order });
    custom.sort((a,b) => (a.order||10) - (b.order||10));
    try{ localStorage.setItem(LS.majors, JSON.stringify(custom)); }catch(e){}

    overlay.classList.remove('open');
    form.reset();
    renderMajorsDropdown();
    window.showToast && window.showToast('✅ رشته «' + title + '» اضافه شد','success');
  });
}

function renderMajorsDropdown(){
  const dd = $('#majorsDropdown');
  if(!dd) return;
  // پیش‌فرض‌ها
  const defaults = [
    { title:'تخمین کنکور تجربی', key:'tajrobi' },
    { title:'تخمین کنکور ریاضی', key:'riazi' },
    { title:'تخمین کنکور انسانی', key:'ensani' },
    { title:'تخمین کنکور هنر', key:'honar' }
  ];
  let custom = [];
  try{ custom = JSON.parse(localStorage.getItem(LS.majors) || '[]'); }catch(e){}

  const items = [...defaults, ...custom];
  dd.innerHTML = items.map(m =>
    `<a href="estimate.html?m=${encodeURIComponent(m.key)}"><span class="dot"></span>${escapeHtml(m.title)}</a>`
  ).join('');

  // دکمه‌ی افزودن برای مالک
  if(getRole() === 'owner'){
    const btn = document.createElement('button');
    btn.id = 'ownerAddMajorBtn';
    btn.type = 'button';
    btn.className = 'owner-add-major';
    btn.innerHTML = '<span class="dot plus"></span>+ افزودن رشته (فقط مالک)';
    dd.appendChild(btn);
    bindOwnerAddMajor();
  }
}

/* ===================== 6) کشوی تم ===================== */
function bindThemeDrawer(){
  const btn = $('#themeDrawerBtn');
  const drawer = $('#themeDrawer');
  const overlay = $('#themeDrawerOverlay');
  const closeBtn = $('#themeDrawerClose');
  if(!btn || !drawer || !overlay) return;

  const open = () => { drawer.classList.add('open'); overlay.classList.add('open'); drawer.setAttribute('aria-hidden','false'); };
  const close = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); };

  btn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
}

/* ===================== 7) دکمه‌های شناور (ماشین‌حساب، کلاس) ===================== */
function bindModalOpeners(){
  const openModal = id => {
    const m = document.getElementById(id);
    if(m) m.classList.add('open');
  };
  const bind = (btnId, modalId) => {
    const b = document.getElementById(btnId);
    if(b) b.addEventListener('click', () => openModal(modalId));
  };
  bind('calcBtn', 'calcOverlay');
  bind('classBtn', 'classOverlay');
  bind('openCalcNav', 'calcOverlay');
  bind('openClassNav', 'classOverlay');

  $$('[data-close]').forEach(b => {
    b.addEventListener('click', () => {
      const m = document.getElementById(b.dataset.close);
      if(m) m.classList.remove('open');
    });
  });
  $$('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => {
      // اگر مودال قفل باشه (مثل لاگین)، با کلیک بیرون بسته نشه
      if(e.target === ov && ov.dataset.locked !== '1') ov.classList.remove('open');
    });
  });
}

/* ===================== 8) ماشین‌حساب ===================== */
function bindCalculator(){
  const grid = $('#calcGrid');
  const disp = $('#calcDisplay');
  const hist = $('#calcHistory');
  if(!grid || !disp) return;

  let current = '0';
  let previous = null;
  let op = null;
  let justEvaluated = false;

  function updateDisplay(){ disp.textContent = current; }
  function updateHistory(){ if(hist) hist.textContent = previous !== null ? (previous + ' ' + op) : ''; }

  function inputNum(n){
    if(justEvaluated){ current = '0'; justEvaluated = false; }
    if(n === '.' && current.includes('.')) return;
    if(current === '0' && n !== '.') current = n;
    else current += n;
    updateDisplay();
  }
  function inputOp(o){
    if(op && previous !== null && !justEvaluated){
      // محاسبه‌ی زنجیره‌ای
      const r = compute(parseFloat(previous), parseFloat(current), op);
      current = String(r); previous = String(r);
      updateDisplay();
    } else {
      previous = current;
    }
    op = o;
    justEvaluated = false;
    updateHistory();
    current = '0';
  }
  function compute(a, b, o){
    switch(o){
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }
  function equals(){
    if(op === null || previous === null) return;
    const r = compute(parseFloat(previous), parseFloat(current), op);
    if(isNaN(r)) current = 'خطا';
    else current = String(+r.toFixed(10));
    previous = null; op = null; justEvaluated = true;
    updateDisplay(); updateHistory();
  }
  function clearAll(){ current = '0'; previous = null; op = null; justEvaluated = false; updateDisplay(); updateHistory(); }
  function toggleSign(){
    if(current.startsWith('-')) current = current.slice(1);
    else if(current !== '0') current = '-' + current;
    updateDisplay();
  }
  function percent(){
    const n = parseFloat(current);
    if(!isNaN(n)){ current = String(n/100); updateDisplay(); }
  }

  grid.addEventListener('click', e => {
    const b = e.target.closest('button');
    if(!b) return;
    const num = b.dataset.num;
    const opv = b.dataset.op;
    if(num !== undefined) inputNum(num);
    else if(opv === 'C') clearAll();
    else if(opv === '±') toggleSign();
    else if(opv === '%') percent();
    else if(opv === '=') equals();
    else if(opv) inputOp(opv);
  });
}

/* ===================== 9) کلاس آنلاین ===================== */
function bindClassForm(){
  const form = $('#classForm');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const code = $('#classCode')?.value.trim();
    const name = $('#className')?.value.trim();
    const mic = $('#classMic')?.checked;
    if(!code || !name){ window.showToast && window.showToast('کد و نام الزامی است','error'); return; }
    window.showToast && window.showToast(`🎥 در حال اتصال به کلاس ${code}...`, 'success');
    setTimeout(() => {
      $('#classOverlay')?.classList.remove('open');
      window.showToast && window.showToast('✅ به کلاس وارد شدی (شبیه‌سازی)', 'success', 4000);
    }, 1200);
  });
}

/* ===================== 10) Toast ===================== */
(function(){
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
  };
  window.showToast = function(msg, type = 'info', duration = 3000){
    let wrap = $('#toastWrap');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      wrap.id = 'toastWrap';
      document.body.appendChild(wrap);
    }
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = (ICONS[type] || ICONS.info) + '<span>' + escapeHtml(msg) + '</span>';
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 400); }, duration);
  };
})();

/* ===================== 11) Scroll Progress + Back to Top ===================== */
(function(){
  const bar = $('#scrollProgress');
  const backTop = $('#backTop');
  const ringFg = backTop ? backTop.querySelector('.ring .fg') : null;
  const CIRC = 2 * Math.PI * 28;

  function update(){
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    if(bar) bar.style.width = pct + '%';
    if(backTop) backTop.classList.toggle('show', window.scrollY > 400);
    if(ringFg) ringFg.style.strokeDashoffset = CIRC - (CIRC * pct / 100);
  }
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update);
  update();
  if(backTop) backTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
})();

/* ===================== 12) Reveal ===================== */
(function(){
  const els = $$('.reveal');
  if(!els.length || !('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ===================== 13) Counter ===================== */
(function(){
  const els = $$('#statsBand b[data-count]');
  if(!els.length) return;
  function animate(el){
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + toFa(formatNum(val)) + suffix;
      if(p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + toFa(formatNum(target)) + suffix;
    }
    requestAnimationFrame(tick);
  }
  if(!('IntersectionObserver' in window)){ els.forEach(animate); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){
        animate(en.target);
        const ring = en.target.closest('.counter-ring');
        if(ring){
          const fg = ring.querySelector('.ring-fg');
          if(fg){
            const CIRC = 2 * Math.PI * 50;
            fg.style.strokeDasharray = CIRC;
            fg.style.strokeDashoffset = CIRC;
            requestAnimationFrame(() => fg.style.strokeDashoffset = 0);
          }
        }
        io.unobserve(en.target);
      }
    });
  }, { threshold:0.4 });
  els.forEach(el => io.observe(el));
})();

/* ===================== 14) Menu ===================== */
(function(){
  const DESKTOP_BP = 860;
  const navToggle = $('.nav-toggle');
  const mainNav   = $('.main-nav');

  function closeDropdown(li){
    li.classList.remove('is-open');
    const l = li.querySelector('.nav-link');
    if(l) l.setAttribute('aria-expanded','false');
  }
  function closeAllDropdowns(ex){
    $$('.has-dropdown.is-open').forEach(li => { if(li !== ex) closeDropdown(li); });
  }
  function closeMobileMenu(){
    if(!mainNav || !navToggle) return;
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded','false');
  }
  if(navToggle && mainNav){
    navToggle.addEventListener('click', e => {
      e.stopPropagation();
      const o = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', o ? 'true' : 'false');
      if(!o) closeAllDropdowns();
    });
  }
  $$('.has-dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', e => {
      if(window.innerWidth > DESKTOP_BP) return;
      e.preventDefault();
      const p = link.closest('.has-dropdown');
      const w = !p.classList.contains('is-open');
      closeAllDropdowns(p);
      p.classList.toggle('is-open', w);
      link.setAttribute('aria-expanded', w ? 'true' : 'false');
    });
  });
  document.addEventListener('click', e => {
    if(!e.target.closest('.has-dropdown')) closeAllDropdowns();
    if(mainNav && !mainNav.contains(e.target) && navToggle && !navToggle.contains(e.target)) closeMobileMenu();
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ closeAllDropdowns(); closeMobileMenu(); }
  });
})();

/* ===================== 15) Parallax ===================== */
(function(){
  const layers = $$('.parallax-layer');
  if(!layers.length) return;
  let ticking = false;
  function update(){
    const scrollY = window.scrollY;
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.2;
      layer.style.transform = `translateY(${scrollY * speed}px)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, { passive:true });
})();

/* ===================== 16) Constellation ===================== */
(function(){
  const canvas = $('#constellation');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x:null, y:null };

  function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function getCount(){ return Math.min(70, Math.floor(window.innerWidth / 22)); }
  function init(){
    particles = [];
    const count = getCount();
    for(let i = 0; i < count; i++){
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: 1 + Math.random() * 2
      });
    }
  }
  init();
  window.addEventListener('resize', init);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function getColor(){
    const st = getComputedStyle(document.documentElement);
    return st.getPropertyValue('--primary').trim() || '#e85d9e';
  }

  function loop(){
    ctx.clearRect(0, 0, W, H);
    const color = getColor();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > W) p.vx *= -1;
      if(p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
    });
    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 130){
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = color;
          ctx.globalAlpha = (1 - dist / 130) * 0.22;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  loop();
})();
/* ======================================================================
   17) Chat — دستیار هوشمند پیرامید (بدون API، آفلاین، با حافظه)
   ====================================================================== */
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = $('#chatToggle');
    const widget = $('#chatWidget');
    const closeB = $('#chatClose');
    const body   = $('#chatBody');
    const input  = $('#chatInput');
    const send   = $('#chatSend');
    const badge  = toggle ? toggle.querySelector('.chat-badge') : null;
    if(!toggle || !widget || !body) return;

    /* ============================================================
       1) پایگاه دانش — موضوعات، پاسخ‌ها، پیشنهادها
       ============================================================ */
    const KB = [
      {
        id:'greet',
        keys:['سلام','درود','هی','های','hi','hello','صبح بخیر','شب بخیر','وقت بخیر','سلم','سلان','خوبی'],
        replies:[
          'سلام {name} عزیز! 👋 چطور می‌تونم کمکت کنم؟',
          'درود {name}! 😊 چی می‌خوای بدونی؟',
          'سلام رفیق! 🌟 آماده‌ام کمکت کنم.'
        ],
        chips:['تخمین کنکور','امکانات سایت','کلاس آنلاین','ماشین‌حساب']
      },
      {
        id:'howru',
        keys:['چطوری','چطور هستی','خوبی','حالت چطوره','چه خبر','چخبر','چه می‌کنی'],
        replies:[
          'من همیشه خوبم چون دارم به تو کمک می‌کنم! 😊 تو چطوری؟',
          'همه چیز عالیه! 💜 تو چطوری؟ چیزی هست که بخوای بدونی؟',
          'خوبم مرسی که پرسیدی! 🚀 بگو چطور کمکت کنم.'
        ],
        chips:['تخمین کنکور','راهنما','مشکلی دارم']
      },
      {
        id:'thanks',
        keys:['ممنون','مرسی','سپاس','متشکر','دستت درد نکنه','لطف کردی','دمت گرم'],
        replies:[
          'خواهش می‌کنم {name}! 💜 موفق باشی.',
          'کاری نکردم! 😊 هر وقت سؤالی داشتی بپرس.',
          'خواهش! 🚀 اگه بازم کمک خواستی در خدمتم.'
        ],
        chips:['یه سؤال دیگه','خداحافظ']
      },
      {
        id:'bye',
        keys:['خداحافظ','بای','خدانگهدار','می‌رم','خدا حافظ','فعلا','تا بعد'],
        replies:[
          'خدانگهدار {name}! 🌟 موفق باشی.',
          'بدرود! هر وقت خواستی برگرد 💜',
          'خدانگهدار! امیدوارم نتیجه‌ی خوبی بگیری 🎯'
        ],
        chips:[]
      },
      {
        id:'who',
        keys:['تو کی هستی','اسمت چیه','تو چی هستی','کی هستی','ربات','bot','هوش مصنوعی','دستیار'],
        replies:[
          'من دستیار هوشمند پیرامیدم 🤖 اینجام که بهت کمک کنم درباره تخمین، انتخاب رشته و امکانات سایت.',
          'من ربات پشتیبانی پیرامیدم 💜 می‌تونم هر سؤالی درباره سایت جواب بدم.'
        ],
        chips:['امکانات سایت','تخمین کنکور','راهنما']
      },
      {
        id:'estimate',
        keys:['تخمین','تراز','رتبه','محاسبه','درصد','چند میشم','تخمین بزن','کنکور بزن'],
        replies:[
          'برای تخمین تراز و رتبه 🧮\n\nاز منوی «کنکور» یا صفحه تخمین استفاده کن:\n۱) گروه آزمایشی رو انتخاب کن\n۲) درصد دروس رو وارد کن\n۳) دکمه محاسبه رو بزن!',
          'تخمین کنکور خیلی ساده‌ست 👇\nدقیقا مثل کنکور واقعی، تراز و رتبه‌ت رو می‌بینی.\nفقط درصدها رو وارد کن!'
        ],
        chips:['تخمین تجربی','تخمین ریاضی','تخمین انسانی','دقتش چقدره؟']
      },
      {
        id:'tajrobi',
        keys:['تجربی','پزشکی','دندان','داروساز','علوم پزشکی'],
        replies:[
          'برای تخمین تجربی 🧬\n\nضرایب اصلی:\n• زیست ۱۲\n• فیزیک ۷\n• شیمی ۷\n• ریاضی ۴\n• ادبیات ۴\n\nاز منوی کنکور → تجربی شروع کن!',
          'گروه تجربی پرطرفدارترین گروه کنکوره! 💪 ضرایب زیست و شیمی بالاترن.'
        ],
        chips:['شروع تخمین','رتبه پزشکی چنده؟','ضریب‌ها']
      },
      {
        id:'riazi',
        keys:['ریاضی','فیزیک','مهندسی','ریاضی فیزیک'],
        replies:[
          'برای تخمین ریاضی 📐\n\nضرایب اصلی:\n• ریاضیات ۱۲\n• فیزیک ۹\n• شیمی ۷\n\nبرو به صفحه تخمین و شروع کن!',
          'گروه ریاضی برای رشته‌های مهندسی و علوم پایه عالیه 📐'
        ],
        chips:['شروع تخمین','رتبه مهندسی','ضریب‌ها']
      },
      {
        id:'ensani',
        keys:['انسانی','علوم انسانی','حقوق','روان‌شناسی'],
        replies:[
          'برای تخمین انسانی 📚\n\nضرایب اصلی:\n• ادبیات ۸\n• عربی ۵\n• تاریخ و جغرافیا ۵\n• علوم اجتماعی ۵\n• فلسفه و منطق ۵',
          'گروه انسانی ضرایب ادبیات بالاتره 📚 می‌خوای شروع کنی؟'
        ],
        chips:['شروع تخمین','رتبه حقوق','ضریب‌ها']
      },
      {
        id:'honar',
        keys:['هنر','نقاشی','گرافیک','معماری هنر'],
        replies:[
          'برای تخمین هنر 🎨\n\nضرایب:\n• درک عمومی هنر ۶\n• خلاقیت تصویری ۴\n• تاریخ هنر ۲+۲',
          'گروه هنری برای خلاق‌هاست! 🎨 درک هنر و خلاقیت تصویری مهم‌ترینن.'
        ],
        chips:['شروع تخمین','رشته‌های هنر']
      },
      {
        id:'accuracy',
        keys:['دقت','چقدر دقیق','دقیقه','درصد دقت','مطمئن','اعتبار'],
        replies:[
          'دقت تخمین تراز پیرامید حدود ۹۷٪ است ✅\n\nاین دقت از مقایسه با کارنامه‌های واقعی هزاران داوطلب به دست اومده.',
          'دقت ما ۹۷٪ هست 📊 و هر سال بالاتر می‌ره چون داده‌های بیشتری جمع می‌کنیم.'
        ],
        chips:['شروع تخمین','روش محاسبه']
      },
      {
        id:'free',
        keys:['رایگان','پول','هزینه','قیمت','پرداخت','اشتراک','آبونمان'],
        replies:[
          'همه‌ی ابزارهای تخمین پیرامید کاملاً رایگانن! 💜 هیچ هزینه‌ای نداره.',
          'پیرامید رایگانه ✅ ثبت‌نام کن و از همه چیز استفاده کن.'
        ],
        chips:['ثبت‌نام','امکانات سایت']
      },
      {
        id:'account',
        keys:['حساب','ثبت‌نام','ورود','لاگین','پروفایل','آواتار','عکس پروفایل','تغییر نام'],
        replies:[
          'برای پروفایل، روی دکمه‌ی «حساب کاربری» بالای صفحه بزن 👤\n\nمی‌تونی نام، سن، ایمیل، عکس و گرادیان آواتارت رو تنظیم کنی.',
          'ثبت‌نام خیلی ساده‌ست! فقط روی پروفایل من بزن و اطلاعاتت رو پر کن 🔐'
        ],
        chips:['آپلود عکس','تغییر تم','خروج از حساب']
      },
      {
        id:'calc',
        keys:['ماشین‌حساب','محاسبه‌گر','calculator','حساب کن'],
        replies:[
          'ماشین‌حساب پیرامید 🧮\n\nاز دکمه‌ی شناور سمت چپ-پایین صفحه بازش کن.\nجمع، تفریق، ضرب، تقسیم، درصد و علامت داره!',
          'برای ماشین‌حساب، آیکن 🧮 سمت چپ صفحه رو بزن.'
        ],
        chips:['شروع تخمین','کلاس آنلاین']
      },
      {
        id:'class',
        keys:['کلاس','آنلاین','تدریس','معلم','دبیر','درس'],
        replies:[
          'کلاس آنلاین پیرامید 🎥\n\nاز دکمه‌ی شناور سمت چپ صفحه بازش کن.\nکد کلاس و نامت رو وارد کن و وارد شو!',
          'برای ورود به کلاس آنلاین، روی آیکن 🎥 بزن و کد کلاس رو وارد کن.'
        ],
        chips:['ماشین‌حساب','شروع تخمین']
      },
      {
        id:'announce',
        keys:['اعلان','خبر','اطلاعیه','تازه','جدید','به‌روزرسانی'],
        replies:[
          'آخرین اعلانات توی بخش «📢 اعلانات» صفحه اصلیه.',
          'برای دیدن خبرها، بخش اعلانات در صفحه اصلی رو ببین 📢'
        ],
        chips:['رفتن به اعلانات']
      },
      {
        id:'theme',
        keys:['تم','رنگ','دارک','تیره','روشن','ظاهر','ظاهری','رنگ‌بندی'],
        replies:[
          'برای تغییر تم، دکمه‌ی 🎨 سمت چپ-پایین رو بزن.\n\n۱۴ رنگ + حالت روشن/تیره/خودکار + افکت‌های شفق، ماه و رعد داری! ✨',
          'پنل تم سمت چپ-پایین صفحه‌ست، کلی گزینه جذاب داره 🎨'
        ],
        chips:['تم شفق','حالت تیره']
      },
      {
        id:'problem',
        keys:['مشکل','خراب','کار نمی‌کنه','باگ','ارور','error','لود نمی‌شه','گیر'],
        replies:[
          'متأسفم که این مشکل پیش اومده 😔\n\n۱) صفحه رو رفرش کن (F5)\n۲) کش رو پاک کن (Ctrl+Shift+R)\n۳) مرورگر رو به‌روز کن\n\nاگه باز مشکل بود، جزییات رو بگو.',
          'برای رفع مشکل:\n• Cache رو پاک کن\n• از Chrome استفاده کن\n• اگه بازم بود، بنویس کجا گیر کردی.'
        ],
        chips:['پاک کردن کش','تماس با پشتیبانی']
      },
      {
        id:'study',
        keys:['مطالعه','توصیه','نصیحت','برنامه','روش','راهکار','تمرکز','انگیزه'],
        replies:[
          'چند توصیه طلایی برای کنکور 📚\n\n• روزانه ۶-۸ ساعت با تمرکز\n• آزمون آزمایشی هفتگی\n• مرور منظم\n• خواب کافی ۷ ساعت\n• ورزش روزانه\n\nموفق باشی {name}! 💪',
          'روش مطالعه موفق:\n۱) تکنیک پومودورو (۲۵ دقیقه تمرکز)\n۲) خلاصه‌نویسی\n۳) تست‌زنی منظم\n۴) تحلیل آزمون‌ها 📊',
          'کنکور ماراتنه، نه دوی سرعت 🏃\nپیوستگی مهم‌تر از شدته. هر روز یه قدم!'
        ],
        chips:['تخمین کنکور','نقاط ضعف','برنامه‌ریزی']
      },
      {
        id:'about',
        keys:['پیرامید چیه','درباره','کی ساخت','چی هست','چیکار می‌کنه'],
        replies:[
          'پیرامید 🏔️ یک پلتفرم آموزشی برای داوطلبان کنکوره.\n\nتخمین تراز، انتخاب رشته، سوابق تحصیلی و کلی ابزار دیگه.',
          'پیرامید ابزاری دقیق برای تخمین کنکوره، با الگوریتم‌های به‌روز و داده‌های واقعی.'
        ],
        chips:['امکانات سایت','دقتش چقدره؟']
      },
      {
        id:'features',
        keys:['امکانات','قابلیت','چه کاری','خدمات','چیکار می‌تونم','چیا داری'],
        replies:[
          'پیرامید اینا رو داره 👇\n\n🧮 تخمین تراز و رتبه\n📚 انتخاب رشته هوشمند\n📊 تخمین سوابق تحصیلی\n🎥 کلاس آنلاین\n🧮 ماشین‌حساب\n🎨 تم‌های متنوع',
          'امکانات پیرامید:\n• تخمین دقیق کنکور\n• انتخاب رشته\n• تراز سوابق\n• کلاس آنلاین\n• ماشین‌حساب'
        ],
        chips:['شروع تخمین','کلاس آنلاین','ماشین‌حساب']
      },
      {
        id:'help',
        keys:['کمک','help','راهنما','چیکار کنم','چطور'],
        replies:[
          'چطور می‌تونم کمکت کنم {name}؟ 😊\n\nمی‌تونی درباره اینا بپرسی:\n• تخمین کنکور\n• انتخاب رشته\n• کلاس آنلاین\n• حساب کاربری',
          'در خدمتم! 💜 سؤالت رو بپرس یا از این موضوعات انتخاب کن:'
        ],
        chips:['تخمین کنکور','انتخاب رشته','کلاس آنلاین','مشکلی دارم']
      }
    ];

    /* ============================================================
       2) نرمال‌سازی متن فارسی
       ============================================================ */
    function norm(t){
      return String(t || '')
        .toLowerCase()
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/[ًٌٍَُِّْ]/g, '')
        .replace(/[؟?!.,،؛:]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    /* ============================================================
       3) تشخیص احساس برای لحن پاسخ
       ============================================================ */
    function detectMood(t){
      const n = norm(t);
      const pos = ['عالی','خوب','مرسی','ممنون','دوست','خوشحال','لذت','بهترین'];
      const neg = ['بد','مشکل','خراب','ناراحت','خسته','عصبانی','خسته‌ام','غمگین','افسرده','ناامید'];
      let score = 0;
      pos.forEach(w => { if(n.includes(w)) score += 1; });
      neg.forEach(w => { if(n.includes(w)) score -= 1; });
      if(score > 0) return 'positive';
      if(score < 0) return 'negative';
      return 'neutral';
    }

    /* ============================================================
       4) تطبیق هوشمند با کلیدواژه‌ها
       ============================================================ */
    function findBest(text){
      const n = norm(text);
      if(!n) return null;

      let best = null;
      let bestScore = 0;

      for(const item of KB){
        let score = 0;
        for(const kw of item.keys){
          const k = norm(kw);
          if(!k) continue;
          if(n === k) score = Math.max(score, 100);
          else if(n.includes(k)) score = Math.max(score, 55 + k.length);
          else {
            // همپوشانی کلمات
            const nWords = n.split(' ');
            const kWords = k.split(' ');
            let overlap = 0;
            for(const kw2 of kWords){
              if(kw2.length < 3) continue;
              if(nWords.some(w => w === kw2)) overlap += 25;
              else if(nWords.some(w => w.length > 3 && (w.includes(kw2) || kw2.includes(w)))) overlap += 12;
            }
            score = Math.max(score, overlap);
          }
        }
        // تقویت اگر تاپیک قبلی بود
        if(state.lastTopic === item.id) score += 6;
        if(score > bestScore){
          bestScore = score;
          best = item;
        }
      }

      return bestScore >= 20 ? best : null;
    }

    /* ============================================================
       5) حالت مکالمه — حافظه
       ============================================================ */
    const state = {
      lastTopic: null,
      count: 0,
      topics: {},
      greeted: false
    };

    function userName(){
      try{
        const u = JSON.parse(localStorage.getItem('piramid_user') || 'null');
        if(u && (u.displayName || u.username)) return (u.displayName || u.username);
      }catch(e){}
      return 'دوست من';
    }

    /* ============================================================
       6) تولید پاسخ
       ============================================================ */
    const FALLBACKS = [
      'متأسفم {name} جان، دقیق متوجه نشدم 🤔\nمی‌تونی سؤالت رو واضح‌تر بپرسی یا از این موضوعات انتخاب کنی:',
      'سؤالت رو کامل متوجه نشدم 😅\nاز این گزینه‌ها انتخاب کن یا یه جور دیگه بپرس:',
      'هوم... {name} جان به این سؤال تسلط ندارم 🤔\nولی اینا رو خوب می‌دونم:'
    ];

    function generateReply(text){
      state.count++;
      const mood = detectMood(text);
      const match = findBest(text);
      const name = userName();

      if(match){
        state.lastTopic = match.id;
        state.topics[match.id] = (state.topics[match.id] || 0) + 1;

        let reply = match.replies[
          Math.floor(Math.random() * match.replies.length)
        ].replace(/\{name\}/g, name);

        // تنظیم لحن بر اساس احساس
        if(mood === 'negative' && match.id !== 'problem' && match.id !== 'bye'){
          reply = 'می‌بینم که یه کم ناراحتی 😔\n\n' + reply + '\n\nاگه کمکی از دستم برمیاد، بگو.';
        } else if(mood === 'positive' && Math.random() > 0.5){
          reply = '😊 ' + reply;
        }

        // اگر کاربر تکراری سؤال بپرسه
        if(state.topics[match.id] > 3 && match.id === 'estimate'){
          reply += '\n\n(اگه سؤالت بخش خاصی از تخمین رو داره، دقیق‌تر بگو تا بهتر راهنماییت کنم 💜)';
        }

        return { text: reply, chips: (match.chips || []).slice(0, 4) };
      }

      // fallback
      const fb = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)].replace(/\{name\}/g, name);
      return {
        text: fb,
        chips: ['تخمین کنکور','انتخاب رشته','کلاس آنلاین','مشکلی دارم']
      };
    }

    /* ============================================================
       7) رابط کاربری
       ============================================================ */
    function now(){
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return toFa(h + ':' + m);
    }

    // ایجاد جعبه‌ی چیپ‌ها (یک‌بار)
    let chipsBox = document.getElementById('chatChips');
    if(!chipsBox){
      chipsBox = document.createElement('div');
      chipsBox.className = 'chat-chips';
      chipsBox.id = 'chatChips';
      // قبل از footer درج کن
      const footer = widget.querySelector('.chat-footer');
      if(footer && footer.parentNode){
        footer.parentNode.insertBefore(chipsBox, footer);
      } else {
        widget.appendChild(chipsBox);
      }
    }

    function setChips(list){
      if(!chipsBox) return;
      chipsBox.innerHTML = '';
      if(!list || !list.length){
        chipsBox.style.display = 'none';
        return;
      }
      chipsBox.style.display = 'flex';
      list.forEach(label => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chat-chip';
        b.textContent = label;
        b.addEventListener('click', () => {
          if(input){
            input.value = label;
            input.focus();
            sendMsg();
          }
        });
        chipsBox.appendChild(b);
      });
    }

    function scrollToBottom(){
      if(body) body.scrollTop = body.scrollHeight;
    }

    function addBubble(text, who){
      const m = document.createElement('div');
      m.className = 'chat-msg ' + who;
      const safe = escapeHtml(text).replace(/\n/g, '<br>');
      m.innerHTML = safe + `<span class="msg-time">${now()}</span>`;
      body.appendChild(m);
      scrollToBottom();
    }

    function showTyping(){
      const t = document.createElement('div');
      t.className = 'chat-typing';
      t.id = 'chatTyping';
      t.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(t);
      scrollToBottom();
    }
    function hideTyping(){
      const t = document.getElementById('chatTyping');
      if(t) t.remove();
    }
    function open(){
      widget.classList.add('open');
      if(badge) badge.style.display = 'none';
      setTimeout(() => input?.focus(), 250);
      if(!state.greeted){
        state.greeted = true;
        const name = userName();
        addBubble(`سلام ${name}! 👋 من دستیار هوشمند پیرامیدم. چطور می‌تونم کمکت کنم؟`, 'bot');
        setChips(['تخمین کنکور','انتخاب رشته','کلاس آنلاین','ماشین‌حساب','درباره پیرامید']);
      }
    }
    function closeChat(){ widget.classList.remove('open'); }

    function sendMsg(){
      if(!input) return;
      const v = input.value.trim();
      if(!v) return;

      addBubble(v, 'user');
      input.value = '';
      setChips([]);

      showTyping();

      const delay = 350 + Math.min(v.length * 18, 900) + Math.random() * 300;

      setTimeout(() => {
        hideTyping();
        const { text, chips } = generateReply(v);
        addBubble(text, 'bot');
        setChips(chips);
      }, delay);
    }

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      widget.classList.contains('open') ? closeChat() : open();
    });
    $('#openChatNav')?.addEventListener('click', e => { e.preventDefault(); open(); });
    closeB?.addEventListener('click', closeChat);
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && widget.classList.contains('open')) closeChat();
    });

    send?.addEventListener('click', sendMsg);
    input?.addEventListener('keydown', e => {
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        sendMsg();
      }
    });

    input?.addEventListener('keydown', e => {
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l'){
        e.preventDefault();
        body.innerHTML = '';
        state.lastTopic = null;
        state.count = 0;
        state.topics = {};
        state.greeted = false;
        open();
      }
    });
  });
})();
/* ===================== 18) Stories ===================== */
(function(){
  const wrap = $('#storiesWrap');
  const modal = $('#storyModal');
  const closeB = $('#storyClose');
  const avBig = $('#storyAvatarBig');
  const nameEl = $('#storyName');
  const rankEl = $('#storyRank');
  const textEl = $('#storyText');
  const progFill = $('#storyProgressFill');
  if(!wrap || !modal) return;
  let autoTimer = null;

  function openStory(story){
    if(avBig) avBig.textContent = story.dataset.initial;
    if(nameEl) nameEl.textContent = story.dataset.name;
    if(rankEl) rankEl.textContent = story.dataset.rank;
    if(textEl) textEl.textContent = story.dataset.text;
    if(progFill){ progFill.style.animation = 'none'; void progFill.offsetWidth; progFill.style.animation = ''; }
    modal.classList.add('open');
    autoTimer = setTimeout(closeStory, 5000);
    story.querySelector('.story-ring')?.classList.add('seen');
  }
  function closeStory(){ modal.classList.remove('open'); if(autoTimer) clearTimeout(autoTimer); }

  wrap.addEventListener('click', e => {
    const story = e.target.closest('.story');
    if(story) openStory(story);
  });
  closeB?.addEventListener('click', closeStory);
  modal.addEventListener('click', e => { if(e.target === modal) closeStory(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeStory(); });
})();

/* ===================== 19) Cookie ===================== */
(function(){
  const banner = $('#cookieBanner');
  if(!banner) return;
  let accepted = null;
  try{ accepted = localStorage.getItem(LS.cookie); }catch(e){}
  if(accepted) return;
  setTimeout(() => banner.classList.add('show'), 2000);
  const accept = $('#cookieAccept'), reject = $('#cookieReject');
  accept?.addEventListener('click', () => {
    try{ localStorage.setItem(LS.cookie, 'accepted'); }catch(e){}
    banner.classList.remove('show');
    window.showToast && window.showToast('ممنون! 🍪', 'success');
  });
  reject?.addEventListener('click', () => {
    try{ localStorage.setItem(LS.cookie, 'rejected'); }catch(e){}
    banner.classList.remove('show');
  });
})();

/* ===================== 20) FX: Aurora/Crystal/Moon/Lightning ===================== */
function bindFxToggles(){
  // Aurora
  const auroraT = $('#fxAurora');
  if(auroraT){
    let on = false; try{ on = localStorage.getItem(LS.aurora) === 'on'; }catch(e){}
    auroraT.classList.toggle('on', on);
    document.body.classList.toggle('fx-aurora', on);
    auroraT.addEventListener('click', () => {
      on = !auroraT.classList.contains('on');
      auroraT.classList.toggle('on', on);
      document.body.classList.toggle('fx-aurora', on);
      try{ localStorage.setItem(LS.aurora, on ? 'on' : 'off'); }catch(e){}
      window.showToast && window.showToast(on ? '🌊 شفق روشن شد' : '⭕ شفق خاموش شد', on ? 'success' : 'info');
    });
  }
  // Crystal
  const crystalT = $('#fxCrystal');
  if(crystalT){
    let on = false; try{ on = localStorage.getItem(LS.crystal) === 'on'; }catch(e){}
    crystalT.classList.toggle('on', on);
    document.body.classList.toggle('fx-crystal', on);
    crystalT.addEventListener('click', () => {
      on = !crystalT.classList.contains('on');
      crystalT.classList.toggle('on', on);
      document.body.classList.toggle('fx-crystal', on);
      try{ localStorage.setItem(LS.crystal, on ? 'on' : 'off'); }catch(e){}
      window.showToast && window.showToast(on ? '💎 کریستال روشن شد' : '⭕ کریستال خاموش شد', on ? 'success' : 'info');
    });
  }
  // Moon
  const moonT = $('#moonToggle');
  const moonContainer = document.createElement('div');
  moonContainer.className = 'moon-stars';
  moonContainer.innerHTML = '<div class="moon"></div>';
  for(let i = 0; i < 60; i++){
    const s = document.createElement('div');
    s.className = 'star-dot';
    s.style.left = Math.random() * 100 + 'vw';
    s.style.top = Math.random() * 100 + 'vh';
    s.style.animationDelay = (Math.random() * 3) + 's';
    s.style.animationDuration = (2 + Math.random() * 3) + 's';
    moonContainer.appendChild(s);
  }
  for(let i = 0; i < 12; i++){
    const s = document.createElement('div');
    s.className = 'star-big';
    s.style.left = Math.random() * 100 + 'vw';
    s.style.top = Math.random() * 80 + 'vh';
    s.style.animationDelay = (Math.random() * 4) + 's';
    moonContainer.appendChild(s);
  }
  document.body.appendChild(moonContainer);
  if(moonT){
    let on = false; try{ on = localStorage.getItem(LS.moon) === 'on'; }catch(e){}
    moonT.classList.toggle('on', on);
    moonContainer.classList.toggle('active', on);
    moonT.addEventListener('click', () => {
      on = !moonT.classList.contains('on');
      moonT.classList.toggle('on', on);
      moonContainer.classList.toggle('active', on);
      try{ localStorage.setItem(LS.moon, on ? 'on' : 'off'); }catch(e){}
      window.showToast && window.showToast(on ? '🌙 ماه روشن شد' : '⭕ خاموش شد', on ? 'success' : 'info');
    });
  }
  // Lightning
  const lightT = $('#lightningToggle');
  let lightningEnabled = true;
  try{ lightningEnabled = localStorage.getItem(LS.lightning) !== 'off'; }catch(e){}
  let timer = null, firstTimer = null;
  function createBolt(){
    const b = document.createElement('div');
    b.className = 'lightning-bolt';
    b.style.left = (20 + Math.random() * 60) + '%';
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 700);
  }
  function createFlashes(){
    const c = 2 + Math.floor(Math.random() * 2);
    for(let i = 0; i < c; i++){
      setTimeout(() => {
        const f = document.createElement('div');
        f.className = 'lightning-flash';
        document.body.appendChild(f);
        setTimeout(() => f.remove(), 700);
      }, i * 150);
    }
  }
  function strike(){
    if(!lightningEnabled) return;
    createFlashes();
    if(Math.random() > 0.4) setTimeout(createBolt, 50);
  }
  function startLightning(){
    stopLightning();
    timer = setInterval(strike, 8000);
    firstTimer = setTimeout(strike, 3000);
  }
  function stopLightning(){
    if(timer) clearInterval(timer);
    if(firstTimer) clearTimeout(firstTimer);
    timer = null; firstTimer = null;
  }
  if(lightningEnabled) startLightning();
  if(lightT){
    lightT.classList.toggle('on', lightningEnabled);
    lightT.addEventListener('click', () => {
      lightningEnabled = !lightT.classList.contains('on');
      lightT.classList.toggle('on', lightningEnabled);
      try{ localStorage.setItem(LS.lightning, lightningEnabled ? 'on' : 'off'); }catch(e){}
      lightningEnabled ? startLightning() : stopLightning();
      window.showToast && window.showToast(lightningEnabled ? '⚡ رعد روشن شد' : '⭕ رعد خاموش شد', lightningEnabled ? 'success' : 'info');
    });
  }
}

/* ===================== 21) Blob/Particle/Font size ===================== */
function bindBlobsAndParticles(){
  const blobT = $('#blobToggle');
  let blobsOn = true;
  try{ blobsOn = localStorage.getItem(LS.blobs) !== 'off'; }catch(e){}
  function setBlobs(on){
    document.body.classList.toggle('blobs-off', !on);
    if(blobT) blobT.classList.toggle('on', on);
    try{ localStorage.setItem(LS.blobs, on ? 'on' : 'off'); }catch(e){}
  }
  setBlobs(blobsOn);
  blobT?.addEventListener('click', () => { blobsOn = !blobsOn; setBlobs(blobsOn); });

  const partT = $('#particleToggle');
  let partOn = true;
  try{ partOn = localStorage.getItem(LS.particles) !== 'off'; }catch(e){}
  function setPart(on){
    const c = $('#constellation'); if(c) c.style.display = on ? 'block' : 'none';
    if(partT) partT.classList.toggle('on', on);
    try{ localStorage.setItem(LS.particles, on ? 'on' : 'off'); }catch(e){}
  }
  setPart(partOn);
  partT?.addEventListener('click', () => { partOn = !partOn; setPart(partOn); });

  const slider = $('#fontSlider');
  if(slider){
    let size = 15;
    try{ size = parseInt(localStorage.getItem(LS.fontSize) || '15', 10); }catch(e){}
    slider.value = size;
    applyFontSize(size);
    slider.addEventListener('input', () => applyFontSize(parseInt(slider.value, 10)));
  }
}

/* ===================== 22) Theme Drawer Buttons ===================== */
function bindThemeControls(){
  const grid = $('#colorGrid');
  if(grid){
    grid.addEventListener('click', e => {
      const sw = e.target.closest('.color-swatch');
      if(!sw) return;
      const idx = parseInt(sw.dataset.theme, 10);
      applyTheme(idx);
      root.classList.add('theme-changing');
      setTimeout(() => root.classList.remove('theme-changing'), 700);
    });
  }
  $$('.quick-mode-btn').forEach(b => {
    b.addEventListener('click', () => applyMode(b.dataset.mode));
  });
  const quick = $('#quickThemeToggle');
  if(quick){
    quick.addEventListener('click', () => {
      const cur = localStorage.getItem(LS.themeMode) || 'light';
      applyMode(cur === 'dark' ? 'light' : 'dark');
      window.showToast && window.showToast(cur === 'dark' ? '☀️ حالت روشن' : '🌙 حالت تیره', 'info', 1500);
    });
  }
}

/* ===================== 23) INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  // بازیابی تنظیمات
  let ti = 0;
  try{ ti = parseInt(localStorage.getItem(LS.theme) || '0', 10); }catch(e){}
  if(isNaN(ti) || ti < 0 || ti >= THEMES.length) ti = 0;
  applyTheme(ti);

  let mode = 'light';
  try{ mode = localStorage.getItem(LS.themeMode) || 'light'; }catch(e){}
  applyMode(mode);
  setInterval(() => {
    let m = 'light';
    try{ m = localStorage.getItem(LS.themeMode) || 'light'; }catch(e){}
    if(m === 'auto') applyMode('auto');
  }, 30 * 60 * 1000);

  // بایندها
  bindThemeDrawer();
  bindModalOpeners();
  bindCalculator();
  bindClassForm();
  bindThemeControls();
  bindBlobsAndParticles();
  bindFxToggles();

  // اعلانات
  renderAnnouncements();
  renderMajorsDropdown();

  // حساب کاربری
  updateHeaderAccount();
  showLoginIfNeeded();
  bindLogin();
  bindAccountPill();  // ← این خط جدید

  // اگر مالک وارد شد، دکمه‌ی افزودن رشته را نشان بده
  const addBtn = $('#ownerAddMajorBtn');
  if(addBtn && getRole() === 'owner') addBtn.style.display = 'flex';

  console.log('%c🏔️ Piramid v2 ready','color:#e85d9e;font-weight:700;');
});

/* ===================== 24) PWA + Notifications Load ===================== */
(function(){
  // لود کردن pwa و notifications در همه‌ی صفحات
  if(document.querySelector('script[src*="pwa.js"]') === null){
    const s1 = document.createElement('script');
    s1.src = 'pwa.js';
    s1.defer = true;
    document.head.appendChild(s1);
  }
  if(document.querySelector('script[src*="notifications.js"]') === null){
    const s2 = document.createElement('script');
    s2.src = 'notifications.js';
    s2.defer = true;
    document.head.appendChild(s2);
  }
})();

/* ===================== 25) Auto-Load Extra Modules ===================== */
(function(){
const MODULES = [
  'xp-engine.js',
  'mission-engine.js',
  'sync.js',
  'sound.js',
  'share.js',
  'goals.js',
  'mobile.js',
  'search.js',
  'shortcuts.js',
  'tour.js',
  'footer-fix.js',
  'offline-indicator.js',
  'print-mode.js',
  'recent-pages.js',
  'favorites.js',
  'stories-data.js',
  'stories-render.js',
  'quizzes.js',
  'widgets.js'
];

  window.addEventListener('load', () => {
    MODULES.forEach(src => {
      if(document.querySelector(`script[src*="${src}"]`) === null){
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.onerror = () => console.warn('⚠️ ماژول ' + src + ' لود نشد');
        document.head.appendChild(s);
      }
    });
  });
})();