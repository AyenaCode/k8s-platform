// Package content is the content-tier repository: it reads bilingual courses and
// exercises from the filesystem (markdown + shell scripts). This is a faithful
// port of the data logic that used to live in app/server.js.
package content

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

const DefaultLang = "en"

var Langs = []string{"en", "fr"}

func validLang(lang string) string {
	for _, l := range Langs {
		if l == lang {
			return lang
		}
	}
	return DefaultLang
}

// Course is a card in the catalog, derived from the first H1 and blockquote of
// each markdown file.
type Course struct {
	Slug     string `json:"slug"`
	Title    string `json:"title"`
	Desc     string `json:"desc"`
	Duration string `json:"duration"`
}

// Exercise is one debugging ticket. Title/Concept are localized at read time.
type Exercise struct {
	ID       string `json:"id"`
	NS       string `json:"ns"`
	Level    string `json:"level"`
	Title    string `json:"title"`
	Concept  string `json:"concept"`
	Markdown string `json:"markdown,omitempty"`
}

type i18n struct{ en, fr string }

func (s i18n) get(lang string) string {
	if lang == "fr" {
		return s.fr
	}
	return s.en
}

type exerciseDef struct {
	id, ns, level  string
	title, concept i18n
}

// catalog mirrors the EXERCISES array from server.js. Order is significant.
var catalog = []exerciseDef{
	{"ticket-001", "exo-001", "easy", i18n{"App unreachable", "App injoignable"}, i18n{"Selector typo", "Selector typo"}},
	{"ticket-002", "exo-002", "easy", i18n{"Deployment stuck", "Déploiement bloqué"}, i18n{"ImagePullBackOff", "ImagePullBackOff"}},
	{"ticket-003", "exo-003", "medium", i18n{"Connection refused", "Connection refused"}, i18n{"targetPort mismatch", "targetPort mismatch"}},
	{"ticket-004", "exo-004", "medium", i18n{"Pods in a crash loop", "Pods en crash loop"}, i18n{"Missing ConfigMap", "ConfigMap manquant"}},
	{"ticket-005", "exo-005", "hard", i18n{"Disastrous production rollout", "Mise en prod catastrophique"}, i18n{"Multi-service stack", "Stack multi-services"}},
	{"ticket-006", "exo-006", "medium", i18n{"Pods never become Ready", "Pods jamais Ready"}, i18n{"Misconfigured probe", "Probe mal configurée"}},
	{"ticket-007", "exo-007", "medium", i18n{"Cache keeps dying", "Cache qui meurt en boucle"}, i18n{"OOMKilled", "OOMKilled"}},
	{"ticket-008", "exo-008", "medium", i18n{"Payment service down", "Service paiement HS"}, i18n{"Missing Secret", "Secret manquant"}},
	{"ticket-009", "exo-009", "easy", i18n{"Worker won't start", "Worker qui ne démarre pas"}, i18n{"Wrong args/command", "Mauvais args/command"}},
	{"ticket-010", "exo-010", "medium", i18n{"App stuck on Init", "Application bloquée (Init)"}, i18n{"Init container", "Init container"}},
}

// Repo serves content from the configured directories.
type Repo struct {
	coursesDir   string
	exercisesDir string
}

func NewRepo(coursesDir, exercisesDir string) *Repo {
	return &Repo{coursesDir: coursesDir, exercisesDir: exercisesDir}
}

func (e exerciseDef) localize(lang string) Exercise {
	return Exercise{ID: e.id, NS: e.ns, Level: e.level, Title: e.title.get(lang), Concept: e.concept.get(lang)}
}

// Exercises returns the catalog localized to lang (without mission markdown).
func (r *Repo) Exercises(lang string) []Exercise {
	lang = validLang(lang)
	out := make([]Exercise, len(catalog))
	for i, d := range catalog {
		out[i] = d.localize(lang)
	}
	return out
}

// Exercise returns one localized exercise plus its mission markdown.
func (r *Repo) Exercise(id, lang string) (Exercise, bool) {
	lang = validLang(lang)
	for _, d := range catalog {
		if d.id == id {
			ex := d.localize(lang)
			if md, ok := r.mission(id, lang); ok {
				ex.Markdown = md
			}
			return ex, true
		}
	}
	return Exercise{}, false
}

// NamespaceFor maps an exercise id to its cluster namespace, used by deploy/check.
func (r *Repo) NamespaceFor(id string) (string, bool) {
	for _, d := range catalog {
		if d.id == id {
			return d.ns, true
		}
	}
	return "", false
}

// mission resolves the mission file for a language, falling back to any available.
func (r *Repo) mission(id, lang string) (string, bool) {
	candidates := []string{filepath.Join(r.exercisesDir, id, fmt.Sprintf("mission.%s.md", lang))}
	for _, l := range Langs {
		candidates = append(candidates, filepath.Join(r.exercisesDir, id, fmt.Sprintf("mission.%s.md", l)))
	}
	candidates = append(candidates, filepath.Join(r.exercisesDir, id, "mission.md"))
	for _, c := range candidates {
		if b, err := os.ReadFile(c); err == nil {
			return string(b), true
		}
	}
	return "", false
}

// ExercisesDir exposes the root for the exec layer (deploy.sh / check.sh / reset.sh).
func (r *Repo) ExercisesDir() string { return r.exercisesDir }

var (
	durationNum = regexp.MustCompile(`^\d+\s*[—–-]\s*`)
	boldLabel   = regexp.MustCompile(`\*\*[^*]+\*\*\s*:\s*`)
	italic      = regexp.MustCompile(`\*([^*]+)\*`)
)

// Courses reads every .md in courses/<lang>/ and builds the catalog. Title comes
// from the first "# H1"; description from the first "> blockquote".
func (r *Repo) Courses(lang string) []Course {
	lang = validLang(lang)
	dir := filepath.Join(r.coursesDir, lang)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return []Course{}
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".md") {
			names = append(names, e.Name())
		}
	}
	sort.Strings(names)

	out := make([]Course, 0, len(names))
	for _, file := range names {
		raw, err := os.ReadFile(filepath.Join(dir, file))
		if err != nil {
			continue
		}
		text := string(raw)
		lines := strings.Split(text, "\n")
		slug := strings.TrimSuffix(file, ".md")

		title := slug
		for _, l := range lines {
			if strings.HasPrefix(l, "# ") {
				title = durationNum.ReplaceAllString(strings.TrimSpace(l[2:]), "")
				break
			}
		}
		desc := ""
		for _, l := range lines {
			if strings.HasPrefix(l, ">") {
				d := strings.TrimSpace(strings.TrimPrefix(l, ">"))
				d = boldLabel.ReplaceAllString(d, "")
				d = italic.ReplaceAllString(d, "$1")
				desc = strings.TrimSpace(d)
				break
			}
		}
		words := len(strings.Fields(text))
		mins := words / 200
		if mins < 1 {
			mins = 1
		}
		out = append(out, Course{Slug: slug, Title: title, Desc: desc, Duration: fmt.Sprintf("%d min", mins)})
	}
	return out
}

// CourseMarkdown returns the raw markdown for a course slug in a language.
func (r *Repo) CourseMarkdown(slug, lang string) (string, bool) {
	lang = validLang(lang)
	b, err := os.ReadFile(filepath.Join(r.coursesDir, lang, slug+".md"))
	if err != nil {
		return "", false
	}
	return string(b), true
}
