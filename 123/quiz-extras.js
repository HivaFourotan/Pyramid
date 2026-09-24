'use strict';

(function(){

if(window.PiramidQuizExtras) return;

function toFa(n){ return String(n).split('').map(function(c){ return '۰۱۲۳۴۵۶۷۸۹'[+c] || c; }).join(''); }
function esc(s){ var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; }

function shuffle(a){
  a = a.slice();
  for(var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function qs(sel, ctx){ return (ctx || document).querySelector(sel); }

var QUICK_KEY = 'piramid_quick_quiz';

/* ==================== Quick Quiz ==================== */
function quickQuiz(){
  var all = window.PiramidQuizzes.all();
  if(all.length === 0){
    window.showToast && window.showToast('اول یه آزمون بساز', 'error');
    return;
  }

  var allQ = [];
  all.forEach(function(quiz){
    if(quiz._quick || quiz._wrong) return;
    quiz.questions.forEach(function(q){
      allQ.push({
        id: q.id,
        text: q.text,
        options: q.options.slice(),
        correct: q.correct,
        explain: q.explain || ''
      });
    });
  });

  if(allQ.length < 3){
    window.showToast && window.showToast('حداقل ۳ سوال لازمه', 'error');
    return;
  }

  var picked = shuffle(allQ).slice(0, Math.min(15, allQ.length));
  var quizId = 'quick_' + Date.now().toString(36);

  var quickQuizData = {
    id: quizId,
    title: '⚡ آزمون سریع',
    subject: 'general',
    description: toFa(picked.length) + ' سوال تصادفی',
    questions: picked,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    _quick: true
  };

  try{
    var existing = window.PiramidQuizzes.all();
    existing = existing.filter(function(q){ return !q._quick; });
    existing.unshift(quickQuizData);
    localStorage.setItem('piramid_quizzes', JSON.stringify(existing));
  }catch(e){ console.warn(e); }

  location.href = 'quiz-take.html?id=' + quizId;
}
/* ==================== Practice Wrong ==================== */
function practiceWrong(){
  var list;
  try{ list = JSON.parse(localStorage.getItem(WRONG_KEY) || '[]'); }catch(e){ list = []; }

  if(list.length === 0){
    window.showToast && window.showToast('🎉 سوال اشتباهی نداری!', 'success');
    return;
  }

  var picked = shuffle(list).slice(0, Math.min(15, list.length));
  var quizId = 'wrong_' + Date.now().toString(36);

  var wrongQuizData = {
    id: quizId,
    title: '💡 تمرین اشتباهات',
    subject: 'general',
    description: toFa(picked.length) + ' سوال',
    questions: picked.map(function(x){
      return { id: x.qid, text: x.text, options: x.options, correct: x.correct, explain: x.explain };
    }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    _wrong: true
  };

  try{
    var existing = window.PiramidQuizzes.all();
    existing = existing.filter(function(q){ return !q._wrong; });
    existing.unshift(wrongQuizData);
    localStorage.setItem('piramid_quizzes', JSON.stringify(existing));
  }catch(e){ console.warn(e); }

  location.href = 'quiz-take.html?id=' + quizId;
}
/* ==================== Export/Import ==================== */
function exportAll(){
  var data = {
    _meta: { app: 'Piramid', type: 'quizzes', version: 1, exportedAt: new Date().toISOString() },
    quizzes: window.PiramidQuizzes.all()
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'piramid-quizzes-' + Date.now() + '.json';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  window.showToast && window.showToast('📤 فایل دانلود شد', 'success');
}

function importFile(file){
  if(!file) return;
  var r = new FileReader();
  r.onload = function(e){
    try{
      var data = JSON.parse(e.target.result);
      if(!data.quizzes || !Array.isArray(data.quizzes)) throw new Error('bad');

      var existing = window.PiramidQuizzes.all();
      var added = 0;
      data.quizzes.forEach(function(q){
        if(!q.id || !q.title) return;
        var dup = existing.some(function(x){ return x.id === q.id; });
        if(dup){
          q.id = q.id + '_' + Date.now().toString(36);
        }
        existing.unshift(q);
        added++;
      });
      try{
        localStorage.setItem('piramid_quizzes', JSON.stringify(existing));
      }catch(err){}
      window.showToast && window.showToast('✅ ' + toFa(added) + ' آزمون اضافه شد', 'success');
      setTimeout(function(){ location.reload(); }, 800);
    }catch(err){
      window.showToast && window.showToast('❌ فایل معتبر نیست', 'error');
    }
  };
  r.readAsText(file);
}

/* ==================== Progress Chart ==================== */
function showProgress(){
  var hist = window.PiramidQuizzes.history().slice(-10);
  if(hist.length === 0){
    window.showToast && window.showToast('هنوز آزمونی نداده‌ای', 'info');
    return;
  }

  var modal = document.getElementById('qzModal');
  if(!modal) return;

  var bars = hist.map(function(h, i){
    var pct = h.percent;
    var color = pct >= 80 ? 'linear-gradient(180deg,#22c55e,#16a34a)' :
                pct >= 60 ? 'linear-gradient(180deg,#e8874a,#d97706)' :
                'linear-gradient(180deg,#df6680,#c83f7f)';
    return '<div class="qxp-bar-wrap">' +
      '<div class="qxp-pct">' + toFa(pct) + '٪</div>' +
      '<div class="qxp-bar" style="height:' + Math.max(6, pct) + '%;background:' + color + '"></div>' +
      '<div class="qxp-label">' + new Date(h.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) + '</div>' +
    '</div>';
  }).join('');

  var avg = Math.round(hist.reduce(function(s, h){ return s + h.percent; }, 0) / hist.length);
  var best = Math.max.apply(null, hist.map(function(h){ return h.percent; }));

  document.getElementById('qzModalTitle').textContent = '📊 روند پیشرفت';
  document.getElementById('qzModalBody').innerHTML =
    '<div style="margin-bottom:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">' +
      '<div style="padding:12px;border-radius:12px;background:var(--soft);text-align:center">' +
        '<b style="display:block;font-size:1.4em;font-weight:900;color:var(--primary-dark);line-height:1;margin-bottom:4px">' + toFa(hist.length) + '</b>' +
        '<span style="font-size:.72em;color:var(--muted);font-weight:700">آزمون</span>' +
      '</div>' +
      '<div style="padding:12px;border-radius:12px;background:var(--soft);text-align:center">' +
        '<b style="display:block;font-size:1.4em;font-weight:900;color:#22c55e;line-height:1;margin-bottom:4px">' + toFa(avg) + '٪</b>' +
        '<span style="font-size:.72em;color:var(--muted);font-weight:700">میانگین</span>' +
      '</div>' +
      '<div style="padding:12px;border-radius:12px;background:var(--soft);text-align:center">' +
        '<b style="display:block;font-size:1.4em;font-weight:900;color:#e5b548;line-height:1;margin-bottom:4px">' + toFa(best) + '٪</b>' +
        '<span style="font-size:.72em;color:var(--muted);font-weight:700">بهترین</span>' +
      '</div>' +
    '</div>' +
    '<div class="qxp-chart">' + bars + '</div>' +
    '<button class="btn" id="qxpClear" type="button" style="width:100%;margin-top:16px;background:rgba(223,102,128,.12);color:#a12a48;border:1px solid rgba(223,102,128,.3)">🗑 پاک کردن تاریخچه</button>';

  modal.classList.add('open');

  var clr = document.getElementById('qxpClear');
  if(clr) clr.addEventListener('click', function(){
    if(!confirm('همه‌ی تاریخچه پاک بشه؟')) return;
    window.PiramidQuizzes.clearHistory();
    modal.classList.remove('open');
    window.showToast && window.showToast('پاک شد', 'info');
    setTimeout(function(){ location.reload(); }, 500);
  });
}

/* ==================== Show Quick Quiz Button ==================== */
function buildExtraButtons(){
  var head = document.querySelector('.qz-head');
  if(!head) return;
  if(document.getElementById('qzExtraRow')) return;

  var row = document.createElement('div');
  row.id = 'qzExtraRow';
  row.className = 'qz-extra-row';
  row.innerHTML =
    '<button class="qz-extra-btn" id="qeQuick" type="button">' +
      '<span class="qz-extra-icon">⚡</span>' +
      '<span class="qz-extra-label">آزمون سریع</span>' +
    '</button>' +
    '<button class="qz-extra-btn" id="qeWrong" type="button">' +
      '<span class="qz-extra-icon">💡</span>' +
      '<span class="qz-extra-label">تمرین اشتباهات</span>' +
    '</button>' +
    '<button class="qz-extra-btn" id="qeProgress" type="button">' +
      '<span class="qz-extra-icon">📊</span>' +
      '<span class="qz-extra-label">پیشرفت</span>' +
    '</button>' +
    '<button class="qz-extra-btn" id="qeExport" type="button">' +
      '<span class="qz-extra-icon">📤</span>' +
      '<span class="qz-extra-label">Export</span>' +
    '</button>' +
    '<button class="qz-extra-btn" id="qeImport" type="button">' +
      '<span class="qz-extra-icon">📥</span>' +
      '<span class="qz-extra-label">Import</span>' +
    '</button>';

  head.parentNode.insertBefore(row, head.nextSibling);

  document.getElementById('qeQuick').addEventListener('click', quickQuiz);
  document.getElementById('qeWrong').addEventListener('click', practiceWrong);
  document.getElementById('qeProgress').addEventListener('click', showProgress);
  document.getElementById('qeExport').addEventListener('click', exportAll);

  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  fileInput.id = 'qzImportFile';
  document.body.appendChild(fileInput);

  document.getElementById('qeImport').addEventListener('click', function(){
    fileInput.click();
  });
  fileInput.addEventListener('change', function(e){
    importFile(e.target.files[0]);
    e.target.value = '';
  });
}

/* ==================== Quick Quiz Loader ==================== */
// اگه id با quick_ یا wrong_ شروع بشه، از LS خونده می‌شه
function loadQuickIfNeeded(){
  if(!document.getElementById('tkWrap')) return;
  var m = new RegExp('[?&]id=([^&#]*)').exec(location.search);
  if(!m) return;
  var id = decodeURIComponent(m[1]);
  if(id.indexOf('quick_') !== 0 && id.indexOf('wrong_') !== 0) return;

  try{
    var raw = localStorage.getItem(QUICK_KEY);
    if(!raw) return;
    var q = JSON.parse(raw);
    if(q && q.id === id){
      var all = window.PiramidQuizzes.all();
      var exists = all.some(function(x){ return x.id === id; });
      if(!exists){
        all.unshift(q);
        localStorage.setItem('piramid_quizzes', JSON.stringify(all));
      }
    }
  }catch(e){}
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      buildExtraButtons();
      loadQuickIfNeeded();
    }, 200);
  });
} else {
  setTimeout(function(){
    buildExtraButtons();
    loadQuickIfNeeded();
  }, 200);
}

window.PiramidQuizExtras = {
  quick: quickQuiz,
  practiceWrong: practiceWrong,
  exportAll: exportAll,
  importFile: importFile,
  showProgress: showProgress,
  addWrong: addWrong
};

console.log('%c🚀 Quiz Extras ready', 'color:#e85d9e;font-weight:700;');

})();