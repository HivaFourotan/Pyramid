/* ======================================================================
   PIRAMID — focus-room.js
   اتاق تمرکز: منظره‌های canvas زنده + صداهای Web Audio + تنفس + تایمر
   ====================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');
  const pad2 = n => String(n).padStart(2, '0');

  /* ==================== 1) Canvas Scene Engine ==================== */
  const canvas = $('#frCanvas');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let currentScene = 'rain';
  let particles = [];
  let sceneTime = 0;

  function resizeCanvas(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initScene();
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ---- سازنده‌ی صحنه‌ها ---- */
  function initScene(){
    particles = [];
    sceneTime = 0;

    switch(currentScene){
      case 'rain':
        for(let i = 0; i < 180; i++){
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            len: 12 + Math.random() * 18,
            speed: 8 + Math.random() * 10,
            opacity: .3 + Math.random() * .5
          });
        }
        break;

      case 'snow':
        for(let i = 0; i < 160; i++){
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 1 + Math.random() * 3,
            vy: .3 + Math.random() * 1,
            vx: -0.3 + Math.random() * .6,
            drift: Math.random() * Math.PI * 2,
            opacity: .4 + Math.random() * .5
          });
        }
        break;

      case 'stars':
        for(let i = 0; i < 200; i++){
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: .4 + Math.random() * 1.6,
            phase: Math.random() * Math.PI * 2,
            speed: .5 + Math.random() * 1.5,
            opacity: .3 + Math.random() * .7
          });
        }
        break;

      case 'aurora':
        for(let i = 0; i < 120; i++){
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 40 + Math.random() * 100,
            hue: 140 + Math.random() * 140,
            phase: Math.random() * Math.PI * 2,
            speed: .3 + Math.random() * .7
          });
        }
        break;

      case 'fire':
        for(let i = 0; i < 200; i++){
          particles.push({
            x: W/2 + (Math.random() - .5) * 240,
            y: H + Math.random() * 100,
            vx: (Math.random() - .5) * .8,
            vy: -1 - Math.random() * 2.5,
            r: 2 + Math.random() * 8,
            life: 1,
            decay: .003 + Math.random() * .006
          });
        }
        break;

      case 'ocean':
        for(let i = 0; i < 5; i++){
          particles.push({
            yBase: H * .55 + i * (H * .08),
            amp: 20 + i * 12,
            speed: .4 + i * .15,
            phase: i * 1.2,
            alpha: .12 + i * .04
          });
        }
        break;
    }
  }

  /* ---- رسم هر صحنه ---- */
  function drawScene(){
    sceneTime += 1;
    ctx.clearRect(0, 0, W, H);

    switch(currentScene){
      case 'rain':      drawRain();      break;
      case 'snow':      drawSnow();      break;
      case 'stars':     drawStars();     break;
      case 'aurora':    drawAurora();    break;
      case 'fire':      drawFire();      break;
      case 'ocean':     drawOcean();     break;
    }

    requestAnimationFrame(drawScene);
  }

  function drawRain(){
    // پس‌زمینه
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(20, 25, 45, 1)');
    grad.addColorStop(1, 'rgba(10, 15, 30, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      p.y += p.speed;
      p.x -= p.speed * .15;
      if(p.y > H){ p.y = -20; p.x = Math.random() * W + 40; }
      if(p.x < -10){ p.x = W + 10; }

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 2, p.y + p.len);
      ctx.strokeStyle = `rgba(180, 210, 255, ${p.opacity})`;
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  }

  function drawSnow(){
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(30, 35, 55, 1)');
    grad.addColorStop(1, 'rgba(15, 18, 32, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      p.drift += .01;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.drift) * .4;
      if(p.y > H + 10){ p.y = -10; p.x = Math.random() * W; }
      if(p.x < -10) p.x = W + 10;
      if(p.x > W + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(200, 230, 255, .8)';
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function drawStars(){
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H));
    grad.addColorStop(0, 'rgba(25, 15, 45, 1)');
    grad.addColorStop(.5, 'rgba(15, 10, 30, 1)');
    grad.addColorStop(1, 'rgba(5, 3, 15, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      p.phase += .02 * p.speed;
      const tw = .5 + Math.sin(p.phase) * .5;
      const alpha = p.opacity * tw;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(200, 220, 255, .8)';
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function drawAurora(){
    // پس‌زمینه
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(5, 8, 20, 1)');
    grad.addColorStop(.5, 'rgba(10, 15, 35, 1)');
    grad.addColorStop(1, 'rgba(5, 8, 20, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ذرات شفق
    ctx.globalCompositeOperation = 'screen';
    particles.forEach(p => {
      p.phase += .005 * p.speed;
      const yOff = Math.sin(p.phase) * 80;
      const xOff = Math.cos(p.phase * .7) * 60;

      const radial = ctx.createRadialGradient(
        p.x + xOff, p.y + yOff, 0,
        p.x + xOff, p.y + yOff, p.r
      );
      radial.addColorStop(0, `hsla(${p.hue}, 80%, 60%, .35)`);
      radial.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, W, H);
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawFire(){
    // پس‌زمینه
    ctx.fillStyle = 'rgba(10, 5, 3, 1)';
    ctx.fillRect(0, 0, W, H);

    // گرادیان گرم پایین
    const grad = ctx.createRadialGradient(W/2, H + 100, 0, W/2, H + 100, H);
    grad.addColorStop(0, 'rgba(255, 120, 40, .35)');
    grad.addColorStop(.5, 'rgba(255, 60, 20, .12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ذرات آتش
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.r *= .995;

      if(p.life <= 0 || p.y < -20){
        p.x = W/2 + (Math.random() - .5) * 260;
        p.y = H + Math.random() * 60;
        p.vx = (Math.random() - .5) * .8;
        p.vy = -1 - Math.random() * 2.5;
        p.r = 2 + Math.random() * 8;
        p.life = 1;
      }

      const alpha = Math.max(0, p.life);
      const hue = 20 + Math.random() * 30;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha * .6})`;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${alpha * .8})`;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawOcean(){
    // پس‌زمینه آسمان غروب
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1a1528');
    sky.addColorStop(.4, '#3d2340');
    sky.addColorStop(.55, '#7a3d50');
    sky.addColorStop(.6, '#b55a4a');
    sky.addColorStop(.65, '#1a1020');
    sky.addColorStop(1, '#0a0510');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // خورشید
    const sunY = H * .55;
    const sunGrad = ctx.createRadialGradient(W/2, sunY, 0, W/2, sunY, 200);
    sunGrad.addColorStop(0, 'rgba(255, 200, 120, .9)');
    sunGrad.addColorStop(.4, 'rgba(255, 140, 80, .4)');
    sunGrad.addColorStop(1, 'rgba(255, 100, 60, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, W, H);

    // امواج
    particles.forEach((wave, idx) => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for(let x = 0; x <= W; x += 6){
        const y = wave.yBase
          + Math.sin((x * .008) + sceneTime * .02 * wave.speed + wave.phase) * wave.amp
          + Math.sin((x * .02) + sceneTime * .03 * wave.speed) * wave.amp * .3;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, wave.yBase - 40, 0, H);
      waveGrad.addColorStop(0, `rgba(120, 180, 230, ${wave.alpha * .6})`);
      waveGrad.addColorStop(1, `rgba(30, 60, 120, ${wave.alpha * 1.5})`);
      ctx.fillStyle = waveGrad;
      ctx.fill();
    });
  }

  drawScene();

  /* ==================== 2) Web Audio Engine ==================== */
  const Audio = {
    ctx: null,
    nodes: {}, // { rain: { source, gain, filter }, ... }

    ensureCtx(){
      if(!this.ctx){
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      }
      if(this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },

    /* ---- نویز سفید ---- */
    makeNoise(dur = 4){
      const ctx = this.ctx;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for(let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      return src;
    },

    /* ---- نویز قهوه‌ای ---- */
    makeBrownNoise(dur = 4){
      const ctx = this.ctx;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for(let i = 0; i < data.length; i++){
        const w = Math.random() * 2 - 1;
        last = (last + .02 * w) / 1.02;
        data[i] = last * 3.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      return src;
    },

    /* ---- صدای باران ---- */
    createRain(volume){
      const ctx = this.ensureCtx();
      const noise = this.makeNoise(4);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      filter.Q.value = .5;
      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.value = 8000;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      noise.connect(filter);
      filter.connect(filter2);
      filter2.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);
      return { source: noise, gain };
    },

    /* ---- همهمه‌ی کافه ---- */
    createCafe(volume){
      const ctx = this.ensureCtx();
      const noise = this.makeBrownNoise(4);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 500;
      filter.Q.value = .8;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);
      return { source: noise, gain };
    },

    /* ---- موج دریا ---- */
    createWaves(volume){
      const ctx = this.ensureCtx();
      const noise = this.makeNoise(6);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 700;
      filter.Q.value = 1;

      const gain = ctx.createGain();
      gain.gain.value = volume * .7;

      // LFO برای موج
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = .12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = volume * .5;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      return { source: noise, gain, lfo };
    },

    /* ---- جنگل ---- */
    createForest(volume){
      const ctx = this.ensureCtx();
      const noise = this.makeNoise(4);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2500;
      filter.Q.value = .4;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      // سوت پرنده گاه به گاه
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 2800;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0;
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();

      const chirp = () => {
        if(Math.random() > .7){
          const t = ctx.currentTime;
          oscGain.gain.cancelScheduledValues(t);
          oscGain.gain.setValueAtTime(0, t);
          oscGain.gain.linearRampToValueAtTime(.04, t + .05);
          oscGain.gain.exponentialRampToValueAtTime(.001, t + .3);
          osc.frequency.setValueAtTime(2200 + Math.random() * 1200, t);
          osc.frequency.linearRampToValueAtTime(3200 + Math.random() * 800, t + .25);
        }
        setTimeout(chirp, 1500 + Math.random() * 4000);
      };
      chirp();

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);
      return { source: noise, gain, osc };
    },

    /* ---- آتش ---- */
    createFire(volume){
      const ctx = this.ensureCtx();
      const noise = this.makeBrownNoise(4);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 300;
      filter.Q.value = .5;

      const gain = ctx.createGain();
      gain.gain.value = volume * .7;

      // کرکره‌ی گاه‌به‌گاه
      const pop = () => {
        if(Math.random() > .55){
          const t = ctx.currentTime;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(80 + Math.random() * 100, t);
          o.frequency.exponentialRampToValueAtTime(40, t + .08);
          g.gain.setValueAtTime(.15, t);
          g.gain.exponentialRampToValueAtTime(.001, t + .1);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + .12);
        }
        setTimeout(pop, 400 + Math.random() * 1800);
      };
      pop();

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      return { source: noise, gain };
    },

    /* ---- نویز سفید ---- */
    createWhite(volume){
      const ctx = this.ensureCtx();
      const noise = this.makeNoise(4);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      gain.gain.linearRampToValueAtTime(volume * .4, ctx.currentTime + 1);
      return { source: noise, gain };
    },

    /* ---- API عمومی ---- */
    map: {
      rain:   'createRain',
      cafe:   'createCafe',
      waves:  'createWaves',
      forest: 'createForest',
      fire:   'createFire',
      white:  'createWhite'
    },

    start(type, volume){
      if(this.nodes[type]) return;
      const fn = this[this.map[type]];
      if(!fn) return;
      this.nodes[type] = fn.call(this, volume);
    },

    stop(type){
      const node = this.nodes[type];
      if(!node) return;
      try{
        const gain = node.gain;
        gain.gain.cancelScheduledValues(this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + .5);
        setTimeout(() => {
          try{ node.source.stop(); }catch(e){}
          try{ node.lfo && node.lfo.stop(); }catch(e){}
          try{ node.osc && node.osc.stop(); }catch(e){}
        }, 600);
      }catch(e){}
      delete this.nodes[type];
    },

    setVolume(type, v){
      const node = this.nodes[type];
      if(!node || !node.gain) return;
      try{
        const now = this.ctx.currentTime;
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.linearRampToValueAtTime(v, now + .1);
      }catch(e){}
    }
  };

  /* ==================== 3) Timer ==================== */
  const CIRC = 2 * Math.PI * 140;
  let totalMinutes = 25;
  let remainingSeconds = 25 * 60;
  let totalSeconds = remainingSeconds;
  let running = false;
  let timerId = null;

  const timeEl  = $('#frTime');
  const stateEl = $('#frState');
  const ringFg  = $('#frRingFg');
  const startBtn = $('#frStartBtn');

  function fmtTime(sec){
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return toFa(pad2(m) + ':' + pad2(s));
  }

  function updateTime(){
    timeEl.textContent = fmtTime(remainingSeconds);
    const ratio = remainingSeconds / totalSeconds;
    ringFg.style.strokeDasharray = CIRC;
    ringFg.style.strokeDashoffset = CIRC * (1 - ratio);
  }

  function setState(txt){ stateEl.textContent = txt; }

  function startTimer(){
    if(running) return;
    running = true;
    setState('در حال اجرا');
    startBtn.classList.add('running');
    startBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg><span>توقف</span>';
    timerId = setInterval(() => {
      remainingSeconds--;
      if(remainingSeconds <= 0){
        remainingSeconds = 0;
        updateTime();
        finishSession();
        return;
      }
      updateTime();
    }, 1000);
  }

  function pauseTimer(){
    if(!running) return;
    running = false;
    clearInterval(timerId);
    timerId = null;
    setState('متوقف');
    startBtn.classList.remove('running');
    startBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>ادامه</span>';
  }

  function resetTimer(){
    running = false;
    clearInterval(timerId);
    timerId = null;
    remainingSeconds = totalSeconds;
    updateTime();
    setState('آماده');
    startBtn.classList.remove('running');
    startBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>شروع</span>';
  }

  function finishSession(){
    running = false;
    clearInterval(timerId);
    timerId = null;
    setState('تمام شد! 🎉');

    // زنگ
    playBell();

    // ثبت جلسه
    saveSession(totalMinutes);

    // XP
    if(window.PiramidXP){
      window.PiramidXP.add(15);
      window.dispatchEvent(new CustomEvent('piramid:study', {
        detail:{ sessions:1, minutes:totalMinutes }
      }));
    }

    if(window.showToast){
      window.showToast(`🎉 ${toFa(totalMinutes)} دقیقه تمرکز کامل شد!`, 'success', 4000);
    }

    // کانفتی
    if(window.fireConfetti){
      window.fireConfetti(window.innerWidth/2, window.innerHeight/2 - 100);
    }

    setTimeout(resetTimer, 3000);
  }

  function playBell(){
    try{
      const ctx = Audio.ensureCtx();
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        o.connect(g);
        g.connect(ctx.destination);
        const t = ctx.currentTime + i * .18;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(.18, t + .04);
        g.gain.exponentialRampToValueAtTime(.001, t + 1.4);
        o.start(t);
        o.stop(t + 1.5);
      });
    }catch(e){}
  }

  function saveSession(minutes){
    try{
      const sessions = JSON.parse(localStorage.getItem('piramid_sessions') || '{}');
      const d = new Date();
      const k = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
      if(!sessions[k]) sessions[k] = { minutes:0, sessions:0 };
      sessions[k].minutes += minutes;
      sessions[k].sessions += 1;
      localStorage.setItem('piramid_sessions', JSON.stringify(sessions));

      // streak
      const streak = JSON.parse(localStorage.getItem('piramid_streak') || '{"count":0,"lastDate":null}');
      if(streak.lastDate !== k){
        const y = new Date(); y.setDate(y.getDate() - 1);
        const yK = `${y.getFullYear()}-${pad2(y.getMonth()+1)}-${pad2(y.getDate())}`;
        if(streak.lastDate === yK) streak.count++;
        else streak.count = 1;
        streak.lastDate = k;
        localStorage.setItem('piramid_streak', JSON.stringify(streak));
      }
      refreshTodayStats();
    }catch(e){}
  }

  /* ==================== 4) صحنه و کنترل‌ها ==================== */
  $$('.fr-scene').forEach(b => {
    b.addEventListener('click', () => {
      $$('.fr-scene').forEach(x => x.classList.toggle('active', x === b));
      currentScene = b.dataset.scene;
      initScene();
    });
  });

  $$('.fr-preset').forEach(b => {
    b.addEventListener('click', () => {
      if(running) return;
      $$('.fr-preset').forEach(x => x.classList.toggle('active', x === b));
      totalMinutes = parseInt(b.dataset.min, 10);
      totalSeconds = totalMinutes * 60;
      remainingSeconds = totalSeconds;
      updateTime();
    });
  });

  startBtn?.addEventListener('click', () => {
    running ? pauseTimer() : startTimer();
  });
  $('#frResetBtn')?.addEventListener('click', resetTimer);

  /* ==================== 5) Sounds binding ==================== */
  $$('.fr-sound').forEach(el => {
    const type = el.dataset.sound;
    const toggle = el.querySelector('.fr-sound-toggle');
    const vol = el.querySelector('.fr-sound-vol');

    toggle.addEventListener('click', () => {
      const on = !toggle.classList.contains('on');
      toggle.classList.toggle('on', on);
      el.classList.toggle('active', on);
      if(on){
        Audio.start(type, (parseInt(vol.value, 10) / 100) * .5);
      } else {
        Audio.stop(type);
      }
    });

    vol.addEventListener('input', () => {
      if(toggle.classList.contains('on')){
        Audio.setVolume(type, (parseInt(vol.value, 10) / 100) * .5);
      }
    });
  });

  /* ==================== 6) Breathing Exercise ==================== */
  const breatheOverlay = $('#frBreatheOverlay');
  const breatheCircle = $('#frBreatheCircle');
  const breathePhase = $('#frBreathePhase');
  const breatheCount = $('#frBreatheCount');
  let breatheTimer = null;
  let breatheCycle = 0;

  function startBreathing(){
    breatheOverlay.classList.add('open');
    breatheCycle = 0;
    runCycle();
  }
  function stopBreathing(){
    breatheOverlay.classList.remove('open');
    if(breatheTimer) clearTimeout(breatheTimer);
    breatheCircle.classList.remove('inhale', 'hold', 'exhale');
  }
  function runCycle(){
    breatheCycle++;
    // دم (4 ثانیه)
    breatheCircle.classList.remove('hold', 'exhale');
    breatheCircle.classList.add('inhale');
    breathePhase.textContent = 'دم بگیر...';
    let count = 4;
    breatheCount.textContent = toFa(count);
    const inhaleTick = setInterval(() => {
      count--;
      if(count > 0) breatheCount.textContent = toFa(count);
    }, 1000);
    setTimeout(() => {
      clearInterval(inhaleTick);
      // نگه‌داشتن (7 ثانیه)
      breatheCircle.classList.remove('inhale');
      breatheCircle.classList.add('hold');
      breathePhase.textContent = 'نگه‌دار...';
      let c2 = 7;
      breatheCount.textContent = toFa(c2);
      const holdTick = setInterval(() => {
        c2--;
        if(c2 > 0) breatheCount.textContent = toFa(c2);
      }, 1000);
      setTimeout(() => {
        clearInterval(holdTick);
        // بازدم (8 ثانیه)
        breatheCircle.classList.remove('hold');
        breatheCircle.classList.add('exhale');
        breathePhase.textContent = 'بازدم...';
        let c3 = 8;
        breatheCount.textContent = toFa(c3);
        const exhaleTick = setInterval(() => {
          c3--;
          if(c3 > 0) breatheCount.textContent = toFa(c3);
        }, 1000);
        setTimeout(() => {
          clearInterval(exhaleTick);
          if(breatheOverlay.classList.contains('open')) runCycle();
        }, 8000);
      }, 7000);
    }, 4000);
  }

  $('#frBreatheBtn')?.addEventListener('click', startBreathing);
  $('#frBreatheClose')?.addEventListener('click', stopBreathing);

  /* ==================== 7) Fullscreen ==================== */
  $('#frFullscreen')?.addEventListener('click', () => {
    if(!document.fullscreenElement){
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  /* ==================== 8) Panel toggle (mobile) ==================== */
  const panel = $('#frPanel');
  const handle = $('#frPanelHandle');
  handle?.addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  // در دسکتاپ، پنل همیشه باز
  function checkPanelDefault(){
    if(window.innerWidth > 820){
      panel.classList.add('open');
    } else {
      panel.classList.remove('open');
    }
  }
  checkPanelDefault();
  window.addEventListener('resize', checkPanelDefault);

  /* ==================== 9) آمار امروز ==================== */
  function refreshTodayStats(){
    try{
      const sessions = JSON.parse(localStorage.getItem('piramid_sessions') || '{}');
      const d = new Date();
      const k = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
      const t = sessions[k] || { minutes:0, sessions:0 };
      const sEl = $('#frSessionsToday');
      const mEl = $('#frMinutesToday');
      if(sEl) sEl.textContent = toFa(t.sessions);
      if(mEl) mEl.textContent = toFa(t.minutes);
    }catch(e){}
  }
  refreshTodayStats();

  /* ==================== 10) init ==================== */
  updateTime();
  /* ==================== 9.5) FAB برای موبایل ==================== */
  (function(){
    const panel = document.getElementById('frPanel');
    if(!panel) return;

    // دکمه‌ی شناور برای باز کردن پنل
    const fab = document.createElement('button');
    fab.className = 'fr-panel-fab';
    fab.id = 'frPanelFab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'تنظیمات اتاق');
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    `;
    document.body.appendChild(fab);

    fab.addEventListener('click', () => {
      panel.classList.add('open');
      if(window.PiramidSound) window.PiramidSound.click();
    });

    // وقتی کاربر توی پنل کلیک بیرون کرد ببندش
    document.addEventListener('click', e => {
      if(!panel.classList.contains('open')) return;
      if(fab.contains(e.target)) return;
      if(panel.contains(e.target)) return;
      panel.classList.remove('open');
    });

    // بستن با swipe down روی handle
    const handle = document.getElementById('frPanelHandle');
    if(handle){
      let startY = 0;
      let dragging = false;

      handle.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
        dragging = true;
        panel.style.transition = 'none';
      }, { passive:true });

      handle.addEventListener('touchmove', e => {
        if(!dragging) return;
        const dy = e.touches[0].clientY - startY;
        if(dy > 0) panel.style.transform = `translateY(${dy}px)`;
      }, { passive:true });

      handle.addEventListener('touchend', e => {
        if(!dragging) return;
        dragging = false;
        panel.style.transition = '';
        panel.style.transform = '';
        const dy = (e.changedTouches[0].clientY - startY);
        if(dy > 100) panel.classList.remove('open');
      });
    }
  })();

  console.log('%c🌧 Piramid Focus Room ready','color:#e85d9e;font-weight:700;font-size:13px;');
});