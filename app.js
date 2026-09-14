'use strict';

(function () {
  const $ = id => document.getElementById(id);
  const views = [...document.querySelectorAll('[data-view]')];
  const navigation = [...document.querySelectorAll('nav a')];
  const headings = { explore: 'page-title', study: 'study-title', resources: 'resources-title', bookmarks: 'bookmarks-title', about: 'about-title', report: 'report-title' };
  const labels = { explore: 'Opportunities', study: 'Study Spots', resources: 'Campus Resources', bookmarks: 'Bookmarks', about: 'About', report: 'Report bugs' };
  let uiReady = false;
  document.body.classList.add('js-navigation');
  function closeMenu() {
    $('menu-toggle').setAttribute('aria-expanded', 'false');
    $('menu-toggle').setAttribute('aria-label', 'Open navigation menu');
    $('main-nav').classList.remove('menu-open');
  }
  $('menu-toggle').addEventListener('click', () => {
    const open = $('menu-toggle').getAttribute('aria-expanded') !== 'true';
    $('menu-toggle').setAttribute('aria-expanded', String(open));
    $('menu-toggle').setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`);
    $('main-nav').classList.toggle('menu-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('menu-toggle').getAttribute('aria-expanded') === 'true') {
      closeMenu(); $('menu-toggle').focus();
    }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  function showView(moveFocus = true) {
    const destination = location.hash.slice(1);
    const view = destination === 'report-sent' ? 'report' : Object.hasOwn(headings, destination) ? destination : 'explore';
    $('report-return').hidden = destination !== 'report-sent';
    views.forEach(panel => { panel.hidden = panel.id !== view; });
    navigation.forEach(link => {
      const active = link.hash === `#${view}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = view === 'explore' ? 'Cal Poly Opportunities — Find your next opportunity' : `${labels[view]} — Cal Poly Opportunities`;
    closeMenu();
    if (uiReady && view === 'bookmarks') { bookmarks?.refresh(); renderBookmarks(); syncBookmarks(); }
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
    ['study-status', 'resources-status', 'bookmarks-status'].forEach(id => { $(id).textContent = 'Search could not load. Please reload the page. Official campus links remain available below.'; });
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
  const pageSize = 24;
  let currentMatches = [];
  let shown = 0;
  let cardSequence = 0;
  let relatedMatches = [];
  let relatedShown = 0;
  let savedMatches = [];
  let savedShown = 0;
  const bookmarks = globalThis.CampusBookmarks?.createStore(() => localStorage);
  const kind = item => ['study', 'resource'].includes(item.type) ? item.type : 'opportunity';
  const key = item => `${kind(item)}:${item.id}`;
  const places = matcher.validData(globalThis.CAMPUS_PLACES) ? globalThis.CAMPUS_PLACES : null;
  const resources = matcher.validData(globalThis.CAMPUS_RESOURCES) ? globalThis.CAMPUS_RESOURCES : null;
  const catalog = new Map([...(matcher.validData(globalThis.OPPORTUNITIES) ? globalThis.OPPORTUNITIES : []), ...(places || []), ...(resources || [])].map(item => [key(item), item]));
  const featureLabels = { quiet: 'Quiet study', group: 'Group work', outdoors: 'Outdoors', power: 'Power access', computers: 'Computers', reservable: 'Reservable', late: 'Late study', indoor: 'Indoors', monitors: 'Monitors', social: 'Social setting', wifi: 'Wi-Fi' };
  function syncBookmarks() {
    document.querySelectorAll('[data-bookmark]').forEach(button => {
      const saved = !!bookmarks?.has(button.dataset.bookmark);
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', `${saved ? 'Remove bookmark for' : 'Bookmark'} ${button.dataset.title}`);
      if (button.id === 'detail-bookmark') button.querySelector('span').textContent = saved ? 'Bookmarked' : 'Bookmark';
      button.disabled = !bookmarks;
    });
    $('bookmark-count').textContent = bookmarks ? bookmarks.keys().filter(id => catalog.has(id)).length : '0';
    const message = bookmarks ? bookmarks.message() : 'Bookmarks could not load. Please reload the page to try again.';
    $('storage-note').textContent = message;
    $('storage-note').hidden = !message;
  }
  let feedbackTimer;
  function toggleBookmark(item) {
    if (!bookmarks) return;
    const focused = document.activeElement;
    const inSaved = focused.closest('#bookmarks-results');
    const index = inSaved ? [...$('bookmarks-results').querySelectorAll('[data-bookmark]')].indexOf(focused) : -1;
    const saved = bookmarks.toggle(key(item));
    syncBookmarks();
    renderBookmarks();
    if (index >= 0) {
      const buttons = [...$('bookmarks-results').querySelectorAll('[data-bookmark]')];
      (buttons[Math.min(index, buttons.length - 1)] || $('bookmarks-results-title')).focus({ preventScroll: true });
    }
    $('bookmark-feedback').textContent = `${saved ? 'Bookmarked' : 'Removed'}: ${item.title}${bookmarks.message() ? ' · This visit only' : ''}`;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { $('bookmark-feedback').textContent = ''; }, 3500);
  }
  addEventListener('storage', event => {
    if (event.key === globalThis.CampusBookmarks?.KEY || event.key === null) {
      bookmarks?.refresh(); renderBookmarks(); syncBookmarks();
    }
  });

  if (matcher.validData(globalThis.OPPORTUNITIES)) {
    const suggestions = [...new Set(globalThis.OPPORTUNITIES.flatMap(item => [...item.majors, ...item.tags]))].sort();
    $('search-suggestions').replaceChildren(...suggestions.map(value => {
      const option = document.createElement('option');
      option.value = matcher.INTERESTS[value] || value.charAt(0).toUpperCase() + value.slice(1);
      return option;
    }));
  }

  function icon(name) {
    const allowed = ['people', 'gear', 'flask', 'bulb', 'shield', 'code', 'briefcase', 'arrow', 'bookmark', 'book', 'compass'];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `icons.svg?v=20260913#${allowed.includes(name) ? name : 'people'}`);
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
    $('detail-type').textContent = item.category || TYPES[item.type];
    $('detail-bookmark').dataset.bookmark = key(item);
    $('detail-bookmark').dataset.title = item.title;
    $('detail-bookmark').onclick = () => toggleBookmark(item);
    syncBookmarks();
    $('detail-title').textContent = item.title;
    $('detail-description').textContent = item.description;
    $('detail-reason').textContent = reason;
    $('detail-note').textContent = [item.location, item.note || 'Visit the official source to learn how to get involved and check current program details. This listing does not indicate that applications are open.'].filter(Boolean).join(' · ');
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
    else if (uiReady) $(headings[location.hash.slice(1)] || 'page-title').focus({ preventScroll: true });
  });
  $('close-dialog').addEventListener('click', closeOpportunity);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeOpportunity(); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [$('close-dialog'), ...($('detail-bookmark').disabled ? [] : [$('detail-bookmark')]), $('details-toggle')];
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
    li.className = 'card-shell';
    const cardId = `card-${++cardSequence}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'opportunity-card';
    button.dataset.id = item.id;
    button.dataset.type = item.type;
    button.setAttribute('aria-label', `Explore ${item.title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-describedby', `description-${cardId} reason-${cardId}`);
    const top = span('card-top');
    top.append(span('category', item.category || TYPES[item.type]));
    const action = span('card-action', 'View details');
    action.append(icon('arrow'));
    const description = span('card-description', item.description);
    description.id = `description-${cardId}`;
    const explanation = span('card-reason', reason);
    explanation.id = `reason-${cardId}`;
    button.append(top, span('card-title', item.title));
    if (item.location) button.append(span('card-location', item.location));
    button.append(description);
    if (item.type === 'study') {
      const features = span('card-features');
      item.tags.filter(tag => featureLabels[tag]).forEach(tag => features.append(span('feature', featureLabels[tag])));
      button.append(features);
    }
    button.append(explanation, action);
    button.addEventListener('click', () => openOpportunity(match, button));
    const save = document.createElement('button');
    save.className = 'bookmark-button'; save.type = 'button';
    save.dataset.bookmark = key(item); save.dataset.title = item.title;
    const saved = !!bookmarks?.has(key(item));
    save.setAttribute('aria-label', `${saved ? 'Remove bookmark for' : 'Bookmark'} ${item.title}`);
    save.setAttribute('aria-pressed', String(saved)); save.disabled = !bookmarks;
    save.append(icon('bookmark'));
    save.addEventListener('click', () => toggleBookmark(item));
    li.append(button, save);
    return li;
  }
  function showNextPage(moveFocus = false) {
    const next = currentMatches.slice(shown, shown + pageSize).map(card);
    results.append(...next);
    shown += next.length;
    $('load-more').hidden = shown >= currentMatches.length;
    $('result-range').textContent = currentMatches.length ? `Showing ${shown} of ${currentMatches.length} opportunities` : '';
    if (moveFocus && next.length) next[0].querySelector('button').focus({ preventScroll: true });
  }
  $('load-more').addEventListener('click', () => showNextPage(true));
  function showRelatedPage(moveFocus = false) {
    const next = relatedMatches.slice(relatedShown, relatedShown + 12).map(card);
    $('related-results').append(...next); relatedShown += next.length;
    $('related-more').hidden = relatedShown >= relatedMatches.length;
    $('related-status').textContent = `Showing ${relatedShown} of ${relatedMatches.length} related activities`;
    if (moveFocus && next.length) next[0].querySelector('.opportunity-card').focus({ preventScroll: true });
  }
  $('related-more').addEventListener('click', () => showRelatedPage(true));
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
    currentMatches = ordered.matches;
    shown = 0;
    results.replaceChildren();
    showNextPage();
    relatedMatches = globalThis.OpportunityDiscovery?.findRelated(globalThis.OPPORTUNITIES, options).matches || [];
    relatedShown = 0; $('related-results').replaceChildren();
    $('related-section').hidden = !relatedMatches.length;
    if (relatedMatches.length) showRelatedPage();
    $('results-title').textContent = options.query.trim() || options.interests.length ? 'Direct matches' : 'Opportunities to explore';
    $('empty-state').hidden = !!outcome.error || ordered.matches.length > 0;
    const count = ordered.matches.length;
    const filtered = options.query.trim() || options.interests.length || options.type !== 'all';
    if (outcome.error) status.textContent = outcome.error;
    else if (filtered) status.textContent = `${count} ${count === 1 ? 'match' : 'matches'} in this collection. Broaden your search anytime.`;
    else if (initial) status.textContent = `${count} ways to get involved. Choose a major or interest to find your starting point.`;
    else status.textContent = `${count <= pageSize ? 'Showing' : 'Found'} all ${count} opportunities. Add a major or interest to narrow your search.`;
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
  function campusMatches(data, query, filters) {
    const outcome = findMatches(data, { query });
    // Campus searches also include the verified location and feature labels.
    if (!outcome.error && query.trim()) {
      const terms = matcher.normalize(query).split(' ');
      outcome.matches = data.filter(item => {
        const text = ` ${matcher.normalize([item.title, item.description, item.location || '', ...item.tags, ...item.tags.map(tag => featureLabels[tag] || tag)].join(' '))} `;
        return terms.every(term => text.includes(` ${term} `));
      }).map(item => ({ item, reason: `Matches “${query.trim()}” in its name, location, or features` }));
    }
    outcome.matches = outcome.matches.filter(({ item }) => filters.every(filter => item.tags.includes(filter)));
    return outcome;
  }
  function renderCampus(view, data) {
    const filters = [...$(`${view}-form`).querySelectorAll('input:checked')].map(input => input.value);
    const outcome = campusMatches(data, $(`${view}-search`).value, filters);
    $(`${view}-results`).replaceChildren(...outcome.matches.map(match => card({ ...match, reason: $(`${view}-search`).value.trim() ? match.reason : filters.length ? `Matches ${filters.map(filter => featureLabels[filter] || filter).join(' and ')}` : `Explore ${match.item.category || 'a campus study space'}` })));
    $(`${view}-status`).textContent = outcome.error ? 'This collection could not load. Reload or use the official campus link below.' : `${outcome.matches.length} ${view === 'study' ? 'study spots' : 'resources'} to explore${filters.length ? ' · All selected filters applied' : ''}.`;
    $(`${view}-empty`).hidden = !!outcome.error || !!outcome.matches.length;
  }
  for (const [view, data] of [['study', places], ['resources', resources]]) {
    const form = $(`${view}-form`);
    form.addEventListener('submit', event => { event.preventDefault(); renderCampus(view, data); $(`${view}-results-title`).focus(); });
    form.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener('change', () => renderCampus(view, data)));
    $(`${view}-clear`).addEventListener('click', () => { form.reset(); renderCampus(view, data); $(`${view}-search`).focus(); });
    renderCampus(view, data);
  }
  function showSavedPage(moveFocus = false) {
    const next = savedMatches.slice(savedShown, savedShown + pageSize).map(card);
    $('bookmarks-results').append(...next); savedShown += next.length;
    $('bookmarks-more').hidden = savedShown >= savedMatches.length;
    if (moveFocus && next.length) next[0].querySelector('.opportunity-card').focus({ preventScroll: true });
  }
  function renderBookmarks() {
    const savedItems = (bookmarks?.keys() || []).filter(id => catalog.has(id)).map(id => catalog.get(id));
    const query = $('bookmarks-search').value;
    const selectedKind = $('bookmarks-form').querySelector('input:checked').value;
    const filtered = savedItems.filter(item => selectedKind === 'all' || kind(item) === selectedKind);
    const outcome = filtered.length ? campusMatches(filtered, query, []) : { matches: [], error: null };
    savedMatches = outcome.matches.map(({ item }) => ({ item, reason: `Saved for later · ${item.location || item.category || TYPES[item.type]}` }));
    savedShown = 0; $('bookmarks-results').replaceChildren(); showSavedPage();
    $('bookmarks-status').textContent = outcome.error || `${savedMatches.length} matches · ${savedItems.length} saved in your collection.`;
    $('bookmarks-empty').hidden = !!outcome.error || !!savedMatches.length;
    $('bookmarks-empty').querySelector('h3').textContent = savedItems.length ? 'No saved items match these filters.' : 'Your next discovery belongs here.';
    $('bookmarks-empty').querySelector('p').textContent = savedItems.length ? 'Clear filters or try another search to find your saved items.' : 'Tap the bookmark icon on any card to save it for later.';
  }
  $('bookmarks-form').addEventListener('submit', event => { event.preventDefault(); renderBookmarks(); $('bookmarks-results-title').focus(); });
  $('bookmarks-form').querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener('change', renderBookmarks));
  $('bookmarks-clear').addEventListener('click', () => { $('bookmarks-form').reset(); renderBookmarks(); $('bookmarks-search').focus(); });
  $('bookmarks-more').addEventListener('click', () => showSavedPage(true));
  renderBookmarks(); syncBookmarks(); uiReady = true;
  render(true);
})();
