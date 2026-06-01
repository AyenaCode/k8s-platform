package progress

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PostgresStore is the production data-tier implementation, backed by a pgx pool.
// Schema lives in internal/db/migrations (golang-migrate).
type PostgresStore struct {
	pool *pgxpool.Pool
}

// schemaDDL is the idempotent schema, applied in-process on startup so the only
// runtime dependency stays Docker (no separate `migrate` binary in the image).
// Mirrors internal/db/migrations/0001_init.up.sql.
const schemaDDL = `
CREATE TABLE IF NOT EXISTS progress (
    user_id     TEXT        NOT NULL,
    exercise_id TEXT        NOT NULL,
    solved      BOOLEAN     NOT NULL DEFAULT false,
    xp          INTEGER     NOT NULL DEFAULT 0,
    solved_at   TIMESTAMPTZ,
    PRIMARY KEY (user_id, exercise_id)
);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress (user_id);`

// NewPostgresStore opens a connection pool and ensures the schema exists.
// Caller closes via Close().
func NewPostgresStore(ctx context.Context, databaseURL string) (*PostgresStore, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	if _, err := pool.Exec(ctx, schemaDDL); err != nil {
		pool.Close()
		return nil, err
	}
	return &PostgresStore{pool: pool}, nil
}

func (p *PostgresStore) List(ctx context.Context, userID string) ([]Record, error) {
	rows, err := p.pool.Query(ctx,
		`SELECT user_id, exercise_id, solved, xp, solved_at
		   FROM progress WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Record, 0)
	for rows.Next() {
		var r Record
		var solvedAt *time.Time
		if err := rows.Scan(&r.UserID, &r.ExerciseID, &r.Solved, &r.XP, &solvedAt); err != nil {
			return nil, err
		}
		r.SolvedAt = solvedAt
		out = append(out, r)
	}
	return out, rows.Err()
}

func (p *PostgresStore) MarkSolved(ctx context.Context, userID, exerciseID string, xp int) (Record, error) {
	// Award xp only on first solve; subsequent calls keep the original row.
	row := p.pool.QueryRow(ctx, `
		INSERT INTO progress (user_id, exercise_id, solved, xp, solved_at)
		VALUES ($1, $2, true, $3, now())
		ON CONFLICT (user_id, exercise_id) DO UPDATE
		  SET solved = true
		RETURNING user_id, exercise_id, solved, xp, solved_at`,
		userID, exerciseID, xp)

	var r Record
	var solvedAt *time.Time
	if err := row.Scan(&r.UserID, &r.ExerciseID, &r.Solved, &r.XP, &solvedAt); err != nil {
		return Record{}, err
	}
	r.SolvedAt = solvedAt
	return r, nil
}

func (p *PostgresStore) Close() error {
	p.pool.Close()
	return nil
}
