import { fetchExercises, fetchExercise, streamDeploy, streamReset } from '../api.js';
import { mdToHtml, setupCopyButtons } from '../markdown.js';
import { Terminal } from '../terminal.js';
import { markExerciseLaunched, markExerciseComplete, load, refreshNav } from '../gamification.js';
import { t, getLang } from '../i18n.js';

export default async function renderExercise(id) {
  const [exercises, data] = await Promise.all([fetchExercises(), fetchExercise(id)]);
  if (data.error) return notFound(id);

  const idx  = exercises.findIndex(e => e.id === id);
  const prev = exercises[idx - 1];
  const next = exercises[idx + 1];
  const done = load().exercises.includes(id);

  const html = `
<div class="page-narrow page-enter">
  <div class="breadcrumb">
    <a href="/exercices" data-link>${t('nav.exercises')}</a> <span>›</span>
    <span>${data.title}</span>
  </div>

  <div class="deploy-panel" id="deploy-panel">
    <div class="deploy-panel-header">
      <span class="deploy-panel-label">⚙ ${t('exercise.env')} · ${data.ns}</span>
      <div class="deploy-actions">
        <span class="solved-chip${done ? ' visible' : ''}" id="solved-chip">✓ ${t('exercise.solved')}</span>
        <button class="btn btn-launch" id="btn-launch">▶ ${t('exercise.launch')}</button>
        <button class="btn btn-solve${done ? ' done' : ''}" id="btn-solve">
          ${done ? '✓ ' + t('exercise.solved') : '✓ ' + t('exercise.markSolved')}
        </button>
        <button class="btn btn-reset" id="btn-reset">⟳ ${t('exercise.reset')}</button>
      </div>
    </div>
    <div class="terminal-wrap" id="terminal-wrap">
      <div class="terminal-titlebar">
        <span class="t-dot red"></span>
        <span class="t-dot yellow"></span>
        <span class="t-dot green"></span>
        <span class="terminal-title" id="terminal-title">terminal</span>
      </div>
      <div class="terminal-output" id="terminal-output"></div>
    </div>
  </div>

  <div class="article" id="exercise-content">
    ${mdToHtml(data.markdown)}
  </div>

  <div class="article-nav">
    <div>${prev ? `<a href="/exercices/${prev.id}" data-link>← ${prev.title}</a>` : ''}</div>
    <div>${next ? `<a href="/exercices/${next.id}" data-link>${next.title} →</a>` : ''}</div>
  </div>
</div>`;

  requestAnimationFrame(() => {
    const content = document.getElementById('exercise-content');
    if (content) setupCopyButtons(content);
    _bindButtons(id, exercises.length);
  });

  return html;
}

function _bindButtons(id, totalExercises) {
  const term      = new Terminal('terminal-wrap', 'terminal-output', 'terminal-title');
  const btnLaunch = document.getElementById('btn-launch');
  const btnSolve  = document.getElementById('btn-solve');
  const btnReset  = document.getElementById('btn-reset');
  const panel     = document.getElementById('deploy-panel');
  const solvedChip = document.getElementById('solved-chip');

  btnLaunch?.addEventListener('click', async () => {
    btnLaunch.classList.add('running');
    btnLaunch.disabled = true;
    btnReset.disabled  = true;
    term.show('./deploy.sh');
    markExerciseLaunched(id);
    try {
      await streamDeploy(id,
        msg => term.chunk(msg),
        ok  => {
          term.done(ok);
          btnLaunch.classList.remove('running');
          btnLaunch.disabled = false;
          btnReset.disabled  = false;
        }
      );
    } catch (e) {
      term.chunk({ type: 'err', text: t('common.error') + e.message + '\n' });
      term.done(false);
      btnLaunch.classList.remove('running');
      btnLaunch.disabled = false;
    }
  });

  btnSolve?.addEventListener('click', async () => {
    if (btnSolve.classList.contains('done')) return;
    const totalCourses = await fetch('/api/courses?lang=' + getLang()).then(r => r.json()).then(c => c.length);
    markExerciseComplete(id, totalExercises, totalCourses);
    refreshNav();
    btnSolve.classList.add('done');
    btnSolve.textContent = '✓ ' + t('exercise.solved');
    solvedChip?.classList.add('visible');
    panel?.classList.add('just-solved');
    setTimeout(() => panel?.classList.remove('just-solved'), 900);
    _floatXP(btnSolve, '+100 XP');
  });

  btnReset?.addEventListener('click', async () => {
    if (!confirm(t('exercise.resetConfirm'))) return;
    btnReset.disabled  = true;
    btnLaunch.disabled = true;
    term.show('./reset.sh');
    try {
      await streamReset(
        msg => term.chunk(msg),
        ok  => {
          term.done(ok);
          btnReset.disabled  = false;
          btnLaunch.disabled = false;
        }
      );
    } catch (e) {
      term.chunk({ type: 'err', text: t('common.error') + e.message + '\n' });
      term.done(false);
      btnReset.disabled  = false;
      btnLaunch.disabled = false;
    }
  });
}

function _floatXP(anchor, text) {
  const layer  = document.getElementById('xp-float-layer');
  if (!layer) return;
  const rect   = anchor.getBoundingClientRect();
  const el     = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = text;
  el.style.left = rect.left + rect.width / 2 + 'px';
  el.style.top  = rect.top + window.scrollY + 'px';
  layer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function notFound(id) {
  return `<div class="not-found"><div class="code">404</div><h1>${t('exercise.notFound')}</h1><p>${id}</p><a href="/exercices" data-link>${t('exercise.back')}</a></div>`;
}
