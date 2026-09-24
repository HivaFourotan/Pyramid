/* ======================================================================
   PIRAMID — share.js
   کارت‌های اشتراک‌گذاری PNG (دستاورد، XP، کارنامه، تخمین، استریک)
   ====================================================================== */
'use strict';

(function(){
  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');

  /* ==================== Canvas Setup ==================== */
  function getCanvas(w, h){
    const c = document.createElement('canvas');
    const dpr = 2;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    return { canvas: c, ctx };
  }

  /* ==================== ابزار ==================== */
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

  function drawLogo(ctx, x, y, size){
    const scale = size / 48;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#e85d9e';
    ctx.beginPath();
    ctx.moveTo(24, 4);
    ctx.lineTo(44, 40);
    ctx.lineTo(4, 40);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#c78ae8';
    ctx.beginPath();
    ctx.moveTo(24, 4);
    ctx.lineTo(34, 22);
    ctx.lineTo(14, 22);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function getGradientColors(){
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#e85d9e';
    const g3 = getComputedStyle(document.documentElement).getPropertyValue('--primary-g3').trim() || '#c78ae8';
    const g2 = getComputedStyle(document.documentElement).getPropertyValue('--primary-g2').trim() || '#f28fbd';
    return { primary, g3, g2 };
  }

  /* ==================== Template ۱: Achievement ==================== */
  function makeAchievementCard(title, desc, emoji){
    const W = 1080, H = 1080;
    const { canvas, ctx } = getCanvas(W, H);
    const colors = getGradientColors();

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, colors.primary);
    grad.addColorStop(1, colors.g3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.beginPath();
    ctx.arc(W - 100, 100, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, H - 100, 350, 0, Math.PI * 2);
    ctx.fill();

    // Particles
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    for(let i = 0; i < 40; i++){
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * 4 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Logo top
    drawLogo(ctx, W/2 - 40, 60, 80);

    // Text: "پیرامید"
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.font = '700 32px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('پیرامید', W/2, 200);

    // Emoji Big
    ctx.font = '280px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(emoji, W/2, H/2 + 60);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = '900 72px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(title, W/2, H/2 + 200);

    // Description
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.font = '600 34px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(desc, W/2, H/2 + 270);

    // Bottom bar
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    roundRect(ctx, 100, H - 180, W - 200, 100, 30);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '700 28px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('🎓  پیرامید  •  اپلیکیشن کنکوری‌ها', W/2, H - 118);

    return canvas;
  }

  /* ==================== Template ۲: Streak ==================== */
  function makeStreakCard(days){
    const W = 1080, H = 1080;
    const { canvas, ctx } = getCanvas(W, H);

    // Background
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
    grad.addColorStop(0, '#2b1a26');
    grad.addColorStop(1, '#0f0812');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Fire glow
    const fireGrad = ctx.createRadialGradient(W/2, H/2 + 100, 0, W/2, H/2 + 100, 400);
    fireGrad.addColorStop(0, 'rgba(255,140,40,.35)');
    fireGrad.addColorStop(.6, 'rgba(232,93,158,.15)');
    fireGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, W, H);

    // Flame
    ctx.font = '320px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('🔥', W/2, H/2 + 60);

    // Days
    ctx.fillStyle = '#e8874a';
    ctx.font = '900 240px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(toFa(days), W/2, H/2 + 320);

    // Label
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.font = '800 48px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('روز پیوسته مطالعه', W/2, H/2 + 400);

    // Subtitle
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.font = '600 28px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('من از پسش برمیام 💪', W/2, H/2 + 460);

    // Top badge
    ctx.fillStyle = 'rgba(255,255,255,.1)';
    roundRect(ctx, W/2 - 150, 100, 300, 70, 35);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 28px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('🔥 پیرامید', W/2, 145);

    return canvas;
  }

  /* ==================== Template ۳: XP Level ==================== */
  function makeXPLevelCard(level, xp){
    const W = 1080, H = 1080;
    const { canvas, ctx } = getCanvas(W, H);
    const colors = getGradientColors();

    // BG
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#1a1528');
    grad.addColorStop(1, '#2b1a26');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Glow
    const glow = ctx.createRadialGradient(W/2, 400, 0, W/2, 400, 500);
    glow.addColorStop(0, colors.primary + 'aa');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Crown/Medal
    ctx.font = '240px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('🎖', W/2, 420);

    // Level
    ctx.fillStyle = '#fff';
    ctx.font = '900 200px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(toFa(level), W/2, 650);

    ctx.fillStyle = colors.primary;
    ctx.font = '800 42px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('سطح', W/2, 720);

    // XP info
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.font = '600 32px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(toFa(xp) + ' XP در مجموع', W/2, 790);

    // Progress bar
    const barW = 700;
    const barX = (W - barW) / 2;
    const barY = 850;
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    roundRect(ctx, barX, barY, barW, 30, 15);
    ctx.fill();
    ctx.fillStyle = colors.primary;
    const fillW = barW * 0.65;
    roundRect(ctx, barX, barY, fillW, 30, 15);
    ctx.fill();

    // Bottom
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.font = '700 24px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('🌟 پیرامید  •  کنار تو تا کنکور', W/2, H - 90);

    return canvas;
  }

  /* ==================== Template ۴: Estimate ==================== */
  function makeEstimateCard(taraz, rank, major){
    const W = 1080, H = 1080;
    const { canvas, ctx } = getCanvas(W, H);
    const colors = getGradientColors();

    // BG
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(1, colors.primary);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Glow
    const glow = ctx.createRadialGradient(W/2, 500, 0, W/2, 500, 500);
    glow.addColorStop(0, 'rgba(255,255,255,.2)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Icon
    ctx.font = '180px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('🧮', W/2, 300);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = '800 42px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('تخمین کنکور ' + (major || ''), W/2, 400);

    // Taraz
    ctx.fillStyle = '#fff';
    ctx.font = '900 160px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(toFa(taraz), W/2, 600);

    ctx.font = '600 36px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText('تراز تخمینی', W/2, 660);

    // Rank badge
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    roundRect(ctx, W/2 - 220, 720, 440, 130, 40);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '800 44px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('رتبه ~ ' + toFa(rank), W/2, 805);

    // Bottom
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.font = '700 26px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('با پیرامید مسیرت رو بسنج', W/2, H - 100);

    return canvas;
  }

  /* ==================== Template ۵: Generic ==================== */
  function makeCustomCard(opts){
    const W = 1080, H = 1080;
    const { canvas, ctx } = getCanvas(W, H);
    const colors = getGradientColors();

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, colors.primary);
    grad.addColorStop(1, colors.g3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // BG decoration
    ctx.fillStyle = 'rgba(255,255,255,.1)';
    for(let i = 0; i < 20; i++){
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 60 + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    let y = 300;

    if(opts.emoji){
      ctx.font = '200px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(opts.emoji, W/2, y);
      y += 180;
    }

    if(opts.title){
      ctx.fillStyle = '#fff';
      ctx.font = '900 72px Vazirmatn, Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.title, W/2, y);
      y += 100;
    }

    if(opts.lines){
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = '600 36px Vazirmatn, Tahoma, sans-serif';
      opts.lines.forEach(line => {
        ctx.fillText(line, W/2, y);
        y += 60;
      });
    }

    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.font = '700 26px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('💜 پیرامید', W/2, H - 100);

    return canvas;
  }

  /* ==================== Download ==================== */
  function downloadCanvas(canvas, filename){
    canvas.toBlob(blob => {
      if(!blob){
        if(window.showToast) window.showToast('خطا در ساخت تصویر', 'error');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `piramid-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      if(window.showToast) window.showToast('📸 کارت دانلود شد', 'success');
      if(window.PiramidSound) window.PiramidSound.success();
    }, 'image/png');
  }

  /* ==================== API ==================== */
  const Share = {
    achievement(title, desc, emoji){
      const canvas = makeAchievementCard(title, desc || 'دستاورد جدید', emoji || '🏆');
      downloadCanvas(canvas, `piramid-achievement-${Date.now()}.png`);
    },
    streak(days){
      const canvas = makeStreakCard(days || 1);
      downloadCanvas(canvas, `piramid-streak-${days}d-${Date.now()}.png`);
    },
    xpLevel(level, xp){
      const canvas = makeXPLevelCard(level || 1, xp || 0);
      downloadCanvas(canvas, `piramid-level-${level}-${Date.now()}.png`);
    },
    estimate(taraz, rank, major){
      const canvas = makeEstimateCard(taraz || 0, rank || 0, major || '');
      downloadCanvas(canvas, `piramid-estimate-${Date.now()}.png`);
    },
    custom(opts){
      const canvas = makeCustomCard(opts || {});
      downloadCanvas(canvas, `piramid-${Date.now()}.png`);
    },
    // نمایش پیش‌نمایش قبل از دانلود
    preview(canvas, filename){
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:99999;
        background:rgba(0,0,0,.85); backdrop-filter:blur(10px);
        display:flex; align-items:center; justify-content:center;
        padding:20px; opacity:0; visibility:hidden;
        transition:.3s;
      `;

      const inner = document.createElement('div');
      inner.style.cssText = `
        max-width:min(90vw, 500px); max-height:90vh;
        display:flex; flex-direction:column; gap:16px;
        align-items:center;
      `;

      canvas.style.cssText = `
        max-width:100%; max-height:70vh;
        border-radius:20px; box-shadow:0 30px 80px rgba(0,0,0,.5);
      `;

      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex; gap:10px;';

      const dlBtn = document.createElement('button');
      dlBtn.textContent = '📥 دانلود';
      dlBtn.style.cssText = `
        padding:12px 28px; border-radius:999px; border:none;
        background:linear-gradient(135deg, #e85d9e, #c78ae8);
        color:#fff; font-family:inherit; font-size:.9em; font-weight:800;
        cursor:pointer; box-shadow:0 12px 30px rgba(232,93,158,.4);
      `;
      dlBtn.addEventListener('click', () => {
        downloadCanvas(canvas, filename);
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        setTimeout(() => overlay.remove(), 300);
      });

      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'بستن';
      closeBtn.style.cssText = `
        padding:12px 28px; border-radius:999px; border:1px solid rgba(255,255,255,.3);
        background:transparent; color:#fff; font-family:inherit; font-size:.9em; font-weight:700;
        cursor:pointer;
      `;
      closeBtn.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        setTimeout(() => overlay.remove(), 300);
      });

      btns.appendChild(dlBtn);
      btns.appendChild(closeBtn);
      inner.appendChild(canvas);
      inner.appendChild(btns);
      overlay.appendChild(inner);
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
      });
    }
  };

  window.PiramidShare = Share;

  console.log('%c🎨 Share cards ready', 'color:#e85d9e;font-weight:700;');
})();