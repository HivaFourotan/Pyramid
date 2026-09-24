/* ======================================================================
   PIRAMID — sound.js
   افکت‌های صوتی ریز با Web Audio API — بدون هیچ فایل صوتی
   ====================================================================== */
'use strict';

(function(){
  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const setLS = (k, v) => {
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  };

  /* ==================== تنظیمات ==================== */
  let settings = getLS('piramid_sound_settings', {
    enabled: true,
    volume: 0.5,
    effects: {
      click: true,
      success: true,
      error: true,
      xp: true,
      achievement: true,
      levelup: true,
      flashcard: true,
      typing: true,
      notification: true,
      whoosh: true
    }
  });

  function saveSettings(){ setLS('piramid_sound_settings', settings); }

  /* ==================== Audio Context ==================== */
  let audioCtx = null;
  let unlocked = false;

  function getCtx(){
    if(!audioCtx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      try{
        audioCtx = new AC();
      }catch(e){ return null; }
    }
    if(audioCtx.state === 'suspended'){
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  /* ==================== Unlock iOS ==================== */
  function unlockAudio(){
    if(unlocked) return;
    const ctx = getCtx();
    if(!ctx) return;

    // یه بوق بی‌صدا بزن
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.001);
    unlocked = true;
  }

  document.addEventListener('touchstart', unlockAudio, { once:true, passive:true });
  document.addEventListener('click', unlockAudio, { once:true });
  document.addEventListener('keydown', unlockAudio, { once:true });

  /* ==================== Core: Tone ==================== */
  function playTone(freq, duration, options = {}){
    if(!settings.enabled) return;
    const ctx = getCtx();
    if(!ctx) return;

    const type = options.type || 'sine';
    const volume = (options.volume ?? 0.15) * settings.volume;
    const attack = options.attack ?? 0.005;
    const release = options.release ?? 0.15;
    const startTime = ctx.currentTime + (options.delay || 0);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if(options.endFreq){
      osc.frequency.exponentialRampToValueAtTime(options.endFreq, startTime + duration);
    }

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + release + 0.05);
  }

  /* ==================== Noise (for whoosh, click) ==================== */
  function playNoise(duration, options = {}){
    if(!settings.enabled) return;
    const ctx = getCtx();
    if(!ctx) return;

    const volume = (options.volume ?? 0.08) * settings.volume;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i = 0; i < data.length; i++){
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, options.decay ?? 2);
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = options.filterType || 'highpass';
    filter.frequency.value = options.filterFreq || 1000;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  /* ==================== افکت‌ها ==================== */

  // 🖱 کلیک
  function click(){
    if(!settings.effects.click) return;
    playTone(880, 0.04, { type:'sine', volume: 0.06, release: 0.08 });
  }

  // ✅ موفقیت
  function success(){
    if(!settings.effects.success) return;
    playTone(523, 0.1, { volume: 0.12, delay: 0 });
    playTone(659, 0.1, { volume: 0.12, delay: 0.08 });
    playTone(784, 0.15, { volume: 0.12, delay: 0.16 });
  }

  // ❌ خطا
  function error(){
    if(!settings.effects.error) return;
    playTone(300, 0.12, { type:'sawtooth', volume: 0.08 });
    playTone(220, 0.15, { type:'sawtooth', volume: 0.08, delay: 0.1 });
  }

  // ⚡ XP
  function xp(){
    if(!settings.effects.xp) return;
    playTone(1200, 0.06, { type:'triangle', volume: 0.08 });
    playTone(1600, 0.08, { type:'triangle', volume: 0.08, delay: 0.05 });
  }

  // 🏆 دستاورد
  function achievement(){
    if(!settings.effects.achievement) return;
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => {
      playTone(f, 0.12, { type:'triangle', volume: 0.1, delay: i * 0.08 });
    });
  }

  // 🎖 Level Up
  function levelUp(){
    if(!settings.effects.levelup) return;
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((f, i) => {
      playTone(f, 0.2, { type:'triangle', volume: 0.12, delay: i * 0.1 });
      playTone(f * 2, 0.15, { type:'sine', volume: 0.05, delay: i * 0.1 + 0.02 });
    });
  }

  // 🃏 فلش‌کارت فلیپ
  function flashcard(){
    if(!settings.effects.flashcard) return;
    playTone(600, 0.05, { type:'triangle', volume: 0.07, endFreq: 900 });
    playNoise(0.08, { volume: 0.05, filterType:'highpass', filterFreq: 2000 });
  }

  // ⌨️ تایپ (برای چت/یادداشت)
  let lastTyping = 0;
  function typing(){
    if(!settings.effects.typing) return;
    const now = Date.now();
    if(now - lastTyping < 60) return; // ضد پرش
    lastTyping = now;
    playTone(1800 + Math.random() * 400, 0.015, {
      type:'square', volume: 0.02, release: 0.02
    });
  }

  // 🔔 نوتیفیکیشن
  function notification(){
    if(!settings.effects.notification) return;
    playTone(880, 0.1, { type:'sine', volume: 0.1 });
    playTone(1174, 0.15, { type:'sine', volume: 0.1, delay: 0.1 });
  }

  // 💨 ووش (برای ترنزیشن)
  function whoosh(){
    if(!settings.effects.whoosh) return;
    playNoise(0.25, { volume: 0.06, filterType:'bandpass', filterFreq: 800, decay: 1.5 });
  }

  // 🎉 جشن (برای کپسول)
  function celebration(){
    const notes = [523, 659, 784, 1047, 1319, 1568, 2093];
    notes.forEach((f, i) => {
      playTone(f, 0.18, { type:'triangle', volume: 0.1, delay: i * 0.06 });
    });
    playNoise(0.4, { volume: 0.06, filterType:'highpass', filterFreq: 2000, decay: 1 });
  }

  // ⏱ تیک تایمر
  function tick(){
    playTone(1400, 0.02, { type:'sine', volume: 0.04, release: 0.03 });
  }

  // 🍅 پومودورو تموم شد
  function pomodoroDone(){
    const notes = [523, 784, 1047];
    notes.forEach((f, i) => {
      playTone(f, 0.4, { type:'sine', volume: 0.14, delay: i * 0.25 });
      playTone(f * 2, 0.3, { type:'triangle', volume: 0.05, delay: i * 0.25 });
    });
  }

  /* ==================== API ==================== */
  const Sound = {
    click,
    success,
    error,
    xp,
    achievement,
    levelUp,
    flashcard,
    typing,
    notification,
    whoosh,
    celebration,
    tick,
    pomodoroDone,
    getSettings(){ return { ...settings }; },
    setEnabled(enabled){
      settings.enabled = !!enabled;
      saveSettings();
      if(enabled){
        unlockAudio();
        success();
      }
    },
    setVolume(v){
      settings.volume = Math.max(0, Math.min(1, v));
      saveSettings();
      click();
    },
    setEffect(name, on){
      if(settings.effects[name] !== undefined){
        settings.effects[name] = !!on;
        saveSettings();
      }
    }
  };

  window.PiramidSound = Sound;

  /* ==================== Auto-Bind روی رویدادها ==================== */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .floating-btn, .nav-link, button:not(.pm-nav-btn)');
    if(!btn) return;
    // اگه دکمه‌ی صدا خودشه، نزن
    if(btn.dataset.nosound === '1') return;

    // اگه دکمه توی پنل تنظیمات صداست، فقط یه کلیک ساده
    click();
  }, { passive:true });

  // XP رو به صدا وصل کن
  function hookXPSound(){
    if(!window.PiramidXP) return false;
    if(window.PiramidXP._soundHooked) return true;
    const orig = window.PiramidXP.add;
    window.PiramidXP.add = function(amount, sourceEl){
      xp();
      return orig.call(this, amount, sourceEl);
    };
    window.PiramidXP._soundHooked = true;
    return true;
  }
  if(!hookXPSound()){
    let t = 0;
    const iv = setInterval(() => {
      if(hookXPSound() || ++t > 30) clearInterval(iv);
    }, 300);
  }

  // Toast صدا
  const origToast = window.showToast;
  if(origToast){
    window.showToast = function(msg, type, duration){
      if(type === 'success') success();
      else if(type === 'error') error();
      return origToast.call(this, msg, type, duration);
    };
  }

  /* ==================== پنل تنظیمات صوتی ==================== */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.id = 'piramidSoundBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'تنظیمات صدا');
    btn.setAttribute('data-nosound', '1');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </svg>
    `;
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '300px',
      left: '22px',
      zIndex: '999',
      width: '46px',
      height: '46px',
      borderRadius: '50%',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid var(--glass-border)',
      color: 'var(--primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
      transition: 'all .3s'
    });
    btn.querySelector('svg').style.width = '20px';
    btn.querySelector('svg').style.height = '20px';

    if(window.innerWidth <= 560){
      btn.style.left = '14px';
      btn.style.bottom = '348px';
      btn.style.width = '42px';
      btn.style.height = '42px';
    }

    function updateBtn(){
      if(settings.enabled){
        btn.style.background = 'linear-gradient(135deg, #3bb89a, #4a90d9)';
        btn.style.color = '#fff';
        btn.style.border = 'none';
      } else {
        btn.style.background = 'var(--glass-bg)';
        btn.style.color = 'var(--muted)';
        btn.style.border = '1px solid var(--glass-border)';
      }
    }
    updateBtn();

    document.body.appendChild(btn);

    // پنل کوچیک
    let panel = null;

    function buildPanel(){
      panel = document.createElement('div');
      panel.id = 'piramidSoundPanel';
      Object.assign(panel.style, {
        position: 'fixed',
        left: '22px',
        bottom: '360px',
        zIndex: '1001',
        width: '300px',
        maxWidth: 'calc(100vw - 44px)',
        padding: '20px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,.25)',
        opacity: '0',
        visibility: 'hidden',
        transform: 'translateY(20px) scale(.94)',
        transition: '.4s cubic-bezier(.34,1.4,.5,1)',
        fontFamily: 'inherit',
        color: 'var(--text)'
      });

      if(window.innerWidth <= 560){
        panel.style.left = '14px';
        panel.style.width = 'calc(100vw - 28px)';
        panel.style.bottom = '400px';
      }

      const effects = [
        { id:'click',        name:'🖱 کلیک' },
        { id:'success',      name:'✅ موفقیت' },
        { id:'error',        name:'❌ خطا' },
        { id:'xp',           name:'⚡ XP' },
        { id:'achievement',  name:'🏆 دستاورد' },
        { id:'levelup',      name:'🎖 Level Up' },
        { id:'flashcard',    name:'🃏 فلش‌کارت' },
        { id:'typing',       name:'⌨️ تایپ' },
        { id:'notification', name:'🔔 نوتیفیکیشن' },
        { id:'whoosh',       name:'💨 ووش' }
      ];

      panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px dashed var(--border);">
          <b style="font-size:.95em;">🔊 تنظیمات صدا</b>
          <button id="ps-close" type="button" style="width:28px;height:28px;border-radius:50%;background:var(--soft);border:none;color:var(--muted);cursor:pointer;font-family:inherit;">✕</button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;font-size:.85em;font-weight:600;margin-bottom:14px;">
          <span>فعال باشد</span>
          <button id="ps-enabled" type="button" style="position:relative;width:44px;height:24px;border-radius:999px;background:${settings.enabled ? 'var(--primary)' : 'var(--border)'};border:none;cursor:pointer;transition:.3s;"></button>
        </div>

        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:.8em;margin-bottom:8px;">
            <span>🔉 ولوم کلی</span>
            <b id="ps-vol-val" style="color:var(--primary-dark);">${Math.round(settings.volume * 100)}٪</b>
          </div>
          <input type="range" id="ps-vol" min="0" max="100" value="${Math.round(settings.volume * 100)}" style="width:100%;height:6px;border-radius:999px;background:linear-gradient(90deg,var(--primary-soft),var(--primary));outline:none;-webkit-appearance:none;appearance:none;cursor:pointer;direction:ltr;">
        </div>

        <div style="font-size:.78em;font-weight:800;color:var(--muted);margin-bottom:10px;letter-spacing:1px;">افکت‌ها</div>

        <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:6px;">
          ${effects.map(e => `
            <button class="ps-fx" data-fx="${e.id}" type="button" style="
              padding:8px 10px;border-radius:10px;font-family:inherit;font-size:.75em;font-weight:700;cursor:pointer;transition:.2s;
              background:${settings.effects[e.id] ? 'var(--primary-soft)' : 'var(--soft)'};
              color:${settings.effects[e.id] ? 'var(--primary-dark)' : 'var(--muted)'};
              border:1px solid ${settings.effects[e.id] ? 'var(--primary)' : 'var(--border)'};
              text-align:right;
            ">${e.name}</button>
          `).join('')}
        </div>

        <button id="ps-test" type="button" style="
          width:100%;margin-top:12px;padding:10px;border-radius:12px;
          background:linear-gradient(135deg,var(--primary),var(--primary-g3));color:#fff;
          border:none;font-family:inherit;font-size:.82em;font-weight:700;cursor:pointer;
        ">🎵 تست صدا</button>
      `;

      document.body.appendChild(panel);

      // استایل toggle
      const st = document.createElement('style');
      st.textContent = `
        #piramidSoundPanel button[id^="ps-enabled"]::after{
          content:""; position:absolute; top:3px; right:3px;
          width:18px; height:18px; border-radius:50%;
          background:#fff; box-shadow:0 2px 6px rgba(0,0,0,.2);
          transition:.3s cubic-bezier(.34,1.4,.5,1);
        }
        #piramidSoundPanel button[id^="ps-enabled"].on::after{
          transform:translateX(-20px);
        }
      `;
      document.head.appendChild(st);

      // بایند
      const enabledBtn = panel.querySelector('#ps-enabled');
      if(settings.enabled) enabledBtn.classList.add('on');

      enabledBtn.addEventListener('click', () => {
        settings.enabled = !settings.enabled;
        enabledBtn.classList.toggle('on', settings.enabled);
        enabledBtn.style.background = settings.enabled ? 'var(--primary)' : 'var(--border)';
        saveSettings();
        updateBtn();
        if(settings.enabled) success();
      });

      const vol = panel.querySelector('#ps-vol');
      const volVal = panel.querySelector('#ps-vol-val');
      vol.addEventListener('input', () => {
        const v = parseInt(vol.value, 10) / 100;
        settings.volume = v;
        volVal.textContent = Math.round(v * 100) + '٪';
        saveSettings();
      });
      vol.addEventListener('change', () => click());

      panel.querySelectorAll('.ps-fx').forEach(b => {
        b.addEventListener('click', () => {
          const id = b.dataset.fx;
          settings.effects[id] = !settings.effects[id];
          saveSettings();
          b.style.background = settings.effects[id] ? 'var(--primary-soft)' : 'var(--soft)';
          b.style.color = settings.effects[id] ? 'var(--primary-dark)' : 'var(--muted)';
          b.style.borderColor = settings.effects[id] ? 'var(--primary)' : 'var(--border)';
          // تست صدا
          if(settings.effects[id] && Sound[id]) {
            try{ Sound[id](); }catch(e){}
          }
        });
      });

      panel.querySelector('#ps-test').addEventListener('click', () => {
        levelUp();
      });

      panel.querySelector('#ps-close').addEventListener('click', closePanel);
    }

    let isOpen = false;
    function openPanel(){
      if(!panel) buildPanel();
      isOpen = true;
      panel.style.opacity = '1';
      panel.style.visibility = 'visible';
      panel.style.transform = 'translateY(0) scale(1)';
    }
    function closePanel(){
      if(!panel) return;
      isOpen = false;
      panel.style.opacity = '0';
      panel.style.visibility = 'hidden';
      panel.style.transform = 'translateY(20px) scale(.94)';
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      isOpen ? closePanel() : openPanel();
    });

    document.addEventListener('click', e => {
      if(isOpen && panel && !panel.contains(e.target) && !btn.contains(e.target)){
        closePanel();
      }
    });
  });

  console.log('%c🔊 Sound engine ready', 'color:#e85d9e;font-weight:700;');
})();