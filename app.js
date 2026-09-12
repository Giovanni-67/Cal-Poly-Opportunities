'use strict';

(function () {
  const $ = id => document.getElementById(id);
  const views = [...document.querySelectorAll('[data-view]')];
  const navigation = [...document.querySelectorAll('nav a')];
  const headings = { explore: 'page-title', about: 'about-title', resources: 'resources-title' };
  function showView(moveFocus = true) {
    const destination = location.hash.slice(1);
    const view = Object.hasOwn(headings, destination) ? destination : 'explore';
    views.forEach(panel => { panel.hidden = panel.id !== view; });
    navigation.forEach(link => {
      const active = link.hash === `#${view}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = view === 'explore' ? 'Cal Poly Opportunities — Find your next opportunity' : `${view === 'about' ? 'About' : 'Resources'} — Cal Poly Opportunities`;
    if ($('opportunity-dialog').open) $('opportunity-dialog').close();
    if (moveFocus) {
      const target = $(destination === 'search' ? 'search' : headings[view]);
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    }
  }
  // Keep hash links and browser Back/Forward working without reloading search state.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const destination = link.getAttribute('href').slice(1);
    if (!Object.hasOwn(headings, destination) && destination !== 'search') return;
    event.preventDefault();
    if (location.hash === `#${destination}`) showView();
    else location.hash = destination;
  });
  addEventListener('hashchange', () => showView());
  showView(!!location.hash);
  const matcher = globalThis.OpportunityMatcher;
  const status = $('status');
  if (!matcher) {
    status.textContent = 'Search could not load. Please reload the page or use Resources in the navigation.';
    return;
  }
  const { findMatches, orderMatches, TYPES } = matcher;
  const form = $('search-form');
  const results = $('results');
  const dialog = $('opportunity-dialog');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let history = [];
  let trigger = null;
  let closing = false;
  let openingAnimation = null;

  function icon(name) {
    const allowed = ['people', 'gear', 'flask', 'bulb', 'shield', 'code', 'briefcase', 'arrow'];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `icons.svg#${allowed.includes(name) ? name : 'people'}`);
    svg.append(use);
    return svg;
  }
  function span(className, text) {
    const element = document.createElement('span');
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function setExpanded(expanded) {
    $('details-toggle').setAttribute('aria-expanded', String(expanded));
    $('detail-content').classList.toggle('expanded', expanded);
    $('detail-content').inert = !expanded;
  }
  function openOpportunity(match, button) {
    if (dialog.open || closing) return;
    const { item, reason } = match;
    trigger = button;
    const origin = button.getBoundingClientRect();
    dialog.dataset.type = item.type;
    $('detail-icon').replaceChildren(icon(item.icon));
    $('detail-type').textContent = TYPES[item.type];
    $('detail-title').textContent = item.title;
    $('detail-description').textContent = item.description;
    $('detail-reason').textContent = reason;
    $('detail-note').textContent = item.note || 'Visit the official source to learn how to get involved and check current program details. This listing does not indicate that applications are open.';
    $('detail-link').href = item.source;
    $('detail-source').textContent = `${item.sourceName} · Source reviewed ${item.reviewed}`;
    setExpanded(false);
    document.body.classList.add('modal-open');
    dialog.showModal();
    if (!reducedMotion.matches) {
      const target = dialog.getBoundingClientRect();
      const dx = origin.left + origin.width / 2 - target.left - target.width / 2;
      const dy = origin.top + origin.height / 2 - target.top - target.height / 2;
      openingAnimation = dialog.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${Math.min(origin.width / target.width, 1)}, ${Math.min(origin.height / target.height, 1)})`, opacity: .25 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 }
      ], { duration: 320, easing: 'cubic-bezier(.2,.75,.25,1)' });
    }
  }
  async function closeOpportunity() {
    if (!dialog.open || closing) return;
    closing = true;
    openingAnimation?.cancel();
    dialog.classList.add('closing');
    if (!reducedMotion.matches) {
      await dialog.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 180, easing: 'ease-in' }).finished.catch(() => {});
    }
    dialog.close();
  }
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    dialog.classList.remove('closing');
    closing = false;
    if (trigger?.isConnected && !trigger.closest('[hidden]')) trigger.focus({ preventScroll: true });
  });
  $('close-dialog').addEventListener('click', closeOpportunity);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeOpportunity(); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [$('close-dialog'), $('details-toggle')];
    if (!$('detail-content').inert) controls.push($('detail-link'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  let startedOutside = false;
  dialog.addEventListener('pointerdown', event => { startedOutside = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (startedOutside && event.target === dialog && outside(event)) closeOpportunity();
    startedOutside = false;
  });
  $('details-toggle').addEventListener('click', () => setExpanded($('details-toggle').getAttribute('aria-expanded') !== 'true'));

  function card(match) {
    const { item, reason } = match;
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'opportunity-card';
    button.dataset.id = item.id;
    button.dataset.type = item.type;
    button.setAttribute('aria-label', `Explore ${item.title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-describedby', `description-${item.id} reason-${item.id}`);
    const top = span('card-top');
    const tile = span('icon-tile');
    tile.append(icon(item.icon));
    top.append(tile, span('category', TYPES[item.type]));
    const action = span('card-action', 'Explore');
    action.append(icon('arrow'));
    const description = span('card-description', item.description);
    description.id = `description-${item.id}`;
    const explanation = span('card-reason', reason);
    explanation.id = `reason-${item.id}`;
    button.append(top, span('card-title', item.title), description, explanation, action);
    button.addEventListener('click', () => openOpportunity(match, button));
    li.append(button);
    return li;
  }
  function render(initial = false) {
    const options = {
      query: $('search').value,
      interests: [...form.querySelectorAll('input[name="interest"]:checked')].map(input => input.value),
      type: form.querySelector('input[name="type"]:checked').value
    };
    const outcome = findMatches(globalThis.OPPORTUNITIES, options);
    const ordered = orderMatches(outcome.matches, history);
    // The initial overview must not pre-seed a user's discovery ordering.
    if (!initial) history = ordered.history;
    results.replaceChildren(...ordered.matches.map(card));
    $('empty-state').hidden = !!outcome.error || ordered.matches.length > 0;
    const count = ordered.matches.length;
    const filtered = options.query.trim() || options.interests.length || options.type !== 'all';
    if (outcome.error) status.textContent = outcome.error;
    else if (filtered) status.textContent = `${count} ${count === 1 ? 'match' : 'matches'} in this collection. Broaden your search anytime.`;
    else if (initial) status.textContent = `${count} ways to get involved. Choose a major or interest to find your starting point.`;
    else status.textContent = `Showing all ${count} opportunities. Add a major or interest to narrow your search.`;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    render();
    const heading = $('results-title');
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  });
  form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => input.addEventListener('change', () => render()));
  $('browse-all').addEventListener('click', () => {
    form.reset();
    history = [];
    render(true);
    $('search').focus({ preventScroll: true });
  });
  render(true);
})();
