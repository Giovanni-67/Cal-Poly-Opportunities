'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const data = require('../data.js');
const matcher = require('../matcher.js');
const { findRelated } = require('../discovery.js');
const { KEY, createStore } = require('../bookmarks.js');
const ids = result => result.matches.map(match => match.item.id);
const storage = () => { const entries = new Map(); return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) }; };

test('swimming directly finds Swim and Triathlon, then suggests distinct water activities', () => {
  const direct = ids(matcher.findMatches(data, { query: 'swimming' }));
  assert.ok(direct.includes('now-325168') && direct.includes('now-325050'));
  const related = findRelated(data, { query: 'swimming' });
  for (const id of ['now-324987', 'now-325176', 'now-325139']) assert.ok(ids(related).includes(id));
  assert.ok(related.matches.every(match => !direct.includes(match.item.id) && match.reason.includes('water activities')));
  assert.equal(new Set(ids(related)).size, related.matches.length);
});
test('related discovery covers diverse topics and respects combined filters', () => {
  for (const query of ['photography', 'coding', 'hiking', 'finance', 'music', 'animal science', 'law', 'tennis']) assert.ok(findRelated(data, { query }).matches.length > 0, query);
  const options = { query: 'coding', type: 'club', interests: ['hardware'] };
  const direct = ids(matcher.findMatches(data, options));
  assert.ok(findRelated(data, options).matches.every(({ item }) => item.type === 'club' && item.tags.includes('hardware') && !direct.includes(item.id)));
});
test('empty, unknown, invalid, and excessive queries do not fabricate related matches', () => {
  for (const query of ['', '   ', 'quantum banana', '<script>', 'x'.repeat(201)]) assert.deepEqual(findRelated(data, { query }).matches, []);
  assert.ok(findRelated(null, { query: 'swimming' }).error);
  assert.ok(findRelated(data, { interests: ['invalid'] }).error);
  assert.deepEqual(findRelated(data, { type: 'club' }).matches, []);
});
test('specific titles use explicit shared discovery tags and repeated searches stay stable', () => {
  const before = JSON.stringify(data);
  const result = findRelated(data, { query: 'Hack4Impact' });
  assert.ok(result.matches.length);
  assert.ok(result.matches.every(match => match.reason.startsWith('Shares ')));
  assert.deepEqual(findRelated(data, { query: 'swimming' }), findRelated(data, { query: 'swimming' }));
  assert.equal(JSON.stringify(data), before);
});
test('bookmarks toggle and survive store recreation across all three item kinds', () => {
  const disk = storage(); const first = createStore(() => disk);
  for (const key of ['opportunity:csai', 'study:library', 'resource:tutoring']) assert.equal(first.toggle(key), true);
  const second = createStore(() => disk); assert.equal(second.keys().length, 3);
  assert.equal(second.toggle('study:library'), false);
  assert.equal(createStore(() => disk).has('study:library'), false);
  first.refresh(); assert.equal(first.keys().length, 2);
});
test('bookmark changes read fresh storage and synchronize removal without losing another tab additions', () => {
  const disk = storage(); const a = createStore(() => disk); const b = createStore(() => disk);
  a.toggle('opportunity:csai'); b.toggle('study:library'); a.refresh(); assert.equal(a.keys().length, 2);
  b.toggle('opportunity:csai'); a.refresh(); assert.deepEqual(a.keys(), ['study:library']);
  disk.removeItem(KEY); a.refresh(); assert.deepEqual(a.keys(), []);
});
test('corrupt, invalid, oversized, and blocked storage preserve safe session bookmarks', () => {
  for (const raw of ['bad json', '{}', 'null', '[null]', '["javascript:alert(1)"]', JSON.stringify(Array(2001).fill('study:library'))]) {
    const disk = storage(); disk.setItem(KEY, raw); const store = createStore(() => disk);
    assert.deepEqual(store.keys(), []); assert.ok(store.message());
    assert.equal(store.toggle('study:library'), true); assert.equal(store.has('study:library'), true);
    assert.equal(disk.getItem(KEY), raw, 'do not overwrite unreadable saved data');
  }
  const blocked = createStore(() => { throw new Error('blocked'); });
  blocked.toggle('resource:tutoring'); assert.equal(blocked.has('resource:tutoring'), true); assert.ok(blocked.message());
});
test('quota failure keeps current selection and never reports durable persistence', () => {
  const disk = storage(); const store = createStore(() => disk);
  disk.setItem = () => { throw new Error('quota'); };
  store.toggle('study:library'); assert.equal(store.has('study:library'), true); assert.match(store.message(), /visit only/);
  store.toggle('study:library'); assert.equal(store.has('study:library'), false);
  for (const key of [null, '', 'unknown:x', '<script>', 0]) assert.equal(store.toggle(key), false);
});
