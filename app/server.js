/**
 * K8s Learn — API + static file server.
 * All UI logic lives in public/. Content is bilingual (en / fr).
 */
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { spawn } = require('child_process');

const PUBLIC_DIR    = path.join(__dirname, 'public');
const EXERCISES_DIR = (() => {
  const d = path.join(__dirname, 'exercices');
  return fs.existsSync(d) ? d : path.join(__dirname, '..', 'exercices');
})();
const COURSES_DIR = (() => {
  const d = path.join(__dirname, 'courses');
  return fs.existsSync(d) ? d : path.join(__dirname, '..', 'courses');
})();
const RESET_SCRIPT = path.join(EXERCISES_DIR, 'reset.sh');

const LANGS        = ['en', 'fr'];
const DEFAULT_LANG = 'en';

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.json':  'application/json',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff2': 'font/woff2',
};

function serveFile(res, filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const ext  = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    serveIndex(res);
  }
}

function serveIndex(res) {
  const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  });
  res.end(JSON.stringify(data));
}

// Read the ?lang= query param; fall back to the default language.
function langOf(reqUrl) {
  const pair = (reqUrl.split('?')[1] || '')
    .split('&')
    .map(kv => kv.split('='))
    .find(([k]) => k === 'lang');
  const lang = pair ? pair[1] : '';
  return LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

// ─── Data ───────────────────────────────────────────────────────────────────

// Read every .md file in courses/<lang>/ and build a course list.
// The card title comes from the first `# H1`; the description from the first `>` blockquote.
function loadCourses(lang) {
  const dir = path.join(COURSES_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(file => {
      const slug  = file.slice(0, -3);
      const raw   = fs.readFileSync(path.join(dir, file), 'utf8');
      const lines = raw.split('\n');
      const h1    = lines.find(l => l.startsWith('# ')) || '';
      const title = h1.slice(2).trim().replace(/^\d+\s*[—–-]\s*/, '');
      const bq    = lines.find(l => l.startsWith('>')) || '';
      const desc  = bq.replace(/^>\s*/, '').replace(/\*\*[^*]+\*\*\s*:\s*/, '').replace(/\*([^*]+)\*/g, '$1').trim();
      const words = raw.split(/\s+/).filter(Boolean).length;
      return { slug, title: title || slug, desc, duration: Math.max(1, Math.round(words / 200)) + ' min' };
    });
}

const COURSES = Object.fromEntries(LANGS.map(l => [l, loadCourses(l)]));

// Exercise catalog. title/concept are bilingual; level is a stable key the UI localizes.
const EXERCISES = [
  { id: 'ticket-001', ns: 'exo-001', level: 'easy',   title: { en: 'App unreachable',               fr: 'App injoignable' },             concept: { en: 'Selector typo',       fr: 'Selector typo' } },
  { id: 'ticket-002', ns: 'exo-002', level: 'easy',   title: { en: 'Deployment stuck',              fr: 'Déploiement bloqué' },          concept: { en: 'ImagePullBackOff',    fr: 'ImagePullBackOff' } },
  { id: 'ticket-003', ns: 'exo-003', level: 'medium', title: { en: 'Connection refused',            fr: 'Connection refused' },          concept: { en: 'targetPort mismatch', fr: 'targetPort mismatch' } },
  { id: 'ticket-004', ns: 'exo-004', level: 'medium', title: { en: 'Pods in a crash loop',          fr: 'Pods en crash loop' },          concept: { en: 'Missing ConfigMap',   fr: 'ConfigMap manquant' } },
  { id: 'ticket-005', ns: 'exo-005', level: 'hard',   title: { en: 'Disastrous production rollout', fr: 'Mise en prod catastrophique' }, concept: { en: 'Multi-service stack', fr: 'Stack multi-services' } },
  { id: 'ticket-006', ns: 'exo-006', level: 'medium', title: { en: 'Pods never become Ready',       fr: 'Pods jamais Ready' },           concept: { en: 'Misconfigured probe', fr: 'Probe mal configurée' } },
  { id: 'ticket-007', ns: 'exo-007', level: 'medium', title: { en: 'Cache keeps dying',             fr: 'Cache qui meurt en boucle' },   concept: { en: 'OOMKilled',           fr: 'OOMKilled' } },
  { id: 'ticket-008', ns: 'exo-008', level: 'medium', title: { en: 'Payment service down',          fr: 'Service paiement HS' },         concept: { en: 'Missing Secret',      fr: 'Secret manquant' } },
  { id: 'ticket-009', ns: 'exo-009', level: 'easy',   title: { en: "Worker won't start",            fr: 'Worker qui ne démarre pas' },   concept: { en: 'Wrong args/command',  fr: 'Mauvais args/command' } },
  { id: 'ticket-010', ns: 'exo-010', level: 'medium', title: { en: 'App stuck on Init',             fr: 'Application bloquée (Init)' },  concept: { en: 'Init container',      fr: 'Init container' } },
];

function exerciseForLang(ex, lang) {
  return { id: ex.id, ns: ex.ns, level: ex.level, title: ex.title[lang], concept: ex.concept[lang] };
}

// Resolve a mission file for the requested language, falling back to any available one.
function missionFile(id, lang) {
  const candidates = [
    path.join(EXERCISES_DIR, id, `mission.${lang}.md`),
    ...LANGS.map(l => path.join(EXERCISES_DIR, id, `mission.${l}.md`)),
    path.join(EXERCISES_DIR, id, 'mission.md'),
  ];
  return candidates.find(fs.existsSync) || null;
}

// ─── SSE stream ───────────────────────────────────────────────────────────────

function sseStream(res, script, cwd, timeout) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send  = obj => res.write('data: ' + JSON.stringify(obj) + '\n\n');
  const child = spawn('bash', [script], { cwd });
  const timer = setTimeout(() => child.kill(), timeout);
  child.on('error', err => {
    clearTimeout(timer);
    send({ type: 'err', text: 'Error: ' + err.message + '\n' });
    send({ type: 'done', ok: false });
    res.end();
  });
  child.stdout.on('data', d => send({ type: 'out', text: d.toString() }));
  child.stderr.on('data', d => send({ type: 'err', text: d.toString() }));
  child.on('close', code => {
    clearTimeout(timer);
    send({ type: 'done', ok: code === 0 });
    res.end();
  });
}

// ─── Server ───────────────────────────────────────────────────────────────────

http.createServer((req, res) => {
  const url  = req.url.split('?')[0];
  const lang = langOf(req.url);

  // JSON API
  if (url === '/api/courses') return json(res, COURSES[lang]);

  if (url.startsWith('/api/courses/')) {
    const slug = url.slice(13);
    const file = path.join(COURSES_DIR, lang, slug + '.md');
    if (!fs.existsSync(file)) return json(res, { error: 'not found' }, 404);
    return json(res, { markdown: fs.readFileSync(file, 'utf8') });
  }

  if (url === '/api/exercises') return json(res, EXERCISES.map(e => exerciseForLang(e, lang)));

  if (req.method === 'GET' && url.startsWith('/api/exercises/')) {
    const id = url.slice(15);
    const ex = EXERCISES.find(e => e.id === id);
    if (!ex) return json(res, { error: 'not found' }, 404);
    const file = missionFile(id, lang);
    if (!file) return json(res, { error: 'mission not found' }, 404);
    return json(res, { ...exerciseForLang(ex, lang), markdown: fs.readFileSync(file, 'utf8') });
  }

  // SSE API
  if (req.method === 'POST' && url.startsWith('/api/deploy/')) {
    const id     = url.slice(12);
    const ex     = EXERCISES.find(e => e.id === id);
    if (!ex) return json(res, { error: 'not found' }, 404);
    const script = path.join(EXERCISES_DIR, id, 'deploy.sh');
    if (!fs.existsSync(script)) return json(res, { error: 'deploy.sh not found' }, 404);
    return sseStream(res, script, EXERCISES_DIR, 30000);
  }

  if (req.method === 'POST' && url === '/api/reset') {
    if (!fs.existsSync(RESET_SCRIPT)) return json(res, { error: 'reset.sh not found' }, 404);
    return sseStream(res, RESET_SCRIPT, EXERCISES_DIR, 60000);
  }

  // Crash demo (used to show the liveness probe restarting the pod)
  if (url === '/error') {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error\n');
    process.exit(1);
  }

  // Static files
  const ext = path.extname(url);
  if (ext) return serveFile(res, path.join(PUBLIC_DIR, url));

  // SPA fallback
  serveIndex(res);

}).listen(process.env.PORT || 3000, () => {
  console.log(`K8s Learn — http://localhost:${process.env.PORT || 3000}`);
});
