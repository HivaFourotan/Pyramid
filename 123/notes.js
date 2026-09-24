/* ======================================================================
   PIRAMID — notes.js
   دفترچه یادداشت هوشمند — با markdown سبک، تگ، دسته‌بندی، جستجو
   ====================================================================== */
'use strict';

window.addEventListener('load', () => {
  console.log('📓 Notes: شروع...');

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

  /* ==================== دروس ==================== */
  const SUBJECTS = [
    { id:'general',  name:'عمومی',      icon:'📌', color:'#ad9da8' },
    { id:'riazi',    name:'ریاضی',       icon:'📐', color:'#4a90d9' },
    { id:'fizik',    name:'فیزیک',       icon:'⚛️', color:'#8b5cf6' },
    { id:'shimi',    name:'شیمی',        icon:'🧪', color:'#3bb89a' },
    { id:'zist',     name:'زیست',        icon:'🧬', color:'#22c55e' },
    { id:'adabiat',  name:'ادبیات',      icon:'📖', color:'#e8874a' },
    { id:'arabi',    name:'عربی',        icon:'🌙', color:'#c78ae8' },
    { id:'dini',     name:'دین و زندگی', icon:'🕌', color:'#e5b548' },
    { id:'zaban',    name:'زبان',        icon:'🔤', color:'#df6680' },
    { id:'tarikh',   name:'تاریخ',       icon:'📜', color:'#d97706' },
    { id:'ejtemaei', name:'اجتماعی',     icon:'👥', color:'#06b6d4' },
    { id:'falsafe',  name:'فلسفه',       icon:'💭', color:'#a78bfa' },
    { id:'other',    name:'سایر',        icon:'📝', color:'#6b7280' }
  ];

  /* ==================== ذخیره‌سازی ==================== */
  const LS_KEY = 'piramid_notes';
  let notes = getLS(LS_KEY, []);

  function save(){ setLS(LS_KEY, notes); }

  /* ==================== وضعیت ==================== */
  const state = {
    editingId: null,
    filterSubject: 'all',
    searchQuery: '',
    pickedSubject: 'general',
    editingTags: [],
    isFav: false,
    autoSaveTimer: null
  };

  /* ==================== ابزار ==================== */
  function uid(){
    return 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function stripHtml(html){
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
  }

  function faDate(ts){
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);

    if(min < 1) return 'همین حالا';
    if(min < 60) return toFa(min) + ' دقیقه پیش';
    if(hr < 24) return toFa(hr) + ' ساعت پیش';
    if(day < 7) return toFa(day) + ' روز پیش';
    return d.toLocaleDateString('fa-IR');
  }

  function getSubject(id){
    return SUBJECTS.find(s => s.id === id) || SUBJECTS[0];
  }

  /* ==================== رندر فیلترها ==================== */
  function renderFilters(){
    const box = $('#ntFilters');
    if(!box) return;

    const counts = { all: notes.length };
    SUBJECTS.forEach(s => {
      counts[s.id] = notes.filter(n => n.subject === s.id).length;
    });

    box.innerHTML = '';

    // all
    const allBtn = document.createElement('button');
    allBtn.className = 'nt-filter' + (state.filterSubject === 'all' ? ' active' : '');
    allBtn.innerHTML = `<span>✨ همه</span><span class="nt-filter-count">${toFa(counts.all)}</span>`;
    allBtn.addEventListener('click', () => {
      state.filterSubject = 'all';
      renderFilters();
      renderList();
    });
    box.appendChild(allBtn);

    // starred
    const starred = notes.filter(n => n.fav).length;
    if(starred > 0){
      const starBtn = document.createElement('button');
      starBtn.className = 'nt-filter' + (state.filterSubject === 'starred' ? ' active' : '');
      starBtn.innerHTML = `<span>⭐ ستاره‌دار</span><span class="nt-filter-count">${toFa(starred)}</span>`;
      starBtn.addEventListener('click', () => {
        state.filterSubject = 'starred';
        renderFilters();
        renderList();
      });
      box.appendChild(starBtn);
    }

    // subjects
    SUBJECTS.forEach(s => {
      if(counts[s.id] === 0 && state.filterSubject !== s.id) return;
      const b = document.createElement('button');
      b.className = 'nt-filter' + (state.filterSubject === s.id ? ' active' : '');
      b.innerHTML = `<span>${s.icon} ${s.name}</span><span class="nt-filter-count">${toFa(counts[s.id])}</span>`;
      b.addEventListener('click', () => {
        state.filterSubject = s.id;
        renderFilters();
        renderList();
      });
      box.appendChild(b);
    });
  }

  /* ==================== رندر لیست ==================== */
  function renderList(){
    const box = $('#ntList');
    const empty = $('#ntEmpty');
    if(!box || !empty) return;

    let list = notes.slice();

    // فیلتر موضوع
    if(state.filterSubject === 'starred'){
      list = list.filter(n => n.fav);
    } else if(state.filterSubject !== 'all'){
      list = list.filter(n => n.subject === state.filterSubject);
    }

    // جستجو
    if(state.searchQuery){
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(n => {
        const text = stripHtml(n.content || '').toLowerCase();
        const title = (n.title || '').toLowerCase();
        const tags = (n.tags || []).join(' ').toLowerCase();
        return title.includes(q) || text.includes(q) || tags.includes(q);
      });
    }

    // مرتب‌سازی: ستاره‌دارها اول، بعد آپدیت
    list.sort((a, b) => {
      if(a.fav && !b.fav) return -1;
      if(!a.fav && b.fav) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    if(list.length === 0){
      box.innerHTML = '';
      empty.style.display = 'block';
      const title = $('#ntEmptyTitle');
      const desc = $('#ntEmptyDesc');
      if(state.searchQuery){
        if(title) title.textContent = 'چیزی پیدا نشد 🔍';
        if(desc) desc.textContent = `برای «${state.searchQuery}» یادداشتی پیدا نکردیم.`;
      } else if(state.filterSubject !== 'all' && state.filterSubject !== 'starred'){
        const s = getSubject(state.filterSubject);
        if(title) title.textContent = `یادداشتی در «${s.name}» نداری`;
        if(desc) desc.textContent = 'یه یادداشت جدید بساز و این دسته رو پر کن.';
      } else {
        if(title) title.textContent = 'هنوز یادداشتی نداری';
        if(desc) desc.textContent = 'اینجا می‌تونی نکته‌های درسی، فرمول‌ها، خلاصه‌ی فصل‌ها و هر چیزی که می‌خوای رو بنویسی.';
      }
      return;
    }

    empty.style.display = 'none';
    box.innerHTML = '';

    list.forEach((note, i) => {
      const subj = getSubject(note.subject);
      const preview = stripHtml(note.content || '').slice(0, 140);

      const card = document.createElement('div');
      card.className = 'nt-card';
      card.style.animation = `ntCardIn .4s ${i * 0.03}s both`;
      card.innerHTML = `
        <div class="nt-card-head">
          <div class="nt-card-icon" style="background:${subj.color}22;color:${subj.color};">${subj.icon}</div>
          ${note.fav ? '<span class="nt-card-fav">⭐</span>' : ''}
        </div>
        <div class="nt-card-title">${escapeHtml(note.title || 'بدون عنوان')}</div>
        <div class="nt-card-preview">${escapeHtml(preview) || '<i>خالی</i>'}</div>
        <div class="nt-card-foot">
          <span>🕐 ${faDate(note.updatedAt || note.createdAt || Date.now())}</span>
          <div class="nt-card-tags">
            ${(note.tags || []).slice(0, 2).map(t => `<span class="nt-card-tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      `;

      card.addEventListener('click', () => openEditor(note.id));
      box.appendChild(card);
    });
  }

  // اضافه کردن animation در head
  const styleAnim = document.createElement('style');
  styleAnim.textContent = `
    @keyframes ntCardIn{
      from{ opacity:0; transform:translateY(14px); }
      to{ opacity:1; transform:translateY(0); }
    }
  `;
  document.head.appendChild(styleAnim);

  /* ==================== ادیتور ==================== */
  const editor = $('#ntEditor');
  const editorTitle = $('#ntEditorTitle');
  const editorContent = $('#ntEditorContent');
  const editorFav = $('#ntEditorFav');
  const editorSaved = $('#ntEditorSaved');
  const editorStats = $('#ntEditorStats');
  const subjectPick = $('#ntSubjectPick');
  const tagsWrap = $('#ntTagsWrap');
  const tagInput = $('#ntTagInput');

  function renderSubjectPick(){
    if(!subjectPick) return;
    subjectPick.innerHTML = '';
    SUBJECTS.forEach(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nt-subject-chip' + (state.pickedSubject === s.id ? ' active' : '');
      b.style.background = state.pickedSubject === s.id ? s.color : '';
      b.innerHTML = `${s.icon} ${s.name}`;
      b.addEventListener('click', () => {
        state.pickedSubject = s.id;
        renderSubjectPick();
        triggerAutoSave();
      });
      subjectPick.appendChild(b);
    });
  }

  function renderTags(){
    if(!tagsWrap) return;
    // پاک کردن همه بجز input
    Array.from(tagsWrap.querySelectorAll('.nt-tag-chip')).forEach(el => el.remove());

    state.editingTags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'nt-tag-chip';
      chip.innerHTML = `#${escapeHtml(tag)} <button type="button">✕</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        state.editingTags = state.editingTags.filter(t => t !== tag);
        renderTags();
        triggerAutoSave();
      });
      tagsWrap.insertBefore(chip, tagInput);
    });
  }

  function openEditor(id){
    let note;
    if(id){
      note = notes.find(n => n.id === id);
      if(!note) return;
    } else {
      // یادداشت جدید
      note = {
        id: uid(),
        title: '',
        content: '',
        subject: state.filterSubject === 'all' || state.filterSubject === 'starred' ? 'general' : state.filterSubject,
        tags: [],
        fav: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      notes.unshift(note);
      save();
    }

    state.editingId = note.id;
    state.pickedSubject = note.subject || 'general';
    state.editingTags = (note.tags || []).slice();
    state.isFav = !!note.fav;

    if(editorTitle) editorTitle.value = note.title || '';
    if(editorContent) editorContent.innerHTML = note.content || '';
    if(editorFav) editorFav.classList.toggle('active', state.isFav);

    renderSubjectPick();
    renderTags();
    updateStats();
    setSavedStatus('saved');

    if(editor) editor.classList.add('open');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if(!note.title && editorTitle) editorTitle.focus();
      else if(editorContent) editorContent.focus();
    }, 250);
  }

  function closeEditor(force){
    // ذخیره فوری
    if(!force) saveCurrentNote(true);

    if(editor) editor.classList.remove('open');
    document.body.style.overflow = '';
    state.editingId = null;

    renderFilters();
    renderList();
  }

  function saveCurrentNote(silent){
    if(!state.editingId) return;
    const note = notes.find(n => n.id === state.editingId);
    if(!note) return;

    const newTitle = (editorTitle?.value || '').trim();
    const newContent = editorContent?.innerHTML || '';

    // اگه کاملاً خالی، حذف کن
    const isEmpty = !newTitle && !stripHtml(newContent).trim();

    if(isEmpty){
      notes = notes.filter(n => n.id !== state.editingId);
      save();
      if(!silent) closeEditor(true);
      return;
    }

    note.title = newTitle;
    note.content = newContent;
    note.subject = state.pickedSubject;
    note.tags = state.editingTags.slice();
    note.fav = state.isFav;
    note.updatedAt = Date.now();

    save();
    if(!silent) setSavedStatus('saved');
  }

  function setSavedStatus(status){
    if(!editorSaved) return;
    editorSaved.classList.remove('saving', 'saved');
    if(status === 'saving'){
      editorSaved.textContent = 'در حال ذخیره...';
      editorSaved.classList.add('saving');
    } else {
      editorSaved.textContent = 'ذخیره‌شده';
      editorSaved.classList.add('saved');
    }
  }

  function triggerAutoSave(){
    setSavedStatus('saving');
    if(state.autoSaveTimer) clearTimeout(state.autoSaveTimer);
    state.autoSaveTimer = setTimeout(() => {
      saveCurrentNote(true);
      setSavedStatus('saved');
    }, 700);
  }

  function updateStats(){
    if(!editorContent || !editorStats) return;
    const text = stripHtml(editorContent.innerHTML).trim();
    const chars = text.length;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    editorStats.textContent = `${toFa(chars)} کاراکتر • ${toFa(words)} کلمه`;
  }

  /* ==================== Toolbar ==================== */
  function applyFormat(cmd, value){
    if(!editorContent) return;
    editorContent.focus();

    try{
      switch(cmd){
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          break;
        case 'h2':
          document.execCommand('formatBlock', false, '<h2>');
          break;
        case 'list':
          document.execCommand('insertUnorderedList', false, null);
          break;
        case 'num':
          document.execCommand('insertOrderedList', false, null);
          break;
        case 'quote':
          document.execCommand('formatBlock', false, '<blockquote>');
          break;
        case 'color':
          // چرخه‌ی رنگ‌های مارک
          document.execCommand('hiliteColor', false, 'rgba(232,181,72,.5)');
          break;
        case 'clear':
          document.execCommand('removeFormat', false, null);
          break;
        case 'formula': {
          const f = prompt('فرمول رو بنویس (مثلا x² + y² = r²):');
          if(f){
            document.execCommand('insertHTML', false,
              `<span class="nt-formula" contenteditable="false">${escapeHtml(f)}</span>&nbsp;`);
          }
          break;
        }
      }
    }catch(e){
      console.warn('format error:', e);
    }
    triggerAutoSave();
    updateStats();
  }

  /* ==================== Confirm ==================== */
  let confirmCb = null;
  function openConfirm(title, text, cb){
    const m = $('#ntConfirmModal');
    const t = $('#ntConfirmTitle');
    const x = $('#ntConfirmText');
    if(t) t.textContent = title;
    if(x) x.textContent = text;
    confirmCb = cb;
    if(m) m.classList.add('open');
  }

  /* ==================== Bind ==================== */
  $$('.nt-tb').forEach(b => {
    b.addEventListener('click', () => {
      applyFormat(b.dataset.fmt);
    });
  });

  editorTitle?.addEventListener('input', triggerAutoSave);
  editorContent?.addEventListener('input', () => {
    triggerAutoSave();
    updateStats();
  });

  tagInput?.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ','){
      e.preventDefault();
      const v = tagInput.value.trim().replace(/^#/, '');
      if(v && !state.editingTags.includes(v)){
        state.editingTags.push(v);
        renderTags();
        triggerAutoSave();
      }
      tagInput.value = '';
    }
    // backspace روی خالی = حذف آخرین تگ
    if(e.key === 'Backspace' && !tagInput.value && state.editingTags.length > 0){
      state.editingTags.pop();
      renderTags();
      triggerAutoSave();
    }
  });

  editorFav?.addEventListener('click', () => {
    state.isFav = !state.isFav;
    editorFav.classList.toggle('active', state.isFav);
    triggerAutoSave();
  });

  $('#ntEditorSave')?.addEventListener('click', () => {
    saveCurrentNote();
    if(window.showToast) window.showToast('✅ ذخیره شد', 'success', 1500);
  });

  $('#ntEditorDelete')?.addEventListener('click', () => {
    if(!state.editingId) return;
    openConfirm('🗑 حذف یادداشت', 'مطمئنی می‌خوای این یادداشت رو حذف کنی؟', () => {
      notes = notes.filter(n => n.id !== state.editingId);
      save();
      closeEditor(true);
      if(window.showToast) window.showToast('🗑 حذف شد', 'info');
    });
  });

  $('#ntEditorClose')?.addEventListener('click', () => closeEditor());

  $('#ntConfirmYes')?.addEventListener('click', () => {
    const m = $('#ntConfirmModal');
    if(m) m.classList.remove('open');
    if(confirmCb) confirmCb();
    confirmCb = null;
  });
  $('#ntConfirmNo')?.addEventListener('click', () => {
    const m = $('#ntConfirmModal');
    if(m) m.classList.remove('open');
    confirmCb = null;
  });

  $('#ntNewNote')?.addEventListener('click', () => openEditor(null));
  $('#ntEmptyNewBtn')?.addEventListener('click', () => openEditor(null));

  $('#ntSearch')?.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    const clear = $('#ntClearSearch');
    if(clear) clear.style.display = state.searchQuery ? 'flex' : 'none';
    renderList();
  });
  $('#ntClearSearch')?.addEventListener('click', () => {
    state.searchQuery = '';
    const s = $('#ntSearch');
    if(s) s.value = '';
    const c = $('#ntClearSearch');
    if(c) c.style.display = 'none';
    renderList();
  });

  // Ctrl+S داخل ادیتور
  document.addEventListener('keydown', e => {
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){
      if(state.editingId){
        e.preventDefault();
        saveCurrentNote();
        if(window.showToast) window.showToast('✅ ذخیره شد', 'success', 1200);
      }
    }
    if(e.key === 'Escape' && state.editingId){
      closeEditor();
    }
  });

  // بستن مودال تأیید با Escape
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      $('#ntConfirmModal')?.classList.remove('open');
    }
  });

  // Paste کردن، پاک‌سازی HTML
  editorContent?.addEventListener('paste', e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  });

  /* ==================== شروع ==================== */
  renderFilters();
  renderList();

  console.log('%c📓 Notes ready — ' + notes.length + ' یادداشت', 'color:#e85d9e;font-weight:700;');
});