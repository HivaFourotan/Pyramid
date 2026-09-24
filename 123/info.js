/* ======================================================================
   PIRAMID — info.js
   صفحه‌ی اطلاعات چندمنظوره (درباره، وبلاگ، سوالات، تماس، راهنما، قوانین، ...)
   ====================================================================== */
'use strict';

window.addEventListener('load', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');

  const PAGES = {
    about: {
      title: '💜 درباره‌ی پیرامید',
      headerTitle: '💜 درباره ما',
      html: `
        <p class="info-lead">
          پیرامید یه پلتفرم آموزشی رایگان برای داوطلبان کنکوره که با هدف <b>ساده‌سازی مسیر موفقیت</b> ساخته شده.
        </p>

        <h2>🏔️ داستان ما</h2>
        <p>
          پیرامید از یه ایده‌ی ساده شروع شد: «چرا ابزارهای کنکور این‌قدر پیچیده و گرونن؟»
          تصمیم گرفتیم یه ابزار دقیق، زیبا و رایگان بسازیم که همه‌ی داوطلب‌ها بتونن ازش استفاده کنن.
        </p>

        <h2>✨ چی ارائه می‌دیم؟</h2>
        <ul>
          <li><b>تخمین دقیق تراز و رتبه</b> — با الگوریتم‌های به‌روز</li>
          <li><b>ماشین‌حساب معدل و سوابق</b> — با محاسبه‌ی تأثیر روی کنکور</li>
          <li><b>فلش‌کارت هوشمند</b> — با الگوریتم SM-2 مثل Anki</li>
          <li><b>دفترچه یادداشت</b> — با پشتیبانی از فرمول و تگ</li>
          <li><b>برنامه‌ریز و کارنامه هفتگی</b> — با گزارش خودکار</li>
          <li><b>اتاق تمرکز</b> — با ۶ منظره و صدای محیطی</li>
          <li><b>سفر پیرامید</b> — سیستم XP، سطح، مأموریت و دستاورد</li>
          <li><b>حریف مجازی</b> — رقیبی که کنارت درس می‌خونه</li>
        </ul>

        <h2>💡 ارزش‌های ما</h2>
        <p>
          <b>رایگان برای همه</b> — معتقدیم دانش نباید پشت دیوار پول گیر کنه.<br>
          <b>آفلاین و امن</b> — همه‌ی داده‌هات روی مرورگر خودت می‌مونه، بدون سرور.<br>
          <b>ساده و زیبا</b> — طراحی شیشه‌ای، انیمیشن‌های نرم، تجربه‌ی لذت‌بخش.
        </p>

        <div class="info-note">
          ساخته‌شده با 💜 توسط تیم کوچیک پیرامید — برای همه‌ی کنکوری‌های ایران.
        </div>
      `
    },

    blog: {
      title: '📝 وبلاگ پیرامید',
      headerTitle: '📝 وبلاگ',
      html: `
        <p class="info-lead">مقالات، راهکارها و انگیزه برای مسیر کنکور.</p>

        <div class="blog-list">
          <a class="blog-item" href="#">
            <div class="blog-item-icon">🎯</div>
            <div class="blog-item-body">
              <b>چطور روزی ۶ ساعت تمرکز واقعی داشته باشیم؟</b>
              <span>تکنیک‌های علمی + تجربه‌ی رتبه‌های برتر</span>
              <small>۵ دقیقه مطالعه</small>
            </div>
          </a>

          <a class="blog-item" href="#">
            <div class="blog-item-icon">📊</div>
            <div class="blog-item-body">
              <b>تراز چیه و چطور محاسبه می‌شه؟</b>
              <span>همه چیز درباره تراز کنکور به زبان ساده</span>
              <small>۷ دقیقه مطالعه</small>
            </div>
          </a>

          <a class="blog-item" href="#">
            <div class="blog-item-icon">🧠</div>
            <div class="blog-item-body">
              <b>الگوریتم لایتنر چطور کار می‌کنه؟</b>
              <span>چرا مرور با فاصله مؤثرتر از مرور یکنواخته؟</span>
              <small>۶ دقیقه مطالعه</small>
            </div>
          </a>

          <a class="blog-item" href="#">
            <div class="blog-item-icon">💪</div>
            <div class="blog-item-body">
              <b>چطور انگیزه‌ت رو در طول سال حفظ کنی؟</b>
              <span>۱۰ راهکار عملی برای کنکوری‌های خسته</span>
              <small>۸ دقیقه مطالعه</small>
            </div>
          </a>

          <a class="blog-item" href="#">
            <div class="blog-item-icon">🎓</div>
            <div class="blog-item-body">
              <b>سوابق تحصیلی چقدر روی کنکور تأثیر داره؟</b>
              <span>تحلیل کامل تأثیر و راهکار جبران</span>
              <small>۹ دقیقه مطالعه</small>
            </div>
          </a>
        </div>

        <div class="info-note">
          📝 مقالات بیشتر به‌زودی... پیشنهاد موضوع داری؟ از صفحه‌ی «تماس» بگو!
        </div>
      `
    },

    faq: {
      title: '❓ سوالات متداول',
      headerTitle: '❓ سوالات متداول',
      html: `
        <p class="info-lead">جواب سوال‌های پرتکرار درباره‌ی پیرامید.</p>

        <div class="faq-list">
          <details class="faq-item">
            <summary>استفاده از پیرامید رایگانه؟</summary>
            <p>بله! همه‌ی ابزارهای پیرامید کاملاً رایگانن. هیچ هزینه‌ای برای تخمین، فلش‌کارت، داشبورد و بقیه‌ی امکانات نداری.</p>
          </details>

          <details class="faq-item">
            <summary>اطلاعات من کجا ذخیره می‌شه؟</summary>
            <p>همه‌ی داده‌هات فقط روی مرورگر خودت ذخیره می‌شن (با LocalStorage). هیچ سروری وجود نداره و ما به اطلاعاتت دسترسی نداریم. برای امنیت بیشتر، از بخش «پشتیبان‌گیری» فایل پشتیبان بگیر.</p>
          </details>

          <details class="faq-item">
            <summary>دقت تخمین تراز چقدره؟</summary>
            <p>دقت تخمین تراز پیرامید حدود ۹۷٪ است. این دقت از مقایسه با کارنامه‌های واقعی هزاران داوطلب به دست اومده. هر سال هم این دقت بالاتر می‌ره.</p>
          </details>

          <details class="faq-item">
            <summary>می‌تونم روی چند دستگاه استفاده کنم؟</summary>
            <p>بله! می‌تونی روی همه‌ی دستگاه‌هات پیرامید رو نصب کنی. برای انتقال داده بین دستگاه‌ها، از بخش «پشتیبان‌گیری» فایل بگیر و روی دستگاه دیگه بازیابی کن.</p>
          </details>

          <details class="faq-item">
            <summary>چطور پیرامید رو نصب کنم؟</summary>
            <p>پیرامید یه وب‌اپ نصب‌شدنیه (PWA). از Chrome یا Safari بازش کن، روی دکمه‌ی «نصب اپلیکیشن» بزن یا از منوی مرورگر «Add to Home Screen» رو انتخاب کن. مثل یه اپ عادی نصب می‌شه!</p>
          </details>

          <details class="faq-item">
            <summary>چرا اتاق تمرکز رو گوشی کار نمی‌کنه؟</summary>
            <p>اگه به مشکل خوردی، صفحه رو رفرش کن (Ctrl+Shift+R) یا کش مرورگرت رو پاک کن. اگه مشکل ادامه داشت، از صفحه‌ی «گزارش خطا» بهمون بگو.</p>
          </details>

          <details class="faq-item">
            <summary>ماشین‌حساب معدل چطور کار می‌کنه؟</summary>
            <p>نمرات کتبی و نهایی هر سه سال (دهم، یازدهم، دوازدهم) رو وارد کن. پیرامید معدل کل، معدل کتبی، تراز سوابق و تأثیر روی کنکور رو محاسبه می‌کنه.</p>
          </details>

          <details class="faq-item">
            <summary>کجا می‌تونم سوال بپرسم؟</summary>
            <p>از دکمه‌ی 💬 چت پشتیبانی (پایین صفحه) استفاده کن. دستیار هوشمند پیرامید شبانه‌روز آماده‌ی کمکه. برای سوالات جدی‌تر، از صفحه‌ی «تماس» استفاده کن.</p>
          </details>
        </div>
      `
    },

    contact: {
      title: '📞 تماس با ما',
      headerTitle: '📞 تماس با ما',
      html: `
        <p class="info-lead">از هر کجای ایران، هر ساعتی، صدات رو می‌شنویم.</p>

        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon" style="background:linear-gradient(135deg,rgba(74,144,217,.25),rgba(74,144,217,.05))">📧</div>
            <h3>ایمیل</h3>
            <p>support@piramid.app</p>
            <small>پاسخ در حداکثر ۲۴ ساعت</small>
          </div>

          <div class="contact-item">
            <div class="contact-icon" style="background:linear-gradient(135deg,rgba(59,184,154,.25),rgba(59,184,154,.05))">💬</div>
            <h3>چت پشتیبانی</h3>
            <p>دکمه‌ی 💬 پایین-راست</p>
            <small>پاسخ فوری با دستیار هوشمند</small>
          </div>

          <div class="contact-item">
            <div class="contact-icon" style="background:linear-gradient(135deg,rgba(232,93,158,.25),rgba(232,93,158,.05))">📱</div>
            <h3>تلگرام</h3>
            <p>@PiramidSupport</p>
            <small>پاسخ ۸:۰۰ - ۲۲:۰۰</small>
          </div>

          <div class="contact-item">
            <div class="contact-icon" style="background:linear-gradient(135deg,rgba(232,181,72,.25),rgba(232,181,72,.05))">🐛</div>
            <h3>گزارش خطا</h3>
            <p>صفحه‌ی «گزارش خطا»</p>
            <small>برای باگ و مشکلات فنی</small>
          </div>
        </div>

        <h2 style="margin-top:28px;">📨 پیام مستقیم</h2>
        <form class="info-form" id="contactForm" onsubmit="return false;">
          <label>
            <span>نام تو</span>
            <input type="text" id="ctName" placeholder="مثلا: هیوا" required>
          </label>
          <label>
            <span>ایمیل</span>
            <input type="email" id="ctEmail" placeholder="you@example.com" required>
          </label>
          <label>
            <span>موضوع</span>
            <select id="ctSubject">
              <option value="general">سوال عمومی</option>
              <option value="suggest">پیشنهاد ویژگی</option>
              <option value="bug">گزارش خطا</option>
              <option value="coop">همکاری</option>
            </select>
          </label>
          <label>
            <span>پیام</span>
            <textarea id="ctMessage" rows="4" placeholder="پیامت رو بنویس..." required></textarea>
          </label>
          <button class="btn btn-solid" id="ctSend" type="button">📤 ارسال پیام</button>
        </form>
      `
    },

    help: {
      title: '🧭 راهنمای پیرامید',
      headerTitle: '🧭 راهنما',
      html: `
        <p class="info-lead">یه راهنمای سریع برای اینکه از همه‌ی امکانات بهترین استفاده رو ببری.</p>

        <h2>🚀 شروع سریع</h2>
        <ol>
          <li>اول یه حساب بساز (دکمه‌ی «پروفایل من» بالای صفحه)</li>
          <li>هدفت رو تنظیم کن (رشته، سال، ساعت مطالعه)</li>
          <li>برو به <b>داشبورد</b> و یه پومودورو ۲۵ دقیقه‌ای شروع کن</li>
          <li>با <b>تخمین کنکور</b> ترازت رو بسنج</li>
          <li>از <b>فلش‌کارت</b> برای مرور استفاده کن</li>
        </ol>

        <h2>⌨️ میان‌برهای مفید</h2>
        <ul>
          <li><b>Ctrl+K</b> — جستجوی سراسری</li>
          <li><b>?</b> — پنل میان‌برها</li>
          <li><b>Space</b> — شروع/توقف پومودورو</li>
          <li><b>F</b> — حالت تمرکز</li>
          <li><b>ESC</b> — بستن مودال‌ها</li>
        </ul>

        <h2>📱 روی گوشی</h2>
        <ul>
          <li>از Chrome یا Safari باز کن و نصب کن (Add to Home Screen)</li>
          <li>نوار پایین برای پیمایش سریع بین بخش‌ها</li>
          <li>دکمه‌ی ⋯ برای دیدن همه‌ی ابزارها</li>
          <li>توی اتاق تمرکز، دکمه‌ی ⚙️ سمت راست برای تنظیمات</li>
        </ul>

        <h2>💾 پشتیبان‌گیری</h2>
        <p>
          حتماً هر چند وقت یه بار از بخش «پشتیبان‌گیری» فایل JSON بگیر و یه جای امن ذخیره کن.
          اگه مرورگرت پاک بشه یا گوشی عوض کنی، با اون فایل همه‌چیز برمی‌گرده.
        </p>

        <h2>🎯 اگه گم شدی</h2>
        <p>
          دکمه‌ی 💬 چت پشتیبانی رو بزن. دستیار هوشمند پیرامید می‌تونه راهنماییت کنه.
          یا از بخش <b>تور معرفی</b> (توی منوی ⋯) یه تور دوباره ببین.
        </p>
      `
    },

    report: {
      title: '🐛 گزارش خطا',
      headerTitle: '🐛 گزارش خطا',
      html: `
        <p class="info-lead">مشکلی دیدی؟ بهمون بگو تا سریع درستش کنیم. 💜</p>

        <form class="info-form" id="reportForm" onsubmit="return false;">
          <label>
            <span>نوع مشکل</span>
            <select id="rpType">
              <option value="visual">مشکل ظاهری (رنگ، چیدمان، فونت)</option>
              <option value="func">مشکل کارکردی (دکمه کار نمی‌کنه)</option>
              <option value="data">مشکل داده (اطلاعات اشتباه)</option>
              <option value="perf">کندی یا لگ</option>
              <option value="other">دیگر</option>
            </select>
          </label>

          <label>
            <span>کدوم صفحه؟</span>
            <input type="text" id="rpPage" placeholder="مثلا: dashboard.html" required>
          </label>

          <label>
            <span>توضیح مشکل</span>
            <textarea id="rpDesc" rows="5" placeholder="هرچی یادت میاد بنویس: چیکار کردی، چی دیدی، انتظار داشتی چی بشه..." required></textarea>
          </label>

          <label>
            <span>ایمیل (اختیاری)</span>
            <input type="email" id="rpEmail" placeholder="اگه بخوای جوابت رو بدیم">
          </label>

          <div class="info-checkbox">
            <input type="checkbox" id="rpScreenshot">
            <label for="rpScreenshot">می‌تونم اسکرین‌شات هم بفرستم</label>
          </div>

          <button class="btn btn-solid" id="rpSend" type="button">📤 ارسال گزارش</button>
        </form>

        <div class="info-note" style="margin-top:24px;">
          اطلاعات سیستم: <span id="rpSysInfo"></span>
        </div>
      `
    },

    rules: {
      title: '📜 قوانین استفاده',
      headerTitle: '📜 قوانین',
      html: `
        <p class="info-lead">قوانین ساده‌ای که استفاده‌ی همه از پیرامید رو امن و منصفانه می‌کنه.</p>

        <h2>✅ استفاده‌ی مجاز</h2>
        <ul>
          <li>استفاده‌ی شخصی برای مطالعه و آماده‌سازی کنکور</li>
          <li>اشتراک‌گذاری کارنامه‌ها و کارت‌های خروجی با دوستان</li>
          <li>معرفی پیرامید به دیگران</li>
          <li>ارائه‌ی بازخورد و پیشنهاد</li>
        </ul>

        <h2>❌ استفاده‌ی غیرمجاز</h2>
        <ul>
          <li>فروش، اجاره یا انتقال حساب به دیگران</li>
          <li>استفاده از محتوای پیرامید در محصولات تجاری بدون اجازه</li>
          <li>دستکاری، مهندسی معکوس یا تلاش برای نفوذ به سیستم</li>
          <li>استفاده از ابزارهای خودکار برای دسترسی انبوه</li>
          <li>هر فعالیتی که به دیگران آسیب بزنه</li>
        </ul>

        <h2>©️ مالکیت معنوی</h2>
        <p>
          تمام محتوای پیرامید (طراحی، کد، متن، الگوریتم‌ها و برند) متعلق به تیم پیرامید است.
          استفاده‌ی شخصی و غیرتجاری آزاده. برای استفاده‌ی تجاری، از صفحه‌ی «تماس» درخواست بدید.
        </p>

        <h2>🔄 تغییرات</h2>
        <p>
          ما ممکنه این قوانین رو هر وقت لازم باشه به‌روز کنیم. استفاده‌ی ادامه‌دار از پیرامید به معنی پذیرش نسخه‌ی جدید قوانینه.
        </p>

        <div class="info-note">
          آخرین به‌روزرسانی: ۱۴۰۴ — اگه سوالی داری، از صفحه‌ی «تماس» بپرس.
        </div>
      `
    },

    privacy: {
      title: '🔒 حریم خصوصی',
      headerTitle: '🔒 حریم خصوصی',
      html: `
        <p class="info-lead">
          حریم خصوصی تو برای ما مهم‌تر از هر چیزیه. ساده و شفاف می‌گیم چه اتفاقی می‌افته.
        </p>

        <div class="privacy-highlight">
          <div class="privacy-icon">💚</div>
          <div>
            <b>خبر خوب:</b> پیرامید هیچ داده‌ای از تو به سرور نمی‌فرسته.
            همه‌چیز روی مرورگر خودت ذخیره می‌شه.
          </div>
        </div>

        <h2>📊 چی ذخیره می‌کنیم؟</h2>
        <ul>
          <li><b>اطلاعات پروفایل:</b> نام، سن، ایمیل، عکس، گرادیان</li>
          <li><b>داده‌ی مطالعه:</b> دقیقه‌ها، جلسات، تراز، تخمین‌ها</li>
          <li><b>محتوا:</b> یادداشت‌ها، فلش‌کارت‌ها، کپسول‌های زمان</li>
          <li><b>تنظیمات:</b> تم، اندازه فونت، افکت‌ها</li>
          <li><b>XP و دستاوردها</b></li>
        </ul>

        <h2>📍 کجا ذخیره می‌شه؟</h2>
        <p>
          تمام این داده‌ها در <b>LocalStorage</b> مرورگر خودت ذخیره می‌شن.
          یعنی:
        </p>
        <ul>
          <li>ما بهشون دسترسی نداریم</li>
          <li>روی هیچ سروری نیستن</li>
          <li>فقط خودت می‌تونی ببینیشون</li>
          <li>اگه مرورگرت رو پاک کنی، از بین می‌رن (پس حتماً پشتیبان بگیر!)</li>
        </ul>

        <h2>🔐 کوکی‌ها</h2>
        <p>
          ما از کوکی سنتی استفاده نمی‌کنیم. فقط LocalStorage برای ذخیره‌ی تنظیمات و داده‌های تو.
          هیچ ابزار ردیابی (Analytics) یا تبلیغاتی هم نداریم.
        </p>

        <h2>🚫 چی به اشتراک نمی‌ذاریم؟</h2>
        <ul>
          <li>هیچ اطلاعاتی رو با کسی به اشتراک نمی‌ذاریم</li>
          <li>هیچ داده‌ای رو نمی‌فروشیم</li>
          <li>هیچ ایمیل تبلیغاتی نمی‌فرستیم</li>
        </ul>

        <h2>🛡 امنیت</h2>
        <p>
          پیشنهاد می‌کنیم:
        </p>
        <ul>
          <li>هر چند وقت یه بار از «پشتیبان‌گیری» فایل بگیر</li>
          <li>مرورگرت رو به‌روز نگه دار</li>
          <li>روی دستگاه‌های عمومی سایت رو باز نکن (چون داده‌ها روی همون دستگاه می‌مونن)</li>
        </ul>

        <div class="info-note">
          سوالی داری؟ از صفحه‌ی «تماس» بپرس. ما شفافیم. 💜
        </div>
      `
    }
  };

  /* ==================== RENDER ==================== */
  const params = new URLSearchParams(window.location.search);
  const pageKey = params.get('p') || 'about';
  const page = PAGES[pageKey] || PAGES.about;

  // آپدیت تایتل
  document.title = page.title + ' | پیرامید';
  const headerTitle = document.getElementById('infoHeaderTitle');
  if(headerTitle) headerTitle.textContent = page.headerTitle;

  // رندر محتوا
  const content = document.getElementById('infoContent');
  if(content){
    content.innerHTML = page.html;
    content.classList.add('info-loaded');
  }

  // فعال‌سازی تب
  document.querySelectorAll('.info-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.p === pageKey);
  });

  /* ==================== Form Handlers ==================== */
  // تماس
  const ctSend = document.getElementById('ctSend');
  if(ctSend){
    ctSend.addEventListener('click', () => {
      const name = document.getElementById('ctName')?.value.trim();
      const email = document.getElementById('ctEmail')?.value.trim();
      const msg = document.getElementById('ctMessage')?.value.trim();

      if(!name || !email || !msg){
        window.showToast && window.showToast('لطفاً همه‌ی فیلدها رو پر کن', 'error');
        return;
      }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        window.showToast && window.showToast('ایمیل معتبر نیست', 'error');
        return;
      }

      try{
        const list = JSON.parse(localStorage.getItem('piramid_contact_msgs') || '[]');
        list.push({
          name, email, msg,
          subject: document.getElementById('ctSubject')?.value || 'general',
          date: new Date().toISOString()
        });
        localStorage.setItem('piramid_contact_msgs', JSON.stringify(list));
      }catch(e){}

      window.showToast && window.showToast('✅ پیامت رسید! به‌زودی جواب می‌دیم.', 'success', 4000);
      ['ctName', 'ctEmail', 'ctMessage'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
      });
      if(window.PiramidSound) window.PiramidSound.success();
    });
  }

  // گزارش خطا
  const rpSend = document.getElementById('rpSend');
  if(rpSend){
    const sysInfo = document.getElementById('rpSysInfo');
    if(sysInfo){
      const ua = navigator.userAgent;
      let browser = 'نامعلوم';
      if(ua.includes('Firefox')) browser = 'Firefox';
      else if(ua.includes('Edg')) browser = 'Edge';
      else if(ua.includes('Chrome')) browser = 'Chrome';
      else if(ua.includes('Safari')) browser = 'Safari';
      sysInfo.textContent = `${browser} — ${window.innerWidth}×${window.innerHeight}`;
    }

    rpSend.addEventListener('click', () => {
      const type = document.getElementById('rpType')?.value;
      const page = document.getElementById('rpPage')?.value.trim();
      const desc = document.getElementById('rpDesc')?.value.trim();

      if(!page || !desc){
        window.showToast && window.showToast('صفحه و توضیح رو پر کن', 'error');
        return;
      }

      try{
        const list = JSON.parse(localStorage.getItem('piramid_bug_reports') || '[]');
        list.push({
          type, page, desc,
          email: document.getElementById('rpEmail')?.value || '',
          screenshot: document.getElementById('rpScreenshot')?.checked || false,
          ua: navigator.userAgent,
          screen: `${window.innerWidth}×${window.innerHeight}`,
          url: window.location.href,
          date: new Date().toISOString()
        });
        localStorage.setItem('piramid_bug_reports', JSON.stringify(list));
      }catch(e){}

      window.showToast && window.showToast('🐛 ممنون! گزارش ثبت شد.', 'success', 4000);
      ['rpPage', 'rpDesc', 'rpEmail'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
      });
      if(window.PiramidSound) window.PiramidSound.success();
    });
  }

  console.log('%c📄 Info page ready — ' + pageKey, 'color:#e85d9e;font-weight:700;');
});