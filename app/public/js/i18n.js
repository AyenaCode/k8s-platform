// Tiny client-side i18n. Language is stored in localStorage and defaults to the
// browser language (fr -> French, anything else -> English).
const LANG_KEY = 'k8s-learn-lang';

const STRINGS = {
  en: {
    'nav.courses':    'Courses',
    'nav.exercises':  'Exercises',
    'xp.title':       'Your experience points',
    'streak.title':   'Consecutive practice days',
    'lang.switchTo':  'FR',
    'boot':           'Connecting to the cluster...',
    'copy':           'Copy',
    'copied':         'Copied!',
    'term.done':      'done',
    'term.error':     'error',
    'common.error':   'Error: ',

    'toast.levelUp.title': 'Level up!',
    'toast.levelUp.desc':  'You are now {name}',

    'level.apprentice': 'Apprentice',
    'level.padawan':    'Padawan',
    'level.sreJunior':  'SRE Junior',
    'level.devopsPro':  'DevOps Pro',
    'level.k8sMaster':  'K8s Master',

    'level.easy':   'Easy',
    'level.medium': 'Medium',
    'level.hard':   'Hard',

    'ach.first_deploy.label':  'First Contact',
    'ach.first_deploy.desc':   'Launched your first exercise',
    'ach.bug_hunter.label':    'Bug Hunter',
    'ach.bug_hunter.desc':     'Solved 5 exercises',
    'ach.completionist.label': 'Completionist',
    'ach.completionist.desc':  'Finished every exercise',
    'ach.bookworm.label':      'Bookworm',
    'ach.bookworm.desc':       'Read every course',
    'ach.k8s_full.label':      'Full Kubernetes',
    'ach.k8s_full.desc':       'Courses + exercises completed',

    'home.tagline':           'Your Kubernetes learning platform.<br>Read. Deploy. Diagnose. Fix.',
    'home.ringCourses':       'Courses',
    'home.ringExercises':     'Exercises',
    'home.ctaCoursesDesc':    '{n} chapters — architecture, kubectl, debugging. Read them in order.',
    'home.ctaCoursesArrow':   'Start the courses →',
    'home.ctaExercisesDesc':  '{n} incident tickets. Real bugs, real commands, no cheating.',
    'home.ctaExercisesArrow': 'See the exercises →',
    'home.achievements':      'Achievements',
    'home.nextCourse':        'Next course: {title}',
    'home.nextExercise':      'Next exercise: {title}',
    'home.allDone':           "All done — you're ready for the CKA.",

    'courses.subtitle': 'Read them in order. {n} chapters — about 1h45 in total.',
    'courses.chapter':  'Chapter {n}',

    'course.notFound': 'Course not found',
    'course.back':     '← Back to courses',

    'exercises.subtitle': 'Launch the deployment in the cluster, diagnose it with kubectl, fix it. {done}/{total} solved.',

    'exercise.env':           'Environment',
    'exercise.solved':        'Solved',
    'exercise.launch':        'Launch exercise',
    'exercise.markSolved':    'Mark as solved',
    'exercise.reset':         'Reset',
    'exercise.resetConfirm':  'Delete every exo-* namespace?',
    'exercise.notFound':      'Exercise not found',
    'exercise.back':          '← Back',

    'error.title':    'Error',
    'notFound.title': 'Page not found',
    'notFound.home':  '← Home',
  },

  fr: {
    'nav.courses':    'Cours',
    'nav.exercises':  'Exercices',
    'xp.title':       "Tes points d'expérience",
    'streak.title':   'Jours de pratique consécutifs',
    'lang.switchTo':  'EN',
    'boot':           'Connexion au cluster...',
    'copy':           'Copier',
    'copied':         'Copié !',
    'term.done':      'terminé',
    'term.error':     'erreur',
    'common.error':   'Erreur : ',

    'toast.levelUp.title': 'Level up !',
    'toast.levelUp.desc':  'Tu es maintenant {name}',

    'level.apprentice': 'Apprenti',
    'level.padawan':    'Padawan',
    'level.sreJunior':  'SRE Junior',
    'level.devopsPro':  'DevOps Pro',
    'level.k8sMaster':  'K8s Master',

    'level.easy':   'Facile',
    'level.medium': 'Moyen',
    'level.hard':   'Difficile',

    'ach.first_deploy.label':  'Premier Contact',
    'ach.first_deploy.desc':   'Premier exercice lancé',
    'ach.bug_hunter.label':    'Chasseur de Bugs',
    'ach.bug_hunter.desc':     '5 exercices résolus',
    'ach.completionist.label': 'Completionniste',
    'ach.completionist.desc':  'Tous les exercices terminés',
    'ach.bookworm.label':      'Bibliothécaire',
    'ach.bookworm.desc':       'Tous les cours lus',
    'ach.k8s_full.label':      'Full Kubernetes',
    'ach.k8s_full.desc':       'Cours + exercices complétés',

    'home.tagline':           "Ta plateforme d'apprentissage Kubernetes.<br>Lis. Déploie. Diagnostique. Répare.",
    'home.ringCourses':       'Cours',
    'home.ringExercises':     'Exercices',
    'home.ctaCoursesDesc':    "{n} chapitres — architecture, kubectl, debug. À lire dans l'ordre.",
    'home.ctaCoursesArrow':   'Commencer les cours →',
    'home.ctaExercisesDesc':  "{n} tickets d'incident. Vrais bugs, vraies commandes, pas de triche.",
    'home.ctaExercisesArrow': 'Voir les exercices →',
    'home.achievements':      'Achievements',
    'home.nextCourse':        'Prochain cours : {title}',
    'home.nextExercise':      'Prochain exercice : {title}',
    'home.allDone':           'Tout est complété — tu es prêt pour la CKA.',

    'courses.subtitle': "À lire dans l'ordre. {n} chapitres — environ 1h45 au total.",
    'courses.chapter':  'Chapitre {n}',

    'course.notFound': 'Cours introuvable',
    'course.back':     '← Retour aux cours',

    'exercises.subtitle': 'Lance le déploiement dans le cluster, diagnostique avec kubectl, répare. {done}/{total} résolus.',

    'exercise.env':           'Environnement',
    'exercise.solved':        'Résolu',
    'exercise.launch':        "Lancer l'exercice",
    'exercise.markSolved':    'Marquer résolu',
    'exercise.reset':         'Reset',
    'exercise.resetConfirm':  'Supprimer tous les namespaces exo-* ?',
    'exercise.notFound':      'Exercice introuvable',
    'exercise.back':          '← Retour',

    'error.title':    'Erreur',
    'notFound.title': 'Page introuvable',
    'notFound.home':  '← Accueil',
  },
};

export function getLang() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'en' || saved === 'fr') return saved;
  return (navigator.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
}

export function toggleLang() {
  const next = getLang() === 'en' ? 'fr' : 'en';
  setLang(next);
  return next;
}

// Translate a key. {placeholders} are filled from `vars`. Falls back to English, then the key.
export function t(key, vars) {
  const lang = getLang();
  let s = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key] ?? key;
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

// Fill static markup: [data-i18n] sets textContent, [data-i18n-html] sets innerHTML,
// [data-i18n-title] sets the title attribute. Also refreshes the language toggle label.
export function applyStatic(root = document) {
  document.documentElement.lang = getLang();
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.textContent = t('lang.switchTo');
}
