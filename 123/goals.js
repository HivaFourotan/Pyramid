/* ======================================================================
   PIRAMID — goals.js
   هدف‌گذاری سالانه + نمایش دائمی در داشبورد
   ====================================================================== */
'use strict';

(function(){
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

  const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

  /* ==================== ابزار ==================== */
  function getGoals(){
    return getLS('piramid_yearly_goals', null);
  }

  function saveGoals(g){
    setLS('piramid_yearly_goals', g);
  }

  function hasGoals(){
    const g = getGoals();
    return !!(g && g.target);
  }

  /* ==================== مودال تنظیم هدف ==================== */
  function buildModal(){
    if($('#goals-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'goals-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="modal-card glass" style="max-width:520px;">
        <div class="modal-head" style="background:linear-gradient(135deg, var(--primary), var(--primary-g3)); color:#fff; border-bottom:none;">
          <h3 style="color:#fff;">🎯 هدفت چیه؟</h3>
        </div>
        <div class="class-form" style="padding:24px 26px 28px;">
          <p style="font-size:.9em;color:var(--muted);line-height:1.85;margin-bottom:20px;">
            این اهداف همیشه توی داشبوردت نمایش داده می‌شن تا انگیزه‌ت حفظ بشه.
          </p>

          <label>
            <span>🎓 چه رشته/دانشگاهی می‌خوای؟</span>
            <input type="text" id="goal-target" placeholder="مثلا: پزشکی تهران" style="padding:12px 16px;border-radius:14px;border:1.5px solid var(--glass-border);background:var(--glass-bg);color:var(--text);font-size:.95em;outline:none;font-family:inherit;width:100%;">
          </label>

          <label>
            <span>📅 سال هدف</span>
            <select id="goal-year" style="padding:12px 16px;border-radius:14px;border:1.5px solid var(--glass-border);background:var(--glass-bg);color:var(--text);font-size:.95em;outline:none;font-family:inherit;width:100%;">
              <option value="1405">کنکور ۱۴۰۵</option>
              <option value="1406">کنکور ۱۴۰۶</option>
              <option value="1407">کنکور ۱۴۰۷</option>
              <option value="other">دیگر</option>
            </select>
          </label>

          <label>
            <span>⏱ روزی چند ساعت می‌تونی بخونی؟</span>
            <select id="goal-hours" style="padding:12px 16px;border-radius:14px;border:1.5px solid var(--glass-border);background:var(--glass-bg);color:var(--text);font-size:.95em;outline:none;font-family:inherit;width:100%;">
              <option value="2">۲ ساعت</option>
              <option value="4" selected>۴ ساعت</option>
              <option value="6">۶ ساعت</option>
              <option value="8">۸ ساعت</option>
              <option value="10">۱۰ ساعت</option>
              <option value="12">۱۲ ساعت</option>
            </select>
          </label>

          <label>
            <span>💭 جمله‌ی انگیزشی خودت (اختیاری)</span>
            <input type="text" id="goal-motto" placeholder="مثلا: من می‌تونم!" style="padding:12px 16px;border-radius:14px;border:1.5px solid var(--glass-border);background:var(--glass-bg);color:var(--text);font-size:.95em;outline:none;font-family:inherit;width:100%;">
          </label>

          <button class="btn btn-solid" id="goal-save" type="button" style="width:100%;margin-top:8px;">
            ✅ ذخیره هدف
          </button>

          <button class="btn" id="goal-skip" type="button" style="width:100%;margin-top:8px;background:var(--soft);color:var(--text);border:1px solid var(--border);">
            بعداً
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if(e.target === modal) closeModal();
    });

    $('#goal-save')?.addEventListener('click', saveGoalFromModal);
    $('#goal-skip')?.addEventListener('click', () => {
      closeModal();
      if(window.showToast) window.showToast('مهم نیست، هر وقت خواستی از داشبورد تنظیمش کن', 'info', 3000);
    });
  }

  function openModal(){
    buildModal();
    const modal = $('#goals-modal');
    if(!modal) return;

    // پیش‌پر کردن اگه قبلاً ساخته
    const g = getGoals();
    if(g){
      const t = $('#goal-target'); if(t) t.value = g.target || '';
      const y = $('#goal-year'); if(y) y.value = g.year || '1405';
      const h = $('#goal-hours'); if(h) h.value = g.hours || '4';
      const m = $('#goal-motto'); if(m) m.value = g.motto || '';
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    const modal = $('#goals-modal');
    if(modal){
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function saveGoalFromModal(){
    const target = ($('#goal-target')?.value || '').trim();
    const year = $('#goal-year')?.value || '1405';
    const hours = parseInt($('#goal-hours')?.value || '4', 10);
    const motto = ($('#goal-motto')?.value || '').trim();

    if(!target){
      if(window.showToast) window.showToast('هدف رو وارد کن', 'error');
      return;
    }

    saveGoals({
      target, year, hours, motto,
      createdAt: Date.now()
    });

    closeModal();

    if(window.PiramidSound) window.PiramidSound.celebration();
    if(window.showToast) window.showToast('🎯 هدف ثبت شد!', 'success');

    // رندر مجدد اگه جایی هست
    renderGoalWidget();
  }

  /* ==================== ویجت هدف ==================== */
  function renderGoalWidget(){
    // اگه داشبورد داره، جا بگیر
    const dashHero = document.querySelector('.dash-hero');
    if(dashHero && !document.querySelector('.dash-goal-widget')){
      const w = document.createElement('div');
      w.className = 'dash-goal-widget';
      dashHero.appendChild(w);
    }

    const widget = document.querySelector('.dash-goal-widget');
    if(!widget) return;

    const g = getGoals();
    if(!g || !g.target){
      widget.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;padding:16px;border-radius:16px;background:linear-gradient(135deg,rgba(232,93,158,.15),rgba(199,138,232,.1));border:1px solid var(--glass-border);margin-top:18px;width:100%;">
          <span style="font-size:1.8em;">🎯</span>
          <div style="flex:1;">
            <b style="display:block;font-size:.92em;color:var(--text);margin-bottom:3px;">هدفت رو تنظیم کن</b>
            <small style="font-size:.75em;color:var(--muted);">انگیزه‌ت رو زنده نگه دار</small>
          </div>
          <button type="button" class="btn btn-solid" id="goal-set-btn" style="padding:8px 18px;font-size:.8em;">تعیین هدف</button>
        </div>
      `;
      widget.querySelector('#goal-set-btn')?.addEventListener('click', openModal);
      return;
    }

    // محاسبه‌ی پیشرفت
    const sessions = getLS('piramid_sessions', {}) || {};
    const totalMinutes = Object.values(sessions).reduce((s, d) => s + (d.minutes || 0), 0);
    const totalHours = Math.round(totalMinutes / 60);

    // تاریخ کنکور
    const year = parseInt(g.year, 10);
    let konkurDate = new Date();
    if(year === 1405) konkurDate = new Date('2026-07-03');
    else if(year === 1406) konkurDate = new Date('2027-07-03');
    else if(year === 1407) konkurDate = new Date('2028-07-03');
    else konkurDate = new Date(Date.now() + 365 * 86400000);

    const daysLeft = Math.max(0, Math.floor((konkurDate - Date.now()) / 86400000));
    const weeksLeft = Math.floor(daysLeft / 7);

    widget.innerHTML = `
      <div class="goal-widget-card" style="
        padding:18px; border-radius:18px;
        background:linear-gradient(135deg, rgba(232,93,158,.2), rgba(199,138,232,.15));
        border:1px solid var(--glass-border);
        margin-top:18px; width:100%;
        position:relative; overflow:hidden;
      ">
        <div style="position:absolute;top:-40px;left:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.25),transparent 70%);pointer-events:none;"></div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;position:relative;z-index:1;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.6em;">🎯</span>
            <div>
              <b style="display:block;font-size:1.05em;font-weight:900;color:var(--primary-dark);">${escapeHtml(g.target)}</b>
              <small style="font-size:.72em;color:var(--muted);">کنکور ${toFa(g.year)}</small>
            </div>
          </div>
          <button type="button" class="goal-edit-btn" style="background:rgba(255,255,255,.4);border:none;color:var(--text);padding:6px 12px;border-radius:999px;font-size:.72em;font-weight:700;font-family:inherit;cursor:pointer;">ویرایش</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;position:relative;z-index:1;">
          <div style="text-align:center;padding:10px 6px;border-radius:12px;background:rgba(255,255,255,.45);">
            <b style="display:block;font-size:1.15em;font-weight:900;color:var(--primary-dark);line-height:1;margin-bottom:3px;">${toFa(daysLeft)}</b>
            <span style="font-size:.68em;color:var(--muted);font-weight:700;">روز مونده</span>
          </div>
          <div style="text-align:center;padding:10px 6px;border-radius:12px;background:rgba(255,255,255,.45);">
            <b style="display:block;font-size:1.15em;font-weight:900;color:var(--primary-dark);line-height:1;margin-bottom:3px;">${toFa(totalHours)}</b>
            <span style="font-size:.68em;color:var(--muted);font-weight:700;">ساعت مطالعه</span>
          </div>
          <div style="text-align:center;padding:10px 6px;border-radius:12px;background:rgba(255,255,255,.45);">
            <b style="display:block;font-size:1.15em;font-weight:900;color:var(--primary-dark);line-height:1;margin-bottom:3px;">${toFa(g.hours)}</b>
            <span style="font-size:.68em;color:var(--muted);font-weight:700;">ساعت هدف روزانه</span>
          </div>
        </div>

        ${g.motto ? `<div style="margin-top:12px;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,.35);font-size:.85em;font-style:italic;color:var(--text);text-align:center;position:relative;z-index:1;">"${escapeHtml(g.motto)}"</div>` : ''}
      </div>
    `;

    widget.querySelector('.goal-edit-btn')?.addEventListener('click', openModal);
  }

  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ==================== Bind Toast achievement ==================== */
  // وقتی دستاورد جدید باز می‌شه، دکمه‌ی اشتراک نشون بده
  const origToast = window.showToast;
  if(origToast){
    window.showToast = function(msg, type, duration){
      const result = origToast.call(this, msg, type, duration);
      // اگه دستاورد بود، دکمه اشتراک نشون بده
      if(typeof msg === 'string' && msg.includes('🏆')){
        setTimeout(() => showShareButton(msg), 300);
      }
      return result;
    };
  }

  function showShareButton(msg){
    const toast = document.querySelector('.toast:last-child');
    if(!toast) return;
    if(toast.querySelector('.share-toast-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'share-toast-btn';
    btn.textContent = '📸';
    btn.title = 'اشتراک‌گذاری';
    btn.style.cssText = `
      background: linear-gradient(135deg, #e85d9e, #c78ae8);
      border: none; color: #fff; cursor: pointer;
      padding: 4px 10px; border-radius: 8px;
      font-size: .85em; margin-right: 4px;
      transition: .2s;
    `;
    btn.addEventListener('click', () => {
      const title = msg.replace(/[🏆✅🎉⚡🌟🔥💎🌧🎯🎖📅📊🃏🧮👑]/g, '').replace(/^[^A-Za-z\u0600-\u06FF]+/, '').trim();
      window.PiramidShare?.achievement(title || 'دستاورد جدید', 'با پیرامید به دستش آوردم', '🏆');
    });
    toast.appendChild(btn);
  }

  /* ==================== شروع ==================== */
  // اگه اولین بازه و هدف نداره، بعد از چند ثانیه مودال رو باز کن
  window.addEventListener('load', () => {
    setTimeout(() => {
      const user = getLS('piramid_user', null);
      if(user && !hasGoals()){
        const shown = getLS('piramid_goals_shown', false);
        if(!shown){
          openModal();
          setLS('piramid_goals_shown', true);
        }
      }
      renderGoalWidget();
    }, 3500);
  });

  // API
  window.PiramidGoals = {
    open: openModal,
    close: closeModal,
    get: getGoals,
    render: renderGoalWidget
  };

  console.log('%c🎯 Goals ready', 'color:#e85d9e;font-weight:700;');
})();