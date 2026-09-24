/* ======================================================================
   PIRAMID — planner.js
   برنامه‌ریز هفتگی + مقایسه با واقعیت
   ====================================================================== */
'use strict';

window.addEventListener('load', () => {
  console.log('📅 Planner: شروع...');

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

  /* ==================== دروس ==================== */
  const SUBJECTS = [
    { id:'general',  name:'عمومی',       color:'#ad9da8' },
    { id:'riazi',    name:'ریاضی',       color:'#4a90d9' },
    { id:'fizik',    name:'فیزیک',       color:'#8b5cf6' },
    { id:'shimi',    name:'شیمی',        color:'#3bb89a' },
    { id:'zist',     name:'زیست',        color:'#22c55e' },
    { id:'adabiat',  name:'ادبیات',      color:'#e8874a' },
    { id:'arabi',    name:'عربی',        color:'#c78ae8' },
    { id:'dini',     name:'دین و زندگی', color:'#e5b548' },
    { id:'zaban',    name:'زبان',        color:'#df6680' },
    { id:'tarikh',   name:'تاریخ',       color:'#d97706' },
    { id:'ejtemaei', name:'اجتماعی',     color:'#06b6d4' },
    { id:'falsafe',  name:'فلسفه',       color:'#a78bfa' },
    { id:'rest',     name:'استراحت',     color:'#6b7280' }
  ];

  function getSubject(id){
    return SUBJECTS.find(s => s.id === id) || SUBJECTS[0];
  }

  /* ==================== ذخیره‌سازی ==================== */
  const LS_KEY = 'piramid_planner';
  let tasks = getLS(LS_KEY, []);
  function save(){ setLS(LS_KEY, tasks); }

  /* ==================== وضعیت ==================== */
  const state = {
    currentWeekOffset: 0,   // 0 = این هفته
    editingTaskId: null
  };

  /* ==================== ابزار تاریخ ==================== */
  function getWeekStart(offset = 0){
    // شنبه = روز اول هفته در ایران
    const today = new Date();
    const dow = today.getDay(); // 0=Sunday, 6=Saturday
    // می‌خوایم بریم به شنبه‌ی این هفته
    const satOffset = dow === 6 ? 0 : (dow + 1); // فاصله تا شنبه‌ی قبل
    const sat = new Date(today);
    sat.setDate(today.getDate() - satOffset + offset * 7);
    sat.setHours(0, 0, 0, 0);
    return sat;
  }

  function getWeekDays(offset = 0){
    const start = getWeekStart(offset);
    const days = [];
    for(let i = 0; i < 7; i++){
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }

  function faDateShort(d){
    return d.toLocaleDateString('fa-IR', { month:'short', day:'numeric' });
  }

  function faWeekRange(start, end){
    return `${start.toLocaleDateString('fa-IR', { month:'long', day:'numeric' })} تا ${end.toLocaleDateString('fa-IR', { month:'long', day:'numeric' })}`;
  }

  const DAY_NAMES = ['شنبه','یک‌شنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه'];

  function uid(){
    return 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }

  /* ==================== رندر هفته ==================== */
  function renderWeek(){
    const box = $('#plWeek');
    if(!box) return;

    const days = getWeekDays(state.currentWeekOffset);
    const todayK = dateKey();

    // برچسب هفته
    const label = $('#plWeekLabel');
    const range = $('#plWeekRange');
    if(label){
      if(state.currentWeekOffset === 0) label.textContent = 'این هفته';
      else if(state.currentWeekOffset === -1) label.textContent = 'هفته‌ی گذشته';
      else if(state.currentWeekOffset === 1) label.textContent = 'هفته‌ی آینده';
      else if(state.currentWeekOffset < 0) label.textContent = `${toFa(Math.abs(state.currentWeekOffset))} هفته پیش`;
      else label.textContent = `${toFa(state.currentWeekOffset)} هفته بعد`;
    }
    if(range) range.textContent = faWeekRange(days[0], days[6]);

    // خلاصه
    renderSummary(days);

    // گرید
    box.innerHTML = '';
    days.forEach((day, idx) => {
      const k = dateKey(day);
      const isToday = k === todayK;

      const dayTasks = tasks
        .filter(t => t.date === k)
        .sort((a, b) => a.hour - b.hour);

      const el = document.createElement('div');
      el.className = 'pl-day' + (isToday ? ' today' : '');

      const head = document.createElement('div');
      head.className = 'pl-day-head';
      head.innerHTML = `
        <div class="pl-day-name">${DAY_NAMES[idx]}</div>
        <div class="pl-day-date">${faDateShort(day)}</div>
      `;
      el.appendChild(head);

      const body = document.createElement('div');
      body.className = 'pl-day-body';
      body.dataset.date = k;

      dayTasks.forEach(task => {
        const subj = getSubject(task.subject);
        const t = document.createElement('div');
        t.className = 'pl-task' + (task.done ? ' done' : '');
        t.style.background = `linear-gradient(135deg, ${subj.color}, ${subj.color}cc)`;
        const hh = pad2(task.hour);
        t.innerHTML = `
          <div class="pl-task-time">${toFa(hh)}:۰۰ • ${toFa(task.duration)}د</div>
          <div class="pl-task-title">${subj.name}</div>
          ${task.note ? `<div class="pl-task-note">${escapeHtml(task.note)}</div>` : ''}
        `;
        t.addEventListener('click', (e) => {
          e.stopPropagation();
          openTaskModal(task.id);
        });
        body.appendChild(t);
      });

      body.addEventListener('click', () => {
        openTaskModal(null, k, idx);
      });

      el.appendChild(body);
      box.appendChild(el);
    });
  }

  function renderSummary(days){
    const dayKeys = days.map(d => dateKey(d));

    const weekTasks = tasks.filter(t => dayKeys.includes(t.date));
    const totalPlanned = weekTasks.reduce((s, t) => s + (t.duration || 0), 0);
    const doneTasks = weekTasks.filter(t => t.done).length;

    // واقعیت
    const sessions = getLS('piramid_sessions', {}) || {};
    const actualTotal = dayKeys.reduce((s, k) => s + ((sessions[k] || {}).minutes || 0), 0);

    const rate = totalPlanned > 0 ? Math.round((actualTotal / totalPlanned) * 100) : 0;

    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = toFa(v); };
    set('plPlannedTotal', totalPlanned);
    set('plActualTotal', actualTotal);
    set('plCompletionRate', rate + '٪');
    set('plTaskCount', doneTasks);
  }

  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ==================== مودال تسک ==================== */
  const taskModal = $('#plTaskModal');
  const taskDaySel = $('#plTaskDay');
  const taskHourSel = $('#plTaskHour');
  const taskSubjectSel = $('#plTaskSubject');
  const taskDuration = $('#plTaskDuration');
  const taskNote = $('#plTaskNote');
  const taskModalTitle = $('#plTaskModalTitle');
  const taskDeleteBtn = $('#plTaskDelete');

  // پر کردن ساعت‌ها
  function initHourSelect(){
    if(!taskHourSel) return;
    taskHourSel.innerHTML = '';
    for(let h = 5; h <= 23; h++){
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = toFa(pad2(h)) + ':۰۰';
      taskHourSel.appendChild(opt);
    }
  }

  // پر کردن دروس
  function initSubjectSelect(){
    if(!taskSubjectSel) return;
    taskSubjectSel.innerHTML = '';
    SUBJECTS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      taskSubjectSel.appendChild(opt);
    });
  }

  function openTaskModal(taskId, dateKeyStr, dayIdx){
    state.editingTaskId = taskId || null;

    if(taskId){
      const t = tasks.find(x => x.id === taskId);
      if(!t) return;
      if(taskModalTitle) taskModalTitle.textContent = '✏️ ویرایش جلسه';
      if(taskDaySel) taskDaySel.value = getDayFromDate(t.date);
      if(taskHourSel) taskHourSel.value = t.hour;
      if(taskSubjectSel) taskSubjectSel.value = t.subject;
      if(taskDuration) taskDuration.value = t.duration;
      if(taskNote) taskNote.value = t.note || '';
      if(taskDeleteBtn) taskDeleteBtn.style.display = 'block';
    } else {
      if(taskModalTitle) taskModalTitle.textContent = '➕ جلسه‌ی جدید';
      if(taskDaySel) taskDaySel.value = dayIdx != null ? dayIdx : 0;
      if(taskHourSel) taskHourSel.value = 16;
      if(taskSubjectSel) taskSubjectSel.value = 'general';
      if(taskDuration) taskDuration.value = 60;
      if(taskNote) taskNote.value = '';
      if(taskDeleteBtn) taskDeleteBtn.style.display = 'none';
    }

    if(taskModal) taskModal.classList.add('open');
  }

  function getDayFromDate(dateStr){
    const d = new Date(dateStr);
    const dow = d.getDay();
    // تبدیل به ایندکس فارسی: شنبه=0
    if(dow === 6) return 0;       // شنبه
    return dow + 1;               // یک‌شنبه=1، ...، جمعه=6
  }

  function closeTaskModal(){
    if(taskModal) taskModal.classList.remove('open');
    state.editingTaskId = null;
  }

  function saveTask(){
    const dayIdx = parseInt(taskDaySel?.value || '0', 10);
    const hour = parseInt(taskHourSel?.value || '16', 10);
    const subject = taskSubjectSel?.value || 'general';
    const duration = Math.max(15, Math.min(300, parseInt(taskDuration?.value || '60', 10)));
    const note = (taskNote?.value || '').trim();

    // تاریخ روز انتخاب‌شده در هفته‌ی جاری
    const days = getWeekDays(state.currentWeekOffset);
    const dateStr = dateKey(days[dayIdx]);

    if(state.editingTaskId){
      const t = tasks.find(x => x.id === state.editingTaskId);
      if(t){
        t.date = dateStr;
        t.hour = hour;
        t.subject = subject;
        t.duration = duration;
        t.note = note;
      }
    } else {
      tasks.push({
        id: uid(),
        date: dateStr,
        hour,
        subject,
        duration,
        note,
        done: false,
        createdAt: Date.now()
      });
    }

    save();
    closeTaskModal();
    renderWeek();
    if(window.showToast) window.showToast('✅ ذخیره شد', 'success', 1500);
  }

  function deleteTask(){
    if(!state.editingTaskId) return;
    if(!confirm('این جلسه حذف بشه؟')) return;
    tasks = tasks.filter(t => t.id !== state.editingTaskId);
    save();
    closeTaskModal();
    renderWeek();
    if(window.showToast) window.showToast('🗑 حذف شد', 'info');
  }

  /* ==================== ناوبری هفته ==================== */
  $('#plPrevWeek')?.addEventListener('click', () => {
    state.currentWeekOffset--;
    renderWeek();
  });
  $('#plNextWeek')?.addEventListener('click', () => {
    state.currentWeekOffset++;
    renderWeek();
  });
  $('#plTodayBtn')?.addEventListener('click', () => {
    state.currentWeekOffset = 0;
    renderWeek();
  });

  $('#plTaskSave')?.addEventListener('click', saveTask);
  $('#plTaskDelete')?.addEventListener('click', deleteTask);

  $$('[data-close]').forEach(b => {
    b.addEventListener('click', () => {
      const m = document.getElementById(b.dataset.close);
      if(m) m.classList.remove('open');
    });
  });
  taskModal?.addEventListener('click', e => {
    if(e.target === taskModal) closeTaskModal();
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') closeTaskModal();
  });

  /* ==================== شروع ==================== */
  initHourSelect();
  initSubjectSelect();
  renderWeek();

  console.log('%c📅 Planner ready — ' + tasks.length + ' تسک', 'color:#e85d9e;font-weight:700;');
});