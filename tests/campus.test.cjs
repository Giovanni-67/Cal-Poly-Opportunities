'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const matcher = require('../matcher.js');
const { places, resources } = require('../campus-data.js');

test('campus collections are complete, unique, official, and unrestricted', () => {
  assert.equal(places.length, 10); assert.equal(resources.length, 14);
  for (const [data, type] of [[places, 'study'], [resources, 'resource']]) {
    assert.ok(matcher.validData(data));
    assert.equal(new Set(data.map(item => item.id)).size, data.length);
    assert.equal(matcher.findMatches(data).matches.length, data.length);
    for (const item of data) {
      assert.equal(item.type, type); assert.ok(matcher.safeSource(item.source));
      assert.equal(item.reviewed, '2026-09-13'); assert.ok(item.note && item.sourceName);
      assert.deepEqual(item.majors, []); assert.ok(!Object.hasOwn(item, 'eligibility'));
    }
  }
});

test('study feature tags have deliberately narrow source-backed assignments', () => {
  const ids = tag => places.filter(item => item.tags.includes(tag)).map(item => item.id);
  assert.deepEqual(ids('power'), ['uu-common']);
  assert.deepEqual(ids('quiet'), ['kennedy-study']);
  assert.deepEqual(ids('reservable'), ['student-fishbowls', 'dss-study']);
  assert.deepEqual(ids('late'), ['hub24']);
  assert.match(places.find(item => item.id === 'hub24').note, /PolyCard/);
  assert.match(places.find(item => item.id === 'uu-common').note, /not a promise/);
});

test('all resource filters lead to real entries and safe malformed-data failures remain intact', () => {
  for (const tag of ['academic', 'making', 'technology', 'career', 'support', 'research', 'recreation']) {
    assert.ok(resources.some(item => item.tags.includes(tag)), tag);
  }
  for (const data of [null, undefined, [], [{ ...places[0], source: 'https://calpoly.edu.evil.example/' }], [places[0], places[0]]]) {
    assert.ok(matcher.findMatches(data).error);
  }
});
