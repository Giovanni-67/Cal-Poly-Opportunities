'use strict';

(function () {
  const matcher = typeof module !== 'undefined' ? require('./matcher.js') : globalThis.OpportunityMatcher;
  // Editorial connections, not claims that one activity includes another.
  const groups = [
    ['water activities', 'swim|swimming|swimmers|water polo|sailing|surfing|surf|kayaking|paddling|rowing|dragon boating|triathlon'],
    ['endurance activities', 'running|run|cycling|biking|triathlon|endurance|marathon'],
    ['outdoor activities', 'outdoors|outdoor|hiking|camping|climbing|backpacking|conservation|wildlife|sustainability'],
    ['computing and making', 'ai|artificial intelligence|software|coding|programming|computer science|computer engineering|robotics|hardware|cybersecurity|hackathon'],
    ['visual creativity', 'photography|film|filmmaking|animation|design|art|arts|art and design|graphic communication'],
    ['music and performance', 'music|singing|a cappella|band|dance|dancing|theatre|theater|comedy|improv'],
    ['business and entrepreneurship', 'business|business administration|startups|entrepreneurship|marketing|finance|investing|accounting|economics|consulting'],
    ['health and wellbeing', 'health|public health|medicine|medical|wellness|nutrition|kinesiology|psychology'],
    ['community service', 'service|volunteering|volunteer|nonprofit|mentoring|tutoring|education|teaching|liberal studies|child development'],
    ['science and research', 'research|science|biology|chemistry|physics|mathematics|statistics|biotechnology|quantum'],
    ['agriculture and food', 'agriculture|agricultural business|agricultural science|plant sciences|food science|horticulture|gardening|dairy|farming'],
    ['animals and conservation', 'animals|animal science|veterinary|wildlife|zoo|conservation|marine sciences'],
    ['engineering projects', 'engineering|mechanical engineering|electrical engineering|manufacturing engineering|materials engineering|hardware|robotics|aerospace engineering|space'],
    ['the built environment', 'architecture|architectural engineering|landscape architecture|civil engineering|construction management|city and regional planning|urban planning'],
    ['writing and storytelling', 'writing|english|journalism|communication studies|poetry|literature|film'],
    ['civic life', 'politics|political science|law|debate|history|sociology|advocacy'],
    ['games and strategy', 'games|gaming|esports|chess|board games|game development'],
    ['team sports', 'sports|soccer|basketball|volleyball|baseball|softball|rugby|lacrosse|hockey|ultimate'],
    ['racket sports', 'tennis|badminton|pickleball|table tennis|racquetball'],
    ['movement and fitness', 'fitness|yoga|dance|martial arts|boxing|fencing|wrestling'],
    ['language and culture', 'languages|language|culture|cultural|spanish|french|german|japanese|chinese|anthropology'],
    ['faith and reflection', 'faith|religion|spirituality|christian|catholic|jewish|muslim|buddhist'],
    ['professional connections', 'professional development|leadership|mentoring|networking']
  ].map(([label, terms]) => ({ label, terms: terms.split('|').map(matcher.normalize) }));
  const generic = new Set(['academic', 'student community', 'professional development', 'recreation', 'sports', 'culture', 'faith']);
  const has = (text, term) => ` ${matcher.normalize(text)} `.includes(` ${term} `);

  function findRelated(data, options = {}) {
    const direct = matcher.findMatches(data, options);
    if (direct.error) return { matches: [], error: direct.error };
    const query = matcher.normalize(options.query || '');
    const interests = options.interests || [];
    if (!query && !interests.length) return { matches: [], error: null };
    const active = groups.filter(group => group.terms.includes(query) || interests.some(interest => group.terms.includes(interest)));
    const directIds = new Set(direct.matches.map(match => match.item.id));
    // For specific club names and majors outside the topic map, use explicit
    // shared tags from direct matches instead of inventing a semantic link.
    const shared = active.length ? [] : [...new Set(direct.matches.flatMap(({ item }) => item.tags.filter(tag => !generic.has(tag))))];
    const candidates = matcher.findMatches(data, { ...options, query: '' });
    const related = [];
    for (const { item } of candidates.matches) {
      if (directIds.has(item.id)) continue;
      const text = [item.title, item.description, ...item.tags, ...item.majors].join(' ');
      const connections = active.filter(group => group.terms.some(term => has(text, term)));
      const tag = shared.find(value => item.tags.includes(value));
      if (!connections.length && !tag) continue;
      const reason = connections.length ? `Explore another side of ${connections[0].label}` : `Shares ${tag} with your direct matches`;
      related.push({ item, reason, score: connections.length || 1 });
    }
    return { matches: related.sort((a, b) => b.score - a.score).map(({ item, reason }) => ({ item, reason })), error: null };
  }
  const api = { findRelated };
  globalThis.OpportunityDiscovery = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
