'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { events, selectEvents, validEvent, safeSource, formatEvent } = require('../career-events.js');
const now = Date.parse('2026-09-14T12:00:00-07:00');
test('career snapshot has five unique, sourced, future events and only a verified company', () => {
  assert.equal(events.length, 5);
  assert.equal(new Set(events.map(e => e.id)).size, 5);
  assert.ok(events.every(validEvent));
  assert.equal(selectEvents(events, { now }).length, 5);
  assert.deepEqual(events.flatMap(e => e.companies.map(c => c.name)), ['RoviSys']);
  assert.equal(events.find(e => e.id === 'business-fair').location, 'Cal Poly Recreation Center');
});
test('filters combine event names, companies and types without inventing unknown employers', () => {
  assert.deepEqual(selectEvents(events, { now, query: '  ROVISYS ' }).map(e => e.id), ['fall-day-2']);
  assert.equal(selectEvents(events, { now, query: 'Deloitte' }).length, 0);
  assert.equal(selectEvents(events, { now, type: 'networking' }).length, 2);
  assert.equal(selectEvents(events, { now, type: 'fair' }).length, 3);
  assert.equal(selectEvents(events, { now, type: 'company' }).length, 1);
  assert.equal(selectEvents(events, { now, type: 'networking', query: 'RoviSys' }).length, 0);
  assert.equal(selectEvents(events, { now, query: 'fall day 2' }).length, 1);
  assert.equal(selectEvents(events, { now, query: ' ' }).length, 5);
  assert.equal(selectEvents(events, { now, query: 'x'.repeat(10000) }).length, 0);
});
test('events expire at the exact end time across UTC and daylight saving offsets', () => {
  const event = events[0];
  const end = Date.parse(event.end);
  assert.equal(selectEvents([event], { now: end - 1 }).length, 1);
  assert.equal(selectEvents([event], { now: end }).length, 0);
  assert.equal(selectEvents(events, { now: Date.parse('2027-01-01T00:00:00Z') }).length, 0);
  const november = events[4];
  assert.equal(selectEvents([november], { now: Date.parse('2026-11-05T02:59:59Z') }).length, 1);
  assert.equal(selectEvents([november], { now: Date.parse('2026-11-05T03:00:00Z') }).length, 0);
  assert.match(formatEvent(event).date, /Sep 16, 2026/);
  assert.match(formatEvent(november).time, /4:00 PM.*7:00 PM Pacific/);
});
test('missing, invalid and duplicate records are safely excluded and input order is preserved', () => {
  const data = [events[4], null, events[0], events[0], { ...events[1], end: 'bad' }, { ...events[2], companies: null }];
  assert.deepEqual(selectEvents(data, { now }).map(e => e.id), ['fall-day-1', 'cafes-connections']);
  assert.equal(data[0], events[4]);
  for (const input of [null, undefined, {}, 'bad', []]) assert.deepEqual(selectEvents(input, { now }), []);
  assert.deepEqual(selectEvents(events, { now: NaN }), []);
  assert.equal(selectEvents(events, { now: 0 }).length, 5);
  assert.equal(selectEvents(events, { now, query: null }).length, 5);
  assert.equal(selectEvents(events, { now, type: 'invalid' }).length, 0);
});
test('unsafe event and employer URLs cannot be rendered', () => {
  for (const source of ['javascript:alert(1)', 'https://calpoly.edu.evil.com', 'https://user@calpoly.edu', 'http://calpoly.edu', 'https://calpoly.edu:444', 'https://evil.com']) {
    assert.equal(safeSource(source), false);
    assert.equal(selectEvents([{ ...events[0], source }], { now }).length, 0);
    assert.equal(selectEvents([{ ...events[0], companies: [{ name: 'Fake', source }] }], { now }).length, 0);
  }
});
