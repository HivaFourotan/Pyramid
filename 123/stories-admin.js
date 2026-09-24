'use strict';

(function(){

function esc(s){
  var d = document.createElement('div');
  d.textContent = String(s == null ? '' : s);
  return d.innerHTML;
}

function openForm(id){
  var existing = document.getElementById('sf-overlay');
  if(existing) existing.remove();

  var st = id && window.PiramidStories ? window.PiramidStories.get(id) : null;
  var isEdit = !!st;

  var overlay = document.createElement('div');
  overlay.id = 'sf-overlay';
  overlay.className = 'modal-overlay open';
  overlay.innerHTML =
    '<div class="modal-card glass" style="max-width:480px;">' +
      '<div class="modal-head">' +
        '<h3>' + (isEdit ? '✏️ ویرایش رتبه‌برتر' : '➕ افزودن رتبه‌برتر') + '</h3>' +
        '<button class="modal-close" id="sf-close" type="button" aria-label="بستن">✕</button>' +
      '</div>' +
      '<div style="padding:22px 24px 26px;">' +
        '<div class="sf-form">' +
          '<label><span>نام</span><input type="text" id="sf-name" value="' + esc(st ? st.name : '') + '" placeholder="مثلا: محمد رضایی"></label>' +
          '<label><span>رتبه</span><input type="text" id="sf-rank" value="' + esc(st ? st.rank : '') + '" placeholder="مثلا: رتبه ۴۵۰ تجربی"></label>' +
          '<label><span>حرف اول (آواتار)</span><input type="text" id="sf-initial" maxlength="2" value="' + esc(st ? (st.initial || '') : '') + '" placeholder="م"></label>' +
          '<label><span>متن</span><textarea id="sf-text" rows="3" placeholder="نقل قول...">' + esc(st ? st.text : '') + '</textarea></label>' +
          '<label><span>ترتیب</span><input type="number" id="sf-order" min="1" max="99" value="' + (st ? (st.order||1) : 99) + '"></label>' +
          '<button class="btn btn-solid" id="sf-save" type="button" style="width:100%;">ذخیره</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  function close(){ overlay.remove(); }
  document.getElementById('sf-close').addEventListener('click', close);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
  document.addEventListener('keydown', function esc2(e){
    if(e.key === 'Escape'){ close(); document.removeEventListener('keydown', esc2); }
  });

  document.getElementById('sf-save').addEventListener('click', function(){
    var name = document.getElementById('sf-name').value.trim();
    var rank = document.getElementById('sf-rank').value.trim();
    var initial = document.getElementById('sf-initial').value.trim();
    var text = document.getElementById('sf-text').value.trim();
    var order = parseInt(document.getElementById('sf-order').value || '99', 10);

    if(!name){ window.showToast && window.showToast('نام الزامی است', 'error'); return; }
    if(!initial) initial = name.charAt(0);

    if(isEdit){
      window.PiramidStories.update(st.id, { name: name, rank: rank, initial: initial, text: text, order: order });
      window.showToast && window.showToast('✅ ویرایش شد', 'success');
    } else {
      window.PiramidStories.add({ name: name, rank: rank, initial: initial, text: text, order: order });
      window.showToast && window.showToast('✅ اضافه شد', 'success');
    }
    close();
    refreshAll();
  });
}

function refreshAll(){
  if(window.PiramidStoriesUI) window.PiramidStoriesUI.render();
  if(window.__refreshStoriesPanel) window.__refreshStoriesPanel();
}

function render(box){
  if(!box || !window.PiramidStories) return;

  window.__refreshStoriesPanel = function(){ render(box); };

  var list = window.PiramidStories.all();

  box.innerHTML =
    '<div class="owner-card glass">' +
      '<div class="owner-card-head">' +
        '<h3>🏆 رتبه‌برترها (' + list.length + ')</h3>' +
        '<div class="owner-actions">' +
          '<button class="owner-btn" id="sa-reset" type="button">بازگردانی پیش‌فرض</button>' +
          '<button class="owner-btn primary" id="sa-add" type="button">+ افزودن</button>' +
        '</div>' +
      '</div>' +
      (list.length === 0
        ? '<p class="owner-empty">هنوز رتبه‌برتری نداری</p>'
        : '<div class="sa-list">' + list.map(function(st, i){
            var isFirst = i === 0;
            var isLast = i === list.length - 1;
            return '<div class="sa-item">' +
              '<div class="sa-avatar">' + esc(st.initial || (st.name||'؟').charAt(0)) + '</div>' +
              '<div class="sa-body">' +
                '<b>' + esc(st.name) + '</b>' +
                '<small>' + esc(st.rank || '—') + ' • ترتیب ' + (st.order||0) + '</small>' +
                '<p>' + esc((st.text || '').slice(0, 80)) + '</p>' +
              '</div>' +
              '<div class="sa-actions">' +
                '<button class="sa-btn" data-up="' + st.id + '" title="بالا"' + (isFirst ? ' disabled' : '') + '>↑</button>' +
                '<button class="sa-btn" data-down="' + st.id + '" title="پایین"' + (isLast ? ' disabled' : '') + '>↓</button>' +
                '<button class="sa-btn" data-edit="' + st.id + '" title="ویرایش">✏️</button>' +
                '<button class="sa-btn danger" data-del="' + st.id + '" title="حذف">🗑</button>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>')
    + '</div>';

  var addBtn = document.getElementById('sa-add');
  if(addBtn) addBtn.addEventListener('click', function(){ openForm(null); });

  var resetBtn = document.getElementById('sa-reset');
  if(resetBtn) resetBtn.addEventListener('click', function(){
    if(!confirm('به حالت پیش‌فرض برگرده؟ (همه‌ی موارد شما پاک می‌شن)')) return;
    window.PiramidStories.reset();
    refreshAll();
    window.showToast && window.showToast('♻️ بازگردانی شد', 'info');
  });

  box.querySelectorAll('[data-edit]').forEach(function(b){
    b.addEventListener('click', function(){ openForm(b.getAttribute('data-edit')); });
  });
  box.querySelectorAll('[data-del]').forEach(function(b){
    b.addEventListener('click', function(){
      if(!confirm('حذف بشه؟')) return;
      window.PiramidStories.remove(b.getAttribute('data-del'));
      refreshAll();
      window.showToast && window.showToast('🗑 حذف شد', 'info');
    });
  });
  box.querySelectorAll('[data-up]').forEach(function(b){
    b.addEventListener('click', function(){
      window.PiramidStories.move(b.getAttribute('data-up'), -1);
      refreshAll();
    });
  });
  box.querySelectorAll('[data-down]').forEach(function(b){
    b.addEventListener('click', function(){
      window.PiramidStories.move(b.getAttribute('data-down'), +1);
      refreshAll();
    });
  });
}

window.PiramidStoriesAdmin = { render: render, openForm: openForm };

console.log('%c🏆 Stories admin ready', 'color:#e85d9e;font-weight:700;');

})();