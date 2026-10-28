/* Direction B · Practice */
(function () {
  const { sessions, workshops, fmt, portrait, week, today } = window.IYL;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { get() { try { return localStorage.getItem('iyl-level'); } catch (e) { return null; } }, set(v) { try { v ? localStorage.setItem('iyl-level', v) : localStorage.removeItem('iyl-level'); } catch (e) { /* private mode */ } } };

  /* Which levels each answer can join */
  const FITS = { new: ['beginners', 'open'], beginners: ['beginners', 'open'], general: ['general', 'open'], intermediate: ['general', 'intermediate', 'open'] };
  const NAMES = { new: 'New to Iyengar yoga', beginners: 'Beginners', general: 'General', intermediate: 'Intermediate' };
  const OUT = {
    new: '<b>Start with a free taster</b>, then the six-week Beginners Course. We’ve filtered the page for you.',
    beginners: '<b>Beginners classes are for you</b>, plus open-level workshops and specialist classes.',
    general: '<b>General classes and most workshops are for you.</b> Thinking of moving up? See your next steps below.',
    intermediate: '<b>Intermediate and General classes are for you</b>, plus the more demanding workshops.',
  };
  let level = store.get();
  if (!FITS[level]) level = null;
  const fits = (x) => !level || (x.kind === 'taster' ? level === 'new' : x.levels.some((l) => FITS[level].includes(l)));

  const state = { day: today, where: 'all' };
  const isFull = (s) => s.full;
  const price = (s) => { const p = s.prices && (s.prices.studio || s.prices.online); return s.free ? 'Free' : p ? `From <b>${fmt.money(p[0])}</b>` : ''; };
  const chips = (s) => [
    s.kind === 'taster' ? '<span class="chip chip-free">Free taster</span>' : '',
    s.kind === 'workshop' ? '<span class="chip chip-work">Workshop</span>' : '',
    s.mode === 'online' ? '<span class="chip chip-live">Livestream</span>' : s.mode === 'hybrid' ? '<span class="chip chip-live">Studio or livestream</span>' : '',
    `<span class="chip">${esc(fmt.level(s.levels))}</span>`,
  ].join('');
  const who = (name) => { const img = portrait(name, '../'); return `<span class="row-who">${img ? `<img src="${img}" alt="" width="24" height="24" loading="lazy">` : `<span class="ini" aria-hidden="true">${esc(name[0])}</span>`}${esc(name)}</span>`; };
  const label = (s) => (isFull(s) ? 'Waiting list' : s.byApplication ? 'Apply' : 'Book');

  /* Up next, in the hero */
  function renderUpNext() {
    const list = sessions.filter((s) => (s.date > today || s.start >= '18:00') && fits(s)).slice(0, 3);
    $('#upnext-title').textContent = level ? `Coming up for ${NAMES[level] === 'New to Iyengar yoga' ? 'you' : NAMES[level]}` : 'Coming up';
    $('#upnext').innerHTML = list.map((s) => `<li class="un"><time>${s.date === today ? fmt.time(s.start) : fmt.dayShort(s.date)}</time><div><b>${esc(s.title)}</b><span>${esc(s.teacher)}${s.mode === 'online' ? ' · Livestream' : ''}</span></div><button type="button" class="btn btn-accent" data-book="${s.id}" aria-label="${label(s)}: ${esc(s.title)}">${label(s)}</button></li>`).join('');
  }

  /* Timetable */
  const days = $('.days');
  function renderDays() {
    days.innerHTML = week.map((d, i) => {
      const n = sessions.filter((s) => s.date === d && fits(s)).length;
      return `<button class="day" role="tab" id="d-${d}" aria-controls="tt-panel" aria-selected="${d === state.day}" tabindex="${d === state.day ? 0 : -1}" data-day="${d}">${i === 0 ? 'Today' : fmt.dayShort(d)}<b>${fmt.dateNum(d)}</b><i aria-label="${n} classes">${Array.from({ length: 5 }, (_, k) => `<span class="${k < Math.ceil(n / 2) ? 'on' : ''}"></span>`).join('')}</i></button>`;
    }).join('');
  }
  function renderList() {
    const rows = sessions.filter((s) => s.date === state.day && fits(s) && (state.where === 'all' || s.mode === state.where || s.mode === 'hybrid'));
    $('#tt-panel').setAttribute('aria-labelledby', 'd-' + state.day);
    $('#tt-panel').innerHTML = rows.length ? rows.map((s) => `<li class="row">
        <div class="row-time"><b>${fmt.time(s.start)}</b><span>${s.duration} min</span></div>
        <div class="row-main"><h3>${esc(s.title)}</h3>${who(s.teacher)}<div class="chips">${chips(s)}</div></div>
        <p class="row-price">${price(s)}</p>
        <button type="button" class="btn ${s.kind === 'class' && s.mode === 'studio' ? 'btn-line' : 'btn-accent'}" data-book="${s.id}" aria-label="${label(s)}: ${esc(s.title)}, ${fmt.time(s.start)}">${label(s)}</button>
      </li>`).join('') : `<li class="row-empty">No ${level ? NAMES[level].toLowerCase() + ' ' : ''}classes on ${fmt.long(state.day)}. Try another day${level ? ' or clear your level' : ''}.</li>`;
    const chip = $('#chip-level');
    chip.hidden = !level;
    if (level) { chip.querySelector('span').textContent = 'Level: ' + NAMES[level]; chip.setAttribute('aria-label', `Showing ${NAMES[level]} classes. Clear level`); }
  }
  days.addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) pick(b); });
  days.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const t = [...days.children]; const i = (t.indexOf(document.activeElement) + (e.key === 'ArrowRight' ? 1 : -1) + t.length) % t.length;
    t[i].focus(); pick(t[i]); e.preventDefault();
  });
  function pick(b) { state.day = b.dataset.day; $$('.day').forEach((x) => { x.setAttribute('aria-selected', x === b); x.tabIndex = x === b ? 0 : -1; }); renderList(); }
  $('.tt-filters .seg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-where]'); if (!b) return;
    state.where = b.dataset.where; $$('[data-where]').forEach((x) => x.setAttribute('aria-pressed', x === b)); renderList();
  });
  $('#chip-level').addEventListener('click', () => setLevel(null));

  /* Your path */
  const countAt = (l) => sessions.filter((s) => s.levels.includes(l) && s.kind === 'class').length;
  const PATHS = {
    new: ['Where to start', 'Three simple steps for anyone new to the Iyengar method.', [
      ['Try a free taster', 'One hour, free, with an expert teacher. Mats and props provided.', 'Next places: Mon 4 January', 't2', 'Book a free taster'],
      ['Take the Beginners Course', 'Six 75-minute sessions for £85, with a year’s membership and two free Beginners classes. £25 if you are under 25.', 'Next course starts Mon 2 November', 'b0', 'Book the course'],
      ['Join a Beginners class', 'Come to any Beginners class, as often as you like. No need to book in the studio.', `${countAt('beginners')} Beginners classes this week`, null, 'See this week'],
    ]],
    beginners: ['Your next steps', 'Build a steady practice at Beginners level.', [
      ['Practise each week', 'Regular practice is what makes progress. At least once a week is ideal.', `${countAt('beginners')} Beginners classes this week`, null, 'See this week'],
      ['Become a member', 'Save on every class and workshop, and book selected events early.', '£60 a year with Autopay', 'm1', 'Join now'],
      ['Explore an open-level workshop', 'Yoga for Stiff Hips with Judy Waldman, in the studio or online.', 'Saturday 5 December', 'w5', 'Book the workshop'],
    ]],
    general: ['Your next steps', 'Deepen your practice at General level.', [
      ['Keep up your General classes', 'More intensive work, a wider variety of asanas and basic pranayama.', `${countAt('general')} General classes this week`, null, 'See this week'],
      ['Prepare to move up', 'Kate Rathod’s workshop for students getting ready for Intermediate classes.', 'Sunday 1 November', 'w2', 'Book the workshop'],
      ['Add pranayama', 'Yogic breathing with Richard Ward, live on Zoom, Friday mornings.', 'Friday 30 October, 8.15am', sessions.find((s) => s.title === 'Pranayama').id, 'Book pranayama'],
    ]],
    intermediate: ['Your next steps', 'For students with an established, independent practice.', [
      ['Intermediate classes', 'Two-hour classes that study each asana in more detail.', `${countAt('intermediate')} Intermediate classes this week`, null, 'See this week'],
      ['Backward Extensions', 'Marco Cannavo’s intermediate workshop, for students with 5+ years of practice.', 'Saturday 31 October', 'w1', 'Book the workshop'],
      ['Twixtmas Intensive', 'Three mornings with Alaric Newcombe to find calm and focus for the new year.', '29 to 31 December', 'w7', 'Book the intensive'],
    ]],
  };
  function renderPath() {
    const [t, lede, steps] = PATHS[level || 'new'];
    $('#path-title').textContent = level ? t : 'Where to start';
    $('#path-lede').textContent = lede;
    $('#path-list').innerHTML = steps.map(([h, p, meta, id, cta]) => `<li class="step"><h3>${esc(h)}</h3><p>${esc(p)}</p><p class="meta">${esc(meta)}</p>${id ? `<button type="button" class="btn btn-accent" data-book="${id}">${esc(cta)}</button>` : `<a class="btn btn-line" href="#week">${esc(cta)}</a>`}</li>`).join('');
    if (window.Motion && !window.Motion.reduced()) requestAnimationFrame(() => $$('.step').forEach((s) => s.classList.add('in')));
  }

  /* Workshops carousel */
  const car = $('#carousel');
  function renderWorkshops() {
    car.innerHTML = workshops.map((w) => {
      const p = w.prices.studio || w.prices.online;
      return `<li class="wcard${fits(w) ? '' : ' dim'}">
        <div class="wcard-img"><img src="../assets/img/${w.img}.webp" alt="" loading="lazy"><p class="wdate"><b>${fmt.dateNum(w.date)}</b><span>${fmt.monShort(w.date)}</span></p></div>
        <div class="wbody"><h3>${esc(w.title)}</h3><p class="who">${esc(w.teacher)} · ${w.series ? esc(w.series) + ' · ' : ''}${fmt.time(w.start)}</p><p>${esc(w.blurb)}</p>
          <div class="chips"><span class="chip">${esc(w.need)}</span>${w.mode === 'hybrid' ? '<span class="chip chip-live">Studio or online</span>' : ''}</div>
          <div class="wfoot"><span>From <b>${fmt.money(p[0])}</b> members</span><button type="button" class="btn btn-accent" data-book="${w.id}" aria-label="Book ${esc(w.title)}">Book</button></div>
        </div></li>`;
    }).join('');
    $('#ws-note').textContent = level ? `Workshops for ${NAMES[level].toLowerCase()} students are highlighted.` : 'In the studio, and some online too. Each is graded by experience.';
    carBtns();
  }
  function carBtns() {
    const max = car.scrollWidth - car.clientWidth - 2;
    $('[data-car="-1"]').disabled = car.scrollLeft <= 2;
    $('[data-car="1"]').disabled = car.scrollLeft >= max;
  }
  $$('[data-car]').forEach((b) => b.addEventListener('click', () => {
    const w = car.querySelector('.wcard').offsetWidth + 16;
    car.scrollBy({ left: Number(b.dataset.car) * w * 2, behavior: window.Motion.reduced() ? 'auto' : 'smooth' });
  }));
  car.addEventListener('scroll', carBtns, { passive: true });

  /* Online */
  $('#online-next').innerHTML = sessions.filter((s) => s.mode !== 'studio' && (s.date > today || s.start >= '12:00')).slice(0, 3).map((s) => `<li class="un"><time>${fmt.dayShort(s.date)}</time><div><b>${esc(s.title)}</b><span>${fmt.time(s.start)} · ${esc(s.teacher)}</span></div><button type="button" class="btn btn-accent" data-book="${s.id}" aria-label="Book ${esc(s.title)} livestream">Book</button></li>`).join('');

  /* Prices toggle */
  const PM = { studio: { visitor: 18.5, member: 14.25, pass: 142.5, id: 'p1' }, online: { visitor: 11, member: 8.5, pass: 85, id: 'p3' } };
  $$('[data-pmode]').forEach((b) => b.addEventListener('click', () => {
    const m = PM[b.dataset.pmode];
    $$('[data-pmode]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    $('[data-p="visitor"]').textContent = fmt.money(m.visitor);
    $('[data-p="member"]').textContent = fmt.money(m.member);
    $('[data-p="pass"]').textContent = fmt.money(m.pass);
    $('[data-p="save"]').textContent = `Save ${Math.round((1 - m.member / m.visitor) * 100)}% on every class`;
    $('[data-p="passbtn"]').dataset.book = m.id;
  }));

  /* Teachers */
  const T = ['Hazel Sainsbury', 'Janette Browne', 'Judy Lynn', 'Khaled Kendsi', 'Sophie Carrington', 'Valentina Salaris', 'Paul Jackson', 'Alaric Newcombe', 'Richard Ward', 'Alexandra Wright'];
  $('#avatars').innerHTML = T.map((n) => `<li><img src="${portrait(n, '../')}" alt="" width="88" height="88" loading="lazy">${esc(n)}</li>`).join('');

  /* Level: the signature */
  function setLevel(v) {
    level = v; store.set(v);
    $$('[data-level]').forEach((b) => b.setAttribute('aria-checked', b.dataset.level === v));
    $('#level-out').innerHTML = v ? OUT[v] : 'Choose one and we’ll tailor the timetable, workshops and next steps on this page.';
    renderUpNext(); renderDays(); renderList(); renderPath(); renderWorkshops();
  }
  $('.level-opts').addEventListener('click', (e) => { const b = e.target.closest('[data-level]'); if (b) setLevel(b.dataset.level === level ? null : b.dataset.level); });
  $('.level-opts').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const b = $$('[data-level]'); const i = (b.indexOf(document.activeElement) + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + b.length) % b.length;
    b[i].focus(); setLevel(b[i].dataset.level); e.preventDefault();
  });
  setLevel(level);

  /* Newsletter */
  $('#news').addEventListener('submit', (e) => {
    e.preventDefault(); const i = $('#nl');
    $('.news-msg').textContent = i.value && i.checkValidity() ? 'You’re on the list. Check your inbox to confirm (prototype: nothing was sent).' : 'Please enter a valid email address.';
  });

  /* Scroll: header edge, sticky filter shadow, stacked cards, tab bar */
  const top = $('.top'), bar = $('.tt-bar'), cards = $$('.card-stack'), tabs = $$('.tabbar a');
  const wide = window.matchMedia('(min-width: 900px)');
  function onFrame() {
    top.classList.toggle('scrolled', window.scrollY > 8);
    bar.classList.toggle('stuck', bar.getBoundingClientRect().top <= 69);
    if (wide.matches) {
      const vh = window.innerHeight;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect(); let b = 0;
        for (let j = i + 1; j < cards.length; j++) b += Math.min(1, Math.max(0, 1 - (cards[j].getBoundingClientRect().top - r.top) / (vh * .7)));
        c.style.setProperty('--behind', b.toFixed(3));
      });
    }
  }
  document.addEventListener('motionframe', onFrame);
  window.addEventListener('scroll', () => { if (window.Motion.reduced()) { top.classList.toggle('scrolled', window.scrollY > 8); } }, { passive: true });
  const secs = tabs.map((a) => $(a.getAttribute('href')));
  const tio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) tabs.forEach((a, i) => a.classList.toggle('on', secs[i] === e.target)); }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => tio.observe(s));
})();
