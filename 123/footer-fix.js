/* ======================================================================
   PIRAMID — footer-fix.js
   لینک‌های فوتر خودکار به info.html وصل می‌شن
   ====================================================================== */
'use strict';

(function(){
  function fixFooter(){
    const map = {
      'درباره ما': 'about',
      'درباره': 'about',
      'وبلاگ': 'blog',
      'سوالات متداول': 'faq',
      'تماس': 'contact',
      'راهنما': 'help',
      'گزارش خطا': 'report',
      'قوانین': 'rules',
      'حریم خصوصی': 'privacy'
    };

    // پیدا کردن همه‌ی لینک‌ها توی فوتر با href="#"
    document.querySelectorAll('.site-footer a').forEach(a => {
      const text = (a.textContent || '').trim();
      // اگه متنش توی map بود و href خرابه
      if(map[text]){
        if(a.getAttribute('href') === '#' || a.getAttribute('href') === '' || a.getAttribute('href') === null){
          a.setAttribute('href', 'info.html?p=' + map[text]);
        }
      }
    });

    // اگه توی «ابزارها» یه لینک تخمین رتبه یا انتخاب رشته هست که صفحه نداره
    document.querySelectorAll('.site-footer a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const text = (a.textContent || '').trim();

      if(href === '#' || href === ''){
        if(text.includes('تخمین رتبه')){
          a.setAttribute('href', 'estimate.html');
        } else if(text.includes('انتخاب رشته')){
          a.setAttribute('href', 'estimate.html');
        }
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fixFooter);
  } else {
    fixFooter();
  }

  // چک دوباره بعد از اینکه همه چیز لود شد
  setTimeout(fixFooter, 800);
  setTimeout(fixFooter, 2000);
})();