/* ── CURSOR ── */
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
});
(function trackRing() {
  rx += (mx - rx) * .1; ry += (my - ry) * .1;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(trackRing);
})();
document.querySelectorAll('a,button,.proj-card,.gc-dark,.ach-item,.tc-item,.pc,.ls-frame,.ls-dot').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.classList.add('hov'); ring.classList.add('hov'); });
  el.addEventListener('mouseleave', () => { cur.classList.remove('hov'); ring.classList.remove('hov'); });
});

/* ── CURSOR COLOR ON DARK SECTIONS ── */
const darkObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { cur.classList.add('light'); ring.classList.add('light'); }
    else { cur.classList.remove('light'); ring.classList.remove('light'); }
  });
}, { threshold: 0.2 });
document.querySelectorAll('#about,#skills,#life').forEach(s => darkObs.observe(s));

/* ── HAMBURGER / MOBILE NAV ── */
const hamburger = document.getElementById('navHamburger');
const navMobile = document.getElementById('navMobile');
const navMobileLinks = navMobile.querySelectorAll('a');
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navMobile.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navMobileLinks.forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── MAGNETIC BUTTONS ── */
document.querySelectorAll('.btn-solid,.btn-ghost').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * .28}px,${(e.clientY - (r.top + r.height / 2)) * .28}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ── NAV SCROLL STATE ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 70);
}, { passive: true });

/* ── HERO PARALLAX ── */
const par = document.getElementById('par');
window.addEventListener('scroll', () => {
  if (window.scrollY < window.innerHeight * 1.2)
    par.style.transform = `translateY(${window.scrollY * .28}px)`;
}, { passive: true });

/* ── PHOTO STACK CLICK ── */
document.querySelectorAll('.pc').forEach(card => {
  card.addEventListener('click', () => {
    if (card.classList.contains('active')) { card.classList.remove('active'); return; }
    document.querySelectorAll('.pc').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

/* ── SCROLL REVEAL ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.rev,.rev-l,.rev-r').forEach(el => revObs.observe(el));
document.querySelectorAll('.projects-grid .rev').forEach((el, i) => { el.style.transitionDelay = (i * .1) + 's'; });
document.querySelectorAll('.ach-item.rev').forEach((el, i) => { el.style.transitionDelay = (i * .12) + 's'; });

/* ── TECH CLOUD FILTER ── */
const tcItems = document.querySelectorAll('.tc-item');
const projCards = document.querySelectorAll('.proj-card');
const tcHint = document.querySelector('.tc-hint');
let resetTimer = null;
tcItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    clearTimeout(resetTimer);
    const tech = item.dataset.tech;
    tcHint.classList.add('hidden');
    tcItems.forEach(t => {
      t.classList.remove('active', 'dimmed');
      t.classList.add(t.dataset.tech === tech ? 'active' : 'dimmed');
    });
    projCards.forEach(card => {
      const techs = card.dataset.techs ? card.dataset.techs.split(',').map(s => s.trim()) : [];
      card.classList.remove('highlighted', 'dimmed');
      card.classList.add(techs.includes(tech) ? 'highlighted' : 'dimmed');
    });
  });
  item.addEventListener('click', () => {
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  item.addEventListener('mouseleave', () => {
    resetTimer = setTimeout(() => {
      tcItems.forEach(t => t.classList.remove('active', 'dimmed'));
      projCards.forEach(c => c.classList.remove('highlighted', 'dimmed'));
      tcHint.classList.remove('hidden');
    }, 2500);
  });
});

/* ── PROJECT OVERLAY ── */
const overlay = document.getElementById('projOverlay');
function openOverlay(card) {
  document.getElementById('poNum').textContent = card.dataset.num;
  document.getElementById('poTag').textContent = card.dataset.tag;
  document.getElementById('poTitle').textContent = card.dataset.title;
  document.getElementById('poDesc').textContent = card.dataset.desc;
  document.getElementById('poLinkLabel').textContent = card.dataset.linkLabel;
  document.getElementById('poLink').href = card.dataset.link;
  const stackEl = document.getElementById('poStack');
  stackEl.innerHTML = '';
  card.dataset.stack.split(',').forEach(t => {
    const s = document.createElement('span');
    s.className = 'tech'; s.textContent = t.trim(); stackEl.appendChild(s);
  });
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeOverlay() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}
projCards.forEach(card => card.addEventListener('click', () => openOverlay(card)));
document.getElementById('projBackdrop').addEventListener('click', closeOverlay);
document.getElementById('projClose').addEventListener('click', closeOverlay);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });

/* ── FILM REEL ── */
(function () {
  const TOTAL = 5, ACTIVE_H = 300, INACTIVE_H = 60, GAP_H = 3, WHEEL_THROTTLE = 320;
  let cur = 0, lastWheelTs = 0;
  const lsOuter    = document.getElementById('lsOuter');
  const filmTrack  = document.getElementById('lsFilmTrack');
  const frames     = document.querySelectorAll('.ls-frame');
  const slides     = document.querySelectorAll('.ls-slide');
  const dots       = document.querySelectorAll('.ls-dot');
  const progFill   = document.getElementById('lsProgFill');
  const curNum     = document.getElementById('lsCurNum');
  const spLHoles   = document.getElementById('lsSpL').querySelectorAll('.ls-sp-hole');
  const spRHoles   = document.getElementById('lsSpR').querySelectorAll('.ls-sp-hole');
  const scrollHint = document.getElementById('lsScrollHint');
  const release    = document.getElementById('lsRelease');

  function isMobile() { return window.innerWidth <= 900; }

  function trackOffset(activeIdx) {
    const inner = document.querySelector('.ls-film-inner');
    if (!inner) return 0;
    const innerH = inner.clientHeight;
    const center = Math.max(0, innerH / 2 - ACTIVE_H / 2);
    filmTrack.style.paddingTop = center + 'px';
    filmTrack.style.paddingBottom = center + 'px';
    let offset = 0;
    for (let i = 0; i < activeIdx; i++) offset += INACTIVE_H + GAP_H;
    return offset;
  }

  function goTo(next, dir) {
    if (next === cur || next < 0 || next >= TOTAL) return;
    const prev = cur; cur = next;
    slides[prev].classList.remove('s-active');
    slides[prev].classList.add(dir > 0 ? 's-above' : 's-below');
    slides[cur].classList.remove('s-above', 's-below');
    void slides[cur].offsetWidth;
    slides[cur].classList.add('s-active');
    setTimeout(() => {
      slides[prev].classList.remove('s-above', 's-below');
      slides[prev].classList.add(dir > 0 ? 's-below' : 's-above');
    }, 520);
    frames.forEach((f, i) => {
      f.classList.toggle('ls-active', i === cur);
      f.classList.toggle('ls-inactive', i !== cur);
    });
    if (!isMobile()) {
      setTimeout(() => { filmTrack.style.transform = `translateY(-${trackOffset(cur)}px)`; }, 40);
    }
    const pct = cur === 0 ? 8 : cur === TOTAL - 1 ? 92 : 8 + (cur / (TOTAL - 1)) * 84;
    progFill.style.height = pct + '%';
    curNum.textContent = String(cur + 1).padStart(2, '0');
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    spLHoles.forEach((h, i) => h.classList.toggle('lit', (i + cur) % 2 === 0));
    spRHoles.forEach((h, i) => h.classList.toggle('lit', (i + cur + 1) % 2 === 0));
    if (cur > 0) scrollHint.classList.add('hidden');
    else scrollHint.classList.remove('hidden');
    release.classList.toggle('show', cur === TOTAL - 1);
  }

  /* Mouse zone + accumulator wheel */
  let _mouseX = window.innerWidth / 2;
  document.addEventListener('mousemove', ev => { _mouseX = ev.clientX; });
  let _accumulated = 0, _accumTimer = null;
  lsOuter.addEventListener('wheel', e => {
    if (isMobile()) return;
    const now = Date.now();
    const rect = lsOuter.getBoundingClientRect();
    const relX = _mouseX - rect.left;
    if (relX > rect.width * .70) return;
    const atTop    = cur === 0 && e.deltaY < 0;
    const atBottom = cur === TOTAL - 1 && e.deltaY > 0;
    if (atTop || atBottom) return;
    e.preventDefault();
    _accumulated += e.deltaY;
    clearTimeout(_accumTimer);
    _accumTimer = setTimeout(() => { _accumulated = 0; }, 200);
    if (Math.abs(_accumulated) >= 60 && now - lastWheelTs >= WHEEL_THROTTLE) {
      const dir = _accumulated > 0 ? 1 : -1;
      _accumulated = 0; lastWheelTs = now;
      goTo(cur + dir, dir);
    }
  }, { passive: false });

  /* Touch swipe */
  let touchY0 = 0;
  lsOuter.addEventListener('touchstart', e => { touchY0 = e.touches[0].clientY; }, { passive: true });
  lsOuter.addEventListener('touchend', e => {
    const dy = touchY0 - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 44) goTo(cur + (dy > 0 ? 1 : -1), dy > 0 ? 1 : -1);
  }, { passive: true });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    const rect = lsOuter.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); goTo(cur + 1, 1); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); goTo(cur - 1, -1); }
    }
  });

  /* Dots & frames */
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i, i > cur ? 1 : -1)));
  frames.forEach((f, i) => f.addEventListener('click', () => goTo(i, i > cur ? 1 : -1)));

  /* Init */
  setTimeout(() => {
    filmTrack.style.transition = 'none';
    filmTrack.style.transform = `translateY(-${trackOffset(0)}px)`;
    setTimeout(() => { filmTrack.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)'; }, 60);
  }, 80);

  /* Recalc on resize */
  window.addEventListener('resize', () => {
    if (!isMobile()) filmTrack.style.transform = `translateY(-${trackOffset(cur)}px)`;
  }, { passive: true });
})();

/* ── TERMINAL WORK SECTION REVEAL ── */
(function () {
  const win  = document.getElementById('tmWindow');
  const jobs = [
    document.getElementById('tmJob0'),
    document.getElementById('tmJob1'),
    document.getElementById('tmJob2'),
  ];
  if (!win) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      win.classList.add('in');
      jobs.forEach((job, i) => {
        setTimeout(() => { if (job) job.classList.add('in'); }, 280 + i * 220);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  obs.observe(win);
})();