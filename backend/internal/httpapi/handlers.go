package httpapi

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/ayenacode/k8s-platform/backend/internal/content"
	xexec "github.com/ayenacode/k8s-platform/backend/internal/exec"
	"github.com/ayenacode/k8s-platform/backend/internal/progress"
)

type handlers struct{ d Deps }

// xpForLevel awards XP by difficulty when an exercise is solved.
var xpForLevel = map[string]int{"easy": 100, "medium": 200, "hard": 350}

// courseXP is the flat XP awarded for finishing a course (reaching its last step).
const courseXP = 50

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func lang(r *http.Request) string { return r.URL.Query().Get("lang") }

// demoUser is the single local user until auth lands. Swap for the authenticated
// principal when multi-user is enabled.
func userID(r *http.Request) string { return "local" }

func (h *handlers) listCourses(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.d.Content.Courses(lang(r)))
}

func (h *handlers) getCourse(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	md, ok := h.d.Content.CourseMarkdown(slug, lang(r))
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"slug": slug, "markdown": md})
}

func (h *handlers) listExercises(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.d.Content.Exercises(lang(r)))
}

func (h *handlers) getExercise(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ex, ok := h.d.Content.Exercise(id, lang(r))
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, ex)
}

func (h *handlers) deploy(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if _, ok := h.d.Content.NamespaceFor(id); !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	dir := h.d.Content.ExercisesDir()
	script := filepath.Join(dir, id, "deploy.sh")
	xexec.StreamScript(w, r, script, dir, 30*time.Second)
}

func (h *handlers) reset(w http.ResponseWriter, r *http.Request) {
	dir := h.d.Content.ExercisesDir()
	xexec.StreamScript(w, r, filepath.Join(dir, "reset.sh"), dir, 60*time.Second)
}

func (h *handlers) check(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ns, ok := h.d.Content.NamespaceFor(id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	dir := h.d.Content.ExercisesDir()
	xexec.StreamScript(w, r, filepath.Join(dir, "check.sh"), dir, 30*time.Second, ns)
}

func (h *handlers) listProgress(w http.ResponseWriter, r *http.Request) {
	recs, err := h.d.Progress.List(r.Context(), userID(r))
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, recs)
}

// progressSummary is the aggregated gamification view consumed by the dashboard
// and the nav chip: raw records plus derived total XP, level and badges.
type progressSummary struct {
	Records []progress.Record `json:"records"`
	TotalXP int               `json:"totalXp"`
	Level   progress.LevelInfo `json:"level"`
	Badges  []progress.Badge  `json:"badges"`
}

func (h *handlers) summary(w http.ResponseWriter, r *http.Request) {
	recs, err := h.d.Progress.List(r.Context(), userID(r))
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	total := 0
	for _, rec := range recs {
		if rec.Solved {
			total += rec.XP
		}
	}
	exos := h.d.Content.Exercises(content.DefaultLang)
	courses := h.d.Content.Courses(content.DefaultLang)
	writeJSON(w, http.StatusOK, progressSummary{
		Records: recs,
		TotalXP: total,
		Level:   progress.Level(total),
		Badges:  progress.Badges(recs, len(exos), len(courses)),
	})
}

// completeCourse records a course as finished (idempotent) and awards a flat XP.
func (h *handlers) completeCourse(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if _, ok := h.d.Content.CourseMarkdown(slug, content.DefaultLang); !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	rec, err := h.d.Progress.MarkSolved(r.Context(), userID(r), progress.CourseKey(slug), courseXP)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, rec)
}

func (h *handlers) solve(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ex, ok := h.d.Content.Exercise(id, "en")
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	rec, err := h.d.Progress.MarkSolved(r.Context(), userID(r), id, xpForLevel[ex.Level])
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, rec)
}
