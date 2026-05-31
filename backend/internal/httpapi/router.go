// Package httpapi wires the application tier: REST (JSON), SSE streams,
// the PTY WebSocket, and static SPA serving — all on one origin (no CORS).
package httpapi

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/ayenacode/k8s-platform/backend/internal/content"
	"github.com/ayenacode/k8s-platform/backend/internal/progress"
	"github.com/ayenacode/k8s-platform/backend/internal/terminal"
)

type Deps struct {
	Content   *content.Repo
	Progress  progress.Store
	Terminal  *terminal.Handler
	StaticDir string
	Log       *slog.Logger
}

func NewRouter(d Deps) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(requestLogger(d.Log))

	h := &handlers{d: d}

	r.Route("/api", func(r chi.Router) {
		// Content (JSON)
		r.Get("/courses", h.listCourses)
		r.Get("/courses/{slug}", h.getCourse)
		r.Post("/courses/{slug}/complete", h.completeCourse)
		r.Get("/exercises", h.listExercises)
		r.Get("/exercises/{id}", h.getExercise)

		// SSE streams
		r.Post("/deploy/{id}", h.deploy)
		r.Post("/reset", h.reset)
		r.Post("/check/{id}", h.check)

		// Progress (data tier)
		r.Get("/progress", h.listProgress)
		r.Get("/progress/summary", h.summary)
		r.Post("/progress/{id}/solve", h.solve)
	})

	// Interactive PTY terminal (WebSocket).
	r.Handle("/ws/terminal", d.Terminal)

	// Static SPA with history fallback.
	if d.StaticDir != "" {
		r.Handle("/*", spaHandler(d.StaticDir))
	}
	return r
}

func requestLogger(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			next.ServeHTTP(ww, r)
			log.Info("http",
				"method", r.Method, "path", r.URL.Path,
				"status", ww.Status(), "dur", time.Since(start).String())
		})
	}
}
