'use strict';

(function(){

if(window.PiramidQuizzes && window.PiramidQuizzes.__ready) return;

/* ==================== Data Layer ==================== */
var KEY = 'piramid_quizzes';
var HISTORY = 'piramid_quiz_history';

function read(){
  try{
    var raw = localStorage.getItem(KEY);
    var list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  }catch(e){ return []; }
}
function write(list){
  try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){}
}
function genId(p){
  return (p || 'q') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5);
}
function readHistory(){
  try{
    var raw = localStorage.getItem(HISTORY);
    var list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  }catch(e){ return []; }
}
function writeHistory(list){
  try{ localStorage.setItem(HISTORY, JSON.stringify(list.slice(-50))); }catch(e){}
}

var Data = {
  all: read,
  get: function(id){
    var l = read();
    for(var i = 0; i < l.length; i++) if(l[i].id === id) return l[i];
    return null;
  },
  create: function(data){
    var l = read();
    var q = {
      id: genId('quiz'),
      title: data.title || 'بدون عنوان',
      subject: data.subject || 'general',
      description: data.description || '',
      questions: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    l.unshift(q);
    write(l);
    return q;
  },
  update: function(id, data){
    var l = read();
    for(var i = 0; i < l.length; i++){
      if(l[i].id === id){
        if(data.title !== undefined) l[i].title = data.title;
        if(data.subject !== undefined) l[i].subject = data.subject;
        if(data.description !== undefined) l[i].description = data.description;
        l[i].updatedAt = Date.now();
        write(l);
        return l[i];
      }
    }
    return null;
  },
  remove: function(id){
    write(read().filter(function(q){ return q.id !== id; }));
    writeHistory(readHistory().filter(function(h){ return h.quizId !== id; }));
  },
  addQuestion: function(quizId, q){
    var l = read();
    for(var i = 0; i < l.length; i++){
      if(l[i].id === quizId){
        var item = {
          id: genId('q'),
          text: q.text || '',
          options: q.options || ['', '', '', ''],
          correct: typeof q.correct === 'number' ? q.correct : 0,
          explain: q.explain || ''
        };
        l[i].questions.push(item);
        l[i].updatedAt = Date.now();
        write(l);
        return item;
      }
    }
    return null;
  },
  updateQuestion: function(quizId, qid, data){
    var l = read();
    for(var i = 0; i < l.length; i++){
      if(l[i].id === quizId){
        for(var j = 0; j < l[i].questions.length; j++){
          if(l[i].questions[j].id === qid){
            var qq = l[i].questions[j];
            if(data.text !== undefined) qq.text = data.text;
            if(data.options !== undefined) qq.options = data.options;
            if(data.correct !== undefined) qq.correct = data.correct;
            if(data.explain !== undefined) qq.explain = data.explain;
            l[i].updatedAt = Date.now();
            write(l);
            return true;
          }
        }
      }
    }
    return false;
  },
  removeQuestion: function(quizId, qid){
    var l = read();
    for(var i = 0; i < l.length; i++){
      if(l[i].id === quizId){
        l[i].questions = l[i].questions.filter(function(q){ return q.id !== qid; });
        l[i].updatedAt = Date.now();
        write(l);
        return true;
      }
    }
    return false;
  },
  saveResult: function(r){
    var h = readHistory();
    h.push({
      id: genId('h'),
      quizId: r.quizId,
      quizTitle: r.quizTitle,
      total: r.total,
      correct: r.correct,
      wrong: r.wrong,
      skipped: r.skipped,
      percent: r.percent,
      duration: r.duration,
      date: Date.now()
    });
    writeHistory(h);
  },
  history: readHistory,
  historyFor: function(quizId){
    return readHistory().filter(function(h){ return h.quizId === quizId; });
  },
  stats: function(){
    var h = readHistory();
    if(h.length === 0) return { count: 0, avg: 0, best: 0 };
    var sum = 0, best = 0;
    for(var i = 0; i < h.length; i++){
      sum += h[i].percent;
      if(h[i].percent > best) best = h[i].percent;
    }
    return { count: h.length, avg: Math.round(sum / h.length), best: best };
  },
  clearHistory: function(){ writeHistory([]); }
};

window.PiramidQuizzes = Data;
Data.__ready = true;

/* ==================== UI Layer (فقط روی quizzes.html) ==================== */
function ui(){
  if(!document.getElementById('quizzesGrid')) return;

  var SUBJECTS = [
    { id:'general', name:'عمومی', icon:'📌' },
    { id:'riazi', name:'ریاضی', icon:'📐' },
    { id:'fizik', name:'فیزیک', icon:'⚛️' },
    { id:'shimi', name:'شیمی', icon:'🧪' },
    { id:'zist', name:'زیست', icon:'🧬' },
    { id:'adabiat', name:'ادبیات', icon:'📖' },
    { id:'arabi', name:'عربی', icon:'🌙' },
    { id:'dini', name:'دین و زندگی', icon:'🕌' },
    { id:'zaban', name:'زبان', icon:'🔤' },
    { id:'tarikh', name:'تاریخ', icon:'📜' },
    { id:'ejtemaei', name:'اجتماعی', icon:'👥' },
    { id:'falsafe', name:'فلسفه', icon:'💭' }
  ];

  function $(s){ return document.querySelector(s); }
  function $$(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function toFa(n){ return String(n).split('').map(function(c){ return '۰۱۲۳۴۵۶۷۸۹'[+c] || c; }).join(''); }
  function esc(s){ var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; }
  function getSubject(id){ for(var i = 0; i < SUBJECTS.length; i++) if(SUBJECTS[i].id === id) return SUBJECTS[i]; return SUBJECTS[0]; }
  function subjectOptions(sel){
    return SUBJECTS.map(function(s){
      return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + s.icon + ' ' + s.name + '</option>';
    }).join('');
  }

  function renderStats(){
    var box = $('#statsBox'); if(!box) return;
    var s = Data.stats();
    box.innerHTML =
      '<div class="qz-stat"><b>' + toFa(s.count) + '</b><span>آزمون داده‌شده</span></div>' +
      '<div class="qz-stat"><b>' + toFa(s.avg) + '٪</b><span>میانگین</span></div>' +
      '<div class="qz-stat"><b>' + toFa(s.best) + '٪</b><span>بهترین</span></div>';
  }

  function renderList(){
    var grid = $('#quizzesGrid'); var empty = $('#emptyBox');
    if(!grid) return;
    var list = Data.all();
    if(list.length === 0){ grid.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    grid.innerHTML = '';

    list.forEach(function(q){
      var s = getSubject(q.subject);
      var hist = Data.historyFor(q.id);
      var lastScore = hist.length > 0 ? hist[hist.length - 1].percent : null;
      var qCount = q.questions.length;

      var el = document.createElement('div');
      el.className = 'qz-card';
      el.innerHTML =
        '<div class="qz-card-top">' +
          '<div class="qz-card-icon">' + s.icon + '</div>' +
          '<button class="qz-card-menu" type="button" data-menu="' + q.id + '">⋯</button>' +
        '</div>' +
        '<div>' +
          '<div class="qz-card-title">' + esc(q.title) + '</div>' +
          '<div class="qz-card-meta">' +
            '<span class="qz-card-badge">' + toFa(qCount) + ' سوال</span>' +
            (lastScore !== null ? '<span>آخرین: ' + toFa(lastScore) + '٪</span>' : '<span style="color:var(--faint)">آزمون نداده‌ای</span>') +
          '</div>' +
        '</div>' +
        '<div class="qz-card-actions">' +
          '<button class="qz-btn-sm start" type="button" data-start="' + q.id + '"' + (qCount === 0 ? ' disabled style="opacity:.5"' : '') + '>شروع آزمون</button>' +
          '<button class="qz-btn-sm edit" type="button" data-edit="' + q.id + '">مدیریت</button>' +
        '</div>';

      if(qCount > 0){
        el.querySelector('[data-start]').addEventListener('click', function(e){
          e.stopPropagation();
          location.href = 'quiz-take.html?id=' + q.id;
        });
      }
      el.querySelector('[data-edit]').addEventListener('click', function(e){
        e.stopPropagation();
        openManager(q.id);
      });
      el.querySelector('[data-menu]').addEventListener('click', function(e){
        e.stopPropagation();
        openMenu(q.id, e.currentTarget);
      });
      grid.appendChild(el);
    });
  }

  function openMenu(id, btn){
    $$('.qz-float-menu').forEach(function(m){ m.remove(); });
    var menu = document.createElement('div');
    menu.className = 'qz-float-menu';
    menu.style.cssText = 'position:fixed;background:var(--glass-bg);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid var(--glass-border);border-radius:14px;padding:6px;box-shadow:0 20px 50px rgba(0,0,0,.25);z-index:2200;min-width:180px';
    menu.innerHTML =
      '<button type="button" data-act="edit" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border:none;background:transparent;color:var(--text);font-family:inherit;font-size:.85em;font-weight:700;cursor:pointer;border-radius:10px;text-align:right">✏️ ویرایش</button>' +
      '<button type="button" data-act="history" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border:none;background:transparent;color:var(--text);font-family:inherit;font-size:.85em;font-weight:700;cursor:pointer;border-radius:10px;text-align:right">📊 سابقه</button>' +
      '<button type="button" data-act="delete" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border:none;background:transparent;color:#df6680;font-family:inherit;font-size:.85em;font-weight:700;cursor:pointer;border-radius:10px;text-align:right">🗑 حذف</button>';
    document.body.appendChild(menu);
    var r = btn.getBoundingClientRect();
    menu.style.top = (r.bottom + 6) + 'px';
    menu.style.left = Math.max(12, r.left - 140) + 'px';

    function close(){ menu.remove(); document.removeEventListener('click', out); }
    function out(e){ if(!menu.contains(e.target)) close(); }
    setTimeout(function(){ document.addEventListener('click', out); }, 50);

    menu.querySelectorAll('[data-act]').forEach(function(b){
      b.addEventListener('click', function(){
        var act = b.getAttribute('data-act');
        close();
        if(act === 'edit') openForm(id);
        else if(act === 'history') showHistory(id);
        else if(act === 'delete'){
          if(!confirm('این آزمون حذف بشه؟')) return;
          Data.remove(id);
          window.showToast && window.showToast('حذف شد', 'info');
          renderList(); renderStats();
        }
      });
    });
  }

  function modal(title, html){
    var m = $('#qzModal');
    $('#qzModalTitle').textContent = title;
    $('#qzModalBody').innerHTML = html;
    m.classList.add('open');
  }
  function closeModal(){ $('#qzModal').classList.remove('open'); }

  function openForm(id){
    var ex = id ? Data.get(id) : null;
    var isEdit = !!ex;
    modal(isEdit ? '✏️ ویرایش آزمون' : '📝 آزمون جدید',
      '<div class="qz-form">' +
        '<label><span>عنوان</span><input type="text" id="qfTitle" value="' + esc(ex ? ex.title : '') + '" placeholder="فصل ۱ ریاضی"></label>' +
        '<label><span>درس</span><select id="qfSubject">' + subjectOptions(ex ? ex.subject : 'general') + '</select></label>' +
        '<label><span>توضیح (اختیاری)</span><textarea id="qfDesc" rows="2">' + esc(ex ? ex.description : '') + '</textarea></label>' +
        '<button class="btn btn-solid" id="qfSave" type="button" style="width:100%">ذخیره</button>' +
      '</div>');

    $('#qfSave').addEventListener('click', function(){
      var t = $('#qfTitle').value.trim();
      if(!t){ window.showToast && window.showToast('عنوان الزامی است', 'error'); return; }
      var data = { title: t, subject: $('#qfSubject').value, description: $('#qfDesc').value.trim() };
      if(isEdit){
        Data.update(id, data);
        closeModal();
        window.showToast && window.showToast('✅ ذخیره شد', 'success');
        renderList();
      } else {
        var q = Data.create(data);
        closeModal();
        window.showToast && window.showToast('✅ ساخته شد', 'success');
        renderList();
        setTimeout(function(){ openManager(q.id); }, 300);
      }
    });
  }

  function openManager(id){
    var quiz = Data.get(id);
    if(!quiz) return;

    function draw(){
      quiz = Data.get(id);
      var qh = quiz.questions.length === 0
        ? '<p style="text-align:center;padding:24px;color:var(--muted);font-size:.88em">هنوز سوالی نداری</p>'
        : '<div class="qz-q-list">' + quiz.questions.map(function(q, i){
            return '<div class="qz-q-item">' +
              '<div class="qz-q-item-head"><b>' + toFa(i+1) + '. ' + esc(q.text) + '</b></div>' +
              '<div class="qz-q-item-opts">' + q.options.map(function(o, oi){
                return '<div class="' + (oi === q.correct ? 'correct' : '') + '">' + (oi === q.correct ? '✅ ' : '• ') + esc(o) + '</div>';
              }).join('') + '</div>' +
              '<div class="qz-q-actions">' +
                '<button class="qz-btn-sm edit" type="button" data-eq="' + q.id + '">✏️</button>' +
                '<button class="qz-btn-sm" type="button" data-dq="' + q.id + '" style="background:rgba(223,102,128,.12);color:#a12a48">🗑</button>' +
              '</div></div>';
            }).join('') + '</div>';

      modal('📝 ' + quiz.title,
        '<div style="margin-bottom:14px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">' +
          '<span style="font-size:.85em;color:var(--muted);font-weight:700">' + toFa(quiz.questions.length) + ' سوال</span>' +
          '<div style="display:flex;gap:6px">' +
            '<button class="qz-btn-sm edit" type="button" id="qmAdd" style="padding:8px 14px">➕ سوال جدید</button>' +
            '<button class="qz-btn-sm edit" type="button" id="qmEdit" style="padding:8px 14px">✏️ ویرایش</button>' +
          '</div>' +
        '</div>' + qh);

      var a = $('#qmAdd'); if(a) a.addEventListener('click', function(){ openQuestion(id, null); });
      var e = $('#qmEdit'); if(e) e.addEventListener('click', function(){ openForm(id); });
      $$('[data-eq]').forEach(function(b){ b.addEventListener('click', function(){ openQuestion(id, b.getAttribute('data-eq')); }); });
      $$('[data-dq]').forEach(function(b){ b.addEventListener('click', function(){
        if(!confirm('حذف بشه؟')) return;
        Data.removeQuestion(id, b.getAttribute('data-dq'));
        draw(); renderList();
      }); });
    }
    draw();
  }

  function openQuestion(quizId, qid){
    var ex = null;
    if(qid){
      var quiz = Data.get(quizId);
      if(quiz){
        for(var i = 0; i < quiz.questions.length; i++){
          if(quiz.questions[i].id === qid){ ex = quiz.questions[i]; break; }
        }
      }
    }
    var opts = ex ? ex.options : ['', '', '', ''];
    var cor = ex ? ex.correct : 0;

    modal(ex ? '✏️ ویرایش سوال' : '➕ سوال جدید',
      '<div class="qz-form">' +
        '<label><span>متن سوال</span><textarea id="qqText" rows="3">' + esc(ex ? ex.text : '') + '</textarea></label>' +
        '<label style="margin-bottom:6px"><span>گزینه‌ها (روی دایره بزن تا درست رو انتخاب کنی)</span></label>' +
        '<div class="qz-options">' +
          opts.map(function(o, i){
            return '<div class="qz-opt-row">' +
              '<input type="radio" name="qqCorrect" value="' + i + '"' + (i === cor ? ' checked' : '') + '>' +
              '<input type="text" id="qqOpt' + i + '" value="' + esc(o) + '" placeholder="گزینه ' + toFa(i+1) + '">' +
            '</div>';
          }).join('') +
        '</div>' +
        '<label><span>توضیح (اختیاری)</span><textarea id="qqExplain" rows="2">' + esc(ex ? ex.explain : '') + '</textarea></label>' +
        '<button class="btn btn-solid" id="qqSave" type="button" style="width:100%">ذخیره</button>' +
      '</div>');

    $('#qqSave').addEventListener('click', function(){
      var t = $('#qqText').value.trim();
      if(!t){ window.showToast && window.showToast('متن سوال الزامی است', 'error'); return; }
      var o2 = [0,1,2,3].map(function(i){ return document.getElementById('qqOpt' + i).value.trim(); });
      if(o2.some(function(o){ return !o; })){ window.showToast && window.showToast('همه گزینه‌ها را پر کن', 'error'); return; }
      var cIdx = parseInt(document.querySelector('input[name="qqCorrect"]:checked').value, 10);
      var expl = $('#qqExplain').value.trim();
      if(ex){
        Data.updateQuestion(quizId, qid, { text:t, options:o2, correct:cIdx, explain:expl });
        window.showToast && window.showToast('✅ ویرایش شد', 'success');
      } else {
        Data.addQuestion(quizId, { text:t, options:o2, correct:cIdx, explain:expl });
        window.showToast && window.showToast('✅ اضافه شد', 'success');
      }
      renderList();
      setTimeout(function(){ openManager(quizId); }, 300);
    });
  }

  function showHistory(id){
    var quiz = Data.get(id);
    var hist = Data.historyFor(id).slice().reverse();
    var html = hist.length === 0
      ? '<p style="text-align:center;padding:30px;color:var(--muted)">هنوز آزمونی نداده‌ای</p>'
      : '<div style="display:flex;flex-direction:column;gap:8px">' + hist.map(function(h){
          var color = h.percent >= 80 ? '#22c55e' : h.percent >= 60 ? '#e8874a' : '#df6680';
          return '<div style="padding:12px;border-radius:12px;background:var(--soft);display:flex;justify-content:space-between;align-items:center;gap:10px">' +
            '<div><b style="font-size:.88em;color:var(--text)">' + toFa(h.correct) + ' از ' + toFa(h.total) + '</b>' +
            '<div style="font-size:.72em;color:var(--muted);margin-top:3px">' + new Date(h.date).toLocaleDateString('fa-IR') + '</div></div>' +
            '<b style="font-size:1.2em;color:' + color + '">' + toFa(h.percent) + '٪</b></div>';
        }).join('') + '</div>';
    modal('📊 سابقه ' + quiz.title, html);
  }

  renderStats();
  renderList();

  var b1 = $('#createQuizBtn'); if(b1) b1.addEventListener('click', function(){ openForm(null); });
  var b2 = $('#createQuizBtn2'); if(b2) b2.addEventListener('click', function(){ openForm(null); });
  var c = $('#qzModalClose'); if(c) c.addEventListener('click', closeModal);
  var m = $('#qzModal'); if(m) m.addEventListener('click', function(e){ if(e.target.id === 'qzModal') closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(ui, 100); });
} else {
  setTimeout(ui, 100);
}

console.log('%c📝 Quizzes ready', 'color:#e85d9e;font-weight:700;');

})();