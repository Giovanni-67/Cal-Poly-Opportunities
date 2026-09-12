'use strict';

// Real DOM integration tests, without a framework. Native keyboard/focus and
// responsive visual checks are also exercised manually in the browser.
(async function () {
  const frame = document.getElementById('app');
  const log = document.getElementById('checks');
  const original = await (await fetch('../index.html')).text();
  const base = new URL('../', location.href).href;
  let doc;
  let passed = 0;
  let failed = 0;
  function assert(value, message) { if (!value) throw new Error(message); }
  const $ = id => doc.getElementById(id);
  const cards = () => [...doc.querySelectorAll('.opportunity-card')];
  const ids = () => cards().map(card => card.dataset.id);
  const equal = (actual, expected) => assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  const settle = () => new Promise(resolve => setTimeout(resolve, 450));
  async function load({ missingData = false, missingMatcher = false, missingApp = false, dataSetup = '', reduced = false } = {}) {
    let html = original.replace('<head>', `<head><base href="${base}">`);
    if (missingData) html = html.replace('<script defer src="data.js"></script>', '');
    if (missingMatcher) html = html.replace('<script defer src="matcher.js"></script>', '');
    if (missingApp) html = html.replace('<script defer src="app.js"></script>', '');
    // Run fixture setup before deferred production scripts. Intercept only
    // the external input being tested; the controller and matcher are real.
    if (dataSetup) html = html.replace('<script defer src="app.js"></script>', `<script defer src="data:text/javascript,${encodeURIComponent(dataSetup)}"></script><script defer src="app.js"></script>`);
    if (reduced) html = html.replace('<head>', '<head><script>window.matchMedia=()=>({matches:true});<\/script>');
    await new Promise(resolve => { frame.onload = resolve; frame.srcdoc = html; });
    doc = frame.contentDocument;
  }
  function search(query) { $('search').value = query; $('search-form').requestSubmit(); }
  function choose(name, value) { doc.querySelector(`input[name="${name}"][value="${value}"]`).click(); }
  async function check(name, run) {
    const li = document.createElement('li');
    try { await run(); passed++; li.className = 'pass'; li.textContent = `PASS — ${name}`; }
    catch (error) { failed++; li.className = 'fail'; li.textContent = `FAIL — ${name}: ${error.message}`; }
    log.append(li);
  }
  await load();
  await check('initial render shows all 18 sourced entries', () => { equal(cards().length, 18); assert($('status').textContent.includes('18 ways'), 'initial status'); });
  await check('About and Resources open distinct views with active navigation and heading focus', async () => {
    for (const view of ['about', 'resources', 'explore']) {
      doc.querySelector(`nav a[href="#${view}"]`).click(); await settle();
      equal([...doc.querySelectorAll('[data-view]')].filter(panel => !panel.hidden).map(panel => panel.id), [view]);
      equal(doc.querySelector('nav [aria-current="page"]').hash, `#${view}`);
      equal(doc.querySelectorAll('nav .active').length, 1);
      equal(doc.activeElement.id, view === 'explore' ? 'page-title' : `${view}-title`);
      assert(doc.title.includes(view === 'explore' ? 'Find your next' : view === 'about' ? 'About' : 'Resources'), 'view title');
    }
  });
  await check('navigation preserves search and filters; logo and skip link return to Explore', async () => {
    search('AI'); choose('type', 'research'); const previous = ids();
    doc.querySelector('nav a[href="#about"]').click(); await settle();
    doc.querySelector('.wordmark').click(); await settle();
    equal($('search').value, 'AI'); equal(doc.querySelector('[name="type"]:checked').value, 'research'); equal(ids(), previous);
    doc.querySelector('nav a[href="#resources"]').click(); await settle();
    doc.querySelector('.skip-link').click(); await settle(); equal(doc.activeElement.id, 'search'); assert(!$('explore').hidden, 'search view visible');
    $('browse-all').click();
  });
  await check('unknown hashes recover to Explore, and repeated navigation stays usable', async () => {
    frame.contentWindow.location.hash = 'unknown'; await settle(); assert(!$('explore').hidden, 'fallback view');
    doc.querySelector('nav a[href="#resources"]').click(); await settle();
    doc.querySelector('nav a[href="#resources"]').click(); await settle(); equal(doc.activeElement.id, 'resources-title');
    equal($('resources').querySelectorAll('.resource-card').length, 4);
    equal($('resources').querySelector('time').dateTime, '2026-09-12');
    doc.querySelector('nav a[href="#explore"]').click(); await settle();
  });
  await check('major-first and interest-first search render distinct matches', () => {
    search('AI'); equal(ids(), ['csai', 'computing-research', 'business-surp']);
    search('psychology'); assert(ids().includes('ux'), 'psychology reaches UX'); assert(!ids().includes('csai'), 'stale AI card removed');
  });
  await check('browse all clears query, interests, type and returns search focus', () => {
    choose('interest', 'research'); $('browse-all').click(); equal(cards().length, 18); equal($('search').value, '');
    equal(doc.querySelectorAll('[name="interest"]:checked').length, 0); equal(doc.activeElement.id, 'search');
  });
  await check('multiple interests append new matches after earlier discoveries', () => {
    choose('interest', 'hardware'); const first = ids(); choose('interest', 'ai'); equal(ids().slice(0, first.length), first);
    assert(ids().indexOf('csai') > ids().indexOf('robotics'), 'AI card appended');
    choose('type', 'club'); assert(cards().every(card => card.dataset.type === 'club'), 'type filter');
  });
  await check('unknown searches show honest empty state and directory recovery', () => {
    $('browse-all').click(); search('quantum banana'); equal(cards().length, 0); assert(!$('empty-state').hidden, 'empty state visible');
    assert($('empty-state').querySelector('a').href.includes('calpoly.edu'), 'official recovery');
  });
  await check('repeated searches never duplicate results', () => { search('AI'); const first = ids(); search('AI'); equal(ids(), first); equal(new Set(ids()).size, ids().length); });
  await check('card opens correct dialog, locks scroll, and initially hides detail links', async () => {
    cards()[0].click(); await settle(); assert($('opportunity-dialog').open, 'dialog open');
    equal($('detail-title').textContent, 'Computer Science & AI'); equal(doc.activeElement.id, 'close-dialog');
    assert(doc.body.classList.contains('modal-open'), 'scroll locked'); assert($('detail-content').inert, 'details inert');
  });
  await check('accordion reveals official link and source date, then collapses', async () => {
    $('details-toggle').click(); await settle(); equal($('details-toggle').getAttribute('aria-expanded'), 'true');
    equal($('detail-link').href, 'https://csc.calpoly.edu/student-clubs/'); assert($('detail-source').textContent.includes('2026-09-12'), 'source date');
    assert(!$('detail-content').inert, 'link reachable'); $('details-toggle').click(); await settle(); assert($('detail-content').inert, 'link inert again');
  });
  await check('Tab and Shift+Tab wrap within the modal controls', async () => {
    const event = shiftKey => new frame.contentWindow.KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
    $('details-toggle').focus(); $('details-toggle').dispatchEvent(event(false)); equal(doc.activeElement.id, 'close-dialog');
    $('close-dialog').dispatchEvent(event(true)); equal(doc.activeElement.id, 'details-toggle');
    $('details-toggle').click(); await settle(); $('detail-link').focus(); equal(doc.activeElement.id, 'detail-link');
    $('detail-link').dispatchEvent(event(false)); equal(doc.activeElement.id, 'close-dialog');
  });
  await check('rapid double close cleans up once and restores source-card focus', async () => {
    $('close-dialog').click(); $('close-dialog').click(); await settle(); assert(!$('opportunity-dialog').open, 'closed');
    assert(!doc.body.classList.contains('modal-open'), 'scroll restored'); equal(doc.activeElement.dataset.id, 'csai');
  });
  await check('reopen uses new card data and resets details', async () => {
    cards()[2].click(); await settle(); equal($('detail-title').textContent, 'Business Summer Research'); equal($('details-toggle').getAttribute('aria-expanded'), 'false');
    $('close-dialog').click(); await settle();
  });
  await check('all cards open the correct official source without visiting external sites', async () => {
    $('browse-all').click();
    for (const card of cards()) {
      card.click(); assert($('opportunity-dialog').open, 'open');
      equal($('detail-title').textContent, card.querySelector('.card-title').textContent);
      assert(frame.contentWindow.OpportunityMatcher.safeSource($('detail-link').href), 'official source');
      $('close-dialog').click(); await settle();
    }
  });
  await check('missing data fails visibly and leaves official resource links usable', async () => {
    await load({ missingData: true }); equal(cards().length, 0); assert($('status').textContent.includes('could not be loaded'), 'missing-data message'); assert(doc.querySelector('#resources a'), 'recovery links');
  });
  await check('missing matcher fails visibly', async () => {
    await load({ missingMatcher: true }); equal(cards().length, 0); assert($('status').textContent.includes('Search could not load'), 'missing-matcher message');
    doc.querySelector('nav a[href="#resources"]').click(); await settle(); assert(!$('resources').hidden, 'navigation still works');
  });
  await check('About and official resources remain visible if the app script does not load', async () => {
    await load({ missingApp: true }); assert(!$('about').hidden && !$('resources').hidden, 'static content available');
    assert($('resources').querySelector('a').href.startsWith('https://www.calpoly.edu/'), 'official link available');
  });
  await check('unsafe source data is rejected by the real controller', async () => {
    await load({ dataSetup: 'OPPORTUNITIES[0].source="javascript:alert(1)";' }); equal(cards().length, 0); assert($('status').textContent.includes('could not be loaded'), 'unsafe source rejected');
  });
  await check('untrusted title text is rendered as text, never HTML', async () => {
    await load({ dataSetup: 'OPPORTUNITIES[0].title="<img src=x onerror=alert(1)>";' });
    equal(cards()[0].querySelector('.card-title').textContent, '<img src=x onerror=alert(1)>'); equal(cards()[0].querySelectorAll('img').length, 0);
  });
  await check('reduced-motion preference bypasses controller animations', async () => {
    await load({ reduced: true }); cards()[0].click(); equal($('opportunity-dialog').getAnimations().length, 0);
    $('close-dialog').click(); assert(!$('opportunity-dialog').open, 'immediate close'); await settle();
  });
  await load();
  document.getElementById('summary').textContent = `${passed} passed; ${failed} failed. Native keyboard, viewport, and OS reduced-motion checks are separate.`;
  document.title = `${failed ? 'FAIL' : 'PASS'} — Opportunity Matcher browser tests`;
})();
