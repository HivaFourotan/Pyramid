'use strict';

(function(){

function isQuizzesPage(){
  return window.location.pathname.indexOf('quizzes.html') !== -1 ||
         window.location.pathname.indexOf('quiz-take.html') !== -1;
}

function build(){
  if(isQuizzesPage()) return;
  if(document.getElementById('quizFabBtn')) return;
  if(document.body.classList.contains('fr-body')) return;

  var btn = document.createElement('a');
  btn.id = 'quizFabBtn';
  btn.className = 'floating-btn quiz-fab-btn';
  btn.href = 'quizzes.html';
  btn.setAttribute('aria-label', 'آزمون‌ساز');
  btn.innerHTML = '<span class="quiz-fab-emoji">📝</span>';

  document.body.appendChild(btn);

  btn.addEventListener('click', function(){
    if(window.PiramidSound && window.PiramidSound.click) window.PiramidSound.click();
  });
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', build);
} else {
  build();
}

console.log('%c📝 Quiz FAB ready', 'color:#e85d9e;font-weight:700;');

})();