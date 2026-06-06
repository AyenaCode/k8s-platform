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

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func lang(r *http.Request) string { return r.URL.Query().Get("lang") }

// userID is the single local user until auth lands. Swap for the authenticated
// principal when multi-user is enabled.
func userID(r *http.Request) string { return "local" }

// --- Content (JSON) ---

func (h *handlers) listLessons(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.d.Content.Lessons(lang(r)))
}

func (h *handlers) getLesson(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	lesson, ok := h.d.Content.Lesson(slug, lang(r))
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, lesson)
}

// --- Interactive step tasks (SSE) ---

// setupStep streams an optional pre-seed script that prepares cluster state for a
// step (e.g. creates a Deployment the learner will then expose).
func (h *handlers) setupStep(w http.ResponseWriter, r *http.Request) {
	h.runStepScript(w, r, "setup")
}

// verifyStep streams the step's verify script. On success (exit 0) it records the
// step as solved, and, if every verify step of the lesson is now solved,
// records the lesson as complete (awarding its XP once).
func (h *handlers) verifyStep(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	stepID := chi.URLParam(r, "stepId")
	if !content.SafeID(slug) || !content.SafeID(stepID) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "bad id"})
		return
	}
	script, ok := h.d.Content.StepScript(slug, stepID, "verify")
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "no verify for this step"})
		return
	}

	// We need to know the exit result to award XP, but StreamScript writes the
	// SSE stream itself. Run it, then award based on the cluster re-check below.
	// 120s: a verify may follow a slow first-time image pull on a cold cluster.
	res := xexec.StreamScriptResult(w, r, script, h.d.Content.LessonsDir(), 120*time.Second)
	if !res.OK {
		return
	}

	// Step solved → award step XP (idempotent), then maybe complete the lesson.
	lesson, lok := h.d.Content.Lesson(slug, content.DefaultLang)
	stepXP := 0
	if lok {
		for _, s := range lesson.Steps {
			if s.ID == stepID {
				stepXP = s.XP
			}
		}
	}
	_, _ = h.d.Progress.MarkSolved(r.Context(), userID(r), progress.StepKey(slug, stepID), stepXP)
	h.maybeCompleteLesson(r, slug)
}

// maybeCompleteLesson records the lesson as complete once all of its verify steps
// are solved by the user.
func (h *handlers) maybeCompleteLesson(r *http.Request, slug string) {
	needed := h.d.Content.VerifyStepIDs(slug)
	if len(needed) == 0 {
		return
	}
	recs, err := h.d.Progress.List(r.Context(), userID(r))
	if err != nil {
		return
	}
	solved := make(map[string]bool, len(recs))
	for _, rec := range recs {
		if rec.Solved {
			solved[rec.ExerciseID] = true
		}
	}
	for _, id := range needed {
		if !solved[progress.StepKey(slug, id)] {
			return // not all verify steps solved yet
		}
	}
	if xp, ok := h.d.Content.LessonXP(slug); ok {
		_, _ = h.d.Progress.MarkSolved(r.Context(), userID(r), progress.LessonKey(slug), xp)
	}
}

func (h *handlers) runStepScript(w http.ResponseWriter, r *http.Request, kind string) {
	slug := chi.URLParam(r, "slug")
	stepID := chi.URLParam(r, "stepId")
	if !content.SafeID(slug) || !content.SafeID(stepID) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "bad id"})
		return
	}
	script, ok := h.d.Content.StepScript(slug, stepID, kind)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "no " + kind + " for this step"})
		return
	}
	// 120s: a setup script may wait on a first-time image pull (rollout status).
	xexec.StreamScript(w, r, script, h.d.Content.LessonsDir(), 120*time.Second)
}

// reset wipes the learner's scratch cluster state (non-system namespaces and the
// default namespace's resources) so they can start clean.
func (h *handlers) reset(w http.ResponseWriter, r *http.Request) {
	script := filepath.Join(h.d.Content.LessonsDir(), "..", "reset.sh")
	xexec.StreamScript(w, r, script, h.d.Content.LessonsDir(), 60*time.Second)
}

// --- Progress / gamification ---

type progressSummary struct {
	Records []progress.Record  `json:"records"`
	TotalXP int                `json:"totalXp"`
	Level   progress.LevelInfo `json:"level"`
	Streak  int                `json:"streak"`
	Badges  []progress.Badge   `json:"badges"`
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
	streak := progress.Streak(recs, time.Now())
	writeJSON(w, http.StatusOK, progressSummary{
		Records: recs,
		TotalXP: total,
		Level:   progress.Level(total),
		Streak:  streak,
		Badges:  progress.Badges(recs, len(h.d.Content.Lessons(content.DefaultLang)), streak),
	})
}
