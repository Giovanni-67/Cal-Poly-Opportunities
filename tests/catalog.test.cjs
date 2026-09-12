'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const directory = require('../club-data.js');
const catalog = require('../data.js');
const matcher = require('../matcher.js');

test('snapshot contains exactly the 406 public SLO organization IDs reviewed from the directory', () => {
  assert.equal(directory.length, 406);
  assert.ok(matcher.validData(directory));
  // Independently fixed against the reviewed directory snapshot, not generated at test time.
  const digest = createHash('sha256').update(directory.map(item => item.directoryId).sort().join('\n')).digest('hex');
  assert.equal(digest, '45279d100ae719677fe421d33590626aa3a628b2db5eb5cb43ecd4e7ad43d613');
  assert.equal(new Set(directory.map(item => item.source)).size, 406);
  for (const item of directory) {
    assert.match(item.source, /^https:\/\/now\.calpoly\.edu\/organization\/[a-z0-9_-]+$/i);
    assert.equal(item.reviewed, '2026-09-12');
    assert.ok(item.description.length > 30 && item.description.length < 260);
    assert.ok(item.note.includes('does not verify recruiting'));
    assert.equal(item.type, 'club');
    assert.ok(!Object.keys(item).some(key => /email|phone|officer|contact|eligibility|roster/i.test(key)));
  }
});

test('full catalog retains original entries and includes each directory club exactly once', () => {
  assert.equal(catalog.length, 419);
  assert.ok(matcher.validData(catalog));
  for (const item of directory) assert.equal(catalog.filter(row => row.directoryId === item.directoryId).length, 1, item.title);
  for (const id of ['csai', 'security', 'hack4impact', 'wish', 'games']) {
    const row = catalog.find(item => item.id === id);
    assert.ok(row.directoryId);
    assert.match(row.source, /^https:\/\/now\.calpoly\.edu\/organization\//);
  }
  const all = matcher.findMatches(catalog);
  assert.equal(all.matches.length, catalog.length);
  assert.ok(all.matches.every(match => match.reason.length > 0));
});

test('search reaches broader majors and interests with honest reasons', () => {
  for (const query of ['animal science', 'music', 'history', 'agriculture', 'finance', 'arts', 'service', 'outdoors', 'Gamma Zeta Alpha']) {
    const result = matcher.findMatches(catalog, { query });
    assert.ok(result.matches.length > 0, query);
    assert.ok(result.matches.every(match => match.reason));
  }
  for (const interest of ['business', 'arts', 'service', 'outdoors']) {
    const result = matcher.findMatches(catalog, { interests: [interest], type: 'club' });
    assert.ok(result.matches.length > 0);
    assert.ok(result.matches.every(({ item }) => item.tags.includes(interest) && item.type === 'club'));
  }
  assert.deepEqual(matcher.findMatches(catalog, { query: 'volunteering' }), matcher.findMatches(catalog, { query: 'service' }));
  assert.deepEqual(matcher.findMatches(catalog, { query: 'quantum banana' }).matches, []);
});

test('clubs without a major association remain searchable and unrestricted', () => {
  const general = directory.filter(item => !item.majors.length);
  assert.ok(general.length > 200);
  for (const item of general) {
    assert.ok(matcher.findMatches(catalog, { query: item.title }).matches.some(match => match.item.directoryId === item.directoryId), item.title);
  }
});

test('ambiguous and negated source words do not create misleading major or interest associations', () => {
  for (const [id, query] of [['429268', 'animal science'], ['325175', 'marine sciences'], ['330417', 'construction management'], ['325081', 'politics'], ['325081', 'faith']]) {
    assert.ok(!matcher.findMatches(catalog, { query }).matches.some(match => match.item.directoryId === id), `${id}: ${query}`);
  }
  const architecture = matcher.findMatches(catalog, { query: 'architecture' }).matches.find(match => match.item.directoryId === '420941');
  assert.ok(architecture.reason.includes('title, description, or discovery tags'));
  assert.ok(!architecture.item.majors.includes('architecture'));
});

test('missing, empty, malformed, or incomplete directory fails closed without script exceptions', () => {
  const source = readFileSync(require.resolve('../data.js'), 'utf8');
  for (const value of [undefined, null, [], [null], [{ ...directory[0], source: 'javascript:alert(1)' }], directory.slice(0, 1)]) {
    const context = { CLUB_DIRECTORY: value, OpportunityMatcher: matcher };
    runInNewContext(source, context);
    assert.equal(context.OPPORTUNITIES, null);
  }
});
