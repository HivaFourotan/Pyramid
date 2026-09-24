/* ===== Account Page — v2 با لاگین داخلی ===== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const loginBox = document.getElementById('accountLoginBox');
    // چک کن کاربر با auth-lite وارد شده
  if(window.PiramidAuth && window.PiramidAuth.isLoggedIn()){
    const user = window.PiramidAuth.getCurrentUser();
    if(user){
      document.getElementById('accountLoginBox').style.display = 'none';
            var fabBox = document.getElementById('fabManagerBox');
      if(fabBox) fabBox.style.display = 'block';
      document.getElementById('accountMainBox').style.display = 'block';
      var fmb2 = document.getElementById('fabsManagerBox');
      if(fmb2) fmb2.style.display = 'none';
      document.getElementById('pName').value = user.displayName || '';
      document.getElementById('pAge').value = user.age || '';
      document.getElementById('pEmail').value = user.email || '';
      if(user.avatar){
        const prev = document.getElementById('avatarPreview');
        if(prev){ prev.style.backgroundImage = `url(${user.avatar})`; prev.textContent = ''; }
      }
      return; // متوقف کن، بقیه کد قدیمی اجرا نشه
    }
  }
  const mainBox  = document.getElementById('accountMainBox');
  const loginForm = document.getElementById('accountLoginForm');

  const OWNER_PASSWORD = 'پیرامید خیلی خوب است';

  function getUser(){
    try{ return JSON.parse(localStorage.getItem('piramid_user') || 'null'); }catch(e){ return null; }
  }
  function setUser(u){
    try{ localStorage.setItem('piramid_user', JSON.stringify(u)); }catch(e){}
  }
  function setRole(r){
    try{ localStorage.setItem('piramid_role', r); }catch(e){}
  }

  // ============ نمایش لاگین یا پروفایل ============
  function showLogin(){
        var fabBox2 = document.getElementById('fabManagerBox');
    if(fabBox2) fabBox2.style.display = 'none';
    if(loginBox) loginBox.style.display = 'block';
    if(mainBox)  mainBox.style.display  = 'none';
    setTimeout(() => document.getElementById('accUser')?.focus(), 200);
  }

  function showProfile(user){
    if(loginBox) loginBox.style.display = 'none';
    if(mainBox)  mainBox.style.display  = 'block';
    fillForm(user);
  }

  // ============ فرم لاگین داخلی ============
  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const username = (document.getElementById('accUser')?.value || '').trim();
    const pass     = (document.getElementById('accPass')?.value || '');
    if(!username){
      window.showToast && window.showToast('نام کاربری رو وارد کن','error');
      return;
    }
    let role = 'student';
    if(pass === OWNER_PASSWORD) role = 'owner';

    const existing = getUser();
    let user;
    if(existing && existing.username === username){
      existing.role = role;
      user = existing;
    } else {
      user = {
        username,
        displayName: username,
        role,
        avatar: '',
        age: '',
        email: '',
        gradient: 'g1'
      };
    }
    setUser(user);
    setRole(role);
    window.showToast && window.showToast('✨ خوش آمدی ' + username + '!', 'success');
    showProfile(user);
  });

  // ============ فرم پروفایل ============
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarInput   = document.getElementById('avatarInput');
  const pName         = document.getElementById('pName');
  const pAge          = document.getElementById('pAge');
  const pEmail        = document.getElementById('pEmail');
  const form          = document.getElementById('profileForm');
  const logoutBtn     = document.getElementById('logoutBtn');

  function fillForm(u){
    if(!u) return;
    if(avatarPreview){
      if(u.avatar){
        avatarPreview.style.backgroundImage = `url(${u.avatar})`;
        avatarPreview.textContent = '';
      } else {
        avatarPreview.style.backgroundImage = '';
        const grads = {
          g1: 'linear-gradient(135deg,#e85d9e,#c78ae8)',
          g2: 'linear-gradient(135deg,#4a90d9,#82cdb5)',
          g3: 'linear-gradient(135deg,#f59e0b,#ea580c)'
        };
        avatarPreview.style.background = grads[u.gradient || 'g1'] || grads.g1;
        avatarPreview.textContent = (u.displayName || u.username || '؟').charAt(0).toUpperCase();
      }
    }
    if(pName)  pName.value  = u.displayName || u.username || '';
    if(pAge)   pAge.value   = u.age || '';
    if(pEmail) pEmail.value = u.email || '';
    document.querySelectorAll('.grad-opt').forEach(g => {
      g.classList.toggle('active', g.dataset.grad === (u.gradient || 'g1'));
    });
  }

  // انتخاب گرادیان
  document.querySelectorAll('.grad-opt').forEach(g => {
    g.addEventListener('click', () => {
      const u = getUser(); if(!u) return;
      u.gradient = g.dataset.grad;
      setUser(u);
      document.querySelectorAll('.grad-opt').forEach(x => x.classList.toggle('active', x === g));
      const grads = {
        g1: 'linear-gradient(135deg,#e85d9e,#c78ae8)',
        g2: 'linear-gradient(135deg,#4a90d9,#82cdb5)',
        g3: 'linear-gradient(135deg,#f59e0b,#ea580c)'
      };
      if(avatarPreview && !u.avatar){
        avatarPreview.style.background = grads[u.gradient] || grads.g1;
      }
    });
  });

  // آپلود عکس
  avatarInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    if(file.size > 2 * 1024 * 1024){
      window.showToast && window.showToast('حجم عکس باید کمتر از ۲ مگابایت باشد','error');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const u = getUser(); if(!u) return;
      u.avatar = ev.target.result;
      setUser(u);
      if(avatarPreview){
        avatarPreview.style.backgroundImage = `url(${u.avatar})`;
        avatarPreview.textContent = '';
      }
      window.showToast && window.showToast('✅ عکس بارگذاری شد (فراموش نکن ذخیره کنی)','success');
    };
    reader.readAsDataURL(file);
  });

  // ذخیره پروفایل
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const u = getUser(); if(!u) return;
    u.displayName = pName.value.trim() || u.username;
    u.age = pAge.value ? parseInt(pAge.value, 10) : '';
    u.email = pEmail.value.trim();
    setUser(u);
    fillForm(u);
    window.showToast && window.showToast('✅ پروفایل با موفقیت ذخیره شد','success');
  });
  logoutBtn?.addEventListener('click', () => {
    if(!confirm('از حساب خارج می‌شوی؟')) return;
    localStorage.removeItem('piramid_user');
    localStorage.removeItem('piramid_role');
    try{ localStorage.removeItem('piramid_user_profile'); }catch(e){}
    location.href = 'index.html';
  });
  // ============ راه‌اندازی اولیه ============
  const currentUser = getUser();
  if(currentUser && currentUser.username){
    showProfile(currentUser);
  } else {
    showLogin();
  }
});