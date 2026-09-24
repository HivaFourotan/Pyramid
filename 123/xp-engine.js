/* ======================================================================
   PIRAMID — xp-engine.js
   موتور XP مشترک — روی همه‌ی صفحات لود می‌شه
   ====================================================================== */
'use strict';

(function(){
  if(window.PiramidXP && window.PiramidXP._engineReady) return;

  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const setLS = (k, v) => {
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  };

  /* ==================== خواندن/ذخیره ==================== */
  function getXP(){ return parseInt(localStorage.getItem('piramid_xp') || '0', 10) || 0; }
  function setXP(v){ try{ localStorage.setItem('piramid_xp', String(v)); }catch(e){} }

  function getLevel(){ return parseInt(localStorage.getItem('piramid_level') || '1', 10) || 1; }
  function setLevel(v){ try{ localStorage.setItem('piramid_level', String(v)); }catch(e){} }

  function getXPLog(){ return getLS('piramid_xp_log', {}) || {}; }
  function setXPLog(v){ setLS('piramid_xp_log', v); }

  /* ==================== فرمول سطح ==================== */
  function xpForLevel(lv){ return (lv * (lv - 1) / 2) * 100; }
  function levelFromXP(xp){
    let lv = 1;
    while(xpForLevel(lv + 1) <= xp) lv++;
    return lv;
  }

  /* ==================== رتبه ==================== */
  const RANKS = [
    { id:'novice',   min:0,    max:500,   icon:'🥚', name:'نوآموز' },
    { id:'striver',  min:500,  max:1500,  icon:'🌱', name:'کوشا' },
    { id:'student',  min:1500, max:3500,  icon:'⚔️', name:'کنکوری' },
    { id:'achiever', min:3500, max:7000,  icon:'🏆', name:'رتبه‌ساز' },
    { id:'legend',   min:7000, max:Infinity, icon:'👑', name:'افسانه' }
  ];
  function getRankByXP(xp){
    for(const r of RANKS) if(xp >= r.min && xp < r.max) return r;
    return RANKS[RANKS.length - 1];
  }

  /* ==================== صدای XP (اگه موجوده) ==================== */
  function playXPSound(){
    if(window.PiramidSound && window.PiramidSound.xp){
      try{ window.PiramidSound.xp(); }catch(e){}
    }
  }

  /* ==================== انیمیشن عدد شناور ==================== */
  function showXPPop(amount, sourceEl){
    if(document.body.classList.contains('fr-body')) return;

    const pop = document.createElement('div');
    pop.className = 'jn-xp-pop';
    pop.textContent = '+' + String(amount).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('') + ' XP';

    let x = window.innerWidth / 2;
    let y = 200;
    if(sourceEl && sourceEl.getBoundingClientRect){
      const r = sourceEl.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top;
    }
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    pop.style.zIndex = '99998';
    pop.style.position = 'fixed';
    pop.style.pointerEvents = 'none';
    pop.style.fontWeight = '900';
    pop.style.fontSize = '1.3em';
    pop.style.color = '#c83f7f';
    pop.style.textShadow = '0 2px 8px rgba(232,93,158,.5)';
    pop.style.animation = 'jnXpPop 1.4s ease-out forwards';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1400);
  }

  /* ==================== Level Up Overlay ==================== */
  function triggerLevelUp(newLevel, newRank){
    // اگه صفحه‌ای overlay داره (journey.html)، استفاده کن
    const existing = document.getElementById('jnLevelUp');
    if(existing){
      const lv = document.getElementById('jnLuLevel');
      const rk = document.getElementById('jnLuRank');
      const ic = document.getElementById('jnLuIcon');
      if(lv) lv.textContent = String(newLevel).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');
      if(rk) rk.textContent = newRank.icon + ' ' + newRank.name;
      if(ic) ic.textContent = newRank.icon;
      existing.classList.add('show');
      setTimeout(() => existing.classList.remove('show'), 4200);
      return;
    }

    // وگرنه یه overlay سریع بساز
    const ov = document.createElement('div');
    ov.style.cssText = `
      position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,.75); backdrop-filter:blur(8px);
      display:flex; align-items:center; justify-content:center;
      opacity:0; transition:.4s; padding:20px;
    `;
    ov.innerHTML = `
      <div style="
        background:var(--glass-bg, #fff); backdrop-filter:blur(24px);
        border:1px solid var(--glass-border, #eee);
        border-radius:28px; padding:40px 34px; text-align:center;
        max-width:340px; box-shadow:0 30px 80px rgba(0,0,0,.4);
        transform:scale(.85); transition:.5s cubic-bezier(.34,1.4,.5,1);
        font-family:inherit;
      ">
        <div style="font-size:5em;margin-bottom:14px;">${newRank.icon}</div>
        <div style="font-size:.85em;font-weight:800;color:#c83f7f;letter-spacing:2px;margin-bottom:8px;">سطح جدید!</div>
        <div style="font-size:1.5em;font-weight:800;color:var(--text,#333);margin-bottom:14px;">
          سطح <b style="color:#e85d9e;">${String(newLevel).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('')}</b>
        </div>
        <div style="padding:8px 20px;border-radius:999px;background:#fff0f7;color:#c83f7f;font-weight:800;display:inline-block;font-size:1em;">
          ${newRank.icon} ${newRank.name}
        </div>
      </div>
    `;
    document.body.appendChild(ov);
    requestAnimationFrame(() => {
      ov.style.opacity = '1';
      ov.querySelector('div').style.transform = 'scale(1)';
    });
    setTimeout(() => {
      ov.style.opacity = '0';
      setTimeout(() => ov.remove(), 400);
    }, 3200);
  }

  /* ==================== افزودن XP ==================== */
  function addXP(amount, sourceEl){
    if(!amount || amount <= 0) return;

    const oldXP = getXP();
    const oldLevel = getLevel();
    const oldRank = getRankByXP(oldXP);

    const newXP = oldXP + amount;
    const newLevel = levelFromXP(newXP);
    const newRank = getRankByXP(newXP);

    // ذخیره
    setXP(newXP);
    if(newLevel !== oldLevel) setLevel(newLevel);

    // لاگ روزانه
    const now = new Date();
    const k = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const log = getXPLog();
    log[k] = (log[k] || 0) + amount;
    setXPLog(log);

    // انیمیشن
    showXPPop(amount, sourceEl);
    playXPSound();

    // Level Up
    if(newLevel > oldLevel){
      setTimeout(() => triggerLevelUp(newLevel, newRank), 400);
    }

    // اطلاع به بقیه ماژول‌ها
    window.dispatchEvent(new CustomEvent('piramid:xp', {
      detail: { amount, total: newXP, level: newLevel, gained: newLevel > oldLevel }
    }));

    // اطلاع به sync
    if(window.PiramidSync && window.PiramidSync.notifyXPChanged){
      try{ window.PiramidSync.notifyXPChanged(); }catch(e){}
    }

    return newXP;
  }

  /* ==================== API عمومی ==================== */
  window.PiramidXP = {
    add: addXP,
    get: getXP,
    getLevel: getLevel,
    getRank: () => getRankByXP(getXP()),
    xpForLevel,
    levelFromXP,
    _engineReady: true
  };

  console.log('%c⚡ XP Engine ready', 'color:#e85d9e;font-weight:700;');
})();