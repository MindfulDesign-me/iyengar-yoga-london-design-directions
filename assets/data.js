/* Iyengar Yoga London: real programme, taken from the live timetable and
   workshop listings on iyengaryogalondon.co.uk (Mindbody) on 28 October 2026.
   Shared by all three directions. */
window.IYL = (function () {
  const today = '2026-10-28';

  // Class prices from /class-prices/ (members, visitors), keyed by mode and minutes.
  const PRICES = {
    studio: { 75: [9.5, 12.5], 90: [14.25, 18.5], 120: [18, 23.25] },
    online: { 60: [8.5, 11], 90: [12.75, 16.75], 120: [16.25, 21] },
  };

  const LEVELS = {
    beginners: { label: 'Beginners', hint: 'new, or under two years of Iyengar yoga' },
    general: { label: 'General', hint: 'two or more years of regular practice' },
    intermediate: { label: 'Intermediate', hint: 'four or more years, with a stable Sirsasana and Sarvangasana' },
    open: { label: 'All levels', hint: 'open to everyone' },
  };

  const PORTRAITS = {
    'Hazel Sainsbury': 'hazel-sainsbury', 'Janette Browne': 'janette-browne', 'Judy Lynn': 'judy-lynn',
    'Khaled Kendsi': 'khaled-kendsi', 'Alexandra Wright': 'alexandra-wright', 'Paul Jackson': 'paul-jackson',
    'Sophie Carrington': 'sophie-carrington', 'Valentina Salaris': 'valentina-salaris',
    'Alaric Newcombe': 'alaric-newcombe', 'Richard Ward': 'richard-ward', 'Celia Henebury': 'celia-henebury', 'Rebecca Rawsthorne': 'rebecca-rawsthorne',
  };

  // [date, start, end, title, teacher, mode, levels, kind, note]
  const raw = [
    ['2026-10-28', '08:00', '09:00', 'Beginners and General', 'Kristyan Robinson', 'online', 'beginners general'],
    ['2026-10-28', '10:30', '12:00', '60+ Yoga', 'Judy Lynn', 'studio', 'open', 'class', 'Moderately paced, for active students over 60'],
    ['2026-10-28', '12:15', '13:45', 'General', 'Marco Cannavo', 'studio', 'general'],
    ['2026-10-28', '18:00', '19:30', 'General and Intermediate', 'Penny Chaplin', 'online', 'general intermediate'],
    ['2026-10-28', '18:15', '19:15', 'Free Taster Class', 'Hazel Sainsbury', 'studio', 'open', 'taster'],
    ['2026-10-28', '18:45', '20:15', 'General', 'Kate Rathod', 'studio', 'general'],
    ['2026-10-28', '19:45', '21:15', 'Beginners', 'Paul Jackson', 'studio', 'beginners'],
    ['2026-10-29', '10:00', '11:30', 'General', 'Kate Rathod', 'studio', 'general'],
    ['2026-10-29', '12:00', '13:30', 'Yoga for Neurological Conditions', 'Korinna Pilafidis Williams', 'studio', 'open', 'class', 'Including MS and Parkinson’s'],
    ['2026-10-29', '18:15', '19:45', 'Beginners', 'Mirja Nissen', 'studio', 'beginners'],
    ['2026-10-29', '18:30', '20:30', 'Intermediate', 'Alaric Newcombe', 'hybrid', 'intermediate'],
    ['2026-10-30', '08:15', '09:15', 'Pranayama', 'Richard Ward', 'online', 'general intermediate', 'class', 'Yogic breathing, General level and above'],
    ['2026-10-30', '10:15', '11:45', 'General', 'Marco Cannavo', 'studio', 'general'],
    ['2026-10-30', '10:30', '12:00', 'Gentle Yoga', 'Megan', 'online', 'open'],
    ['2026-10-30', '12:00', '13:30', 'Beginners', 'Marco Cannavo', 'studio', 'beginners'],
    ['2026-10-30', '18:00', '19:30', 'General and Intermediate', 'Penny Chaplin', 'online', 'general intermediate'],
    ['2026-10-31', '08:15', '10:15', 'Intermediate', 'Kate Rathod', 'studio', 'intermediate'],
    ['2026-10-31', '08:30', '10:00', 'Beginners', 'Hazel Sainsbury', 'studio', 'beginners'],
    ['2026-10-31', '08:30', '10:00', 'General', 'Paul Jackson', 'online', 'general'],
    ['2026-10-31', '10:15', '11:45', 'General', 'Hazel Sainsbury', 'studio', 'general'],
    ['2026-10-31', '10:30', '13:30', 'Backward Extensions', 'Marco Cannavo', 'studio', 'intermediate', 'workshop'],
    ['2026-10-31', '12:00', '13:30', 'Beginners', 'Stuart Miller', 'studio', 'beginners'],
    ['2026-10-31', '13:45', '14:45', 'Free Taster Class', 'Stuart Miller', 'studio', 'open', 'taster'],
    ['2026-10-31', '15:15', '16:45', 'General', 'Keiko Onishi', 'studio', 'general'],
    ['2026-11-01', '09:00', '10:15', 'Beginners', 'Janette Browne', 'studio', 'beginners'],
    ['2026-11-01', '09:30', '11:00', 'General', 'Kristyan Robinson', 'studio', 'general'],
    ['2026-11-01', '11:15', '13:15', 'Intermediate', 'Sophie Carrington', 'studio', 'intermediate'],
    ['2026-11-01', '11:15', '13:45', 'Moving up: General to Intermediate', 'Kate Rathod', 'studio', 'general', 'workshop'],
    ['2026-11-01', '11:30', '13:00', 'General', 'Penny Chaplin', 'online', 'general'],
    ['2026-11-01', '15:00', '16:30', 'Beginners and General', 'Khaled Kendsi', 'studio', 'beginners general'],
    ['2026-11-02', '09:00', '10:15', 'Beginners', 'Hazel Sainsbury', 'studio', 'beginners'],
    ['2026-11-02', '10:30', '12:00', 'General', 'Judy Smith', 'hybrid', 'general'],
    ['2026-11-02', '12:30', '14:00', 'Remedial', 'Judy Smith', 'studio', 'open', 'class', 'For specific health problems, by application'],
    ['2026-11-02', '18:15', '19:30', 'Beginners', 'Kristyan Robinson', 'studio', 'beginners'],
    ['2026-11-02', '18:30', '20:00', 'General', 'Korinna Pilafidis Williams', 'online', 'general'],
    ['2026-11-02', '19:45', '21:15', 'General', 'Kristyan Robinson', 'hybrid', 'general'],
    ['2026-11-03', '09:30', '11:00', 'General', 'Megan', 'studio', 'general'],
    ['2026-11-03', '11:30', '13:00', 'Beginners', 'Megan', 'studio', 'beginners'],
    ['2026-11-03', '16:30', '17:30', 'Children’s Yoga', 'Alexandra Wright', 'studio', 'open', 'class', 'Ages 6 to 12'],
    ['2026-11-03', '18:30', '20:30', 'Intermediate', 'Marco Cannavo', 'studio', 'intermediate'],
    ['2026-11-03', '18:45', '20:15', 'Beginners', 'Valentina Salaris', 'studio', 'beginners'],
  ];

  const mins = (a, b) => { const [h1, m1] = a.split(':').map(Number); const [h2, m2] = b.split(':').map(Number); return h2 * 60 + m2 - (h1 * 60 + m1); };

  const sessions = raw.map(([date, start, end, title, teacher, mode, levels, kind = 'class', note = ''], i) => {
    const duration = mins(start, end);
    const s = { id: 'c' + i, kind, date, start, end, duration, title, teacher, mode, levels: levels.split(' '), note };
    if (kind === 'taster') { s.free = true; s.full = true; }
    else if (kind === 'class') {
      if (title === 'Remedial') s.byApplication = true;
      s.prices = {};
      if (mode !== 'online' && PRICES.studio[duration]) s.prices.studio = PRICES.studio[duration];
      if (mode !== 'studio' && PRICES.online[duration]) s.prices.online = PRICES.online[duration];
      if (mode === 'hybrid' && !s.prices.online && PRICES.online[duration]) s.prices.online = PRICES.online[duration];
    }
    return s;
  });

  const workshops = [
    { id: 'w1', title: 'Backward Extensions', teacher: 'Marco Cannavo', dates: ['2026-10-31'], start: '10:30', end: '13:30', mode: 'studio', levels: ['intermediate'], need: '5+ years of regular practice', prices: { studio: [45, 55] }, blurb: 'An Intermediate workshop with a focus on backward extensions, for students able and willing to work with a bit more intensity.', img: 'headstand-workshop' },
    { id: 'w2', title: 'Moving up: General to Intermediate', teacher: 'Kate Rathod', dates: ['2026-11-01'], start: '11:15', end: '13:45', mode: 'studio', levels: ['general'], need: '2+ years of regular practice', prices: { studio: [35, 45] }, blurb: 'For students preparing to progress from General to Intermediate classes. Refine your understanding of postures and build confidence for the transition.', img: 'class-standing' },
    { id: 'w3', title: 'Yoga Ropes Course', teacher: 'Khaled Kendsi', dates: ['2026-11-07', '2026-11-14', '2026-11-21', '2026-11-28'], start: '14:00', end: '15:30', mode: 'studio', levels: ['general'], need: '2+ years of regular practice', prices: { studio: [65, 75] }, blurb: 'Four Saturdays on the yoga wall ropes (Yoga Kurunta), following the Pune cycle. No previous ropes experience needed.', img: 'rope-wall-class', series: 'Four weeks' },
    { id: 'w4', title: 'Hand Balances', teacher: 'Kristyan Robinson', dates: ['2026-11-14'], start: '10:15', end: '12:45', mode: 'studio', levels: ['general'], need: '2+ years of regular practice', prices: { studio: [28, 38] }, blurb: 'Prepare for and practise a series of hand balances, using props thoughtfully to develop understanding and build confidence.', img: 'headstand-ropes' },
    { id: 'w5', title: 'Yoga for Stiff Hips', teacher: 'Judy Waldman', dates: ['2026-12-05'], start: '10:15', end: '12:45', mode: 'hybrid', recorded: true, levels: ['open'], need: 'Open level. 6 months’ experience to join online', prices: { studio: [28, 38], online: [23, 33] }, blurb: 'Standing and seated postures and twists to bring more freedom, ease and range of movement to the hips.', img: 'trikonasana' },
    { id: 'w6', title: 'B.K.S. Iyengar Commemorative Workshop', teacher: 'Penny Chaplin', dates: ['2026-12-12'], start: '10:30', end: '13:30', mode: 'studio', levels: ['open'], need: 'All levels welcome', prices: { studio: [45, 55] }, blurb: 'A studio workshop to mark Guruji’s December birthday, in the centre he opened in 1984.', img: 'barbican-1984' },
    { id: 'w7', title: 'Twixtmas Intensive', teacher: 'Alaric Newcombe', dates: ['2026-12-29', '2026-12-30', '2026-12-31'], start: '09:00', end: '12:00', mode: 'hybrid', recorded: true, levels: ['intermediate'], need: '4+ years of regular practice', prices: { studio: [100, 130], online: [85, 115] }, blurb: 'Three mornings to find calm and focus for the year ahead. Save when you book all three days.', img: 'studio-ropes', series: 'Three mornings' },
    { id: 'w8', title: 'New Year’s Eve Restorative', teacher: 'Kate Rathod', dates: ['2026-12-31'], start: '14:30', end: '16:30', mode: 'studio', levels: ['general'], need: '2+ years of regular practice', prices: { studio: [22, 32] }, blurb: 'Two hours of restorative Iyengar yoga to soothe the nervous system before the new year.', img: 'remedial' },
    { id: 'w9', title: 'Yoga for Neck & Shoulders', teacher: 'Korinna Pilafidis Williams', dates: ['2027-01-24'], start: '11:15', end: '13:45', mode: 'studio', levels: ['general'], need: '1+ year of regular practice', prices: { studio: [38, 48] }, blurb: 'Asanas to relieve pain and stiffness in the neck and shoulders. Trainee teachers and mentees are welcome to observe adjustments.', img: 'props', trainees: true },
  ].map((w) => ({ ...w, kind: 'workshop', date: w.dates[0], duration: mins(w.start, w.end) }));

  const tasters = [
    { date: '2026-10-28', start: '18:15', teacher: 'Hazel Sainsbury', full: true },
    { date: '2026-10-31', start: '13:45', teacher: 'Stuart Miller', full: true },
    { date: '2027-01-04', start: '18:30', teacher: 'Janette Browne' },
    { date: '2027-01-06', start: '18:15', teacher: 'Hazel Sainsbury' },
    { date: '2027-01-09', start: '13:45', teacher: 'Stuart Miller' },
  ].map((t, i) => ({ id: 't' + i, kind: 'taster', title: 'Free Taster Class', mode: 'studio', levels: ['open'], free: true, duration: 60, end: addMins(t.start, 60), ...t }));

  const courses = [
    { date: '2026-11-02', last: '2026-12-07', start: '18:30', end: '19:45', teacher: 'Janette Browne' },
    { date: '2026-11-04', last: '2026-12-09', start: '18:15', end: '19:30', teacher: 'Hazel Sainsbury' },
    { date: '2026-11-07', last: '2026-12-12', start: '13:45', end: '15:00', teacher: 'Stuart Miller' },
    { date: '2027-01-11', last: '2027-02-15', start: '18:30', end: '19:45', teacher: 'Janette Browne' },
  ].map((c, i) => ({ id: 'b' + i, kind: 'course', title: 'Six-week Beginners Course', mode: 'studio', levels: ['beginners'], duration: 75, series: 'Six weeks', flat: 85, under25: 25, ...c }));

  // Tasters in the timetable point at the same records.
  sessions.forEach((s) => { if (s.kind === 'taster') { const t = tasters.find((x) => x.date === s.date && x.start === s.start); if (t) Object.assign(s, { id: t.id, full: t.full }); } });
  // Workshops in the timetable point at the same records.
  sessions.forEach((s) => { if (s.kind === 'workshop') { const w = workshops.find((x) => x.date === s.date && x.title === s.title); if (w) Object.assign(s, w); } });

  function addMins(t, m) { const [h, mm] = t.split(':').map(Number); const x = h * 60 + mm + m; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); }

  const membership = [
    { id: 'm1', kind: 'membership', title: 'Annual Autopay Membership', price: 60, note: 'Renews each year. Cancel with a month’s notice.' },
    { id: 'm2', kind: 'membership', title: 'Annual Membership', price: 65, note: 'Pay once for twelve months.' },
  ];
  const passes = [
    { id: 'p1', kind: 'pass', title: 'Studio 90 Minute Yogapass', price: 142.5, note: '11 classes for the price of 10' },
    { id: 'p2', kind: 'pass', title: 'Studio 120 Minute Yogapass', price: 180, note: '11 classes for the price of 10' },
    { id: 'p3', kind: 'pass', title: 'Online 60 Minute Yogapass', price: 85, note: '11 classes for the price of 10' },
    { id: 'p4', kind: 'pass', title: 'Online 90 Minute Yogapass', price: 127.5, note: '11 classes for the price of 10' },
  ];

  const all = [...sessions, ...workshops, ...tasters, ...courses, ...membership, ...passes];
  const byId = (id) => all.find((x) => x.id === id);

  // Formatting helpers shared by the three directions.
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const d = (iso) => new Date(iso + 'T12:00:00');
  const fmt = {
    day: (iso) => DAYS[d(iso).getDay()],
    dayShort: (iso) => DAYS[d(iso).getDay()].slice(0, 3),
    dateNum: (iso) => d(iso).getDate(),
    month: (iso) => MONTHS[d(iso).getMonth()],
    monShort: (iso) => MONTHS[d(iso).getMonth()].slice(0, 3),
    long: (iso) => `${DAYS[d(iso).getDay()]} ${d(iso).getDate()} ${MONTHS[d(iso).getMonth()]}`,
    short: (iso) => `${DAYS[d(iso).getDay()].slice(0, 3)} ${d(iso).getDate()} ${MONTHS[d(iso).getMonth()].slice(0, 3)}`,
    time: (t) => { let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return m ? `${h}.${String(m).padStart(2, '0')}${ap}` : `${h}${ap}`; },
    money: (n) => '£' + (Number.isInteger(n) ? n : n.toFixed(2)),
    mode: (m) => ({ studio: 'In the studio', online: 'Livestream', hybrid: 'Studio or livestream' }[m]),
    level: (ls) => ls.map((l) => LEVELS[l].label).join(' & '),
    when: (x) => x.dates && x.dates.length > 1
      ? `${fmt.short(x.dates[0])} to ${fmt.short(x.dates[x.dates.length - 1])}`
      : x.last ? `${fmt.day(x.date)}s, ${fmt.short(x.date)} to ${fmt.short(x.last)}` : fmt.long(x.date),
  };
  const portrait = (name, base) => PORTRAITS[name] ? `${base}assets/img/t/${PORTRAITS[name]}.webp` : null;
  const week = [...new Set(sessions.map((s) => s.date))];

  return { today, LEVELS, sessions, workshops, tasters, courses, membership, passes, byId, fmt, portrait, week };
})();
