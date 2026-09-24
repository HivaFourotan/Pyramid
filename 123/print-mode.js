'use strict';

(function(){

var style = document.createElement('style');
style.id = 'piramid-print-style';
style.textContent =
  '@media print {' +
    '*,*::before,*::after{' +
      'animation:none !important;' +
      'transition:none !important;' +
      'box-shadow:none !important;' +
      'text-shadow:none !important;' +
      'background-image:none !important;' +
    '}' +
    'html,body{' +
      'background:#fff !important;' +
      'color:#000 !important;' +
      'font-size:11pt !important;' +
      'line-height:1.6 !important;' +
      'margin:0 !important;' +
      'padding:0 !important;' +
    '}' +
    '.site-header,.site-footer,.marquee,.scroll-progress,' +
    '.floating-btn,.settings-btn,.rainbow-btn,.chat-toggle,' +
    '.back-top,#backTop,.theme-drawer,.theme-drawer-overlay,' +
    '.settings-panel,.settings-overlay,.cookie-banner,' +
    '.newsletter-popup,.pm-bottom-nav,.pm-sheet,' +
    '.chat-widget,.toast-wrap,.focus-exit,' +
    '.announcements-bar,.page-transition,' +
    '.blob,#constellation,.moon-stars,.parallax-layer,' +
    '.sidebar,#adminSidebar,.admin-sidebar,' +
    '.admin-sidebar-overlay,.owner-tabs,.admin-nav,' +
    '.pm-sheet-content,button,.no-print{' +
      'display:none !important;' +
      'visibility:hidden !important;' +
    '}' +
    '.container,.dash-wrap,.nt-wrap,.pl-wrap,.fc-wrap,' +
    '.jn-wrap,.rv-wrap,.mm-wrap,.wr-wrap,.gpa-wrap,.bk-wrap,' +
    '.info-wrap,.owner-wrap,.admin-content{' +
      'max-width:100% !important;' +
      'padding:0 !important;' +
      'margin:0 !important;' +
      'display:block !important;' +
    '}' +
    '.glass,.why-card,.service-card,.testi-card,' +
    '.adm-card,.owner-card,.bk-card,.nt-card,' +
    '.jn-missions,.jn-heat,.rv-race,.mm-event-card,' +
    '.info-card,.fc-deck,.pl-week-wrap,' +
    '.stat,.adm-stat,.owner-stat,.today-stat{' +
      'background:#fff !important;' +
      'border:1px solid #ccc !important;' +
      'border-radius:6px !important;' +
      'page-break-inside:avoid !important;' +
      'break-inside:avoid !important;' +
    '}' +
    'h1,h2,h3,h4{' +
      'color:#000 !important;' +
      'page-break-after:avoid !important;' +
      'break-after:avoid !important;' +
    '}' +
    'a{' +
      'color:#000 !important;' +
      'text-decoration:none !important;' +
    '}' +
    'img,svg,canvas{' +
      'max-width:100% !important;' +
    '}' +
    '.container::before{' +
      'content:"پیرامید — " attr(data-print-title);' +
      'display:block;' +
      'font-size:14pt;' +
      'font-weight:900;' +
      'color:#c83f7f;' +
      'margin-bottom:4mm;' +
      'padding-bottom:3mm;' +
      'border-bottom:2px solid #c83f7f;' +
    '}' +
    '.container::after{' +
      'content:"چاپ‌شده از پیرامید — " attr(data-print-date);' +
      'display:block;' +
      'font-size:8pt;' +
      'color:#888;' +
      'text-align:center;' +
      'margin-top:6mm;' +
      'padding-top:3mm;' +
      'border-top:1px dashed #ccc;' +
    '}' +
    '@page{' +
      'margin:15mm 12mm;' +
    '}' +
  '}';

if(document.head){
  document.head.appendChild(style);
}

function faDate(){
  try{
    return new Date().toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }catch(e){
    return new Date().toLocaleDateString();
  }
}

function getPageTitle(){
  var t = document.title || '';
  t = t.replace(/\s*[|｜]\s*پیرامید\s*$/, '').trim();
  if(!t){
    var h = document.querySelector('main h1, main h2, .section-head h2');
    if(h) t = h.textContent.trim();
  }
  return t || 'پیرامید';
}

function prepare(){
  var c = document.querySelector('.container');
  if(c){
    c.setAttribute('data-print-title', getPageTitle());
    c.setAttribute('data-print-date', faDate());
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', prepare);
} else {
  prepare();
}

window.addEventListener('beforeprint', prepare);

console.log('%c🖨 Print mode ready', 'color:#e85d9e;font-weight:700;');

})();