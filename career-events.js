(function (root) {
  'use strict';
  const schedule = 'https://careerservices.calpoly.edu/career-fairs-schedule';
  const employerSource = 'https://www.rovisys.com/careers/university-recruiting-information/career-recruiting-events/';
  const reviewed = '2026-09-14';
  const events = [
    { id: 'fall-day-1', title: 'Fall Career Fair · Day 1', type: 'fair', start: '2026-09-16T10:00:00-07:00', end: '2026-09-16T15:00:00-07:00', location: '', source: schedule, companies: [] },
    { id: 'inclusion-mixer', title: 'Student + Employer Inclusion Mixer', type: 'networking', start: '2026-09-16T16:30:00-07:00', end: '2026-09-16T18:00:00-07:00', location: '', source: schedule, companies: [] },
    { id: 'fall-day-2', title: 'Fall Career Fair · Day 2', type: 'fair', start: '2026-09-17T10:00:00-07:00', end: '2026-09-17T15:00:00-07:00', location: '', source: schedule, companies: [{ name: 'RoviSys', source: employerSource }] },
    { id: 'business-fair', title: 'Business Career Fair', type: 'fair', start: '2026-09-18T10:00:00-07:00', end: '2026-09-18T14:00:00-07:00', location: 'Cal Poly Recreation Center', source: 'https://events.calpoly.edu/business-career-fair', companies: [] },
    { id: 'cafes-connections', title: 'CAFES Connections · Fall Career Networking', type: 'networking', start: '2026-11-04T16:00:00-08:00', end: '2026-11-04T19:00:00-08:00', location: '', source: schedule, companies: [] }
  ];
  const normalize = value => typeof value === 'string' ? value.trim().toLowerCase().slice(0, 200) : '';
  function safeSource(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
        (url.hostname === 'calpoly.edu' || url.hostname.endsWith('.calpoly.edu') || url.href === employerSource);
    } catch { return false; }
  }
  function validEvent(event) {
    return event && typeof event.id === 'string' && event.id && typeof event.title === 'string' && event.title &&
      ['fair', 'networking', 'company'].includes(event.type) && typeof event.location === 'string' &&
      typeof event.start === 'string' && typeof event.end === 'string' &&
      /T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(event.start) && /T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(event.end) &&
      Number.isFinite(Date.parse(event.start)) && Date.parse(event.end) > Date.parse(event.start) &&
      safeSource(event.source) && Array.isArray(event.companies) && event.companies.every(company =>
        company && typeof company.name === 'string' && company.name.trim() && safeSource(company.source));
  }
  function selectEvents(data, { now = Date.now(), query = '', type = 'all' } = {}) {
    if (!Array.isArray(data) || !Number.isFinite(now)) return [];
    const words = normalize(query).split(/\s+/).filter(Boolean);
    const seen = new Set();
    return data.filter(validEvent).filter(event => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      const haystack = normalize([event.title, ...event.companies.map(company => company.name)].join(' '));
      return Date.parse(event.end) > now && (type === 'all' || (type === 'company' ? event.companies.length > 0 || event.type === 'company' : event.type === type)) && words.every(word => haystack.includes(word));
    }).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  }
  function formatEvent(event) {
    const options = { timeZone: 'America/Los_Angeles' };
    const date = new Intl.DateTimeFormat('en-US', { ...options, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(event.start));
    const time = new Intl.DateTimeFormat('en-US', { ...options, hour: 'numeric', minute: '2-digit' });
    return { date, time: `${time.format(new Date(event.start))}–${time.format(new Date(event.end))} Pacific` };
  }
  const api = { events, reviewed, selectEvents, validEvent, safeSource, formatEvent };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CareerEvents = api;
})(globalThis);
