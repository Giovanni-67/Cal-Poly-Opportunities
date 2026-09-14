(function () {
  'use strict';
  const api = globalThis.CareerEvents;
  const form = document.getElementById('career-form');
  if (!api || !form) return;
  const list = document.getElementById('career-list');
  const status = document.getElementById('career-status');
  const more = document.getElementById('career-more');
  let expanded = false;
  let previousView = '';
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function link(text, href) {
    const node = element('a', text);
    node.href = href;
    return node;
  }
  function render() {
    const query = document.getElementById('career-search').value;
    const type = form.elements['career-type'].value;
    const matches = api.selectEvents(api.events, { query, type });
    const visible = expanded ? matches : matches.slice(0, 3);
    const view = JSON.stringify([query, type, expanded, matches.map(event => event.id)]);
    // Leave focused links intact when a time check has not changed the results.
    if (view === previousView) return;
    previousView = view;
    list.replaceChildren();
    for (const event of visible) {
      const card = element('li', '', 'career-card');
      const date = api.formatEvent(event);
      const stamp = element('time', date.date, 'career-date');
      stamp.dateTime = event.start;
      card.append(stamp, element('h3', event.title), element('p', date.time, 'career-time'));
      card.append(element('p', event.location || 'Location: check this event in MustangJobs.', 'career-location'));
      if (event.companies.length) {
        const companies = element('p', 'Publicly announced: ', 'career-companies');
        event.companies.forEach((company, index) => {
          if (index) companies.append(document.createTextNode(', '));
          companies.append(link(company.name, company.source));
        });
        card.append(companies);
      }
      const reason = query.trim() ? 'Matches your event or company search.' : type === 'company' ? 'Includes a publicly announced company visit.' : event.type === 'networking' ? 'Connect with employers through campus networking.' : 'Explore employers at an upcoming campus fair.';
      card.append(element('p', reason, 'career-reason'), link('Official event details →', event.source));
      list.append(card);
    }
    status.textContent = matches.length ? `${visible.length} of ${matches.length} upcoming events in this collection.` : 'No upcoming events match this collection. Check MustangJobs for more; a missing company does not mean it is not visiting.';
    more.hidden = matches.length <= 3;
    more.textContent = expanded ? 'Show fewer events' : 'Show all upcoming events';
    more.setAttribute('aria-expanded', String(expanded));
  }
  form.hidden = false;
  form.addEventListener('submit', event => { event.preventDefault(); expanded = false; render(); });
  form.addEventListener('input', () => { expanded = false; render(); });
  more.addEventListener('click', () => { expanded = !expanded; render(); });
  // Recheck time when returning to a tab and while it remains open.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  setInterval(render, 60000);
  render();
})();
