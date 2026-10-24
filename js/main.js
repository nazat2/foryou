/* ============================================================
   MULAI BERSIH — refresh / back selalu mengulang dari awal
   ============================================================ */
(function freshStart(){
  try{ if('scrollRestoration' in history) history.scrollRestoration = 'manual'; }catch(e){}
  window.scrollTo(0, 0);

  // halaman dipulihkan dari cache back/forward (bfcache): state lama ikut terbawa -> muat ulang bersih
  window.addEventListener('pageshow', (e) => {
    if(e.persisted){ window.location.reload(); return; }
    // kalau browser tetap memulihkan scroll setelah load, kembalikan ke atas selama layar Open masih ada
    if(document.documentElement.classList.contains('is-locked')) window.scrollTo(0, 0);
  });
  // jaga-jaga untuk browser yang mengabaikan scrollRestoration (mis. sebagian Safari)
  const toTop = () => { try{ window.scrollTo(0, 0); }catch(e){} };
  window.addEventListener('beforeunload', toTop);
  window.addEventListener('pagehide', toTop);
  // selama layar Open belum ditekan, posisi tidak boleh bergeser dari atas
  window.addEventListener('scroll', () => {
    if(document.documentElement.classList.contains('is-locked') && window.scrollY !== 0) window.scrollTo(0, 0);
  }, { passive: true });
})();

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
  const show = () => { img.style.visibility = ''; };
  img.addEventListener('error', hide, { once: true });
  img.addEventListener('load', show);
  // Gambar loading="lazy" yang belum diunduh sering dilaporkan complete=true & naturalWidth=0
  // (padahal belum rusak) -> jangan disembunyikan, ini yang bikin gif meme sempat "hilang".
  if (img.loading !== 'lazy' && img.complete && img.naturalWidth === 0) hide();
});

const musicWidget = document.getElementById('music-widget');

/* ============================================================
   0.5) SPIDER LOADING INTRO — draws the spider mark in, holds a
        beat, then wipes away to reveal the "Buka" screen beneath.
   ============================================================ */
(function initSpiderLoader(){
  const loader = document.getElementById('spider-loader');
  if(!loader){ document.body.classList.add('intro-done'); return; }

  const pctEl   = document.getElementById('loader-pct');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN_MS  = 2800;   // durasi minimal (selaras dengan animasi logo di CSS)
  const MAX_MS  = 6500;   // batas aman kalau halaman lambat dimuat
  const HOLD_MS = 350;    // jeda sebentar di 100% sebelum layar memudar
  const FADE_MS = reduced ? 300 : 1250;   // = durasi tirai terangkat di CSS

  let loaded = document.readyState === 'complete';
  if(!loaded) window.addEventListener('load', () => { loaded = true; }, { once: true });

  const easeInOut = t => (t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2);
  let shown = 0, done = false;

  function paint(v){
    shown = v;
    loader.style.setProperty('--p', (v / 100).toFixed(3));
    if(pctEl) pctEl.textContent = Math.round(v);
  }

  function finish(){
    if(done) return; done = true;
    setTimeout(() => {
      loader.classList.add('is-done');             // tirai merah terangkat ke atas
      // layar "Open" mulai bergerak saat tirai sudah ~1/3 terangkat -> terasa menyambung
      setTimeout(() => document.body.classList.add('intro-done'), reduced ? 0 : 380);
      setTimeout(() => loader.classList.add('is-hidden'), FADE_MS + 80);
    }, reduced ? 0 : HOLD_MS);
  }

  if(reduced){ paint(100); finish(); return; }

  const t0 = performance.now();
  (function tick(now){
    const el = now - t0;
    let v = easeInOut(Math.min(1, el / MIN_MS)) * 100;
    if(!loaded && el < MAX_MS) v = Math.min(v, 92);  // tahan di 92% sampai halaman siap
    v = Math.max(v, shown);                            // progres nggak pernah mundur
    paint(v);
    if(v >= 100){ finish(); return; }
    requestAnimationFrame(tick);
  })(t0);
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

/* ---- "Charm" foto berbentuk love / bunga (pengganti emoji) ----
   Foto diambil dari images/charm/c1..c8.webp (potongan wajah dari beranda & galeri).
   Mau ganti / tambah foto? Taruh file kotak di images/charm lalu tambahkan namanya di bawah. */
const CHARM_SRC = ['c1','c2','c3','c4','c5','c6','c7','c8'].map((n) => `images/charm/${n}.webp`);
let charmN = Math.floor(Math.random() * CHARM_SRC.length);
function makeCharm(px){
  const el = document.createElement('div');
  el.className = 'pc pc--' + (Math.random() < .55 ? 'heart' : 'flower');
  el.style.width = el.style.height = px.toFixed(0) + 'px';
  const inner = document.createElement('i');          // "cetakan" bentuk (clip-path) + foto yang di-zoom ke wajah
  inner.className = 'pc-in';
  const img = document.createElement('img');
  img.src = CHARM_SRC[charmN++ % CHARM_SRC.length];
  img.alt = ''; img.draggable = false; img.decoding = 'async';
  inner.appendChild(img);
  el.appendChild(inner);
  return el;
}

function spawnWebbits(container, count){
  if(!container) return;
  const frag = document.createDocumentFragment();
  for(let i = 0; i < count; i++){
    const depth0 = Math.random();                    // dekat = besar & jelas, jauh = kecil & samar
    const el = makeCharm((38 + Math.random() * 30) * (0.8 + depth0 * 0.45));
    el.classList.add('webbit', 'is-photo');
    el.setAttribute('aria-hidden', 'true');

    const size   = 14 + Math.random() * 16;          // 14–30px
    const dur    = 14 + Math.random() * 14;          // 14–28s, pelan & halus
    const sway   = 14 + Math.random() * 26;          // simpangan kiri-kanan (px)
    const spin   = (Math.random() < .5 ? -1 : 1) * (6 + Math.random() * 9);   // miring tipis saja, wajah tidak terbalik
    const depth  = depth0;

    el.style.setProperty('--x', (Math.random() * 100).toFixed(1) + 'vw');
    el.style.setProperty('--sway', sway.toFixed(0) + 'px');
    el.style.setProperty('--spin', spin.toFixed(0) + 'deg');
    el.style.setProperty('--o', (0.5 + depth * 0.4).toFixed(2));
    el.style.animationDuration = dur.toFixed(1) + 's';
    el.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's'; // mulai sudah tersebar, tidak menumpuk di atas
    frag.appendChild(el);
  }
  container.appendChild(frag);
}

spawnWebbits(document.getElementById('webbits-container'), window.innerWidth < 600 ? 6 : 10);
spawnWebbits(document.getElementById('webbits-intro'), window.innerWidth < 600 ? 6 : 10);

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
    burstHearts(x, y);
  }

  // percikan 6 hati kecil yang terbang keluar dari titik klik (Web Animations API, ringan)
  const BURST = ['\u2764\uFE0F', '\uD83E\uDD0D', '\uD83C\uDF38'];
  function burstHearts(x, y){
    if(!el_canAnimate()) return;
    for(let i = 0; i < 5; i++){
      const h = makeCharm(30 + Math.random() * 14);
      h.style.cssText += `;position:absolute;left:${x}px;top:${y}px;pointer-events:none;will-change:transform,opacity`;
      layer.appendChild(h);
      const ang = (Math.PI * 2 * i / 5) + Math.random() * .6;
      const dist = 34 + Math.random() * 38;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 18;
      const a = h.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`, opacity: 1, offset: .6 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + 26}px)) scale(.8)`, opacity: 0 }
      ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' });
      a.onfinish = () => h.remove();
    }
  }
  function el_canAnimate(){ return typeof Element.prototype.animate === 'function'; }

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
  if(overlay.classList.contains('hide')) return;          // cegah klik ganda
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // pusat lingkaran penutup = tepat di tombol yang ditekan
  const r = enterBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  overlay.style.setProperty('--cx', cx + 'px');
  overlay.style.setProperty('--cy', cy + 'px');

  // riak cahaya dari tombol
  if(!reducedMotion && overlay.animate){
    const rip = document.createElement('span');
    rip.className = 'enter-ripple';
    rip.style.left = cx + 'px'; rip.style.top = cy + 'px';
    overlay.appendChild(rip);
    rip.animate(
      [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .55 }, { transform: 'translate(-50%,-50%) scale(14)', opacity: 0 }],
      { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' }
    ).onfinish = () => rip.remove();
  }

  overlay.classList.add('hide');
  audio.muted = false;
  audio.play().catch(() => { /* kalau browser tetap nge-block, tombol play di bar tetap bisa dipakai */ });

  // hero mulai masuk saat lingkaran mulai menutup -> halaman "terbuka" dari tepi ke tengah
  setTimeout(() => {
    document.documentElement.classList.remove('is-locked');
    document.body.classList.add('entered');
    window.scrollTo(0, 0);
    if(window.Smooth) Smooth.sync();
    if(window.startReveals) window.startReveals();
    setTimeout(() => document.body.classList.add('hero-ready'), 2600);
  }, reducedMotion ? 0 : 420);
  setTimeout(() => musicWidget.classList.add('visible'), reducedMotion ? 0 : 900);

  // overlay sudah tak terlihat -> buang dari DOM supaya animasinya berhenti total (lebih ringan)
  setTimeout(() => overlay.remove(), reducedMotion ? 500 : 1900);
});

/* ---- Efek halus di layar Open (desktop): cahaya + kedalaman mengikuti mouse ---- */
(function initEnterFx(){
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!fine || reduced) return;

  const glow = document.createElement('div');
  glow.className = 'enter-glow';
  glow.setAttribute('aria-hidden', 'true');
  overlay.insertBefore(glow, overlay.firstChild);

  let gx = window.innerWidth / 2, gy = window.innerHeight / 2, tx = gx, ty = gy, running = false, shown = false;
  const loop = () => {
    gx += (tx - gx) * .1; gy += (ty - gy) * .1;
    glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    if(Math.abs(tx - gx) > .2 || Math.abs(ty - gy) > .2 ) requestAnimationFrame(loop); else running = false;
  };
  overlay.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    overlay.style.setProperty('--px', ((e.clientX / window.innerWidth - .5) * 2).toFixed(3));
    overlay.style.setProperty('--py', ((e.clientY / window.innerHeight - .5) * 2).toFixed(3));
    if(!shown){ shown = true; gx = tx; gy = ty; glow.classList.add('on'); }
    if(!running){ running = true; requestAnimationFrame(loop); }
  }, { passive: true });
})();

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
const statusEl    = document.getElementById('player-status');

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
  statusEl.textContent = isPlaying ? 'Now playing' : 'Paused';
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

function paintSeek(){
  const max = Number(seek.max) || 1;
  seek.parentElement.style.setProperty('--p', Math.min(1, Number(seek.value) / max));
}

audio.addEventListener('timeupdate', () => {
  seek.value = audio.currentTime;
  timeCurrent.textContent = formatTime(audio.currentTime);
  paintSeek();
});

seek.addEventListener('input', () => {
  audio.currentTime = Number(seek.value);
  timeCurrent.textContent = formatTime(audio.currentTime);
  paintSeek();
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

// Reveal baru mulai diamati setelah "Open" ditekan -> semua animasi masuk benar-benar terlihat
window.startReveals = function(){
  if(window.startReveals.done) return;
  window.startReveals.done = true;
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
};

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
      card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
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
  const box = document.getElementById('lightbox');
  if(!box) return;
  const big = document.getElementById('lb-img');
  const count = document.getElementById('lb-count');
  const cards = [...document.querySelectorAll('.foto-card')];
  let idx = 0, startX = null;

  function show(i, dir){
    idx = (i + cards.length) % cards.length;
    const src = cards[idx].querySelector('img').currentSrc || cards[idx].querySelector('img').src;
    big.style.visibility = 'visible';
    big.classList.add('is-loading');
    big.onload  = () => big.classList.remove('is-loading');
    big.onerror = () => big.classList.remove('is-loading');
    big.src = src;
    if(big.complete) big.classList.remove('is-loading');
    count.textContent = `${idx + 1} / ${cards.length}`;
    if(dir && big.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      big.animate([
        { opacity: 0, transform: `translate3d(${dir * 46}px,0,0) scale(.96)` },
        { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }
      ], { duration: 420, easing: 'cubic-bezier(.22,.7,.2,1)' });
    }
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
    if(window.Smooth) Smooth.lock(true);
  }
  function close(){
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(window.Smooth) Smooth.lock(false);
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
  box.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1, -1));
  box.querySelector('.lb-next').addEventListener('click', () => show(idx + 1, 1));
  box.addEventListener('click', (e) => { if(e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if(!box.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') show(idx - 1, -1);
    if(e.key === 'ArrowRight') show(idx + 1, 1);
  });
  box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if(startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    startX = null;
  }, { passive: true });
})();


/* ============================================================
   7) BUNGA — mekar ULANG tiap kali di-scroll ke sini.
      - Masuk layar (>=35% terlihat)  -> animasi mulai dari awal
      - Keluar layar total            -> dijeda (hemat baterai), siap mekar lagi
   ============================================================ */
(function initFlowerBloom(){
  const stage = document.getElementById('flowerStage');
  if(!stage) return;
  const frame = stage.querySelector('iframe');
  let state = 'idle';                       // idle | playing | away

  function send(cmd){
    try{ frame.contentWindow.postMessage({ flower: cmd }, '*'); }catch(_){}
  }

  frame.addEventListener('load', () => { if(state === 'playing') send('restart'); });

  if('IntersectionObserver' in window){
    new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1];
      if(e.intersectionRatio >= 0.35 && state !== 'playing'){
        state = 'playing';
        send('restart');
      } else if(!e.isIntersecting && state === 'playing'){
        state = 'away';
        send('pause');
      }
    }, { threshold: [0, 0.05, 0.2, 0.35, 0.5] }).observe(stage);
  } else {
    state = 'playing'; send('restart');
  }

  document.addEventListener('visibilitychange', () => {
    if(document.hidden) send('pause');
    else if(state === 'playing') send('play');
  });
})();


/* ============================================================
   7) V6 — SPIDER-MAN TELEPORT DI GALERI
      Satu gif muncul di bagian atas foto 1 (jaringnya nempel di garis atas), "poof",
      lalu muncul di foto 2, dst sampai foto 8, terus ngulang.
      Jalan cuma kalau galeri kelihatan di layar.
   ============================================================ */
(function initSpideyHop(){
  const grid = document.getElementById('galeri-grid');
  const hop  = document.getElementById('spidey-hop');
  if(!grid || !hop) return;

  const cards   = [...grid.querySelectorAll('.foto-card')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STAY_MS = 2300;   // lama nongkrong di tiap foto
  const GAP_MS  = 330;    // jeda "menghilang" sebelum muncul di foto berikutnya
  let idx = -1, current = null, timer = null, visible = false;

  function place(card){
    // gif lebar ~78% foto, di tengah atas. Ujung jaring (titik tertinggi gif, y=4 dari 143)
    // dijejerin pas di garis atas foto, jadi jaringnya "nempel" di dalam kotak atas.
    const w = Math.max(120, Math.min(card.offsetWidth * 0.78, 280));
    const s = w / 200;
    hop.style.setProperty('--w', w + 'px');
    hop.style.left = (card.offsetLeft + (card.offsetWidth - w) / 2) + 'px';
    hop.style.top  = (card.offsetTop + 4 - 4 * s) + 'px';
    current = card;
  }

  function poof(){
    hop.classList.remove('poof');
    void hop.offsetWidth;            // restart animasi cincin
    hop.classList.add('poof');
  }

  function nextCard(){
    for(let n = 1; n <= cards.length; n++){
      const c = cards[(idx + n) % cards.length];
      if(c.classList.contains('in-view')){ idx = cards.indexOf(c); return c; }
    }
    return null;                     // belum ada foto yang sudah muncul
  }

  function step(){
    hop.classList.remove('show');    // hilang di foto sekarang
    timer = setTimeout(() => {
      const c = nextCard();
      if(!c){ timer = setTimeout(step, 600); return; }
      place(c);
      if(!reduced) poof();
      hop.classList.add('show');     // muncul di foto berikutnya
      timer = setTimeout(step, STAY_MS);
    }, hop.classList.contains('show') ? GAP_MS : 0);
  }

  function start(){ if(!timer){ step(); } }
  function stop(){ clearTimeout(timer); timer = null; hop.classList.remove('show'); }

  if('IntersectionObserver' in window){
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }, { threshold: 0.2 }).observe(grid);
  } else { start(); }

  document.addEventListener('visibilitychange', () => {
    if(document.hidden) stop(); else if(visible) start();
  });
  let rz; window.addEventListener('resize', () => {
    clearTimeout(rz); rz = setTimeout(() => { if(current) place(current); }, 150);
  });
})();


/* ============================================================
   8) V8 — SMOOTH SCROLL + EFEK SCROLL
      - Smooth scroll berinersia (wheel mouse) buatan sendiri, tanpa library:
        scroll dihaluskan per-frame, bukan lompat tiap "klik" wheel.
      - Di HP / layar sentuh tetap scroll native (paling mulus di sana),
        efek parallax & reveal tetap jalan.
      - Otomatis mati kalau perangkat memilih "kurangi gerakan".
   ============================================================ */
const Smooth = (function(){
  const root    = document.documentElement;
  const fine    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const api = { enabled: fine && !reduced, locked: false, onUpdate: null };

  const SMOOTHNESS  = 9;     // makin besar = makin responsif; makin kecil = makin "melayang"
  const WHEEL_SPEED = 1.1;   // pengali jarak scroll per putaran wheel

  let target = window.scrollY, current = target, raf = 0, last = 0, tween = null;

  const limit = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const clamp = (v) => Math.min(Math.max(v, 0), limit());
  const ease  = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  function frame(t){
    const dt = Math.min(.05, ((t - last) / 1000) || .016);
    last = t;

    if(tween){
      const k = Math.min(1, (t - tween.t0) / tween.dur);
      current = tween.from + (tween.to - tween.from) * ease(k);
      target = current;
      if(k >= 1) tween = null;
    } else {
      const diff = target - current;
      // lerp yang tidak bergantung frame-rate (60Hz / 120Hz sama halusnya)
      current += diff * (1 - Math.exp(-dt * SMOOTHNESS));
      if(Math.abs(target - current) < .25) current = target;
    }

    window.scrollTo(0, current);
    if(api.onUpdate) api.onUpdate();

    if(tween || current !== target){ raf = requestAnimationFrame(frame); }
    else { raf = 0; }
  }
  function start(){ if(!raf){ last = performance.now(); raf = requestAnimationFrame(frame); } }

  function sync(){
    if(raf){ cancelAnimationFrame(raf); raf = 0; }
    tween = null;
    target = current = window.scrollY;
  }

  window.addEventListener('wheel', (e) => {
    if(!api.enabled || api.locked || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
    e.preventDefault();
    if(tween){ tween = null; target = current; }
    let d = e.deltaY;
    if(e.deltaMode === 1) d *= 32;                    // baris -> px
    else if(e.deltaMode === 2) d *= window.innerHeight; // halaman -> px
    target = clamp(target + d * WHEEL_SPEED);
    start();
  }, { passive: false });

  // scroll yang datang dari luar (drag scrollbar, fokus, dll) -> sinkronkan, jangan melawan
  window.addEventListener('scroll', () => {
    if(raf) return;
    current = target = window.scrollY;
  }, { passive: true });
  window.addEventListener('resize', () => { if(!raf) current = target = window.scrollY; });
  window.addEventListener('touchstart', () => { if(tween){ tween = null; } sync(); }, { passive: true });

  // keyboard: panah, PageUp/Down, Space, Home/End ikut dihaluskan
  window.addEventListener('keydown', (e) => {
    if(!api.enabled || api.locked || e.defaultPrevented) return;
    if(e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    const tag = t && t.tagName;
    if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if(e.key === ' ' && t && (tag === 'BUTTON' || t.getAttribute('role') === 'button')) return;

    const vh = window.innerHeight;
    let to = null;
    switch(e.key){
      case 'ArrowDown': to = target + 80; break;
      case 'ArrowUp':   to = target - 80; break;
      case 'PageDown':  to = target + vh * .88; break;
      case 'PageUp':    to = target - vh * .88; break;
      case ' ':         to = target + (e.shiftKey ? -1 : 1) * vh * .88; break;
      case 'Home':      e.preventDefault(); api.to(0);       return;   // lompatan jauh: gerak berdurasi tetap
      case 'End':       e.preventDefault(); api.to(limit()); return;   // (bukan peluruhan eksponensial yang lama di ujung)
      default: return;
    }
    e.preventDefault();
    target = clamp(to);
    start();
  });

  api.to = function(dest, dur){
    const y = typeof dest === 'number'
      ? dest
      : dest.getBoundingClientRect().top + window.scrollY;
    const to = clamp(y);
    const from = window.scrollY;
    if(reduced || Math.abs(to - from) < 2){ window.scrollTo(0, to); sync(); return; }
    current = from;
    tween = { from, to, t0: performance.now(), dur: dur || Math.min(1500, 650 + Math.abs(to - from) * .22) };
    start();
  };
  api.lock = function(v){ api.locked = !!v; if(v) sync(); };
  api.sync = sync;
  api.active = () => !!raf || !!tween;
  return api;
})();
window.Smooth = Smooth;

/* ============================================================
   9) SPLIT KATA — judul muncul kata demi kata (mask naik)
   ============================================================ */
document.querySelectorAll('[data-split]').forEach((el) => {
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', label);
  let n = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((c) => {
      if(c.nodeType === 3){
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((part) => {
          if(!part) return;
          if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'sw';
          w.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span');
          inner.textContent = part;
          inner.style.setProperty('--n', n++);
          w.appendChild(inner);
          frag.appendChild(w);
        });
        c.replaceWith(frag);
      } else if(c.nodeType === 1 && c.tagName !== 'BR'){ walk(c); }
    });
  };
  walk(el);
});

/* ============================================================
   10) SURAT — kata menyala satu per satu mengikuti scroll
   ============================================================ */
const suratCard  = document.querySelector('.surat-card');
const suratWords = [];
if(suratCard){
  suratCard.querySelectorAll('.surat-body').forEach((p) => {
    const text = p.textContent.replace(/\s+/g, ' ').trim();
    p.setAttribute('aria-label', text);
    p.textContent = '';
    text.split(' ').forEach((word, i, arr) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      w.textContent = word;
      p.appendChild(w);
      if(i < arr.length - 1) p.appendChild(document.createTextNode(' '));
      suratWords.push(w);
    });
  });
}
let suratLit = 0;
function paintSurat(on){
  if(!suratWords.length) return;
  on = Math.max(0, Math.min(suratWords.length, on));
  if(on === suratLit) return;
  const [a, b] = on > suratLit ? [suratLit, on] : [on, suratLit];
  for(let i = a; i < b; i++) suratWords[i].classList.toggle('on', i < on);
  suratLit = on;
}

/* ============================================================
   11) UPDATE LOOP SCROLL — satu tempat untuk semua efek scroll
        (progress bar, parallax, kata surat, cue, nav aktif)
   ============================================================ */
(function initScrollEffects(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cue   = document.querySelector('.scroll-cue');
  const bar   = document.getElementById('progress');
  const cornerTL = document.querySelector('.corner-web--tl');
  const cornerBR = document.querySelector('.corner-web--br');
  const auroras  = [...document.querySelectorAll('#aurora i')];

  // --- item parallax: data-speed (+ kolom selang-seling di galeri) ---
  const items = [...document.querySelectorAll('[data-speed]')].map((el) => ({ el, speed: parseFloat(el.dataset.speed) || 0, mid: 0, vis: false }));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { const it = items.find((x) => x.el === en.target); if(it) it.vis = en.isIntersecting; });
    requestUpdate();
  }, { rootMargin: '20% 0px 20% 0px' });
  items.forEach((it) => io.observe(it.el));

  // posisi tengah tiap elemen di dokumen (diukur tanpa pergeseran parallax)
  function measure(){
    items.forEach((it) => {
      const prev = it.el.style.translate;
      it.el.style.translate = 'none';
      const r = it.el.getBoundingClientRect();
      it.mid = r.top + window.scrollY + r.height / 2;
      it.el.style.translate = prev;
    });
  }
  let mt; const remeasure = () => { clearTimeout(mt); mt = setTimeout(() => { measure(); requestUpdate(); }, 120); };
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  if('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);

  const lerpOK = !reduced;
  let ticking = false;

  function update(){
    ticking = false;
    const y  = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const dpr  = window.devicePixelRatio || 1;
    const snap = (v) => (Math.round(v * dpr) / dpr).toFixed(2);   // kelipatan piksel fisik -> foto & teks tetap tajam
    const sr   = suratCard ? suratCard.getBoundingClientRect() : null;   // semua BACA layout dulu, baru TULIS style

    if(bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    if(cue) cue.classList.toggle('gone', y > 60);

    if(lerpOK){
      items.forEach((it) => {
        if(!it.vis) return;
        const d = (it.mid - y) - vh / 2;               // jarak dari tengah layar
        it.el.style.translate = `0 ${snap(d * -it.speed)}px`;
      });
      // dekorasi fixed bergerak sangat pelan -> kesan berlapis
      if(cornerTL) cornerTL.style.translate = `0 ${snap(-y * .05)}px`;
      if(cornerBR) cornerBR.style.translate = `0 ${snap(-y * .035)}px`;
      auroras.forEach((a, i) => { a.style.translate = `0 ${snap(-y * (.03 + i * .018))}px`; });
    }

    // kata surat menyala mengikuti posisi kartu
    if(suratCard && suratWords.length){
      if(reduced){ paintSurat(suratWords.length); }
      else {
        const p = (vh * .88 - sr.top) / (vh * .62);
        paintSurat(Math.round(Math.max(0, Math.min(1, p)) * suratWords.length * 1.08));
      }
    }
  }
  function requestUpdate(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }

  window.addEventListener('scroll', () => { if(!Smooth.active()) requestUpdate(); }, { passive: true });
  Smooth.onUpdate = () => { ticking = false; update(); };
  measure(); update();
  window.Scroller = { update: requestUpdate };

  // hero: hentikan kilau teks saat di luar layar (hemat baterai)
  const hero = document.getElementById('beranda');
  if(hero){
    new IntersectionObserver((e) => hero.classList.toggle('is-off', !e[0].isIntersecting), { threshold: 0 }).observe(hero);
  }
})();

/* ============================================================
   12) SIDE NAV — titik navigasi di kanan (desktop)
   ============================================================ */
(function initSideNav(){
  const nav = document.getElementById('side-nav');
  if(!nav) return;
  const btns = [...nav.querySelectorAll('button')];
  const map = new Map();
  btns.forEach((b) => {
    const sec = document.getElementById(b.dataset.target);
    if(!sec) return;
    map.set(sec, b);
    b.addEventListener('click', () => Smooth.to(b.dataset.target === 'beranda' ? 0 : sec));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if(en.isIntersecting){
        btns.forEach((b) => b.classList.remove('active'));
        map.get(en.target).classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  map.forEach((_, sec) => io.observe(sec));
})();

/* ============================================================
   13) CURSOR GLOW + MAGNETIC BUTTON + SPOTLIGHT KARTU (desktop)
   ============================================================ */
(function initPointerFx(){
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!fine || reduced) return;

  // cahaya mengikuti kursor, dengan sedikit "delay" biar terasa halus
  const glow = document.getElementById('cursor-glow');
  if(glow){
    let gx = 0, gy = 0, tx = 0, ty = 0, running = false, shown = false;
    const loop = () => {
      gx += (tx - gx) * .14; gy += (ty - gy) * .14;
      glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0) translate(-50%, -50%)`;
      if(Math.abs(tx - gx) > .2 || Math.abs(ty - gy) > .2) requestAnimationFrame(loop);
      else running = false;
    };
    window.addEventListener('pointermove', (e) => {
      if(e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY;
      if(!shown){ shown = true; gx = tx; gy = ty; glow.classList.add('on'); }
      if(!running){ running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));
    document.addEventListener('pointerenter', () => { if(shown) glow.classList.add('on'); });
  }

  // tombol "ditarik" pelan ke arah kursor
  document.querySelectorAll('#enter-btn, #play-btn').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * .28;
      const dy = (e.clientY - (r.top + r.height / 2)) * .28;
      btn.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
  });

  // kartu surat: kilau mengikuti kursor
  const card = document.querySelector('.surat-card');
  if(card){
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }
})();

/* ============================================================
   14) HUJAN HATI — sekali, saat bagian penutup muncul
   ============================================================ */
(function initHeartRain(){
  const target = document.querySelector('.bukti-frame');
  const layer  = document.getElementById('click-web-container');
  if(!target || !layer || !target.animate) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const EM = ['\u2764\uFE0F', '\uD83E\uDD0D', '\uD83C\uDF38', '\u2764\uFE0F', '\uD83D\uDC96'];
  const io = new IntersectionObserver((entries) => {
    if(!entries[0].isIntersecting) return;
    io.disconnect();
    const W = window.innerWidth, H = window.innerHeight;
    for(let i = 0; i < 16; i++){
      const x = Math.random() * (W - 70);
      const h = makeCharm(40 + Math.random() * 38);
      h.style.cssText += `;position:absolute;left:${x}px;top:${H + 30}px;pointer-events:none;will-change:transform,opacity`;
      layer.appendChild(h);
      const sway = (Math.random() - .5) * 90;
      const a = h.animate([
        { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 0 },
        { opacity: .95, offset: .12 },
        { transform: `translate3d(${sway}px, ${-H * (.55 + Math.random() * .5)}px, 0) rotate(${(Math.random() - .5) * 50}deg)`, opacity: 0 }
      ], { duration: 3200 + Math.random() * 2600, delay: Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'both' });
      a.onfinish = () => h.remove();
    }
  }, { threshold: .45 });
  io.observe(target);
})();

/* gambar didecode di luar thread utama -> scroll tidak tersendat saat foto muncul */
document.querySelectorAll('img').forEach((img) => { img.decoding = 'async'; });
