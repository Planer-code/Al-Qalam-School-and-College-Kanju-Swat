// Theme (remembers choice; falls back gracefully)
const root = document.documentElement;
try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
document.getElementById('theme-toggle').setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  document.getElementById('theme-toggle').setAttribute('aria-pressed', String(next === 'dark'));
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Bottom bar: sliding indicator + scroll-spy
const links = [...document.querySelectorAll('.bottom-bar a')];
const ind = document.querySelector('.bar-indicator');
const sections = links.map(a => document.querySelector(a.getAttribute('href')));
function moveTo(a) {
  links.forEach(l => { l.classList.toggle('active', l === a); if (l === a) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
  ind.style.width = a.offsetWidth + 'px';
  ind.style.transform = `translateX(${a.offsetLeft}px)`;
}
function spy() {
  const y = window.scrollY + window.innerHeight * 0.35;
  let cur = 0;
  sections.forEach((s, i) => { if (s.offsetTop <= y) cur = i; });
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = sections.length - 1;
  if (!links[cur].classList.contains('active')) moveTo(links[cur]);
}
window.addEventListener('scroll', spy, { passive: true });
window.addEventListener('resize', () => moveTo(links.find(l => l.classList.contains('active')) || links[0]));
window.addEventListener('load', () => { moveTo(links[0]); spy(); });

// Image sliders (hero + gallery), 1.5s auto-change
document.querySelectorAll('.slider').forEach(sl => {
  const track = sl.querySelector('.slider-track');
  const n = track.children.length, dotsBox = sl.querySelector('.s-dots');
  const delay = +sl.dataset.interval || 1500;
  let i = 0, timer, x0 = null;
  for (let k = 0; k < n; k++) { const b = document.createElement('button'); b.setAttribute('aria-label', 'Slide ' + (k + 1)); b.onclick = () => go(k, true); dotsBox.appendChild(b); }
  function go(k, user) {
    i = (k + n) % n;
    track.style.transform = `translateX(-${i * 100}%)`;
    [...dotsBox.children].forEach((d, j) => { d.classList.toggle('on', j === i); d.setAttribute('aria-current', String(j === i)); });
    if (user) restart();
  }
  function restart() { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(i + 1), delay); }
  sl.querySelector('.s-prev').onclick = () => go(i - 1, true);
  sl.querySelector('.s-next').onclick = () => go(i + 1, true);
  sl.addEventListener('mouseenter', () => clearInterval(timer));
  sl.addEventListener('mouseleave', restart);
  sl.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
  sl.addEventListener('touchend', e => { if (x0 !== null) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true); else restart(); } x0 = null; });
  sl.tabIndex = 0;
  sl.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(i + 1, true); if (e.key === 'ArrowLeft') go(i - 1, true); });
  go(0); restart();
});

// Scroll reveal: boxes fade/slide in when they enter the screen (works scrolling down and up)
(function () {
  if (!('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('.hero-text, .hero-image, .director-intro, .sec-title, .feature, .school-moments .grid > div, .staff-card, .more-moments, .picture-card, .contact-info-card, .Addmm, .cta-inner');
  document.documentElement.classList.add('js-reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
  }, { threshold: 0.12 });
  items.forEach((el, k) => { el.classList.add('reveal'); el.style.transitionDelay = (k % 3) * 80 + 'ms'; io.observe(el); });
})();
