// Command server is the Go application-tier entrypoint: it wires the content
// repository, data store, command runner and PTY terminal into one HTTP server
// and runs with graceful shutdown.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ayenacode/k8s-platform/backend/internal/config"
	"github.com/ayenacode/k8s-platform/backend/internal/content"
	"github.com/ayenacode/k8s-platform/backend/internal/httpapi"
	"github.com/ayenacode/k8s-platform/backend/internal/progress"
	"github.com/ayenacode/k8s-platform/backend/internal/terminal"
)

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	cfg := config.Load()

	// Data tier: Postgres if DATABASE_URL is set, else in-memory.
	store, err := newStore(cfg, log)
	if err != nil {
		log.Error("store init failed", "err", err)
		os.Exit(1)
	}
	defer store.Close()

	repo := content.NewRepo(cfg.CoursesDir, cfg.ExercisesDir)

	router := httpapi.NewRouter(httpapi.Deps{
		Content:   repo,
		Progress:  store,
		Terminal:  terminal.NewHandler(cfg.PTYShell, cfg.ExercisesDir, nil, log),
		StaticDir: staticDirIfExists(cfg.StaticDir),
		Log:       log,
	})

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		// No WriteTimeout: SSE and the PTY WebSocket are long-lived streams.
	}

	go func() {
		log.Info("listening", "addr", cfg.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown on SIGINT/SIGTERM.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("shutting down")
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Error("shutdown error", "err", err)
	}
}

func newStore(cfg config.Config, log *slog.Logger) (progress.Store, error) {
	if cfg.DatabaseURL == "" {
		log.Info("data tier: in-memory store (set DATABASE_URL for Postgres)")
		return progress.NewMemoryStore(), nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	log.Info("data tier: postgres")
	return progress.NewPostgresStore(ctx, cfg.DatabaseURL)
}

func staticDirIfExists(dir string) string {
	if dir == "" {
		return ""
	}
	if _, err := os.Stat(dir); err != nil {
		return "" // frontend not built yet; API-only mode
	}
	return dir
}
