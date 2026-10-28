/* Direction C · Lineage */
(function () {
  const { sessions, workshops, tasters, courses, fmt, portrait, week, today } = window.IYL;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Full-screen menu */
  const menu = $('#menu');
  $('.menu-btn').addEventListener('click', () => menu.showModal());
  $('.menu-close').addEventListener('click', () => menu.close());
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) menu.close(); });

  /* The statement lights word by word */
  const say = $('#say');
  const words = say.textContent.trim().split(/\s+/);
  const HL = ['every', 'penny', 'everyone.'];
  say.innerHTML = words.map((w, i) => `<span class="w${HL.includes(w) ? ' hl' : ''}" style="--i:${i}">${esc(w)}</span>`).join(' ');
  say.style.setProperty('--n', words.length);

  /* Timetable */
  const state = { day: today, where: 'all' };
  const days = $('.tt-days'), agenda = $('#agenda');
  days.innerHTML = week.map((d, i) => `<button class="tt-day" role="tab" id="cd-${d}" aria-controls="agenda" aria-selected="${d === today}" tabindex="${d === today ? 0 : -1}" data-day="${d}">${i === 0 ? 'Today' : fmt.dayShort(d)}<b>${fmt.dateNum(d)}</b></button>`).join('');
  function render() {
    const rows = sessions.filter((s) => s.date === state.day && (state.where === 'all' || s.mode === state.where || s.mode === 'hybrid'));
    agenda.setAttribute('aria-labelledby', 'cd-' + state.day);
    agenda.innerHTML = rows.length ? rows.map((s) => {
      const img = portrait(s.teacher, '../');
      const tags = [
        s.kind === 'taster' ? '<span class="free">Free taster</span>' : '',
        s.kind === 'workshop' ? '<span class="work">Workshop</span>' : '',
        s.mode === 'online' ? '<span class="live">Livestream</span>' : s.mode === 'hybrid' ? '<span class="live">Studio + livestream</span>' : '<span>Studio</span>',
        `<span>${esc(fmt.level(s.levels))}</span>`,
      ].join('');
      const label = s.full ? 'Waiting list' : s.byApplication ? 'Apply' : 'Book';
      return `<li class="ag"><p class="ag-time">${fmt.time(s.start)}<small>${s.duration} min</small></p>
        <div class="ag-main"><b>${esc(s.title)}</b><span>${esc(s.note || s.teacher)}</span><div class="ag-tags">${tags}</div></div>
        <p class="ag-who">${img ? `<img src="${img}" alt="" width="36" height="36" loading="lazy">` : ''}${esc(s.teacher)}</p>
        <button type="button" class="btn ${s.kind === 'class' && s.mode === 'studio' ? 'btn-ghost' : 'btn-accent'}" data-book="${s.id}" aria-label="${label}: ${esc(s.title)}, ${fmt.time(s.start)}">${label}</button></li>`;
    }).join('') : `<li class="ag-empty">Nothing on ${fmt.long(state.day)} for this filter.</li>`;
  }
  function pick(b) { state.day = b.dataset.day; $$('.tt-day').forEach((x) => { x.setAttribute('aria-selected', x === b); x.tabIndex = x === b ? 0 : -1; }); render(); }
  days.addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) pick(b); });
  days.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const t = [...days.children]; const i = (t.indexOf(document.activeElement) + (e.key === 'ArrowRight' ? 1 : -1) + t.length) % t.length;
    t[i].focus(); pick(t[i]); e.preventDefault();
  });
  $('.tt-seg').addEventListener('click', (e) => { const b = e.target.closest('[data-where]'); if (!b) return; state.where = b.dataset.where; $$('[data-where]').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); });
  render();

  /* Workshops */
  const track = $('#track');
  track.innerHTML = workshops.map((w) => {
    const p = w.prices.studio || w.prices.online;
    return `<li class="wk"><div class="wk-img"><img src="../assets/img/${w.img}.webp" alt="" loading="lazy"><p class="wk-date">${fmt.short(w.date)}</p></div>
      <div class="wk-body"><h3>${esc(w.title)}</h3><p class="who">${esc(w.teacher)} · ${w.series ? esc(w.series) + ' · ' : ''}${fmt.time(w.start)} to ${fmt.time(w.end)}</p><p class="blurb">${esc(w.blurb)}</p>
      <p class="wk-tags"><span>${esc(w.need)}</span>${w.mode === 'hybrid' ? '<span class="live">Studio or online</span>' : ''}</p>
      <div class="wk-foot"><span>${fmt.money(p[0])} / ${fmt.money(p[1])}</span><button type="button" class="btn btn-accent" data-book="${w.id}" aria-label="Book ${esc(w.title)}">Book</button></div></div></li>`;
  }).join('');

  /* Online, begin, faces */
  $('#live').innerHTML = sessions.filter((s) => s.mode !== 'studio').slice(0, 6).map((s) => `<li><time>${fmt.dayShort(s.date)} ${fmt.dateNum(s.date)}<br>${fmt.time(s.start)}</time><div><b>${esc(s.title)}</b><span>${esc(s.teacher)} · ${s.duration} min</span></div><button type="button" class="btn btn-accent" data-book="${s.id}" aria-label="Book ${esc(s.title)} livestream, ${fmt.short(s.date)}">Book</button></li>`).join('');
  $('#tasters').innerHTML = tasters.map((t) => `<li><div>${fmt.short(t.date)}, ${fmt.time(t.start)}<span>${esc(t.teacher)}${t.full ? ' · Full' : ''}</span></div><button type="button" class="${t.full ? 'wait' : ''}" data-book="${t.id}">${t.full ? 'Waiting list' : 'Book'}</button></li>`).join('');
  $('#courses').innerHTML = courses.map((c) => `<li><div>From ${fmt.short(c.date)}<span>${fmt.day(c.date)}s ${fmt.time(c.start)} · ${esc(c.teacher)}</span></div><button type="button" data-book="${c.id}">Book</button></li>`).join('');
  const F = ['Hazel Sainsbury', 'Sophie Carrington', 'Khaled Kendsi', 'Judy Lynn', 'Valentina Salaris', 'Alaric Newcombe', 'Janette Browne', 'Paul Jackson', 'Celia Henebury', 'Richard Ward', 'Rebecca Rawsthorne', 'Alexandra Wright'];
  $('#faces').innerHTML = F.map((n) => `<li><img src="${portrait(n, '../')}" alt="" width="200" height="200" loading="lazy"><span>${esc(n)}</span></li>`).join('');

  $('#nl').addEventListener('submit', (e) => {
    e.preventDefault(); const i = $('#nl-email');
    $('.nl-msg').textContent = i.value && i.checkValidity() ? 'Subscribed. Please confirm from your inbox (prototype: nothing was sent).' : 'Please enter a valid email address.';
  });

  /* Pan: the workshops track moves one pixel across for every pixel down */
  const pan = $('.pan'), wide = window.matchMedia('(min-width: 960px)');
  function sizePan() {
    if (!wide.matches || window.Motion.reduced()) { pan.style.removeProperty('--pan-h'); return; }
    const dx = Math.max(0, track.scrollWidth - window.innerWidth);
    pan.style.setProperty('--pan-x', dx + 'px');
    pan.style.setProperty('--pan-h', `calc(100vh + ${dx}px)`);
  }
  sizePan();
  window.addEventListener('resize', sizePan);
  window.addEventListener('load', sizePan);

  /* Header gains a ground once the hero is behind it */
  const hd = $(".hd");
  const onScroll = () => hd.classList.toggle("scrolled", window.scrollY > window.innerHeight * .8);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* Hold the pose: scroll becomes a held minute */
  const hold = $('.hold'), clock = $('#clock'), stages = $$('.stages li');
  function frame() {
    const p = parseFloat(hold.style.getPropertyValue('--p')) || 0;
    const s = Math.round(p * 60);
    clock.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const on = Math.min(stages.length - 1, Math.floor(p * stages.length * 0.999));
    stages.forEach((li, i) => li.classList.toggle('on', i === on));
  }
  document.addEventListener('motionframe', frame);
})();
