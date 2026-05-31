// Package config loads runtime configuration from the environment.
// Twelve-factor style: everything comes from env vars with sane local defaults,
// so the binary runs with zero config in dev and is fully configurable in prod.
package config

import (
	"os"
	"path/filepath"
	"time"
)

type Config struct {
	Addr string // host:port the HTTP server binds to

	// Content tier (markdown + scripts). These are files, not database rows.
	ContentRoot  string // root holding courses/ and exercices/
	CoursesDir   string
	ExercisesDir string

	// Where the built frontend SPA lives (dist/). Empty disables static serving.
	StaticDir string

	// Data tier. Empty DatabaseURL => in-memory progress repo (no Postgres needed).
	DatabaseURL string

	// Terminal limits.
	CommandTimeout time.Duration // safe command box (SSE) hard timeout
	PTYShell       string        // shell spawned for the interactive PTY terminal
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func Load() Config {
	contentRoot := getenv("CONTENT_ROOT", "..")
	cfg := Config{
		Addr:           getenv("ADDR", ":8080"),
		ContentRoot:    contentRoot,
		CoursesDir:     getenv("COURSES_DIR", filepath.Join(contentRoot, "courses")),
		ExercisesDir:   getenv("EXERCISES_DIR", filepath.Join(contentRoot, "exercices")),
		StaticDir:      getenv("STATIC_DIR", filepath.Join("..", "frontend", "dist")),
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		CommandTimeout: 30 * time.Second,
		PTYShell:       getenv("PTY_SHELL", "/bin/bash"),
	}
	return cfg
}
