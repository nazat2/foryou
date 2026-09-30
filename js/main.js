/* ============================================================
   EDIT DI SINI — info lagu yang tampil di player mengambang
   (file lagunya sendiri ada di /audio/song.mp3)
   ============================================================ */
const SONG_TITLE  = "come on come on";
const SONG_ARTIST = "spidermine";

/* ============================================================
   0) SEMBUNYIIN ICON GAMBAR RUSAK KALAU FILE FOTONYA HILANG
   ============================================================ */
document.querySelectorAll('img').forEach((img) => {
  // Lewati gambar yang src-nya belum diisi (contoh: #lb-img di lightbox),
  // kalau tidak dia akan "disembunyikan" selamanya dan fotonya tampak kosong.
  if (!img.getAttribute('src') || img.id === 'lb-img') return;
  const hide = () => { img.style.visibility = 'hidden'; };
  if (img.complete && img.naturalWidth === 0) {
    hide();
  } else {
    img.addEventListener('error', hide, { once: true });
  }
});

const musicWidget = document.getElementById('music-widget');

/* ============================================================
   0.5) SPIDER LOADING INTRO — draws the spider mark in, holds a
        beat, then wipes away to reveal the "Buka" screen beneath.
   ============================================================ */
(function initSpiderLoader(){
  const loader = document.getElementById('spider-loader');
  if(!loader){ document.body.classList.add('intro-done'); return; }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const holdTime = reduced ? 400 : 2300; // gambar logo (~2.1s) + jeda sebentar
  const fadeTime = reduced ? 300 : 900;

  setTimeout(() => {
    loader.classList.add('is-done');               // layar merah memudar
    document.body.classList.add('intro-done');     // layar "Buka" ikut muncul pelan
    setTimeout(() => loader.classList.add('is-hidden'), fadeTime + 50);
  }, holdTime);
})();

/* ============================================================
   1) FALLING WEB BITS — pengganti bintik bulat "salju".
      Dua bentuk: siluet laba-laba mini & serpihan jaring kecil,
      biar terasa jelas temanya Spider-Man, bukan bokeh polos.
   ============================================================ */
const SPIDER_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="16" cy="13" rx="4.6" ry="5.6" fill="currentColor"/>
  <ellipse cx="16" cy="22" rx="6.4" ry="7.4" fill="currentColor"/>
  <g stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
    <path d="M12 12 L2 6 M12 12 L1 12 M12 14 L2 18 M12 16 L3 24"/>
    <path d="M20 12 L30 6 M20 12 L31 12 M20 14 L30 18 M20 16 L29 24"/>
  </g>
</svg>`;

const WEBFLECK_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
    <path d="M16 2 V30 M2 16 H30 M6 6 L26 26 M26 6 L6 26"/>
    <path d="M16 9 L20 12 L16 16 L12 12 Z"/>
  </g>
</svg>`;

/* Emoji yang jatuh di background: hati putih & merah + bunga.
   Mau ganti? Tinggal edit daftar di bawah (bebas emoji apa aja). */
const FALL_EMOJIS = ['❤️', '🤍', '❤️', '🤍', '🌸', '💮', '🌷', '🤍', '❤️', '🌸'];

function spawnWebbits(container, count){
  if(!container) return;
  const frag = document.createDocumentFragment();
  for(let i = 0; i < count; i++){
    const el = document.createElement('div');
    el.className = 'webbit is-emoji';
    el.textContent = FALL_EMOJIS[Math.floor(Math.random() * FALL_EMOJIS.length)];
    el.setAttribute('aria-hidden', 'true');

    const size   = 14 + Math.random() * 16;          // 14–30px
    const dur    = 14 + Math.random() * 14;          // 14–28s, pelan & halus
    const sway   = 14 + Math.random() * 26;          // simpangan kiri-kanan (px)
    const spin   = (Math.random() < .5 ? -1 : 1) * (10 + Math.random() * 22);
    const depth  = Math.random();                    // dekat = besar & jelas, jauh = kecil & samar

    el.style.setProperty('--x', (Math.random() * 100).toFixed(1) + 'vw');
    el.style.setProperty('--sway', sway.toFixed(0) + 'px');
    el.style.setProperty('--spin', spin.toFixed(0) + 'deg');
    el.style.setProperty('--o', (0.25 + depth * 0.5).toFixed(2));
    el.style.fontSize = (size * (0.75 + depth * 0.5)).toFixed(1) + 'px';
    el.style.animationDuration = dur.toFixed(1) + 's';
    el.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's'; // mulai sudah tersebar, tidak menumpuk di atas
    frag.appendChild(el);
  }
  container.appendChild(frag);
}

spawnWebbits(document.getElementById('webbits-container'), window.innerWidth < 600 ? 9 : 15);
spawnWebbits(document.getElementById('webbits-intro'), window.innerWidth < 600 ? 9 : 15);

/* ============================================================
   1.5) CLICK / TAP WEB SPLAT — small web-hit mark wherever the
        user clicks or taps, pure decoration, ignores form controls.
   ============================================================ */
const CLICK_WEB_SVG = `<svg viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M23 2 V44 M2 23 H44 M8 8 L38 38 M38 8 L8 38"/>
    <circle cx="23" cy="23" r="8" />
    <circle cx="23" cy="23" r="15" opacity="0.5"/>
  </g>
</svg>`;

(function initClickWeb(){
  const layer = document.getElementById('click-web-container');
  if(!layer) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) return;

  const skipSelector = 'input, button, a, textarea, select, label';

  function spawnAt(x, y){
    const el = document.createElement('div');
    el.className = 'click-web';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.innerHTML = CLICK_WEB_SVG;
    layer.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  document.addEventListener('pointerdown', (e) => {
    if(e.target.closest(skipSelector)) return;
    spawnAt(e.clientX, e.clientY);
  });
})();

/* ============================================================
   2) ENTER OVERLAY — buka gerbang kota + nyalain lagu
      (lagu autoplay begitu tombol ditekan, lalu loop terus)
   ============================================================ */
const overlay  = document.getElementById('enter-overlay');
const enterBtn = document.getElementById('enter-btn');
const audio    = document.getElementById('audio');

enterBtn.addEventListener('click', () => {
  overlay.classList.add('hide');
  audio.muted = false;
  audio.play().catch(() => { /* kalau browser tetap nge-block, tombol play di bar tetap bisa dipakai */ });
  musicWidget.classList.add('visible');
});

/* ============================================================
   3) MUSIC PLAYER UI
   ============================================================ */
const playBtn     = document.getElementById('play-btn');
const iconPlay    = document.getElementById('icon-play');
const iconPause   = document.getElementById('icon-pause');
const seek        = document.getElementById('seek');
const timeCurrent = document.getElementById('time-current');
const timeDuration= document.getElementById('time-duration');
const titleEl     = document.getElementById('player-title');
const artistEl    = document.getElementById('player-artist');

titleEl.textContent  = SONG_TITLE;
artistEl.textContent = SONG_ARTIST;

function formatTime(sec){
  if(!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function setPlayingIcon(isPlaying){
  iconPlay.style.display  = isPlaying ? 'none' : 'block';
  iconPause.style.display = isPlaying ? 'block' : 'none';
  musicWidget.classList.toggle('playing', isPlaying);
}

playBtn.addEventListener('click', () => {
  if(audio.paused){ audio.play().catch(()=>{}); } else { audio.pause(); }
});

audio.addEventListener('play',  () => setPlayingIcon(true));
audio.addEventListener('pause', () => setPlayingIcon(false));

audio.addEventListener('loadedmetadata', () => {
  seek.max = audio.duration || 0;
  timeDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  seek.value = audio.currentTime;
  timeCurrent.textContent = formatTime(audio.currentTime);
});

seek.addEventListener('input', () => {
  audio.currentTime = Number(seek.value);
});

audio.addEventListener('error', () => {
  console.warn('Lagu belum ketemu di audio/song.mp3.');
});

/* ============================================================
   4) SCROLL-REVEAL
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   5) PARALLAX + TILT — mosaic beranda (translate) & kartu galeri
      (tilt 3D), desktop / mouse only. Dibikin lebih terasa dari
      versi sebelumnya biar nggak berasa datar.
   ============================================================ */
if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
  // -- mosaic parallax (beranda) --
  const items = document.querySelectorAll('.mosaic-item');
  let ticking = false;
  let lastX = 0, lastY = 0;

  function applyParallax(){
    items.forEach((el, i) => {
      const depth = (i % 3 + 1) * 7; // was *4 — punya kesan lebih dalam sekarang
      el.style.setProperty('--px', `${lastX * depth}px`);
      el.style.setProperty('--py', `${lastY * depth}px`);
    });
    ticking = false;
  }

  const berandaEl = document.getElementById('beranda');
  if(berandaEl){
    berandaEl.addEventListener('mousemove', (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      lastX = (e.clientX / w - 0.5) * 2;
      lastY = (e.clientY / h - 0.5) * 2;
      if(!ticking){
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    });
  }

  // -- 3D tilt on gallery cards --
  const TILT_MAX_DEG = 10;
  document.querySelectorAll('.foto-card').forEach((card) => {
    let rafPending = false;
    let rx = 0, ry = 0;

    function apply(){
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
      rafPending = false;
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;  // 0..1
      const py = (e.clientY - rect.top) / rect.height;   // 0..1
      ry = (px - 0.5) * 2 * TILT_MAX_DEG;
      rx = -(py - 0.5) * 2 * TILT_MAX_DEG;
      if(!rafPending){ requestAnimationFrame(apply); rafPending = true; }
    });

    card.addEventListener('mouseleave', () => {
      rx = 0; ry = 0;
      requestAnimationFrame(apply);
    });
  });
}

/* ============================================================
   6) V4 — progress scroll + lightbox foto (tap foto = perbesar,
      geser kiri/kanan atau panah keyboard buat ganti, Esc = tutup)
   ============================================================ */
(function initV4(){
  const bar = document.getElementById('progress');
  if(bar){
    let queued = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      queued = false;
    };
    window.addEventListener('scroll', () => {
      if(!queued){ requestAnimationFrame(update); queued = true; }
    }, { passive: true });
    update();
  }

  const box = document.getElementById('lightbox');
  if(!box) return;
  const big = document.getElementById('lb-img');
  const count = document.getElementById('lb-count');
  const cards = [...document.querySelectorAll('.foto-card')];
  let idx = 0, startX = null;

  function show(i){
    idx = (i + cards.length) % cards.length;
    const src = cards[idx].querySelector('img').currentSrc || cards[idx].querySelector('img').src;
    big.style.visibility = 'visible';
    big.classList.add('is-loading');
    big.onload  = () => big.classList.remove('is-loading');
    big.onerror = () => big.classList.remove('is-loading');
    big.src = src;
    if(big.complete) big.classList.remove('is-loading');
    count.textContent = `${idx + 1} / ${cards.length}`;
    // preload tetangga biar geser foto terasa instan
    [idx + 1, idx - 1].forEach(n => {
      const im = new Image();
      im.src = cards[(n + cards.length) % cards.length].querySelector('img').src;
    });
  }
  function open(i){
    show(i);
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach((card, i) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Perbesar foto ${i + 1}`);
    card.addEventListener('click', () => open(i));
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(i); }
    });
  });

  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
  box.addEventListener('click', (e) => { if(e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if(!box.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') show(idx - 1);
    if(e.key === 'ArrowRight') show(idx + 1);
  });
  box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if(startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
})();


/* ============================================================
   7) BUNGA — jalan hanya saat terlihat di layar.
      Di luar layar, animasi bunga dijeda; saat bunga tampil,
      hiasan background (aurora & emoji) diredam. Hasilnya tidak ngelag.
   ============================================================ */
(function initFlowerPerf(){
  const stage  = document.getElementById('flowerStage');
  if(!stage) return;
  const frame  = stage.querySelector('iframe');
  let visible  = false;

  function send(){
    try{ frame.contentWindow.postMessage({ flower: visible ? 'play' : 'pause' }, '*'); }catch(_){}
  }
  function set(v){
    visible = v;
    document.body.classList.toggle('flower-active', v);
    send();
  }

  frame.addEventListener('load', send);   // iframe baru selesai load -> kirim status terkini

  if('IntersectionObserver' in window){
    new IntersectionObserver((entries) => {
      set(entries[entries.length - 1].isIntersecting);
    }, { threshold: 0.05 }).observe(stage);
  } else {
    set(true);
  }

  // tab disembunyikan -> jeda juga
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) frame.contentWindow && frame.contentWindow.postMessage({ flower: 'pause' }, '*');
    else send();
  });
})();
