'use strict';

(function(){

if(localStorage.getItem('piramid_role') !== 'owner'){
  location.href = 'index.html';
  return;
}

var $ = function(s, c){ return (c || document).querySelector(s); };
var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
var toFa = function(s){ return String(s).split('').map(function(c){ return '۰۱۲۳۴۵۶۷۸۹'[+c] || c; }).join(''); };
var pad2 = function(n){ return String(n).padStart(2, '0'); };

function getLS(k, d){
  try{ var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
}
function setLS(k, v){
  try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
}

function escapeHtml(s){
  if(s == null) return '';
  var d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

function faRel(ts){
  if(!ts) return '—';
  var diff = Date.now() - ts;
  var m = Math.floor(diff / 60000);
  var h = Math.floor(diff / 3600000);
  var d = Math.floor(diff / 86400000);
  if(m < 1) return 'همین حالا';
  if(m < 60) return toFa(m) + ' دقیقه پیش';
  if(h < 24) return toFa(h) + ' ساعت پیش';
  if(d < 30) return toFa(d) + ' روز پیش';
  return new Date(ts).toLocaleDateString('fa-IR');
}

function hashPass(str){
  var a = 0xdeadbeef, b = 0x41c6ce57;
  for(var i = 0; i < str.length; i++){
    var c = str.charCodeAt(i);
    a = Math.imul(a ^ c, 2654435761);
    b = Math.imul(b ^ c, 1597334677);
  }
  a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909);
  b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909);
  return (b >>> 0).toString(16).padStart(8, '0') + (a >>> 0).toString(16).padStart(8, '0');
}

function getOwnerHash(){
  var stored = localStorage.getItem('piramid_owner_hash');
  if(stored) return stored;
  var defaultHash = hashPass('پیرامید خیلی خوب است');
  localStorage.setItem('piramid_owner_hash', defaultHash);
  return defaultHash;
}

function getUsers(){ return getLS('piramid_users_list', []); }
function setUsers(u){ setLS('piramid_users_list', u); }

function encodeUser(u){
  var data = {
    n: u.username || '',
    d: u.displayName || '',
    e: u.email || '',
    a: u.age || '',
    g: u.gradient || 'g1'
  };
  var json = JSON.stringify(data);
  var b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function decodeUser(code){
  try{
    var s = String(code).trim().replace(/-/g, '+').replace(/_/g, '/');
    while(s.length % 4) s += '=';
    var json = decodeURIComponent(escape(atob(s)));
    var d = JSON.parse(json);
    if(!d.n) return null;
    return {
      uid: 'u_' + Math.random().toString(36).slice(2, 10),
      username: d.n,
      displayName: d.d || d.n,
      email: d.e || '',
      age: d.a || '',
      gradient: d.g || 'g1',
      importedAt: Date.now()
    };
  }catch(e){ return null; }
}

function openModal(title, html){
  $('#ownerModalTitle').textContent = title;
  $('#ownerModalBody').innerHTML = html;
  $('#ownerModal').classList.add('open');
}
function closeModal(){
  $('#ownerModal').classList.remove('open');
}

$('#ownerModalClose').addEventListener('click', closeModal);
$('#ownerModal').addEventListener('click', function(e){
  if(e.target.id === 'ownerModal') closeModal();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') closeModal();
});

function updateCounts(){
  var users = getUsers();
  var msgs = getLS('piramid_contact_msgs', []);
  var uc = $('#usersCount');
  var mc = $('#messagesCount');
  if(uc) uc.textContent = toFa(users.length);
  if(mc){
    var unread = msgs.filter(function(m){ return !m.read; }).length;
    mc.textContent = toFa(msgs.length);
    mc.style.display = unread > 0 ? 'inline-flex' : 'none';
  }
}

function renderDashboard(){
  var box = $('#panelDashboard');
  var users = getUsers();
  var sessions = getLS('piramid_sessions', {});
  var estimates = getLS('piramid_estimates', []);
  var messages = getLS('piramid_contact_msgs', []);
  var announcements = getLS('piramid_announcements', []);

  var totalMin = 0;
  Object.keys(sessions).forEach(function(k){
    totalMin += (sessions[k].minutes || 0);
  });

  var todayKey = new Date().toISOString().slice(0, 10);
  var activeToday = (sessions[todayKey] && sessions[todayKey].minutes) ? 1 : 0;

  box.innerHTML =
    '<div class="owner-welcome glass">' +
      '<h2>خوش اومدی مالک</h2>' +
      '<p>خلاصه‌ای از وضعیت سایت</p>' +
    '</div>' +
    '<div class="owner-stats">' +
      '<div class="owner-stat glass"><div class="owner-stat-icon" style="background:rgba(74,144,217,.15);color:#4a90d9;">👥</div><b>' + toFa(users.length) + '</b><span>کاربران</span></div>' +
      '<div class="owner-stat glass"><div class="owner-stat-icon" style="background:rgba(59,184,154,.15);color:#3bb89a;">⚡</div><b>' + toFa(totalMin) + '</b><span>دقیقه مطالعه</span></div>' +
      '<div class="owner-stat glass"><div class="owner-stat-icon" style="background:rgba(139,92,246,.15);color:#8b5cf6;">🧮</div><b>' + toFa(estimates.length) + '</b><span>تخمین‌ها</span></div>' +
      '<div class="owner-stat glass"><div class="owner-stat-icon" style="background:rgba(232,116,74,.15);color:#e8874a;">🔥</div><b>' + toFa(activeToday) + '</b><span>فعال امروز</span></div>' +
      '<div class="owner-stat glass"><div class="owner-stat-icon" style="background:rgba(223,102,128,.15);color:#df6680;">📢</div><b>' + toFa(announcements.length) + '</b><span>اعلانات</span></div>' +
      '<div class="owner-stat glass"><div class="owner-stat-icon" style="background:rgba(232,93,158,.15);color:#e85d9e;">💬</div><b>' + toFa(messages.length) + '</b><span>پیام‌ها</span></div>' +
    '</div>';
}

function renderUsers(){
  var box = $('#panelUsers');
  var users = getUsers();

  box.innerHTML =
    '<div class="owner-card glass">' +
      '<div class="owner-card-head">' +
        '<h3>👥 کاربران (' + toFa(users.length) + ')</h3>' +
        '<div class="owner-actions">' +
          '<button class="owner-btn primary" id="addUserBtn" type="button">+ افزودن کاربر</button>' +
        '</div>' +
      '</div>' +
      '<div class="owner-search">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4-4"/></svg>' +
        '<input type="text" id="userSearch" placeholder="جستجو بر اساس نام، نام کاربری یا ایمیل...">' +
      '</div>' +
      '<div id="usersList"></div>' +
    '</div>';

  function paint(filter){
    var f = (filter || '').trim().toLowerCase();
    var list = users;
    if(f){
      list = users.filter(function(u){
        return (u.username || '').toLowerCase().indexOf(f) !== -1 ||
               (u.displayName || '').toLowerCase().indexOf(f) !== -1 ||
               (u.email || '').toLowerCase().indexOf(f) !== -1;
      });
    }

    var container = $('#usersList');
    if(list.length === 0){
      container.innerHTML = '<p class="owner-empty">' + (f ? 'چیزی پیدا نشد' : 'هنوز کاربری اضافه نشده') + '</p>';
      return;
    }

    var html = '<div class="owner-table-wrap"><table class="owner-table"><thead><tr>' +
      '<th>کاربر</th><th>نام کاربری</th><th>ایمیل</th><th>سن</th><th>عملیات</th>' +
      '</tr></thead><tbody>';

    list.forEach(function(u){
      html += '<tr>' +
        '<td><div class="owner-user-cell">' +
          '<div class="owner-avatar">' + escapeHtml((u.displayName || u.username || '?').charAt(0).toUpperCase()) + '</div>' +
          '<b>' + escapeHtml(u.displayName || u.username) + '</b>' +
        '</div></td>' +
        '<td><code>' + escapeHtml(u.username) + '</code></td>' +
        '<td>' + (u.email ? escapeHtml(u.email) : '<span style="color:var(--muted)">—</span>') + '</td>' +
        '<td>' + (u.age ? toFa(u.age) : '—') + '</td>' +
        '<td>' +
          '<button class="owner-mini-btn" data-view="' + u.uid + '">مشاهده</button> ' +
          '<button class="owner-mini-btn danger" data-del="' + u.uid + '">حذف</button>' +
        '</td>' +
      '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;

    $$('[data-view]', container).forEach(function(b){
      b.addEventListener('click', function(){
        var uid = b.getAttribute('data-view');
        var u = users.find(function(x){ return x.uid === uid; });
        if(!u) return;
        var code = encodeUser(u);
        openModal('اطلاعات کاربر', 
          '<div class="owner-detail">' +
            '<div class="owner-detail-row"><span>نام نمایشی</span><b>' + escapeHtml(u.displayName || u.username) + '</b></div>' +
            '<div class="owner-detail-row"><span>نام کاربری</span><b><code>' + escapeHtml(u.username) + '</code></b></div>' +
            '<div class="owner-detail-row"><span>ایمیل</span><b>' + escapeHtml(u.email || '—') + '</b></div>' +
            '<div class="owner-detail-row"><span>سن</span><b>' + (u.age ? toFa(u.age) : '—') + '</b></div>' +
            '<div class="owner-detail-row"><span>تاریخ افزودن</span><b>' + faRel(u.importedAt) + '</b></div>' +
          '</div>' +
          '<div style="margin-top:16px;">' +
            '<label style="display:block;font-size:.82em;font-weight:700;color:var(--muted);margin-bottom:6px;">کد این کاربر</label>' +
            '<textarea readonly style="width:100%;padding:12px;border-radius:12px;border:1.5px solid var(--border);background:var(--soft);color:var(--text);font-family:monospace;font-size:.75em;direction:ltr;resize:vertical;min-height:80px;">' + code + '</textarea>' +
          '</div>'
        );
      });
    });

    $$('[data-del]', container).forEach(function(b){
      b.addEventListener('click', function(){
        if(!confirm('این کاربر حذف بشه؟')) return;
        var uid = b.getAttribute('data-del');
        var list = getUsers().filter(function(x){ return x.uid !== uid; });
        setUsers(list);
        renderUsers();
        updateCounts();
        window.showToast && window.showToast('کاربر حذف شد', 'info');
      });
    });
  }

  paint('');

  $('#userSearch').addEventListener('input', function(e){
    paint(e.target.value);
  });

  $('#addUserBtn').addEventListener('click', function(){
    openModal('افزودن کاربر',
      '<p style="font-size:.88em;color:var(--muted);line-height:1.9;margin-bottom:16px;">' +
        'کدی که کاربر از صفحه‌ی ثبت‌نام دریافت کرده رو این‌جا پیست کن.' +
      '</p>' +
      '<textarea id="addUserCode" placeholder="کد کاربر..." style="width:100%;padding:12px;border-radius:12px;border:1.5px solid var(--border);background:var(--soft);color:var(--text);font-family:monospace;font-size:.8em;direction:ltr;resize:vertical;min-height:100px;"></textarea>' +
      '<div id="addUserErr" style="color:#df6680;font-size:.82em;margin-top:8px;display:none;"></div>' +
      '<button class="btn btn-solid" id="addUserConfirm" type="button" style="width:100%;margin-top:14px;">افزودن</button>'
    );

    $('#addUserConfirm').addEventListener('click', function(){
      var code = $('#addUserCode').value.trim();
      var err = $('#addUserErr');
      err.style.display = 'none';

      if(!code){
        err.textContent = 'کد رو وارد کن';
        err.style.display = 'block';
        return;
      }

      var u = decodeUser(code);
      if(!u){
        err.textContent = 'کد معتبر نیست';
        err.style.display = 'block';
        return;
      }

      var users = getUsers();
      if(users.find(function(x){ return x.username === u.username; })){
        err.textContent = 'این نام کاربری قبلاً اضافه شده';
        err.style.display = 'block';
        return;
      }

      users.push(u);
      setUsers(users);
      closeModal();
      renderUsers();
      updateCounts();
      window.showToast && window.showToast('کاربر اضافه شد', 'success');
    });
  });
}

function renderAnnouncements(){
  var box = $('#panelAnnouncements');
  var list = (getLS('piramid_announcements', []) || []).slice().reverse();

  box.innerHTML =
    '<div class="owner-card glass">' +
      '<div class="owner-card-head">' +
        '<h3>📢 اعلانات (' + toFa(list.length) + ')</h3>' +
        '<button class="owner-btn primary" id="addAnnBtn" type="button">+ اعلان جدید</button>' +
      '</div>' +
      (list.length === 0
        ? '<p class="owner-empty">هنوز اعلانی نداری</p>'
        : '<div class="owner-list">' + list.map(function(a, i){
            return '<div class="owner-list-item">' +
              (a.image
                ? '<div class="owner-list-img" style="background-image:url(' + a.image + ')"></div>'
                : '<div class="owner-list-img owner-list-img-fallback">📢</div>') +
              '<div class="owner-list-body">' +
                '<b>' + escapeHtml(a.title) + '</b>' +
                '<p>' + escapeHtml(a.text || '') + '</p>' +
                '<small>' + escapeHtml(a.date || '') + '</small>' +
              '</div>' +
              '<button class="owner-mini-btn danger" data-del="' + (list.length - 1 - i) + '">حذف</button>' +
            '</div>';
          }).join('') + '</div>')
    + '</div>';

  $$('[data-del]', box).forEach(function(b){
    b.addEventListener('click', function(){
      if(!confirm('حذف بشه؟')) return;
      var all = getLS('piramid_announcements', []) || [];
      all.splice(parseInt(b.getAttribute('data-del'), 10), 1);
      setLS('piramid_announcements', all);
      renderAnnouncements();
    });
  });

  $('#addAnnBtn').addEventListener('click', function(){
    var pendingImg = '';
    openModal('اعلان جدید',
      '<div class="owner-form">' +
        '<label><span>عنوان</span><input type="text" id="annT" placeholder="مثلا: شروع ثبت‌نام"></label>' +
        '<label><span>متن</span><textarea id="annX" rows="3"></textarea></label>' +
        '<label><span>تصویر (اختیاری)</span><input type="file" id="annImg" accept="image/*"></label>' +
        '<div id="annPv"></div>' +
        '<button class="btn btn-solid" id="annSave" type="button" style="width:100%;">انتشار</button>' +
      '</div>'
    );

    $('#annImg').addEventListener('change', function(e){
      var f = e.target.files[0];
      if(!f) return;
      if(f.size > 3 * 1024 * 1024){ window.showToast && window.showToast('حداکثر ۳ مگابایت', 'error'); return; }
      var r = new FileReader();
      r.onload = function(ev){
        pendingImg = ev.target.result;
        $('#annPv').innerHTML = '<img src="' + pendingImg + '" style="max-width:100%;border-radius:12px;margin-top:8px;">';
      };
      r.readAsDataURL(f);
    });

    $('#annSave').addEventListener('click', function(){
      var t = $('#annT').value.trim();
      var x = $('#annX').value.trim();
      if(!t){ window.showToast && window.showToast('عنوان لازمه', 'error'); return; }
      var all = getLS('piramid_announcements', []) || [];
      all.push({ title: t, text: x, image: pendingImg, date: new Date().toLocaleDateString('fa-IR') });
      setLS('piramid_announcements', all);
      closeModal();
      renderAnnouncements();
      window.showToast && window.showToast('منتشر شد', 'success');
    });
  });
}

function renderMajors(){
  var box = $('#panelMajors');
  var list = getLS('piramid_customMajors', []) || [];

  box.innerHTML =
    '<div class="owner-card glass">' +
      '<div class="owner-card-head">' +
        '<h3>📚 رشته‌های سفارشی (' + toFa(list.length) + ')</h3>' +
        '<button class="owner-btn primary" id="addMajorBtn" type="button">+ رشته جدید</button>' +
      '</div>' +
      (list.length === 0
        ? '<p class="owner-empty">رشته‌ی سفارشی نداری</p>'
        : '<div class="owner-list">' + list.map(function(m, i){
            return '<div class="owner-list-item">' +
              '<div class="owner-list-img owner-list-img-fallback">📘</div>' +
              '<div class="owner-list-body">' +
                '<b>' + escapeHtml(m.title) + '</b>' +
                '<p>کلید: ' + escapeHtml(m.key) + ' — ترتیب: ' + toFa(m.order || 10) + '</p>' +
              '</div>' +
              '<button class="owner-mini-btn danger" data-del="' + i + '">حذف</button>' +
            '</div>';
          }).join('') + '</div>')
    + '</div>';

  $$('[data-del]', box).forEach(function(b){
    b.addEventListener('click', function(){
      if(!confirm('حذف بشه؟')) return;
      var all = getLS('piramid_customMajors', []) || [];
      all.splice(parseInt(b.getAttribute('data-del'), 10), 1);
      setLS('piramid_customMajors', all);
      renderMajors();
    });
  });

  $('#addMajorBtn').addEventListener('click', function(){
    openModal('رشته‌ی جدید',
      '<div class="owner-form">' +
        '<label><span>عنوان</span><input type="text" id="mTitle" placeholder="مثلا: علوم ورزشی"></label>' +
        '<label><span>کلید انگلیسی</span><input type="text" id="mKey" placeholder="varzesh"></label>' +
        '<label><span>ترتیب</span><input type="number" id="mOrder" value="10"></label>' +
        '<button class="btn btn-solid" id="mSave" type="button" style="width:100%;">ذخیره</button>' +
      '</div>'
    );

    $('#mSave').addEventListener('click', function(){
      var t = $('#mTitle').value.trim();
      var k = $('#mKey').value.trim().toLowerCase().replace(/\s+/g, '-');
      var o = parseInt($('#mOrder').value || '10', 10);
      if(!t || !k){ window.showToast && window.showToast('عنوان و کلید لازمه', 'error'); return; }
      var all = getLS('piramid_customMajors', []) || [];
      all.push({ title: t, key: k, order: o });
      setLS('piramid_customMajors', all);
      closeModal();
      renderMajors();
      window.showToast && window.showToast('اضافه شد', 'success');
    });
  });
}

function renderMessages(){
  var box = $('#panelMessages');
  var msgs = (getLS('piramid_contact_msgs', []) || []).slice().reverse();
  var bugs = (getLS('piramid_bug_reports', []) || []).slice().reverse();

  box.innerHTML =
    '<div class="owner-card glass" style="margin-bottom:20px;">' +
      '<div class="owner-card-head">' +
        '<h3>💬 پیام‌های تماس (' + toFa(msgs.length) + ')</h3>' +
        (msgs.length > 0 ? '<button class="owner-mini-btn danger" id="clearMsgs">پاک کردن همه</button>' : '') +
      '</div>' +
      (msgs.length === 0
        ? '<p class="owner-empty">هنوز پیامی نیومده</p>'
        : '<div class="owner-msg-list">' + msgs.map(function(m, i){
            return '<div class="owner-msg">' +
              '<div class="owner-msg-head">' +
                '<div><b>' + escapeHtml(m.name || 'ناشناس') + '</b><small>' + escapeHtml(m.email || '—') + '</small></div>' +
                '<span>' + faRel(new Date(m.date).getTime()) + '</span>' +
              '</div>' +
              '<div class="owner-msg-body">' + escapeHtml(m.msg || '') + '</div>' +
              '<div class="owner-msg-foot">' +
                '<a href="mailto:' + escapeHtml(m.email) + '" class="owner-mini-btn">📧 پاسخ</a>' +
                '<button class="owner-mini-btn danger" data-del="' + (msgs.length - 1 - i) + '">حذف</button>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>')
    + '</div>' +

    '<div class="owner-card glass">' +
      '<div class="owner-card-head">' +
        '<h3>🐛 گزارش‌های خطا (' + toFa(bugs.length) + ')</h3>' +
      '</div>' +
      (bugs.length === 0
        ? '<p class="owner-empty">گزارشی نیومده</p>'
        : '<div class="owner-msg-list">' + bugs.map(function(b, i){
            return '<div class="owner-msg">' +
              '<div class="owner-msg-head">' +
                '<div><b>' + escapeHtml(b.page || '—') + '</b><small>' + faRel(new Date(b.date).getTime()) + '</small></div>' +
                (b.resolved ? '<span style="color:#3bb89a;font-weight:800;">حل شد</span>' : '') +
              '</div>' +
              '<div class="owner-msg-body">' + escapeHtml(b.desc || '') + '</div>' +
              '<div class="owner-msg-foot">' +
                (!b.resolved ? '<button class="owner-mini-btn" data-resolve="' + (bugs.length - 1 - i) + '">حل شد</button>' : '') +
                '<button class="owner-mini-btn danger" data-bdel="' + (bugs.length - 1 - i) + '">حذف</button>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>')
    + '</div>';

  $$('[data-del]', box).forEach(function(b){
    b.addEventListener('click', function(){
      if(!confirm('حذف بشه؟')) return;
      var all = getLS('piramid_contact_msgs', []) || [];
      all.splice(parseInt(b.getAttribute('data-del'), 10), 1);
      setLS('piramid_contact_msgs', all);
      renderMessages();
      updateCounts();
    });
  });

  $$('[data-bdel]', box).forEach(function(b){
    b.addEventListener('click', function(){
      if(!confirm('حذف بشه؟')) return;
      var all = getLS('piramid_bug_reports', []) || [];
      all.splice(parseInt(b.getAttribute('data-bdel'), 10), 1);
      setLS('piramid_bug_reports', all);
      renderMessages();
    });
  });

  $$('[data-resolve]', box).forEach(function(b){
    b.addEventListener('click', function(){
      var all = getLS('piramid_bug_reports', []) || [];
      all[parseInt(b.getAttribute('data-resolve'), 10)].resolved = true;
      setLS('piramid_bug_reports', all);
      renderMessages();
    });
  });

  $('#clearMsgs') && $('#clearMsgs').addEventListener('click', function(){
    if(!confirm('همه پاک بشن؟')) return;
    setLS('piramid_contact_msgs', []);
    renderMessages();
    updateCounts();
  });
}

function renderSettings(){
  var box = $('#panelSettings');

  box.innerHTML =
    '<div class="owner-card glass" style="margin-bottom:20px;">' +
      '<div class="owner-card-head"><h3>🔐 تغییر رمز مالک</h3></div>' +
      '<div class="owner-form">' +
        '<label><span>رمز فعلی</span><input type="password" id="oldPass"></label>' +
        '<label><span>رمز جدید</span><input type="password" id="newPass"></label>' +
        '<label><span>تکرار رمز جدید</span><input type="password" id="newPass2"></label>' +
        '<button class="btn btn-solid" id="changePassBtn" type="button" style="width:100%;">تغییر رمز</button>' +
      '</div>' +
    '</div>' +
'<div class="owner-card glass" style="margin-bottom:20px;">' +
  '<div class="owner-card-head"><h3>🔒 قفل خودکار</h3></div>' +
  '<div class="owner-lock-info">' +
    '<div class="owner-lock-icon">⏱</div>' +
    '<div>' +
      '<b>قفل بعد از ۳۰ دقیقه عدم فعالیت</b>' +
      '<small>وقتی فعال نیستی، صفحه برای امنیت قفل می‌شه</small>' +
    '</div>' +
    '<button class="owner-lock-toggle" id="lockToggle" type="button"></button>' +
  '</div>' +
'</div>' +
    '<div class="owner-card glass" style="margin-bottom:20px;">' +
      '<div class="owner-card-head"><h3>⚙️ تنظیمات سایت</h3></div>' +
      '<div class="owner-form">' +
        '<label><span>نام سایت</span><input type="text" id="cfgName" placeholder="پیرامید"></label>' +
        '<label><span>شعار</span><input type="text" id="cfgTag" placeholder="مسیر کنکورت، دقیق‌تر و زیباتر"></label>' +
        '<label><span>ایمیل پشتیبانی</span><input type="email" id="cfgEmail" placeholder="support@piramid.app"></label>' +
        '<button class="btn btn-solid" id="saveCfgBtn" type="button" style="width:100%;">ذخیره</button>' +
      '</div>' +
    '</div>' +

    '<div class="owner-card glass">' +
      '<div class="owner-card-head"><h3>💾 پشتیبان‌گیری</h3></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
        '<button class="btn btn-solid" id="exportBtn" type="button">📤 دانلود پشتیبان</button>' +
        '<input type="file" id="importFile" accept=".json" style="display:none;">' +
        '<button class="btn" id="importBtn" type="button" style="background:var(--soft);color:var(--text);border:1px solid var(--border);">📥 بازیابی از فایل</button>' +
      '</div>' +
    '</div>';

  var cfg = getLS('piramid_site_config', {});
  if(cfg.siteName) $('#cfgName').value = cfg.siteName;
  if(cfg.tagline) $('#cfgTag').value = cfg.tagline;
  if(cfg.supportEmail) $('#cfgEmail').value = cfg.supportEmail;

  $('#changePassBtn').addEventListener('click', function(){
    var oldP = $('#oldPass').value;
    var newP = $('#newPass').value;
    var newP2 = $('#newPass2').value;
    if(!oldP || !newP){ window.showToast && window.showToast('همه فیلدها لازمه', 'error'); return; }
    if(newP.length < 6){ window.showToast && window.showToast('رمز جدید حداقل ۶ کاراکتر', 'error'); return; }
    if(newP !== newP2){ window.showToast && window.showToast('رمزها یکسان نیستن', 'error'); return; }
    if(hashPass(oldP) !== getOwnerHash()){
      window.showToast && window.showToast('رمز فعلی اشتباهه', 'error');
      return;
    }
    localStorage.setItem('piramid_owner_hash', hashPass(newP));
    $('#oldPass').value = '';
    $('#newPass').value = '';
    $('#newPass2').value = '';
    window.showToast && window.showToast('رمز عوض شد', 'success');
  });

  $('#saveCfgBtn').addEventListener('click', function(){
    var data = {
      siteName: $('#cfgName').value.trim() || 'پیرامید',
      tagline: $('#cfgTag').value.trim(),
      supportEmail: $('#cfgEmail').value.trim()
    };
    setLS('piramid_site_config', data);
    window.showToast && window.showToast('ذخیره شد', 'success');
  });

  $('#exportBtn').addEventListener('click', function(){
    var data = {};
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf('piramid_') === 0) data[k] = localStorage.getItem(k);
    }
    var blob = new Blob([JSON.stringify({ meta: { date: new Date().toISOString() }, data: data }, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'piramid-backup-' + Date.now() + '.json';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    window.showToast && window.showToast('دانلود شد', 'success');
  });

  $('#importBtn').addEventListener('click', function(){ $('#importFile').click(); });

  $('#importFile').addEventListener('change', function(e){
    var f = e.target.files[0];
    if(!f) return;
    var r = new FileReader();
    r.onload = function(ev){
      try{
        var p = JSON.parse(ev.target.result);
        if(!p.data) throw new Error('bad');
        if(!confirm('داده‌های فعلی جایگزین می‌شن. مطمئنی؟')) return;
        Object.keys(p.data).forEach(function(k){
          if(k.indexOf('piramid_') === 0) localStorage.setItem(k, p.data[k]);
        });
        window.showToast && window.showToast('بازیابی شد', 'success');
        setTimeout(function(){ location.reload(); }, 1000);
      }catch(err){
        window.showToast && window.showToast('فایل معتبر نیست', 'error');
      }
    };
    var lockEnabled = (function(){
  try{ return localStorage.getItem('piramid_lock_enabled') !== 'off'; }
  catch(e){ return true; }
})();
var lt = $('#lockToggle');
if(lt){
  if(lockEnabled) lt.classList.add('on');
  lt.addEventListener('click', function(){
    var on = !lt.classList.contains('on');
    lt.classList.toggle('on', on);
    try{ localStorage.setItem('piramid_lock_enabled', on ? 'on' : 'off'); }catch(e){}
    if(window.showToast) window.showToast(on ? 'قفل خودکار فعال شد' : 'قفل خودکار غیرفعال شد', 'info');
  });
}
    r.readAsText(f);
  });
}

var RENDERERS = {
  dashboard: renderDashboard,
  users: renderUsers,
  announcements: renderAnnouncements,
  majors: renderMajors,
  messages: renderMessages,
  settings: renderSettings,
  activity: function(){
  var box = $('#panelActivity');
  if(!box) return;
  var log = window.PiramidLog ? window.PiramidLog.get().slice().reverse() : [];
  box.innerHTML =
    '<div class="owner-card glass">' +
      '<div class="owner-card-head">' +
        '<h3>📋 لاگ فعالیت‌ها</h3>' +
        (log.length > 0 ? '<button class="owner-mini-btn danger" id="clearLog">پاک کردن</button>' : '') +
      '</div>' +
      (log.length === 0
        ? '<p class="owner-empty">هنوز فعالیتی ثبت نشده</p>'
        : '<div class="owner-msg-list">' + log.slice(0, 50).map(function(item){
            return '<div class="owner-msg" style="padding:10px 14px;">' +
              '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;">' +
                '<div><b style="font-size:.88em;">' + item.user + '</b>' +
                '<p style="font-size:.78em;color:var(--muted);margin:3px 0;">' + item.type + (item.detail ? ' — ' + item.detail : '') + '</p></div>' +
                '<small style="font-size:.72em;color:var(--faint);">' + faRel(item.time) + '</small>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>')
    + '</div>';

  var cb = $('#clearLog');
  if(cb) cb.addEventListener('click', function(){
    if(!confirm('پاک بشه؟')) return;
    window.PiramidLog && window.PiramidLog.clear();
    RENDERERS.activity();
  });
}
};

function goTo(tab){
  $$('.owner-tab').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-tab') === tab);
  });
  $$('.owner-panel').forEach(function(p){
    p.classList.toggle('active', p.getAttribute('data-panel') === tab);
  });
  if(RENDERERS[tab]) RENDERERS[tab]();
}

$$('.owner-tab').forEach(function(b){
  b.addEventListener('click', function(){
    goTo(b.getAttribute('data-tab'));
  });
});

updateCounts();
goTo('dashboard');

})();