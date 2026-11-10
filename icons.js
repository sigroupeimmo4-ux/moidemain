// Jeu d'icônes linéaires sobres (viewBox 24, trait currentColor). Remplace les emojis de l'interface.
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  palette: '<path d="M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A3.7 3.7 0 0022 8.7C22 5.6 17.5 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
  camera: '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
  users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
  leaf: '<path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  map: '<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z"/><path d="M8 2v16M16 6v16"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5z"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0012 2z"/>',
  chat: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  mic: '<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94z"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/>',
  layers: '<path d="M12 2L2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
  grad: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
  card: '<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>',
  building: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01M10 21v-4h4v4"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
  arrowup: '<path d="M12 19V5M5 12l7-7 7 7"/>'
};

// Correspondance emoji d'origine -> icône (les données du catalogue gardent leurs emojis, l'écran affiche des icônes)
const E = {
  '🎨': 'palette', '🖼️': 'palette', '🖼': 'palette', '📷': 'camera', '💻': 'code', '🤖': 'cpu', '🧠': 'cpu', '⚙️': 'cpu', '⚙': 'cpu',
  '📊': 'chart', '🤝': 'users', '🫶': 'users', '👩': 'users', '💬': 'chat', '🎤': 'mic', '🎙️': 'mic', '🎙': 'mic', '📣': 'chat',
  '💗': 'heart', '💜': 'heart', '🩺': 'activity', '🧬': 'activity', '🏃': 'activity', '🌱': 'leaf', '🌿': 'leaf', '🌳': 'leaf',
  '🌻': 'leaf', '☀️': 'leaf', '☀': 'leaf', '🌦️': 'leaf', '🌦': 'leaf', '🪵': 'leaf', '🐾': 'leaf', '🦒': 'leaf', '🚜': 'leaf',
  '🧭': 'compass', '✈️': 'compass', '✈': 'compass', '🚀': 'compass', '🏺': 'compass', '🗺️': 'map', '🗺': 'map', '🔒': 'lock', '🔐': 'lock',
  '📚': 'book', '📘': 'book', '📰': 'book', '✍️': 'book', '✍': 'book', '🧾': 'book', '💡': 'bulb', '🔎': 'search', '🔍': 'search',
  '🌟': 'star', '🎬': 'film', '📺': 'film', '🎮': 'film', '🧩': 'layers', '🌈': 'sparkle', '🎓': 'grad', '🔄': 'refresh', '💳': 'card',
  '🏛️': 'building', '🏛': 'building', '🏙️': 'building', '🏙': 'building', '⚖️': 'building', '⚖': 'building', '🛋️': 'building', '🛋': 'building',
  '🍳': 'briefcase', 'ℹ️': 'info', 'ℹ': 'info', '✓': 'check', '✨': 'sparkle', '🛠️': 'wrench', '🛠': 'wrench'
};
const CAT = { 'Création': 'palette', 'Technologie': 'code', 'Lien humain': 'users', 'Nature & terrain': 'leaf' };

export function ico(key, cls = '') {
  const name = P[key] ? key : (E[key] || CAT[key] || 'briefcase');
  return `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name]}</svg>`;
}
export const catIcon = (category) => ico(CAT[category] || 'briefcase');
export const ICON_NAMES = Object.keys(P);
export const EMOJI_TO_ICON = E;
