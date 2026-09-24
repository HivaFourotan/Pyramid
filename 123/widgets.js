'use strict';

(function(){
if(window.PiramidWidgets) return;

var STORAGE = 'piramid_user_widgets';

var BUILT_IN = [
  { id:'pomodoro',   icon:'🍅', title:'پومودورو',       desc:'تایمر تمرکز',      url:'dashboard.html',       color:'#e85d9e' },
  { id:'flashcards', icon:'🃏', title:'فلش‌کارت',        desc:'مرور هوشمند',      url:'flashcards.html',      color:'#4a90d9' },
  { id:'estimate',   icon:'🧮', title:'تخمین کنکور',    desc:'تراز و رتبه',      url:'estimate.html',        color:'#8b5cf6' },
  { id:'journey',    icon:'🌟', title:'سفر پیرامید',    desc:'XP و مأموریت',     url:'journey.html',         color:'#e5b548' },
  { id:'notes',      icon:'📓', title:'دفترچه یادداشت', desc:'نکته و فرمول',     url:'notes.html',           color:'#3bb89a' },
  { id:'planner',    icon:'📅', title:'برنامه‌ریز',       desc:'هفتگی',            url:'planner.html',         color:'#e8874a' },
  { id:'gpa',        icon:'🎓', title:'ماشین‌حساب معدل', desc:'محاسبه معدل',      url:'gpa.html',             color:'#06b6d4' },
  { id:'weekly',     icon:'📊', title:'کارنامه هفتگی',  desc:'گزارش خودکار',     url:'weekly-report.html',   color:'#df6680' },
  { id:'focus',      icon:'🌧', title:'اتاق تمرکز',     desc:'تمرکز عمیق',       url:'focus-room.html',      color:'#22c55e' },
  { id:'memories',   icon:'🎬', title:'خاطرات',         desc:'خط زمان',          url:'memories.html',        color:'#c78ae8' },
  { id:'rival',      icon:'👥', title:'حریف مجازی',     desc:'رقابت',            url:'rival.html',           color:'#f59e0b' },
  { id:'quizzes',    icon:'📝', title:'آزمون‌ساز',        desc:'آزمون بساز',       url:'quizzes.html',         color:'#a78bfa' },
  { id:'backup',     icon:'💾', title:'پشتیبان‌گیری',    desc:'ذخیره و بازیابی',   url:'backup.html',          color:'#64748b' }
];

var COLORS = ['#e85d9e','#4a90d9','#3bb89a','#8b5cf6','#e8874a','#06b6d4','#f59e0b','#22c55e','#df6680','#c78ae8','#64748b','#a78bfa'];
var EMOJIS = ['🔗','⭐','🎯','📌','🎨','📚','🎵','🎮','💡','🔥','⚡','🌈','💎','🎁','🚀','🏆','📱','💼','🌍','☕','🍕','🎬','🎓','📖'];

function getBuiltin(id){
  for(var i = 0; i < BUILT_IN.length; i++) if(BUILT_IN[i].id === id) return BUILT_IN[i];
  return null;
}

function mkBuiltin(ref){
  var b = getBuiltin(ref);
  if(!b) return null;
  return {
    id: 'w_b_' + ref + '_' + Date.now().toString(36),
    type: 'builtin',
    ref: ref,
    icon: b.icon,
    title: b.title,
    desc: b.desc,
    url: b.url,
    color: b.color
  };
}

function read(){
  try{
    var raw = localStorage.getItem(STORAGE);
    if(raw){
      var list = JSON.parse(raw);
      if(Array.isArray(list)) return list;
    }
    // پیش‌فرض
    var def = ['pomodoro','flashcards','journey','quizzes'].map(mkBuiltin).filter(Boolean);
    localStorage.setItem(STORAGE, JSON.stringify(def));
    return def;
  }catch(e){ return []; }
}

function write(list){
  try{ localStorage.setItem(STORAGE, JSON.stringify(list)); }catch(e){}
}

function genId(){
  return 'w_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
}

function esc(s){
  var d = document.createElement('div');
  d.textContent = String(s == null ? '' : s);
  return d.innerHTML;
}

function isBuiltinActive(ref){
  var list = read();
  for(var i = 0; i < list.length; i++){
    if(list[i].type === 'builtin' && list[i].ref === ref) return true;
  }
  return false;
}

/* ==================== Manager ==================== */
function buildManager(container){
  function draw(){
    var list = read();
    var html =
      '<div class="wdg-mgr-head">' +
        '<div>' +
          '<h3>🧩 ویجت‌های من</h3>' +
          '<p>' + (list.length === 0 ? 'هنوز ویجتی اضافه نکردی' : list.length + ' ویجت فعال') + '</p>' +
        '</div>' +
        '<button class="btn btn-solid" id="wdgAddBtn" type="button">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>' +
          'افزودن ویجت' +
        '</button>' +
      '</div>';

    if(list.length === 0){
      html +=
        '<div class="wdg-mgr-empty">' +
          '<div class="wdg-mgr-empty-icon">🧩</div>' +
          '<b>هنوز ویجتی نداری</b>' +
          '<p>از کتابخانه، ابزارهای محبوبت رو اضافه کن</p>' +
          '<button class="btn btn-solid" id="wdgEmptyAdd" type="button">افزودن اولین ویجت</button>' +
        '</div>';
    } else {
      html += '<div class="wdg-mgr-grid">' + list.map(function(w, i){
        return '<div class="wdg-mgr-card">' +
          '<div class="wdg-mgr-icon" style="background:' + w.color + '22;color:' + w.color + '">' + w.icon + '</div>' +
          '<div class="wdg-mgr-body">' +
            '<b>' + esc(w.title) + '</b>' +
            (w.desc ? '<small>' + esc(w.desc) + '</small>' : '') +
          '</div>' +
          '<div class="wdg-mgr-actions">' +
            '<button class="wdg-mgr-btn" type="button" data-up="' + w.id + '"' + (i === 0 ? ' disabled' : '') + ' title="بالا">↑</button>' +
            '<button class="wdg-mgr-btn" type="button" data-down="' + w.id + '"' + (i === list.length - 1 ? ' disabled' : '') + ' title="پایین">↓</button>' +
            (w.type === 'custom' ? '<button class="wdg-mgr-btn" type="button" data-edit="' + w.id + '" title="ویرایش">✏️</button>' : '') +
            '<button class="wdg-mgr-btn danger" type="button" data-del="' + w.id + '" title="حذف">−</button>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>';
    }

    container.innerHTML = html;

    var addB = document.getElementById('wdgAddBtn');
    if(addB) addB.addEventListener('click', openLibrary);
    var empB = document.getElementById('wdgEmptyAdd');
    if(empB) empB.addEventListener('click', openLibrary);

    container.querySelectorAll('[data-del]').forEach(function(b){
      b.addEventListener('click', function(){
        write(read().filter(function(w){ return w.id !== b.getAttribute('data-del'); }));
        draw();
        if(window.showToast) window.showToast('🗑 حذف شد', 'info');
      });
    });
    container.querySelectorAll('[data-up]').forEach(function(b){
      b.addEventListener('click', function(){ move(b.getAttribute('data-up'), -1); draw(); });
    });
    container.querySelectorAll('[data-down]').forEach(function(b){
      b.addEventListener('click', function(){ move(b.getAttribute('data-down'), 1); draw(); });
    });
    container.querySelectorAll('[data-edit]').forEach(function(b){
      b.addEventListener('click', function(){
        var id = b.getAttribute('data-edit');
        var list = read();
        for(var i = 0; i < list.length; i++) if(list[i].id === id) return openCustomForm(list[i]);
      });
    });
  }

  function move(id, dir){
    var list = read();
    var idx = -1;
    for(var i = 0; i < list.length; i++) if(list[i].id === id){ idx = i; break; }
    if(idx === -1) return;
    var t = idx + dir;
    if(t < 0 || t >= list.length) return;
    var tmp = list[idx]; list[idx] = list[t]; list[t] = tmp;
    write(list);
  }

  function openLibrary(){
    var modal = document.getElementById('wdgLibModal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'wdgLibModal';
      modal.className = 'modal-overlay';
      modal.innerHTML =
        '<div class="modal-card glass" style="max-width:640px;">' +
          '<div class="modal-head">' +
            '<h3>🧩 کتابخانه‌ی ویجت‌ها</h3>' +
            '<button class="modal-close" id="wdgLibClose" type="button">✕</button>' +
          '</div>' +
          '<div style="padding:20px 24px 26px;max-height:74vh;overflow-y:auto;">' +
            '<div class="wdg-lib-tabs">' +
              '<button class="wdg-lib-tab active" data-tab="builtin" type="button">📦 آماده</button>' +
              '<button class="wdg-lib-tab" data-tab="custom" type="button">🔗 شورتکات دلخواه</button>' +
            '</div>' +
            '<div class="wdg-lib-panel active" data-panel="builtin" id="wdgPanelBuiltin"></div>' +
            '<div class="wdg-lib-panel" data-panel="custom" id="wdgPanelCustom"></div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);

      modal.addEventListener('click', function(e){ if(e.target.id === 'wdgLibModal') modal.classList.remove('open'); });
      document.getElementById('wdgLibClose').addEventListener('click', function(){ modal.classList.remove('open'); });
      modal.querySelectorAll('.wdg-lib-tab').forEach(function(t){
        t.addEventListener('click', function(){
          var name = t.getAttribute('data-tab');
          modal.querySelectorAll('.wdg-lib-tab').forEach(function(x){ x.classList.toggle('active', x === t); });
          modal.querySelectorAll('.wdg-lib-panel').forEach(function(p){ p.classList.toggle('active', p.getAttribute('data-panel') === name); });
        });
      });
    }

    // Built-in panel
    var bp = document.getElementById('wdgPanelBuiltin');
    bp.innerHTML = '<div class="wdg-lib-grid">' + BUILT_IN.map(function(b){
      var active = isBuiltinActive(b.id);
      return '<div class="wdg-lib-item">' +
        '<div class="wdg-lib-icon" style="background:' + b.color + '22;color:' + b.color + '">' + b.icon + '</div>' +
        '<div class="wdg-lib-body">' +
          '<b>' + esc(b.title) + '</b>' +
          '<small>' + esc(b.desc) + '</small>' +
        '</div>' +
        (active
          ? '<button class="wdg-lib-btn active" type="button" data-rm="' + b.id + '" title="حذف">−</button>'
          : '<button class="wdg-lib-btn" type="button" data-add="' + b.id + '" title="افزودن">+</button>'
        ) +
      '</div>';
    }).join('') + '</div>';

    bp.querySelectorAll('[data-add]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var w = mkBuiltin(btn.getAttribute('data-add'));
        if(!w) return;
        var list = read(); list.push(w); write(list);
        draw(); openLibrary();
        if(window.showToast) window.showToast('✅ اضافه شد', 'success');
      });
    });
    bp.querySelectorAll('[data-rm]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var ref = btn.getAttribute('data-rm');
        write(read().filter(function(w){ return !(w.type === 'builtin' && w.ref === ref); }));
        draw(); openLibrary();
        if(window.showToast) window.showToast('🗑 حذف شد', 'info');
      });
    });

    // Custom panel
    drawCustomPanel();
    modal.classList.add('open');
  }

  function drawCustomPanel(){
    var cp = document.getElementById('wdgPanelCustom');
    cp.innerHTML =
      '<div class="wdg-form">' +
        '<label><span>عنوان</span><input type="text" id="wdgTitle" placeholder="مثلا: پادکست من"></label>' +
        '<label><span>لینک (URL)</span><input type="url" id="wdgUrl" placeholder="https://example.com"></label>' +
        '<div class="wdg-form-label">آیکن</div>' +
        '<div class="wdg-emoji-grid" id="wdgEmojiGrid">' +
          EMOJIS.map(function(e, i){
            return '<button class="wdg-emoji' + (i === 0 ? ' active' : '') + '" type="button" data-emoji="' + e + '">' + e + '</button>';
          }).join('') +
        '</div>' +
        '<div class="wdg-form-label">رنگ</div>' +
        '<div class="wdg-color-grid" id="wdgColorGrid">' +
          COLORS.map(function(c, i){
            return '<button class="wdg-color' + (i === 0 ? ' active' : '') + '" type="button" data-color="' + c + '" style="background:' + c + '"></button>';
          }).join('') +
        '</div>' +
        '<button class="btn btn-solid" id="wdgCustomAdd" type="button" style="width:100%;margin-top:6px;">افزودن</button>' +
      '</div>';

    cp.querySelectorAll('.wdg-emoji').forEach(function(b){
      b.addEventListener('click', function(){
        cp.querySelectorAll('.wdg-emoji').forEach(function(x){ x.classList.toggle('active', x === b); });
      });
    });
    cp.querySelectorAll('.wdg-color').forEach(function(b){
      b.addEventListener('click', function(){
        cp.querySelectorAll('.wdg-color').forEach(function(x){ x.classList.toggle('active', x === b); });
      });
    });

    document.getElementById('wdgCustomAdd').addEventListener('click', function(){
      var title = document.getElementById('wdgTitle').value.trim();
      var url = document.getElementById('wdgUrl').value.trim();
      var icon = cp.querySelector('.wdg-emoji.active').getAttribute('data-emoji');
      var color = cp.querySelector('.wdg-color.active').getAttribute('data-color');

      if(!title || !url){
        if(window.showToast) window.showToast('عنوان و لینک الزامی‌ست', 'error');
        return;
      }
      if(!/^https?:\/\//i.test(url)) url = 'https://' + url;

      var w = {
        id: genId(),
        type: 'custom',
        icon: icon,
        title: title,
        desc: url.replace(/^https?:\/\//i, '').slice(0, 32),
        url: url,
        color: color
      };
      var list = read(); list.push(w); write(list);
      draw();
      document.getElementById('wdgLibModal').classList.remove('open');
      if(window.showToast) window.showToast('✅ اضافه شد', 'success');
    });
  }

  function openCustomForm(existing){
    // ویرایش: میریم توی library، تب custom
    openLibrary();
    setTimeout(function(){
      var modal = document.getElementById('wdgLibModal');
      modal.querySelector('.wdg-lib-tab[data-tab="custom"]').click();
      document.getElementById('wdgTitle').value = existing.title;
      document.getElementById('wdgUrl').value = existing.url;
      var cp = document.getElementById('wdgPanelCustom');
      cp.querySelectorAll('.wdg-emoji').forEach(function(b){
        b.classList.toggle('active', b.getAttribute('data-emoji') === existing.icon);
      });
      cp.querySelectorAll('.wdg-color').forEach(function(b){
        b.classList.toggle('active', b.getAttribute('data-color') === existing.color);
      });
      // تغییر دکمه به «ذخیره»
      var btn = document.getElementById('wdgCustomAdd');
      btn.textContent = 'ذخیره تغییرات';
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', function(){
        var title = document.getElementById('wdgTitle').value.trim();
        var url = document.getElementById('wdgUrl').value.trim();
        var icon = cp.querySelector('.wdg-emoji.active').getAttribute('data-emoji');
        var color = cp.querySelector('.wdg-color.active').getAttribute('data-color');
        if(!title || !url){ if(window.showToast) window.showToast('همه فیلدها را پر کن', 'error'); return; }
        if(!/^https?:\/\//i.test(url)) url = 'https://' + url;

        var list = read();
        for(var i = 0; i < list.length; i++){
          if(list[i].id === existing.id){
            list[i].title = title;
            list[i].url = url;
            list[i].icon = icon;
            list[i].color = color;
            list[i].desc = url.replace(/^https?:\/\//i, '').slice(0, 32);
            break;
          }
        }
        write(list);
        draw();
        modal.classList.remove('open');
        if(window.showToast) window.showToast('✅ ذخیره شد', 'success');
      });
    }, 250);
  }

  draw();
}

/* ==================== Display ==================== */
function renderDisplay(container){
  var list = read();
  var section = container.closest('section');
  if(!section) section = container.parentElement;

  if(list.length === 0){
    if(section) section.style.display = 'none';
    return;
  }
  if(section) section.style.display = 'block';

  container.innerHTML = list.map(function(w){
    return '<a class="wdg-display-card" href="' + esc(w.url) + '" style="--wc:' + w.color + '">' +
      '<div class="wdg-display-icon" style="background:' + w.color + '22;color:' + w.color + '">' + w.icon + '</div>' +
      '<div class="wdg-display-title">' + esc(w.title) + '</div>' +
      (w.desc ? '<div class="wdg-display-desc">' + esc(w.desc) + '</div>' : '') +
    '</a>';
  }).join('');
}

/* ==================== Init ==================== */
function init(){
  var mgr = document.getElementById('widgetsManager');
  if(mgr) buildManager(mgr);

  var disp = document.getElementById('myWidgetsGrid');
  if(disp) renderDisplay(disp);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.PiramidWidgets = {
  read: read,
  write: write,
  refresh: init
};

console.log('%c🧩 Widgets ready', 'color:#e85d9e;font-weight:700;');

})();