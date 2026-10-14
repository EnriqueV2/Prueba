const announcement = document.querySelector('#announcements');
const announce = (message) => { announcement.textContent = message; };

// Keep navigation usable with a keyboard as well as on small screens.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu({ returnFocus = false } = {}) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  navigation.classList.remove('is-open');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu({ returnFocus: true });
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 701px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

const impacts = {
  calor: {
    category: 'MÁS FRECUENTE. MÁS INTENSO.',
    title: 'El calor deja de ser excepcional.',
    description: 'Las olas de calor son cada vez más frecuentes e intensas. Afectan nuestra salud, agravan las sequías en algunas regiones y ponen a los ecosistemas bajo presión.',
    takeaway: 'Cada fracción de grado que evitemos importa para reducir los riesgos.',
    label: 'UN PLANETA QUE CAMBIA',
  },
  oceanos: {
    category: 'EL CAMBIO TAMBIÉN LLEGA A LA ORILLA.',
    title: 'El mar sube. Las costas cambian.',
    description: 'El agua se expande al calentarse y el deshielo de glaciares y mantos de hielo añade agua al océano. La subida del nivel del mar aumenta las inundaciones y la erosión costera.',
    takeaway: 'Proteger y restaurar ecosistemas costeros ayuda a las comunidades a adaptarse.',
    label: 'COSTAS EN TRANSFORMACIÓN',
  },
  naturaleza: {
    category: 'LA NATURALEZA TAMBIÉN BUSCA EQUILIBRIO.',
    title: 'Un hogar que cambia para todas las especies.',
    description: 'El aumento de la temperatura altera hábitats, estaciones y ecosistemas. Muchas especies cambian su distribución o encuentran dificultades para adaptarse al ritmo del cambio.',
    takeaway: 'Cuidar la biodiversidad y reducir las emisiones son tareas que se refuerzan entre sí.',
    label: 'LA VIDA QUE NOS CONECTA',
  },
  personas: {
    category: 'NO NOS AFECTA A TODOS POR IGUAL.',
    title: 'Nuestra vida también está en juego.',
    description: 'El cambio climático afecta la salud, el acceso al agua, la producción de alimentos y los medios de vida. Las comunidades con menos recursos para adaptarse suelen enfrentar los mayores riesgos.',
    takeaway: 'Una respuesta justa debe proteger a las personas más vulnerables y ampliar sus opciones.',
    label: 'UN FUTURO COMPARTIDO',
  },
};
const tabs = [...document.querySelectorAll('.impact-tab')];
function activateTab(tab) {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  const key = tab.dataset.impact;
  const impact = impacts[key];
  document.querySelector('#impact-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('.impact-art').dataset.scene = key;
  document.querySelector('#impact-category').textContent = impact.category;
  document.querySelector('#impact-heading').textContent = impact.title;
  document.querySelector('#impact-description').textContent = impact.description;
  document.querySelector('#impact-takeaway').textContent = impact.takeaway;
  document.querySelector('#impact-art-label').textContent = impact.label;
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activateTab(tabs[next]);
    tabs[next].focus();
  });
});

const storageKey = 'tierra-viva-actions-v1';
const saveButtons = [...document.querySelectorAll('.save-action')];
const allowedActions = new Set(saveButtons.map((button) => button.dataset.action));
const cardTitle = (card) => [...card.querySelector('h3').childNodes]
  .map((node) => node.nodeName === 'BR' ? ' ' : node.textContent)
  .join('').replace(/\s+/g, ' ').trim();
let selected = new Set();
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) selected = new Set(saved.filter((id) => allowedActions.has(id)));
} catch {
  // The plan still works in memory when storage is unavailable or damaged.
  storageAvailable = false;
}
const storageNote = document.querySelector('#storage-note');
function renderPlan() {
  saveButtons.forEach((button) => {
    const saved = selected.has(button.dataset.action);
    const card = button.closest('.action-card');
    const title = cardTitle(card);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Quitar de' : 'Añadir a'} mi plan: ${title}`);
    button.querySelector('span:first-child').textContent = saved ? 'En mi plan' : 'Añadir a mi plan';
    button.querySelector('.save-icon').textContent = saved ? '' : '+';
    card.classList.toggle('is-saved', saved);
  });
  document.querySelector('#plan-count').textContent = String(selected.size);
  document.querySelector('#download-plan').disabled = selected.size === 0;
  storageNote.textContent = storageAvailable
    ? 'Tu plan se guarda solo en este navegador. Sin registros, sin datos personales.'
    : 'El almacenamiento local no está disponible. Descarga tu plan para conservarlo.';
}
saveButtons.forEach((button) => button.addEventListener('click', () => {
  const id = button.dataset.action;
  const removing = selected.has(id);
  if (removing) selected.delete(id); else selected.add(id);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...selected]));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  renderPlan();
  announce(`${removing ? 'Acción eliminada del plan.' : 'Acción añadida al plan.'} ${selected.size} de 6 acciones seleccionadas.`);
}));
renderPlan();

const filters = [...document.querySelectorAll('.filter-button')];
const actionCards = [...document.querySelectorAll('.action-card')];
filters.forEach((filter) => filter.addEventListener('click', () => {
  filters.forEach((button) => {
    const active = button === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  actionCards.forEach((card) => {
    card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter;
  });
  announce(`${actionCards.filter((card) => !card.hidden).length} acciones disponibles en ${filter.textContent}.`);
}));

document.querySelector('#download-plan').addEventListener('click', () => {
  const lines = ['MI PLAN POR EL PLANETA', 'Tierra Viva — Pequeños pasos. Un movimiento enorme.', ''];
  saveButtons.filter((button) => selected.has(button.dataset.action)).forEach((button, index) => {
    const card = button.closest('.action-card');
    lines.push(`${index + 1}. ${cardTitle(card)}`, card.querySelector('p').textContent, '');
  });
  lines.push('La acción individual suma. La acción colectiva transforma.', 'Las políticas públicas y los cambios en energía, transporte e industria son esenciales.', '', 'Más ideas: https://www.un.org/es/actnow/ten-actions');
  const file = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mi-plan-por-el-planeta.txt';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Tu plan se ha descargado. Elige una acción y empieza a tu ritmo.');
});

document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());

// The decorative globe is a separate chunk: the rest of the page never waits for WebGL.
const earthContainer = document.querySelector('#earth-canvas');
import('./earth.js')
  .then(({ initEarth }) => initEarth(earthContainer))
  .catch(() => earthContainer.classList.add('earth-fallback'));
