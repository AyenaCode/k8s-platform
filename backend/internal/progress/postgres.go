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

// NewPostgresStore opens a connection pool. Caller closes via Close().
func NewPostgresStore(ctx context.Context, databaseURL string) (*PostgresStore, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
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
