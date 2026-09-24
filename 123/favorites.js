'use strict';

(function(){

var STORAGE_KEY = 'piramid_favorites';
var MAX = 8;

var PAGES = {
  'index.html':           { icon: '🏠', title: 'خانه' },
  'dashboard.html':       { icon: '🎯', title: 'داشبورد' },
  'estimate.html':        { icon: '🧮', title: 'تخمین کنکور' },
  'flashcards.html':      { icon: '🃏', title: 'فلش‌کارت' },
  'gpa.html':             { icon: '🎓', title: 'ماشین‌حساب معدل' },
  'notes.html':           { icon: '📓', title: 'دفترچه یادداشت' },
  'planner.html':         { icon: '📅', title: 'برنامه‌ریز' },
  'weekly-report.html':   { icon: '📊', title: 'کارنامه هفتگی' },
  'memories.html':        { icon: '🎬', title: 'خاطرات' },
  'journey.html':         { icon: '🌟', title: 'سفر پیرامید' },
  'rival.html':           { icon: '👥', title: 'حریف مجازی' },
  'focus-room.html':      { icon: '🌧', title: 'اتاق تمرکز' },
  'backup.html':          { icon: '💾', title: 'پشتیبان‌گیری' },
  'account.html':         { icon: '👤', title: 'پروفایل' },
  'info.html':            { icon: '📄', title: 'اطلاعات' }
};

var overlay = null;
var panel = null;
var isOpen = false;

function getCurrent(){
  var path = window.location.pathname.split('/').pop() || 'index.html';
  return path.split('?')[0];
}

function readList(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    var list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  }catch(e){ return []; }
}

function saveList(list){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX)));
  }catch(e){}
}

function isFav(url){
  return readList().some(function(p){ return p.url === url; });
}

function toggleFav(url){
  var list = readList();
  var exists = list.some(function(p){ return p.url === url; });
  if(exists){
    list = list.filter(function(p){ return p.url !== url; });
  } else {
    if(!PAGES[url]) return false;
    list.unshift({ url: url, time: Date.now() });
  }
  saveList(list);
  return !exists;
}

function getIcon(url){
  return (PAGES[url] && PAGES[url].icon) || '📄';
}
function getTitle(url){
  return (PAGES[url] && PAGES[url].title) || url.replace('.html', '');
}
function escapeHtml(s){
  var d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

function openPanel(){
  if(!overlay) return;
  render();
  isOpen = true;
  overlay.classList.add('open');
}
function closePanel(){
  if(!overlay) return;
  isOpen = false;
  overlay.classList.remove('open');
}
function bindClose(){
  var b = document.getElementById('fv-close');
  if(b) b.addEventListener('click', closePanel);
}

function render(){
  if(!panel) return;
  var list = readList();

  if(list.length === 0){
    panel.innerHTML =
      '<div class="fv-head">' +
        '<b>⭐ صفحات پین‌شده</b>' +
        '<button class="fv-close" id="fv-close" type="button" aria-label="بستن">✕</button>' +
      '</div>' +
      '<div class="fv-empty">هنوز صفحه‌ای پین نکردی<br><small>روی ستاره بالای صفحه بزن</small></div>';
    bindClose();
    return;
  }

  var html =
    '<div class="fv-head">' +
      '<b>⭐ صفحات پین‌شده</b>' +
      '<button class="fv-close" id="fv-close" type="button" aria-label="بستن">✕</button>' +
    '</div>' +
    '<div class="fv-list">';

  list.forEach(function(item){
    html +=
      '<div class="fv-item">' +
        '<a href="' + escapeHtml(item.url) + '" class="fv-link">' +
          '<span class="fv-icon">' + getIcon(item.url) + '</span>' +
          '<b>' + escapeHtml(getTitle(item.url)) + '</b>' +
        '</a>' +
        '<button class="fv-remove" data-url="' + escapeHtml(item.url) + '" type="button" aria-label="حذف">✕</button>' +
      '</div>';
  });

  html += '</div>';
  panel.innerHTML = html;
  bindClose();

  panel.querySelectorAll('.fv-remove').forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      var url = b.getAttribute('data-url');
      toggleFav(url);
      updateStar();
      render();
      window.showToast && window.showToast('از پین‌ها حذف شد', 'info', 1500);
    });
  });
}

function updateStar(){
  var star = document.getElementById('fv-btn');
  if(!star) return;
  var cur = getCurrent();
  if(isFav(cur)) star.classList.add('active');
  else star.classList.remove('active');
}

function buildUI(){
  if(document.getElementById('fv-overlay')) return;

  overlay = document.createElement('div');
  overlay.id = 'fv-overlay';
  overlay.className = 'fv-overlay';

  panel = document.createElement('div');
  panel.className = 'fv-panel';
  panel.id = 'fv-panel';

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e){
    if(e.target === overlay) closePanel();
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && isOpen) closePanel();
  });
}

function buildButton(){
  if(document.getElementById('fv-btn')) return;
  if(document.body.classList.contains('fr-body')) return;

  var cur = getCurrent();
  if(!PAGES[cur]) return;

  var btn = document.createElement('button');
  btn.id = 'fv-btn';
  btn.type = 'button';
  btn.className = 'floating-btn fv-btn';
  btn.setAttribute('aria-label', 'پین کردن صفحه');
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6z"/>' +
    '</svg>';

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    if(e.shiftKey){
      if(isOpen) closePanel();
      else openPanel();
      return;
    }
    var url = getCurrent();
    var added = toggleFav(url);
    if(added){
      if(window.PiramidSound && window.PiramidSound.success) window.PiramidSound.success();
      window.showToast && window.showToast('⭐ به پین‌ها اضافه شد', 'success', 1500);
    } else {
      window.showToast && window.showToast('از پین‌ها حذف شد', 'info', 1500);
    }
    updateStar();
  });

  btn.addEventListener('dblclick', function(e){
    e.preventDefault();
    if(isOpen) closePanel();
    else openPanel();
  });

  btn.addEventListener('contextmenu', function(e){
    e.preventDefault();
    if(isOpen) closePanel();
    else openPanel();
  });

  document.body.appendChild(btn);
  updateStar();
}

function init(){
  buildButton();
  buildUI();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('%c⭐ Favorites ready', 'color:#e85d9e;font-weight:700;');

})();