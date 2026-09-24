/* ======================================================================
   PIRAMID — backup.js
   پشتیبان‌گیری، بازیابی، مدیریت داده‌ها
   ====================================================================== */
'use strict';

window.addEventListener('load', () => {
  console.log('💾 Backup: شروع...');

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');

  // فقط کلیدهای مربوط به پیرامید
  const PREFIX = 'piramid_';

  const LABELS = {
    piramid_user: 'پروفایل کاربر',
    piramid_role: 'نقش',
    piramid_theme: 'تم',
    piramid_themeMode: 'حالت نمایش',
    piramid_fontSize: 'اندازه فونت',
    piramid_blobs: 'لکه‌ها',
    piramid_particles: 'ذرات',
    piramid_fxAurora: 'شفق',
    piramid_fxCrystal: 'کریستال',
    piramid_moon: 'ماه',
    piramid_lightning: 'رعد',
    piramid_cookie: 'کوکی',
    piramid_announcements: 'اعلانات',
    piramid_customMajors: 'رشته‌های سفارشی',
    piramid_estimates: 'تخمین‌ها',
    piramid_sessions: 'جلسات مطالعه',
    piramid_daily_goal: 'هدف روزانه',
    piramid_streak: 'روز پیوسته',
    piramid_ach: 'دستاوردها',
    piramid_flashcards: 'فلش‌کارت‌ها',
    piramid_xp: 'XP',
    piramid_level: 'سطح',
    piramid_xp_log: 'تاریخچه‌ی XP',
    piramid_missions: 'مأموریت‌ها',
    piramid_last_login: 'آخرین ورود',
    piramid_rival_persona: 'شخصیت حریف',
    piramid_rival_data: 'داده‌ی حریف',
    piramid_rival_feed: 'پیام‌های حریف',
    piramid_rival_duel: 'دوئل',
    piramid_rival_last_tick: 'آخرین tick حریف',
    piramid_capsules: 'کپسول‌های زمان',
    piramid_duel_wins: 'پیروزی‌های دوئل',
    piramid_newsletter: 'خبرنامه',
    piramid_email: 'ایمیل',
    piramid_install_dismissed: 'نصب',
    piramid_ios_hint: 'راهنمای iOS',
    piramid_notif_settings: 'تنظیمات نوتیفیکیشن',
    piramid_notif_lastSent: 'آخرین نوتیفیکیشن',
    piramid_return: 'بازگشت',
    piramid_estimateCount: 'شمارنده تخمین'
  };

  /* ============ 1) جمع آوری داده‌ها ============ */
  function collectAll(){
    const data = {};
    let totalSize = 0;
    let keyCount = 0;

    for(let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);
      if(key && key.startsWith(PREFIX)){
        const value = localStorage.getItem(key);
        data[key] = value;
        totalSize += (key.length + (value?.length || 0)) * 2; // تقریبی به بایت
        keyCount++;
      }
    }

    return { data, totalSize, keyCount };
  }

  /* ============ 2) نمایش آمار ============ */
  function renderStats(){
    const box = $('#bkStats');
    if(!box) return;

    const { data, totalSize, keyCount } = collectAll();

    const stats = [
      { icon:'📊', label:'کلیدها', value: toFa(keyCount) },
      { icon:'💽', label:'حجم داده', value: formatBytes(totalSize) },
      { icon:'🧮', label:'تخمین‌ها', value: toFa(countIn('piramid_estimates')) },
      { icon:'🃏', label:'فلش‌کارت', value: toFa(countCards()) },
      { icon:'📅', label:'روز مطالعه', value: toFa(countDays()) },
      { icon:'⚡', label:'XP', value: toFa(getXP()) },
      { icon:'📮', label:'کپسول', value: toFa(countIn('piramid_capsules')) },
      { icon:'🎖', label:'دستاورد', value: toFa(countIn('piramid_ach')) }
    ];

    box.innerHTML = stats.map(s => `
      <div class="bk-stat">
        <b>${s.value}</b>
        <span>${s.icon} ${s.label}</span>
      </div>
    `).join('');
  }

  function countIn(key){
    try{
      const v = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v.length : 0;
    }catch(e){ return 0; }
  }
  function countCards(){
    try{
      const decks = JSON.parse(localStorage.getItem('piramid_flashcards') || '[]');
      return decks.reduce((sum, d) => sum + (d.cards?.length || 0), 0);
    }catch(e){ return 0; }
  }
  function countDays(){
    try{
      const s = JSON.parse(localStorage.getItem('piramid_sessions') || '{}');
      return Object.keys(s).length;
    }catch(e){ return 0; }
  }
  function getXP(){
    try{ return parseInt(localStorage.getItem('piramid_xp') || '0', 10); }catch(e){ return 0; }
  }
  function formatBytes(b){
    if(b < 1024) return toFa(b) + ' بایت';
    if(b < 1048576) return toFa((b / 1024).toFixed(1)) + ' کیلوبایت';
    return toFa((b / 1048576).toFixed(2)) + ' مگابایت';
  }

  /* ============ 3) Export ============ */
  function doExport(){
    const { data, totalSize, keyCount } = collectAll();
    const user = JSON.parse(data.piramid_user || 'null');
    const name = (user && (user.displayName || user.username)) || 'کاربر';

    const payload = {
      _meta: {
        app: 'Piramid',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        keyCount,
        totalSize,
        userName: name
      },
      data
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`;
    const filename = `piramid-backup-${stamp}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if(window.showToast) window.showToast('✅ پشتیبان دانلود شد', 'success');
  }

  /* ============ 4) CSV Export ============ */
  function doExportCSV(){
    try{
      const sessions = JSON.parse(localStorage.getItem('piramid_sessions') || '{}');
      const rows = [['تاریخ', 'دقیقه', 'جلسه']];
      Object.keys(sessions).sort().forEach(k => {
        const s = sessions[k];
        rows.push([k, s.minutes || 0, s.sessions || 0]);
      });

      const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n'); // BOM برای فارسی
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `piramid-study-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      if(window.showToast) window.showToast('📊 CSV دانلود شد', 'success');
    }catch(e){
      console.warn(e);
      if(window.showToast) window.showToast('خطا در خروجی CSV', 'error');
    }
  }

  /* ============ 5) Import ============ */
  let pendingRestore = null;

  function handleFile(file){
    if(!file) return;
    if(file.size > 15 * 1024 * 1024){
      if(window.showToast) window.showToast('حجم فایل زیاده (حداکثر ۱۵MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      try{
        const payload = JSON.parse(e.target.result);
        if(!payload.data || typeof payload.data !== 'object'){
          throw new Error('ساختار فایل نامعتبر');
        }
        // چک کلیدها
        const keys = Object.keys(payload.data);
        if(keys.length === 0){
          throw new Error('فایل خالیه');
        }
        pendingRestore = payload;
        renderPreview(payload);
      }catch(err){
        console.warn(err);
        if(window.showToast) window.showToast('❌ فایل معتبر نیست', 'error');
      }
    };
    reader.readAsText(file);
  }

  function renderPreview(payload){
    const box = $('#bkPreview');
    const info = $('#bkPreviewInfo');
    if(!box || !info) return;

    const meta = payload._meta || {};
    const data = payload.data;

    const rows = [
      ['📅 تاریخ فایل', meta.exportedAt ? new Date(meta.exportedAt).toLocaleDateString('fa-IR') : '—'],
      ['👤 کاربر', meta.userName || '—'],
      ['📊 تعداد کلید', toFa(meta.keyCount || Object.keys(data).length)],
      ['💽 حجم', meta.totalSize ? formatBytes(meta.totalSize) : '—'],
      ['🧮 تخمین', toFa(safeLen(data.piramid_estimates))],
      ['🃏 فلش‌کارت', toFa(safeCards(data.piramid_flashcards))],
      ['📅 روز مطالعه', toFa(safeKeys(data.piramid_sessions))],
      ['⚡ XP', toFa(parseInt(data.piramid_xp || '0', 10))]
    ];

    info.innerHTML = rows.map(r =>
      `<div><span>${r[0]}</span><b>${r[1]}</b></div>`
    ).join('');

    box.style.display = 'block';
    box.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  function safeLen(json){
    try{ const a = JSON.parse(json || '[]'); return Array.isArray(a) ? a.length : 0; }catch(e){ return 0; }
  }
  function safeCards(json){
    try{
      const a = JSON.parse(json || '[]');
      return Array.isArray(a) ? a.reduce((s, d) => s + (d.cards?.length || 0), 0) : 0;
    }catch(e){ return 0; }
  }
  function safeKeys(json){
    try{ const o = JSON.parse(json || '{}'); return Object.keys(o).length; }catch(e){ return 0; }
  }

  function doRestore(){
    if(!pendingRestore) return;

    const data = pendingRestore.data;
    let restored = 0;

    try{
      // حذف کلیدهای قبلی
      const toRemove = [];
      for(let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if(k && k.startsWith(PREFIX)) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));

      // بازیابی
      Object.entries(data).forEach(([k, v]) => {
        if(k.startsWith(PREFIX) && typeof v === 'string'){
          localStorage.setItem(k, v);
          restored++;
        }
      });

      if(window.showToast){
        window.showToast(`✅ ${toFa(restored)} کلید بازیابی شد`, 'success', 4000);
      }

      // رفرش بعد از ۱.۵ ثانیه
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }catch(e){
      console.warn(e);
      if(window.showToast) window.showToast('❌ خطا در بازیابی', 'error');
    }
  }

  function cancelRestore(){
    pendingRestore = null;
    const box = $('#bkPreview');
    if(box) box.style.display = 'none';
    const input = $('#bkFileInput');
    if(input) input.value = '';
  }

  /* ============ 6) Clear ============ */
  function clearStats(){
    const keys = ['piramid_sessions', 'piramid_streak', 'piramid_xp', 'piramid_level', 'piramid_xp_log', 'piramid_ach', 'piramid_missions'];
    keys.forEach(k => {
      try{ localStorage.removeItem(k); }catch(e){}
    });
    if(window.showToast) window.showToast('🧹 آمار پاک شد', 'info');
    renderStats();
  }

  function clearAll(){
    const toRemove = [];
    for(let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if(k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach(k => {
      try{ localStorage.removeItem(k); }catch(e){}
    });
    if(window.showToast) window.showToast('🗑 همه چیز پاک شد', 'info');
    setTimeout(() => window.location.reload(), 1200);
  }

  /* ============ 7) Modal ============ */
  let modalCallback = null;

  function openConfirm(title, text, cb){
    const m = $('#bkConfirmModal');
    const t = $('#bkModalTitle');
    const x = $('#bkModalText');
    if(t) t.textContent = title;
    if(x) x.textContent = text;
    modalCallback = cb;
    if(m) m.classList.add('open');
  }

  $('#bkModalYes')?.addEventListener('click', () => {
    const m = $('#bkConfirmModal');
    if(m) m.classList.remove('open');
    if(modalCallback) modalCallback();
    modalCallback = null;
  });
  $('#bkModalNo')?.addEventListener('click', () => {
    const m = $('#bkConfirmModal');
    if(m) m.classList.remove('open');
    modalCallback = null;
  });

  /* ============ 8) Bind ============ */
  $('#bkExportBtn')?.addEventListener('click', doExport);
  $('#bkExportCSV')?.addEventListener('click', doExportCSV);

  const fileInput = $('#bkFileInput');
  const dropZone = $('#bkDrop');
  const chooseBtn = $('#bkChooseBtn');

  const openFilePicker = () => fileInput?.click();
  if(dropZone) dropZone.addEventListener('click', openFilePicker);
  if(chooseBtn) chooseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openFilePicker();
  });

  fileInput?.addEventListener('change', e => {
    const f = e.target.files[0];
    handleFile(f);
  });

  if(dropZone){
    ['dragenter', 'dragover'].forEach(ev => {
      dropZone.addEventListener(ev, e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(ev => {
      dropZone.addEventListener(ev, e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      });
    });
    dropZone.addEventListener('drop', e => {
      const f = e.dataTransfer?.files?.[0];
      handleFile(f);
    });
  }

  $('#bkConfirmRestore')?.addEventListener('click', () => {
    openConfirm(
      '⚠️ بازیابی اطلاعات',
      'همه‌ی اطلاعات فعلی‌ت جایگزین می‌شن. مطمئنی؟',
      doRestore
    );
  });
  $('#bkCancelRestore')?.addEventListener('click', cancelRestore);

  $('#bkClearStats')?.addEventListener('click', () => {
    openConfirm(
      '🧹 پاک کردن آمار',
      'آمار مطالعه، XP، سطح، دستاوردها و مأموریت‌ها پاک می‌شن. بقیه‌ی اطلاعات می‌مونه. مطمئنی؟',
      clearStats
    );
  });

  $('#bkClearAll')?.addEventListener('click', () => {
    openConfirm(
      '🗑 پاک کردن همه چیز',
      '⚠️ همه‌ی اطلاعات پیرامید برای همیشه پاک می‌شه. حتماً قبلش پشتیبان بگیر. مطمئنی؟',
      clearAll
    );
  });

  /* ============ 9) شروع ============ */
  renderStats();
  console.log('%c💾 Backup ready','color:#e85d9e;font-weight:700;');
});