/* ============================================================
   22:22 — ты красивая
   лепестки, часы, сердечки и очень тихий перем-перем
   ============================================================ */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     1. Лепестки на canvas
     ------------------------------------------------------------ */
  const canvas = document.getElementById('petals');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  let petals = [];
  let w = 0, h = 0, dpr = 1, rafId = null;

  function petalShape(c, s, rot, color) {
    c.save();
    c.rotate(rot);
    c.beginPath();
    c.moveTo(0, -s);
    c.bezierCurveTo(s * 0.75, -s * 0.55, s * 0.62, s * 0.6, 0, s);
    c.bezierCurveTo(-s * 0.62, s * 0.6, -s * 0.75, -s * 0.55, 0, -s);
    c.fillStyle = color;
    c.fill();
    c.restore();
  }

  function makePetal(initial) {
    const palette = ['rgba(226,164,172,', 'rgba(240,198,199,', 'rgba(206,128,144,', 'rgba(246,214,208,'];
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : -30 - Math.random() * 120,
      s: 3.2 + Math.random() * 5.6,
      vy: 0.22 + Math.random() * 0.55,
      vx: -0.18 + Math.random() * 0.36,
      rot: Math.random() * Math.PI * 2,
      vr: (-0.01 + Math.random() * 0.02),
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.004 + Math.random() * 0.009,
      swayAmp: 0.24 + Math.random() * 0.6,
      color: palette[(Math.random() * palette.length) | 0],
      alpha: 0.35 + Math.random() * 0.45
    };
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = w < 700 ? 12 : w < 1100 ? 20 : 30;
    while (petals.length < target) petals.push(makePetal(true));
    petals.length = target;
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of petals) {
      p.sway += p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * p.swayAmp;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y - p.s > h + 40 || p.x < -80 || p.x > w + 80) {
        Object.assign(p, makePetal(false));
        p.x = Math.random() * w;
        continue;
      }
      ctx.globalAlpha = p.alpha;
      petalShape(ctx, p.s, p.rot, p.color + '1)');
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  function startPetals() {
    if (!ctx || reduceMotion) return;
    if (ctx instanceof CanvasRenderingContext2D) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (rafId === null) draw();
  }

  if ('ResizeObserver' in window && canvas) {
    new ResizeObserver(() => resize()).observe(canvas);
  }

  if (canvas) {
    resize();
    window.addEventListener('resize', () => {
      const oldW = w, oldH = h;
      resize();
      if (ctx) {
        for (const p of petals) {
          p.x *= w / (oldW || w);
          p.y *= h / (oldH || h);
        }
      }
    }, { passive: true });
    startPetals();
  }

  /* ------------------------------------------------------------
     2. Секрет на 22:22
     ------------------------------------------------------------ */
  const heroTime = document.getElementById('heroTime');
  const secretNote = document.getElementById('secretNote');

  if (heroTime) {
    heroTime.addEventListener('click', () => {
      heroTime.classList.remove('is-secret');
      void heroTime.offsetWidth;
      heroTime.classList.add('is-secret');
      if (secretNote) {
        secretNote.classList.remove('on');
        secretNote.textContent = '(нашёл секрет. ты правда красивая. вот и всё, что я хотел сказать.)';
        void secretNote.offsetWidth;
        secretNote.classList.add('on');
      }
      sparkle(heroTime);
    });
    heroTime.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); heroTime.click(); }
    });
  }

  function sparkle(el) {
    if (reduceMotion) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.textContent = '✿';
      s.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;z-index:70;pointer-events:none;
        font-size:${10 + Math.random() * 12}px;color:rgba(168,84,106,.8);
        transition:transform 1.2s cubic-bezier(.22,.61,.36,1),opacity 1.2s ease;`;
      document.body.appendChild(s);
      const ang = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 170;
      requestAnimationFrame(() => {
        s.style.transform = `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist + 40}px) rotate(${Math.random() * 180 - 90}deg)`;
        s.style.opacity = '0';
      });
      setTimeout(() => s.remove(), 1400);
    }
  }

  /* ------------------------------------------------------------
     3. Часы и обратный отсчёт до 22:22
     ------------------------------------------------------------ */
  const nowTime = document.getElementById('nowTime');
  const nowDate = document.getElementById('nowDate');
  const countdown = document.getElementById('countdown');
  const countdownHint = document.getElementById('countdownHint');

  const pad = (n) => String(n).padStart(2, '0');

  const dateFmt = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const plural = (n, one, few, many) => {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  };

  function tickClock() {
    const now = new Date();
    if (nowTime) nowTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (nowDate) nowDate.textContent = dateFmt.format(now);

    const target = new Date(now);
    target.setHours(22, 22, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const diff = target - now;
    const totalSec = Math.floor(diff / 1000);
    const hh = Math.floor(totalSec / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;

    const isExact = now.getHours() === 22 && now.getMinutes() === 22;
    document.body.classList.toggle('is-exact', isExact);

    if (isExact) {
      if (countdown) countdown.innerHTML = 'сейчас ровно <b>22:22</b>. загадывай — сбудется.';
      if (countdownHint) countdownHint.textContent = 'красивая минута для красивой девочки';
      return;
    }

    const tomorrow = now.getHours() > 22 || (now.getHours() === 22 && now.getMinutes() > 22);
    const when = tomorrow ? 'завтрашнего' : 'сегодняшнего';

    const parts = [];
    if (hh) parts.push(`<b>${hh}</b> ${plural(hh, 'час', 'часа', 'часов')}`);
    if (mm || hh) parts.push(`<b>${pad(mm)}</b> ${plural(mm, 'минута', 'минуты', 'минут')}`);
    parts.push(`<b>${pad(ss)}</b> ${plural(ss, 'секунда', 'секунды', 'секунд')}`);

    if (countdown) countdown.innerHTML = `до ${when} 22:22 — ${parts.join(' ')}`;
    if (countdownHint) countdownHint.textContent = tomorrow ? 'а сегодняшнее уже прошло. но ты всё равно красивая' : 'это время тоже будет твоё';
  }

  tickClock();
  setInterval(tickClock, 1000);

  /* ------------------------------------------------------------
     4. Сердечки
     ------------------------------------------------------------ */
  const heartBtn = document.getElementById('heartBtn');
  const heartCount = document.getElementById('heartCount');
  const heartCaption = document.getElementById('heartCaption');
  const heartsLayer = document.getElementById('hearts');

  const KEY = 'krasivaya-hearts';
  let count = 0;
  try {
    const saved = parseInt(localStorage.getItem(KEY) || '0', 10);
    if (Number.isFinite(saved) && saved > 0) count = saved;
  } catch (e) { /* приватный режим — не страшно */ }

  const captions = [
    'сердечек на сегодня: ноль. это легко исправить',
    'одно есть. нажми ещё — мне не жалко',
    'я предупреждал, что это затягивает',
    'тебе идёт считать сердечки. они все твои',
    'тут уже можно было бы испугаться, но я не буду',
    'окей, у нас проблема: ты красивая, а я считаю',
    'официально самое дорогое сердечко в интернете',
    'это уже почти спорт. ты в форме'
  ];

  function renderHearts() {
    if (heartCount) heartCount.textContent = count;
    if (heartCaption) {
      const i = Math.min(count, captions.length - 1);
      heartCaption.textContent = captions[i];
    }
  }

  function flyHeart(e) {
    if (!heartsLayer || reduceMotion) return;
    const el = document.createElement('span');
    el.className = 'fly';
    el.textContent = ['❤', '❥', '✿', '♥'][(Math.random() * 4) | 0];
    const rect = heartBtn.getBoundingClientRect();
    const baseX = rect.left + rect.width / 2 + (Math.random() * 40 - 20);
    el.style.left = baseX + 'px';
    el.style.color = ['#cf8090', '#a8546a', '#e6b3b8'][(Math.random() * 3) | 0];
    el.style.fontSize = (12 + Math.random() * 14) + 'px';
    el.style.left = baseX - heartsLayer.getBoundingClientRect().left + 'px';
    el.style.bottom = '0px';
    heartsLayer.appendChild(el);

    const drift = Math.random() * 120 - 60;
    const rise = heartsLayer.clientHeight + 120;
    const dur = 2200 + Math.random() * 1600;

    if (typeof el.animate === 'function') {
      el.animate([
        { transform: 'translate(0,0) scale(.6) rotate(0deg)', opacity: 0 },
        { transform: `translate(${drift * .3}px,-${rise * .18}px) scale(1) rotate(8deg)`, opacity: .95, offset: .18 },
        { transform: `translate(${drift}px,-${rise}px) scale(1.1) rotate(-12deg)`, opacity: 0 }
      ], { duration: dur, easing: 'cubic-bezier(.22,.61,.36,1)' });
    } else {
      el.style.transition = `transform ${dur}ms cubic-bezier(.22,.61,.36,1),opacity ${dur}ms ease`;
      requestAnimationFrame(() => {
        el.style.transform = `translate(${drift}px,-${rise}px)`;
        el.style.opacity = '0';
      });
    }

    setTimeout(() => { if (el.isConnected) el.remove(); }, dur + 400);
  }

  if (heartBtn) {
    renderHearts();
    heartBtn.addEventListener('click', () => {
      count += 1;
      try { localStorage.setItem(KEY, String(count)); } catch (e) {}
      renderHearts();
      heartBtn.classList.remove('is-beat');
      void heartBtn.offsetWidth;
      heartBtn.classList.add('is-beat');
      flyHeart();
      chime(1);
    });
  }

  /* ------------------------------------------------------------
     5. Перем-перем: очень тихая музыкальная шкатулка
     ------------------------------------------------------------ */
  const soundBtn = document.getElementById('soundBtn');
  let audioCtx = null;
  let musicOn = false;
  let loopTimer = null;
  let step = 0;

  // нежное арпеджио: Fmaj7 → Am7 → Dm7 → G6
  const chords = [
    [349.23, 440.00, 523.25, 659.25],
    [440.00, 523.25, 659.25, 783.99],
    [293.66, 349.23, 440.00, 587.33],
    [392.00, 493.88, 587.33, 659.25]
  ];

  function tone(freq, time, dur, gainValue, type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function chime(strength) {
    if (!audioCtx || !musicOn) return;
    const t = audioCtx.currentTime;
    tone(1046.5, t, 0.9, 0.05 * (strength || 1), 'triangle');
    tone(1568.0, t + 0.09, 1.2, 0.035 * (strength || 1), 'sine');
    tone(2093.0, t + 0.18, 0.8, 0.02 * (strength || 1), 'sine');
  }

  function playStep() {
    if (!audioCtx || !musicOn) return;
    const chord = chords[Math.floor(step / 4) % chords.length];
    const note = chord[step % 4];
    const t = audioCtx.currentTime + 0.02;

    tone(note, t, 1.6, 0.028, 'sine');
    tone(note * 2, t + 0.01, 0.9, 0.008, 'triangle');

    if (step % 4 === 0) {
      tone(chord[0] / 2, t, 2.2, 0.022, 'sine');
    }
    step += 1;
  }

  function startMusic() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    musicOn = true;
    step = 0;
    playStep();
    clearInterval(loopTimer);
    loopTimer = setInterval(playStep, 520);
    return true;
  }

  function stopMusic() {
    musicOn = false;
    clearInterval(loopTimer);
    loopTimer = null;
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const on = soundBtn.getAttribute('aria-pressed') === 'true';
      if (on) {
        stopMusic();
        soundBtn.setAttribute('aria-pressed', 'false');
        soundBtn.querySelector('.sound__label').textContent = 'перем-перем';
      } else {
        const ok = startMusic();
        if (!ok) return;
        soundBtn.setAttribute('aria-pressed', 'true');
        soundBtn.querySelector('.sound__label').textContent = 'тихо-тихо';
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!audioCtx || !musicOn) return;
      if (document.hidden) audioCtx.suspend();
      else audioCtx.resume();
    });
  }

  /* ------------------------------------------------------------
     6. Появление блоков при скролле
     ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* лёгкий параллакс обложки — только на устройствах с мышью */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const bg = document.querySelector('.hero__bg img');
    const hero = document.querySelector('.hero');
    if (bg && hero) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        bg.style.transform = `scale(1.06) translate3d(${dx * -14}px,${dy * -10}px,0)`;
      });
      hero.addEventListener('mouseleave', () => { bg.style.transform = ''; });
    }
  }

})();
