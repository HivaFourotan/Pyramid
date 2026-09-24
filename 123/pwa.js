/* ======================================================================
   PIRAMID — pwa.js
   ثبت Service Worker + دکمه‌ی نصب هوشمند
   ====================================================================== */
'use strict';

(function(){

  /* ============ 1) ثبت Service Worker ============ */
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then(reg => {
          console.log('✅ Service Worker ثبت شد:', reg.scope);
          // اگه نسخه‌ی جدید اومد
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener('statechange', () => {
              if(newWorker.state === 'installed' && navigator.serviceWorker.controller){
                if(window.showToast){
                  window.showToast('🔄 نسخه‌ی جدید پیرامید آماده‌ست! صفحه رو رفرش کن.', 'info', 6000);
                }
              }
            });
          });
        })
        .catch(err => console.warn('⚠️ SW register error:', err));
    });
  }

  /* ============ 2) دکمه‌ی نصب ============ */
  let deferredPrompt = null;
  const installBtn = document.createElement('button');
  installBtn.id = 'piramidInstallBtn';
  installBtn.type = 'button';
  installBtn.setAttribute('aria-label', 'نصب پیرامید');
  installBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <path d="M17 8l-5-5-5 5"/>
      <path d="M12 3v12"/>
    </svg>
    <span>نصب اپلیکیشن</span>
  `;
  installBtn.style.display = 'none';

  // استایل inline (به CSS دست نمی‌زنیم که چیزی خراب نشه)
  Object.assign(installBtn.style, {
    position: 'fixed',
    bottom: '230px',
    right: '22px',
    zIndex: '999',
    padding: '10px 18px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #e85d9e, #c78ae8)',
    color: '#fff',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: '0.82em',
    fontWeight: '800',
    display: 'none',
    alignItems: 'center',
    gap: '7px',
    cursor: 'pointer',
    boxShadow: '0 12px 30px rgba(232,93,158,.4)',
    transition: 'transform .3s cubic-bezier(.34,1.4,.5,1), box-shadow .3s'
  });
  installBtn.querySelector('svg').style.width = '15px';
  installBtn.querySelector('svg').style.height = '15px';

  installBtn.addEventListener('mouseenter', () => {
    installBtn.style.transform = 'translateY(-3px)';
    installBtn.style.boxShadow = '0 18px 40px rgba(232,93,158,.55)';
  });
  installBtn.addEventListener('mouseleave', () => {
    installBtn.style.transform = 'translateY(0)';
    installBtn.style.boxShadow = '0 12px 30px rgba(232,93,158,.4)';
  });

  // موبایل: موقعیت
  if(window.innerWidth <= 560){
    installBtn.style.right = '14px';
    installBtn.style.bottom = '200px';
    installBtn.style.padding = '9px 14px';
    installBtn.style.fontSize = '0.75em';
  }

  document.body.appendChild(installBtn);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // اگه کاربر قبلاً نصب نکرده بود
    let dismissed = null;
    try{ dismissed = localStorage.getItem('piramid_install_dismissed'); }catch(e){}
    if(!dismissed){
      installBtn.style.display = 'inline-flex';
    }
  });

  installBtn.addEventListener('click', async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log('نصب:', choice.outcome);
    if(choice.outcome === 'accepted'){
      if(window.showToast) window.showToast('🎉 پیرامید نصب شد!', 'success');
    }
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    if(window.showToast) window.showToast('✅ پیرامید به صفحه‌ی خانه اضافه شد', 'success');
  });

  // اگه کاربر iOS بود و نصب نشده، راهنما نشون بده
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if(isIOS && !isStandalone){
    let dismissed = null;
    try{ dismissed = localStorage.getItem('piramid_ios_hint'); }catch(e){}
    if(!dismissed){
      setTimeout(() => {
        if(window.showToast){
          window.showToast('📱 برای نصب: دکمه‌ی Share بزن → Add to Home Screen', 'info', 8000);
        }
        try{ localStorage.setItem('piramid_ios_hint', '1'); }catch(e){}
      }, 12000);
    }
  }

  console.log('%c📱 PWA ready','color:#e85d9e;font-weight:700;');
})();