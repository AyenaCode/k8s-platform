// Package content is the content tier. It loads a manifest-driven curriculum from
// the filesystem: each lesson is a directory under content/lessons/ holding a
// lesson.json manifest, per-step markdown (bilingual), and optional setup/verify
// shell scripts. Adding a lesson is purely additive: drop a new directory, no
// code change, which is the whole point of the schema.
//
// On-disk layout:
//
//	content/lessons/01-pods/
//	  lesson.json                  manifest (source of truth, ordered steps)
//	  steps/en/01-intro.md         step prose, per language
//	  steps/fr/01-intro.md
//	  scripts/02-setup.sh          optional: pre-seed cluster state
//	  scripts/02-verify.sh         optional: exit 0 => step solved
package content

import (
	"encoding/json"
	"os"
	"path/filepath"
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

// i18n is a bilingual string in a manifest: {"en": "...", "fr": "..."}.
type i18n struct {
	En string `json:"en"`
	Fr string `json:"fr"`
}

func (s i18n) get(lang string) string {
	if lang == "fr" && s.Fr != "" {
		return s.Fr
	}
	return s.En
}

// --- on-disk manifest types (lesson.json) ---

type stepManifest struct {
	ID     string            `json:"id"`
	Title  i18n              `json:"title"`
	Md     map[string]string `json:"md"`     // lang -> path relative to the lesson dir
	Setup  string            `json:"setup"`  // optional script path, relative to lesson dir
	Verify string            `json:"verify"` // optional script path, relative to lesson dir
	Hint   i18n              `json:"hint"`
	XP     int               `json:"xp"`
}

type lessonManifest struct {
	Slug       string         `json:"slug"`
	Track      string         `json:"track"` // "core" (default) or "ckad"; groups lessons into UI sections
	Title      i18n           `json:"title"`
	Summary    i18n           `json:"summary"`
	EstMinutes int            `json:"estMinutes"`
	XP         int            `json:"xp"` // awarded once when the lesson is completed
	Steps      []stepManifest `json:"steps"`
}

// --- API types returned to the frontend ---

// Step is one localized step: the concept prose plus whether it carries an
// interactive setup/verify task.
type Step struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Markdown  string `json:"markdown,omitempty"`
	Hint      string `json:"hint,omitempty"`
	HasSetup  bool   `json:"hasSetup"`
	HasVerify bool   `json:"hasVerify"`
	XP        int    `json:"xp"`
}

// LessonCard is a catalog entry (no step prose).
type LessonCard struct {
	Slug        string `json:"slug"`
	Track       string `json:"track"` // "core" or "ckad"; lets the UI split lessons into sections
	Title       string `json:"title"`
	Summary     string `json:"summary"`
	EstMinutes  int    `json:"estMinutes"`
	XP          int    `json:"xp"`
	StepCount   int    `json:"stepCount"`
	VerifyCount int    `json:"verifyCount"` // number of steps that must be verified to complete
}

// Lesson is a full localized lesson: the card plus its ordered steps.
type Lesson struct {
	LessonCard
	Steps []Step `json:"steps"`
}

// Repo serves lessons from the configured directory.
type Repo struct {
	lessonsDir string
}

func NewRepo(lessonsDir string) *Repo { return &Repo{lessonsDir: lessonsDir} }

// LessonsDir exposes the root so the exec layer can run setup/verify scripts.
func (r *Repo) LessonsDir() string { return r.lessonsDir }

// readManifest loads and decodes one lesson.json.
func (r *Repo) readManifest(slug string) (lessonManifest, bool) {
	b, err := os.ReadFile(filepath.Join(r.lessonsDir, slug, "lesson.json"))
	if err != nil {
		return lessonManifest{}, false
	}
	var m lessonManifest
	if err := json.Unmarshal(b, &m); err != nil {
		return lessonManifest{}, false
	}
	if m.Slug == "" {
		m.Slug = slug
	}
	return m, true
}

func (m lessonManifest) verifyCount() int {
	n := 0
	for _, s := range m.Steps {
		if s.Verify != "" {
			n++
		}
	}
	return n
}

func (m lessonManifest) card(lang string) LessonCard {
	track := m.Track
	if track == "" {
		track = "core"
	}
	return LessonCard{
		Slug:        m.Slug,
		Track:       track,
		Title:       m.Title.get(lang),
		Summary:     m.Summary.get(lang),
		EstMinutes:  m.EstMinutes,
		XP:          m.XP,
		StepCount:   len(m.Steps),
		VerifyCount: m.verifyCount(),
	}
}

// Lessons returns the catalog, ordered by directory name (so a 01-/02- prefix
// drives ordering). Directories without a valid lesson.json are skipped.
func (r *Repo) Lessons(lang string) []LessonCard {
	lang = validLang(lang)
	entries, err := os.ReadDir(r.lessonsDir)
	if err != nil {
		return []LessonCard{}
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		if e.IsDir() {
			names = append(names, e.Name())
		}
	}
	sort.Strings(names)

	out := make([]LessonCard, 0, len(names))
	for _, slug := range names {
		if m, ok := r.readManifest(slug); ok {
			out = append(out, m.card(lang))
		}
	}
	return out
}

// Lesson returns one localized lesson with its steps and resolved prose.
func (r *Repo) Lesson(slug, lang string) (Lesson, bool) {
	lang = validLang(lang)
	m, ok := r.readManifest(slug)
	if !ok {
		return Lesson{}, false
	}
	lesson := Lesson{LessonCard: m.card(lang), Steps: make([]Step, 0, len(m.Steps))}
	for _, s := range m.Steps {
		lesson.Steps = append(lesson.Steps, Step{
			ID:        s.ID,
			Title:     s.Title.get(lang),
			Markdown:  r.stepMarkdown(slug, s, lang),
			Hint:      s.Hint.get(lang),
			HasSetup:  s.Setup != "",
			HasVerify: s.Verify != "",
			XP:        s.XP,
		})
	}
	return lesson, true
}

// stepMarkdown resolves a step's prose file for a language, falling back to the
// default language then any available language.
func (r *Repo) stepMarkdown(slug string, s stepManifest, lang string) string {
	tryLangs := append([]string{lang, DefaultLang}, Langs...)
	for _, l := range tryLangs {
		rel, ok := s.Md[l]
		if !ok || rel == "" {
			continue
		}
		if b, err := os.ReadFile(filepath.Join(r.lessonsDir, slug, rel)); err == nil {
			return string(b)
		}
	}
	return ""
}

// StepScript returns the absolute path to a step's setup or verify script
// (kind = "setup" | "verify"), if the manifest declares it and the file exists.
func (r *Repo) StepScript(slug, stepID, kind string) (string, bool) {
	m, ok := r.readManifest(slug)
	if !ok {
		return "", false
	}
	for _, s := range m.Steps {
		if s.ID != stepID {
			continue
		}
		var rel string
		switch kind {
		case "setup":
			rel = s.Setup
		case "verify":
			rel = s.Verify
		}
		if rel == "" {
			return "", false
		}
		path := filepath.Join(r.lessonsDir, slug, rel)
		if _, err := os.Stat(path); err != nil {
			return "", false
		}
		return path, true
	}
	return "", false
}

// LessonXP returns the completion XP for a lesson and whether the slug exists.
func (r *Repo) LessonXP(slug string) (int, bool) {
	m, ok := r.readManifest(slug)
	if !ok {
		return 0, false
	}
	return m.XP, true
}

// VerifyStepIDs returns the ids of every step that has a verify script. The
// lesson is "complete" once all of these are solved.
func (r *Repo) VerifyStepIDs(slug string) []string {
	m, ok := r.readManifest(slug)
	if !ok {
		return nil
	}
	ids := make([]string, 0)
	for _, s := range m.Steps {
		if s.Verify != "" {
			ids = append(ids, s.ID)
		}
	}
	return ids
}

// Exists reports whether a lesson slug resolves to a manifest.
func (r *Repo) Exists(slug string) bool {
	_, ok := r.readManifest(slug)
	return ok
}

// SafeID guards path components used to build script/markdown paths from URL
// params (defence in depth against traversal); ids are simple slugs.
func SafeID(id string) bool {
	return id != "" && !strings.ContainsAny(id, "/\\.")
}
