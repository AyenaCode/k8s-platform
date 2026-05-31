import { fetchExercises } from '../api.js';
import { load } from '../gamification.js';
import { t } from '../i18n.js';

const LEVEL_CLASS = { easy: 'badge-easy', medium: 'badge-med', hard: 'badge-hard' };

export default async function renderExercises() {
  const exercises = await fetchExercises();
  const state     = load();

  const cards = exercises.map((ex) => {
    const done = state.exercises.includes(ex.id);
    return `
    <a href="/exercices/${ex.id}" class="card${done ? ' done' : ''}" data-link>
      ${done ? '<div class="done-check">✓</div>' : ''}
      <div class="card-meta">
        <span class="badge ${LEVEL_CLASS[ex.level] || 'badge-tag'}">${t('level.' + ex.level)}</span>
        <span class="badge badge-tag">${ex.concept}</span>
      </div>
      <h2>${ex.title}</h2>
      <p><span class="badge badge-ns">ns: ${ex.ns}</span></p>
    </a>`;
  }).join('');

  const done  = state.exercises.length;
  const total = exercises.length;

  return `
<div class="page page-enter">
  <div class="section-header">
    <h1>${t('nav.exercises')}</h1>
    <p>${t('exercises.subtitle', { done, total })}</p>
  </div>
  <div class="cards-grid">${cards}</div>
</div>`;
}
