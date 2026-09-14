'use strict';

// Real DOM integration tests, without a framework. Native keyboard/focus and
// responsive visual checks are also exercised manually in the browser.
(async function () {
  const frame = document.getElementById('app');
  const log = document.getElementById('checks');
  const original = (await (await fetch('../index.html', { cache: 'no-store' })).text()).replace(/\?v=\d+(?:-\d+)?/g, '');
  const base = new URL('../', location.href).href;
  let doc;
  let passed = 0;
  let failed = 0;
  function assert(value, message) { if (!value) throw new Error(message); }
  const $ = id => doc.getElementById(id);
  const cards = () => [...doc.querySelectorAll('#results .opportunity-card')];
  const ids = () => cards().map(card => card.dataset.id);
  const equal = (actual, expected) => assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  const settle = () => new Promise(resolve => setTimeout(resolve, 450));
  async function load({ missingData = false, missingDirectory = false, missingMatcher = false, missingApp = false, fullCatalog = false, dataSetup = '', reduced = false, keepStorage = false, storageMode = '', missingCampus = false } = {}) {
    if (!keepStorage) window.fixtureStorage = new Map();
    window.fixtureStorageMode = storageMode;
    let html = original.replace('<head>', `<head><base href="${base}">`);
    if (missingCampus) html = html.replace('<script defer src="campus-data.js"></script>', '');
    if (missingData) html = html.replace('<script defer src="data.js"></script>', '');
    if (missingDirectory) html = html.replace('<script defer src="club-data.js"></script>', '');
    if (missingMatcher) html = html.replace('<script defer src="matcher.js"></script>', '');
    if (missingApp) html = html.replace('<script defer src="app.js"></script>', '');
    // Run fixture setup before deferred production scripts. Intercept only
    // the external input being tested; the controller and matcher are real.
    // Preserve the original small regression fixture; full-catalog tests below
    // independently exercise every production record and all result batches.
    const storageSetup = `Object.defineProperty(window,'localStorage',{value:{getItem(key){if(parent.fixtureStorageMode==='blocked')throw Error('Blocked');return parent.fixtureStorage.get(key)??null;},setItem(key,value){if(parent.fixtureStorageMode==='quota')throw Error('Quota');parent.fixtureStorage.set(key,value);}}});`;
    const setup = storageSetup + (fullCatalog ? '' : 'if(Array.isArray(globalThis.OPPORTUNITIES)) OPPORTUNITIES=OPPORTUNITIES.slice(0,18);') + dataSetup;
    if (setup) html = html.replace('<script defer src="app.js"></script>', `<script defer src="data:text/javascript,${encodeURIComponent(setup)}"></script><script defer src="app.js"></script>`);
    if (reduced) html = html.replace('<head>', '<head><script>window.matchMedia=()=>({matches:true});<\/script>');
    html = html.replace(/(src|href)="([\w-]+\.(?:js|css))"/g, (_, attribute, file) => `${attribute}="${file}?test=${Date.now()}"`);
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
    for (const view of ['study', 'resources', 'bookmarks', 'about', 'explore']) {
      doc.querySelector(`a[href="#${view}"]`).click(); await settle();
      equal([...doc.querySelectorAll('[data-view]')].filter(panel => !panel.hidden).map(panel => panel.id), [view]);
      equal(doc.querySelector('nav [aria-current="page"]')?.hash || null, view === 'about' ? null : `#${view}`);
      equal(doc.querySelectorAll('nav .active').length, view === 'about' ? 0 : 1);
      equal(doc.activeElement.id, view === 'explore' ? 'page-title' : `${view}-title`);
      assert(doc.title.includes(view === 'explore' ? 'Find your next' : view.charAt(0).toUpperCase() + view.slice(1)), 'view title');
    }
  });
  await check('navigation preserves search and filters; logo and skip link return to Explore', async () => {
    search('AI'); choose('type', 'research'); const previous = ids();
    doc.querySelector('a[href="#about"]').click(); await settle();
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
    equal($('resources').querySelectorAll('.opportunity-card').length, 14);
    equal($('resources').querySelector('time').dateTime, '2026-09-13');
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
    equal($('detail-link').href, 'https://now.calpoly.edu/organization/csai'); assert($('detail-source').textContent.includes('2026-09-12'), 'source date');
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
  await check('empty and whitespace submissions browse all with feedback and result focus', async () => {
    await load();
    $('browse-all').click();
    for (const query of ['', '   ', '', '\t']) {
      search(query); equal(cards().length, 18); equal(new Set(ids()).size, 18);
      assert($('status').textContent.includes('Showing all 18 opportunities'), 'explicit browse feedback');
      equal(doc.activeElement.id, 'results-title'); equal($('results-title').getAttribute('aria-describedby'), 'status');
      assert(!$('search').hasAttribute('aria-invalid'), 'empty input is valid');
    }
  });
  await check('empty query preserves interest-only and type-only searches', () => {
    choose('interest', 'ai'); search(''); equal(ids(), ['csai', 'computing-research', 'business-surp']);
    assert($('status').textContent.includes('3 matches'), 'interest feedback');
    $('browse-all').click(); choose('type', 'internship'); search('   '); equal(cards().length, 2);
    assert(cards().every(card => card.dataset.type === 'internship'), 'type preserved');
    $('browse-all').click();
  });
  await check('input focus is drawn around the rounded search bar, not the inner field', () => {
    $('search').focus();
    const style = element => frame.contentWindow.getComputedStyle(element);
    equal(style($('search')).outlineStyle, 'none');
    equal(style(doc.querySelector('.search-bar')).outlineStyle, 'solid');
    assert(parseFloat(style(doc.querySelector('.search-bar')).borderRadius) > 0, 'rounded focus container');
  });
  await check('About and official resources remain visible if the app script does not load', async () => {
    await load({ missingApp: true }); assert(!$('about').hidden && !$('resources').hidden, 'static content available');
    assert($('resources').querySelector('a').href === 'https://advising.calpoly.edu/', 'official link available');
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
  await check('large collections load in ordered batches with no duplicates and a correct final page', async () => {
    await load({ dataSetup: 'OPPORTUNITIES=Array.from({length:53},(_,i)=>({...OPPORTUNITIES[0],id:"sample-"+i,title:"Sample "+i}));' });
    equal(cards().length, 24); assert(!$('load-more').hidden, 'more available');
    const first = ids(); $('load-more').click(); equal(cards().length, 48); equal(ids().slice(0, 24), first);
    equal(doc.activeElement.dataset.id, 'sample-24');
    $('load-more').click(); equal(cards().length, 53); equal(new Set(ids()).size, 53);
    equal(ids().at(-1), 'sample-52'); assert($('load-more').hidden, 'complete');
    equal($('result-range').textContent, 'Showing 53 of 53 opportunities');
    $('load-more').click(); equal(cards().length, 53);
    search('Sample 52'); equal(ids(), ['sample-52']); assert($('load-more').hidden, 'filtered last entry reachable');
    search('unknown query'); equal(cards().length, 0); equal($('result-range').textContent, '');
    $('browse-all').click(); equal(cards().length, 24); assert(!$('load-more').hidden, 'reset pagination');
  });
  await check('exact page boundary hides Show more', async () => {
    await load({ dataSetup: 'OPPORTUNITIES=Array.from({length:24},(_,i)=>({...OPPORTUNITIES[0],id:"boundary-"+i}));' });
    equal(cards().length, 24); assert($('load-more').hidden, 'no empty extra page');
  });
  await load();
  await check('complete production catalog is reachable in order without duplicates', async () => {
    await load({ fullCatalog: true, reduced: true });
    const expected = frame.contentWindow.OPPORTUNITIES;
    equal(expected.length, 429); equal(cards().length, 24);
    for (let page = 1; page < Math.ceil(expected.length / 24); page++) $('load-more').click();
    equal(ids(), expected.map(item => item.id)); equal(new Set(ids()).size, expected.length);
    assert($('load-more').hidden, 'last page complete');
    for (const card of cards()) {
      card.click(); equal($('detail-title').textContent, card.querySelector('.card-title').textContent);
      equal($('detail-link').href, expected.find(item => item.id === card.dataset.id).source);
      await new Promise(resolve => {
        $('opportunity-dialog').addEventListener('close', resolve, { once: true });
        $('close-dialog').click();
      });
    }
    search('Gamma Zeta Alpha'); assert(ids().includes('now-325048'), 'last directory entry searchable');
    $('browse-all').click(); equal(cards().length, 24);
    search('   '); assert($('status').textContent.includes('Found all 429'), 'blank full-catalog feedback');
  });
  await check('broader interests and major suggestions use real catalog data', () => {
    for (const interest of ['business', 'arts', 'service', 'outdoors']) {
      $('browse-all').click(); choose('interest', interest); assert(cards().length > 0, `${interest} matches`);
    }
    $('browse-all').click(); search('animal science'); assert(cards().length > 0, 'agriculture major matches');
    const suggestions = [...$('search-suggestions').options].map(option => option.value.toLowerCase());
    assert(suggestions.includes('animal science') && suggestions.includes('music') && suggestions.includes('history'), 'broader suggestions');
    equal(new Set(suggestions).size, suggestions.length);
  });
  await check('missing directory fails visibly instead of silently showing a partial catalog', async () => {
    await load({ missingDirectory: true, fullCatalog: true }); equal(cards().length, 0);
    assert($('status').textContent.includes('could not be loaded'), 'directory failure message');
  });
  await check('navigation order and mobile disclosure support selection and Escape', async () => {
    frame.style.width = '375px';
    await load();
    equal([...doc.querySelectorAll('nav a')].map(link => link.hash), ['#explore', '#study', '#resources', '#bookmarks']);
    $('menu-toggle').click(); equal($('menu-toggle').getAttribute('aria-expanded'), 'true');
    $('menu-toggle').dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    equal($('menu-toggle').getAttribute('aria-expanded'), 'false'); equal(doc.activeElement.id, 'menu-toggle');
    $('menu-toggle').click(); doc.querySelector('a[href="#study"]').click(); await settle();
    equal($('menu-toggle').getAttribute('aria-expanded'), 'false'); equal(doc.activeElement.id, 'study-title');
    frame.style.width = '100%';
  });
  await check('related swimming activities are explained separately without direct-result duplicates', async () => {
    await load({ fullCatalog: true }); search('swimming');
    equal(cards().length, 2); assert(!$('related-section').hidden, 'related section visible');
    const related = [...$('related-results').querySelectorAll('.opportunity-card')];
    assert(related.some(card => /water polo|sailing|surf/i.test(card.textContent)), 'other water activities');
    assert(related.every(card => !ids().includes(card.dataset.id)), 'no direct duplicate');
    assert(related.every(card => card.querySelector('.card-reason').textContent.includes('water activities')), 'honest topic explanation');
    const before = related.map(card => card.dataset.id); search('swimming');
    equal([...$('related-results').querySelectorAll('.opportunity-card')].map(card => card.dataset.id), before);
    choose('type', 'research'); equal($('related-results').children.length, 0);
    $('browse-all').click(); assert($('related-section').hidden, 'no fabricated recommendations on blank browse');
    search('zzzz nonexistent'); assert($('related-section').hidden, 'unknown empty state');
  });
  await check('related pagination appends unique items and keeps selected category constraints', async () => {
    await load({ fullCatalog: true }); search('AI');
    const before = [...$('related-results').querySelectorAll('.opportunity-card')].map(card => card.dataset.id);
    assert(!$('related-more').hidden, 'more related computing activities');
    $('related-more').click();
    const after = [...$('related-results').querySelectorAll('.opportunity-card')].map(card => card.dataset.id);
    equal(after.slice(0, before.length), before); assert(after.length > before.length, 'appended'); equal(new Set(after).size, after.length);
    choose('type', 'club'); assert([...$('related-results').querySelectorAll('.opportunity-card')].every(card => card.dataset.type === 'club'), 'category respected');
  });
  const campusIds = view => [...$(`${view}-results`).querySelectorAll('.opportunity-card')].map(card => card.dataset.id);
  const campusSearch = (view, query) => { $(`${view}-search`).value = query; $(`${view}-form`).requestSubmit(); };
  await check('study search covers locations and verified features, AND filters, empty and recovery cases', async () => {
    await load(); equal(campusIds('study').length, 10);
    doc.querySelector('a[href="#study"]').click(); await settle();
    campusSearch('study', '115C'); equal(campusIds('study'), ['dss-study']);
    equal(doc.activeElement.id, 'study-results-title');
    campusSearch('study', '   '); equal(campusIds('study').length, 10);
    choose('study-filter', 'reservable'); equal(campusIds('study'), ['student-fishbowls', 'dss-study']);
    choose('study-filter', 'outdoors'); equal(campusIds('study'), []); assert(!$('study-empty').hidden, 'no contradictory features');
    $('study-clear').click(); campusSearch('study', 'power access'); equal(campusIds('study'), ['uu-common']);
    campusSearch('study', '<img>'); equal(campusIds('study'), []);
    $('study-clear').click(); equal(campusIds('study').length, 10);
  });
  await check('resources support search and categories beyond the previous four links', () => {
    equal(campusIds('resources').length, 14);
    campusSearch('resources', 'equipment'); assert(campusIds('resources').includes('tech-rental') && campusIds('resources').includes('outdoor-rentals'), 'equipment options');
    choose('resources-filter', 'technology'); equal(campusIds('resources'), ['tech-rental']);
    $('resources-clear').click(); choose('resources-filter', 'making'); equal(campusIds('resources'), ['makerspace', 'craft-center']);
    campusSearch('resources', 'unknown'); equal(campusIds('resources'), []); assert(!$('resources-empty').hidden, 'resource empty state');
    $('resources-clear').click(); equal(campusIds('resources').length, 14);
  });
  await check('every campus card opens its matching official source and access notes', async () => {
    await load({ reduced: true });
    for (const view of ['study', 'resources']) {
      doc.querySelector(`a[href="#${view}"]`).click(); await settle();
      for (const card of $(`${view}-results`).querySelectorAll('.opportunity-card')) {
        card.click(); equal($('detail-title').textContent, card.querySelector('.card-title').textContent);
        assert(frame.contentWindow.OpportunityMatcher.safeSource($('detail-link').href), 'safe official link');
        assert($('detail-note').textContent.length > 20, 'access note');
        await new Promise(resolve => { $('opportunity-dialog').addEventListener('close', resolve, { once: true }); $('close-dialog').click(); });
      }
    }
  });
  await check('bookmark icons save all kinds independently of card opening and persist on reload', async () => {
    await load();
    for (const view of ['explore', 'study', 'resources']) {
      doc.querySelector(`a[href="#${view}"]`).click(); await settle();
      doc.querySelector(`#${view} .bookmark-button`).click(); assert(!$('opportunity-dialog').open, 'save does not open card');
    }
    equal($('bookmark-count').textContent, '3'); equal(campusIds('bookmarks').length, 3);
    await load({ keepStorage: true }); equal($('bookmark-count').textContent, '3'); equal(campusIds('bookmarks').length, 3);
    equal(doc.querySelector('#results .bookmark-button').getAttribute('aria-pressed'), 'true');
    const allIds = [...doc.querySelectorAll('[id]')].map(element => element.id); equal(new Set(allIds).size, allIds.length);
  });
  await check('saved search and type filters preserve bookmarks and removing the last match restores focus', async () => {
    doc.querySelector('a[href="#bookmarks"]').click(); await settle();
    choose('bookmark-kind', 'study'); equal(campusIds('bookmarks'), ['kennedy-study']);
    campusSearch('bookmarks', 'nonexistent'); equal(campusIds('bookmarks'), []); equal($('bookmark-count').textContent, '3');
    $('bookmarks-clear').click(); equal(campusIds('bookmarks').length, 3);
    for (let i = 0; i < 3; i++) { const button = $('bookmarks-results').querySelector('.bookmark-button'); button.focus(); button.click(); }
    equal($('bookmark-count').textContent, '0'); equal(doc.activeElement.id, 'bookmarks-results-title'); assert(!$('bookmarks-empty').hidden, 'empty collection');
    await load({ keepStorage: true }); equal($('bookmark-count').textContent, '0');
  });
  await check('dialog bookmark state synchronizes with cards and removed saved-card focus recovers', async () => {
    await load({ reduced: true }); cards()[0].click(); $('detail-bookmark').click();
    equal($('detail-bookmark').getAttribute('aria-pressed'), 'true'); equal(doc.querySelector('#results .bookmark-button').getAttribute('aria-pressed'), 'true');
    await new Promise(resolve => { $('opportunity-dialog').addEventListener('close', resolve, { once: true }); $('close-dialog').click(); });
    doc.querySelector('a[href="#bookmarks"]').click(); await settle(); $('bookmarks-results').querySelector('.opportunity-card').click(); $('detail-bookmark').click();
    await new Promise(resolve => { $('opportunity-dialog').addEventListener('close', resolve, { once: true }); $('close-dialog').click(); });
    equal(doc.activeElement.id, 'bookmarks-title'); equal($('bookmark-count').textContent, '0');
  });
  await check('storage events update the collection and unknown saved IDs are harmless', async () => {
    await load();
    window.fixtureStorage.set('cal-poly-bookmarks-v1', JSON.stringify(['study:hub24', 'opportunity:unavailable']));
    frame.contentWindow.dispatchEvent(new frame.contentWindow.StorageEvent('storage', { key: 'cal-poly-bookmarks-v1' }));
    equal(campusIds('bookmarks'), ['hub24']); equal($('bookmark-count').textContent, '1');
    window.fixtureStorage.clear(); frame.contentWindow.dispatchEvent(new frame.contentWindow.StorageEvent('storage', { key: null }));
    equal(campusIds('bookmarks'), []); equal($('bookmark-count').textContent, '0');
  });
  await check('blocked, quota-limited, and corrupt storage retain session functionality with honest warnings', async () => {
    for (const mode of ['blocked', 'quota', 'corrupt']) {
      window.fixtureStorage = new Map([['cal-poly-bookmarks-v1', '{bad']]);
      await load({ storageMode: mode, keepStorage: mode === 'corrupt' });
      doc.querySelector('#results .bookmark-button').click(); equal($('bookmark-count').textContent, '1');
      assert(!$('storage-note').hidden && $('storage-note').textContent.includes('visit only'), 'visible storage warning');
      doc.querySelector('a[href="#study"]').click(); await settle(); doc.querySelector('a[href="#bookmarks"]').click(); await settle();
      equal(campusIds('bookmarks'), ['csai']);
      if (mode === 'corrupt') equal(window.fixtureStorage.get('cal-poly-bookmarks-v1'), '{bad');
    }
  });
  await check('bookmarks paginate past 24 and can find items not yet displayed', async () => {
    await load({ fullCatalog: true });
    const keys = frame.contentWindow.OPPORTUNITIES.slice(0, 53).map(item => `opportunity:${item.id}`);
    window.fixtureStorage.set('cal-poly-bookmarks-v1', JSON.stringify(keys));
    frame.contentWindow.dispatchEvent(new frame.contentWindow.StorageEvent('storage', { key: 'cal-poly-bookmarks-v1' }));
    equal(campusIds('bookmarks').length, 24); $('bookmarks-more').click(); equal(campusIds('bookmarks').length, 48);
    $('bookmarks-more').click(); equal(campusIds('bookmarks').length, 53); equal(new Set(campusIds('bookmarks')).size, 53); assert($('bookmarks-more').hidden, 'last saved page');
    campusSearch('bookmarks', frame.contentWindow.OPPORTUNITIES[52].title); assert(campusIds('bookmarks').includes(keys[52].split(':')[1]), 'search full saved catalog');
  });
  await check('missing or unsafe campus data fails visibly with static official recovery links', async () => {
    for (const options of [{ missingCampus: true }, { dataSetup: 'CAMPUS_PLACES[0].source="javascript:alert(1)"; CAMPUS_RESOURCES=null;' }]) {
      await load(options); equal(campusIds('study'), []); equal(campusIds('resources'), []);
      assert($('study-status').textContent.includes('could not load'), 'study error'); assert($('resources-status').textContent.includes('could not load'), 'resource error');
      assert($('study').querySelector('a[href^="https://library.calpoly.edu"]'), 'static study link remains available alongside photo credits');
      assert($('resources').querySelector('a').href.includes('advising.calpoly.edu'), 'static resource link');
      equal(cards().length, 18);
    }
  });
  await check('Report bugs lives in the footer, preserves primary tabs, and FAQ details toggle', async () => {
    await load(); doc.querySelector('.site-footer a[href="#report"]').click(); await settle();
    assert(!$('report').hidden, 'report view'); equal(doc.activeElement.id, 'report-title'); assert(doc.title.includes('Report bugs'), 'title');
    equal([...doc.querySelectorAll('nav a')].map(link => link.hash), ['#explore', '#study', '#resources', '#bookmarks']);
    const faq = $('report').querySelectorAll('details')[1]; assert(!faq.open, 'collapsed'); faq.querySelector('summary').click(); assert(faq.open, 'expanded'); faq.querySelector('summary').click(); assert(!faq.open, 'collapsed again');
  });
  await check('bug report validates blank, whitespace, malformed email, short and excessive content without sending', () => {
    let sent = 0; $('bug-form').addEventListener('submit', event => { if (!event.defaultPrevented) sent++; event.preventDefault(); });
    const fill = (id, value) => { $(id).value = value; $(id).dispatchEvent(new frame.contentWindow.Event('input', { bubbles: true })); };
    $('bug-form').requestSubmit(); equal(sent, 0); assert($('bug-status').textContent.includes('check'), 'invalid feedback');
    fill('bug-name', '   '); fill('bug-email', 'student@example.com'); fill('bug-description', 'A clearly labeled test report.'); $('bug-form').requestSubmit(); equal(sent, 0);
    fill('bug-name', 'Test student'); fill('bug-email', 'not-an-email'); $('bug-form').requestSubmit(); equal(sent, 0);
    fill('bug-email', 'student@example.com'); fill('bug-description', 'short'); $('bug-form').requestSubmit(); equal(sent, 0);
    fill('bug-description', 'x'.repeat(5001)); $('bug-form').requestSubmit(); equal(sent, 0);
    fill('bug-name', 'x'.repeat(101)); fill('bug-description', 'A clearly labeled test report.'); $('bug-form').requestSubmit(); equal(sent, 0);
    $('bug-form').reset(); equal($('bug-description').value, ''); equal($('bug-status').textContent, '');
  });
  await check('valid bug reports use the approved native POST, retain drafts, and never claim inbox delivery', async () => {
    await load(); doc.querySelector('.site-footer a[href="#report"]').click(); await settle();
    let payload;
    $('bug-form').addEventListener('submit', event => { if (!event.defaultPrevented) payload = Object.fromEntries(new frame.contentWindow.FormData($('bug-form'))); event.preventDefault(); });
    $('bug-name').value = ' Test student '; $('bug-email').value = 'student@example.com'; $('bug-description').value = ' A clearly labeled <script> test report & details. ';
    $('bug-form').requestSubmit(); equal(payload.name, 'Test student'); equal(payload.email, 'student@example.com'); equal(payload.message, 'A clearly labeled <script> test report & details.');
    equal($('bug-form').action, 'https://formsubmit.co/349ae6b42405291765c7062777df5d93'); equal($('bug-form').method, 'post'); equal($('bug-form').target, '_blank');
    equal(doc.querySelector('meta[name="referrer"]').content, 'no-referrer-when-downgrade');
    equal($('bug-form').rel, 'noopener'); // FormSubmit requires the referring website; keep opener protection without suppressing it.
    assert(!$('bug-form').querySelector('[name="_captcha"][value="false"]'), 'provider spam protection preserved'); equal(payload._honey, '');
    equal(payload._url, 'https://giovanni-67.github.io/Cal-Poly-Opportunities/#report');
    equal(payload._next, 'https://giovanni-67.github.io/Cal-Poly-Opportunities/#report-sent');
    assert($('bug-status').textContent.includes('Finish sending'), 'honest handoff'); equal($('bug-description').value, payload.message);
    assert($('bug-privacy').textContent.includes('FormSubmit') && $('bug-privacy').textContent.includes('gpeila@calpoly.edu'), 'recipient and processor disclosure');
    assert($('report').querySelector('a[href^="mailto:gpeila@calpoly.edu"]'), 'email fallback'); equal(window.fixtureStorage.size, 0);
    doc.querySelector('a[href="#explore"]').click(); await settle(); doc.querySelector('a[href="#report"]').click(); await settle(); equal($('bug-description').value, payload.message);
    $('bug-form').reset(); equal($('bug-description').value, '');
  });
  await check('bug report remains a functional native form when app code is unavailable', async () => {
    await load({ missingApp: true }); assert(!$('report').hidden, 'static report visible');
    equal($('bug-form').method, 'post'); assert($('bug-name').required && $('bug-email').required && $('bug-description').required, 'native validation');
    equal($('bug-email').type, 'email'); equal($('bug-description').maxLength, 5000); equal($('bug-form').action, 'https://formsubmit.co/349ae6b42405291765c7062777df5d93');
  });
  await check('provider return opens the report view with an honest acknowledgement and usable navigation', async () => {
    await load(); frame.contentWindow.location.hash = 'report-sent'; await settle();
    assert(!$('report').hidden && !$('report-return').hidden, 'report confirmation visible'); equal(doc.activeElement.id, 'report-title');
    assert($('report-return').textContent.includes('email delivery still depends'), 'does not claim inbox delivery');
    doc.querySelector('a[href="#explore"]').click(); await settle(); assert($('report-return').hidden, 'notice cleared on navigation');
    doc.querySelector('a[href="#report"]').click(); await settle(); assert(!$('report').hidden && $('report-return').hidden, 'ordinary form visit');
  });
  await check('career announcements sit between filters and results, filter companies independently, and expand', async () => {
    await load({ dataSetup: "Date.now=()=>1799956800000; CareerEvents.events.forEach(e=>{ e.start=e.start.replace('2026','2027'); e.end=e.end.replace('2026','2027'); });" });
    assert($('search-form').compareDocumentPosition($('career-events')) & 4, 'after filters');
    assert($('career-events').compareDocumentPosition($('results')) & 4, 'before opportunities');
    equal($('career-list').children.length, 3);
    $('career-more').click(); equal($('career-list').children.length, 5);
    $('career-more').click(); equal($('career-list').children.length, 3);
    const originalCards = ids();
    $('career-search').value = 'RoviSys'; $('career-search').dispatchEvent(new Event('input', { bubbles: true }));
    equal($('career-list').children.length, 1); assert($('career-list').textContent.includes('Day 2'), 'verified employer matches correct fair day'); equal(ids(), originalCards);
    $('career-type').value = 'networking'; $('career-type').dispatchEvent(new Event('input', { bubbles: true }));
    equal($('career-list').children.length, 0); assert($('career-status').textContent.includes('does not mean'), 'honest empty state');
    $('career-search').value = ''; $('career-type').value = 'all'; $('career-form').requestSubmit(); equal($('career-list').children.length, 3);
    $('career-more').click(); assert($('career-list').textContent.includes('Cal Poly Recreation Center'), 'verified location');
    assert($('career-list').textContent.includes('Location: check'), 'unverified locations marked');
    const sourceLink = $('career-list').querySelector('a'); sourceLink.focus();
    doc.dispatchEvent(new Event('visibilitychange')); assert(doc.activeElement === sourceLink, 'refresh preserves link focus');
    for (const width of [375, 1280]) {
      frame.style.width = width + 'px'; await settle();
      const section = $('career-events').getBoundingClientRect();
      assert(section.right <= doc.documentElement.clientWidth + 1, 'section fits viewport');
      assert($('career-list').scrollWidth <= $('career-list').clientWidth + 1, 'cards do not overflow');
    }
    frame.style.width = '100%';
  });
  await check('expired career collection retains useful official links', async () => {
    await load({ dataSetup: 'Date.now=()=>1893456000000;' });
    equal($('career-list').children.length, 0);
    assert($('career-status').textContent.includes('No upcoming'), 'expired snapshot is honest');
    assert($('career-events').querySelector('a[href="https://careerservices.calpoly.edu/explore-services/mustangjobs"]'), 'directory still usable');
  });
  await check('campus groups retain every record once and disappear when filters have no matches', async () => {
    await load();
    for (const [view, count] of [['study', 10], ['resources', 14]]) {
      doc.querySelector(`a[href="#${view}"]`).click(); await settle();
      equal(campusIds(view).length, count); equal(new Set(campusIds(view)).size, count);
      const headings = () => [...$(`${view}-results`).querySelectorAll('.directory-heading')];
      assert(headings().length > 1, 'meaningful groups');
      for (const heading of headings()) assert(heading.nextElementSibling?.classList.contains('card-shell'), 'each group has results');
      campusSearch(view, 'zzzz-no-campus-match'); equal(headings().length, 0); equal(campusIds(view), []);
      $(`${view}-clear`).click(); equal(campusIds(view).length, count);
    }
    campusSearch('resources', 'tutoring');
    assert(campusIds('resources').length > 0 && campusIds('resources').length < 14, 'search still refines grouped resources');
  });
  await check('event search expands without hiding the agenda and retains its independent query', async () => {
    await load({ dataSetup: "Date.now=()=>1799956800000; CareerEvents.events.forEach(e=>{ e.start=e.start.replace('2026','2027'); e.end=e.end.replace('2026','2027'); });" });
    const details = doc.querySelector('.career-search-details');
    assert(!details.open && $('career-list').children.length === 3, 'agenda visible with search collapsed');
    details.querySelector('summary').click(); assert(details.open && $('career-search').getClientRects().length, 'search is reachable');
    $('career-search').value = 'RoviSys'; $('career-form').requestSubmit(); equal($('career-list').children.length, 1);
    details.querySelector('summary').click(); assert(!details.open, 'collapses'); equal($('career-list').children.length, 1);
    details.querySelector('summary').click(); equal($('career-search').value, 'RoviSys');
    search('AI'); equal($('career-list').children.length, 1);
  });
  await check('every redesigned view fits narrow mobile, tablet, and desktop widths', async () => {
    await load(); doc.querySelector('#results .bookmark-button').click();
    for (const width of [320, 375, 768, 1280]) {
      frame.style.width = width + 'px';
      for (const view of ['explore', 'study', 'resources', 'bookmarks', 'about', 'report']) {
        doc.querySelector(`a[href="#${view}"]`).click(); await settle();
        assert(doc.documentElement.scrollWidth <= doc.documentElement.clientWidth + 1, `${view} overflows at ${width}px`);
        for (const button of $(view).querySelectorAll('.bookmark-button')) {
          const box = button.getBoundingClientRect(); assert(box.width >= 44 && box.height >= 44, 'bookmark target remains usable');
        }
      }
    }
    frame.style.width = '100%';
  });
  document.getElementById('summary').textContent = `${passed} passed; ${failed} failed. Native keyboard, viewport, and OS reduced-motion checks are separate.`;
  document.title = `${failed ? 'FAIL' : 'PASS'} — Opportunity Matcher browser tests`;
})();
