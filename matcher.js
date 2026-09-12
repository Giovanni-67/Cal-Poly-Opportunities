'use strict';

(function () {
  const TYPES = { club: 'Club', research: 'Research', internship: 'Internship', competition: 'Competition', startup: 'Startup', 'hands-on': 'Hands-on' };
  const INTERESTS = { ai: 'AI', software: 'Software', cybersecurity: 'Cybersecurity', research: 'Research', startups: 'Startups', hardware: 'Hardware', business: 'Business', arts: 'Arts', service: 'Service', outdoors: 'Outdoors' };
  const ALIASES = {
    ai: 'ai', 'artificial intelligence': 'ai', 'machine learning': 'ai', ml: 'ai',
    software: 'software', coding: 'software', programming: 'software',
    cybersecurity: 'cybersecurity', 'cyber security': 'cybersecurity', security: 'cybersecurity', hacking: 'cybersecurity',
    startups: 'startups', startup: 'startups', entrepreneurship: 'startups',
    hardware: 'hardware', robotics: 'hardware', robots: 'hardware',
    cs: 'computer science', csc: 'computer science', 'comp sci': 'computer science',
    cpe: 'computer engineering', ee: 'electrical engineering', me: 'mechanical engineering',
    se: 'software engineering', business: 'business administration',
    volunteering: 'service', volunteer: 'service', outdoor: 'outdoors', art: 'arts',
    stats: 'statistics', math: 'mathematics', bio: 'biology',
    'graphic design': 'art and design', ux: 'design', 'user experience': 'design',
    gaming: 'games', 'game development': 'games', internship: 'internships'
  };
  function normalize(value) {
    return typeof value === 'string' ? value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ') : '';
  }
  function safeSource(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
        (url.hostname === 'calpoly.edu' || url.hostname.endsWith('.calpoly.edu'));
    } catch { return false; }
  }
  function validData(data) {
    return Array.isArray(data) && data.length > 0 && new Set(data.map(item => item?.id)).size === data.length && data.every(item =>
      item && ['id', 'title', 'description', 'sourceName'].every(key => typeof item[key] === 'string' && item[key].trim()) &&
      Object.hasOwn(TYPES, item.type) && safeSource(item.source) && /^\d{4}-\d{2}-\d{2}$/.test(item.reviewed) &&
      ['tags', 'majors'].every(key => Array.isArray(item[key]) && (key === 'majors' || item[key].length > 0) && item[key].every(value => typeof value === 'string' && normalize(value)))
    );
  }
  function findMatches(data, { query = '', interests = [], type = 'all' } = {}) {
    if (!validData(data)) return { error: 'The opportunity collection could not be loaded. Please reload the page or use Resources in the navigation.', matches: [] };
    if (typeof query !== 'string' || query.length > 200 || !Array.isArray(interests) || interests.some(key => !Object.hasOwn(INTERESTS, key)) || (type !== 'all' && !Object.hasOwn(TYPES, type))) {
      return { error: 'Please use a search of up to 200 characters and the available filters.', matches: [] };
    }
    const raw = normalize(query);
    const term = Object.hasOwn(ALIASES, raw) ? ALIASES[raw] : raw;
    // Match whole words: "AI" must not match "fair" or "chair".
    const contains = (text, word) => ` ${normalize(text)} `.includes(` ${word} `);
    const matches = [];
    for (const item of data) {
      if (type !== 'all' && item.type !== type) continue;
      const matchedInterests = [...new Set(interests)].filter(key => item.tags.includes(key));
      if (interests.length && !matchedInterests.length) continue;
      const major = item.majors.find(value => normalize(value) === term);
      const topic = item.tags.find(value => normalize(value) === term);
      const textMatch = raw && term.split(' ').every(word => contains([item.title, item.directoryTitle || '', item.description, ...item.tags, ...item.majors].join(' '), word));
      if (raw && !major && !topic && !textMatch) continue;
      const reasons = [];
      if (major) reasons.push(`Connected to ${major}`);
      else if (topic) reasons.push(`Related to ${INTERESTS[topic] || topic}`);
      else if (raw) reasons.push(`Matches “${query.trim()}” in its title, description, or discovery tags`);
      if (matchedInterests.length) reasons.push(`Related to ${matchedInterests.map(key => INTERESTS[key]).join(' / ')}`);
      if (!reasons.length) reasons.push(type === 'all' ? `Explore ${item.tags.slice(0, 2).map(tag => INTERESTS[tag] || tag).join(' / ')}` : `Shown in ${TYPES[type].toLowerCase()} opportunities`);
      matches.push({ item, reason: [...new Set(reasons)].join(' · ') });
    }
    return { matches, error: null };
  }
  function orderMatches(matches, history = []) {
    const byId = new Map(matches.map(match => [match.item.id, match]));
    const nextHistory = [...new Set([...history, ...byId.keys()])];
    return { history: nextHistory, matches: nextHistory.filter(id => byId.has(id)).map(id => byId.get(id)) };
  }
  const api = { TYPES, INTERESTS, normalize, safeSource, validData, findMatches, orderMatches };
  globalThis.OpportunityMatcher = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
