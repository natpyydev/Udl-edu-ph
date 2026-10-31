(() => {
  const $ = s => document.querySelector(s);

  /* ---------- bokeh ---------- */
  const bokeh = $('#bokeh'), cols = ['#0a84ff','#5ac8fa','#bf5af2','#1e88ff'];
  for (let i = 0; i < 16; i++) {
    const d = document.createElement('div'), s = 40 + Math.random() * 120;
    d.className = 'bk';
    d.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${s}px;height:${s}px;` +
      `background:${cols[i%4]};opacity:${.05+Math.random()*.08};--d:${6+Math.random()*7}s;--dl:-${Math.random()*8}s`;
    bokeh.appendChild(d);
  }

  /* ---------- SFX (synthesized, no files needed) ---------- */
  let ctx, muted = false;
  const ac = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
  function tone(f, t = 0.12, type = 'sine', vol = 0.15, slideTo, delay = 0) {
    if (muted) return;
    try {
      const c = ac(), o = c.createOscillator(), g = c.createGain(), st = c.currentTime + delay;
      o.type = type; o.frequency.setValueAtTime(f, st);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, st + t);
      g.gain.setValueAtTime(vol, st); g.gain.exponentialRampToValueAtTime(0.001, st + t);
      o.connect(g).connect(c.destination); o.start(st); o.stop(st + t + .02);
    } catch (e) {}
  }
  const sfx = {
    click: () => { tone(900, .08, 'triangle', .18, 450); tone(1400, .05, 'sine', .08) },
    hover: () => tone(1200 + Math.random() * 300, .04, 'sine', .04),
    pop:   () => tone(500, .12, 'sine', .2, 1100),
    notif: () => { tone(880, .12, 'sine', .15); tone(1320, .18, 'sine', .15, 0, .1) },
    whoosh:() => tone(200, .5, 'sawtooth', .05, 1800),
    magic: () => [660,880,1100,1320,1760].forEach((f,i)=>tone(f,.25,'sine',.1,0,i*.07)),
    boop:  () => tone(300 + Math.random() * 600, .15, 'square', .06, 100 + Math.random() * 800)
  };
  const rnd = () => { const k = ['pop','boop','magic','notif']; sfx[k[Math.floor(Math.random()*k.length)]](); };

  /* ---------- sparkles ---------- */
  const fx = $('#fx'), emo = ['✨','💎','🍃','💙','⭐','🎓'];
  function sparkle(x, y, n = 6) {
    for (let i = 0; i < n; i++) {
      const e = document.createElement('span'); e.className = 'spark';
      e.textContent = emo[Math.floor(Math.random()*emo.length)];
      e.style.cssText = `left:${x}px;top:${y}px;--x:${(Math.random()-.5)*160}px;--y:${(Math.random()-.5)*160}px;--r:${(Math.random()-.5)*120}deg`;
      fx.appendChild(e); setTimeout(() => e.remove(), 950);
    }
  }

  /* ---------- global tap sfx + sparkles ---------- */
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn3d,.icon-btn');
    if (b) sfx.click(); else { rnd(); sparkle(e.clientX, e.clientY, 4); }
  });
  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'mouse' && e.target.closest('.btn3d,.icon-btn,.seal')) sfx.hover();
  });

  /* ---------- 3D tilt ---------- */
  const tilt = $('#card'), card = tilt.firstElementChild;
  function tiltMove(x, y) {
    const r = tilt.getBoundingClientRect();
    const px = (x - r.left) / r.width - .5, py = (y - r.top) / r.height - .5;
    card.style.transform = `rotateY(${px*16}deg) rotateX(${-py*16}deg)`;
  }
  window.addEventListener('pointermove', e => tiltMove(e.clientX, e.clientY));
  window.addEventListener('pointerleave', () => card.style.transform = '');
  window.addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    card.style.transform = `rotateY(${Math.max(-14,Math.min(14,e.gamma/3))}deg) rotateX(${Math.max(-14,Math.min(14,(e.beta-45)/3))}deg)`;
  });

  /* ---------- music ---------- */
  const music = new Audio('ngiti.mp3');
  music.loop = true; music.preload = 'auto';

  $('#mute').addEventListener('click', () => {
    muted = !muted; music.muted = muted;
    $('#mute').textContent = muted ? '🔇' : '🔊';
  });

  /* ---------- enroll ---------- */
  $('#enroll').addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect();
    sparkle(r.left + r.width/2, r.top + r.height/2, 14);
    sfx.magic(); sfx.whoosh();
    music.play().catch(() => {});
    $('#enroll').textContent = 'Enrolling… 💎';
    $('#enroll').disabled = true;
    setTimeout(() => {
      $('#screen1').classList.remove('active');
      $('#screen2').classList.add('active');
      window.scrollTo(0, 0);
      sfx.pop();
      setTimeout(sfx.notif, 1100);
      setTimeout(sfx.pop, 1800);
    }, 900);
  });
})();
