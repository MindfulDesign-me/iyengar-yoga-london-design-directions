/* One booking journey for everything bookable: classes, livestreams, workshops,
   free tasters, the beginners course, membership and Yogapasses.
   Any element with data-book="<id>" opens it. Three steps: Choose, Confirm, Booked.
   Styled per direction through the --bk-* tokens in booking.css. Nothing is sent anywhere. */
(function () {
  const { byId, fmt, portrait, LEVELS, tasters } = window.IYL;
  const BASE = new URL('..', document.currentScript.src).href;
  const KIND = { class: 'Class', workshop: 'Workshop', taster: 'Free taster', course: 'Beginners course', membership: 'Membership', pass: 'Yogapass' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const dlg = document.createElement('dialog');
  dlg.className = 'bk';
  dlg.setAttribute('aria-labelledby', 'bk-title');
  document.body.appendChild(dlg);

  let item = null, step = 0, where = 'studio', pay = 'member', opener = null;

  function kindLabel(x) { return x.kind === 'class' && x.mode === 'online' ? 'Livestream class' : KIND[x.kind]; }

  function options(x) {
    if (x.free) return [{ key: 'free', label: 'Free', sub: 'Your first class with us is on the house', price: 0 }];
    if (x.kind === 'course') return [
      { key: 'full', label: 'Course fee', sub: 'Includes annual membership and two free Beginners classes', price: x.flat },
      { key: 'u25', label: 'Under 25 or full-time student', sub: 'Bring proof of eligibility to your first session', price: x.under25 },
    ];
    if (x.kind === 'membership' || x.kind === 'pass') return [{ key: 'one', label: x.title, sub: x.note, price: x.price }];
    const p = x.prices && x.prices[where];
    if (!p) return [{ key: 'desk', label: 'Pay at reception', sub: 'See class prices for this class', price: null }];
    const o = [
      { key: 'member', label: 'Member price', sub: 'Members save on every class and workshop', price: p[0] },
      { key: 'visitor', label: 'Visitor price', sub: 'No membership needed', price: p[1] },
    ];
    if (x.kind === 'class') o.push({ key: 'pass', label: 'Use my Yogapass', sub: 'One class from your 11-for-10 pass', price: 0, passNote: true });
    return o;
  }

  function choice() { const o = options(item); return o.find((c) => c.key === pay) || o[0]; }

  function whenLine(x) {
    if (!x.date) return '';
    const t = x.start ? `${fmt.time(x.start)} to ${fmt.time(x.end)}` : '';
    return `${fmt.when(x)}${t ? ' · ' + t : ''}`;
  }

  function whereLine(x) {
    if (x.kind === 'membership' || x.kind === 'pass') return 'Use it in the studio and online';
    return where === 'online' ? 'Online, live on Zoom' : 'Studio, 223a Randolph Avenue, Maida Vale W9 1NL';
  }

  function head(x) {
    const img = x.teacher && portrait(x.teacher, BASE);
    return `
      <div class="bk-head">
        <p class="bk-kind">${esc(kindLabel(x))}${x.series ? ' · ' + esc(x.series) : ''}</p>
        <h2 id="bk-title">${esc(x.title)}</h2>
        ${x.date ? `<p class="bk-when">${esc(whenLine(x))}</p>` : ''}
        ${x.teacher ? `<p class="bk-teacher">${img ? `<img src="${img}" alt="" width="36" height="36">` : `<span class="bk-initial" aria-hidden="true">${esc(x.teacher[0])}</span>`}<span>with ${esc(x.teacher)}</span></p>` : ''}
      </div>`;
  }

  function steps() {
    return `<ol class="bk-steps" aria-label="Booking steps">${['Choose', 'Confirm', 'Booked'].map((s, i) => `<li${i === step ? ' aria-current="step"' : ''}${i < step ? ' class="done"' : ''}>${s}</li>`).join('')}</ol>`;
  }

  function stepChoose(x) {
    let h = head(x);
    if (x.levels && x.kind !== 'membership') {
      const lv = x.levels.map((l) => LEVELS[l]);
      h += `<div class="bk-fact"><b>Level</b><span>${esc(x.need || lv.map((l) => l.label + ': ' + l.hint).join('. '))}</span></div>`;
    }
    if (x.note) h += `<div class="bk-fact"><b>About</b><span>${esc(x.note)}</span></div>`;
    if (x.full) {
      const next = tasters.filter((t) => !t.full);
      h += `<div class="bk-notice"><b>This taster is full.</b> Choose another date below, or join the waiting list and we will email you if a place opens.</div>
        <fieldset class="bk-group"><legend>Next free tasters</legend><div class="bk-dates">${next.map((t) => `<button type="button" class="bk-date" data-swap="${t.id}"><b>${fmt.short(t.date)}</b><span>${fmt.time(t.start)} · ${esc(t.teacher)}</span></button>`).join('')}</div></fieldset>
        <div class="bk-actions"><button type="button" class="bk-primary" data-go="waitlist">Join the waiting list</button></div>`;
      return h;
    }
    if (x.mode === 'hybrid') {
      h += `<fieldset class="bk-group"><legend>Where will you practise?</legend><div class="bk-seg">
        ${['studio', 'online'].map((m) => `<label><input type="radio" name="bk-where" value="${m}"${where === m ? ' checked' : ''}><span>${m === 'studio' ? 'In the studio' : 'Livestream'}</span></label>`).join('')}
      </div>${x.recorded ? '<p class="bk-small">Hybrid workshops are recorded, so you can practise again afterwards.</p>' : ''}</fieldset>`;
    }
    if (x.byApplication) {
      h += `<div class="bk-notice">Remedial classes give individual attention for specific health conditions, so we ask a few questions first. A senior teacher will reply within a few days.</div>
        <div class="bk-actions"><button type="button" class="bk-primary" data-go="1">Apply for a place</button></div>`;
      return h;
    }
    const opts = options(x);
    h += `<fieldset class="bk-group"><legend>${opts.length > 1 ? 'How would you like to pay?' : 'Price'}</legend><div class="bk-opts">
      ${opts.map((o) => `<label class="bk-opt"><input type="radio" name="bk-pay" value="${o.key}"${choice().key === o.key ? ' checked' : ''}><span class="bk-opt-main"><b>${esc(o.label)}</b><small>${esc(o.sub)}</small></span><span class="bk-price">${o.price === null ? '' : o.price === 0 ? (o.passNote ? '1 class' : 'Free') : fmt.money(o.price)}</span></label>`).join('')}
    </div></fieldset>`;
    if (x.kind === 'class' && where === 'studio' && !x.free) h += `<p class="bk-small">No need to book regular studio classes: just arrive ten minutes early. Paying ahead saves time at reception.</p>`;
    if (where === 'online' && x.kind !== 'membership' && x.kind !== 'pass') h += `<p class="bk-small">Booking closes one hour before. Your Zoom link arrives by email an hour before class, and you can cancel up to two hours before.</p>`;
    h += `<div class="bk-actions"><button type="button" class="bk-primary" data-go="1">Continue</button></div>`;
    return h;
  }

  function total() { const c = choice(); return c.price === null ? 'Pay at reception' : c.price === 0 ? (c.passNote ? '1 Yogapass class' : 'Free') : fmt.money(c.price); }

  function stepConfirm(x) {
    const rows = [['What', x.title + (x.teacher ? ' with ' + x.teacher : '')]];
    if (x.date) rows.push(['When', whenLine(x)]);
    rows.push(['Where', whereLine(x)]);
    if (!x.byApplication) rows.push(['Price', total() + (choice().key === 'member' ? ' (member)' : choice().key === 'visitor' ? ' (visitor)' : '')]);
    const cta = x.byApplication ? 'Send my application' : choice().price ? `Pay ${total()} and book` : 'Confirm my place';
    return `${head(x)}
      <dl class="bk-summary">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      ${x.byApplication ? `<label class="bk-field"><span>Tell us briefly about your health condition</span><textarea rows="3"></textarea></label>` : ''}
      <p class="bk-small">Bookings, memberships and Yogapasses live in one account, the same one the Iyengar Yoga London app uses, so whatever you book here also appears in the app.</p>
      <div class="bk-actions"><button type="button" class="bk-secondary" data-go="0">Back</button><button type="button" class="bk-primary" data-go="2">${esc(cta)}</button></div>
      <p class="bk-proto">Design prototype: no booking or payment is made.</p>`;
  }

  function stepDone(x, waitlist) {
    const online = where === 'online';
    const tips = waitlist ? ['We will email you as soon as a place opens.', 'Meanwhile, the next free tasters are in January.']
      : x.byApplication ? ['A senior remedial teacher will reply by email.', 'Please tell your teacher about any injuries before every class.']
      : x.kind === 'membership' || x.kind === 'pass' ? ['Member prices apply straight away, in the studio and online.', x.kind === 'membership' ? 'Thursday self-practice sessions at the studio are free for members.' : 'Your pass is valid for six months from first use.']
      : online ? ['Your Zoom link arrives by email one hour before.', 'Join ten minutes early with your camera on, and have a mat ready.']
      : ['Arrive ten minutes early and check in at reception.', 'Mats and all props are provided. Practise in bare feet, on an empty stomach.'];
    const title = waitlist ? 'You’re on the waiting list' : x.byApplication ? 'Application sent' : x.kind === 'membership' ? 'Welcome, you’re a member' : x.kind === 'pass' ? 'Your Yogapass is ready' : 'You’re booked';
    return `<div class="bk-done">
        <div class="bk-tick" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h2 id="bk-title" tabindex="-1">${title}</h2>
        <p class="bk-when">${esc(x.title)}${x.date ? ' · ' + esc(whenLine(x)) : ''}</p>
      </div>
      <ul class="bk-tips">${tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <div class="bk-actions">${x.date && !waitlist && !x.byApplication ? '<button type="button" class="bk-secondary" data-ics>Add to calendar</button>' : ''}<button type="button" class="bk-primary" data-close>Done</button></div>`;
  }

  function render(waitlist) {
    const x = item;
    dlg.innerHTML = `<div class="bk-bar"><span class="bk-grab" aria-hidden="true"></span>${steps()}<button type="button" class="bk-x" data-close aria-label="Close booking"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>
      <div class="bk-body">${step === 0 ? stepChoose(x) : step === 1 ? stepConfirm(x) : stepDone(x, waitlist)}</div>`;
    const focus = dlg.querySelector(step === 2 ? '#bk-title' : step === 1 ? '.bk-primary' : 'input:checked, .bk-primary, .bk-date');
    if (focus) focus.focus({ preventScroll: true });
  }

  function ics(x) {
    const dt = (iso, t) => iso.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Iyengar Yoga London//Booking//EN', 'BEGIN:VEVENT',
      'UID:' + x.id + '-' + x.date + '@iyengaryogalondon.co.uk', 'DTSTAMP:' + dt('2026-10-28', '12:00') + 'Z',
      'DTSTART;TZID=Europe/London:' + dt(x.date, x.start), 'DTEND;TZID=Europe/London:' + dt(x.date, x.end),
      'SUMMARY:' + x.title + ' (Iyengar Yoga London)', 'LOCATION:' + (where === 'online' ? 'Online (Zoom)' : '223a Randolph Avenue\\, London W9 1NL'),
      'END:VEVENT', 'END:VCALENDAR'];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
    a.download = x.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function open(id, trigger) {
    const x = byId(id);
    if (!x) return;
    item = x; step = 0; opener = trigger || document.activeElement;
    where = x.mode === 'online' ? 'online' : 'studio';
    pay = x.free ? 'free' : x.kind === 'course' ? 'full' : 'member';
    render();
    dlg.showModal();
    document.documentElement.classList.add('bk-open');
  }

  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) return dlg.close();
    const t = e.target.closest('[data-go],[data-close],[data-swap],[data-ics]');
    if (!t) return;
    if (t.hasAttribute('data-close')) return dlg.close();
    if (t.hasAttribute('data-ics')) return ics(item);
    if (t.dataset.swap) { item = byId(t.dataset.swap); step = 0; return render(); }
    if (t.dataset.go === 'waitlist') { step = 2; return render(true); }
    step = Number(t.dataset.go); render();
  });
  dlg.addEventListener('change', (e) => {
    if (e.target.name === 'bk-where') { where = e.target.value; render(); dlg.querySelector('input[name="bk-where"]:checked').focus(); }
    if (e.target.name === 'bk-pay') pay = e.target.value;
  });
  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('bk-open');
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (!b) return;
    e.preventDefault();
    open(b.dataset.book, b);
  });

  window.Booking = { open };
})();
