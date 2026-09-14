'use strict';

(function () {
  const KEY = 'cal-poly-bookmarks-v1';
  const validKey = key => typeof key === 'string' && /^(opportunity|study|resource):[a-z0-9-]+$/.test(key);
  function createStore(getStorage) {
    let saved = new Set();
    let message = '';
    let sessionOnly = false;
    function refresh() {
      if (sessionOnly) return;
      try {
        const raw = getStorage().getItem(KEY);
        const value = raw === null ? [] : JSON.parse(raw);
        if (!Array.isArray(value) || value.length > 2000 || value.some(key => !validKey(key))) throw new Error('Invalid bookmark data');
        saved = new Set(value);
        message = '';
      } catch {
        message = 'Saved bookmarks could not be read. New changes will be kept for this visit only.';
        sessionOnly = true;
      }
    }
    function toggle(key) {
      if (!validKey(key)) return false;
      refresh();
      if (saved.has(key)) saved.delete(key); else saved.add(key);
      try {
        if (!sessionOnly) getStorage().setItem(KEY, JSON.stringify([...saved]));
      } catch {
        sessionOnly = true;
        message = 'Your browser could not save this change. Bookmarks will be kept for this visit only.';
      }
      return saved.has(key);
    }
    refresh();
    return { toggle, refresh, has: key => saved.has(key), keys: () => [...saved], message: () => message };
  }
  const api = { KEY, createStore };
  globalThis.CampusBookmarks = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
