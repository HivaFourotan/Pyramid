'use strict';

(function(){

var STORAGE_KEY = 'piramid_recent_pages';
var MAX = 6;

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
  'info.html':            { icon: '📄', title: 'اطلاعات' },
  'auth.html':            { icon: '🔐', title: 'ورود' }
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

function trackCurrentPage(){
  var current = getCurrent();
  if(!PAGES[current]) return;
  var list = readList().filter(function(p){ return p.url !== current; });
  list.unshift({ url: current, time: Date.now() });
  saveList(list);
}

function getIcon(url){
  return (PAGES[url] && PAGES[url].icon) || '📄';
}

function getTitle(url){
  return (PAGES[url] && PAGES[url].title) || url.replace('.html', '');
}

function toFa(s){
  return String(s).split('').map(function(c){
    return '۰۱۲۳۴۵۶۷۸۹'[+c] || c;
  }).join('');
}

function faRel(ts){
  var diff = Date.now() - ts;
  var m = Math.floor(diff / 60000);
  var h = Math.floor(diff / 3600000);
  var d = Math.floor(diff / 86400000);
  if(m < 1) return 'همین حالا';
  if(m < 60) return toFa(m) + ' دقیقه پیش';
  if(h < 24) return toFa(h) + ' ساعت پیش';
  if(d < 30) return toFa(d) + ' روز پیش';
  return toFa(Math.floor(d / 30)) + ' ماه پیش';
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
  var b = document.getElementById('rp-close');
  if(b) b.addEventListener('click', closePanel);
}

function render(){
  if(!panel) return;
  var list = readList();
  var current = getCurrent();

  if(list.length === 0){
    panel.innerHTML =
      '<div class="rp-head">' +
        '<b>🕐 صفحات اخیر</b>' +
        '<button class="rp-close" id="rp-close" type="button" aria-label="بستن">✕</button>' +
      '</div>' +
      '<div class="rp-empty">هنوز صفحه‌ای باز نکردی</div>';
    bindClose();
    return;
  }

  var html =
    '<div class="rp-head">' +
      '<b>🕐 صفحات اخیر</b>' +
      '<button class="rp-close" id="rp-close" type="button" aria-label="بستن">✕</button>' +
    '</div>' +
    '<div class="rp-list">';

  list.forEach(function(item){
    var icon = getIcon(item.url);
    var title = getTitle(item.url);
    var isCur = item.url === current;
    var cls = isCur ? 'rp-item rp-current' : 'rp-item';
    var sub = faRel(item.time) + (isCur ? ' • همین‌جا' : '');
    html +=
      '<a class="' + cls + '" href="' + escapeHtml(item.url) + '">' +
        '<span class="rp-icon">' + icon + '</span>' +
        '<div class="rp-text">' +
          '<b>' + escapeHtml(title) + '</b>' +
          '<small>' + sub + '</small>' +
        '</div>' +
        '<span class="rp-go">›</span>' +
      '</a>';
  });

  html += '</div>';
  panel.innerHTML = html;
  bindClose();
}

function buildUI(){
  if(document.getElementById('rp-overlay')) return;

  overlay = document.createElement('div');
  overlay.id = 'rp-overlay';
  overlay.className = 'rp-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  panel = document.createElement('div');
  panel.className = 'rp-panel';
  panel.id = 'rp-panel';

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
  if(document.getElementById('rp-btn')) return;
  if(document.body.classList.contains('fr-body')) return;

  var btn = document.createElement('button');
  btn.id = 'rp-btn';
  btn.type = 'button';
  btn.className = 'floating-btn rp-btn';
  btn.setAttribute('aria-label', 'صفحات اخیر');
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 7v5l3 2"/>' +
    '</svg>';

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    if(isOpen) closePanel();
    else openPanel();
  });

  document.body.appendChild(btn);
}

function init(){
  trackCurrentPage();
  buildButton();
  buildUI();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('%c🕐 Recent pages ready', 'color:#e85d9e;font-weight:700;');

})();