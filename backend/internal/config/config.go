// Package config loads runtime configuration from the environment.
// Twelve-factor style: everything comes from env vars with sane local defaults,
// so the binary runs with zero config in dev and is fully configurable in prod.
package config

import (
	"os"
	"path/filepath"
)

type Config struct {
	Addr string // host:port the HTTP server binds to

	// Content tier (lesson manifests + markdown + scripts), files on disk.
	ContentRoot string // root holding content/
	LessonsDir  string // content/lessons

	// Working directory the interactive PTY terminal starts in.
	WorkDir string

	// Where the built frontend SPA lives (dist/). Empty disables static serving.
	StaticDir string

	// Data tier. Empty DatabaseURL => in-memory progress repo (no Postgres needed).
	DatabaseURL string

	// Shell spawned for the interactive PTY terminal.
	PTYShell string
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
		Addr:        getenv("ADDR", ":8080"),
		ContentRoot: contentRoot,
		LessonsDir:  getenv("LESSONS_DIR", filepath.Join(contentRoot, "content", "lessons")),
		WorkDir:     getenv("WORK_DIR", "."),
		StaticDir:   getenv("STATIC_DIR", filepath.Join("..", "frontend", "dist")),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		PTYShell:    getenv("PTY_SHELL", "/bin/bash"),
	}
	return cfg
}
