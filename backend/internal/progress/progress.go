// Package progress is the data tier: it persists per-user exercise progress and
// gamification (XP). It is defined as an interface so the rest of the app never
// depends on a concrete store: the in-memory store runs with zero setup, and
// the Postgres store (postgres.go) is a drop-in for production scale.
package progress

import (
	"context"
	"sync"
	"time"
)

// Record is one user's state for one exercise.
type Record struct {
	UserID     string     `json:"userId"`
	ExerciseID string     `json:"exerciseId"`
	Solved     bool       `json:"solved"`
	XP         int        `json:"xp"`
	SolvedAt   *time.Time `json:"solvedAt,omitempty"`
}

// Store is the data-tier contract. Implementations: MemoryStore, PostgresStore.
type Store interface {
	// List returns all records for a user.
	List(ctx context.Context, userID string) ([]Record, error)
	// MarkSolved records an exercise as solved (idempotent) and awards xp once.
	MarkSolved(ctx context.Context, userID, exerciseID string, xp int) (Record, error)
	// Close releases any resources (no-op for in-memory).
	Close() error
}

// MemoryStore is a process-local Store. Good for local/dev and single-instance.
type MemoryStore struct {
	mu   sync.RWMutex
	data map[string]map[string]Record // userID -> exerciseID -> record
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{data: make(map[string]map[string]Record)}
}

func (m *MemoryStore) List(_ context.Context, userID string) ([]Record, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]Record, 0)
	for _, rec := range m.data[userID] {
		out = append(out, rec)
	}
	return out, nil
}

func (m *MemoryStore) MarkSolved(_ context.Context, userID, exerciseID string, xp int) (Record, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.data[userID] == nil {
		m.data[userID] = make(map[string]Record)
	}
	if existing, ok := m.data[userID][exerciseID]; ok && existing.Solved {
		return existing, nil // already solved; do not re-award xp
	}
	now := time.Now()
	rec := Record{UserID: userID, ExerciseID: exerciseID, Solved: true, XP: xp, SolvedAt: &now}
	m.data[userID][exerciseID] = rec
	return rec, nil
}

func (m *MemoryStore) Close() error { return nil }
