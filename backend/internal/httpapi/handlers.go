package httpapi

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"time"

	"github.com/go-chi/chi/v5"

	xexec "github.com/ayenacode/k8s-platform/backend/internal/exec"
)

type handlers struct{ d Deps }

// xpForLevel awards XP by difficulty when an exercise is solved.
var xpForLevel = map[string]int{"easy": 100, "medium": 200, "hard": 350}

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

func (h *handlers) run(w http.ResponseWriter, r *http.Request) {
	cmd := r.URL.Query().Get("cmd")
	h.d.CommandRunner.Run(w, r, cmd, h.d.CommandTimeout)
}

func (h *handlers) listProgress(w http.ResponseWriter, r *http.Request) {
	recs, err := h.d.Progress.List(r.Context(), userID(r))
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, recs)
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
