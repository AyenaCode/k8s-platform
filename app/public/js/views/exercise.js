import { fetchExercises, fetchExercise, streamDeploy, streamReset, streamRun, streamCheck } from '../api.js';
import { mdToHtml, setupCopyButtons } from '../markdown.js';
import { Terminal } from '../terminal.js';
import { markExerciseLaunched, markExerciseComplete, load, refreshNav } from '../gamification.js';
import { navigate } from '../router.js';
import { t, getLang } from '../i18n.js';

const LEVEL_CLASS = { easy: 'badge-easy', medium: 'badge-med', hard: 'badge-hard' };
const STEPS = ['deploy', 'diagnose', 'fix', 'verify'];

export default async function renderExercise(id) {
  const [exercises, data] = await Promise.all([fetchExercises(), fetchExercise(id)]);
  if (data.error) return notFound(id);

  const idx   = exercises.findIndex(e => e.id === id);
  const meta  = exercises[idx] || data;          // { level, concept, ns, title }
  const prev  = exercises[idx - 1];
  const next  = exercises[idx + 1];
  const done  = load().exercises.includes(id);
  const ns    = data.ns;
  const level = meta.level || 'medium';
  const ticket = id.replace(/^ticket-/, '#').toUpperCase();

  const steps = STEPS.map(s => `
    <div class="mc-step${done ? ' done' : ''}" data-step="${s}">
      <span class="mc-step-dot"></span>
      <span class="mc-step-label">${t('exercise.step.' + s)}</span>
    </div>`).join('<span class="mc-step-link"></span>');

  const html = `
<div class="lab page-enter" id="lab">

  <header class="lab-masthead">
    <div class="breadcrumb">
      <a href="/exercices" data-link>${t('nav.exercises')}</a> <span>›</span>
      <span>${ticket}</span>
    </div>
    <div class="mc-headrow">
      <div class="mc-headline">
        <span class="mc-ticket">${ticket}</span>
        <h1 class="mc-title">${data.title}</h1>
        <div class="mc-tags">
          <span class="badge ${LEVEL_CLASS[level] || 'badge-tag'}">${t('level.' + level)}</span>
          ${meta.concept ? `<span class="badge badge-tag">${meta.concept}</span>` : ''}
          <span class="badge badge-ns">ns: ${ns}</span>
        </div>
      </div>
      <div class="mc-statusbox" data-state="${done ? 'resolved' : 'idle'}" id="mc-status">
        <span class="mc-status-pulse"></span>
        <div class="mc-status-text">
          <span class="mc-status-label" id="mc-status-label">${done ? t('exercise.statusResolved') : t('exercise.statusIdle')}</span>
          <span class="mc-status-sub" id="mc-status-sub">${ticket} · ${ns}</span>
        </div>
      </div>
    </div>

    <div class="mc-hud">
      <div class="mc-steps" id="mc-steps">${steps}</div>
      <div class="mc-gauges">
        <div class="mc-gauge"><span class="mc-gauge-k">${t('exercise.reward')}</span><span class="mc-gauge-v reward">+100 XP</span></div>
        <div class="mc-gauge"><span class="mc-gauge-k">${t('exercise.elapsed')}</span><span class="mc-gauge-v" id="mc-timer">--:--</span></div>
        <div class="mc-gauge"><span class="mc-gauge-k">${t('exercise.ops')}</span><span class="mc-gauge-v" id="mc-ops">0</span></div>
      </div>
    </div>
  </header>

  <section class="lab-dossier">
    <div class="lab-eyebrow">📁 ${t('exercise.briefing')}</div>
    <div class="article dossier" id="exercise-content">
      ${mdToHtml(data.markdown)}
    </div>
  </section>

  <aside class="lab-console termwin" id="deploy-panel">
    <div class="console-bar termbar">
      <div class="traffic">
        <button type="button" class="t-dot red"    id="tw-clear" title="Clear"    aria-label="Clear terminal"></button>
        <button type="button" class="t-dot yellow" id="tw-min"   title="Collapse" aria-label="Collapse terminal"></button>
        <button type="button" class="t-dot green"  id="tw-zoom"  title="Zoom"     aria-label="Expand terminal"></button>
      </div>
      <span class="terminal-title" id="terminal-title">${ns} — -zsh — 80×24</span>
      <div class="console-actions">
        <button class="btn btn-launch" id="btn-launch">▶ ${t('exercise.launch')}</button>
        <button class="btn btn-check" id="btn-check">✓ ${t('exercise.check')}</button>
        <button class="btn btn-reset" id="btn-reset" title="${t('exercise.reset')}">⟳</button>
      </div>
    </div>

    <div class="terminal-wrap visible" id="terminal-wrap">
      <div class="terminal-output" id="terminal-output"><span class="term-line-cmd">${t('exercise.idleHint')}</span></div>
    </div>

    <form class="cmd-bar" id="cmd-bar">
      <span class="t-prompt cmd-promptline" aria-hidden="true"><span class="tp-user">you@k8s</span> <span class="tp-dir">${ns}</span> <span class="tp-sym">%</span></span>
      <input type="text" id="cmd-input" class="cmd-input" placeholder="${t('exercise.cmdPlaceholder')}" autocomplete="off" autocapitalize="off" spellcheck="false">
      <span class="cmd-hint">${t('exercise.cmdHint')}</span>
      <button type="submit" class="btn btn-run" id="btn-run" title="${t('exercise.cmdRun')}">⏎</button>
    </form>
  </aside>

  <footer class="lab-footer">
    <div>${prev ? `<a href="/exercices/${prev.id}" data-link>← ${prev.title}</a>` : ''}</div>
    <div>${next ? `<a href="/exercices/${next.id}" data-link>${next.title} →</a>` : ''}</div>
  </footer>
</div>`;

  requestAnimationFrame(() => {
    const content = document.getElementById('exercise-content');
    if (content) setupCopyButtons(content);
    _bindButtons(id, exercises.length, ns, next, done);
  });

  return html;
}

function _bindButtons(id, totalExercises, ns, next, alreadyDone) {
  const term       = new Terminal('terminal-wrap', 'terminal-output', 'terminal-title', { dir: ns });
  const btnLaunch  = document.getElementById('btn-launch');
  const btnCheck   = document.getElementById('btn-check');
  const btnReset   = document.getElementById('btn-reset');
  const panel      = document.getElementById('deploy-panel');
  const statusBox  = document.getElementById('mc-status');
  const statusLbl  = document.getElementById('mc-status-label');
  const opsEl      = document.getElementById('mc-ops');
  const timerEl    = document.getElementById('mc-timer');

  let solved   = alreadyDone;
  let opsCount = 0;

  const popToast = detail => document.dispatchEvent(new CustomEvent('app-toast', { detail }));

  // ── Window controls (traffic lights) ─────────────────────────────────────────
  document.getElementById('tw-clear')?.addEventListener('click', () => { term.clear(); document.getElementById('cmd-input')?.focus(); });
  document.getElementById('tw-min')?.addEventListener('click',   () => panel?.classList.toggle('term-min'));
  document.getElementById('tw-zoom')?.addEventListener('click',  () => panel?.classList.toggle('term-zoom'));

  // ── Mission timer ───────────────────────────────────────────────────────────
  let startTs = 0, timerInt = 0;
  const fmt = ms => {
    const s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };
  function timerStart() {
    if (timerInt || solved) return;
    startTs = Date.now();
    timerEl.textContent = '00:00';
    timerInt = setInterval(() => { timerEl.textContent = fmt(Date.now() - startTs); }, 500);
  }
  function timerStop() {
    if (timerInt) { clearInterval(timerInt); timerInt = 0; }
    if (startTs) timerEl.textContent = fmt(Date.now() - startTs);
  }

  // ── Objective stepper (ambient progress) ─────────────────────────────────────
  const stepEls = {};
  STEPS.forEach(s => stepEls[s] = document.querySelector(`.mc-step[data-step="${s}"]`));
  function advanceTo(idx) {
    if (solved) return;
    STEPS.forEach((s, i) => {
      const el = stepEls[s]; if (!el) return;
      el.classList.toggle('done', i < idx);
      el.classList.toggle('active', i === idx);
    });
  }
  function completeAll() {
    STEPS.forEach(s => { stepEls[s]?.classList.add('done'); stepEls[s]?.classList.remove('active'); });
  }
  function setStatus(state) {
    statusBox.dataset.state = state;
    statusLbl.textContent = t('exercise.status' + state.charAt(0).toUpperCase() + state.slice(1));
  }

  // ── Cleanup (router calls window.__cleanupScroll on navigation) ───────────────
  window.__cleanupScroll = () => {
    if (timerInt) clearInterval(timerInt);
    document.getElementById('mc-overlay')?.remove();
    document.getElementById('mc-confetti')?.remove();
    document.removeEventListener('keydown', onEsc);
  };

  // ── Mark solved + reward sequence ────────────────────────────────────────────
  async function applySolved() {
    solved = true;
    timerStop();
    const totalCourses = await fetch('/api/courses?lang=' + getLang()).then(r => r.json()).then(c => c.length);
    markExerciseComplete(id, totalExercises, totalCourses);
    refreshNav();
    completeAll();
    setStatus('resolved');
    panel?.classList.add('just-solved');
    setTimeout(() => panel?.classList.remove('just-solved'), 900);
    if (btnCheck) _floatXP(btnCheck, '+100 XP');
    _confetti();
    _missionOverlay(startTs ? fmt(Date.now() - startTs) : null, next);
  }

  // ── Launch ───────────────────────────────────────────────────────────────────
  btnLaunch?.addEventListener('click', async () => {
    btnLaunch.classList.add('running');
    btnLaunch.disabled = true;
    btnReset.disabled  = true;
    if (!solved) { setStatus('active'); timerStart(); advanceTo(0); }
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
          if (ok && !solved) advanceTo(1);
        }
      );
    } catch (e) {
      term.chunk({ type: 'err', text: t('common.error') + e.message + '\n' });
      term.done(false);
      btnLaunch.classList.remove('running');
      btnLaunch.disabled = false;
    }
  });

  // ── Check ──────────────────────────────────────────────────────────────────
  btnCheck?.addEventListener('click', async () => {
    btnCheck.classList.add('running');
    btnCheck.disabled  = true;
    btnLaunch.disabled = true;
    btnReset.disabled  = true;
    if (!solved) advanceTo(3);
    // The verification runs silently: its command and output would reveal what is
    // being tested. We only surface the verdict (pass → celebrate, fail → nudge).
    try {
      await streamCheck(id,
        () => {},
        async ok => {
          btnCheck.classList.remove('running');
          btnCheck.disabled  = false;
          btnLaunch.disabled = false;
          btnReset.disabled  = false;
          if (ok) {
            await applySolved();
          } else {
            if (!solved) advanceTo(2);
            panel?.classList.add('just-failed');
            setTimeout(() => panel?.classList.remove('just-failed'), 600);
            popToast({ icon: '🔧', title: t('exercise.failTitle'), desc: t('exercise.failDesc'), xp: '', duration: 4500 });
          }
        }
      );
    } catch (e) {
      btnCheck.classList.remove('running');
      btnCheck.disabled  = false;
      btnLaunch.disabled = false;
      btnReset.disabled  = false;
      popToast({ icon: '⚠️', title: t('error.title'), desc: e.message, xp: '', duration: 4500 });
    }
  });

  // ── Reset ──────────────────────────────────────────────────────────────────
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

  // ── In-app command box ───────────────────────────────────────────────────────
  const cmdBar   = document.getElementById('cmd-bar');
  const cmdInput = document.getElementById('cmd-input');
  const btnRun   = document.getElementById('btn-run');
  const history  = [];
  let   histIdx  = 0;

  async function execCommand(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;
    history.push(cmd);
    histIdx = history.length;
    cmdInput.value = '';
    if (cmd === 'clear' || cmd === 'cls') { term.clear(); cmdInput.focus(); return; }
    opsCount++; if (opsEl) opsEl.textContent = opsCount;
    if (!solved) { setStatus('active'); timerStart(); advanceTo(2); }
    term.command(cmd);
    btnRun.disabled = true;
    cmdInput.disabled = true;
    try {
      await streamRun(cmd,
        msg => term.chunk(msg),
        ok  => {
          term.done(ok);
          btnRun.disabled = false;
          cmdInput.disabled = false;
          cmdInput.focus();
        }
      );
    } catch (err) {
      term.chunk({ type: 'err', text: t('common.error') + err.message + '\n' });
      term.done(false);
      btnRun.disabled = false;
      cmdInput.disabled = false;
    }
  }

  cmdBar?.addEventListener('submit', e => { e.preventDefault(); execCommand(cmdInput.value); });

  cmdInput?.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && histIdx > 0) {
      histIdx--;
      cmdInput.value = history[histIdx];
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (histIdx < history.length - 1) { histIdx++; cmdInput.value = history[histIdx]; }
      else { histIdx = history.length; cmdInput.value = ''; }
    }
  });

  // ── Mission-complete overlay ─────────────────────────────────────────────────
  function onEsc(e) { if (e.key === 'Escape') document.getElementById('mc-overlay')?.remove(); }

  function _missionOverlay(timeStr, nextEx) {
    document.getElementById('mc-overlay')?.remove();
    const ov = document.createElement('div');
    ov.id = 'mc-overlay';
    ov.className = 'mc-overlay';
    ov.innerHTML = `
      <div class="mc-card" role="dialog" aria-modal="true">
        <button class="mc-card-close" aria-label="close">✕</button>
        <div class="mc-card-badge">⎈</div>
        <div class="mc-card-kicker">+100 XP</div>
        <h2 class="mc-card-title">${t('exercise.complete.title')}</h2>
        <p class="mc-card-desc">${t('exercise.complete.desc')}</p>
        ${timeStr ? `<div class="mc-card-time">⏱ ${t('exercise.complete.time', { time: timeStr })}</div>` : ''}
        <div class="mc-card-actions">
          <button class="btn-cta primary" id="mc-next">${nextEx ? t('exercise.complete.next') : t('nav.exercises') + ' →'}</button>
          <button class="btn-cta ghost" id="mc-stay">${t('exercise.complete.stay')}</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('show'));
    const close = () => ov.remove();
    ov.querySelector('.mc-card-close').addEventListener('click', close);
    ov.querySelector('#mc-stay').addEventListener('click', close);
    ov.querySelector('#mc-next').addEventListener('click', () => { close(); navigate(nextEx ? '/exercices/' + nextEx.id : '/exercices'); });
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', onEsc);
  }
}

// ── Canvas confetti burst ──────────────────────────────────────────────────────
function _confetti() {
  document.getElementById('mc-confetti')?.remove();
  const cv = document.createElement('canvas');
  cv.id = 'mc-confetti';
  cv.style.cssText = 'position:fixed;inset:0;z-index:1500;pointer-events:none';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  if (!ctx) { cv.remove(); return; }
  const W = cv.width = window.innerWidth, H = cv.height = window.innerHeight;
  const colors = ['#326ce5', '#00c9a7', '#f59e0b', '#a78bfa', '#dce6f5'];
  const N = 160;
  const parts = Array.from({ length: N }, () => ({
    x: W / 2 + (Math.random() - .5) * 220,
    y: H * 0.32,
    vx: (Math.random() - .5) * 13,
    vy: Math.random() * -13 - 4,
    g: 0.32 + Math.random() * 0.12,
    s: 5 + Math.random() * 7,
    rot: Math.random() * 6.28,
    vr: (Math.random() - .5) * 0.4,
    c: colors[(Math.random() * colors.length) | 0],
    life: 1,
  }));
  const t0 = Date.now();
  (function frame() {
    const elapsed = Date.now() - t0;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.life = Math.max(0, 1 - elapsed / 2600);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    }
    if (elapsed < 2800) requestAnimationFrame(frame);
    else cv.remove();
  })();
}

function _floatXP(anchor, text) {
  const layer = document.getElementById('xp-float-layer');
  if (!layer) return;
  const rect = anchor.getBoundingClientRect();
  const el   = document.createElement('div');
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
