import { fetchCourses } from '../api.js';
import { load } from '../gamification.js';
import { t } from '../i18n.js';

export default async function renderCourses() {
  const courses = await fetchCourses();
  const state   = load();

  const cards = courses.map((c, i) => {
    const done = state.courses.includes(c.slug);
    return `
    <a href="/cours/${c.slug}" class="card${done ? ' done' : ''}" data-link>
      ${done ? '<div class="done-check">✓</div>' : ''}
      <div class="card-meta">
        <span class="badge badge-dur">⏱ ${c.duration}</span>
        <span class="card-number">${String(i+1).padStart(2,'0')}</span>
      </div>
      <h2>${c.title}</h2>
      <p>${c.desc || t('courses.chapter', { n: i + 1 })}</p>
    </a>`;
  }).join('');

  return `
<div class="page page-enter">
  <div class="section-header">
    <h1>${t('nav.courses')}</h1>
    <p>${t('courses.subtitle', { n: courses.length })}</p>
  </div>
  <div class="cards-grid">${cards}</div>
</div>`;
}
