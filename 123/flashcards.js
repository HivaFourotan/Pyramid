/* ======================================================================
   PIRAMID — flashcards.js
   سیستم فلش‌کارت با الگوریتم SM-2 (SuperMemo 2)
   ====================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* =================== ابزارها =================== */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const toFa = s => String(s).split('').map(c => '۰۱۲۳۴۵۶۷۸۹'[+c] || c).join('');
  const pad2 = n => String(n).padStart(2, '0');

  const getLS = (k, d) => {
    try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; }
  };
  const setLS = (k, v) => {
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  };

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  };

  /* =================== دسته‌های آماده =================== */
  const STARTER_DECKS = [
    {
      id: 'starter-math',
      icon: '📐',
      name: 'فرمول‌های ریاضی',
      cards: [
        { front: 'مشتق sin(x)', back: 'cos(x)' },
        { front: 'مشتق cos(x)', back: '−sin(x)' },
        { front: 'مشتق tan(x)', back: '1 / cos²(x)' },
        { front: 'مشتق ln(x)', back: '1 / x' },
        { front: 'مشتق eˣ', back: 'eˣ' },
        { front: 'فرمول مساحت دایره', back: 'π × r²' },
        { front: 'فرمول محیط دایره', back: '2 × π × r' },
        { front: 'حجم کره', back: '(4/3) × π × r³' },
        { front: 'مساحت جانبی استوانه', back: '2 × π × r × h' },
        { front: 'فرمول cos(2x)', back: 'cos²x − sin²x' },
        { front: 'فرمول sin(2x)', back: '2 sin(x) cos(x)' },
        { front: 'a² − b² = ?', back: '(a − b)(a + b)' },
        { front: '(a + b)² = ?', back: 'a² + 2ab + b²' },
        { front: 'حد (sin x)/x وقتی x→۰', back: '1' },
        { front: 'مشتق xⁿ', back: 'n·xⁿ⁻¹' }
      ]
    },
    {
      id: 'starter-eng',
      icon: '🔤',
      name: 'لغات انگلیسی',
      cards: [
        { front: 'Abandon', back: 'رها کردن، ترک کردن' },
        { front: 'Benevolent', back: 'خیرخواه، نیکوکار' },
        { front: 'Candid', back: 'صریح، روراست' },
        { front: 'Diligent', back: 'کوشا، ساعی' },
        { front: 'Eloquent', back: 'شیوا، خوش‌بیان' },
        { front: 'Frugal', back: 'صرفه‌جو' },
        { front: 'Gregarious', back: 'اجتماعی، خوش‌مشرب' },
        { front: 'Hostile', back: 'خصمانه، دشمنانه' },
        { front: 'Inevitable', back: 'اجتناب‌ناپذیر، حتمی' },
        { front: 'Jubilant', back: 'شادمان، سرخوش' },
        { front: 'Keen', back: 'مشتاق، تیزهوش' },
        { front: 'Lucid', back: 'روشن، واضح' },
        { front: 'Meticulous', back: 'دقیق، موشکاف' },
        { front: 'Nonchalant', back: 'بی‌خیال، خونسرد' },
        { front: 'Obsolete', back: 'منسوخ، قدیمی' }
      ]
    },
    {
      id: 'starter-arabic',
      icon: '🌙',
      name: 'اصطلاحات عربی',
      cards: [
        { front: 'مبتدأ', back: 'اسمی که جمله با آن شروع می‌شود' },
        { front: 'خبر', back: 'بخشی که مبتدأ را کامل می‌کند' },
        { front: 'فاعل', back: 'انجام‌دهنده‌ی فعل (مرفوع)' },
        { front: 'مفعول به', back: 'گیرنده‌ی فعل (منصوب)' },
        { front: 'جار و مجرور', back: 'حرف جر + اسم مجرور' },
        { front: 'کان و أخواتها', back: 'افعال ناقصه (مبتدأ را مرفوع و خبر را منصوب می‌کنند)' },
        { front: 'إنّ و أخواتها', back: 'حروف مشبهه (مبتدأ را منصوب و خبر را مرفوع می‌کنند)' },
        { front: 'اسم موصول', back: 'الذی، التی، الذین...' },
        { front: 'معرب', back: 'کلمه‌ای که آخرش تغییر می‌کند' },
        { front: 'مبنی', back: 'کلمه‌ای که آخرش ثابت است' }
      ]
    },
    {
      id: 'starter-bio',
      icon: '🧬',
      name: 'اصطلاحات زیست',
      cards: [
        { front: 'میتوکندری', back: 'نیروگاه سلول — تولید ATP' },
        { front: 'ریبوزوم', back: 'محل پروتئین‌سازی' },
        { front: 'هسته', back: 'مرکز کنترل سلول — حاوی DNA' },
        { front: 'کلروپلاست', back: 'محل فتوسنتز در سلول گیاهی' },
        { front: 'DNA', back: 'دئوکسی‌ریبونوکلئیک اسید — ماده‌ی وراثتی' },
        { front: 'ATP', back: 'آدنوزین تری‌فسفات — واحد انرژی سلول' },
        { front: 'میتوز', back: 'تقسیم سلولی برای رشد و ترمیم' },
        { front: 'میوز', back: 'تقسیم کاهشی برای تولید گامت' },
        { front: 'هموگلوبین', back: 'پروتئین حامل اکسیژن در گلبول قرمز' },
        { front: 'انتخاب طبیعی', back: 'بقای سازگارترین‌ها — نظریه داروین' }
      ]
    }
  ];

  /* =================== مدل داده‌ی SM-2 =================== */
  // هر کارت: { id, front, back, interval, ease, due, reps, lapses }
  // interval: روزها تا مرور بعدی
  // ease: فاکتور آسانی (شروع 2.5)
  // due: تاریخ مرور بعدی (YYYY-MM-DD)
  // reps: تعداد مرورهای متوالی
  // lapses: تعداد بارهایی که یادش رفته

  function newCardData(front, back){
    return {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      front, back,
      interval: 0,
      ease: 2.5,
      due: todayKey(),
      reps: 0,
      lapses: 0
    };
  }

  /* =================== ذخیره‌سازی =================== */
  const LS_KEY = 'piramid_flashcards';
  let decks = getLS(LS_KEY, null);

  // بارگذاری اولیه
  if(!decks){
    // اولین بار: دسته‌های آماده رو نصب کن
    decks = STARTER_DECKS.map(d => ({
      id: d.id,
      icon: d.icon,
      name: d.name,
      cards: d.cards.map(c => newCardData(c.front, c.back)),
      createdAt: Date.now()
    }));
    save();
  }

  function save(){ setLS(LS_KEY, decks); }

  /* =================== ابزار SM-2 =================== */
  // rating: 0=دوباره، 1=سخت، 2=خوب، 3=آسون
  function applySM2(card, rating){
    // ease factor
    const q = rating; // 0..3
    // فرمول SM-2 استاندارد با نمره‌ی 0..5 معمولاً:
    // ما نمرات 0..3 رو به 0..5 نگاشت می‌کنیم:
    const map = { 0: 0, 1: 3, 2: 4, 3: 5 };
    const quality = map[rating];

    if(quality < 3){
      // یادش رفته
      card.reps = 0;
      card.lapses = (card.lapses || 0) + 1;
      card.interval = 0; // امروز دوباره
      card.ease = Math.max(1.3, card.ease - 0.2);
    } else {
      card.reps = (card.reps || 0) + 1;
      if(card.reps === 1){
        card.interval = 1;
      } else if(card.reps === 2){
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.ease);
      }
      // آپدیت ease
      const newEase = card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      card.ease = Math.max(1.3, newEase);

      // آسون = بونوس
      if(rating === 3) card.interval = Math.round(card.interval * 1.3);
    }

    // تعیین due
    if(card.interval <= 0){
      card.due = todayKey(); // امروز
    } else {
      const d = new Date();
      d.setDate(d.getDate() + card.interval);
      card.due = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
    }
    return card;
  }

  function isDue(card){
    return card.due <= todayKey();
  }

  function isNew(card){
    return (card.reps || 0) === 0 && (card.lapses || 0) === 0 && card.interval === 0;
  }
function isLearned(card){
  return (card.reps || 0) >= 2 || card.interval >= 6;
}
  function deckStats(deck){
    let due = 0, newC = 0, learned = 0;
    deck.cards.forEach(c => {
      if(isDue(c)) due++;
      if(isNew(c)) newC++;
      if(isLearned(c)) learned++;
    });
    return { total: deck.cards.length, due, new: newC, learned };
  }

  /* =================== DOM =================== */
  const homeView    = $('#fcHomeView');
  const studyView   = $('#fcStudyView');
  const doneView    = $('#fcDoneView');
  const decksBox    = $('#fcDecks');
  const decksEmpty  = $('#fcDecksEmpty');
  const cardEl      = $('#fcCard');
  const frontEl     = $('#fcFrontContent');
  const backEl      = $('#fcBackContent');
  const ratingBox   = $('#fcRating');
  const tapHint     = $('#fcTapHint');
  const progressBar = $('#fcProgressFill');
  const deckNameEl  = $('#fcStudyDeckName');
  const progressEl  = $('#fcStudyProgress');
  const menuEl      = $('#fcMenu');

  /* =================== حالت جاری =================== */
  const state = {
    activeDeckId: null,
    queue: [],
    current: null,
    flipped: false,
    results: { again:0, hard:0, good:0, easy:0 },
    totalToStudy: 0
  };

  /* =================== رندر آمار بالا =================== */
  function renderTopStats(){
    let total = 0, due = 0, newC = 0, learned = 0;
    decks.forEach(d => {
      const s = deckStats(d);
      total += s.total;
      due += s.due;
      newC += s.new;
      learned += s.learned;
    });
    $('#fcStatTotal').textContent = toFa(total);
    $('#fcStatDue').textContent = toFa(due);
    $('#fcStatNew').textContent = toFa(newC);
    $('#fcStatLearned').textContent = toFa(learned);
  }
  function renderDecks(){
  decksBox.innerHTML = '';
  if(decks.length === 0){
    decksEmpty.style.display = 'block';
    return;
  }
  decksEmpty.style.display = 'none';

  decks.forEach(deck => {
    const s = deckStats(deck);
    const total = s.total || 1;

    const learnedPct = Math.round((s.learned / total) * 100);
    const newPct = Math.round((s.new / total) * 100);
    const learningPct = Math.max(0, 100 - learnedPct - newPct);

    const el = document.createElement('div');
    el.className = 'fc-deck glass';
    el.innerHTML =
      '<div class="fc-deck-top">' +
        '<div class="fc-deck-icon">' + (deck.icon || '📘') + '</div>' +
        '<button class="fc-deck-edit" type="button" aria-label="تنظیمات">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">' +
            '<circle cx="12" cy="12" r="1"/>' +
            '<circle cx="12" cy="6" r="1"/>' +
            '<circle cx="12" cy="18" r="1"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="fc-deck-title">' + escapeHtml(deck.name) + '</div>' +
      '<div class="fc-deck-meta">' +
        '<span class="fc-meta-learned">🟢 ' + toFa(s.learned) + '</span>' +
        '<span class="fc-meta-learning">🟡 ' + toFa(total - s.learned - s.new) + '</span>' +
        '<span class="fc-meta-new">⚪ ' + toFa(s.new) + '</span>' +
        '<span style="margin-right:auto;color:var(--faint);font-weight:700;">' + toFa(s.total) + ' کارت</span>' +
      '</div>' +
      '<div class="fc-deck-bar">' +
        '<div class="fc-deck-bar-seg fc-seg-learned" style="width:' + learnedPct + '%"></div>' +
        '<div class="fc-deck-bar-seg fc-seg-learning" style="width:' + learningPct + '%"></div>' +
        '<div class="fc-deck-bar-seg fc-seg-new" style="width:' + newPct + '%"></div>' +
      '</div>';

    el.addEventListener('click', function(e){
      if(e.target.closest('.fc-deck-edit')) return;
      if(e.target.closest('.fc-deck-menu')) return;
      startStudy(deck.id);
    });

    el.querySelector('.fc-deck-edit').addEventListener('click', function(e){
      e.stopPropagation();
      openDeckActionsMenu(deck.id, el);
    });

    decksBox.appendChild(el);
  });
}
  /* =================== شروع تمرین =================== */
  function startStudy(deckId){
    const deck = decks.find(d => d.id === deckId);
    if(!deck) return;

    state.activeDeckId = deckId;
    state.flipped = false;
    state.results = { again:0, hard:0, good:0, easy:0 };

    // ساخت صف: اول کارت‌های due، بعد کارت‌های جدید
    const dueCards   = deck.cards.filter(c => isDue(c) && !isNew(c));
    const newCards   = deck.cards.filter(c => isNew(c));
    const others     = deck.cards.filter(c => !isDue(c) && !isNew(c));

    // ترتیب: due → new → others (اگه هیچ‌کدوم نبود)
    let queue = [...dueCards, ...newCards];
    if(queue.length === 0) queue = [...others];

    state.queue = queue.slice();
    state.totalToStudy = queue.length;

    deckNameEl.textContent = (deck.icon || '📘') + ' ' + deck.name;

    homeView.style.display = 'none';
    studyView.style.display = 'block';
    doneView.style.display = 'none';

    // اگه دسته کاملاً خالیه، مستقیم برو به حالت افزودن کارت
    if(deck.cards.length === 0){
      openCardModal();
      return;
    }

    if(state.queue.length === 0){
      showDone();
      return;
    }
    nextCard();
  }

  function nextCard(){
    if(state.queue.length === 0){
      showDone();
      return;
    }
    state.current = state.queue.shift();
    state.flipped = false;

    const done = state.totalToStudy - state.queue.length - 1;
    progressEl.textContent = `${toFa(done)} / ${toFa(state.totalToStudy)}`;
    progressBar.style.width = `${(done / state.totalToStudy) * 100}%`;

    frontEl.textContent = state.current.front;
    backEl.textContent  = state.current.back;
    cardEl.classList.remove('flipped');
    ratingBox.classList.remove('show');
    tapHint.style.display = 'block';
    tapHint.textContent = 'کارت رو کلیک کن تا جواب رو ببینی 👆';
  }

  function flipCard(){
    if(state.flipped) return;
    state.flipped = true;
    cardEl.classList.add('flipped');
    ratingBox.classList.add('show');
    tapHint.style.display = 'none';
  }

  function rateCard(rating){
    if(!state.flipped || !state.current) return;

    // اعمال SM-2
    const updated = applySM2(state.current, rating);

    // پیدا کردن و جایگزینی در دسته
    const deck = decks.find(d => d.id === state.activeDeckId);
    if(deck){
      const idx = deck.cards.findIndex(c => c.id === updated.id);
      if(idx !== -1) deck.cards[idx] = updated;
    }

    save();
    // XP برای هر کارت
    if(window.PiramidXP){
      window.PiramidXP.add(3);
      window.dispatchEvent(new CustomEvent('piramid:cards', {
        detail:{ count:1 }
      }));
    }
    // ذخیره‌ی نتیجه
    if(rating === 0) state.results.again++;
    else if(rating === 1) state.results.hard++;
    else if(rating === 2) state.results.good++;
    else if(rating === 3) state.results.easy++;

    // اگه "دوباره" زد، به انتهای صف اضافه کن تا دوباره بیاد
    if(rating === 0){
      state.queue.push({...updated, due: todayKey()});
    }

    // نمایش کارت بعدی با انیمیشن
    cardEl.style.transition = 'none';
    cardEl.classList.remove('flipped');
    setTimeout(() => {
      cardEl.style.transition = '';
      nextCard();
    }, 200);
  }

  /* =================== صفحه‌ی پایان =================== */
  function showDone(){
    studyView.style.display = 'none';
    doneView.style.display = 'block';

    const s = state.results;
    const total = s.again + s.hard + s.good + s.easy;
    const statsBox = $('#fcDoneStats');
    statsBox.innerHTML = `
      <div><b>${toFa(total)}</b><span>کل مرور</span></div>
      <div><b>${toFa(s.good + s.easy)}</b><span>یاد گرفته</span></div>
      <div><b>${toFa(s.again)}</b><span>نیاز به مرور</span></div>
    `;
    renderTopStats();
    renderDecks();
  }

  /* =================== بازگشت به خانه =================== */
  function goHome(){
    studyView.style.display = 'none';
    doneView.style.display = 'none';
    homeView.style.display = 'block';
    state.activeDeckId = null;
    state.queue = [];
    state.current = null;
    menuEl.classList.remove('open');
    renderTopStats();
    renderDecks();
  }

  /* =================== مودال دسته‌ی جدید =================== */
  const EMOJIS = ['📘','📗','📙','📕','📐','🧮','🔤','🧬','🌙','🎯','⚗️','🔬','💡','🎨','🌍','📊'];

  function openDeckModal(){
    const modal = $('#fcDeckModal');
    modal.classList.add('open');
    $('#fcDeckName').value = '';
    renderEmojiPick();
  }

  let pickedEmoji = EMOJIS[0];
  function renderEmojiPick(){
    const box = $('#fcEmojiPick');
    box.innerHTML = '';
    EMOJIS.forEach(e => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fc-emoji-opt' + (e === pickedEmoji ? ' active' : '');
      b.textContent = e;
      b.addEventListener('click', () => {
        pickedEmoji = e;
        renderEmojiPick();
      });
      box.appendChild(b);
    });
  }

  function createDeck(){
    const name = ($('#fcDeckName')?.value || '').trim();
    if(!name){
      window.showToast && window.showToast('اسم دسته رو وارد کن', 'error');
      return;
    }
    decks.push({
      id: 'd_' + Date.now(),
      icon: pickedEmoji,
      name,
      cards: [],
      createdAt: Date.now()
    });
    save();
    renderTopStats();
    renderDecks();
    $('#fcDeckModal').classList.remove('open');
    window.showToast && window.showToast('✅ دسته ساخته شد', 'success');
  }

  /* =================== مودال کارت جدید =================== */
  function openCardModal(){
    if(!state.activeDeckId) return;
    $('#fcCardModal').classList.add('open');
    $('#fcCardFront').value = '';
    $('#fcCardBack').value = '';
  }

  function addCard(){
    const front = ($('#fcCardFront')?.value || '').trim();
    const back  = ($('#fcCardBack')?.value || '').trim();
    if(!front || !back){
      window.showToast && window.showToast('سؤال و جواب رو پر کن', 'error');
      return;
    }
    const deck = decks.find(d => d.id === state.activeDeckId);
    if(!deck) return;
    const card = newCardData(front, back);
    deck.cards.push(card);
    save();
    $('#fcCardModal').classList.remove('open');
    window.showToast && window.showToast('✅ کارت اضافه شد', 'success');

    // اگه توی حالت تمرینیم، کارت جدید به صف اضافه بشه
    if(studyView.style.display !== 'none'){
      state.queue.push(card);
      state.totalToStudy++;
    }
  }
function openDeckActionsMenu(deckId, cardEl){
  document.querySelectorAll('.fc-deck-menu').forEach(function(m){ m.remove(); });

  const menu = document.createElement('div');
  menu.className = 'fc-deck-menu glass';
  menu.innerHTML =
    '<button type="button" data-act="add">➕ افزودن کارت</button>' +
    '<button type="button" data-act="reset">♻️ ریست پیشرفت</button>' +
    '<button type="button" data-act="delete" class="danger">🗑 حذف دسته</button>';

  document.body.appendChild(menu);

  const rect = cardEl.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = (rect.top + 60) + 'px';
  menu.style.left = Math.max(12, rect.left + rect.width - 200) + 'px';
  menu.style.zIndex = '2100';

  function close(){
    menu.remove();
    document.removeEventListener('click', outside);
  }
  function outside(ev){
    if(!menu.contains(ev.target)) close();
  }
  setTimeout(function(){
    document.addEventListener('click', outside);
  }, 50);

  menu.querySelectorAll('[data-act]').forEach(function(b){
    b.addEventListener('click', function(){
      const act = b.getAttribute('data-act');
      state.activeDeckId = deckId;

      if(act === 'add'){
        close();
        openCardModal();
      }
      else if(act === 'reset'){
        close();
        if(!confirm('پیشرفت این دسته پاک بشه؟')) return;
        const deck = decks.find(function(d){ return d.id === deckId; });
        if(deck){
          deck.cards = deck.cards.map(function(c){ return newCardData(c.front, c.back); });
          save();
          window.showToast && window.showToast('♻️ ریست شد', 'info');
          renderDecks();
        }
      }
      else if(act === 'delete'){
        close();
        if(!confirm('این دسته کامل حذف بشه؟')) return;
        decks = decks.filter(function(d){ return d.id !== deckId; });
        save();
        window.showToast && window.showToast('🗑 حذف شد', 'info');
        renderDecks();
        renderTopStats();
      }
    });
  });
}
  /* =================== منوی دسته =================== */
  function openDeckMenu(e){
    e.stopPropagation();
    const btn = $('#fcMenuBtn');
    const rect = btn.getBoundingClientRect();
    menuEl.style.top  = (rect.bottom + 8) + 'px';
    menuEl.style.right = (window.innerWidth - rect.right) + 'px';
    menuEl.classList.add('open');
  }
  function closeDeckMenu(){ menuEl.classList.remove('open'); }

  /* =================== بایندها =================== */
  $('#fcNewDeckBtn')?.addEventListener('click', openDeckModal);
  $('#fcStarterBtn')?.addEventListener('click', () => {
    if(decks.length === 0){
      decks = STARTER_DECKS.map(d => ({
        id: d.id,
        icon: d.icon,
        name: d.name,
        cards: d.cards.map(c => newCardData(c.front, c.back)),
        createdAt: Date.now()
      }));
      save();
      renderTopStats();
      renderDecks();
      window.showToast && window.showToast('📚 دسته‌های آماده اضافه شدن', 'success');
    }
  });
  $('#fcCreateDeckBtn')?.addEventListener('click', createDeck);
  $('#fcAddCardBtn')?.addEventListener('click', addCard);
  $('#fcBackBtn')?.addEventListener('click', goHome);
  $('#fcDoneHome')?.addEventListener('click', goHome);
  $('#fcDoneRestart')?.addEventListener('click', () => {
    if(state.activeDeckId) startStudy(state.activeDeckId);
  });
  $('#fcMenuBtn')?.addEventListener('click', openDeckMenu);
  $('#fcMenuAdd')?.addEventListener('click', () => { closeDeckMenu(); openCardModal(); });
  $('#fcMenuReset')?.addEventListener('click', () => {
    closeDeckMenu();
    if(!confirm('پیشرفت این دسته پاک بشه؟')) return;
    const deck = decks.find(d => d.id === state.activeDeckId);
    if(deck){
      deck.cards = deck.cards.map(c => newCardData(c.front, c.back));
      save();
      window.showToast && window.showToast('♻️ پیشرفت ریست شد', 'info');
      goHome();
    }
  });
  $('#fcMenuDelete')?.addEventListener('click', () => {
    closeDeckMenu();
    if(!confirm('این دسته کامل حذف بشه؟')) return;
    decks = decks.filter(d => d.id !== state.activeDeckId);
    save();
    window.showToast && window.showToast('🗑 دسته حذف شد', 'info');
    goHome();
  });

  // کلیک روی کارت
  cardEl?.addEventListener('click', flipCard);

  // دکمه‌های ارزیابی
  $$('.fc-rate-btn').forEach(b => {
    b.addEventListener('click', () => {
      rateCard(parseInt(b.dataset.r, 10));
    });
  });

  // کیبورد
  document.addEventListener('keydown', e => {
    if(studyView.style.display === 'none') return;
    if(e.key === ' ' || e.key === 'Enter'){
      e.preventDefault();
      if(!state.flipped) flipCard();
    } else if(state.flipped){
      if(e.key === '1') rateCard(0);
      else if(e.key === '2') rateCard(1);
      else if(e.key === '3') rateCard(2);
      else if(e.key === '4') rateCard(3);
    }
  });

  // بستن منو با کلیک بیرون
  document.addEventListener('click', e => {
    if(!e.target.closest('#fcMenu') && !e.target.closest('#fcMenuBtn')) closeDeckMenu();
  });

  // مودال‌ها
  $$('[data-close]').forEach(b => {
    b.addEventListener('click', () => {
      const m = document.getElementById(b.dataset.close);
      if(m) m.classList.remove('open');
    });
  });
  $$('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => {
      if(e.target === ov) ov.classList.remove('open');
    });
  });

  /* =================== شروع =================== */
  renderTopStats();
  renderDecks();

  console.log('%c🃏 Piramid Flashcards ready','color:#e85d9e;font-weight:700;');
});