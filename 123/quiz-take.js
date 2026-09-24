'use strict';

(function(){

var wrap = document.getElementById('tkWrap');
if(!wrap || !window.PiramidQuizzes) return;

/* ==================== Helpers ==================== */
function toFa(n){ return String(n).split('').map(function(c){ return '۰۱۲۳۴۵۶۷۸۹'[+c] || c; }).join(''); }
function esc(s){ var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; }

function shuffle(arr){
  var a = arr.slice();
  for(var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function getQuery(name){
  var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
  return m ? decodeURIComponent(m[1]) : null;
}

/* ==================== State ==================== */
var quizId = getQuery('id');
var quiz = quizId ? window.PiramidQuizzes.get(quizId) : null;

if(!quiz){
  wrap.innerHTML =
    '<div class="tk-empty glass">' +
      '<div class="tk-empty-icon">🔍</div>' +
      '<h3>آزمون پیدا نشد</h3>' +
      '<p>لینک اشتباهه یا آزمون پاک شده.</p>' +
      '<a href="quizzes.html" class="btn btn-solid">بازگشت به لیست</a>' +
    '</div>';
  return;
}

if(!quiz.questions || quiz.questions.length === 0){
  wrap.innerHTML =
    '<div class="tk-empty glass">' +
      '<div class="tk-empty-icon">📭</div>' +
      '<h3>این آزمون سوالی نداره</h3>' +
      '<p>اول از پنل مدیریت آزمون، سوال اضافه کن.</p>' +
      '<a href="quizzes.html" class="btn btn-solid">بازگشت</a>' +
    '</div>';
  return;
}

var LETTERS = ['الف','ب','ج','د'];

var state = {
  questions: shuffle(quiz.questions.map(function(q){
    // شافل گزینه‌ها + آپدیت ایندکس درست
    var opts = q.options.map(function(o, i){ return { text: o, was: i }; });
    opts = shuffle(opts);
    var newCorrect = 0;
    for(var i = 0; i < opts.length; i++){
      if(opts[i].was === q.correct){ newCorrect = i; break; }
    }
    return {
      id: q.id,
      text: q.text,
      options: opts.map(function(o){ return o.text; }),
      correct: newCorrect,
      explain: q.explain || ''
    };
  })),
  current: 0,
  answers: [],
  startTime: Date.now(),
  timer: null,
  timeLimit: quiz.questions.length * 90, // ۹۰ ثانیه برای هر سوال
  timeLeft: 0,
  finished: false
};

state.timeLeft = state.timeLimit;
state.answers = new Array(state.questions.length).fill(null);

/* ==================== Screen 1: Header + Progress ==================== */
function renderHeader(){
  return '' +
    '<div class="tk-head glass">' +
      '<a href="quizzes.html" class="tk-back" aria-label="بازگشت">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg>' +
      '</a>' +
      '<div class="tk-head-info">' +
        '<div class="tk-title">' + esc(quiz.title) + '</div>' +
        '<div class="tk-sub">' + toFa(quiz.questions.length) + ' سوال • ' + toFa(state.answers.filter(function(a){ return a !== null; }).length) + ' پاسخ داده‌شده</div>' +
      '</div>' +
      '<div class="tk-timer" id="tkTimer">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
        '<span id="tkTimeText">--:--</span>' +
      '</div>' +
    '</div>' +
    '<div class="tk-progress-card glass">' +
      '<div class="tk-progress-head">' +
        '<span>سوال ' + toFa(state.current + 1) + ' از ' + toFa(state.questions.length) + '</span>' +
        '<b id="tkProgPct">' + toFa(Math.round(((state.current) / state.questions.length) * 100)) + '٪</b>' +
      '</div>' +
      '<div class="tk-bar"><div class="tk-bar-fill" id="tkBarFill" style="width:' + ((state.current / state.questions.length) * 100) + '%"></div></div>' +
    '</div>';
}

/* ==================== Screen 2: Question ==================== */
function renderQuestion(){
  var q = state.questions[state.current];
  var selected = state.answers[state.current];

  var opts = q.options.map(function(o, i){
    var cls = selected === i ? 'tk-opt selected' : 'tk-opt';
    return '<button type="button" class="' + cls + '" data-opt="' + i + '">' +
      '<span class="tk-opt-letter">' + LETTERS[i] + '</span>' +
      '<span class="tk-opt-text">' + esc(o) + '</span>' +
    '</button>';
  }).join('');

  var isLast = state.current === state.questions.length - 1;
  var btnText = isLast ? 'پایان و دیدن نتیجه' : 'سوال بعدی';

  return '' +
    '<div class="tk-q glass">' +
      '<span class="tk-q-num">سوال ' + toFa(state.current + 1) + '</span>' +
      '<div class="tk-q-text">' + esc(q.text) + '</div>' +
      '<div class="tk-opts" id="tkOpts">' + opts + '</div>' +
    '</div>' +
    '<div class="tk-actions">' +
      '<button class="tk-btn ghost" id="tkPrev" type="button"' + (state.current === 0 ? ' disabled style="opacity:.4;cursor:not-allowed"' : '') + '>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg>' +
      '</button>' +
      '<button class="tk-btn primary" id="tkNext" type="button"' + (selected === null ? ' disabled' : '') + '>' +
        btnText +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="transform:scaleX(-1)"><path d="M15 18l-6-6 6-6"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="tk-skip-info">' + (selected === null ? 'یه گزینه انتخاب کن' : 'گزینه ' + toFa(selected + 1) + ' انتخاب شده') + '</div>';
}

/* ==================== Screen 3: Result ==================== */
function renderResult(){
  var correct = 0, wrong = 0, skipped = 0;
  state.questions.forEach(function(q, i){
    if(state.answers[i] === null) skipped++;
    else if(state.answers[i] === q.correct) correct++;
    else wrong++;
  });
  var total = state.questions.length;
  var percent = Math.round((correct / total) * 100);
  var durationSec = Math.round((Date.now() - state.startTime) / 1000);
  var durationMin = Math.floor(durationSec / 60);

  var emoji = '🌱', title = 'نگران نباش، با تمرین بهتر می‌شی';
  if(percent >= 80){ emoji = '🏆'; title = 'فوق‌العاده! تو یه حرفه‌ای هستی'; }
  else if(percent >= 60){ emoji = '💪'; title = 'خوب بود! یه کم تمرین بیشتر'; }
  else if(percent >= 40){ emoji = '📚'; title = 'قابل قبوله، ادامه بده'; }
  // ذخیره سوالات اشتباه برای تمرین بعدی
  if(window.PiramidQuizExtras && window.PiramidQuizExtras.addWrong){
    state.questions.forEach(function(q, i){
      if(state.answers[i] !== null && state.answers[i] !== q.correct){
        window.PiramidQuizExtras.addWrong(quiz.id, q);
      }
    });
  }
  // ذخیره نتیجه
  window.PiramidQuizzes.saveResult({
    quizId: quiz.id,
    quizTitle: quiz.title,
    total: total,
    correct: correct,
    wrong: wrong,
    skipped: skipped,
    percent: percent,
    duration: durationSec
  });

  // XP
  var xp = Math.round(percent / 4) + (percent >= 80 ? 20 : 0);
  if(window.PiramidXP && window.PiramidXP.add){
    setTimeout(function(){ window.PiramidXP.add(xp); }, 500);
  }

  // کانفتی اگه خوب زد
  if(percent >= 70 && window.fireConfetti){
    setTimeout(function(){
      window.fireConfetti(window.innerWidth / 2, window.innerHeight / 2 - 100);
    }, 400);
  }

  if(window.PiramidSound){
    try{
      if(percent >= 70 && window.PiramidSound.celebration) window.PiramidSound.celebration();
      else if(window.PiramidSound.success) window.PiramidSound.success();
    }catch(e){}
  }

  var reviewHtml = state.questions.map(function(q, i){
    var a = state.answers[i];
    var cls = a === null ? 'sk' : (a === q.correct ? 'ok' : 'no');
    var icon = a === null ? '⚪' : (a === q.correct ? '✅' : '❌');
    var userAns = a === null ? '—' : q.options[a];
    return '' +
      '<div class="tk-review-item ' + cls + '">' +
        '<div class="tk-review-q">' + icon + ' ' + toFa(i + 1) + '. ' + esc(q.text) + '</div>' +
        '<div class="tk-review-a">' +
          (a !== null && a !== q.correct ? '<span><b>پاسخ تو:</b><span class="tk-review-no">' + esc(userAns) + '</span></span>' : '') +
          '<span><b>پاسخ درست:</b><span class="tk-review-ok">' + esc(q.options[q.correct]) + '</span></span>' +
          (q.explain ? '<div class="tk-review-explain">💡 ' + esc(q.explain) + '</div>' : '') +
        '</div>' +
      '</div>';
  }).join('');

  return '' +
    '<div class="tk-result glass">' +
      '<div class="tk-result-emoji">' + emoji + '</div>' +
      '<div class="tk-result-title">' + title + '</div>' +
      '<div class="tk-result-score">' + toFa(percent) + '٪</div>' +
      '<div class="tk-result-label">' + toFa(correct) + ' از ' + toFa(total) + ' سوال درست</div>' +
      '<div class="tk-result-grid">' +
        '<div class="tk-result-stat correct"><b>' + toFa(correct) + '</b><span>درست</span></div>' +
        '<div class="tk-result-stat wrong"><b>' + toFa(wrong) + '</b><span>غلط</span></div>' +
        '<div class="tk-result-stat skip"><b>' + toFa(skipped) + '</b><span>بی‌پاسخ</span></div>' +
      '</div>' +
      '<div class="tk-result-label" style="margin-bottom:22px">⏱ زمان: ' + toFa(durationMin) + ' دقیقه • 🎯 XP: ' + toFa(xp) + '</div>' +
      '<div class="tk-result-actions">' +
        '<a href="quizzes.html" class="tk-btn ghost" style="flex:1">لیست آزمون‌ها</a>' +
        '<button class="tk-btn primary" id="tkRetry" type="button" style="flex:1">🔄 دوباره</button>' +
        '<button class="tk-btn primary" id="tkShare" type="button" style="flex:1">📸 اشتراک</button>' +
      '</div>' +
    '</div>' +
    '<div class="tk-review">' +
      '<h3>📋 مرور پاسخ‌ها</h3>' +
      reviewHtml +
    '</div>';
}

/* ==================== Timer ==================== */
function updateTimerText(){
  var el = document.getElementById('tkTimeText');
  if(!el) return;
  var m = Math.floor(state.timeLeft / 60);
  var s = state.timeLeft % 60;
  el.textContent = toFa(String(m).padStart(2, '0')) + ':' + toFa(String(s).padStart(2, '0'));
  var box = document.getElementById('tkTimer');
  if(box) box.classList.toggle('warn', state.timeLeft <= 30);
}

function startTimer(){
  updateTimerText();
  state.timer = setInterval(function(){
    if(state.finished) return;
    state.timeLeft--;
    updateTimerText();
    if(state.timeLeft <= 0){
      clearInterval(state.timer);
      state.finished = true;
      showResult();
    }
  }, 1000);
}

/* ==================== Show Screens ==================== */
function showQuestion(){
  wrap.innerHTML = renderHeader() + renderQuestion();
  bindQuestionEvents();
  updateTimerText();

  // scroll to top
  try{ window.scrollTo({ top: 0, behavior: 'smooth' }); }catch(e){}
}

function showResult(){
  if(state.timer) clearInterval(state.timer);
  wrap.innerHTML = renderResult();
  bindResultEvents();
  try{ window.scrollTo({ top: 0, behavior: 'smooth' }); }catch(e){}
}

/* ==================== Bind ==================== */
function bindQuestionEvents(){
  var opts = document.getElementById('tkOpts');
  if(opts){
    opts.addEventListener('click', function(e){
      var b = e.target.closest('.tk-opt');
      if(!b) return;
      var idx = parseInt(b.getAttribute('data-opt'), 10);
      state.answers[state.current] = idx;
      // re-render
      showQuestion();
      // سوال بعدی خودکار بعد از انتخاب؟
      // فعلاً نه، کاربر خودش بزنه بعدی
    });
  }

  var prev = document.getElementById('tkPrev');
  if(prev) prev.addEventListener('click', function(){
    if(state.current > 0){
      state.current--;
      showQuestion();
    }
  });

  var next = document.getElementById('tkNext');
  if(next) next.addEventListener('click', function(){
    if(state.answers[state.current] === null){
      window.showToast && window.showToast('یه گزینه انتخاب کن', 'error');
      return;
    }
    if(state.current < state.questions.length - 1){
      state.current++;
      showQuestion();
    } else {
      state.finished = true;
      showResult();
    }
  });

  // کیبورد: ۱-۴ برای انتخاب، Enter برای بعدی، ← → برای ناوبری
  document.onkeydown = function(e){
    if(state.finished) return;
    if(e.key >= '1' && e.key <= '4'){
      var i = parseInt(e.key, 10) - 1;
      if(i < state.questions[state.current].options.length){
        state.answers[state.current] = i;
        showQuestion();
      }
      return;
    }
    if(e.key === 'Enter'){
      var n = document.getElementById('tkNext');
      if(n && !n.disabled) n.click();
    } else if(e.key === 'ArrowLeft'){
      var p = document.getElementById('tkPrev');
      if(p && !p.disabled) p.click();
    } else if(e.key === 'ArrowRight'){
      var nn = document.getElementById('tkNext');
      if(nn && !nn.disabled) nn.click();
    }
  };
}

function bindResultEvents(){
  document.onkeydown = null;

  var retry = document.getElementById('tkRetry');
  if(retry) retry.addEventListener('click', function(){
    state.current = 0;
    state.answers = new Array(state.questions.length).fill(null);
    state.questions = shuffle(state.questions.map(function(q){
      var opts = q.options.map(function(o, i){ return { text: o, was: i }; });
      opts = shuffle(opts);
      var newCorrect = 0;
      for(var i = 0; i < opts.length; i++){
        if(opts[i].was === q.correct){ newCorrect = i; break; }
      }
      return {
        id: q.id, text: q.text,
        options: opts.map(function(o){ return o.text; }),
        correct: newCorrect, explain: q.explain
      };
    }));
    state.startTime = Date.now();
    state.timeLeft = state.timeLimit;
    state.finished = false;
    startTimer();
    showQuestion();
  });

  var share = document.getElementById('tkShare');
  if(share) share.addEventListener('click', function(){
    var correct = 0;
    state.questions.forEach(function(q, i){
      if(state.answers[i] === q.correct) correct++;
    });
    var percent = Math.round((correct / state.questions.length) * 100);
    if(window.PiramidShare && window.PiramidShare.custom){
      window.PiramidShare.custom({
        emoji: '📝',
        title: quiz.title,
        lines: [
          'نمره‌ی من: ' + toFa(percent) + '٪',
          toFa(correct) + ' از ' + toFa(state.questions.length) + ' درست',
          'با پیرامید آزمون دادم'
        ]
      });
    } else {
      window.showToast && window.showToast('ابزار اشتراک آماده نیست', 'info');
    }
  });
}

/* ==================== Start ==================== */
startTimer();
showQuestion();

console.log('%c📝 Quiz Take ready', 'color:#e85d9e;font-weight:700;');

})();