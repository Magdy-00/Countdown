// =====================================================
// ثوابت
// =====================================================

/** تاريخ بداية العد (لحساب نسبة الحرية) */
const START_DATE = new Date('2025-06-01T00:00:00+03:00');

/** تاريخ التجنيد — 13 أكتوبر 2026 الساعة 12 صباحًا بتوقيت القاهرة */
const TARGET_DATE = new Date('2026-10-13T00:00:00+03:00');

/** الجمل الكوميدية الحزينة */
const QUOTES = [
  '"آخر مرة هتنام فيها لحد الضهر"',
  '"الشعر ده عمره قصير، ودّعه"',
  '"حد يبعتلي ساندوتش قبل ما أمشي"',
  '"الموبايل ده هيبقى ذكرى"',
  '"يا ريت لو الجيش فيه واي فاي"',
  '"هتوحشني يا كنبة"',
  '"آخر مرة هتختار هتلبس إيه"',
  '"مين هيسقي العيال شاي بعدي؟"',
  '"الحرية كانت حلوة، مكنتش حاسس"',
  '"أنا لسه مخلصتش مسلسلي!"',
  '"تخيل تصحى 5 الصبح كل يوم... يا لهوي"',
  '"هيبقى في ناس بتأمرني وأقولها حاضر؟ أنا؟!"',
  '"وداعًا يا أكل البيت، أهلاً يا فول الجيش"',
  '"ربنا يصبّر أمي... وصحابي... وأنا"',
  '"الحمد لله إني عشت كويس... تقريبًا"',
  '"خلاص كده؟ فين باقي العمر؟"',
  '"هل لو قلت مش عايز يخلوني أروّح؟"',
  '"لازم أطبع صورة للتكييف عشان أفتكره"',
];

// =====================================================
// عناصر DOM
// =====================================================
const $days     = document.getElementById('days');
const $hours    = document.getElementById('hours');
const $minutes  = document.getElementById('minutes');
const $seconds  = document.getElementById('seconds');
const $secUnit  = document.getElementById('unit-seconds');
const $countdown = document.getElementById('countdown');
const $quote    = document.getElementById('rotating-quote');
const $moodText = document.getElementById('mood-text');
const $freedomFill = document.getElementById('freedom-fill');
const $freedomPct  = document.getElementById('freedom-pct');
const $shareBtn = document.getElementById('share-btn');
const $mainScreen = document.getElementById('main-screen');
const $endScreen  = document.getElementById('end-screen');

// =====================================================
// حساب العداد
// =====================================================
let prevSeconds = -1;

function updateCountdown() {
  const now  = new Date();
  const diff = TARGET_DATE - now;

  // لو العداد خلص
  if (diff <= 0) {
    showEndScreen();
    return;
  }

  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  $days.textContent    = String(d).padStart(3, '0');
  $hours.textContent   = String(h).padStart(2, '0');
  $minutes.textContent = String(m).padStart(2, '0');
  $seconds.textContent = String(s).padStart(2, '0');

  // Flip animation للثواني
  if (s !== prevSeconds) {
    $secUnit.classList.remove('tick');
    // Force reflow
    void $secUnit.offsetWidth;
    $secUnit.classList.add('tick');
    prevSeconds = s;
  }

  // تحديث المود حسب الأيام المتبقية
  updateMood(d, h);

  // تحديث Progress bar
  updateFreedomBar(now);
}

// =====================================================
// المود والرسالة حسب الوقت
// =====================================================
function updateMood(days, hours) {
  const totalHours = days * 24 + hours;

  if (totalHours <= 24) {
    // آخر 24 ساعة
    $moodText.textContent = '😰 دي آخر ليلة، سيبني أسهر';
    $moodText.style.color = '#e74c3c';
    $countdown.classList.add('panic');
  } else if (days <= 7) {
    // من 7 لـ 2 يوم — ذعر كوميدي
    $moodText.textContent = '🚨 يا نهار أسود، بقى كام يوم بس!';
    $moodText.style.color = '#e74c3c';
    $countdown.classList.add('panic');
  } else if (days <= 30) {
    // من 30 لـ 8 أيام
    $moodText.textContent = '😳 الموضوع بدأ يبقى حقيقي';
    $moodText.style.color = '';
    $countdown.classList.remove('panic');
  } else {
    // أكتر من 30 يوم
    $moodText.textContent = '😌 لسه بدري... بس الفكرة موجودة';
    $moodText.style.color = '';
    $countdown.classList.remove('panic');
  }
}

// =====================================================
// بروجرس بار الحرية
// =====================================================
function updateFreedomBar(now) {
  const total   = TARGET_DATE - START_DATE;
  const elapsed = now - START_DATE;
  let pct = Math.max(0, Math.min(100, ((total - elapsed) / total) * 100));
  pct = Math.round(pct * 10) / 10;

  $freedomFill.style.width = pct + '%';
  $freedomPct.textContent  = pct + '%';
}

// =====================================================
// الجمل الكوميدية الدوّارة
// =====================================================
let quoteIndex = 0;

function rotateQuote() {
  // Fade out
  $quote.classList.add('fade-out');

  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
    $quote.textContent = QUOTES[quoteIndex];
    $quote.classList.remove('fade-out');
  }, 500);
}

// بداية بأول جملة
$quote.textContent = QUOTES[0];
setInterval(rotateQuote, 8000);

// =====================================================
// Checklist + localStorage
// =====================================================
const STORAGE_KEY = 'countdown-checklist';

function initChecklist() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const checkboxes = document.querySelectorAll('#checklist input[type="checkbox"]');

  checkboxes.forEach(cb => {
    const key = cb.getAttribute('data-key');
    if (saved[key]) cb.checked = true;

    cb.addEventListener('change', () => {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      state[key] = cb.checked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    });
  });
}

// =====================================================
// زرار المشاركة
// =====================================================
$shareBtn.addEventListener('click', async () => {
  const shareData = {
    title: 'باقي على الجيش... ⏳',
    text: 'عداد تنازلي لأحلى أيام العمر 🫡 — 13 أكتوبر 2026',
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (e) {
      // المستخدم عمل cancel — مش مشكلة
    }
  } else {
    // Fallback: نسخ الرابط
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('✅ تم نسخ الرابط!');
    } catch {
      // fallback قديم
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast('✅ تم نسخ الرابط!');
    }
  }
});

// =====================================================
// Toast notification
// =====================================================
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 2500);
}

// =====================================================
// شاشة النهاية
// =====================================================
let ended = false;

function showEndScreen() {
  if (ended) return;
  ended = true;

  // وقف العداد عند صفر
  $days.textContent    = '000';
  $hours.textContent   = '00';
  $minutes.textContent = '00';
  $seconds.textContent = '00';
  $freedomFill.style.width = '0%';
  $freedomPct.textContent  = '0%';

  // إظهار شاشة النهاية
  $mainScreen.style.display = 'none';
  $endScreen.classList.remove('hidden');
}

// =====================================================
// تشغيل
// =====================================================
updateCountdown();
setInterval(updateCountdown, 1000);
initChecklist();
