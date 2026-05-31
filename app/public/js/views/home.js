import { fetchCourses, fetchExercises } from '../api.js';
import { load, ACHIEVEMENTS, getLevel } from '../gamification.js';
import { t } from '../i18n.js';

export default async function renderHome() {
  const [courses, exercises] = await Promise.all([fetchCourses(), fetchExercises()]);
  const state = load();

  const courseDone = state.courses.length;
  const exDone     = state.exercises.length;
  const totalC     = courses.length;
  const totalE     = exercises.length;

  const next = _nextAction(state, courses, exercises);

  return `
<div class="page page-enter">
  <div class="home-hero">
    <h1>⎈ K8s<em style="font-style:normal;color:var(--k8s)">learn</em></h1>
    <p>${t('home.tagline')}</p>

    <div class="progress-ring-wrap">
      ${ring('courses',   courseDone, totalC, '#326ce5', t('home.ringCourses'))}
      ${ring('exercises', exDone,     totalE, '#00c9a7', t('home.ringExercises'))}
    </div>

    ${next ? `<p style="font-size:.8rem;color:var(--teal);font-family:var(--mono);margin-bottom:2rem">→ ${next}</p>` : ''}
  </div>

  <div class="home-cta">
    <a href="/cours" class="cta-card" data-link>
      <div class="cta-icon">📚</div>
      <h2>${t('nav.courses')}</h2>
      <p>${t('home.ctaCoursesDesc', { n: totalC })}</p>
      <span class="cta-arrow">${t('home.ctaCoursesArrow')}</span>
    </a>
    <a href="/exercices" class="cta-card teal" data-link>
      <div class="cta-icon">🎯</div>
      <h2>${t('nav.exercises')}</h2>
      <p>${t('home.ctaExercisesDesc', { n: totalE })}</p>
      <span class="cta-arrow" style="color:var(--teal)">${t('home.ctaExercisesArrow')}</span>
    </a>
  </div>

  <div class="achievements-section">
    <p class="section-title">${t('home.achievements')}</p>
    <div class="achievements-grid">
      ${ACHIEVEMENTS.map(a => {
        const unlocked = state.achievements.includes(a.id);
        return `
        <div class="achievement-chip${unlocked ? ' unlocked' : ''}" data-ach="${a.id}">
          <span class="ach-icon">${a.icon}</span>
          <div>
            <div class="ach-name">${t('ach.' + a.id + '.label')}</div>
            <div style="font-size:.65rem;color:var(--txt-dim)">${t('ach.' + a.id + '.desc')}</div>
          </div>
          <span class="ach-xp">+${a.xp} XP</span>
        </div>`;
      }).join('')}
    </div>
  </div>
</div>`;
}

function ring(cls, done, total, stroke, label) {
  const r    = 30;
  const circ = 2 * Math.PI * r;
  const pct  = total > 0 ? done / total : 0;
  const dash = circ * (1 - pct);
  return `
  <div class="progress-ring-item">
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle class="ring-bg" cx="40" cy="40" r="${r}"/>
      <circle class="ring-fill ${cls}"
        cx="40" cy="40" r="${r}"
        stroke="${stroke}"
        stroke-dasharray="${circ}"
        stroke-dashoffset="${dash}"
        style="transition:stroke-dashoffset .8s cubic-bezier(.34,1.56,.64,1)"
      />
    </svg>
    <span class="ring-count">${done}/${total}</span>
    <span class="ring-label">${label}</span>
  </div>`;
}

function _nextAction(state, courses, exercises) {
  const unreadCourse = courses.find(c => !state.courses.includes(c.slug));
  if (unreadCourse) return t('home.nextCourse', { title: unreadCourse.title });
  const unsolvedEx = exercises.find(e => !state.exercises.includes(e.id));
  if (unsolvedEx) return t('home.nextExercise', { title: unsolvedEx.title });
  return t('home.allDone');
}
