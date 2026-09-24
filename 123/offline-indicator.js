'use strict';

(function(){

var BAR_ID = 'piramid-offline-bar';
var isOnline = navigator.onLine;

function ensureBar(){
  var bar = document.getElementById(BAR_ID);
  if(bar) return bar;

  bar = document.createElement('div');
  bar.id = BAR_ID;
  bar.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:100000;' +
    'padding:8px 16px;text-align:center;' +
    'font-family:inherit;font-size:.82em;font-weight:700;' +
    'color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.2);' +
    'transform:translateY(-100%);transition:transform .35s cubic-bezier(.34,1.4,.5,1);' +
    'pointer-events:none;';
  document.body.appendChild(bar);
  return bar;
}

function showOffline(){
  var bar = ensureBar();
  bar.style.background = 'linear-gradient(135deg, #df6680, #c83f7f)';
  bar.textContent = '📴 آفلاین هستی — همه چیز از حافظه لود می‌شه';
  requestAnimationFrame(function(){
    bar.style.transform = 'translateY(0)';
  });
}

function showOnline(){
  var bar = ensureBar();
  bar.style.background = 'linear-gradient(135deg, #3bb89a, #22c55e)';
  bar.textContent = '✅ دوباره آنلاین شدی';
  requestAnimationFrame(function(){
    bar.style.transform = 'translateY(0)';
  });
  setTimeout(function(){
    bar.style.transform = 'translateY(-100%)';
  }, 3000);
}

function hideBar(){
  var bar = document.getElementById(BAR_ID);
  if(bar) bar.style.transform = 'translateY(-100%)';
}

window.addEventListener('online', function(){
  if(!isOnline){
    isOnline = true;
    showOnline();
  }
});

window.addEventListener('offline', function(){
  if(isOnline){
    isOnline = false;
    showOffline();
  }
});

if(!isOnline){
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', showOffline);
  } else {
    showOffline();
  }
}

console.log('%c📡 Offline indicator ready', 'color:#e85d9e;font-weight:700;');

})();