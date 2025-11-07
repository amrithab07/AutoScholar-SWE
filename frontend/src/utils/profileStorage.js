// Multi-profile localStorage-based profile storage
const PROFILE_KEY = 'autoscolar_profiles_v1';
const MAX_HISTORY = 200;

function defaultProfile(id) {
  return {
    id,
    name: 'New User',
    email: '',
    institution: '',
    bio: '',
    interests: [],
    savedPapers: [],
    searchHistory: []
  };
}

function readRaw() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('profileStorage: failed to read raw profiles', err);
    return null;
  }
}

function writeRaw(obj) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(obj));
    window.dispatchEvent(new Event('autoscolar:profileUpdated'));
  } catch (err) {
    console.error('profileStorage: failed to write profiles', err);
  }
}

// Ensure new storage shape: { activeProfileId, profiles: { id: profileObj } }
function readStore() {
  const raw = readRaw();
  if (!raw) {
    const id = String(Date.now());
    const profiles = { [id]: defaultProfile(id) };
    const store = { activeProfileId: id, profiles };
    writeRaw(store);
    return store;
  }

  // migration: old single-profile shape
  if (!raw.profiles && (raw.savedPapers || raw.searchHistory || raw.name)) {
    const id = raw.id ? String(raw.id) : String(Date.now());
    const profiles = { [id]: raw };
    const store = { activeProfileId: id, profiles };
    writeRaw(store);
    return store;
  }

  return raw;
}

function getActiveProfile() {
  const store = readStore();
  return store.profiles[store.activeProfileId];
}

export function getProfile() {
  return getActiveProfile();
}

export function getProfiles() {
  const store = readStore();
  return store.profiles || {};
}

export function createProfile(profileData = {}) {
  const store = readStore();
  const id = profileData.id ? String(profileData.id) : String(Date.now());
  const profile = { ...defaultProfile(id), ...profileData, id };
  store.profiles[id] = profile;
  store.activeProfileId = id;
  writeRaw(store);
  return profile;
}

export function setActiveProfile(id) {
  const store = readStore();
  if (!store.profiles[String(id)]) return false;
  store.activeProfileId = String(id);
  writeRaw(store);
  return true;
}

export function updateProfile(profile) {
  if (!profile || !profile.id) return false;
  const store = readStore();
  store.profiles[String(profile.id)] = { ...(store.profiles[String(profile.id)] || {}), ...profile };
  writeRaw(store);
  return true;
}

export function deleteProfile(id) {
  const store = readStore();
  const sid = String(id);
  if (!store.profiles[sid]) return false;
  delete store.profiles[sid];
  // if deleted active, pick another
  if (store.activeProfileId === sid) {
    const remaining = Object.keys(store.profiles);
    store.activeProfileId = remaining.length ? remaining[0] : null;
  }
  writeRaw(store);
  return true;
}

export function getSavedPapers() {
  return getActiveProfile().savedPapers || [];
}

export function getSearchHistory() {
  return getActiveProfile().searchHistory || [];
}

export function isPaperSaved(paperId) {
  if (!paperId) return false;
  const profile = getActiveProfile();
  return (profile.savedPapers || []).some(p => String(p.id) === String(paperId));
}

export function savePaper(paper) {
  if (!paper) return;
  const store = readStore();
  const profile = store.profiles[store.activeProfileId];
  const id = paper.id ?? paper.paper_id ?? paper.doi ?? paper.title;
  const toStore = {
    id,
    title: paper.title,
    authors: (paper.authors || []).map(a => (typeof a === 'string' ? a : a.name || a)).slice(0, 10),
    year: paper.publication_date ? paper.publication_date.split('-')[0] : paper.year || null,
    pdf_url: paper.pdf_url || paper.pdf || null,
    url: paper.url || paper.pdf_url || paper.pdf || null
  };

  const exists = (profile.savedPapers || []).some(p => String(p.id) === String(id));
  if (!exists) {
    profile.savedPapers = [toStore, ...(profile.savedPapers || [])];
  } else {
    profile.savedPapers = (profile.savedPapers || []).filter(p => String(p.id) !== String(id));
  }

  writeRaw(store);
  return !exists;
}

export function addSearchHistory(query) {
  if (!query || !String(query).trim()) return;
  const q = String(query).trim();
  const store = readStore();
  const profile = store.profiles[store.activeProfileId];
  const timestamp = new Date().toISOString();
  profile.searchHistory = (profile.searchHistory || []).filter(h => h.query !== q);
  profile.searchHistory.unshift({ id: timestamp, query: q, date: timestamp });
  if (profile.searchHistory.length > MAX_HISTORY) {
    profile.searchHistory = profile.searchHistory.slice(0, MAX_HISTORY);
  }
  writeRaw(store);
}

export function clearSearchHistory() {
  const store = readStore();
  const profile = store.profiles[store.activeProfileId];
  profile.searchHistory = [];
  writeRaw(store);
}

export function clearSavedPapers() {
  const store = readStore();
  const profile = store.profiles[store.activeProfileId];
  profile.savedPapers = [];
  writeRaw(store);
}

export default {
  getProfile,
  getProfiles,
  createProfile,
  setActiveProfile,
  updateProfile,
  deleteProfile,
  getSavedPapers,
  getSearchHistory,
  isPaperSaved,
  savePaper,
  addSearchHistory,
  clearSearchHistory,
  clearSavedPapers
};
