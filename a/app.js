/* Direction A · Alignment */
(function () {
  const { sessions, workshops, tasters, courses, fmt, portrait, week, today, LEVELS } = window.IYL;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Today, in one running line under the title page */
  const nowList = sessions.filter((s) => s.date === today);
  const next = nowList.find((s) => s.start >= '18:00' && s.kind === 'class') || nowList[nowList.length - 1];
  $('#today-line').innerHTML = `<b>Today, ${fmt.long(today)}</b><span class="sep" aria-hidden="true">·</span><span>${nowList.length} classes, from ${fmt.time(nowList[0].start)} to ${fmt.time(nowList[nowList.length - 1].start)}</span><span class="sep" aria-hidden="true">·</span><span>Tonight: ${esc(next.title)} with ${esc(next.teacher)}, ${fmt.time(next.start)}</span><button type="button" class="link-btn" data-book="${next.id}">Book this class</button>`;

  /* Timetable */
  const state = { day: today, where: 'all', level: 'all' };
  const daysEl = $('.tt-days'), listEl = $('.tt-list'), panel = $('.tt-panel');
  daysEl.innerHTML = week.map((d, i) => `<button class="tt-day" role="tab" id="day-${d}" aria-controls="tt-panel" aria-selected="${d === state.day}" tabindex="${d === state.day ? 0 : -1}" data-day="${d}"><small>${i === 0 ? 'Today' : fmt.dayShort(d)}</small><span class="dn">${fmt.dateNum(d)}</span><small>${sessions.filter((s) => s.date === d).length} classes</small></button>`).join('');
  panel.id = 'tt-panel';

  function tags(s) {
    const t = [];
    if (s.kind === 'taster') t.push('<span class="tag tag-free">Free taster</span>');
    if (s.kind === 'workshop') t.push('<span class="tag tag-work">Workshop</span>');
    if (s.mode === 'online') t.push('<span class="tag tag-online">Livestream</span>');
    if (s.mode === 'hybrid') t.push('<span class="tag tag-online">Studio or livestream</span>');
    t.push(`<span class="tag">${esc(fmt.level(s.levels))}</span>`);
    return t.join('');
  }

  function renderList() {
    const rows = sessions.filter((s) => s.date === state.day
      && (state.where === 'all' || s.mode === state.where || s.mode === 'hybrid')
      && (state.level === 'all' || s.levels.includes(state.level) || s.levels.includes('open')));
    panel.setAttribute('aria-labelledby', 'day-' + state.day);
    listEl.innerHTML = rows.length ? rows.map((s) => {
      const img = portrait(s.teacher, '../');
      const label = s.full ? 'Waiting list' : s.byApplication ? 'Apply' : 'Book';
      return `<li class="tt-row">
        <p class="tt-time">${fmt.time(s.start)}<small>${s.duration} min</small></p>
        <div class="tt-what"><b>${esc(s.title)}</b><span><span class="tt-tname">${esc(s.teacher)}</span>${s.note ? '<span class="tt-note">' + esc(s.note) + '</span>' : ''}</span><div class="tt-tags">${tags(s)}</div></div>
        <p class="tt-teacher">${img ? `<img src="${img}" alt="" width="34" height="34" loading="lazy">` : ''}${esc(s.teacher)}</p>
        <button type="button" class="btn ${s.kind === 'class' && s.mode === 'studio' ? 'btn-line' : 'btn-accent'} tt-book" data-book="${s.id}" aria-label="${label}: ${esc(s.title)}, ${fmt.time(s.start)}">${label}</button>
      </li>`;
    }).join('') : `<li class="tt-empty">Nothing matches on ${fmt.long(state.day)}. Try another day or level.</li>`;
  }
  daysEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]'); if (!b) return;
    select(b);
  });
  daysEl.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = [...daysEl.children]; let i = tabs.indexOf(document.activeElement);
    i = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[i].focus(); select(tabs[i]); e.preventDefault();
  });
  function select(b) {
    state.day = b.dataset.day;
    [...daysEl.children].forEach((x) => { x.setAttribute('aria-selected', x === b); x.tabIndex = x === b ? 0 : -1; });
    renderList();
  }
  $('.tt-tools .seg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-where]'); if (!b) return;
    state.where = b.dataset.where;
    b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    renderList();
  });
  $('#tt-level').addEventListener('change', (e) => { state.level = e.target.value; renderList(); });
  renderList();

  /* Begin here */
  $('#taster-dates').innerHTML = tasters.map((t) => `<li><b>${fmt.short(t.date)}</b><span>${fmt.time(t.start)} · ${esc(t.teacher)}</span>${t.full ? '<span class="full">Full</span>' : ''}<button type="button" class="link-btn" data-book="${t.id}">${t.full ? 'Waiting list' : 'Book'}</button></li>`).join('');
  $('#course-dates').innerHTML = courses.map((c) => `<li><b>From ${fmt.short(c.date)}</b><span>${fmt.day(c.date)}s ${fmt.time(c.start)} · ${esc(c.teacher)}</span><button type="button" class="link-btn" data-book="${c.id}">Book</button></li>`).join('');

  /* Workshops, with a sticky picture that follows the index */
  const media = $('.ws-media-inner');
  $('.ws-list').innerHTML = workshops.map((w) => {
    const p = w.prices.studio || w.prices.online;
    return `<li class="ws-item" data-img="${w.img}" data-reveal>
      <p class="ws-date"><b>${fmt.dateNum(w.date)}</b><span>${fmt.monShort(w.date)}</span></p>
      <div class="ws-body">
        <h3>${esc(w.title)}</h3>
        <p class="who">${esc(w.teacher)} · ${esc(fmt.when(w))} · ${fmt.time(w.start)} to ${fmt.time(w.end)}</p>
        <p class="blurb">${esc(w.blurb)}</p>
        <div class="ws-meta"><span class="tag">${esc(w.need)}</span>${w.mode === 'hybrid' ? '<span class="tag tag-online">Studio or livestream</span>' : ''}<span class="price">From <b>${fmt.money(p[0])}</b> members, ${fmt.money(p[1])} visitors</span><button type="button" class="btn btn-accent" data-book="${w.id}" aria-label="Book ${esc(w.title)}">Book</button></div>
      </div></li>`;
  }).join('');
  const imgs = [...new Set(workshops.map((w) => w.img))];
  media.innerHTML = imgs.map((i, n) => `<img src="../assets/img/${i}.webp" alt="" loading="lazy" data-k="${i}"${n === 0 ? ' class="on"' : ''}>`).join('');
  const show = (k) => media.querySelectorAll('img').forEach((im) => im.classList.toggle('on', im.dataset.k === k));
  const wio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) show(e.target.dataset.img); }), { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('.ws-item').forEach((el) => { wio.observe(el); el.addEventListener('mouseenter', () => show(el.dataset.img)); });

  /* Online this week */
  $('#online-list').innerHTML = sessions.filter((s) => s.mode !== 'studio').slice(0, 7).map((s) => `<li><span class="d">${fmt.dayShort(s.date)} ${fmt.dateNum(s.date)}<br>${fmt.time(s.start)}</span><div><b>${esc(s.title)}</b><span>${esc(s.teacher)} · ${s.duration} min</span></div><button type="button" class="btn" data-book="${s.id}" aria-label="Book ${esc(s.title)} livestream, ${fmt.short(s.date)}">Book</button></li>`).join('');

  /* Teachers */
  const faces = ['Hazel Sainsbury', 'Janette Browne', 'Judy Lynn', 'Khaled Kendsi', 'Sophie Carrington', 'Valentina Salaris', 'Paul Jackson', 'Alaric Newcombe'];
  $('#faces').innerHTML = faces.map((n) => `<li data-reveal><img src="${portrait(n, '../')}" alt="" width="200" height="200" loading="lazy">${esc(n)}</li>`).join('');

  /* Newsletter: no data leaves the page in this prototype */
  $('#letter').addEventListener('submit', (e) => {
    e.preventDefault();
    const i = $('#nl-email'), m = $('.letter-msg');
    m.textContent = i.checkValidity() && i.value ? 'Thank you. Please check your inbox to confirm (prototype: nothing was sent).' : 'Please enter a valid email address.';
  });

  /* Folio, floating Book button, and the adjustment */
  const folio = $('#folio'), fb = $('.float-book');
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const cio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) folio.textContent = e.target.dataset.chapter; }), { rootMargin: '-40% 0px -55% 0px' });
  chapters.forEach((c) => cio.observe(c));
  const hero = $('.title-page'), weekEl = $('#week');
  const adj = [...document.querySelectorAll('.adj')];
  adj.forEach((f, i) => { if (i % 2) f.dataset.tilt = 'r'; });
  function tick() {
    const y = window.scrollY, vh = window.innerHeight;
    const wr = weekEl.getBoundingClientRect();
    fb.classList.toggle('show', y > hero.offsetHeight * .7 && !(wr.top < vh && wr.bottom > 0));
    for (const f of adj) {
      const p = parseFloat(f.style.getPropertyValue('--p')) || 0;
      const a = Math.min(1, Math.max(0, (p - 0.08) / 0.36));
      f.style.setProperty('--a', a.toFixed(3));
      const deg = (1 - a) * (f.dataset.tilt === 'r' ? 2.4 : -3);
      const b = f.querySelector('.plumb b');
      if (b) b.textContent = (deg < -0.05 ? '−' : '') + Math.abs(deg).toFixed(1) + '°';
    }
  }
  document.addEventListener('motionframe', tick);
  window.addEventListener('scroll', () => { if (window.Motion.reduced()) fb.classList.toggle('show', window.scrollY > hero.offsetHeight * .7); }, { passive: true });
  window.Motion.refresh();
})();
