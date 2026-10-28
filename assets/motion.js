/* Small scroll layer shared by the three directions.
   - [data-reveal]      gets .in when it enters the viewport
   - [data-parallax=n]  moves at n times the scroll offset from the viewport centre
   - [data-progress]    gets --p from 0 to 1 while it scrolls through (for sticky scenes)
   Nothing moves under prefers-reduced-motion: html.motion is never set, and every
   element is styled to be complete in its resting state. */
(function () {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let items = [], ticking = false, io;

  function measure() {
    items = [...document.querySelectorAll('[data-parallax],[data-progress]')];
  }
  function frame() {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      if (el.dataset.parallax) {
        const k = parseFloat(el.dataset.parallax);
        const off = (r.top + r.height / 2 - vh / 2) * k;
        el.style.setProperty('--py', off.toFixed(1) + 'px');
      }
      if (el.hasAttribute('data-progress')) {
        const span = r.height - vh;
        const p = span > 0 ? -r.top / span : 1 - (r.top + r.height) / (vh + r.height);
        el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
      }
    }
    document.dispatchEvent(new CustomEvent('motionframe'));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  function start() {
    root.classList.add('motion');
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    measure(); frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
  function stop() {
    root.classList.remove('motion');
    if (io) io.disconnect();
    window.removeEventListener('scroll', onScroll);
    measure();
    items.forEach((el) => { el.style.removeProperty('--py'); el.style.setProperty('--p', 1); });
  }
  window.Motion = { refresh() { if (!mq.matches) { measure(); frame(); document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io && io.observe(el)); } }, reduced: () => mq.matches };
  const go = () => (mq.matches ? stop() : start());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  mq.addEventListener('change', () => { stop(); go(); });
})();
