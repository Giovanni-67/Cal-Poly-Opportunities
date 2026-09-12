'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const data = require('../data.js');
const { findMatches, orderMatches, safeSource, validData, normalize } = require('../matcher.js');
const ids = result => result.matches.map(match => match.item.id);

test('curated data is valid, unique, sourced, and all records are browsable', () => {
  assert.equal(data.length, 18);
  assert.ok(validData(data));
  assert.equal(findMatches(data).matches.length, data.length);
  assert.ok(findMatches(data).matches.every(match => match.reason));
});
test('AI uses whole words and produces real reasons', () => {
  const result = findMatches(data, { query: 'AI' });
  assert.deepEqual(ids(result), ['csai', 'computing-research', 'business-surp']);
  assert.ok(result.matches.every(match => /AI/.test(match.reason)));
});
test('major-first accepts aliases and does not prevent browsing other majors', () => {
  assert.deepEqual(ids(findMatches(data, { query: 'CS' })), ids(findMatches(data, { query: 'computer science' })));
  assert.ok(ids(findMatches(data, { query: 'psychology' })).includes('ux'));
  assert.ok(ids(findMatches(data, { query: 'ME' })).includes('robotics'));
  assert.equal(findMatches(data).matches.length, 18);
});
test('case, surrounding whitespace, accents, and punctuation normalize', () => {
  assert.deepEqual(ids(findMatches(data, { query: '  ARTIFICIAL-intelligence! ' })), ids(findMatches(data, { query: 'ai' })));
  assert.equal(normalize('résumé'), 'resume');
});
test('multiple interests use OR, type and query refine with AND', () => {
  const result = findMatches(data, { interests: ['ai', 'hardware'], type: 'club' });
  assert.deepEqual(ids(result), ['csai', 'wish', 'computing-research']);
  assert.ok(result.matches.every(match => match.reason.includes('Related to')));
  assert.deepEqual(ids(findMatches(data, { query: 'AI', interests: ['hardware'] })), []);
});
test('all six categories can be independently explored', () => {
  for (const type of ['club', 'research', 'competition', 'startup', 'internship', 'hands-on']) {
    const matches = findMatches(data, { type }).matches;
    assert.ok(matches.length);
    assert.ok(matches.every(match => match.item.type === type));
  }
});
test('empty searches browse all; unknown, zero, punctuation and hostile text invent nothing', () => {
  assert.equal(findMatches(data, { query: '   ' }).matches.length, data.length);
  for (const query of ['quantum banana', '0', '<script>alert(1)</script>']) assert.deepEqual(ids(findMatches(data, { query })), []);
  assert.equal(findMatches(data, { query: '!!!' }).matches.length, data.length);
});
test('invalid values and excessive input return an actionable error', () => {
  for (const options of [{ query: null }, { query: 0 }, { query: 'x'.repeat(201) }, { interests: null }, { interests: ['fake'] }, { interests: [null] }, { type: 'toString' }, { type: 'fake' }]) {
    assert.match(findMatches(data, options).error, /available filters/);
  }
  assert.equal(findMatches(data, { query: 'x'.repeat(200) }).error, null);
});
test('missing, malformed, duplicate and unsafe datasets fail clearly', () => {
  for (const broken of [undefined, null, [], {}, [null], [data[0], data[0]], [{ ...data[0], title: '' }], [{ ...data[0], tags: [null] }], [{ ...data[0], source: 'javascript:alert(1)' }]]) {
    assert.match(findMatches(broken).error, /could not be loaded/);
  }
});
test('official URLs reject spoofed domains, credentials, protocols, and ports', () => {
  for (const url of ['javascript:alert(1)', 'http://calpoly.edu/', 'https://calpoly.edu.evil.com/', 'https://evilcalpoly.edu/', 'https://a:b@calpoly.edu/', 'https://calpoly.edu:444/', null]) assert.equal(safeSource(url), false);
  assert.equal(safeSource('https://studentresearch.calpoly.edu/'), true);
});
test('general-interest clubs need no invented major association', () => {
  const club = { ...data[0], id: 'chess', title: 'Chess Club', description: 'Explore chess.', tags: ['chess'], majors: [] };
  assert.ok(validData([club]));
  assert.equal(findMatches([club], { query: 'chess' }).matches.length, 1);
  assert.equal(findMatches([club], { query: 'computer science' }).matches.length, 0);
  for (const majors of [null, undefined, 'biology', [null], ['']]) assert.equal(validData([{ ...club, majors }]), false);
});
test('repeat searches and duplicate interests are deterministic and do not mutate data', () => {
  const before = JSON.stringify(data);
  const options = { interests: ['ai', 'ai'] };
  assert.deepEqual(findMatches(data, options), findMatches(data, { interests: ['ai'] }));
  assert.deepEqual(findMatches(data, options), findMatches(data, options));
  assert.equal(JSON.stringify(data), before);
});
test('new cards append after previously discovered matches without stale results or duplicates', () => {
  const first = orderMatches(findMatches(data, { query: 'hardware' }).matches);
  const second = orderMatches(findMatches(data, { interests: ['hardware', 'ai'] }).matches, first.history);
  assert.deepEqual(ids(second).slice(0, first.matches.length), ids(first));
  assert.ok(ids(second).indexOf('csai') > ids(second).indexOf('robotics'));
  const narrowed = orderMatches(findMatches(data, { query: 'ai' }).matches, second.history);
  assert.ok(!ids(narrowed).includes('robotics'));
  assert.equal(new Set(narrowed.history).size, narrowed.history.length);
  assert.deepEqual(orderMatches(second.matches, second.history), second);
});
